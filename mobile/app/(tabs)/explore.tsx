import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Linking, TextInput, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import * as algorandService from '@/services/algorandService';
import InfoModal from '@/components/InfoModal';
import { useInfoModal } from '@/hooks/useInfoModal';

export default function ProfileScreen() {
  const { address, balance, isConnected, disconnectWallet, connectWallet, enableDemoMode, isDemoMode } = useWallet();
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [demoMode, setDemoMode] = useState(algorandService.isDemoMode());
  const [walletLoading, setWalletLoading] = useState(false);
  const { modalState, hideModal, showInfo, showError, showSuccess, showWarning } = useInfoModal();

  // Student profile state
  const [profile, setProfile] = useState({
    name: 'Shivani Kinagi',
    department: 'Computer Science & Engineering',
    studentId: 'VIT2024CSE0842',
    email: 'shivani.kinagi@vit.edu',
    enrollmentYear: '2024',
    semester: '4th Semester',
    cgpa: '9.2',
  });

  const [editProfile, setEditProfile] = useState({ ...profile });

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleSaveProfile = () => {
    setProfile({ ...editProfile });
    setShowEditModal(false);
    showSuccess('Profile Updated', 'Your profile has been saved.');
  };

  const handleCreateWallet = async () => {
    setWalletLoading(true);
    try {
      if (demoMode) {
        algorandService.enableDemoMode();
        showInfo('Demo Mode Enabled', 'You are using a simulated wallet. All transactions are simulated and not recorded on the blockchain.');
      }
      await connectWallet();
      setShowWalletModal(false);
      showSuccess('Wallet Created', demoMode ? 'Demo wallet created for testing UI' : 'Your new Algorand wallet has been created.');
    } catch (e: any) {
      showError('Error', e.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const toggleDemoMode = (value: boolean) => {
    setDemoMode(value);
    if (value) {
      algorandService.enableDemoMode();
    } else {
      algorandService.disableDemoMode();
    }
  };

  const handleImportWallet = async () => {
    if (!mnemonicInput.trim()) {
      showError('Error', 'Please enter your 25-word mnemonic phrase');
      return;
    }
    setWalletLoading(true);
    try {
      await connectWallet(mnemonicInput.trim());
      setShowWalletModal(false);
      setMnemonicInput('');
      showSuccess('Wallet Imported', 'Your Algorand wallet has been imported successfully.');
    } catch (e: any) {
      showError('Error', 'Invalid mnemonic. Please check and try again.');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDemoMode = () => {
    enableDemoMode();
    setShowWalletModal(false);
    showSuccess('Demo Mode', 'Demo wallet created! All transactions will be simulated. No real blockchain interaction.');
  };

  const featureMenuItems = [
    { icon: 'shield-checkmark', label: 'Smart Permissions', route: '/permissions', color: COLORS.permissions, desc: 'Manage approvals' },
    { icon: 'trophy', label: 'Skill Badges', route: '/badges', color: '#F59E0B', desc: 'AI-verified portfolio' },
    { icon: 'cash', label: 'Smart Grants', route: '/grants', color: COLORS.grants, desc: 'Project funding' },
    { icon: 'people', label: 'DAO Governance', route: '/governance', color: COLORS.governance, desc: 'Treasury & proposals' },
  ];

  const accountActions = [
    {
      icon: 'notifications',
      label: 'Notifications',
      color: COLORS.primary,
      onPress: () => showInfo('Notifications', 'You have no new notifications.\n\nNotification preferences can be configured here.'),
    },
    {
      icon: 'shield',
      label: 'Security & Privacy',
      color: COLORS.success,
      onPress: () => showInfo('Security & Privacy', '• Wallet secured with local encryption\n• Mnemonic stored securely on device\n• All blockchain transactions signed locally\n• No private data shared externally'),
    },
    {
      icon: 'help-circle',
      label: 'Help & Support',
      color: COLORS.info,
      onPress: () => showInfo('Help & Support', 'CampusTrust AI v2.0\n\nFor assistance, reach out to:\n📧 support@campustrust.ai\n🌐 docs.campustrust.ai', [
        { label: 'Visit Docs', onPress: () => Linking.openURL('https://developer.algorand.org') },
      ]),
    },
    {
      icon: 'information-circle',
      label: 'About CampusTrust',
      color: COLORS.textMuted,
      onPress: () => showInfo('About CampusTrust AI', 'Version 2.0\n\nDecentralized campus governance platform built on Algorand blockchain.\n\n7 Core Modules:\n• Governance Voting\n• Attendance Verification\n• Verifiable Credentials\n• P2P Compute Marketplace\n• Research Certification\n• Smart Permissions\n• DAO Treasury'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profile</Text>
          <TouchableOpacity onPress={() => { setEditProfile({ ...profile }); setShowEditModal(true); }}>
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Student Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarInitials}>
                {profile.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileDept}>{profile.department}</Text>
              <View style={styles.idRow}>
                <Ionicons name="card" size={12} color={COLORS.primary} />
                <Text style={styles.profileId}>{profile.studentId}</Text>
              </View>
            </View>
          </View>

          {/* Student Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="mail" size={14} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{profile.email}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="school" size={14} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{profile.semester} • Batch {profile.enrollmentYear}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.detailText}>CGPA: {profile.cgpa}/10</Text>
            </View>
          </View>

          {/* Wallet Section in Profile */}
          <View style={styles.walletSection}>
            {isConnected ? (
              <View style={styles.walletConnected}>
                <View style={styles.walletRow}>
                  <View style={styles.walletIconWrap}>
                    <Ionicons name={isDemoMode ? "game-controller" : "wallet"} size={16} color={isDemoMode ? "#A855F7" : COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.walletLabel}>{isDemoMode ? "Demo Wallet" : "Algorand Wallet"}</Text>
                    <Text style={styles.walletAddress}>{formatAddress(address!)}</Text>
                  </View>
                  <View style={styles.balancePill}>
                    <Ionicons name="diamond" size={12} color={isDemoMode ? "#A855F7" : COLORS.primary} />
                    <Text style={styles.balanceAmount}>{balance.toFixed(2)} ALGO</Text>
                  </View>
                </View>
                {isDemoMode && (
                  <View style={styles.demoWarning}>
                    <Ionicons name="information-circle" size={14} color="#F59E0B" />
                    <Text style={styles.demoWarningText}>Demo mode - No real transactions</Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.connectWalletBtn} onPress={() => setShowWalletModal(true)}>
                <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
                <Text style={styles.connectWalletText}>Connect Algorand Wallet</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Activity Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Activity Overview</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/voting')}>
              <View style={[styles.statIconWrap, { backgroundColor: COLORS.voting + '15' }]}>
                <Ionicons name="checkmark-done-circle" size={20} color={COLORS.voting} />
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Votes Cast</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/attendance')}>
              <View style={[styles.statIconWrap, { backgroundColor: COLORS.attendance + '15' }]}>
                <Ionicons name="calendar" size={20} color={COLORS.attendance} />
              </View>
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/badges')}>
              <View style={[styles.statIconWrap, { backgroundColor: '#A855F7' + '15' }]}>
                <Ionicons name="trophy" size={20} color="#A855F7" />
              </View>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/credentials')}>
              <View style={[styles.statIconWrap, { backgroundColor: COLORS.credentials + '15' }]}>
                <Ionicons name="ribbon" size={20} color={COLORS.credentials} />
              </View>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Credentials</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>FEATURES</Text>
          <View style={styles.menuCard}>
            {featureMenuItems.map((item, iIndex) => (
              <TouchableOpacity
                key={iIndex}
                style={[styles.menuItem, iIndex < featureMenuItems.length - 1 && styles.menuItemBorder]}
                onPress={() => router.push(item.route as any)}>
                <View style={[styles.menuIconWrap, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            {accountActions.map((item, iIndex) => (
              <TouchableOpacity
                key={iIndex}
                style={[styles.menuItem, iIndex < accountActions.length - 1 && styles.menuItemBorder]}
                onPress={item.onPress}>
                <View style={[styles.menuIconWrap, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { flex: 1 }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {isConnected && (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => {
                showWarning('Disconnect Wallet', 'This will remove your wallet from this device. Your funds remain safe on-chain.', [
                  { label: 'Cancel', onPress: () => {}, style: 'cancel' },
                  { label: 'Disconnect', style: 'destructive', onPress: disconnectWallet },
                ]);
              }}>
              <Ionicons name="log-out" size={18} color="#EF4444" />
              <Text style={styles.disconnectText}>Disconnect Wallet</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.faucetButton}
            onPress={() => Linking.openURL('https://bank.testnet.algorand.network/')}>
            <Ionicons name="open-outline" size={14} color={COLORS.primary} />
            <Text style={styles.faucetText}>Get TestNet ALGO from Faucet</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>CampusTrust AI v2.0 — Built on Algorand</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput style={styles.fieldInput} value={editProfile.name}
              onChangeText={(t) => setEditProfile(p => ({ ...p, name: t }))} placeholderTextColor={COLORS.textMuted} />

            <Text style={styles.fieldLabel}>Department</Text>
            <TextInput style={styles.fieldInput} value={editProfile.department}
              onChangeText={(t) => setEditProfile(p => ({ ...p, department: t }))} placeholderTextColor={COLORS.textMuted} />

            <Text style={styles.fieldLabel}>Student ID</Text>
            <TextInput style={styles.fieldInput} value={editProfile.studentId}
              onChangeText={(t) => setEditProfile(p => ({ ...p, studentId: t }))} placeholderTextColor={COLORS.textMuted} />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.fieldInput} value={editProfile.email} keyboardType="email-address"
              onChangeText={(t) => setEditProfile(p => ({ ...p, email: t }))} placeholderTextColor={COLORS.textMuted} />

            <Text style={styles.fieldLabel}>Semester</Text>
            <TextInput style={styles.fieldInput} value={editProfile.semester}
              onChangeText={(t) => setEditProfile(p => ({ ...p, semester: t }))} placeholderTextColor={COLORS.textMuted} />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.bgDark} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Connect Wallet Modal */}
      <Modal visible={showWalletModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect Wallet</Text>
              <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleCreateWallet} disabled={walletLoading}>
              <Ionicons name="add-circle" size={20} color={COLORS.bgDark} />
              <Text style={styles.saveButtonText}>{walletLoading ? 'Creating...' : demoMode ? 'Start Demo Mode' : 'Create New Wallet'}</Text>
            </TouchableOpacity>

            {/* Demo Mode Toggle */}
            <View style={styles.demoModeSection}>
              <View style={styles.demoModeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoModeLabel}>Demo Mode</Text>
                  <Text style={styles.demoModeDesc}>Simulate wallet without real blockchain transactions</Text>
                </View>
                <Switch
                  value={demoMode}
                  onValueChange={toggleDemoMode}
                  trackColor={{ false: COLORS.borderDark, true: COLORS.primary + '60' }}
                  thumbColor={demoMode ? COLORS.primary : COLORS.textMuted}
                />
              </View>
              {demoMode && (
                <View style={styles.demoWarning}>
                  <Ionicons name="information-circle" size={16} color="#F59E0B" />
                  <Text style={styles.demoWarningText}>Demo mode is enabled. All transactions will be simulated.</Text>
                </View>
              )}
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.fieldLabel}>Import with Mnemonic</Text>
            <TextInput
              style={[styles.fieldInput, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Enter 25-word mnemonic phrase..."
              placeholderTextColor={COLORS.textMuted}
              multiline numberOfLines={3}
              value={mnemonicInput}
              onChangeText={setMnemonicInput}
            />
            <TouchableOpacity style={styles.importButton} onPress={handleImportWallet} disabled={walletLoading}>
              <Text style={styles.importButtonText}>{walletLoading ? 'Importing...' : 'Import Wallet'}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.demoButton} onPress={handleDemoMode}>
              <Ionicons name="game-controller" size={20} color="#A855F7" />
              <Text style={styles.demoButtonText}>Try Demo Mode</Text>
            </TouchableOpacity>
            <Text style={styles.demoHint}>Simulated wallet with no real blockchain transactions</Text>
          </View>
        </View>
      </Modal>

      {/* Styled InfoModal */}
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
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  scrollView: { flex: 1, paddingHorizontal: SPACING.xl },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 44, marginBottom: SPACING.xl,
  },
  pageTitle: { fontSize: FONT_SIZES.xxxl, fontWeight: '700', color: COLORS.textPrimary },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.xxl, padding: SPACING.xl,
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  profileTopRow: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.xl },
  avatarLarge: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.bgDark },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  profileDept: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  profileId: {
    fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  detailsGrid: { gap: SPACING.sm, marginBottom: SPACING.xl },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  detailText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  walletSection: {
    borderTopWidth: 1, borderTopColor: COLORS.borderDark, paddingTop: SPACING.lg,
  },
  walletConnected: {},
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  walletIconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  walletLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },
  walletAddress: {
    fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  balancePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  balanceAmount: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.primary },

  connectWalletBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md, justifyContent: 'center',
  },
  connectWalletText: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600', flex: 1 },

  // Stats
  statsCard: {
    backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.xxl, padding: SPACING.xl,
    marginBottom: SPACING.xxl, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  statsTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statIconWrap: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },

  // Menu
  menuSection: { marginBottom: SPACING.xxl },
  sectionTitle: {
    fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMuted,
    letterSpacing: 1.5, marginBottom: SPACING.md,
  },
  menuCard: {
    backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderDark, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg, gap: SPACING.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderDark },
  menuIconWrap: { width: 34, height: 34, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.textPrimary },
  menuDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 1 },

  // Bottom
  bottomActions: { alignItems: 'center', gap: SPACING.md, marginTop: SPACING.md },
  disconnectButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#EF4444' + '40',
  },
  disconnectText: { color: '#EF4444', fontSize: FONT_SIZES.md, fontWeight: '600' },
  faucetButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  faucetText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  versionText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: SPACING.sm },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.surfaceDark, borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.borderLight,
    alignSelf: 'center', marginBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  modalTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.textPrimary },

  fieldLabel: {
    fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  fieldInput: {
    backgroundColor: COLORS.bgDark, borderRadius: RADIUS.lg, padding: SPACING.md,
    fontSize: FONT_SIZES.md, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.borderDark,
  },

  // Demo Mode
  demoModeSection: {
    backgroundColor: COLORS.bgDark, borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  demoModeRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  demoModeLabel: {
    fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary,
  },
  demoModeDesc: {
    fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2,
  },
  demoWarning: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginTop: SPACING.md, paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.borderDark,
  },
  demoWarningText: {
    fontSize: FONT_SIZES.xs, color: '#F59E0B', flex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, marginTop: SPACING.xl,
  },
  saveButtonText: { color: COLORS.bgDark, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  importButton: {
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 2, alignItems: 'center', marginTop: SPACING.md,
  },
  importButtonText: { color: COLORS.primary, fontSize: FONT_SIZES.lg, fontWeight: '600' },
  divider: {
    flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xl, gap: SPACING.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderDark },
  dividerText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  demoButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, backgroundColor: '#A855F7' + '20',
    borderWidth: 1, borderColor: '#A855F7' + '40',
    borderRadius: RADIUS.lg, paddingVertical: SPACING.lg,
  },
  demoButtonText: { color: '#A855F7', fontSize: FONT_SIZES.lg, fontWeight: '600' },
  demoHint: { 
    fontSize: FONT_SIZES.xs, color: COLORS.textMuted, 
    textAlign: 'center', marginTop: SPACING.sm 
  },
});
