import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

type TabKey = 'proposals' | 'rulebook';

const PROPOSALS = [
  {
    id: '#402',
    title: 'Allocate 500 ALGO for AI Research Lab',
    endsIn: 'Ends in 12h',
    signed: 3,
    total: 5,
    status: 'ACTIVE',
    statusColor: COLORS.success,
    pending: true,
  },
  {
    id: '#401',
    title: 'Spring Hackathon Funding',
    endsIn: 'Executed 2d ago',
    signed: 5,
    total: 5,
    status: 'EXECUTED',
    statusColor: COLORS.success,
    pending: false,
  },
  {
    id: '#403',
    title: 'Update Library Access Hours',
    endsIn: 'Ends in 3d',
    signed: 1,
    total: 5,
    status: 'REVIEWING',
    statusColor: '#F59E0B',
    pending: false,
  },
];

export default function GovernanceScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('proposals');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Governance</Text>
          <TouchableOpacity>
            <Ionicons name="notifications" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'proposals' && styles.tabActive]}
            onPress={() => setActiveTab('proposals')}>
            <Text style={[styles.tabText, activeTab === 'proposals' && styles.tabTextActive]}>Proposals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rulebook' && styles.tabActive]}
            onPress={() => setActiveTab('rulebook')}>
            <Text style={[styles.tabText, activeTab === 'rulebook' && styles.tabTextActive]}>Rulebook</Text>
          </TouchableOpacity>
        </View>

        {/* Treasury Balance */}
        <View style={styles.treasuryCard}>
          <View style={styles.treasuryHeader}>
            <Text style={styles.treasuryLabel}>TREASURY BALANCE</Text>
            <Ionicons name="wallet" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.treasuryValueRow}>
            <Text style={styles.treasuryValue}>$12,450.00</Text>
            <View style={styles.trendChip}>
              <Text style={styles.trendText}>↑ 2.4%</Text>
            </View>
          </View>
          <View style={styles.tokenRow}>
            <View style={styles.tokenChip}>
              <View style={[styles.tokenCircle, { backgroundColor: COLORS.textMuted + '30' }]}>
                <Text style={styles.tokenIcon}>Ⓐ</Text>
              </View>
              <View>
                <Text style={styles.tokenName}>Algorand</Text>
                <Text style={styles.tokenAmount}>15,000</Text>
              </View>
            </View>
            <View style={styles.tokenChip}>
              <View style={[styles.tokenCircle, { backgroundColor: '#10B981' + '30' }]}>
                <Text style={[styles.tokenIcon, { color: '#10B981' }]}>$</Text>
              </View>
              <View>
                <Text style={styles.tokenName}>USDC</Text>
                <Text style={styles.tokenAmount}>5,000</Text>
              </View>
            </View>
          </View>
        </View>

        {/* DAO Proposals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DAO Proposals</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {PROPOSALS.map((prop, index) => (
          <View key={index} style={styles.proposalCard}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: prop.statusColor + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: prop.statusColor }]}>{prop.status}</Text>
            </View>

            {/* Title & Info */}
            <View style={styles.propHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.propTitle}>{prop.title}</Text>
                <Text style={styles.propMeta}>Prop {prop.id} • {prop.endsIn}</Text>
              </View>
              {prop.pending && (
                <TouchableOpacity>
                  <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={[styles.signedText, { color: prop.signed === prop.total ? COLORS.success : COLORS.primary }]}>
                {prop.signed} of {prop.total} Signed
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                {
                  width: `${(prop.signed / prop.total) * 100}%`,
                  backgroundColor: prop.signed === prop.total ? COLORS.success : COLORS.primary,
                },
              ]} />
            </View>

            {/* Signers & Actions */}
            {prop.pending && (
              <View style={styles.actionRow}>
                <View style={styles.signerAvatars}>
                  {Array.from({ length: Math.min(prop.signed, 3) }).map((_, i) => (
                    <View key={i} style={[styles.signerAvatar, { marginLeft: i > 0 ? -8 : 0 }]}>
                      <Ionicons name="person" size={12} color={COLORS.primary} />
                    </View>
                  ))}
                  {prop.signed > 3 && (
                    <View style={[styles.signerAvatar, { marginLeft: -8, backgroundColor: COLORS.bgDark }]}>
                      <Text style={styles.moreSigners}>+{prop.signed - 3}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pendingSignature}>Pending your signature</Text>
              </View>
            )}

            {prop.pending && (
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.signButton}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.bgDark} />
                  <Text style={styles.signButtonText}>Sign</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton}>
                  <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

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
    paddingHorizontal: SPACING.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: 4,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.bgDark,
  },

  // Treasury
  treasuryCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  treasuryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  treasuryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  treasuryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  treasuryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trendChip: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.md,
  },
  trendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  tokenRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  tokenChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  tokenCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenIcon: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tokenName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tokenAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Section
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

  // Proposal Cards
  proposalCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  propHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  propTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  propMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  signedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.borderDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  signerAvatars: {
    flexDirection: 'row',
  },
  signerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceDark,
  },
  moreSigners: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  pendingSignature: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  signButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  signButtonText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  rejectButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
