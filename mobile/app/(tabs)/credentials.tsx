import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

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
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<TabKey>('my');

  const formatAddress = (addr: string) => {
    if (!addr) return 'ALG0...7X92';
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
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
              <TouchableOpacity>
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
          <TouchableOpacity>
            <Ionicons name="filter" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

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
              <TouchableOpacity style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Verify</Text>
                <Ionicons name="qr-code" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
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
});
