import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Alert, Linking } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

export default function ProfileScreen() {
  const { address, balance, isConnected, disconnectWallet } = useWallet();
  const router = useRouter();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  const menuItems = [
    {
      section: 'Features',
      items: [
        { icon: 'shield-checkmark', label: 'Smart Permissions', route: '/permissions', color: COLORS.permissions },
        { icon: 'trophy', label: 'Skill Badges', route: '/badges', color: '#F59E0B' },
        { icon: 'cash', label: 'Smart Grants', route: '/grants', color: COLORS.grants },
        { icon: 'people', label: 'DAO Governance', route: '/governance', color: COLORS.governance },
      ],
    },
    {
      section: 'Account',
      items: [
        { icon: 'settings', label: 'Settings', route: '', color: COLORS.textMuted },
        { icon: 'notifications', label: 'Notifications', route: '', color: COLORS.primary },
        { icon: 'shield', label: 'Security & Privacy', route: '', color: COLORS.success },
        { icon: 'help-circle', label: 'Help & Support', route: '', color: COLORS.info },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.profileName}>
            {isConnected ? formatAddress(address!) : 'Connect Wallet'}
          </Text>
          {isConnected && (
            <View style={styles.balanceRow}>
              <Ionicons name="diamond" size={14} color={COLORS.primary} />
              <Text style={styles.balanceText}>{balance.toFixed(4)} ALGO</Text>
            </View>
          )}
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>12</Text>
              <Text style={styles.profileStatLabel}>Votes Cast</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>98%</Text>
              <Text style={styles.profileStatLabel}>Attendance</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>5</Text>
              <Text style={styles.profileStatLabel}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sIndex) => (
          <View key={sIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, iIndex) => (
                <TouchableOpacity
                  key={iIndex}
                  style={[
                    styles.menuItem,
                    iIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    if (item.route) router.push(item.route as any);
                  }}>
                  <View style={[styles.menuIconWrap, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Disconnect / Testnet Link */}
        <View style={styles.bottomActions}>
          {isConnected ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => {
                Alert.alert('Disconnect', 'Are you sure you want to disconnect your wallet?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Disconnect', style: 'destructive', onPress: disconnectWallet },
                ]);
              }}>
              <Ionicons name="log-out" size={18} color="#EF4444" />
              <Text style={styles.disconnectText}>Disconnect Wallet</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.faucetButton}
              onPress={() => Linking.openURL('https://bank.testnet.algorand.network/')}>
              <Ionicons name="open-outline" size={16} color={COLORS.primary} />
              <Text style={styles.faucetText}>Get TestNet ALGO</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.versionText}>CampusTrust AI v2.0</Text>
        </View>

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
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Profile
  profileCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xl,
  },
  balanceText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  profileStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  profileStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.borderDark,
  },

  // Menu
  menuSection: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  menuCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  // Bottom
  bottomActions: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#EF4444' + '40',
  },
  disconnectText: {
    color: '#EF4444',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  faucetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  faucetText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});
