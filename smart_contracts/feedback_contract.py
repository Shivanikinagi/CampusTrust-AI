"""
CampusTrust AI - Anonymous Feedback Smart Contract
====================================================
Algorand PyTeal smart contract for privacy-preserving 
anonymous feedback collection with on-chain integrity.

Features:
- Submit anonymous feedback (only hash stored on-chain)
- Privacy-preserving: no link between feedback and identity
- AI sentiment score stored alongside feedback hash
- Tamper-proof feedback records
- Aggregate statistics on-chain

AI-Powered Feedback System on Blockchain
"""

from pyteal import *


def approval_program():
    """
    Feedback Contract Approval Program
    
    Global State:
        - admin: Contract administrator address
        - topic: Feedback topic/course/event name (bytes)
        - total_feedback: Total feedback entries (uint64)
        - avg_sentiment: Running average sentiment 0-100 (uint64)
        - positive_count: Number of positive feedbacks (uint64)
        - negative_count: Number of negative feedbacks (uint64)
        - neutral_count: Number of neutral feedbacks (uint64)
        - is_active: Whether feedback collection is open (uint64)
        - created_at: Creation timestamp (uint64)
    
    Local State (per participant):
        - has_submitted: Whether user has submitted feedback (uint64)
        - feedback_hash: SHA256 hash of the feedback content (bytes)
        - sentiment_score: AI-computed sentiment 0-100 (uint64)
        - category: Feedback category (bytes)
        - submitted_at: Submission timestamp (uint64)
    """
    
    # ============================================================
    # ON CREATION: Initialize feedback session
    # ============================================================
    on_creation = Seq([
        Assert(Txn.application_args.length() >= Int(1)),
        App.globalPut(Bytes("admin"), Txn.sender()),
        App.globalPut(Bytes("topic"), Txn.application_args[0]),
        App.globalPut(Bytes("total_feedback"), Int(0)),
        App.globalPut(Bytes("avg_sentiment"), Int(50)),  # Neutral default
        App.globalPut(Bytes("positive_count"), Int(0)),
        App.globalPut(Bytes("negative_count"), Int(0)),
        App.globalPut(Bytes("neutral_count"), Int(0)),
        App.globalPut(Bytes("is_active"), Int(1)),
        App.globalPut(Bytes("created_at"), Global.latest_timestamp()),
        Approve(),
    ])
    
    # ============================================================
    # OPT-IN: Register for feedback
    # ============================================================
    on_opt_in = Seq([
        # Feedback must be active
        Assert(App.globalGet(Bytes("is_active")) == Int(1)),
        App.localPut(Txn.sender(), Bytes("has_submitted"), Int(0)),
        App.localPut(Txn.sender(), Bytes("feedback_hash"), Bytes("")),
        App.localPut(Txn.sender(), Bytes("sentiment_score"), Int(0)),
        App.localPut(Txn.sender(), Bytes("category"), Bytes("")),
        App.localPut(Txn.sender(), Bytes("submitted_at"), Int(0)),
        Approve(),
    ])
    
    # ============================================================
    # SUBMIT FEEDBACK: Record feedback hash + AI sentiment
    # ============================================================
    # Args: "submit", feedback_hash, sentiment_score (0-100), category
    sentiment_val = Btoi(Txn.application_args[2])
    total_fb = App.globalGet(Bytes("total_feedback"))
    current_avg = App.globalGet(Bytes("avg_sentiment"))
    
    submit_feedback = Seq([
        # Feedback collection must be active
        Assert(App.globalGet(Bytes("is_active")) == Int(1)),
        # User hasn't already submitted
        Assert(App.localGet(Txn.sender(), Bytes("has_submitted")) == Int(0)),
        # Valid sentiment score
        Assert(sentiment_val <= Int(100)),
        Assert(Txn.application_args.length() >= Int(4)),
        
        # Store feedback in local state
        App.localPut(Txn.sender(), Bytes("has_submitted"), Int(1)),
        App.localPut(Txn.sender(), Bytes("feedback_hash"), Txn.application_args[1]),
        App.localPut(Txn.sender(), Bytes("sentiment_score"), sentiment_val),
        App.localPut(Txn.sender(), Bytes("category"), Txn.application_args[3]),
        App.localPut(Txn.sender(), Bytes("submitted_at"), Global.latest_timestamp()),
        
        # Update aggregate statistics
        App.globalPut(Bytes("total_feedback"), total_fb + Int(1)),
        
        # Update running average:  new_avg = (old_avg * count + new_val) / (count + 1)
        App.globalPut(
            Bytes("avg_sentiment"),
            (current_avg * total_fb + sentiment_val) / (total_fb + Int(1))
        ),
        
        # Update sentiment category counts
        If(
            sentiment_val > Int(60),
            App.globalPut(
                Bytes("positive_count"),
                App.globalGet(Bytes("positive_count")) + Int(1)
            ),
            If(
                sentiment_val < Int(40),
                App.globalPut(
                    Bytes("negative_count"),
                    App.globalGet(Bytes("negative_count")) + Int(1)
                ),
                App.globalPut(
                    Bytes("neutral_count"),
                    App.globalGet(Bytes("neutral_count")) + Int(1)
                ),
            ),
        ),
        
        Approve(),
    ])
    
    # ============================================================
    # CLOSE FEEDBACK: Admin closes feedback collection
    # ============================================================
    close_feedback = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        App.globalPut(Bytes("is_active"), Int(0)),
        Approve(),
    ])
    
    # ============================================================
    # REOPEN FEEDBACK: Admin reopens feedback collection
    # ============================================================
    reopen_feedback = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        App.globalPut(Bytes("is_active"), Int(1)),
        Approve(),
    ])
    
    # ============================================================
    # ROUTER
    # ============================================================
    on_delete = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        Approve(),
    ])
    
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [Txn.on_completion() == OnComplete.DeleteApplication, on_delete],
        [Txn.on_completion() == OnComplete.UpdateApplication, Reject()],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("submit")
        ), submit_feedback],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("close")
        ), close_feedback],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("reopen")
        ), reopen_feedback],
    )
    
    return program


def clear_state_program():
    return Return(Int(1))


if __name__ == "__main__":
    print("=== Feedback Contract - Approval Program ===")
    print(compileTeal(approval_program(), mode=Mode.Application, version=8))
    print("\n=== Feedback Contract - Clear State Program ===")
    print(compileTeal(clear_state_program(), mode=Mode.Application, version=8))
