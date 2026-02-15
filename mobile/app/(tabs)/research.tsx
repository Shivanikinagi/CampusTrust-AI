import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Modal, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';
import { submitResearchCertification, verifyResearchCertificate } from '@/services/algorandService';

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
  const [fileSelected, setFileSelected] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [paperTitle, setPaperTitle] = useState('Quantum Consensus Mechanisms');
  const { isDemoMode, address } = useWallet();
  const [showProofModal, setShowProofModal] = useState(false);
  const [blockchainProof, setBlockchainProof] = useState<any>(null);

  const handleSubmitForReview = async () => {
    if (!fileSelected) {
      return;
    }
    if (!address && !isDemoMode) {
      return;
    }

    setReviewing(true);
    try {
      const proof = await submitResearchCertification(
        address || 'DEMO',
        {
          title: paperTitle,
          ipfsHash: 'QmDemo123',
          author: 'John Doe',
        }
      );
      setBlockchainProof(proof);
      setShowProofModal(true);
    } catch (error) {
      console.error('Error submitting research:', error);
    } finally {
      setReviewing(false);
    }
  };

  const handleVerifyCertificate = async (txHash: string, paperTitle: string) => {
    setReviewing(true);
    try {
      const proof = await verifyResearchCertificate(txHash);
      setBlockchainProof(proof);
      setShowProofModal(true);
    } catch (error) {
      console.error('Error verifying certificate:', error);
    } finally {
      setReviewing(false);
    }
  };

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
        <TouchableOpacity
          style={styles.uploadArea}
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              'Select Research Paper',
              'Choose a file source:',
              [
                { text: 'Camera Roll', onPress: () => { setFileSelected(true); Alert.alert('✅ File Selected', 'research_paper_quantum.pdf (4.2 MB)\n\nReady for AI Peer Review.'); } },
                { text: 'Browse Files', onPress: () => { setFileSelected(true); Alert.alert('✅ File Selected', 'neural_architecture_search.pdf (6.8 MB)\n\nReady for AI Peer Review.'); } },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}>
          <View style={styles.uploadDashedBorder}>
            <View style={styles.uploadIconWrap}>
              <Ionicons name={fileSelected ? 'document-text' : 'cloud-upload'} size={32} color={fileSelected ? COLORS.success : COLORS.primary} />
            </View>
            <Text style={styles.uploadTitle}>{fileSelected ? 'Paper Selected ✓' : 'Tap to upload Research Paper (PDF)'}</Text>
            <Text style={styles.uploadSubtitle}>{fileSelected ? 'Tap to change file' : 'Max size 25MB. Secure encryption enabled.'}</Text>
          </View>
        </TouchableOpacity>

        {/* Start AI Peer Review Button */}
        <TouchableOpacity
          style={[styles.reviewButton, !fileSelected && { opacity: 0.5 }]}
          disabled={reviewing}
          onPress={handleSubmitForReview}>
          <Ionicons name="sparkles" size={20} color={COLORS.bgDark} />
          <Text style={styles.reviewButtonText}>{reviewing ? 'Reviewing...' : 'Start AI Peer Review'}</Text>
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
            <TouchableOpacity onPress={() => Alert.alert('All Submissions', 'Showing all research submissions:\n\n1. Quantum Consensus Mechanisms — Certified\n2. Neural Architecture Search — Reviewing\n3. Federated Learning for IoT — Certified\n4. Zero-Knowledge Proofs — Certified\n5. Graph Neural Networks — Reviewing\n\nTotal: 12 papers certified', [{ text: 'OK' }])}>
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
                    <TouchableOpacity onPress={() => Alert.alert('TX Hash Copied', `Transaction: ${sub.txHash}\n\nView on Algorand Explorer.`, [{ text: 'OK' }])}>
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
                  {blockchainProof?.action || 'Research certification recorded on Algorand'}
                </Text>
              </View>

              {/* Demo Mode Indicator */}
              {isDemoMode && (
                <View style={styles.demoModeBanner}>
                  <Ionicons name="flask" size={16} color={COLORS.warning} />
                  <Text style={styles.demoModeText}>Demo Mode - Simulated Transaction</Text>
                </View>
              )}

              {/* Research Details */}
              {blockchainProof?.researchDetails && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>Research Paper</Text>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Title</Text>
                    <Text style={styles.proofValue}>{blockchainProof.researchDetails.title}</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Author(s)</Text>
                    <Text style={styles.proofValue}>{blockchainProof.researchDetails.author}</Text>
                  </View>
                  {blockchainProof.researchDetails.doi && (
                    <View style={styles.proofField}>
                      <Text style={styles.proofLabel}>DOI</Text>
                      <Text style={styles.proofValueMono}>{blockchainProof.researchDetails.doi}</Text>
                    </View>
                  )}
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>IPFS Hash</Text>
                    <TouchableOpacity onPress={() => blockchainProof.researchDetails.ipfsHash && Linking.openURL(`https://ipfs.io/ipfs/${blockchainProof.researchDetails.ipfsHash}`)}>
                      <Text style={[styles.proofValueMono, { color: COLORS.primary }]} numberOfLines={1}>
                        {blockchainProof.researchDetails.ipfsHash}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* AI Evaluation */}
              {blockchainProof?.aiEvaluation && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>AI Peer Review</Text>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Originality Score</Text>
                    <View style={styles.scoreBadge}>
                      <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
                      <Text style={styles.scoreText}>{blockchainProof.aiEvaluation.originalityScore}%</Text>
                    </View>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Technical quality</Text>
                    <View style={styles.scoreBadge}>
                      <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                      <Text style={styles.scoreText}>{blockchainProof.aiEvaluation.technicalAccuracy}%</Text>
                    </View>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Certification Status</Text>
                    <Text style={[styles.proofValue, { color: COLORS.success }]}>
                      {blockchainProof.aiEvaluation.certification}
                    </Text>
                  </View>
                </View>
              )}

              {/* Certificate Details (for verify) */}
              {blockchainProof?.certificateDetails && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>Certificate Verification</Text>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Certificate ID</Text>
                    <Text style={styles.proofValueMono}>{blockchainProof.certificateDetails.certificateId}</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Authority</Text>
                    <Text style={styles.proofValue}>{blockchainProof.certificateDetails.issuingInstitution}</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Issue Date</Text>
                    <Text style={styles.proofValue}>
                      {new Date(blockchainProof.certificateDetails.issueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Validity</Text>
                    <Text style={[styles.proofValue, { color: COLORS.success }]}>Authentic ✓</Text>
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
  scoreBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.success + '15', borderRadius: RADIUS.md,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.success + '30',
  },
  scoreText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.success },
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