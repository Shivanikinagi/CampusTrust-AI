"""
CampusTrust AI - Attendance Tracking Smart Contract
=====================================================
Algorand PyTeal smart contract for blockchain-verified
attendance tracking with AI anomaly detection integration.

Features:
- Record attendance on-chain (tamper-proof)
- Session-based attendance management
- AI anomaly flag stored on-chain
- Aggregate attendance statistics
- Time-bound check-in windows

Automated Attendance Tracking on Blockchain
"""

from pyteal import *


def approval_program():
    """
    Attendance Contract Approval Program
    
    Global State:
        - admin: Course instructor/admin address
        - course_name: Name of the course/event (bytes)
        - session_id: Current session identifier (uint64)
        - session_active: Whether a session is currently open (uint64)
        - session_start: Current session start time (uint64)
        - session_end: Current session end time (uint64)
        - total_sessions: Total sessions recorded (uint64)
        - total_checkins: Total check-ins across all sessions (uint64)
    
    Local State (per student):
        - sessions_attended: Number of sessions attended (uint64)
        - last_checkin: Timestamp of last check-in (uint64)
        - last_session_id: Last session the student checked in (uint64)
        - anomaly_flag: AI-detected anomaly flag 0/1 (uint64)
        - streak: Consecutive attendance streak (uint64)
        - face_descriptor_hash: SHA256 hash of face descriptor stored as bytes
    """
    
    # ============================================================
    # ON CREATION: Initialize attendance system
    # ============================================================
    on_creation = Seq([
        Assert(Txn.application_args.length() >= Int(1)),
        App.globalPut(Bytes("admin"), Txn.sender()),
        App.globalPut(Bytes("course_name"), Txn.application_args[0]),
        App.globalPut(Bytes("session_id"), Int(0)),
        App.globalPut(Bytes("session_active"), Int(0)),
        App.globalPut(Bytes("session_start"), Int(0)),
        App.globalPut(Bytes("session_end"), Int(0)),
        App.globalPut(Bytes("total_sessions"), Int(0)),
        App.globalPut(Bytes("total_checkins"), Int(0)),
        Approve(),
    ])
    
    # ============================================================
    # OPT-IN: Register student
    # ============================================================
    on_opt_in = Seq([
        App.localPut(Txn.sender(), Bytes("sessions_attended"), Int(0)),
        App.localPut(Txn.sender(), Bytes("last_checkin"), Int(0)),
        App.localPut(Txn.sender(), Bytes("last_session_id"), Int(0)),
        App.localPut(Txn.sender(), Bytes("anomaly_flag"), Int(0)),
        App.localPut(Txn.sender(), Bytes("streak"), Int(0)),
        App.localPut(Txn.sender(), Bytes("face_descriptor_hash"), Bytes("")),
        Approve(),
    ])
    
    # ============================================================
    # START SESSION: Admin opens a new attendance session
    # ============================================================
    # Args: "start_session", duration_seconds
    start_session = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        Assert(App.globalGet(Bytes("session_active")) == Int(0)),
        Assert(Txn.application_args.length() >= Int(2)),
        
        App.globalPut(
            Bytes("session_id"),
            App.globalGet(Bytes("session_id")) + Int(1)
        ),
        App.globalPut(Bytes("session_active"), Int(1)),
        App.globalPut(Bytes("session_start"), Global.latest_timestamp()),
        App.globalPut(
            Bytes("session_end"),
            Global.latest_timestamp() + Btoi(Txn.application_args[1])
        ),
        App.globalPut(
            Bytes("total_sessions"),
            App.globalGet(Bytes("total_sessions")) + Int(1)
        ),
        
        Approve(),
    ])
    
    # ============================================================
    # CHECK IN: Student marks attendance
    # ============================================================
    current_session = App.globalGet(Bytes("session_id"))
    last_session = App.localGet(Txn.sender(), Bytes("last_session_id"))
    
    check_in = Seq([
        # Session must be active
        Assert(App.globalGet(Bytes("session_active")) == Int(1)),
        # Within session time window
        Assert(Global.latest_timestamp() >= App.globalGet(Bytes("session_start"))),
        Assert(Global.latest_timestamp() <= App.globalGet(Bytes("session_end"))),
        # Student hasn't checked in for this session
        Assert(last_session != current_session),
        
        # Record check-in
        App.localPut(Txn.sender(), Bytes("last_checkin"), Global.latest_timestamp()),
        App.localPut(Txn.sender(), Bytes("last_session_id"), current_session),
        App.localPut(
            Txn.sender(),
            Bytes("sessions_attended"),
            App.localGet(Txn.sender(), Bytes("sessions_attended")) + Int(1)
        ),
        
        # Update streak: if attended previous session, increment; else reset to 1
        If(
            last_session == current_session - Int(1),
            App.localPut(
                Txn.sender(),
                Bytes("streak"),
                App.localGet(Txn.sender(), Bytes("streak")) + Int(1)
            ),
            App.localPut(Txn.sender(), Bytes("streak"), Int(1)),
        ),
        
        # Increment global check-in counter
        App.globalPut(
            Bytes("total_checkins"),
            App.globalGet(Bytes("total_checkins")) + Int(1)
        ),
        
        Approve(),
    ])
    
    # ============================================================
    # END SESSION: Admin closes the current session
    # ============================================================
    end_session = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        Assert(App.globalGet(Bytes("session_active")) == Int(1)),
        App.globalPut(Bytes("session_active"), Int(0)),
        Approve(),
    ])
    
    # ============================================================
    # REGISTER FACE DESCRIPTOR: Student registers their face descriptor
    # ============================================================
    # Args: "register_face", face_descriptor_hash (bytes)
    register_face = Seq([
        # Verify face descriptor hash is provided
        Assert(Txn.application_args.length() >= Int(2)),
        
        # Store the face descriptor hash in local state
        App.localPut(
            Txn.sender(), 
            Bytes("face_descriptor_hash"), 
            Txn.application_args[1]
        ),
        Approve(),
    ])
    
    # ============================================================
    # FLAG ANOMALY: Admin flags suspicious attendance (AI-driven)
    # ============================================================
    # Args: "flag_anomaly", flag_value (0 or 1)
    # Accounts[1]: student address
    flag_student = Txn.accounts[1]
    
    flag_anomaly = Seq([
        Assert(Txn.sender() == App.globalGet(Bytes("admin"))),
        Assert(Btoi(Txn.application_args[1]) <= Int(1)),
        App.localPut(flag_student, Bytes("anomaly_flag"), Btoi(Txn.application_args[1])),
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
            Txn.application_args[0] == Bytes("start_session")
        ), start_session],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("checkin")
        ), check_in],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("end_session")
        ), end_session],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("register_face")
        ), register_face],
        [And(
            Txn.on_completion() == OnComplete.NoOp,
            Txn.application_args[0] == Bytes("flag_anomaly")
        ), flag_anomaly],
    )
    
    return program


def clear_state_program():
    return Return(Int(1))


if __name__ == "__main__":
    print("=== Attendance Contract - Approval Program ===")
    print(compileTeal(approval_program(), mode=Mode.Application, version=8))
    print("\n=== Attendance Contract - Clear State Program ===")
    print(compileTeal(clear_state_program(), mode=Mode.Application, version=8))
