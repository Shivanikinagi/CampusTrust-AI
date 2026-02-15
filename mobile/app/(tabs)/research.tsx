import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

const SUBMISSIONS = [
  {
    title: 'Quantum Consensus...',
    time: 'Submitted 2h ago',
    status: 'CERTIFIED',
    statusColor: COLORS.success,
    originality: 98,
    techAccuracy: 94,
    txHash: '8f2...9a1',
  },
  {
    title: 'Neural Architecture...',
    time: 'Submitted 1d ago',
    status: 'REVIEWING',
    statusColor: '#F59E0B',
    originality: 0,
    techAccuracy: 0,
    txHash: '',
  },
];

export default function ResearchScreen() {
  const [uploading, setUploading] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Research{'\n'}Certification</Text>
            <Text style={styles.versionText}>CampusTrust AI v2.0</Text>
          </View>
          <View style={styles.mainnetChip}>
            <View style={styles.mainnetDot} />
            <View>
              <Text style={styles.mainnetLabel}>ALGO</Text>
              <Text style={styles.mainnetText}>MAINNET</Text>
            </View>
          </View>
        </View>

        {/* Upload Area */}
        <View style={styles.uploadArea}>
          <View style={styles.uploadDashedBorder}>
            <View style={styles.uploadIconWrap}>
              <Ionicons name="cloud-upload" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.uploadTitle}>Tap to upload Research Paper (PDF)</Text>
            <Text style={styles.uploadSubtitle}>Max size 25MB. Secure encryption enabled.</Text>
          </View>
        </View>

        {/* Start AI Peer Review Button */}
        <TouchableOpacity style={styles.reviewButton}>
          <Ionicons name="sparkles" size={20} color={COLORS.bgDark} />
          <Text style={styles.reviewButtonText}>Start AI Peer Review</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Ionicons name="diamond" size={16} color={COLORS.primary} />
              <Text style={styles.statLabel}>TRUST Tokens</Text>
            </View>
            <Text style={styles.statValue}>1,240</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.statLabel}>Papers Certified</Text>
            </View>
            <Text style={styles.statValue}>12</Text>
          </View>
        </View>

        {/* Recent Submissions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Submissions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {SUBMISSIONS.map((sub, index) => (
            <View key={index} style={styles.submissionCard}>
              <View style={styles.subHeader}>
                <View style={styles.subIconContainer}>
                  <Ionicons name="document" size={18} color="#EF4444" />
                </View>
                <View style={styles.subContent}>
                  <Text style={styles.subTitle}>{sub.title}</Text>
                  <Text style={styles.subTime}>{sub.time}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: sub.statusColor + '15', borderColor: sub.statusColor + '30' }]}>
                  <View style={[styles.statusDot, { backgroundColor: sub.statusColor }]} />
                  <Text style={[styles.statusText, { color: sub.statusColor }]}>{sub.status}</Text>
                </View>
              </View>

              {sub.originality > 0 && (
                <>
                  {/* Progress Bars */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>ORIGINALITY</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${sub.originality}%`, backgroundColor: COLORS.success }]} />
                      </View>
                      <Text style={styles.progressValue}>{sub.originality}%</Text>
                    </View>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>TECH ACCURACY</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${sub.techAccuracy}%`, backgroundColor: COLORS.primary }]} />
                      </View>
                      <Text style={styles.progressValue}>{sub.techAccuracy}%</Text>
                    </View>
                  </View>

                  {/* TX Hash */}
                  <View style={styles.txRow}>
                    <Ionicons name="link" size={12} color={COLORS.textMuted} />
                    <Text style={styles.txLabel}>TX: {sub.txHash}</Text>
                    <TouchableOpacity>
                      <Ionicons name="copy-outline" size={14} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Research Icon */}
      <View style={styles.floatingIcon}>
        <View style={styles.floatingIconInner}>
          <Ionicons name="school" size={24} color={COLORS.primary} />
        </View>
      </View>
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
    paddingHorizontal: SPACING.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    marginBottom: SPACING.xxl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 34,
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  mainnetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  mainnetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  mainnetLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  mainnetText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Upload
  uploadArea: {
    marginBottom: SPACING.xxl,
  },
  uploadDashedBorder: {
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark + '50',
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  uploadTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  uploadSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Review Button
  reviewButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  reviewButtonText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
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
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
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

  // Submission Cards
  submissionCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  subIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: '#EF4444' + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subContent: {
    flex: 1,
  },
  subTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Progress
  progressSection: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    width: 110,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.borderDark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    width: 36,
    textAlign: 'right',
  },

  // TX
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: SPACING.md,
  },
  txLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },

  // Floating icon
  floatingIcon: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
  },
  floatingIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});