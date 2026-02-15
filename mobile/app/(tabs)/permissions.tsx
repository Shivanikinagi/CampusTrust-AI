import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

const STAGES = ['AI\nAudit', 'HOD\nApproval', 'Faculty\nReview', 'Dean\nSign-off'];

const REQUESTS = [
  {
    id: 'REQ-8821',
    date: 'Oct 24, 2023',
    title: 'Blockchain Workshop',
    txn: '2G9...8xL',
    currentStage: 1,
    waiting: 'Dr. Sarah Connor',
  },
  {
    id: 'REQ-8819',
    date: 'Oct 22',
    title: 'Guest Lecture Series',
    txn: '',
    currentStage: 0,
    status: 'Processing AI Pre-Audit...',
    statusColor: '#F59E0B',
  },
  {
    id: 'REQ-8817',
    date: 'Oct 20',
    title: 'Tech Symposium Budget',
    txn: '',
    currentStage: -1,
    status: 'Rejected by HOD',
    statusColor: '#EF4444',
  },
];

export default function PermissionsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Smart Permissions</Text>
            <View style={styles.networkRow}>
              <View style={styles.networkDot} />
              <Text style={styles.networkText}>Algorand Mainnet</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="filter" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PENDING</Text>
            <Text style={styles.statValue}>3</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHighlight]}>
            <Text style={styles.statLabel}>APPROVED</Text>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>12</Text>
          </View>
        </View>

        {/* Recent Requests */}
        <Text style={styles.sectionTitle}>RECENT REQUESTS</Text>

        {/* Primary Request Card */}
        <View style={[styles.requestCard, styles.primaryCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.idBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Text style={[styles.idBadgeText, { color: COLORS.success }]}>{REQUESTS[0].id}</Text>
            </View>
            <Text style={styles.dateText}>{REQUESTS[0].date}</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.requestTitle}>{REQUESTS[0].title}</Text>
          <View style={styles.txRow}>
            <Ionicons name="link" size={12} color={COLORS.textMuted} />
            <Text style={styles.txText}>Txn: {REQUESTS[0].txn}</Text>
          </View>

          {/* Stage Pipeline */}
          <View style={styles.stageContainer}>
            {STAGES.map((stage, i) => (
              <View key={i} style={styles.stageItem}>
                <View style={[
                  styles.stageCircle,
                  i < REQUESTS[0].currentStage && styles.stageCompleted,
                  i === REQUESTS[0].currentStage && styles.stageCurrent,
                  i > REQUESTS[0].currentStage && styles.stageInactive,
                ]}>
                  {i < REQUESTS[0].currentStage ? (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  ) : i === REQUESTS[0].currentStage ? (
                    <View style={styles.stageCurrentDot} />
                  ) : (
                    <View style={styles.stageInactiveDot} />
                  )}
                </View>
                <Text style={[
                  styles.stageLabel,
                  i <= REQUESTS[0].currentStage ? styles.stageLabelActive : styles.stageLabelInactive,
                ]}>{stage}</Text>
              </View>
            ))}
          </View>

          {/* Stage connector lines */}
          <View style={styles.stageConnectorRow}>
            {STAGES.slice(0, -1).map((_, i) => (
              <View key={i} style={[
                styles.stageConnector,
                i < REQUESTS[0].currentStage && styles.stageConnectorActive,
              ]} />
            ))}
          </View>

          <View style={styles.waitingRow}>
            <Text style={styles.waitingText}>Waiting for {REQUESTS[0].waiting}</Text>
            <TouchableOpacity>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Secondary Request Cards */}
        {REQUESTS.slice(1).map((req, index) => (
          <View key={index} style={styles.requestCard}>
            <View style={styles.secondaryCardHeader}>
              <View style={[styles.statusIndicator, { backgroundColor: req.statusColor }]} />
              <Text style={styles.requestTitle}>{req.title}</Text>
              <Text style={styles.dateTextSmall}>{req.date}</Text>
            </View>
            <View style={styles.secondaryCardInfo}>
              <Text style={styles.secondaryId}>{req.id}</Text>
              <Text style={styles.secondaryStage}>Stage: {req.currentStage >= 0 ? `${req.currentStage + 1}/4` : 'N/A'}</Text>
            </View>
            {req.currentStage >= 0 && (
              <View style={styles.miniProgressBar}>
                <View style={[styles.miniProgressFill, {
                  width: `${((req.currentStage + 1) / 4) * 100}%`,
                  backgroundColor: req.statusColor,
                }]} />
              </View>
            )}
            <Text style={[styles.statusMessage, { color: req.statusColor }]}>{req.status}</Text>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaButton}>
          <Ionicons name="add-circle" size={20} color={COLORS.bgDark} />
          <Text style={styles.ctaText}>Request New Permission</Text>
        </TouchableOpacity>
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
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  networkText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary + 'B0',
    fontWeight: '500',
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
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  statCardHighlight: {},
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.display,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Section
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.lg,
  },

  // Primary Request Card
  requestCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  primaryCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  idBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  idBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  dateText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  requestTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xl,
  },
  txText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Stages
  stageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  stageCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageCompleted: {
    backgroundColor: COLORS.primary,
  },
  stageCurrent: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  stageInactive: {
    backgroundColor: COLORS.borderDark,
  },
  stageCurrentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  stageInactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  stageLabel: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },
  stageLabelActive: {
    color: COLORS.primary,
  },
  stageLabelInactive: {
    color: COLORS.textMuted,
  },
  stageConnectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 40,
    right: 40,
    top: 56 + 16,
  },
  stageConnector: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.borderDark,
    marginHorizontal: 8,
  },
  stageConnectorActive: {
    backgroundColor: COLORS.primary,
  },
  waitingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: SPACING.lg,
  },
  waitingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  viewDetailsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Secondary Cards
  secondaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateTextSmall: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
  secondaryCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  secondaryId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  secondaryStage: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: COLORS.borderDark,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  miniProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  statusMessage: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    textAlign: 'right',
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: SPACING.xl,
    right: SPACING.xl,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
