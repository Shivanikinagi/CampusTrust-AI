import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

const RECENT_ATTENDANCE = [
  { date: 'TODAY', time: '09:00', course: 'Intro to CS 101', status: 'Pending AI Review', statusColor: '#F59E0B', icon: 'chevron-forward' },
  { date: 'YEST.', time: '14:00', course: 'Blockchain Ethics', status: 'Verified On-Chain', statusColor: COLORS.primary, icon: 'link' },
  { date: 'OCT 12', time: '10:00', course: 'Macroeconomics', status: 'Flagged (Loc Mismatch)', statusColor: '#EF4444', icon: 'warning' },
];

export default function AttendanceScreen() {
  const { isConnected, balance } = useWallet();
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons name="school" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.brandName}>CAMPUSTRUST</Text>
              <View style={styles.networkRow}>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>MainNet</Text>
              </View>
            </View>
          </View>
          <View style={styles.algoChip}>
            <Ionicons name="wallet" size={14} color={COLORS.textPrimary} />
            <Text style={styles.algoAmount}>{isConnected ? `${balance.toFixed(0)}` : '245'} ALGO</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Attendance Rate</Text>
              <Ionicons name="calendar" size={18} color={COLORS.textMuted} />
            </View>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>92%</Text>
              <Text style={styles.statTrend}>↑ 2%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '92%', backgroundColor: COLORS.primary }]} />
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>AI Trust Score</Text>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.textMuted} />
            </View>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>98</Text>
              <Text style={styles.statMax}> / 100</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
              <Text style={styles.trustText}>EXCELLENT</Text>
            </View>
          </View>
        </View>

        {/* Check-In Button */}
        <View style={styles.checkInSection}>
          <TouchableOpacity
            style={[styles.checkInButton, checkedIn && styles.checkInDone]}
            onPress={() => setCheckedIn(!checkedIn)}
            activeOpacity={0.8}>
            <View style={styles.checkInOuter}>
              <View style={[styles.checkInInner, checkedIn && styles.checkInInnerDone]}>
                <Ionicons
                  name={checkedIn ? 'checkmark-circle' : 'finger-print'}
                  size={48}
                  color={checkedIn ? COLORS.success : COLORS.primary}
                />
                <Text style={[styles.checkInLabel, checkedIn && styles.checkInLabelDone]}>
                  {checkedIn ? 'CHECKED IN' : 'CHECK IN'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Location Info */}
          <View style={styles.locationChip}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>Science Building Block B</Text>
            <Text style={styles.locationVerified}>(Verified)</Text>
          </View>
        </View>

        {/* Recent Attendance */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Attendance</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {RECENT_ATTENDANCE.map((item, index) => (
            <View key={index} style={styles.attendanceCard}>
              <View style={styles.attendanceLeft}>
                <Text style={styles.attendanceDate}>{item.date}</Text>
                <Text style={styles.attendanceTime}>{item.time}</Text>
              </View>
              <View style={styles.attendanceDivider} />
              <View style={styles.attendanceContent}>
                <Text style={styles.courseName}>{item.course}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusIndicator, { backgroundColor: item.statusColor }]} />
                  <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                </View>
              </View>
              <Ionicons name={item.icon as any} size={18} color={COLORS.textMuted} />
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  networkText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  algoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  algoAmount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    marginBottom: SPACING.xxxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statTrend: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 6,
  },
  statMax: {
    fontSize: FONT_SIZES.md,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.borderDark,
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  trustText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },

  // Check-In
  checkInSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  checkInButton: {
    alignItems: 'center',
  },
  checkInDone: {},
  checkInOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  checkInInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  checkInInnerDone: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success + '40',
  },
  checkInLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
    letterSpacing: 2,
  },
  checkInLabelDone: {
    color: COLORS.success,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginTop: SPACING.xl,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  locationVerified: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Recent
  recentSection: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  attendanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: SPACING.md,
  },
  attendanceLeft: {
    alignItems: 'center',
    minWidth: 50,
  },
  attendanceDate: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  attendanceTime: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  attendanceDivider: {
    width: 2,
    height: 36,
    backgroundColor: COLORS.borderDark,
    borderRadius: 1,
  },
  attendanceContent: {
    flex: 1,
  },
  courseName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
});
