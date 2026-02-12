"""
CampusTrust AI - Contract Compiler
====================================
Compiles all PyTeal smart contracts to TEAL and saves them.
"""

import os
import json
from pyteal import compileTeal, Mode

from voting_contract import (
    approval_program as voting_approval,
    clear_state_program as voting_clear,
)
from credential_contract import (
    approval_program as credential_approval,
    clear_state_program as credential_clear,
)
from feedback_contract import (
    approval_program as feedback_approval,
    clear_state_program as feedback_clear,
)
from attendance_contract import (
    approval_program as attendance_approval,
    clear_state_program as attendance_clear,
)


OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "compiled_contracts")


def compile_and_save(name, approval_func, clear_func):
    """Compile a contract pair and save TEAL files."""
    approval_teal = compileTeal(
        approval_func(), mode=Mode.Application, version=8
    )
    clear_teal = compileTeal(
        clear_func(), mode=Mode.Application, version=8
    )

    with open(os.path.join(OUTPUT_DIR, f"{name}_approval.teal"), "w") as f:
        f.write(approval_teal)

    with open(os.path.join(OUTPUT_DIR, f"{name}_clear.teal"), "w") as f:
        f.write(clear_teal)

    print(f"  ✅ {name}: approval ({len(approval_teal)} bytes), clear ({len(clear_teal)} bytes)")
    return approval_teal, clear_teal


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("🔨 Compiling CampusTrust AI Smart Contracts...\n")

    contracts = {}

    # Compile all contracts
    for name, approval, clear in [
        ("voting", voting_approval, voting_clear),
        ("credential", credential_approval, credential_clear),
        ("feedback", feedback_approval, feedback_clear),
        ("attendance", attendance_approval, attendance_clear),
    ]:
        approval_teal, clear_teal = compile_and_save(name, approval, clear)
        contracts[name] = {
            "approval_size": len(approval_teal),
            "clear_size": len(clear_teal),
        }

    # Save compilation manifest
    manifest = {
        "project": "CampusTrust AI",
        "network": "Algorand TestNet",
        "teal_version": 8,
        "contracts": contracts,
    }

    with open(os.path.join(OUTPUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✅ All contracts compiled to: {OUTPUT_DIR}")
    print(f"📄 Manifest saved: {os.path.join(OUTPUT_DIR, 'manifest.json')}")


if __name__ == "__main__":
    main()
