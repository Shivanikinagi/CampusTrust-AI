import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, TextInput, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import * as algorandService from '@/services/algorandService';
import InfoModal from '@/components/InfoModal';
import { useInfoModal } from '@/hooks/useInfoModal';

type TabKey = 'my' | 'issue';

const CREDENTIALS = [
  {
    title: 'Bachelor of Science in Artificial Intelligence',
    issuer: 'Massachusetts Institute of Tech',
    issued: 'May 20, 2024',
    honors: 'Summa Cum Laude',
    verification: 100,
    verifiedLabel: '100% VERIFIED BY AI',
    verifiedColor: COLORS.success,
    secured: true,
    icon: 'school',
    ringColor: '#F59E0B',
  },
  {
    title: "Dean's List Award - Fall 2023",
    issuer: 'Faculty of Engineering',
    issued: 'Dec 15, 2023',
    honors: '',
    verification: 99,
    verifiedLabel: '99% VERIFIED',
    verifiedColor: COLORS.primary,
    secured: false,
    icon: 'trophy',
    ringColor: COLORS.primary,
  },
  {
    title: 'AWS Cloud Practitioner Certification',
    issuer: 'Amazon Web Services',
    issued: 'Sep 04, 2023',
    honors: '',
    verification: 100,
    verifiedLabel: '100% VERIFIED',
    verifiedColor: COLORS.success,
    secured: true,
    icon: 'cloud',
    ringColor: '#A855F7',
  },
];

export default function CredentialsScreen() {
  const { address, isConnected, isDemoMode } = useWallet();
  const [activeTab, setActiveTab] = useState<TabKey>('my');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  
  // Issue Credential Form States
  const [credentialType, setCredentialType] = useState('Degree');
  const [credentialTitle, setCredentialTitle] = useState('');
  const [credentialIssuer, setCredentialIssuer] = useState('');
  const [credentialDescription, setCredentialDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIssueProofModal, setShowIssueProofModal] = useState(false);
  const [issueProof, setIssueProof] = useState<any>(null);
  const { modalState, hideModal, showInfo, showError, showWarning, showSuccess } = useInfoModal();

  const formatAddress = (addr: string) => {
    if (!addr) return 'ALG0...7X92';
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  const handleVerifyCredential = async (credential: any) => {
    setSelectedCredential(credential);
    setVerifying(true);
    setShowVerifyModal(true);

    try {
      const result = await algorandService.verifyCredentialOnChain(
        `CRED-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        credential.issuer
      );
      setVerificationResult(result);
    } catch (error: any) {
      showError('Verification Failed', error.message || 'Unable to verify credential on blockchain.');
      setShowVerifyModal(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleIssueCredential = async () => {
    if (!credentialTitle || !credentialIssuer) {
      showWarning('Missing Information', 'Please fill in the credential title and issuer.');
      return;
    }

    if (!address && !isDemoMode) {
      showWarning('Wallet Required', 'Please connect your wallet to issue credentials.');
      return;
    }

    setIsSubmitting(true);
    try {
      const proof = await algorandService.issueCredentialOnChain(
        address || 'DEMO',
        {
          type: credentialType,
          title: credentialTitle,
          issuer: credentialIssuer,
          description: credentialDescription,
        }
      );
      setIssueProof(proof);
      setShowIssueProofModal(true);
      
      // Reset form
      setCredentialTitle('');
      setCredentialIssuer('');
      setCredentialDescription('');
    } catch (error: any) {
      showError('Issue Failed', error.message || 'Failed to issue credential on blockchain.');
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
          <View>
            <Text style={styles.pageTitle}>CampusTrust AI</Text>
            <View style={styles.addressRow}>
              <View style={styles.addressDot} />
              <Text style={styles.addressText}>{isConnected ? formatAddress(address!) : 'ALG0...7X92'}</Text>
              <TouchableOpacity onPress={() => showSuccess('Address Copied', isConnected ? address! : 'No wallet connected.')}>
                <Ionicons name="copy-outline" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={22} color={COLORS.primary} />
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.tabActive]}
            onPress={() => setActiveTab('my')}>
            <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>My Credentials</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'issue' && styles.tabActive]}
            onPress={() => setActiveTab('issue')}>
            <Text style={[styles.tabText, activeTab === 'issue' && styles.tabTextActive]}>Issue New</Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your Academic Identity</Text>
            <Text style={styles.sectionSubtitle}>{CREDENTIALS.length} Verified Credentials Found</Text>
          </View>
          <TouchableOpacity onPress={() => showInfo('Filter Credentials', 'Showing all credentials. Category filters coming soon.')}>
            <Ionicons name="filter" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {activeTab === 'my' ? (
          <>
            {/* Credential Cards */}
            {CREDENTIALS.map((cred, index) => (
              <View key={index} style={styles.credentialCard}>
                {/* Badge Icon */}
                <View style={styles.cardTopRow}>
                  <View style={styles.credBadgeContainer}>
                    <View style={[styles.credBadgeRing, { borderColor: cred.ringColor }]}>
                      <View style={[styles.credBadgeInner, { backgroundColor: cred.ringColor + '20' }]}>
                        <Ionicons name={cred.icon as any} size={22} color={cred.ringColor} />
                      </View>
                    </View>
                  </View>
                  <View style={[styles.verifiedBadge, { backgroundColor: cred.verifiedColor + '15', borderColor: cred.verifiedColor + '30' }]}>
                    <Ionicons name="checkmark-circle" size={12} color={cred.verifiedColor} />
                    <Text style={[styles.verifiedText, { color: cred.verifiedColor }]}>{cred.verifiedLabel}</Text>
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.credTitle}>{cred.title}</Text>
                <Text style={styles.credIssuer}>Issued by {cred.issuer}</Text>
                <View style={styles.credDetails}>
                  <Text style={styles.credDate}>Issued: {cred.issued}</Text>
                  {cred.honors !== '' && (
                    <>
                      <Text style={styles.credDot}>•</Text>
                      <Text style={styles.credHonors}>{cred.honors}</Text>
                    </>
                  )}
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  {cred.secured && (
                    <View style={styles.securedChip}>
                      <Ionicons name="shield-checkmark" size={12} color={COLORS.textMuted} />
                      <Text style={styles.securedText}>SECURED ON CHAIN</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => handleVerifyCredential(cred)}>
                    <Text style={styles.verifyButtonText}>Verify on Blockchain</Text>
                    <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.issueSection}>
            <View style={styles.issueCard}>
              <View style={styles.issueIconWrap}>
                <Ionicons name="add-circle" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.issueTitle}>Issue New Credential</Text>
              <Text style={styles.issueSubtitle}>Submit credential details to be recorded on blockchain</Text>

              <Text style={styles.issueLabel}>Credential Type</Text>
              <View style={styles.issueTypeRow}>
                {['Degree', 'Certificate', 'Award', 'Course'].map((type) => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.issueTypeChip, credentialType === type && styles.issueTypeChipActive]}
                    onPress={() => setCredentialType(type)}>
                    <Text style={[styles.issueTypeText, credentialType === type && styles.issueTypeTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.issueLabel}>Credential Title *</Text>
              <TextInput
                style={styles.issueInput}
                placeholder="e.g., Bachelor of Computer Science"
                placeholderTextColor={COLORS.textMuted}
                value={credentialTitle}
                onChangeText={setCredentialTitle}
              />

              <Text style={styles.issueLabel}>Issuing Institution *</Text>
              <TextInput
                style={styles.issueInput}
                placeholder="e.g., VIT University"
                placeholderTextColor={COLORS.textMuted}
                value={credentialIssuer}
                onChangeText={setCredentialIssuer}
              />

              <Text style={styles.issueLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.issueInput, styles.issueInputMultiline]}
                placeholder="Additional details about the credential..."
                placeholderTextColor={COLORS.textMuted}
                value={credentialDescription}
                onChangeText={setCredentialDescription}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity 
                style={[styles.issueButton, isSubmitting && styles.issueButtonDisabled]}
                disabled={isSubmitting}
                onPress={handleIssueCredential}>
                <Ionicons name="shield-checkmark" size={18} color={COLORS.bgDark} />
                <Text style={styles.issueButtonText}>
                  {isSubmitting ? 'Submitting to Blockchain...' : 'Issue on Blockchain'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Verification Modal */}
      <Modal visible={showVerifyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            {verifying ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingIconWrap}>
                  <Ionicons name="shield-checkmark" size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.loadingTitle}>Verifying Credential</Text>
                <Text style={styles.loadingSubtitle}>Checking blockchain records...</Text>
              </View>
            ) : verificationResult ? (
              <>
                <View style={styles.verifyHeader}>
                  <View style={[styles.verifyIcon, { backgroundColor: COLORS.success + '20' }]}>
                    <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                  </View>
                  <Text style={styles.verifyTitle}>Credential Verified!</Text>
                  <Text style={styles.verifySubtitle}>Blockchain proof confirmed</Text>
                </View>

                <ScrollView style={styles.verifyScroll} showsVerticalScrollIndicator={false}>
                  {selectedCredential && (
                    <View style={styles.verifySection}>
                      <Text style={styles.verifySectionTitle}>CREDENTIAL INFO</Text>
                      <View style={styles.verifyRow}>
                        <Text style={styles.verifyLabel}>Title:</Text>
                        <Text style={styles.verifyValue}>{selectedCredential.title}</Text>
                      </View>
                      <View style={styles.verifyRow}>
                        <Text style={styles.verifyLabel}>Issuer:</Text>
                        <Text style={styles.verifyValue}>{verificationResult.issuer}</Text>
                      </View>
                      <View style={styles.verifyRow}>
                        <Text style={styles.verifyLabel}>Issued Date:</Text>
                        <Text style={styles.verifyValue}>{verificationResult.issuedDate}</Text>
                      </View>
                      <View style={styles.verifyRow}>
                        <Text style={styles.verifyLabel}>Expiry Date:</Text>
                        <Text style={styles.verifyValue}>{verificationResult.expiryDate}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.verifySection}>
                    <Text style={styles.verifySectionTitle}>BLOCKCHAIN RECORD</Text>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Network:</Text>
                      <Text style={styles.verifyValue}>{verificationResult.blockchainRecord.network}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Asset ID:</Text>
                      <Text style={styles.verifyValue}>{verificationResult.blockchainRecord.assetId}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Block Round:</Text>
                      <Text style={styles.verifyValue}>{verificationResult.blockchainRecord.confirmedRound?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Transaction ID:</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(verificationResult.blockchainRecord.explorerUrl)}>
                        <Text style={styles.verifyValueLink}>{verificationResult.blockchainRecord.txId?.substring(0, 16)}...</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.verifySection}>
                    <Text style={styles.verifySectionTitle}>HASH VERIFICATION</Text>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Algorithm:</Text>
                      <Text style={styles.verifyValue}>{verificationResult.hashVerification.algorithm}</Text>
                    </View>
                    <View style={styles.hashBox}>
                      <Text style={styles.hashLabel}>Document Hash:</Text>
                      <Text style={styles.hashValue}>{verificationResult.hashVerification.documentHash}</Text>
                    </View>
                    <View style={styles.hashMatchBadge}>
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                      <Text style={styles.hashMatchText}>{verificationResult.hashVerification.onChainHash}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.explorerButton}
                    onPress={() => Linking.openURL(verificationResult.blockchainRecord.explorerUrl)}>
                    <Ionicons name="open-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.explorerButtonText}>View on Algorand Explorer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.explorerButton, { marginTop: 8, backgroundColor: COLORS.surfaceCard }]}
                    onPress={() => Linking.openURL('https://testnet.explorer.perawallet.app/address/DM3C5EZCEA6JFB7BCBTECUQ7JU7UQ3WQA4PEVUU4ERUVLDWNGO6GTR7GNU/')}>
                    <Ionicons name="wallet-outline" size={18} color={COLORS.success} />
                    <Text style={[styles.explorerButtonText, { color: COLORS.success }]}>View All Wallet Transactions</Text>
                  </TouchableOpacity>

                  {isDemoMode && (
                    <View style={styles.demoWarningBox}>
                      <Ionicons name="information-circle" size={16} color="#F59E0B" />
                      <Text style={styles.demoWarningBoxText}>
                        Demo mode: This is simulated blockchain data
                      </Text>
                    </View>
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowVerifyModal(false);
                    setVerificationResult(null);
                    setSelectedCredential(null);
                  }}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Issue Credential Proof Modal */}
      <Modal visible={showIssueProofModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.verifyHeader}>
              <View style={[styles.verifyIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
              </View>
              <Text style={styles.verifyTitle}>Credential Issued!</Text>
              <Text style={styles.verifySubtitle}>Successfully recorded on blockchain</Text>
            </View>

            <ScrollView style={styles.verifyScroll} showsVerticalScrollIndicator={false}>
              {issueProof && (
                <>
                  <View style={styles.verifySection}>
                    <Text style={styles.verifySectionTitle}>CREDENTIAL DETAILS</Text>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Credential ID:</Text>
                      <Text style={styles.verifyValue}>{issueProof.credentialId}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Type:</Text>
                      <Text style={styles.verifyValue}>{issueProof.details.credentialType}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Title:</Text>
                      <Text style={styles.verifyValue}>{issueProof.details.title}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Issuer:</Text>
                      <Text style={styles.verifyValue}>{issueProof.details.issuer}</Text>
                    </View>
                  </View>

                  <View style={styles.verifySection}>
                    <Text style={styles.verifySectionTitle}>BLOCKCHAIN RECORD</Text>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Network:</Text>
                      <Text style={styles.verifyValue}>{issueProof.network}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Asset ID:</Text>
                      <Text style={styles.verifyValue}>{issueProof.details.assetId}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Block Round:</Text>
                      <Text style={styles.verifyValue}>{issueProof.confirmedRound?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.verifyRow}>
                      <Text style={styles.verifyLabel}>Transaction ID:</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(issueProof.explorerUrl)}>
                        <Text style={styles.verifyValueLink}>{issueProof.txId?.substring(0, 16)}...</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.explorerButton}
                    onPress={() => Linking.openURL(issueProof.explorerUrl)}>
                    <Ionicons name="open-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.explorerButtonText}>View on Algorand Explorer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.explorerButton, { marginTop: 8, backgroundColor: COLORS.surfaceCard }]}
                    onPress={() => Linking.openURL('https://testnet.explorer.perawallet.app/address/DM3C5EZCEA6JFB7BCBTECUQ7JU7UQ3WQA4PEVUU4ERUVLDWNGO6GTR7GNU/')}>
                    <Ionicons name="wallet-outline" size={18} color={COLORS.success} />
                    <Text style={[styles.explorerButtonText, { color: COLORS.success }]}>View All Wallet Transactions</Text>
                  </TouchableOpacity>

                  {isDemoMode && (
                    <View style={styles.demoWarningBox}>
                      <Ionicons name="information-circle" size={16} color="#F59E0B" />
                      <Text style={styles.demoWarningBoxText}>
                        Demo mode: This is simulated blockchain data
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowIssueProofModal(false);
                setIssueProof(null);
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Styled InfoModal replacing Alert.alert */}
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
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  addressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  addressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },

  // Credential Cards
  credentialCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  credBadgeContainer: {},
  credBadgeRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  credBadgeInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  verifiedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  credTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  credIssuer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  credDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  credDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  credDot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  credHonors: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: SPACING.lg,
  },
  securedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  verifyButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },

  // Issue New Tab
  issueSection: { marginTop: SPACING.md },
  issueCard: {
    backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.xxl, padding: SPACING.xxl,
    borderWidth: 1, borderColor: COLORS.borderDark, alignItems: 'center',
  },
  issueIconWrap: { marginBottom: SPACING.lg },
  issueTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  issueSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xxl },
  issueLabel: {
    fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary,
    alignSelf: 'flex-start', marginBottom: SPACING.md,
  },
  issueTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xxl, width: '100%' },
  issueTypeChip: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '15', borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  issueTypeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  issueTypeText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  issueTypeTextActive: {
    color: COLORS.bgDark,
  },
  issueInput: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginBottom: SPACING.lg,
  },
  issueInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  issueButton: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, width: '100%',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  issueButtonDisabled: {
    opacity: 0.6,
  },
  issueButtonText: { color: COLORS.bgDark, fontSize: FONT_SIZES.lg, fontWeight: '700' },

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

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  loadingIconWrap: {
    marginBottom: SPACING.lg,
  },
  loadingTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  loadingSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },

  // Verification Result
  verifyHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  verifyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  verifyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  verifySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  verifyScroll: {
    maxHeight: 450,
  },
  verifySection: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  verifySectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  verifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  verifyLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  verifyValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  verifyValueLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  hashBox: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  hashLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  hashValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  hashMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  hashMatchText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '700',
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
  demoWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#F59E0B' + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F59E0B' + '30',
  },
  demoWarningBoxText: {
    fontSize: FONT_SIZES.xs,
    color: '#F59E0B',
    flex: 1,
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
