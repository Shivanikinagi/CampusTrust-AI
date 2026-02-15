import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Modal, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';
import { rentComputeResource } from '@/services/algorandService';

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
  const { isDemoMode, address } = useWallet();
  const [showProofModal, setShowProofModal] = useState(false);
  const [blockchainProof, setBlockchainProof] = useState<any>(null);
  const [isRenting, setIsRenting] = useState(false);

  const handleRentNode = async (nodeId: string, nodeName: string, price: string, duration: number) => {
    if (!address && !isDemoMode) {
      return;
    }

    setIsRenting(true);
    try {
      const proof = await rentComputeResource(
        address || 'DEMO',
        nodeId,
        duration,
        parseFloat(price)
      );
      setBlockchainProof(proof);
      setShowProofModal(true);
    } catch (error) {
      console.error('Error renting node:', error);
    } finally {
      setIsRenting(false);
    }
  };

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
          <TouchableOpacity style={styles.notifButton}
            onPress={() => Alert.alert('Notifications', 'No new compute marketplace notifications.', [{ text: 'OK' }])}>
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

        {activeTab === 'find' ? (
          <>
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
            {NODES
              .filter(node => {
                if (activeFilter === 'nvidia') return node.name.toLowerCase().includes('nvidia');
                if (activeFilter === 'apple') return node.name.toLowerCase().includes('apple');
                return true;
              })
              .sort((a, b) => {
                if (activeFilter === 'lowest') return parseFloat(a.price) - parseFloat(b.price);
                return 0;
              })
              .map((node, index) => (
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
                      ]}
                      onPress={() => {
                        if (node.status !== 'busy') {
                          handleRentNode(node.id, node.name, node.price, 1);
                        }
                      }}
                      disabled={isRenting || node.status === 'busy'}>
                      {node.status === 'busy' ? (
                        <View style={styles.busyRow}>
                          <Ionicons name="hourglass" size={14} color={COLORS.textMuted} />
                          <Text style={styles.busyText}>Queue Job (Busy)</Text>
                        </View>
                      ) : (
                        <Text style={[styles.rentText, node.topRated && styles.rentTextPrimary]}>
                          {isRenting ? 'Renting...' : 'Rent Now'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </>
        ) : (
          <View style={styles.myJobsSection}>
            <View style={styles.myJobCard}>
              <View style={styles.myJobHeader}>
                <Ionicons name="server" size={20} color={COLORS.primary} />
                <Text style={styles.myJobTitle}>NVIDIA RTX 4090 - Training Job</Text>
              </View>
              <Text style={styles.myJobTime}>Started 2 hours ago • Student Lab B</Text>
              <View style={styles.myJobProgress}>
                <View style={[styles.progressBar, { flex: 1 }]}>
                  <View style={[styles.progressFill, { width: '68%', backgroundColor: COLORS.primary }]} />
                </View>
                <Text style={styles.myJobPct}>68%</Text>
              </View>
              <View style={styles.myJobFooter}>
                <Text style={styles.myJobCost}>Cost: 9.0 ALGO</Text>
                <TouchableOpacity style={styles.myJobStopBtn}
                  onPress={() => Alert.alert('Stop Job', 'Are you sure you want to stop this job?\n\nPartial results will be saved.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Stop', style: 'destructive', onPress: () => Alert.alert('Job Stopped', 'Results saved. 9.0 ALGO charged.') },
                  ])}>
                  <Ionicons name="stop-circle" size={14} color="#EF4444" />
                  <Text style={styles.myJobStopText}>Stop</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.myJobCard}>
              <View style={styles.myJobHeader}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.myJobTitle}>Apple M2 Ultra - Inference</Text>
              </View>
              <Text style={styles.myJobTime}>Completed yesterday • Library Cluster</Text>
              <View style={styles.myJobFooter}>
                <Text style={styles.myJobCost}>Cost: 6.4 ALGO</Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
                  {blockchainProof?.action || 'Compute resource rented on Algorand'}
                </Text>
              </View>

              {/* Demo Mode Indicator */}
              {isDemoMode && (
                <View style={styles.demoModeBanner}>
                  <Ionicons name="flask" size={16} color={COLORS.warning} />
                  <Text style={styles.demoModeText}>Demo Mode - Simulated Transaction</Text>
                </View>
              )}

              {/* Rental Details */}
              {blockchainProof?.rentalDetails && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>Rental Details</Text>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Resource</Text>
                    <Text style={styles.proofValue}>{blockchainProof.rentalDetails.nodeName}</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Node ID</Text>
                    <Text style={styles.proofValue}>{blockchainProof.rentalDetails.nodeId}</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Session ID</Text>
                    <Text style={styles.proofValueMono}>{blockchainProof.rentalDetails.sessionId}</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Hourly Rate</Text>
                    <Text style={styles.proofValue}>{blockchainProof.rentalDetails.hourlyRate} ALGO/hr</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Duration</Text>
                    <Text style={styles.proofValue}>{blockchainProof.rentalDetails.duration} hours</Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Total Cost</Text>
                    <Text style={styles.proofValue}>{blockchainProof.rentalDetails.totalCost} ALGO</Text>
                  </View>
                </View>
              )}

              {/* Escrow Contract */}
              {blockchainProof?.escrowDetails && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>Smart Contract Escrow</Text>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Escrow Address</Text>
                    <Text style={styles.proofValueMono} numberOfLines={1}>
                      {blockchainProof.escrowDetails.escrowAddress}
                    </Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Payment Status</Text>
                    <Text style={[styles.proofValue, { color: COLORS.success }]}>
                      Escrowed (Auto-release on completion)
                    </Text>
                  </View>
                  <View style={styles.proofField}>
                    <Text style={styles.proofLabel}>Access Granted</Text>
                    <Text style={styles.proofValue}>
                      {new Date(blockchainProof.escrowDetails.startTime).toLocaleString()}
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

  // My Jobs
  myJobsSection: { marginTop: SPACING.md },
  myJobCard: {
    backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.xxl, padding: SPACING.xl,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderDark,
  },
  myJobHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  myJobTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  myJobTime: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.md },
  myJobProgress: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  progressBar: { height: 6, backgroundColor: COLORS.borderDark, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  myJobPct: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600', width: 36 },
  myJobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  myJobCost: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  myJobStopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: '#EF4444' + '40',
  },
  myJobStopText: { fontSize: FONT_SIZES.sm, color: '#EF4444', fontWeight: '600' },
  completedBadge: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    backgroundColor: COLORS.success + '15',
  },
  completedText: { fontSize: FONT_SIZES.sm, color: COLORS.success, fontWeight: '600' },

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