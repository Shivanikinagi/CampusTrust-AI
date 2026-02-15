import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

type TabKey = 'find' | 'jobs';
type FilterKey = 'all' | 'nvidia' | 'apple' | 'lowest';

const NODES = [
  {
    id: '#8291',
    location: 'Student Lab B',
    name: 'NVIDIA RTX 4090',
    providerId: '7X...9A2',
    specs: [
      { icon: 'cube', label: 'VRAM', value: '24GB' },
      { icon: 'grid', label: 'Cores', value: '12 vCPU' },
      { icon: 'speedometer', label: 'Bandwidth', value: 'High' },
    ],
    price: '4.5',
    usd: '~$0.54 USD',
    rating: 4.9,
    jobs: 120,
    status: 'online',
    topRated: true,
  },
  {
    id: '#4102',
    location: 'Library Cluster',
    name: 'Apple M2 Ultra',
    providerId: '',
    specs: [
      { icon: 'cube', label: 'GPU', value: '76 GPU' },
      { icon: 'grid', label: 'RAM', value: '128GB RAM' },
    ],
    price: '3.2',
    usd: '',
    rating: 4.7,
    jobs: 0,
    status: 'online',
    topRated: false,
  },
  {
    id: '#1105',
    location: 'Dorm B204',
    name: 'NVIDIA RTX 3080',
    providerId: '',
    specs: [
      { icon: 'cube', label: 'VRAM', value: '10GB VRAM' },
      { icon: 'grid', label: 'CPU', value: '8 vCPU' },
    ],
    price: '1.8',
    usd: '',
    rating: 4.2,
    jobs: 0,
    status: 'busy',
    topRated: false,
  },
  {
    id: '#9901',
    location: 'CompSci Lab',
    name: 'NVIDIA A100 Tensor',
    providerId: '',
    specs: [
      { icon: 'cube', label: 'HBM2', value: '40GB HBM2' },
      { icon: 'grid', label: 'CPU', value: '16 vCPU' },
    ],
    price: '8.5',
    usd: '',
    rating: 4.8,
    jobs: 0,
    status: 'online',
    topRated: false,
  },
];

export default function ComputeScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('find');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Specs' },
    { key: 'nvidia', label: 'NVIDIA' },
    { key: 'apple', label: 'Apple Silicon' },
    { key: 'lowest', label: 'Lowest Price' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Compute Market</Text>
          <TouchableOpacity style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'find' && styles.tabActive]}
            onPress={() => setActiveTab('find')}>
            <Text style={[styles.tabText, activeTab === 'find' && styles.tabTextActive]}>Find Nodes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'jobs' && styles.tabActive]}
            onPress={() => setActiveTab('jobs')}>
            <Text style={[styles.tabText, activeTab === 'jobs' && styles.tabTextActive]}>My Jobs</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}>
              {f.key === 'all' && <Ionicons name="options" size={14} color={activeFilter === f.key ? COLORS.bgDark : COLORS.textSecondary} />}
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Node Cards */}
        {NODES.map((node, index) => (
          <View key={index} style={styles.nodeCard}>
            {/* Card Header */}
            <View style={styles.nodeHeader}>
              <View style={styles.nodeInfoRow}>
                <View style={[styles.statusCircle, { backgroundColor: node.status === 'online' ? COLORS.success : '#F59E0B' }]} />
                <Text style={styles.nodeIdText}>Node {node.id}</Text>
                <Text style={styles.nodeSep}>•</Text>
                <Text style={styles.nodeLocation}>{node.location}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{node.rating}</Text>
              </View>
            </View>

            {/* Top Rated Badge */}
            {node.topRated && (
              <View style={styles.topRatedBadge}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} />
                <Text style={styles.topRatedText}>TOP RATED</Text>
              </View>
            )}

            {/* GPU Name & Price */}
            <View style={styles.nodeMainRow}>
              <Text style={styles.nodeName}>{node.name}</Text>
              <View style={styles.priceBlock}>
                <Text style={styles.price}>{node.price}</Text>
                <Text style={styles.priceUnit}> ALGO/hr</Text>
              </View>
            </View>

            {node.providerId !== '' && (
              <Text style={styles.providerId}>Provider ID: {node.providerId}</Text>
            )}
            {node.usd !== '' && (
              <Text style={styles.usdPrice}>{node.usd}</Text>
            )}

            {/* Specs */}
            {node.specs.length > 2 && (
              <View style={styles.specsRow}>
                {node.specs.map((spec, si) => (
                  <View key={si} style={styles.specItem}>
                    <Ionicons name={spec.icon as any} size={16} color={COLORS.textMuted} />
                    <Text style={styles.specValue}>{spec.value}</Text>
                    <Text style={styles.specLabel}>{spec.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {node.specs.length <= 2 && (
              <View style={styles.inlineSpecs}>
                {node.specs.map((spec, si) => (
                  <Text key={si} style={styles.inlineSpecText}>{spec.value}</Text>
                ))}
              </View>
            )}

            {/* Jobs count + CTA */}
            <View style={styles.nodeFooter}>
              {node.jobs > 0 && (
                <View style={styles.jobsRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.jobsText}>{node.rating} ({node.jobs} jobs)</Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.rentButton,
                  node.status === 'busy' && styles.rentButtonDisabled,
                ]}>
                {node.status === 'busy' ? (
                  <View style={styles.busyRow}>
                    <Ionicons name="hourglass" size={14} color={COLORS.textMuted} />
                    <Text style={styles.busyText}>Queue Job (Busy)</Text>
                  </View>
                ) : (
                  <Text style={[styles.rentText, node.topRated && styles.rentTextPrimary]}>
                    Rent Now
                  </Text>
                )}
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
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  notifButton: {
    position: 'relative',
    padding: 8,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.bgDark,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: 4,
    marginBottom: SPACING.xl,
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

  // Filter
  filterRow: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    paddingBottom: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.bgDark,
    fontWeight: '600',
  },

  // Node Cards
  nodeCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nodeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodeIdText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  nodeSep: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  nodeLocation: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  topRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
    marginBottom: SPACING.md,
  },
  topRatedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  nodeMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  nodeName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  providerId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  usdPrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  specsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 4,
  },
  specValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  specLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  inlineSpecs: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  inlineSpecText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  nodeFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: SPACING.md,
  },
  jobsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  jobsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  rentButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  rentButtonDisabled: {
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  rentText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  rentTextPrimary: {
    color: COLORS.bgDark,
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  busyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});