"""
CampusTrust AI - Verifiable Credentials Smart Contract
=======================================================
Algorand PyTeal smart contract for issuing and verifying
academic credentials/certificates as on-chain records.

Features:
- Issue verifiable credentials (certificates, diplomas, awards)
- On-chain credential registry with metadata
- Credential verification by anyone
- Revocation support for issuers
- AI-verified credential authenticity score stored on-chain

Built for Hackspiration'26 - Track 2: AI and Automation in Blockchain
"""

from pyteal import *


def approval_program():
    """
    Credential Contract Approval Program
    
    Global State:
        - admin: Address of the credential authority
        - institution_name: Name of the issuing institution (bytes)
        - total_issued: Total credentials issued (uint64)
        - total_revoked: Total credentials revoked (uint64)
    
    Local State (per credential holder):
        - credential_hash: Hash of the credential data (bytes)
        - credential_type: Type (certificate, diploma, etc.) (bytes)
        - issue_date: Timestamp of issuance (uint64)
        - is_valid: Whether credential is still valid (uint64)
        - ai_score: AI verification confidence score 0-100 (uint64)
        - issuer: Address of the specific issuer (bytes)
    """
    
    # ============================================================
    # ON CREATION: Initialize credential authority
    # ============================================================
    on_creation = Seq([
        Assert(Txn.application_args.length() >= Int(1)),
        App.globalPut(Bytes("admin"), Txn.sender()),
        App.globalPut(Bytes("institution_name"), Txn.application_args[0]),
        App.globalPut(Bytes("total_issued"), Int(0)),
        App.globalPut(Bytes("total_revoked"), Int(0)),
        Approve(),
    ])
    
    # ============================================================
    # OPT-IN: Register as credential holder
    # ============================================================
    on_opt_in = Seq([
        App.localPut(Txn.sender(), Bytes("credential_hash"), Bytes("")),
        App.localPut(Txn.sender(), Bytes("credential_type"), Bytes("")),
        App.localPut(Txn.sender(), Bytes("issue_date"), Int(0)),
        App.localPut(Txn.sender(), Bytes("is_valid"), Int(0)),
        App.localPut(Txn.sender(), Bytes("ai_score"), Int(0)),
        App.localPut(Txn.sender(), Bytes("issuer"), Bytes("")),
        Approve(),
    ])
    
    # ============================================================
    # ISSUE CREDENTIAL: Admin issues a credential to a student
    # ============================================================
    # Args: "issue", credential_hash, credential_type, ai_score
    # Accounts[1]: receiver address
    receiver = Txn.accounts[1]
    
    issue_credential = Seq([
        # Only admin can issue
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        Assert(Txn.application_args.length() >= Int(4)),
        
        # Store credential data in receiver's local state
        App.localPut(receiver, Bytes("credential_hash"), Txn.application_args[1]),
        App.localPut(receiver, Bytes("credential_type"), Txn.application_args[2]),
        App.localPut(receiver, Bytes("issue_date"), Global.latest_timestamp()),
        App.localPut(receiver, Bytes("is_valid"), Int(1)),
        App.localPut(receiver, Bytes("ai_score"), Btoi(Txn.application_args[3])),
        App.localPut(receiver, Bytes("issuer"), Txn.sender()),
        
        # Update global counter
        App.globalPut(
            Bytes("total_issued"),
            App.globalGet(Bytes("total_issued")) + Int(1)
        ),
        
        Approve(),
    ])
    
    # ============================================================
    # REVOKE CREDENTIAL: Admin revokes a credential
    # ============================================================
    # Args: "revoke"
    # Accounts[1]: holder address
    revoke_holder = Txn.accounts[1]
    
    revoke_credential = Seq([
        # Only admin can revoke
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        # Credential must be currently valid
        Assert(App.localGet(revoke_holder, Bytes("is_valid")) == Int(1)),
        
        App.localPut(revoke_holder, Bytes("is_valid"), Int(0)),
        
        App.globalPut(
            Bytes("total_revoked"),
            App.globalGet(Bytes("total_revoked")) + Int(1)
        ),
        
        Approve(),
    ])
    
    # ============================================================
    # UPDATE AI SCORE: Update the AI verification score
    # ============================================================
    # Args: "update_score", new_score
    # Accounts[1]: holder address
    score_holder = Txn.accounts[1]
    
    update_ai_score = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        Assert(Btoi(Txn.application_args[1]) <= Int(100)),
        
        App.localPut(score_holder, Bytes("ai_score"), Btoi(Txn.application_args[1])),
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
            Txn.application_args[0] == Bytes("issue")
        ), issue_credential],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("revoke")
        ), revoke_credential],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("update_score")
        ), update_ai_score],
    )
    
    return program


def clear_state_program():
    return Return(Int(1))


if __name__ == "__main__":
    print("=== Credential Contract - Approval Program ===")
    print(compileTeal(approval_program(), mode=Mode.Application, version=8))
    print("\n=== Credential Contract - Clear State Program ===")
    print(compileTeal(clear_state_program(), mode=Mode.Application, version=8))
