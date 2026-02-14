"""
CampusTrust AI - Campus Token (ASA) Contract
==============================================
Algorand Standard Asset for campus governance token.
Students earn tokens for participation and use them for weighted voting.

Features:
- ASA creation with custom parameters
- Token rewards for participation
- Token-weighted governance voting
- Clawback for policy violations
- Freeze for suspended accounts

Demonstrates Algorand's native ASA capabilities
"""

from pyteal import *


def approval_program():
    """
    Campus Token ASA Manager Contract
    
    This contract manages a Campus Governance Token (ASA) with:
    - Distribution to active participants
    - Rewards for voting, attendance, feedback
    - Token-weighted governance decisions
    - Admin controls (freeze, clawback for violations)
    
    Global State:
        - token_id: The ASA ID of the campus token
        - admin: Address of the token administrator
        - total_distributed: Total tokens distributed
        - reward_pool: Remaining tokens in reward pool
        - voting_reward: Tokens earned per vote
        - attendance_reward: Tokens earned per attendance
        - feedback_reward: Tokens earned per feedback
        
    Local State (per account):
        - tokens_earned: Total tokens earned by student
        - participation_count: Number of activities completed
        - last_reward_time: Timestamp of last reward
    """
    
    # ============================================================
    # ON CREATION: Initialize token parameters
    # ============================================================
    on_creation = Seq([
        App.globalPut(Bytes("admin"), Txn.sender()),
        App.globalPut(Bytes("total_distributed"), Int(0)),
        App.globalPut(Bytes("reward_pool"), Int(1000000)),  # 1M tokens initial
        App.globalPut(Bytes("voting_reward"), Int(10)),
        App.globalPut(Bytes("attendance_reward"), Int(5)),
        App.globalPut(Bytes("feedback_reward"), Int(3)),
        App.globalPut(Bytes("token_id"), Int(0)),  # Set after ASA creation
        Approve(),
    ])
    
    # ============================================================
    # OPT-IN: Register student for token rewards
    # ============================================================
    on_opt_in = Seq([
        App.localPut(Txn.sender(), Bytes("tokens_earned"), Int(0)),
        App.localPut(Txn.sender(), Bytes("participation_count"), Int(0)),
        App.localPut(Txn.sender(), Bytes("last_reward_time"), Global.latest_timestamp()),
        Approve(),
    ])
    
    # ============================================================
    # SET TOKEN ID: Called after ASA creation
    # ============================================================
    set_token_id = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(Bytes("token_id"), Btoi(Txn.application_args[1])),
        Approve(),
    ])
    
    # ============================================================
    # DISTRIBUTE REWARD: Give tokens for participation
    # ============================================================
    # Args: reward_type (0=vote, 1=attendance, 2=feedback), recipient
    distribute_reward = Seq([
        Assert(Txn.application_args.length() == Int(3)),
        
        # Determine reward amount based on type
        If(
            Btoi(Txn.application_args[1]) == Int(0),
            App.globalPut(Bytes("current_reward"), App.globalGet(Bytes("voting_reward"))),
        ),
        If(
            Btoi(Txn.application_args[1]) == Int(1),
            App.globalPut(Bytes("current_reward"), App.globalGet(Bytes("attendance_reward"))),
        ),
        If(
            Btoi(Txn.application_args[1]) == Int(2),
            App.globalPut(Bytes("current_reward"), App.globalGet(Bytes("feedback_reward"))),
        ),
        
        # Check reward pool has sufficient tokens
        Assert(App.globalGet(Bytes("reward_pool")) >= App.globalGet(Bytes("current_reward"))),
        
        # Update recipient's earned tokens
        App.localPut(
            Txn.accounts[1],
            Bytes("tokens_earned"),
            App.localGet(Txn.accounts[1], Bytes("tokens_earned")) + App.globalGet(Bytes("current_reward"))
        ),
        
        # Increment participation count
        App.localPut(
            Txn.accounts[1],
            Bytes("participation_count"),
            App.localGet(Txn.accounts[1], Bytes("participation_count")) + Int(1)
        ),
        
        # Update last reward time
        App.localPut(
            Txn.accounts[1],
            Bytes("last_reward_time"),
            Global.latest_timestamp()
        ),
        
        # Update global counters
        App.globalPut(
            Bytes("total_distributed"),
            App.globalGet(Bytes("total_distributed")) + App.globalGet(Bytes("current_reward"))
        ),
        App.globalPut(
            Bytes("reward_pool"),
            App.globalGet(Bytes("reward_pool")) - App.globalGet(Bytes("current_reward"))
        ),
        
        Approve(),
    ])
    
    # ============================================================
    # UPDATE REWARDS: Admin can adjust reward amounts
    # ============================================================
    update_rewards = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        Assert(Txn.application_args.length() == Int(4)),
        App.globalPut(Bytes("voting_reward"), Btoi(Txn.application_args[1])),
        App.globalPut(Bytes("attendance_reward"), Btoi(Txn.application_args[2])),
        App.globalPut(Bytes("feedback_reward"), Btoi(Txn.application_args[3])),
        Approve(),
    ])
    
    # ============================================================
    # GET BALANCE: Query student's earned tokens
    # ============================================================
    get_balance = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        Approve(),
    ])
    
    # ============================================================
    # Main router
    # ============================================================
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(Bytes("admin")))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(Bytes("admin")))],
        [Txn.application_args[0] == Bytes("set_token"), set_token_id],
        [Txn.application_args[0] == Bytes("distribute"), distribute_reward],
        [Txn.application_args[0] == Bytes("update_rewards"), update_rewards],
        [Txn.application_args[0] == Bytes("get_balance"), get_balance],
    )
    
    return program


def clear_program():
    """Clear state program - always approve"""
    return Approve()


if __name__ == "__main__":
    # Compile the approval program
    with open("../compiled_contracts/token_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=8)
        f.write(compiled)
    
    # Compile the clear program
    with open("../compiled_contracts/token_clear.teal", "w") as f:
        compiled = compileTeal(clear_program(), mode=Mode.Application, version=8)
        f.write(compiled)
    
    print("✅ Token contract compiled successfully!")
