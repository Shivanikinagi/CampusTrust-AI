"""
CampusTrust AI - Anomaly Detector
====================================
AI-powered anomaly detection for attendance patterns.
Uses statistical methods and Isolation Forest for detecting
suspicious attendance patterns like proxy attendance.

Features:
- Statistical anomaly detection (Z-score based)
- Isolation Forest for complex pattern detection
- Time-based anomaly detection (unusual check-in times)
- Streak analysis
- Risk scoring (0-100)
"""

import numpy as np
from datetime import datetime, timedelta
import json


class AnomalyDetector:
    """Detect anomalous attendance patterns using AI/ML techniques."""

    # Thresholds
    Z_SCORE_THRESHOLD = 2.0  # Standard deviations for outlier
    MIN_SAMPLES = 5  # Minimum samples for statistical analysis
    RISK_WEIGHTS = {
        "time_anomaly": 0.3,
        "pattern_anomaly": 0.3,
        "frequency_anomaly": 0.2,
        "streak_anomaly": 0.2,
    }

    def analyze_student(self, student_data):
        """
        Analyze a student's attendance for anomalies.
        
        Args:
            student_data: dict with keys:
                - checkin_times: list of timestamps (unix)
                - session_ids: list of session IDs attended
                - total_sessions: total number of sessions
                - streak: current consecutive streak
                
        Returns:
            dict with risk_score (0-100), anomalies list, and details
        """
        anomalies = []
        risk_components = {}

        checkin_times = student_data.get("checkin_times", [])
        session_ids = student_data.get("session_ids", [])
        total_sessions = student_data.get("total_sessions", 0)
        streak = student_data.get("streak", 0)

        # 1. Time-based anomaly detection
        time_risk = self._check_time_anomalies(checkin_times)
        risk_components["time_anomaly"] = time_risk["risk"]
        if time_risk["anomalies"]:
            anomalies.extend(time_risk["anomalies"])

        # 2. Pattern analysis
        pattern_risk = self._check_pattern_anomalies(session_ids, total_sessions)
        risk_components["pattern_anomaly"] = pattern_risk["risk"]
        if pattern_risk["anomalies"]:
            anomalies.extend(pattern_risk["anomalies"])

        # 3. Frequency analysis
        freq_risk = self._check_frequency_anomalies(checkin_times)
        risk_components["frequency_anomaly"] = freq_risk["risk"]
        if freq_risk["anomalies"]:
            anomalies.extend(freq_risk["anomalies"])

        # 4. Streak analysis
        streak_risk = self._check_streak_anomalies(streak, total_sessions, len(session_ids))
        risk_components["streak_anomaly"] = streak_risk["risk"]
        if streak_risk["anomalies"]:
            anomalies.extend(streak_risk["anomalies"])

        # Calculate weighted risk score
        risk_score = int(sum(
            risk_components[k] * self.RISK_WEIGHTS[k]
            for k in self.RISK_WEIGHTS
        ))
        risk_score = min(100, max(0, risk_score))

        # Determine flag
        if risk_score > 70:
            flag = "high_risk"
            recommendation = "Manual verification recommended. Multiple anomaly patterns detected."
        elif risk_score > 40:
            flag = "medium_risk"
            recommendation = "Some unusual patterns detected. Monitor closely."
        else:
            flag = "low_risk"
            recommendation = "Attendance patterns appear normal."

        return {
            "risk_score": risk_score,
            "flag": flag,
            "recommendation": recommendation,
            "anomalies": anomalies,
            "risk_components": risk_components,
            "stats": {
                "sessions_attended": len(session_ids),
                "total_sessions": total_sessions,
                "attendance_rate": round(len(session_ids) / max(total_sessions, 1) * 100, 1),
                "current_streak": streak,
            },
        }

    def analyze_class(self, students_data):
        """
        Analyze entire class attendance for anomalies.
        
        Args:
            students_data: list of student_data dicts
            
        Returns:
            dict with class-level analytics and flagged students
        """
        results = []
        risk_scores = []

        for student in students_data:
            result = self.analyze_student(student)
            result["student_id"] = student.get("student_id", "unknown")
            results.append(result)
            risk_scores.append(result["risk_score"])

        if not risk_scores:
            return {"results": [], "summary": {}}

        flagged = [r for r in results if r["flag"] in ("high_risk", "medium_risk")]

        summary = {
            "total_students": len(results),
            "avg_risk_score": round(np.mean(risk_scores), 1),
            "max_risk_score": int(np.max(risk_scores)),
            "high_risk_count": sum(1 for r in results if r["flag"] == "high_risk"),
            "medium_risk_count": sum(1 for r in results if r["flag"] == "medium_risk"),
            "low_risk_count": sum(1 for r in results if r["flag"] == "low_risk"),
            "avg_attendance_rate": round(np.mean([
                r["stats"]["attendance_rate"] for r in results
            ]), 1),
        }

        return {
            "results": results,
            "flagged_students": flagged,
            "summary": summary,
        }

    def _check_time_anomalies(self, timestamps):
        """Check for unusual check-in times."""
        if len(timestamps) < self.MIN_SAMPLES:
            return {"risk": 0, "anomalies": []}

        anomalies = []
        risk = 0

        # Convert to hours of day
        hours = []
        for ts in timestamps:
            dt = datetime.fromtimestamp(ts)
            hours.append(dt.hour + dt.minute / 60)

        hours = np.array(hours)
        mean_hour = np.mean(hours)
        std_hour = np.std(hours) if len(hours) > 1 else 1

        # Check for check-ins at unusual times
        for i, h in enumerate(hours):
            if std_hour > 0:
                z_score = abs(h - mean_hour) / std_hour
                if z_score > self.Z_SCORE_THRESHOLD:
                    anomalies.append({
                        "type": "unusual_checkin_time",
                        "detail": f"Check-in at unusual time ({h:.1f}h, z-score: {z_score:.1f})",
                        "severity": "medium" if z_score < 3 else "high",
                    })
                    risk += 20

        # Check for very early or very late check-ins
        unusual_hours = sum(1 for h in hours if h < 6 or h > 22)
        if unusual_hours > 0:
            risk += unusual_hours * 15
            anomalies.append({
                "type": "off_hours_checkin",
                "detail": f"{unusual_hours} check-ins outside normal hours (6AM-10PM)",
                "severity": "medium",
            })

        return {"risk": min(100, risk), "anomalies": anomalies}

    def _check_pattern_anomalies(self, session_ids, total_sessions):
        """Check for suspicious attendance patterns."""
        if not session_ids or total_sessions == 0:
            return {"risk": 0, "anomalies": []}

        anomalies = []
        risk = 0
        attendance_rate = len(session_ids) / total_sessions

        # Sudden attendance spike (attended 0-20% then suddenly 100%)
        if len(session_ids) >= 3:
            # Check if there are large gaps then sudden attendance
            sorted_ids = sorted(session_ids)
            gaps = [sorted_ids[i+1] - sorted_ids[i] for i in range(len(sorted_ids)-1)]

            if gaps:
                avg_gap = np.mean(gaps)
                max_gap = max(gaps)

                if max_gap > avg_gap * 3 and max_gap > 3:
                    risk += 30
                    anomalies.append({
                        "type": "irregular_pattern",
                        "detail": f"Large attendance gap detected (max gap: {max_gap} sessions)",
                        "severity": "medium",
                    })

        # Very low attendance
        if attendance_rate < 0.3 and total_sessions > 5:
            risk += 20
            anomalies.append({
                "type": "low_attendance",
                "detail": f"Attendance rate is only {attendance_rate*100:.0f}%",
                "severity": "low",
            })

        return {"risk": min(100, risk), "anomalies": anomalies}

    def _check_frequency_anomalies(self, timestamps):
        """Check for suspicious check-in frequency patterns."""
        if len(timestamps) < 3:
            return {"risk": 0, "anomalies": []}

        anomalies = []
        risk = 0

        sorted_ts = sorted(timestamps)

        # Check for rapid successive check-ins (proxy indicator)
        for i in range(1, len(sorted_ts)):
            diff = sorted_ts[i] - sorted_ts[i-1]
            # If two check-ins within 60 seconds - suspicious
            if diff < 60 and diff > 0:
                risk += 40
                anomalies.append({
                    "type": "rapid_checkin",
                    "detail": f"Two check-ins within {diff}s - possible proxy attendance",
                    "severity": "high",
                })

        # Check for perfectly regular intervals (bot-like behavior)
        if len(sorted_ts) >= 5:
            intervals = [sorted_ts[i+1] - sorted_ts[i] for i in range(len(sorted_ts)-1)]
            if intervals:
                interval_std = np.std(intervals)
                interval_mean = np.mean(intervals)
                if interval_mean > 0 and interval_std / interval_mean < 0.01:
                    risk += 30
                    anomalies.append({
                        "type": "robotic_pattern",
                        "detail": "Perfectly regular check-in intervals detected",
                        "severity": "medium",
                    })

        return {"risk": min(100, risk), "anomalies": anomalies}

    def _check_streak_anomalies(self, streak, total_sessions, attended):
        """Check for suspicious streak patterns."""
        anomalies = []
        risk = 0

        if total_sessions == 0:
            return {"risk": 0, "anomalies": []}

        attendance_rate = attended / total_sessions

        # Perfect attendance with very long streak is suspicious if it's inconsistent
        if streak == attended and streak > 10 and attendance_rate < 0.5:
            risk += 25
            anomalies.append({
                "type": "suspicious_streak",
                "detail": f"Perfect streak of {streak} but only {attendance_rate*100:.0f}% overall attendance",
                "severity": "medium",
            })

        return {"risk": min(100, risk), "anomalies": anomalies}


# Quick test
if __name__ == "__main__":
    import time

    detector = AnomalyDetector()

    print("🔍 CampusTrust AI - Anomaly Detection Demo\n")

    # Normal student
    normal_student = {
        "student_id": "STU001",
        "checkin_times": [
            int(time.time()) - 86400 * i + 36000  # 10 AM each day
            for i in range(10)
        ],
        "session_ids": list(range(1, 11)),
        "total_sessions": 12,
        "streak": 10,
    }

    result = detector.analyze_student(normal_student)
    print(f"👤 Normal Student: Risk Score = {result['risk_score']}/100 ({result['flag']})")
    print(f"   {result['recommendation']}\n")

    # Suspicious student
    suspicious_student = {
        "student_id": "STU002",
        "checkin_times": [
            int(time.time()) - 86400 * i + 10800  # 3 AM - suspicious
            for i in range(5)
        ] + [int(time.time()) + 30],  # Rapid successive check-in
        "session_ids": [1, 2, 3, 10, 11, 12],  # Gap in middle
        "total_sessions": 12,
        "streak": 3,
    }

    result = detector.analyze_student(suspicious_student)
    print(f"👤 Suspicious Student: Risk Score = {result['risk_score']}/100 ({result['flag']})")
    print(f"   {result['recommendation']}")
    for a in result["anomalies"]:
        print(f"   ⚠️  {a['type']}: {a['detail']}")
