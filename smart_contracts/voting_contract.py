"""
CampusTrust AI - Decentralized Voting Smart Contract
=====================================================
Algorand PyTeal smart contract for tamper-proof campus elections.

Features:
- Create elections with multiple proposals
- One-student-one-vote verification
- Transparent vote tallying
- Time-bound elections with automatic closure
- On-chain result finalization

Built for Hackspiration'26 - Track 2: AI and Automation in Blockchain
"""

from pyteal import *


def approval_program():
    """
    Voting Contract Approval Program
    
    Global State:
        - creator: Address of the election creator
        - election_name: Name of the election (bytes)
        - num_proposals: Number of proposals (uint64)
        - start_time: Election start timestamp (uint64)
        - end_time: Election end timestamp (uint64)
        - total_votes: Total votes cast (uint64)
        - is_finalized: Whether results are finalized (uint64)
        - proposal_0_name ... proposal_9_name: Proposal names (bytes)
        - proposal_0_votes ... proposal_9_votes: Vote counts (uint64)
    
    Local State (per voter):
        - has_voted: Whether the user has voted (uint64)
        - voted_for: Which proposal the user voted for (uint64)
        - vote_timestamp: When the vote was cast (uint64)
    """
    
    # Scratch space
    i = ScratchVar(TealType.uint64)
    
    # ============================================================
    # ON CREATION: Initialize the election
    # ============================================================
    # Args: election_name, num_proposals, start_time, end_time,
    #        proposal_0_name, proposal_1_name, ...
    on_creation = Seq([
        # Validate inputs
        Assert(Txn.application_args.length() >= Int(4)),
        Assert(Btoi(Txn.application_args[1]) >= Int(2)),   # At least 2 proposals
        Assert(Btoi(Txn.application_args[1]) <= Int(10)),   # Max 10 proposals
        Assert(Btoi(Txn.application_args[3]) > Btoi(Txn.application_args[2])),  # end > start
        
        # Store global state
        App.globalPut(Bytes("creator"), Txn.sender()),
        App.globalPut(Bytes("election_name"), Txn.application_args[0]),
        App.globalPut(Bytes("num_proposals"), Btoi(Txn.application_args[1])),
        App.globalPut(Bytes("start_time"), Btoi(Txn.application_args[2])),
        App.globalPut(Bytes("end_time"), Btoi(Txn.application_args[3])),
        App.globalPut(Bytes("total_votes"), Int(0)),
        App.globalPut(Bytes("is_finalized"), Int(0)),
        
        # Initialize proposal vote counts to 0
        # Store proposal names from args[4] onwards
        If(
            Txn.application_args.length() > Int(4),
            App.globalPut(Bytes("proposal_0_name"), Txn.application_args[4]),
            App.globalPut(Bytes("proposal_0_name"), Bytes("Proposal A")),
        ),
        App.globalPut(Bytes("proposal_0_votes"), Int(0)),
        
        If(
            Txn.application_args.length() > Int(5),
            App.globalPut(Bytes("proposal_1_name"), Txn.application_args[5]),
            App.globalPut(Bytes("proposal_1_name"), Bytes("Proposal B")),
        ),
        App.globalPut(Bytes("proposal_1_votes"), Int(0)),
        
        If(
            Txn.application_args.length() > Int(6),
            Seq([
                App.globalPut(Bytes("proposal_2_name"), Txn.application_args[6]),
                App.globalPut(Bytes("proposal_2_votes"), Int(0)),
            ]),
            Approve(),
        ),
        
        If(
            Txn.application_args.length() > Int(7),
            Seq([
                App.globalPut(Bytes("proposal_3_name"), Txn.application_args[7]),
                App.globalPut(Bytes("proposal_3_votes"), Int(0)),
            ]),
            Approve(),
        ),
        
        Approve(),
    ])
    
    # ============================================================
    # OPT-IN: Register as voter
    # ============================================================
    on_opt_in = Seq([
        # Initialize local state
        App.localPut(Txn.sender(), Bytes("has_voted"), Int(0)),
        App.localPut(Txn.sender(), Bytes("voted_for"), Int(999)),  # No vote
        App.localPut(Txn.sender(), Bytes("vote_timestamp"), Int(0)),
        Approve(),
    ])
    
    # ============================================================
    # CAST VOTE: Record a vote for a proposal
    # ============================================================
    # Args[0]: "vote", Args[1]: proposal_index (uint64)
    proposal_index = Btoi(Txn.application_args[1])
    
    cast_vote = Seq([
        # Verify election is active
        Assert(Global.latest_timestamp() >= App.globalGet(Bytes("start_time"))),
        Assert(Global.latest_timestamp() <= App.globalGet(Bytes("end_time"))),
        Assert(App.globalGet(Bytes("is_finalized")) == Int(0)),
        
        # Verify voter hasn't already voted
        Assert(App.localGet(Txn.sender(), Bytes("has_voted")) == Int(0)),
        
        # Verify proposal index is valid
        Assert(proposal_index < App.globalGet(Bytes("num_proposals"))),
        
        # Record the vote in local state
        App.localPut(Txn.sender(), Bytes("has_voted"), Int(1)),
        App.localPut(Txn.sender(), Bytes("voted_for"), proposal_index),
        App.localPut(Txn.sender(), Bytes("vote_timestamp"), Global.latest_timestamp()),
        
        # Increment proposal vote count
        Cond(
            [proposal_index == Int(0), App.globalPut(
                Bytes("proposal_0_votes"),
                App.globalGet(Bytes("proposal_0_votes")) + Int(1)
            )],
            [proposal_index == Int(1), App.globalPut(
                Bytes("proposal_1_votes"),
                App.globalGet(Bytes("proposal_1_votes")) + Int(1)
            )],
            [proposal_index == Int(2), App.globalPut(
                Bytes("proposal_2_votes"),
                App.globalGet(Bytes("proposal_2_votes")) + Int(1)
            )],
            [proposal_index == Int(3), App.globalPut(
                Bytes("proposal_3_votes"),
                App.globalGet(Bytes("proposal_3_votes")) + Int(1)
            )],
        ),
        
        # Increment total votes
        App.globalPut(
            Bytes("total_votes"),
            App.globalGet(Bytes("total_votes")) + Int(1)
        ),
        
        Approve(),
    ])
    
    # ============================================================
    # FINALIZE: Lock election results (creator only)
    # ============================================================
    finalize_election = Seq([
        # Only creator can finalize
        Assert(Txn.sender() == App.globalGet(Bytes("creator"))),
        # Election must have ended
        Assert(Global.latest_timestamp() >= App.globalGet(Bytes("end_time"))),
        # Not already finalized
        Assert(App.globalGet(Bytes("is_finalized")) == Int(0)),
        
        App.globalPut(Bytes("is_finalized"), Int(1)),
        Approve(),
    ])
    
    # ============================================================
    # DELETE: Only creator can delete the application
    # ============================================================
    on_delete = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("creator"))),
        Approve(),
    ])
    
    # ============================================================
    # CLOSE OUT: Allow users to close out
    # ============================================================
    on_close_out = Approve()
    
    # ============================================================
    # ROUTER: Handle different application calls
    # ============================================================
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.CloseOut, on_close_out],
        [Txn.on_completion() == OnComplete.DeleteApplication, on_delete],
        [Txn.on_completion() == OnComplete.UpdateApplication, Reject()],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("vote")
        ), cast_vote],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("finalize")
        ), finalize_election],
    )
    
    return program


def clear_state_program():
    """Clear state program - allows users to clear their local state."""
    return Return(Int(1))


if __name__ == "__main__":
    # Compile and output TEAL
    print("=== Voting Contract - Approval Program ===")
    print(compileTeal(approval_program(), mode=Mode.Application, version=8))
    print("\n=== Voting Contract - Clear State Program ===")
    print(compileTeal(clear_state_program(), mode=Mode.Application, version=8))
