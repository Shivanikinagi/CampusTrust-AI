import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Alert, Modal, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';
import * as algorandService from '@/services/algorandService';
import BlockchainProof from '@/components/BlockchainProof';

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
  const { address, isConnected, isDemoMode } = useWallet();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentProof, setCurrentProof] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState('Event Approval');
  const [requestDetails, setRequestDetails] = useState('');

  const handleSubmitRequest = async () => {
    if (!isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet first to submit permission requests.');
      return;
    }
    
    if (!requestTitle.trim() || !requestDetails.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const proof = await algorandService.submitPermissionRequest(address, requestType, {
        title: requestTitle,
        description: requestDetails,
        timestamp: new Date().toISOString(),
      });

      setShowRequestModal(false);
      setCurrentProof(proof);
      setShowProofModal(true);
      
      // Reset form
      setRequestTitle('');
      setRequestDetails('');
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message || 'Failed to submit permission request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const viewBlockchainProof = (txId: string) => {
    if (!txId || txId === '') {
      Alert.alert('No Blockchain Proof', 'This request is still being processed.');
      return;
    }
    
    const url = `${algorandService.EXPLORER_BASE}/tx/${txId}`;
    Linking.openURL(url);
  };

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
          <TouchableOpacity onPress={() => Alert.alert('Filter Requests', 'Select filter:', [
            { text: 'All Requests', style: 'default' },
            { text: 'Pending Only', style: 'default' },
            { text: 'Approved Only', style: 'default' },
            { text: 'Rejected Only', style: 'default' },
            { text: 'Cancel', style: 'cancel' },
          ])}>
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
            <TouchableOpacity onPress={() => Alert.alert('Request Options', `${REQUESTS[0].id} — ${REQUESTS[0].title}`, [
              { text: 'Withdraw Request', style: 'destructive', onPress: () => Alert.alert('Withdrawn', 'Request has been withdrawn.') },
              { text: 'Send Reminder', onPress: () => Alert.alert('Reminder Sent', `A reminder has been sent to ${REQUESTS[0].waiting}.`) },
              { text: 'Cancel', style: 'cancel' },
            ])}>
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
            <TouchableOpacity onPress={() => viewBlockchainProof(REQUESTS[0].txn)}>
              <Text style={styles.viewDetailsText}>Blockchain Proof</Text>
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
        <TouchableOpacity 
          style={[styles.ctaButton, !isConnected && styles.ctaButtonDisabled]}
          onPress={() => {
            if (!isConnected) {
              Alert.alert('Wallet Required', 'Please connect your wallet to submit permission requests.');
              return;
            }
            setShowRequestModal(true);
          }}>
          <Ionicons name="add-circle" size={20} color={isConnected ? COLORS.bgDark : COLORS.textMuted} />
          <Text style={[styles.ctaText, !isConnected && styles.ctaTextDisabled]}>
            {isConnected ? 'Request New Permission' : 'Connect Wallet to Request'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Request Modal */}
      <Modal visible={showRequestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Permission Request</Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Request Type</Text>
            <View style={styles.typeSelector}>
              {['Event Approval', 'Budget Request', 'Facility Access', 'Research Grant'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, requestType === type && styles.typeButtonActive]}
                  onPress={() => setRequestType(type)}>
                  <Text style={[styles.typeButtonText, requestType === type && styles.typeButtonTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g., Blockchain Workshop 2025"
              placeholderTextColor={COLORS.textMuted}
              value={requestTitle}
              onChangeText={setRequestTitle}
            />

            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              style={[styles.fieldInput, { minHeight: 100, textAlignVertical: 'top' }]}
              placeholder="Provide details about your request..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={requestDetails}
              onChangeText={setRequestDetails}
            />

            {isDemoMode && (
              <View style={styles.demoWarningBox}>
                <Ionicons name="information-circle" size={16} color="#F59E0B" />
                <Text style={styles.demoWarningBoxText}>
                  Demo mode: Request will be simulated on blockchain
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitRequest}
              disabled={submitting}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.bgDark} />
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting to Blockchain...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Blockchain Proof Modal */}
      <Modal visible={showProofModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.proofHeader}>
              <View style={styles.proofIcon}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
              </View>
              <Text style={styles.proofTitle}>Request Submitted!</Text>
              <Text style={styles.proofSubtitle}>Blockchain Proof Generated</Text>
            </View>

            {currentProof && (
              <ScrollView style={styles.proofScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>REQUEST DETAILS</Text>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Request ID:</Text>
                    <Text style={styles.proofValue}>{currentProof.requestId || 'Generating...'}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Type:</Text>
                    <Text style={styles.proofValue}>{currentProof.details?.type || requestType}</Text>
                  </View>
                </View>

                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>BLOCKCHAIN PROOF</Text>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Transaction ID:</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(currentProof.explorerUrl)}>
                      <Text style={styles.proofValueLink}>{currentProof.txId?.substring(0, 12)}...</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Network:</Text>
                    <Text style={styles.proofValue}>{currentProof.network || 'Algorand TestNet'}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Block Round:</Text>
                    <Text style={styles.proofValue}>{currentProof.confirmedRound?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Timestamp:</Text>
                    <Text style={styles.proofValue}>{new Date(currentProof.timestamp).toLocaleString()}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Fee:</Text>
                    <Text style={styles.proofValue}>{currentProof.fee}</Text>
                  </View>
                </View>

                {currentProof.stages && (
                  <View style={styles.proofSection}>
                    <Text style={styles.proofSectionTitle}>APPROVAL STAGES</Text>
                    {currentProof.stages.map((stage: any, idx: number) => (
                      <View key={idx} style={styles.stageRow}>
                        <View style={[styles.stageRowDot, {
                          backgroundColor: stage.status === 'in_progress' ? COLORS.primary :
                            stage.status === 'completed' ? COLORS.success : COLORS.borderDark
                        }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.stageRowName}>{stage.name}</Text>
                          <Text style={styles.stageRowEta}>ETA: {stage.eta}</Text>
                        </View>
                        <Ionicons  name={stage.status === 'in_progress' ? 'timer' : stage.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                          size={18}
                          color={stage.status === 'in_progress' ? COLORS.primary : stage.status === 'completed' ? COLORS.success : COLORS.textMuted}
                        />
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.explorerButton}
                  onPress={() => Linking.openURL(currentProof.explorerUrl)}>
                  <Ionicons name="open-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.explorerButtonText}>View on Algorand Explorer</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProofModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
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
  ctaButtonDisabled: {
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaTextDisabled: {
    color: COLORS.textMuted,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceDark,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Form
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  fieldInput: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.bgDark,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  demoWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#F59E0B' + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F59E0B' + '30',
  },
  demoWarningBoxText: {
    fontSize: FONT_SIZES.xs,
    color: '#F59E0B',
    flex: 1,
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
  },
  submitButtonText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },

  // Proof Modal
  proofHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  proofIcon: {
    marginBottom: SPACING.md,
  },
  proofTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  proofSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  proofScroll: {
    maxHeight: 400,
  },
  proofSection: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  proofSectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  proofRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  proofLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  proofValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  proofValueLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stageRowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stageRowName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  stageRowEta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    marginVertical: SPACING.lg,
  },
  explorerButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  closeButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
