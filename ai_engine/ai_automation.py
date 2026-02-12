"""
CampusTrust AI - Smart Automation Engine
==========================================
Automates campus governance workflows using AI triggers
and Algorand smart contract interactions.

Features:
- Auto-finalize elections when voting period ends
- Auto-close feedback after threshold reached
- Attendance anomaly auto-flagging
- Credential auto-scoring with AI
- Event-driven workflow automation
"""

import time
import json
import hashlib


class AutomationEngine:
    """Smart automation engine for campus governance workflows."""

    def __init__(self):
        self.rules = []
        self.execution_log = []

    def add_rule(self, rule):
        """
        Add an automation rule.
        
        Rule format:
        {
            "name": "rule_name",
            "trigger": "time|threshold|event",
            "condition": callable or dict,
            "action": callable or dict,
            "enabled": True/False
        }
        """
        rule.setdefault("enabled", True)
        rule.setdefault("last_executed", None)
        self.rules.append(rule)
        return len(self.rules) - 1

    def evaluate_rules(self, context):
        """Evaluate all rules against current context and return triggered actions."""
        triggered = []

        for i, rule in enumerate(self.rules):
            if not rule["enabled"]:
                continue

            should_trigger = False
            trigger_type = rule.get("trigger", "event")

            if trigger_type == "time":
                # Time-based trigger
                target_time = rule.get("condition", {}).get("timestamp", 0)
                should_trigger = context.get("current_time", time.time()) >= target_time

            elif trigger_type == "threshold":
                # Threshold-based trigger
                field = rule.get("condition", {}).get("field", "")
                threshold = rule.get("condition", {}).get("value", 0)
                operator = rule.get("condition", {}).get("operator", ">=")
                current_val = context.get(field, 0)

                if operator == ">=":
                    should_trigger = current_val >= threshold
                elif operator == "<=":
                    should_trigger = current_val <= threshold
                elif operator == "==":
                    should_trigger = current_val == threshold
                elif operator == ">":
                    should_trigger = current_val > threshold

            elif trigger_type == "event":
                # Event-based trigger
                event_name = rule.get("condition", {}).get("event", "")
                should_trigger = event_name in context.get("events", [])

            if should_trigger:
                action = {
                    "rule_index": i,
                    "rule_name": rule["name"],
                    "action": rule["action"],
                    "triggered_at": time.time(),
                }
                triggered.append(action)
                rule["last_executed"] = time.time()

                self.execution_log.append({
                    "rule": rule["name"],
                    "timestamp": time.time(),
                    "context_snapshot": {k: v for k, v in context.items() if k != "events"},
                })

        return triggered

    def get_execution_log(self, limit=50):
        """Get recent automation execution log."""
        return self.execution_log[-limit:]

    def get_rules_status(self):
        """Get status of all automation rules."""
        return [
            {
                "name": r["name"],
                "trigger": r["trigger"],
                "enabled": r["enabled"],
                "last_executed": r.get("last_executed"),
            }
            for r in self.rules
        ]


class CampusAutomation:
    """Pre-built campus governance automation workflows."""

    def __init__(self):
        self.engine = AutomationEngine()
        self._setup_default_rules()

    def _setup_default_rules(self):
        """Setup default campus governance automation rules."""

        # Rule 1: Auto-finalize election when time expires
        self.engine.add_rule({
            "name": "auto_finalize_election",
            "description": "Automatically finalize election results when voting period ends",
            "trigger": "event",
            "condition": {"event": "election_time_expired"},
            "action": {
                "type": "contract_call",
                "contract": "voting",
                "method": "finalize",
                "description": "Finalize election and lock results on-chain",
            },
        })

        # Rule 2: Auto-close feedback when minimum responses reached
        self.engine.add_rule({
            "name": "auto_close_feedback_threshold",
            "description": "Close feedback collection when target responses reached",
            "trigger": "threshold",
            "condition": {
                "field": "feedback_count",
                "value": 50,
                "operator": ">=",
            },
            "action": {
                "type": "contract_call",
                "contract": "feedback",
                "method": "close",
                "description": "Close feedback collection after 50 responses",
            },
        })

        # Rule 3: Flag anomaly when AI risk score is high
        self.engine.add_rule({
            "name": "auto_flag_attendance_anomaly",
            "description": "Automatically flag students with high anomaly risk scores",
            "trigger": "threshold",
            "condition": {
                "field": "anomaly_risk_score",
                "value": 70,
                "operator": ">=",
            },
            "action": {
                "type": "contract_call",
                "contract": "attendance",
                "method": "flag_anomaly",
                "description": "Flag student attendance as anomalous on-chain",
            },
        })

        # Rule 4: Auto-issue certificate when course completion confirmed
        self.engine.add_rule({
            "name": "auto_issue_credential",
            "description": "Issue blockchain credential when student completes course",
            "trigger": "event",
            "condition": {"event": "course_completed"},
            "action": {
                "type": "contract_call",
                "contract": "credential",
                "method": "issue",
                "description": "Issue verifiable credential as Algorand on-chain record",
            },
        })

        # Rule 5: AI sentiment alert when feedback turns negative
        self.engine.add_rule({
            "name": "negative_sentiment_alert",
            "description": "Alert when average feedback sentiment drops below threshold",
            "trigger": "threshold",
            "condition": {
                "field": "avg_sentiment",
                "value": 35,
                "operator": "<=",
            },
            "action": {
                "type": "notification",
                "message": "⚠️ Feedback sentiment has dropped below 35%. Review recommended.",
                "description": "Send alert about declining feedback quality",
            },
        })

        # Rule 6: Auto end attendance session
        self.engine.add_rule({
            "name": "auto_end_session",
            "description": "Automatically end attendance session when time expires",
            "trigger": "event",
            "condition": {"event": "session_time_expired"},
            "action": {
                "type": "contract_call",
                "contract": "attendance",
                "method": "end_session",
                "description": "End current attendance session on-chain",
            },
        })

    def process_voting_events(self, election_data):
        """Process voting system events for automation."""
        context = {
            "current_time": time.time(),
            "events": [],
            **election_data,
        }

        if election_data.get("end_time", 0) <= time.time():
            context["events"].append("election_time_expired")

        return self.engine.evaluate_rules(context)

    def process_feedback_events(self, feedback_data):
        """Process feedback system events for automation."""
        context = {
            "current_time": time.time(),
            "events": [],
            "feedback_count": feedback_data.get("total_feedback", 0),
            "avg_sentiment": feedback_data.get("avg_sentiment", 50),
        }

        return self.engine.evaluate_rules(context)

    def process_attendance_events(self, attendance_data):
        """Process attendance system events for automation."""
        context = {
            "current_time": time.time(),
            "events": [],
            "anomaly_risk_score": attendance_data.get("risk_score", 0),
        }

        if attendance_data.get("session_end", 0) <= time.time():
            context["events"].append("session_time_expired")

        return self.engine.evaluate_rules(context)

    def process_credential_events(self, credential_data):
        """Process credential system events for automation."""
        context = {
            "current_time": time.time(),
            "events": [],
        }

        if credential_data.get("course_completed", False):
            context["events"].append("course_completed")

        return self.engine.evaluate_rules(context)

    def get_dashboard_data(self):
        """Get automation dashboard data."""
        return {
            "rules": self.engine.get_rules_status(),
            "recent_executions": self.engine.get_execution_log(20),
            "total_rules": len(self.engine.rules),
            "active_rules": sum(1 for r in self.engine.rules if r["enabled"]),
        }


def generate_hash(data):
    """Generate SHA256 hash for on-chain storage."""
    if isinstance(data, dict):
        data = json.dumps(data, sort_keys=True)
    return hashlib.sha256(data.encode()).hexdigest()


if __name__ == "__main__":
    print("🤖 CampusTrust AI - Automation Engine Demo\n")

    automation = CampusAutomation()

    # Simulate feedback reaching threshold
    feedback_result = automation.process_feedback_events({
        "total_feedback": 55,
        "avg_sentiment": 30,
    })

    print(f"📊 Feedback Automation: {len(feedback_result)} actions triggered")
    for action in feedback_result:
        print(f"   → {action['rule_name']}: {action['action']['description']}")

    # Dashboard
    dashboard = automation.get_dashboard_data()
    print(f"\n📋 Dashboard: {dashboard['active_rules']}/{dashboard['total_rules']} rules active")
    for rule in dashboard["rules"]:
        print(f"   {'✅' if rule['enabled'] else '❌'} {rule['name']} ({rule['trigger']})")
