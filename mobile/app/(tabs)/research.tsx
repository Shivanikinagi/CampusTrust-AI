import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';
import { submitResearchCertification, verifyResearchCertificate } from '@/services/algorandService';
import * as DocumentPicker from 'expo-document-picker';
import InfoModal from '@/components/InfoModal';
import { useInfoModal } from '@/hooks/useInfoModal';

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
  const [showFilePickerModal, setShowFilePickerModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{name: string, size: string} | null>(null);
  const [showAIReviewProgress, setShowAIReviewProgress] = useState(false);
  const [aiReviewStep, setAIReviewStep] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const { modalState, hideModal, showInfo, showWarning } = useInfoModal();

  // AI Analysis results
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    originality: number; methodology: number; techAccuracy: number;
    impact: number; overallScore: number; verdict: string;
    strengths: string[]; improvements: string[];
  } | null>(null);

  const handleFileSelect = (fileName: string, fileSize: string) => {
    setSelectedFile({ name: fileName, size: fileSize });
    setFileSelected(true);
    setPaperTitle(fileName.replace('.pdf', '').replace(/_/g, ' '));
    setShowFilePickerModal(false);
  };

  const handleBrowseDevice = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const sizeInMB = file.size ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown';
        handleFileSelect(file.name, sizeInMB);
      }
    } catch (error) {
      console.error('File picker error:', error);
    }
  };

  const simulateAIReview = () => {
    return new Promise<{ originality: number; methodology: number; techAccuracy: number; impact: number; overallScore: number; verdict: string; strengths: string[]; improvements: string[] }>((resolve) => {
      setShowAIReviewProgress(true);
      setAIReviewStep(0);
      setAiScore(0);

      const originality = Math.floor(Math.random() * 15) + 82;
      const methodology = Math.floor(Math.random() * 15) + 78;
      const techAccuracy = Math.floor(Math.random() * 12) + 85;
      const impact = Math.floor(Math.random() * 15) + 72;
      const overallScore = Math.round((originality + methodology + techAccuracy + impact) / 4);

      setTimeout(() => {
        setAIReviewStep(1);
        setAiScore(25);
        setTimeout(() => {
          setAIReviewStep(2);
          setAiScore(50);
          setTimeout(() => {
            setAIReviewStep(3);
            setAiScore(75);
            setTimeout(() => {
              setAIReviewStep(4);
              setAiScore(100);
              setTimeout(() => {
                setShowAIReviewProgress(false);
                setAIReviewStep(0);
                resolve({
                  originality, methodology, techAccuracy, impact, overallScore,
                  verdict: overallScore >= 80 ? 'CERTIFIED' : 'NEEDS_REVISION',
                  strengths: [
                    'Novel approach to consensus mechanism design',
                    'Comprehensive literature review with 45+ citations',
                    'Strong experimental methodology with reproducible results',
                  ],
                  improvements: [
                    'Consider adding comparison with Proof-of-Stake variants',
                    'Statistical significance tests could strengthen claims',
                  ],
                });
              }, 1000);
            }, 1500);
          }, 2000);
        }, 2000);
      }, 2000);
    });
  };

  const handleSubmitForReview = async () => {
    if (!fileSelected) {
      return;
    }
    if (!address && !isDemoMode) {
      return;
    }

    // Simulate AI review process
    setReviewing(true);
    const analysis = await simulateAIReview();
    setAnalysisResults(analysis);
    setShowAnalysisResults(true);

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
          onPress={() => setShowFilePickerModal(true)}>
          <View style={styles.uploadDashedBorder}>
            <View style={styles.uploadIconWrap}>
              <Ionicons name={fileSelected ? 'document-text' : 'cloud-upload'} size={32} color={fileSelected ? COLORS.success : COLORS.primary} />
            </View>
            <Text style={styles.uploadTitle}>{fileSelected ? 'Paper Selected ✓' : 'Tap to upload Research Paper (PDF)'}</Text>
            <Text style={styles.uploadSubtitle}>{fileSelected ? `${selectedFile?.name} (${selectedFile?.size})` : 'Max size 25MB. Secure encryption enabled.'}</Text>
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
            <TouchableOpacity onPress={() => {
              // Show history - can be enhanced with a modal later
            }}>
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
                    <TouchableOpacity onPress={() => {
                      const explorerUrl = `https://testnet.explorer.perawallet.app/tx/${sub.txHash}`;
                      Linking.openURL(explorerUrl);
                    }}>
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
                  <Text style={styles.proofLabel}>User Fee</Text>
                  <Text style={[styles.proofValue, { color: COLORS.success }]}>{blockchainProof?.fee || '0 ALGO (Gasless)'}</Text>
                </View>
                {blockchainProof?.gasless && (
                  <View style={{ backgroundColor: COLORS.success + '15', borderRadius: 12, padding: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="flash" size={16} color={COLORS.success} />
                    <Text style={{ color: COLORS.success, fontSize: 12, fontWeight: '600', flex: 1 }}>Gasless Atomic Transfer — Sponsor paid {blockchainProof.sponsorFee || '0.002 ALGO'}</Text>
                  </View>
                )}
              </View>

              {/* Explorer Button */}
              {blockchainProof?.explorerUrl && (
                <>
                <TouchableOpacity 
                  style={styles.explorerButton}
                  onPress={() => Linking.openURL(blockchainProof.explorerUrl)}>
                  <Ionicons name="open-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.explorerButtonText}>View on Algorand Explorer</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.explorerButton, { marginTop: 8, backgroundColor: COLORS.surfaceCard }]}
                  onPress={() => Linking.openURL('https://testnet.explorer.perawallet.app/address/DM3C5EZCEA6JFB7BCBTECUQ7JU7UQ3WQA4PEVUU4ERUVLDWNGO6GTR7GNU/')}>
                  <Ionicons name="wallet-outline" size={18} color={COLORS.success} />
                  <Text style={[styles.explorerButtonText, { color: COLORS.success }]}>View All Wallet Transactions</Text>
                </TouchableOpacity>
                </>
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

      {/* File Picker Modal */}
      <Modal visible={showFilePickerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.filePickerModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.filePickerTitle}>Select Research Paper</Text>
            <Text style={styles.filePickerSubtitle}>Choose a file source:</Text>

            <View style={styles.fileSourcesContainer}>
              {[
                { name: 'research_paper_quantum.pdf', size: '4.2 MB', icon: 'document-text' },
                { name: 'neural_architecture_search.pdf', size: '6.8 MB', icon: 'document-text' },
                { name: 'federated_learning_iot.pdf', size: '3.1 MB', icon: 'document-text' },
                { name: 'zero_knowledge_proofs.pdf', size: '5.4 MB', icon: 'document-text' },
              ].map((file, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.fileSourceItem}
                  onPress={() => handleFileSelect(file.name, file.size)}>
                  <Ionicons name={file.icon as any} size={32} color={COLORS.primary} />
                  <View style={styles.fileSourceInfo}>
                    <Text style={styles.fileSourceName}>{file.name}</Text>
                    <Text style={styles.fileSourceSize}>{file.size}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.browseMoreButton}
                onPress={handleBrowseDevice}>
                <Ionicons name="folder-open" size={24} color={COLORS.primary} />
                <Text style={styles.browseMoreText}>Browse Device Files</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowFilePickerModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Review Progress Modal */}
      <Modal visible={showAIReviewProgress} transparent animationType="fade">
        <View style={styles.aiReviewOverlay}>
          <View style={styles.aiReviewCard}>
            <View style={styles.aiReviewIconContainer}>
              <Ionicons name="sparkles" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.aiReviewTitle}>AI Peer Review In Progress</Text>
            
            <View style={styles.aiStepsContainer}>
              {[
                { label: 'Document Analysis', step: 1 },
                { label: 'Originality Check', step: 2 },
                { label: 'Methodology Review', step: 3 },
                { label: 'Final Scoring', step: 4 },
              ].map((item, idx) => (
                <View key={idx} style={styles.aiStepRow}>
                  <Ionicons
                    name={aiReviewStep > item.step ? 'checkmark-circle' : aiReviewStep === item.step ? 'radio-button-on' : 'ellipse-outline'}
                    size={20}
                    color={aiReviewStep >= item.step ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.aiStepText, aiReviewStep >= item.step && styles.aiStepTextActive]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.aiProgressContainer}>
              <View style={styles.aiProgressBar}>
                <View style={[styles.aiProgressFill, { width: `${aiScore}%` }]} />
              </View>
              <Text style={styles.aiProgressText}>{aiScore}% Complete</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Analysis Results Modal */}
      <Modal visible={showAnalysisResults} animationType="slide" transparent>
        <View style={styles.proofOverlay}>
          <View style={styles.proofContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.proofHeader}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="analytics" size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.proofTitle}>AI Analysis Report</Text>
                <Text style={styles.proofSubtitle}>{paperTitle}</Text>
              </View>

              {analysisResults && (
                <>
                  {/* Overall Score */}
                  <View style={[styles.proofSection, { alignItems: 'center' as const }]}>
                    <Text style={{ fontSize: 48, fontWeight: '700', color: analysisResults.overallScore >= 80 ? COLORS.success : '#F59E0B' }}>
                      {analysisResults.overallScore}
                    </Text>
                    <Text style={{ fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: 4 }}>Overall AI Score</Text>
                    <View style={{ backgroundColor: (analysisResults.verdict === 'CERTIFIED' ? COLORS.success : '#F59E0B') + '20', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, marginTop: SPACING.md }}>
                      <Text style={{ color: analysisResults.verdict === 'CERTIFIED' ? COLORS.success : '#F59E0B', fontWeight: '700', fontSize: FONT_SIZES.sm }}>
                        {analysisResults.verdict === 'CERTIFIED' ? '✓ CERTIFIED' : '⏳ NEEDS REVISION'}
                      </Text>
                    </View>
                  </View>

                  {/* Score Breakdown */}
                  <View style={styles.proofSection}>
                    <Text style={styles.proofSectionTitle}>Score Breakdown</Text>
                    {[
                      { label: 'Originality', value: analysisResults.originality, color: COLORS.primary },
                      { label: 'Methodology', value: analysisResults.methodology, color: '#8B5CF6' },
                      { label: 'Technical Accuracy', value: analysisResults.techAccuracy, color: COLORS.success },
                      { label: 'Impact Factor', value: analysisResults.impact, color: '#F59E0B' },
                    ].map((item, idx) => (
                      <View key={idx} style={{ marginBottom: SPACING.md }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.textSecondary }}>{item.label}</Text>
                          <Text style={{ fontSize: FONT_SIZES.sm, fontWeight: '700', color: item.color }}>{item.value}%</Text>
                        </View>
                        <View style={{ height: 8, backgroundColor: COLORS.borderDark, borderRadius: 4, overflow: 'hidden' }}>
                          <View style={{ height: 8, borderRadius: 4, backgroundColor: item.color, width: `${item.value}%` }} />
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Strengths */}
                  <View style={styles.proofSection}>
                    <Text style={styles.proofSectionTitle}>Strengths</Text>
                    {analysisResults.strengths.map((s, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm }}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary }}>{s}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Improvements */}
                  <View style={styles.proofSection}>
                    <Text style={styles.proofSectionTitle}>Suggested Improvements</Text>
                    {analysisResults.improvements.map((s, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm }}>
                        <Ionicons name="bulb" size={16} color="#F59E0B" />
                        <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary }}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', marginTop: SPACING.md }}
              onPress={() => setShowAnalysisResults(false)}>
              <Text style={{ color: COLORS.bgDark, fontSize: FONT_SIZES.md, fontWeight: '700' }}>Continue to Blockchain Proof</Text>
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

      <InfoModal
        visible={modalState.visible}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        actions={modalState.actions}
      />
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

  // File Picker Modal
  filePickerModal: {
    backgroundColor: COLORS.surfaceCard,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    paddingHorizontal: SPACING.xl,
    maxHeight: '80%',
  },
  filePickerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  filePickerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  fileSourcesContainer: {
    marginBottom: SPACING.xl,
  },
  fileSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.bgDark,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  fileSourceInfo: {
    flex: 1,
  },
  fileSourceName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  fileSourceSize: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  browseMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '15',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    marginTop: SPACING.md,
  },
  browseMoreText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.bgDark,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // AI Review Progress Modal
  aiReviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  aiReviewCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  aiReviewIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  aiReviewTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
  },
  aiStepsContainer: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  aiStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  aiStepText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    flex: 1,
  },
  aiStepTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  aiProgressContainer: {
    width: '100%',
  },
  aiProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  aiProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  aiProgressText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textMuted,
    borderRadius: RADIUS.sm,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
});