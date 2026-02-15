import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Alert, TextInput, Modal, Linking, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;

export default function HomeScreen() {
  const { address, balance, isConnected, connectWallet, disconnectWallet, refreshBalance, isLoading } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const router = useRouter();

  const activeElections = [
    {
      id: '#402',
      title: 'Library Hours Extension during Finals',
      description: 'Proposal to keep the main library open 24/7 during the final exam week for student access.',
      aiScore: 92,
      confidence: 'High Confidence',
      timeLeft: '4h left',
      color: COLORS.primary,
    },
    {
      id: '#405',
      title: 'Allocate Budget for Quantum Lab',
      description: 'Requesting 50,000 ALGO from treasury to upgrade the physics department\'s cooling systems.',
      aiScore: 65,
      confidence: 'Moderate Risk',
      timeLeft: '12h left',
      color: '#F59E0B',
    },
  ];

  const modules = [
    { name: 'Governance Voting', icon: 'checkmark-done-circle', route: '/voting', color: COLORS.voting, desc: 'Shape the future of campus', badge: '3 Pending', prominent: true },
    { name: 'Attendance', icon: 'qr-code', route: '/attendance', color: COLORS.attendance, desc: 'Scan to check-in', dot: true },
    { name: 'Credentials', icon: 'ribbon', route: '/credentials', color: COLORS.credentials, desc: 'Verifiable ID & Grades' },
    { name: 'Compute Mkt', icon: 'hardware-chip', route: '/compute', color: COLORS.compute, desc: 'Rent GPU Power' },
    { name: 'Research Review', icon: 'document-text', route: '/research', color: COLORS.research, desc: 'Peer review papers' },
    { name: 'DAO Treasury', icon: 'business', route: '/governance', color: COLORS.governance, desc: 'View allocations' },
  ];

  const handleCreateWallet = async () => {
    setWalletLoading(true);
    try {
      await connectWallet();
      setShowWalletModal(false);
      Alert.alert('✅ Wallet Created', 'Your new Algorand wallet has been created. Fund it on TestNet faucet to use blockchain features.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!mnemonicInput.trim()) {
      Alert.alert('Error', 'Please enter your 25-word mnemonic phrase');
      return;
    }
    setWalletLoading(true);
    try {
      await connectWallet(mnemonicInput.trim());
      setShowWalletModal(false);
      setMnemonicInput('');
      Alert.alert('✅ Wallet Imported', 'Your Algorand wallet has been imported successfully.');
    } catch (e: any) {
      Alert.alert('Error', 'Invalid mnemonic phrase. Please check and try again.');
    } finally {
      setWalletLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const renderAIScoreRing = (score: number, color: string, size: number = 40) => {
    return (
      <View style={[styles.aiRing, { width: size, height: size }]}>
        <View style={[styles.aiRingBg, { width: size, height: size, borderRadius: size / 2, borderColor: COLORS.borderDark }]} />
        <View style={[styles.aiRingFill, { width: size, height: size, borderRadius: size / 2, borderColor: color }]} />
        <Text style={[styles.aiRingText, { color, fontSize: size * 0.28 }]}>{score}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>
                {isConnected ? formatAddress(address!) : 'Student'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.algoChip}
            onPress={() => isConnected ? refreshBalance() : setShowWalletModal(true)}>
            <View style={styles.algoIcon}>
              <Ionicons name="diamond" size={12} color="#FFF" />
            </View>
            <Text style={styles.algoAmount}>
              {isConnected ? `${balance.toFixed(0)}` : '---'}
            </Text>
            <Text style={styles.algoLabel}>ALGO</Text>
          </TouchableOpacity>
        </View>

        {/* Active Elections Carousel */}
        <View style={styles.carouselSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Active Elections</Text>
              <View style={styles.liveDot} />
            </View>
            <TouchableOpacity onPress={() => router.push('/voting')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
            {activeElections.map((election, index) => (
              <TouchableOpacity
                key={index}
                style={styles.electionCard}
                onPress={() => router.push('/voting')}>
                <View style={styles.electionCardHeader}>
                  <View style={[styles.propBadge, { backgroundColor: election.color + '20' }]}>
                    <Text style={[styles.propBadgeText, { color: election.color }]}>Prop {election.id}</Text>
                  </View>
                  <View style={styles.timeChip}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.timeChipText}>{election.timeLeft}</Text>
                  </View>
                </View>
                <Text style={styles.electionTitle}>{election.title}</Text>
                <Text style={styles.electionDesc} numberOfLines={2}>{election.description}</Text>
                <View style={styles.electionFooter}>
                  <View style={styles.aiScoreRow}>
                    {renderAIScoreRing(election.aiScore, election.color)}
                    <View style={styles.aiScoreInfo}>
                      <Text style={styles.aiScoreLabel}>AI Trust Score</Text>
                      <Text style={[styles.aiScoreConfidence, { color: election.color }]}>{election.confidence}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.voteButton, { backgroundColor: election.color }]}>
                    <Text style={styles.voteButtonText}>Vote Now</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Core Modules Grid */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Core Modules</Text>
          <View style={styles.modulesGrid}>
            {/* Prominent Voting Card */}
            <TouchableOpacity
              style={styles.prominentCard}
              onPress={() => router.push('/voting')}>
              <View style={styles.prominentCardContent}>
                <View style={[styles.moduleIcon, { backgroundColor: COLORS.voting + '20' }]}>
                  <Ionicons name="checkmark-done-circle" size={24} color={COLORS.voting} />
                </View>
                <Text style={styles.prominentTitle}>Governance Voting</Text>
                <Text style={styles.moduleDesc}>Shape the future of campus</Text>
              </View>
              <View style={styles.prominentRight}>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>3 Pending</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </View>
              <View style={styles.prominentGlow} />
            </TouchableOpacity>

            {/* Regular Module Cards Grid */}
            <View style={styles.moduleRow}>
              {modules.filter(m => !m.prominent).slice(0, 2).map((mod, idx) => (
                <Link key={idx} href={mod.route as any} asChild>
                  <TouchableOpacity style={styles.moduleCard}>
                    <View style={[styles.moduleIcon, { backgroundColor: mod.color + '15' }]}>
                      <Ionicons name={mod.icon as any} size={24} color={mod.color} />
                    </View>
                    <Text style={styles.moduleName}>{mod.name}</Text>
                    <Text style={styles.moduleDesc}>{mod.desc}</Text>
                    {mod.dot && <View style={[styles.statusDot, { backgroundColor: mod.color }]} />}
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
            <View style={styles.moduleRow}>
              {modules.filter(m => !m.prominent).slice(2, 4).map((mod, idx) => (
                <Link key={idx} href={mod.route as any} asChild>
                  <TouchableOpacity style={styles.moduleCard}>
                    <View style={[styles.moduleIcon, { backgroundColor: mod.color + '15' }]}>
                      <Ionicons name={mod.icon as any} size={24} color={mod.color} />
                    </View>
                    <Text style={styles.moduleName}>{mod.name}</Text>
                    <Text style={styles.moduleDesc}>{mod.desc}</Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
            <View style={styles.moduleRow}>
              {modules.filter(m => !m.prominent).slice(4).map((mod, idx) => (
                <Link key={idx} href={mod.route as any} asChild>
                  <TouchableOpacity style={styles.moduleCard}>
                    <View style={[styles.moduleIcon, { backgroundColor: mod.color + '15' }]}>
                      <Ionicons name={mod.icon as any} size={24} color={mod.color} />
                    </View>
                    <Text style={styles.moduleName}>{mod.name}</Text>
                    <Text style={styles.moduleDesc}>{mod.desc}</Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>

            {/* Smart Permissions Wide Card */}
            <Link href="/permissions" asChild>
              <TouchableOpacity style={styles.wideCard}>
                <View style={[styles.moduleIcon, { backgroundColor: COLORS.permissions + '15' }]}>
                  <Ionicons name="key" size={24} color={COLORS.permissions} />
                </View>
                <View style={styles.wideCardContent}>
                  <Text style={styles.moduleName}>Smart Permissions</Text>
                  <Text style={styles.moduleDesc}>Manage data access & privacy</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Wallet Modal */}
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

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={handleCreateWallet}
              disabled={walletLoading}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.modalPrimaryButtonText}>
                {walletLoading ? 'Creating...' : 'Create New Wallet'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalDivider}>
              <View style={styles.modalDividerLine} />
              <Text style={styles.modalDividerText}>OR</Text>
              <View style={styles.modalDividerLine} />
            </View>

            <Text style={styles.modalLabel}>Import with Mnemonic</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter 25-word mnemonic phrase..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={mnemonicInput}
              onChangeText={setMnemonicInput}
            />
            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={handleImportWallet}
              disabled={walletLoading}>
              <Text style={styles.modalSecondaryButtonText}>
                {walletLoading ? 'Importing...' : 'Import Wallet'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.faucetLink}
              onPress={() => Linking.openURL('https://bank.testnet.algorand.network/')}>
              <Ionicons name="open-outline" size={14} color={COLORS.primary} />
              <Text style={styles.faucetLinkText}>Get TestNet ALGO from Faucet</Text>
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
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.bgDark,
  },
  welcomeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  algoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  algoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  algoAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  algoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },

  // Carousel
  carouselSection: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  carouselContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  electionCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  electionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  propBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  propBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  timeChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  electionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    paddingRight: SPACING.xxxl,
  },
  electionDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },
  electionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: SPACING.lg,
  },
  aiScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  aiRing: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  aiRingBg: {
    position: 'absolute',
    borderWidth: 3,
  },
  aiRingFill: {
    position: 'absolute',
    borderWidth: 3,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  aiRingText: {
    fontWeight: '700',
  },
  aiScoreInfo: {},
  aiScoreLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  aiScoreConfidence: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  voteButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  voteButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },

  // Modules
  modulesSection: {
    marginTop: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  modulesGrid: {
    marginTop: SPACING.lg,
    gap: SPACING.lg,
  },
  prominentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    overflow: 'hidden',
  },
  prominentCardContent: {
    flex: 1,
  },
  prominentTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  prominentRight: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  pendingBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  pendingBadgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  prominentGlow: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '10',
  },
  moduleRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  moduleCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    position: 'relative',
  },
  moduleIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  moduleName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  moduleDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  wideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: SPACING.lg,
  },
  wideCardContent: {
    flex: 1,
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
    marginBottom: SPACING.xxl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalPrimaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
    gap: SPACING.md,
  },
  modalDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderDark,
  },
  modalDividerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  modalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalSecondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalSecondaryButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  faucetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.xl,
  },
  faucetLinkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});
