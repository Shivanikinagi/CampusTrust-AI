import { Platform, StyleSheet, ScrollView, TouchableOpacity, View, Text, TextInput, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';
import { submitGrantProposal, claimMilestonePayment, EXPLORER_BASE } from '@/services/algorandService';
import InfoModal from '@/components/InfoModal';
import { useInfoModal } from '@/hooks/useInfoModal';

export default function GrantsScreen() {
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const { isDemoMode, address } = useWallet();
  const [showProofModal, setShowProofModal] = useState(false);
  const [blockchainProof, setBlockchainProof] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { modalState, hideModal, showInfo, showError, showWarning, showSuccess } = useInfoModal();

  // Live proposal status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [proposalStages, setProposalStages] = useState([
    { label: 'Submitting to Blockchain', icon: 'cloud-upload' as const, status: 'pending' as string },
    { label: 'AI Evaluating Proposal', icon: 'sparkles' as const, status: 'pending' as string },
    { label: 'Committee Review', icon: 'people' as const, status: 'pending' as string },
    { label: 'Grant Approved', icon: 'checkmark-circle' as const, status: 'pending' as string },
    { label: 'Funds Allocated', icon: 'wallet' as const, status: 'pending' as string },
  ]);
  const [proposalApproved, setProposalApproved] = useState(false);
  const [approvedProjects, setApprovedProjects] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);

  const handleSubmitGrantProposal = async () => {
    if (!projectTitle.trim()) {
      return;
    }
    if (!address && !isDemoMode) {
      return;
    }

    // Show live status modal
    setProposalStages([
      { label: 'Submitting to Blockchain', icon: 'cloud-upload' as const, status: 'pending' },
      { label: 'AI Evaluating Proposal', icon: 'sparkles' as const, status: 'pending' },
      { label: 'Committee Review', icon: 'people' as const, status: 'pending' },
      { label: 'Grant Approved', icon: 'checkmark-circle' as const, status: 'pending' },
      { label: 'Funds Allocated', icon: 'wallet' as const, status: 'pending' },
    ]);
    setProposalApproved(false);
    setShowStatusModal(true);

    setIsSubmitting(true);
    try {
      // Stage 1: Submitting
      setProposalStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'active' } : s));
      
      const proof = await submitGrantProposal(
        address || 'DEMO',
        {
          title: projectTitle,
          description: description,
          budget: parseFloat(budget) || 0,
        }
      );
      setBlockchainProof(proof);
      setProposalStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'done' } : s));

      // Stage 2: AI Evaluation
      setProposalStages(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'active' } : s));
      await new Promise(r => setTimeout(r, 2000));
      setProposalStages(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'done' } : s));

      // Stage 3: Committee Review
      setProposalStages(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'active' } : s));
      await new Promise(r => setTimeout(r, 2500));
      setProposalStages(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'done' } : s));

      // Stage 4: Approved
      setProposalStages(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'active' } : s));
      await new Promise(r => setTimeout(r, 1500));
      setProposalStages(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'done' } : s));

      // Stage 5: Funds Allocated
      setProposalStages(prev => prev.map((s, i) => i === 4 ? { ...s, status: 'active' } : s));
      await new Promise(r => setTimeout(r, 1500));
      setProposalStages(prev => prev.map((s, i) => i === 4 ? { ...s, status: 'done' } : s));

      setProposalApproved(true);

      // Add to approved projects list
      const aiScore = Math.floor(75 + Math.random() * 20);
      setApprovedProjects(prev => [{
        id: prev.length + 2,
        title: projectTitle,
        budget: parseFloat(budget) || 500,
        aiScore,
        txId: proof.txId,
        explorerUrl: proof.explorerUrl,
        milestones: [
          { title: 'Proposal', amount: Math.round((parseFloat(budget) || 500) * 0.25), status: 'completed' },
          { title: 'Prototype', amount: Math.round((parseFloat(budget) || 500) * 0.5), status: 'in_progress' },
          { title: 'Final', amount: Math.round((parseFloat(budget) || 500) * 0.25), status: 'locked' },
        ],
      }, ...prev]);

      // Reset form
      setProjectTitle('');
      setDescription('');
      setBudget('');
    } catch (error) {
      console.error('Error submitting grant proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimMilestonePayment = async (pTitle: string, milestoneTitle: string, amount: number) => {
    if (!address && !isDemoMode) {
      return;
    }

    setIsSubmitting(true);
    try {
      const projectId = pTitle.replace(/\s+/g, '_').toUpperCase();
      const milestoneIndex = milestoneTitle === 'Prototype' ? 1 : 0;
      
      const proof = await claimMilestonePayment(
        address || 'DEMO',
        projectId,
        milestoneIndex,
        amount
      );
      setBlockchainProof(proof);
      setClaimedAmount(amount);
      setWalletBalance(prev => prev + amount);
      setShowClaimSuccess(true);

      // Update milestone status in approved projects
      setApprovedProjects(prev => prev.map(p => {
        if (p.title === pTitle) {
          return {
            ...p,
            milestones: p.milestones.map((m: any) => 
              m.title === milestoneTitle ? { ...m, status: 'completed' } : m
            ),
          };
        }
        return p;
      }));

      setShowProofModal(true);
    } catch (error) {
      console.error('Error claiming milestone payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const projects = [
    {
      id: 1,
      title: 'IoT Smart Campus System',
      budget: 500,
      aiScore: 92,
      milestones: [
        { title: 'Proposal', amount: 125, status: 'completed' },
        { title: 'Prototype', amount: 250, status: 'in_progress' },
        { title: 'Final', amount: 125, status: 'locked' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in_progress': return COLORS.primary;
      default: return COLORS.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '✓ Paid';
      case 'in_progress': return 'In Progress';
      default: return 'Locked';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Smart Grants</Text>
          <Text style={styles.subtitle}>AI-powered project funding</Text>
        </View>

        {/* Apply for Grant */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apply for Grant</Text>

          <Text style={styles.label}>Project Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project title"
            placeholderTextColor={COLORS.textMuted}
            value={projectTitle}
            onChangeText={setProjectTitle}
          />

          <Text style={styles.label}>Budget (ALGO)</Text>
          <TextInput
            style={styles.input}
            placeholder="500"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your project..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitGrantProposal}
            disabled={isSubmitting}>
            <Ionicons name="sparkles" size={20} color={COLORS.bgDark} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Grant Proposal'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              AI will evaluate your proposal. Score ≥70 gets auto-approved!
            </Text>
          </View>
        </View>

        {/* My Projects */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Projects</Text>
          {walletBalance > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet" size={16} color={COLORS.success} />
              <Text style={{ fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.success }}>{walletBalance} ALGO</Text>
            </View>
          )}
        </View>

        {/* User-submitted approved projects */}
        {approvedProjects.map((project) => (
          <View key={'approved-' + project.id} style={[styles.projectCard, { borderLeftWidth: 3, borderLeftColor: COLORS.success }]}>
            <View style={styles.projectHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectBudget}>{project.budget} ALGO</Text>
              </View>
              <View style={styles.aiScoreBadge}>
                <Text style={styles.aiScoreLabel}>AI</Text>
                <Text style={styles.aiScoreValue}>{project.aiScore}</Text>
              </View>
            </View>

            {project.txId && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md }}
                onPress={() => Linking.openURL(project.explorerUrl)}>
                <Ionicons name="link" size={12} color={COLORS.primary} />
                <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                  TX: {project.txId.substring(0, 16)}...
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.milestonesContainer}>
              <Text style={styles.milestonesTitle}>Milestones & Funding</Text>
              {project.milestones.map((milestone: any, idx: number) => (
                <View key={idx} style={styles.milestoneRow}>
                  <View style={styles.milestoneInfo}>
                    <View style={[styles.milestoneIndicator, { backgroundColor: getStatusColor(milestone.status) }]} />
                    <View>
                      <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                      <Text style={styles.milestoneAmount}>{milestone.amount} ALGO</Text>
                    </View>
                  </View>
                  <Text style={[styles.milestoneStatus, { color: getStatusColor(milestone.status) }]}>
                    {getStatusLabel(milestone.status)}
                  </Text>
                </View>
              ))}

              {project.milestones.some((m: any) => m.status === 'in_progress') && (
                <TouchableOpacity 
                  style={styles.claimButton}
                  onPress={() => {
                    const inProgress = project.milestones.find((m: any) => m.status === 'in_progress');
                    if (inProgress) handleClaimMilestonePayment(project.title, inProgress.title, inProgress.amount);
                  }}
                  disabled={isSubmitting}>
                  <Ionicons name="download" size={16} color={COLORS.bgDark} />
                  <Text style={styles.claimButtonText}>
                    {isSubmitting ? 'Claiming...' : `Claim ${project.milestones.find((m: any) => m.status === 'in_progress')?.amount || 0} ALGO`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {projects.map((project) => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectBudget}>{project.budget} ALGO</Text>
              </View>
              <View style={styles.aiScoreBadge}>
                <Text style={styles.aiScoreLabel}>AI</Text>
                <Text style={styles.aiScoreValue}>{project.aiScore}</Text>
              </View>
            </View>

            <View style={styles.milestonesContainer}>
              <Text style={styles.milestonesTitle}>Milestones & Funding</Text>
              {project.milestones.map((milestone, idx) => (
                <View key={idx} style={styles.milestoneRow}>
                  <View style={styles.milestoneInfo}>
                    <View style={[styles.milestoneIndicator, { backgroundColor: getStatusColor(milestone.status) }]} />
                    <View>
                      <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                      <Text style={styles.milestoneAmount}>{milestone.amount} ALGO</Text>
                    </View>
                  </View>
                  <Text style={[styles.milestoneStatus, { color: getStatusColor(milestone.status) }]}>
                    {getStatusLabel(milestone.status)}
                  </Text>
                </View>
              ))}

              {project.milestones[1].status === 'in_progress' && (
                <TouchableOpacity 
                  style={styles.claimButton}
                  onPress={() => handleClaimMilestonePayment(project.title, 'Prototype', 250)}
                  disabled={isSubmitting}>
                  <Ionicons name="download" size={16} color={COLORS.bgDark} />
                  <Text style={styles.claimButtonText}>
                    {isSubmitting ? 'Claiming...' : 'Claim Payment'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* How It Works */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          {[
            'Submit proposal for AI evaluation',
            'AI checks feasibility & budget',
            'Complete milestones to unlock funds',
            'Smart contract releases payment automatically',
          ].map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Live Proposal Status Modal */}
      <Modal visible={showStatusModal} animationType="slide" transparent>
        <View style={styles.proofOverlay}>
          <View style={styles.proofContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.proofHeader}>
                <View style={styles.successIconContainer}>
                  <Ionicons 
                    name={proposalApproved ? 'checkmark-circle' : 'hourglass'} 
                    size={48} 
                    color={proposalApproved ? COLORS.success : COLORS.primary} 
                  />
                </View>
                <Text style={styles.proofTitle}>
                  {proposalApproved ? 'Grant Approved!' : 'Processing Proposal...'}
                </Text>
                <Text style={styles.proofSubtitle}>
                  {proposalApproved ? 'Your grant has been approved and funds allocated' : 'Live status of your grant proposal'}
                </Text>
              </View>

              {proposalStages.map((stage, idx) => (
                <View key={idx} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.md,
                  backgroundColor: COLORS.bgDark,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.lg,
                  marginBottom: SPACING.sm,
                  borderWidth: 1,
                  borderColor: stage.status === 'done' ? COLORS.success + '40' :
                    stage.status === 'active' ? COLORS.primary + '40' : COLORS.borderDark,
                }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: stage.status === 'done' ? COLORS.success + '20' :
                      stage.status === 'active' ? COLORS.primary + '20' : COLORS.surfaceDark,
                    alignItems: 'center' as const, justifyContent: 'center' as const,
                  }}>
                    <Ionicons
                      name={stage.status === 'done' ? 'checkmark-circle' : stage.icon}
                      size={22}
                      color={stage.status === 'done' ? COLORS.success :
                        stage.status === 'active' ? COLORS.primary : COLORS.textMuted}
                    />
                  </View>
                  <Text style={{
                    flex: 1,
                    fontSize: FONT_SIZES.md,
                    fontWeight: stage.status === 'active' ? '700' : '500',
                    color: stage.status === 'done' ? COLORS.success :
                      stage.status === 'active' ? COLORS.primary : COLORS.textMuted,
                  }}>
                    {stage.label}
                  </Text>
                  {stage.status === 'active' && (
                    <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.primary }}>Processing...</Text>
                  )}
                  {stage.status === 'done' && (
                    <Ionicons name="checkmark" size={18} color={COLORS.success} />
                  )}
                </View>
              ))}

              {proposalApproved && blockchainProof && (
                <View style={{ marginTop: SPACING.lg }}>
                  <View style={{
                    backgroundColor: COLORS.success + '15',
                    borderRadius: RADIUS.xl,
                    padding: SPACING.xl,
                    alignItems: 'center' as const,
                    borderWidth: 1,
                    borderColor: COLORS.success + '30',
                    marginBottom: SPACING.lg,
                  }}>
                    <Ionicons name="ribbon" size={32} color={COLORS.success} />
                    <Text style={{ fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.success, marginTop: SPACING.sm }}>
                      Grant Funded Successfully
                    </Text>
                    <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 }}>
                      Funds are now available for milestone claims
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{ backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' as const, flexDirection: 'row', justifyContent: 'center' as const, gap: SPACING.sm }}
                    onPress={() => Linking.openURL(blockchainProof.explorerUrl)}>
                    <Ionicons name="open-outline" size={18} color={COLORS.primary} />
                    <Text style={{ fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.primary }}>View on Explorer</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>

            {proposalApproved && (
              <TouchableOpacity
                style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center' as const, marginTop: SPACING.md }}
                onPress={() => setShowStatusModal(false)}>
                <Text style={{ fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.bgDark }}>View My Projects</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Claim Success Modal */}
      <Modal visible={showClaimSuccess} animationType="fade" transparent>
        <View style={styles.proofOverlay}>
          <View style={[styles.proofContent, { alignItems: 'center' as const }]}>
            <Ionicons name="wallet" size={64} color={COLORS.success} />
            <Text style={{ fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.success, marginTop: SPACING.lg }}>
              +{claimedAmount} ALGO
            </Text>
            <Text style={{ fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' }}>
              Payment claimed successfully!{'\n'}Added to your wallet balance.
            </Text>
            <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: SPACING.md }}>
              New Balance: {walletBalance} ALGO
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: COLORS.success, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxxl, marginTop: SPACING.xl }}
              onPress={() => setShowClaimSuccess(false)}>
              <Text style={{ fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.bgDark }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                  {blockchainProof?.action || 'Transaction recorded on Algorand'}
                </Text>
              </View>

              {/* Demo Mode Indicator */}
              {isDemoMode && (
                <View style={styles.demoModeBanner}>
                  <Ionicons name="flask" size={16} color={COLORS.warning} />
                  <Text style={styles.demoModeText}>Demo Mode - Simulated Transaction</Text>
                </View>
              )}

              {/* Grant/Milestone Details */}
              <View style={styles.proofSection}>
                <Text style={styles.proofSectionTitle}>
                  {blockchainProof?.proposalTitle ? 'Proposal Details' : 'Payment Details'}
                </Text>
                <View style={styles.proofField}>
                  <Text style={styles.proofLabel}>Project</Text>
                  <Text style={styles.proofValue}>
                    {blockchainProof?.proposalTitle || blockchainProof?.projectTitle || 'N/A'}
                  </Text>
                </View>
                {blockchainProof?.requestedAmount && (
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Budget Requested</Text>
                    <Text style={styles.proofValue}>{blockchainProof.requestedAmount} ALGO</Text>
                  </View>
                )}
                {blockchainProof?.milestone && (
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Milestone</Text>
                    <Text style={styles.proofValue}>{blockchainProof.milestone}</Text>
                  </View>
                )}
                {blockchainProof?.paymentAmount && (
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Payment Amount</Text>
                    <Text style={styles.proofValue}>{blockchainProof.paymentAmount} ALGO</Text>
                  </View>
                )}
              </View>

              {/* AI Evaluation */}
              {blockchainProof?.aiEvaluation && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>AI Evaluation</Text>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>AI Score</Text>
                    <View style={styles.aiScoreBadge}>
                      <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                      <Text style={styles.aiScoreText}>{blockchainProof.aiEvaluation.score}/100</Text>
                    </View>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Status</Text>
                    <Text style={[
                      styles.proofValue,
                      { color: blockchainProof.aiEvaluation.status === 'approved' ? COLORS.success : COLORS.warning }
                    ]}>
                      {blockchainProof.aiEvaluation.status === 'approved' ? 'Auto-Approved ✓' : 'Needs Review'}
                    </Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Analysis</Text>
                    <Text style={styles.proofValue}>{blockchainProof.aiEvaluation.analysis}</Text>
                  </View>
                </View>
              )}

              {/* Disbursement Status */}
              {blockchainProof?.disbursementStatus && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>Disbursement Status</Text>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Payment Status</Text>
                    <Text style={[styles.proofValue, { color: COLORS.success }]}>Transferred to Wallet</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Recipient</Text>
                    <Text style={styles.proofValueMono} numberOfLines={1}>
                      {blockchainProof.disbursementStatus.recipientAddress}
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
  },

  // Header
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Card
  card: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  infoText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },

  // Section
  sectionHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Project Card
  projectCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  projectTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  projectBudget: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aiScoreBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
  },
  aiScoreLabel: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  aiScoreValue: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },

  // Milestones
  milestonesContainer: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  milestonesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  milestoneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestoneTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  milestoneAmount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  milestoneStatus: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  claimButtonText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },

  // How It Works
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    flex: 1,
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
  aiScoreText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.primary },
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
