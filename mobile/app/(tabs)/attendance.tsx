import { StyleSheet, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

export default function AttendanceScreen() {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    // Simulate face verification and blockchain recording
    setTimeout(() => {
      setHasCheckedIn(true);
      setLoading(false);
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">AI Attendance</ThemedText>
        <ThemedText style={styles.subtitle}>Face-verified blockchain check-in</ThemedText>
      </ThemedView>

      {/* Session Info */}
      <View style={styles.sessionCard}>
        <Text style={styles.sessionTitle}>Current Session</Text>
        <Text style={styles.sessionName}>Blockchain Development Lab</Text>
        <Text style={styles.sessionTime}>Session 5 of 5 • 47 students checked in</Text>
      </View>

      {/* Check-in Button */}
      {!hasCheckedIn ? (
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={handleCheckIn}
          disabled={loading}>
          <IconSymbol size={40} name="camera.fill" color="#fff" />
          <Text style={styles.checkInButtonText}>
            {loading ? 'Verifying Face...' : 'Check In Now'}
          </Text>
          <Text style={styles.checkInButtonSubtext}>Take a selfie to mark attendance</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.successCard}>
          <IconSymbol size={60} name="checkmark.circle.fill" color="#22c55e" />
          <Text style={styles.successTitle}>Attendance Recorded!</Text>
          <Text style={styles.successDesc}>Your attendance has been verified on Algorand blockchain</Text>
          <Text style={styles.txId}>TX: ATT4X9Y2...</Text>
        </View>
      )}

      {/* Attendance History */}
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Your Attendance</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderLeftColor: '#22c55e' }]}>
            <Text style={styles.statValue}>5/5</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#f59e0b' }]}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#3b82f6' }]}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Recent Check-ins */}
        <Text style={styles.sectionSubtitle}>Recent Check-ins</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.historyCard}>
            <IconSymbol size={20} name="checkmark.circle.fill" color="#22c55e" />
            <View style={styles.historyInfo}>
              <Text style={styles.historyTitle}>Session {6 - i}</Text>
              <Text style={styles.historyTime}>{i} days ago</Text>
            </View>
            <Text style={styles.historyStatus}>✓ Verified</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  sessionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sessionTitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  sessionName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sessionTime: {
    color: '#06b6d4',
    fontSize: 14,
  },
  checkInButton: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  checkInButtonSubtext: {
    color: '#dcfce7',
    fontSize: 14,
    marginTop: 4,
  },
  successCard: {
    backgroundColor: '#14532d',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  successTitle: {
    color: '#22c55e',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  successDesc: {
    color: '#86efac',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  txId: {
    color: '#4ade80',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 12,
  },
  historyContainer: {
    padding: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  historyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  historyTime: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  historyStatus: {
    color: '#22c55e',
    fontSize: 12,
  },
});
