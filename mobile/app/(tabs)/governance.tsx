import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Modal, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';
import { signGovernanceProposal } from '@/services/algorandService';

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
  const [signedProps, setSignedProps] = useState<Record<string, 'signed' | 'rejected' | null>>({});
  const { isDemoMode, address } = useWallet();
  const [showProofModal, setShowProofModal] = useState(false);
  const [blockchainProof, setBlockchainProof] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignProposal = async (proposalId: string, proposalTitle: string, action: 'sign' | 'reject') => {
    if (!address && !isDemoMode) {
      return;
    }

    setIsSubmitting(true);
    try {
      const proof = await signGovernanceProposal(
        address || 'DEMO',
        proposalId,
        action
      );
      setBlockchainProof(proof);
      setShowProofModal(true);
      setSignedProps(prev => ({ ...prev, [proposalId]: action === 'sign' ? 'signed' : 'rejected' }));
    } catch (error) {
      console.error('Error signing proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Governance</Text>
          <TouchableOpacity onPress={() => Alert.alert('Notifications', 'You have 1 proposal pending your signature.', [{ text: 'OK' }])}>
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

        {activeTab === 'proposals' ? (
          <>
            {/* DAO Proposals */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DAO Proposals</Text>
              <TouchableOpacity onPress={() => Alert.alert('All Proposals', 'Showing all DAO proposals:\n\n• #402 — AI Research Lab (Active)\n• #401 — Spring Hackathon (Executed)\n• #403 — Library Hours (Reviewing)\n• #400 — Campus Safety (Executed)\n• #399 — Scholarship Fund (Executed)', [{ text: 'OK' }])}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {PROPOSALS.map((prop, index) => (
              <View key={index} style={styles.proposalCard}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: prop.statusColor + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: prop.statusColor }]}>
                    {signedProps[prop.id] === 'signed' ? 'SIGNED' : signedProps[prop.id] === 'rejected' ? 'REJECTED' : prop.status}
                  </Text>
                </View>

                {/* Title & Info */}
                <View style={styles.propHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.propTitle}>{prop.title}</Text>
                    <Text style={styles.propMeta}>Prop {prop.id} • {prop.endsIn}</Text>
                  </View>
                  {prop.pending && (
                    <TouchableOpacity onPress={() => Alert.alert(`Proposal ${prop.id}`, `${prop.title}\n\n${prop.endsIn}\n\nSignatures: ${prop.signed}/${prop.total}`, [
                      { text: 'View on Explorer', onPress: () => { } },
                      { text: 'Close' },
                    ])}>
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
                {prop.pending && !signedProps[prop.id] && (
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

                {prop.pending && !signedProps[prop.id] && (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.signButton}
                      onPress={() => handleSignProposal(prop.id, prop.title, 'sign')}
                      disabled={isSubmitting}>
                      <Ionicons name="shield-checkmark" size={16} color={COLORS.bgDark} />
                      <Text style={styles.signButtonText}>Sign</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.rejectButton}
                      onPress={() => handleSignProposal(prop.id, prop.title, 'reject')}
                      disabled={isSubmitting}>
                      <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {signedProps[prop.id] && (
                  <View style={[styles.votedIndicator, { backgroundColor: signedProps[prop.id] === 'signed' ? COLORS.success + '15' : '#EF4444' + '15' }]}>
                    <Ionicons name={signedProps[prop.id] === 'signed' ? 'checkmark-circle' : 'close-circle'} size={16}
                      color={signedProps[prop.id] === 'signed' ? COLORS.success : '#EF4444'} />
                    <Text style={{ color: signedProps[prop.id] === 'signed' ? COLORS.success : '#EF4444', fontWeight: '600', fontSize: FONT_SIZES.sm }}>
                      {signedProps[prop.id] === 'signed' ? 'You signed this proposal' : 'You rejected this proposal'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </>
        ) : (
          <View style={styles.rulebookSection}>
            <View style={styles.ruleCard}>
              <View style={styles.ruleHeader}>
                <Ionicons name="book" size={20} color={COLORS.primary} />
                <Text style={styles.ruleTitle}>DAO Constitution</Text>
              </View>
              <Text style={styles.ruleText}>
                The CampusTrust DAO operates on the Algorand blockchain with the following core rules:
              </Text>
            </View>
            {[
              { num: '1', title: 'Quorum', desc: 'Minimum 3 of 5 multi-sig holders must sign for execution.' },
              { num: '2', title: 'Voting Period', desc: 'All proposals have a 7-day voting window unless expedited.' },
              { num: '3', title: 'Budget Limits', desc: 'Single proposals cannot exceed 2,000 ALGO without dean approval.' },
              { num: '4', title: 'Transparency', desc: 'All treasury movements are recorded on-chain and publicly auditable.' },
              { num: '5', title: 'Amendments', desc: 'Rule changes require 4 of 5 signatures and a 14-day review period.' },
            ].map((rule) => (
              <TouchableOpacity key={rule.num} style={styles.ruleItem}
                onPress={() => Alert.alert(`Rule ${rule.num}: ${rule.title}`, rule.desc, [{ text: 'OK' }])}>
                <View style={styles.ruleNumBadge}>
                  <Text style={styles.ruleNum}>{rule.num}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ruleItemTitle}>{rule.title}</Text>
                  <Text style={styles.ruleItemDesc}>{rule.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Blockchain Proof Modal */}
      <Modal visible={showProofModal} animationType="slide" transparent>
        <View style={styles.proofOverlay}>
          <View style={styles.proofContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Proof Header */}
              <View style={styles.proofHeader}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                </View>
                <Text style={styles.proofTitle}>Blockchain Proof</Text>
                <Text style={styles.proofSubtitle}>
                  {blockchainProof?.action || 'Signature recorded on Algorand'}
                </Text>
              </View>

              {/* Demo Mode Indicator */}
              {isDemoMode && (
                <View style={styles.demoModeBanner}>
                  <Ionicons name="flask" size={16} color={COLORS.warning} />
                  <Text style={styles.demoModeText}>Demo Mode - Simulated Transaction</Text>
                </View>
              )}

              {/* Signature Details */}
              <View style={styles.proofSection}>
                <Text style={styles.proofSectionTitle}>Signature Details</Text>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Proposal</Text>
                  <Text style={styles.proofValue}>{blockchainProof?.proposalTitle || 'N/A'}</Text>
                </View>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Proposal ID</Text>
                  <Text style={styles.proofValue}>{blockchainProof?.proposalId || 'N/A'}</Text>
                </View>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Your Decision</Text>
                  <View style={styles.decisionBadge}>
                    <Ionicons 
                      name={blockchainProof?.decision === 'approved' ? 'shield-checkmark' : 'close-circle'} 
                      size={14} 
                      color={blockchainProof?.decision === 'approved' ? COLORS.success : '#EF4444'} 
                    />
                    <Text style={[
                      styles.decisionText,
                      { color: blockchainProof?.decision === 'approved' ? COLORS.success : '#EF4444' }
                    ]}>
                      {blockchainProof?.decision === 'approved' ? 'SIGNED' : 'REJECTED'}
                    </Text>
                  </View>
                </View>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Signer Address</Text>
                  <Text style={styles.proofValueMono} numberOfLines={1}>
                    {blockchainProof?.signerAddress || address || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Multi-Sig Status */}
              {blockchainProof?.multiSigStatus && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>Multi-Signature Status</Text>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Signatures Collected</Text>
                    <Text style={styles.proofValue}>
                      {blockchainProof.multiSigStatus.signed} of {blockchainProof.multiSigStatus.required} required
                    </Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Execution Status</Text>
                    <Text style={[
                      styles.proofValue,
                      { color: blockchainProof.multiSigStatus.canExecute ? COLORS.success : COLORS.warning }
                    ]}>
                      {blockchainProof.multiSigStatus.canExecute ? 'Ready to Execute' : 'Awaiting More Signatures'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Blockchain Record */}
              <View style={styles.proofSection}>
                <Text style={styles.proofSectionTitle}>Blockchain Record</Text>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Transaction ID</Text>
                  <Text style={styles.proofValueMono} numberOfLines={1}>
                    {blockchainProof?.txId || 'N/A'}
                  </Text>
                </View>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Network</Text>
                  <View style={styles.networkBadge}>
                    <View style={styles.networkDot} />
                    <Text style={styles.proofValue}>{blockchainProof?.network || 'Algorand TestNet'}</Text>
                  </View>
                </View>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Block</Text>
                  <Text style={styles.proofValue}>{blockchainProof?.confirmedRound || 'Pending'}</Text>
                </View>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Timestamp</Text>
                  <Text style={styles.proofValue}>
                    {blockchainProof?.timestamp ? new Date(blockchainProof.timestamp).toLocaleString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Transaction Fee</Text>
                  <Text style={styles.proofValue}>{blockchainProof?.fee || '0.001'} ALGO</Text>
                </View>
              </View>

              {/* Explorer Button */}
              {blockchainProof?.explorerUrl && (
                <TouchableOpacity 
                  style={styles.explorerButton}
                  onPress={() => Linking.openURL(blockchainProof.explorerUrl)}>
                  <Ionicons name="open-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.explorerButtonText}>View on Algorand Explorer</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeProofButton}
              onPress={() => setShowProofModal(false)}>
              <Text style={styles.closeProofButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  // Voted indicator
  votedIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg, marginTop: SPACING.sm,
  },

  // Rulebook
  rulebookSection: { marginTop: SPACING.md },
  ruleCard: {
    backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.xxl, padding: SPACING.xl,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  ruleHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  ruleTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  ruleText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  ruleItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  ruleNumBadge: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  ruleNum: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.primary },
  ruleItemTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  ruleItemDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },

  // Proof Modal
  proofOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  proofContent: {
    backgroundColor: COLORS.surfaceDark, borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  proofHeader: { alignItems: 'center', marginBottom: SPACING.xl },
  successIconContainer: { marginBottom: SPACING.md },
  proofTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  proofSubtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  demoModeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, justifyContent: 'center',
    backgroundColor: COLORS.warning + '15', padding: SPACING.md, borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.warning + '30',
  },
  demoModeText: { fontSize: FONT_SIZES.sm, color: COLORS.warning, fontWeight: '600' },
  proofSection: {
    backgroundColor: COLORS.bgDark + 'CC', padding: SPACING.lg, borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  proofSectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.md },
  proofField: { marginBottom: SPACING.md },
  proofLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  proofValue: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '500' },
  proofValueMono: {
    fontSize: FONT_SIZES.sm, color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  decisionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.bgDark, borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
  },
  decisionText: { fontSize: FONT_SIZES.md, fontWeight: '700', letterSpacing: 0.5 },
  networkBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  networkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  explorerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary + '15', padding: SPACING.lg, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  explorerButtonText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.primary },
  closeProofButton: {
    backgroundColor: COLORS.bgDark, padding: SPACING.lg, borderRadius: RADIUS.lg,
    alignItems: 'center', marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  closeProofButtonText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
});
