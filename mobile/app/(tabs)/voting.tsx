import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

type FilterTab = 'active' | 'past' | 'mine';

const PROPOSALS = [
    {
        id: '#PROP-1024',
        title: 'Install Solar Panels on Library Roof',
        description: 'Proposal to allocate Q3 budget towards renewable energy infrastructure to reduce campus carbon footprint by 15%.',
        aiScore: 92,
        scoreColor: COLORS.primary,
        analysis: 'High clarity & feasibility.',
        endsIn: 'Ends in 2 days',
        onChain: true,
        votesYes: 67,
        votesNo: 8,
    },
    {
        id: '#PROP-1025',
        title: 'Extend Cafeteria Hours during Finals',
        description: 'Requesting staff overtime pay to keep facilities open until 2 AM during the final exam week for study groups.',
        aiScore: 78,
        scoreColor: '#F59E0B',
        analysis: 'Budget impact moderate.',
        endsIn: 'Ends in 5 hours',
        onChain: true,
        votesYes: 45,
        votesNo: 23,
    },
    {
        id: '#PROP-1022',
        title: 'Campus WiFi Upgrade - Phase 2',
        description: 'Hardware procurement for dormitories.',
        aiScore: 0,
        scoreColor: COLORS.primary,
        analysis: '',
        endsIn: 'Voting closed',
        onChain: false,
        votesYes: 45,
        votesNo: 12,
        faded: true,
    },
];

export default function VotingScreen() {
    const { isConnected } = useWallet();
    const [activeFilter, setActiveFilter] = useState<FilterTab>('active');
    const [searchQuery, setSearchQuery] = useState('');

    const filters: { key: FilterTab; label: string }[] = [
        { key: 'active', label: 'Active' },
        { key: 'past', label: 'Past' },
        { key: 'mine', label: 'My Proposals' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.pageTitle}>Governance</Text>
                        <View style={styles.networkRow}>
                            <View style={styles.networkDot} />
                            <Text style={styles.networkText}>Algorand Mainnet</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notifButton}>
                        <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
                        <View style={styles.notifDot} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search proposals..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
                            onPress={() => setActiveFilter(f.key)}>
                            <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* List Header */}
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Active Proposals</Text>
                    <Text style={styles.listCount}>3 voting now</Text>
                </View>

                {/* Proposal Cards */}
                {PROPOSALS.map((proposal, index) => (
                    <View
                        key={index}
                        style={[styles.proposalCard, proposal.faded && styles.proposalCardFaded]}>

                        {/* Card Header */}
                        <View style={styles.cardHeader}>
                            <View style={styles.propIdBadge}>
                                <Text style={styles.propIdText}>{proposal.id}</Text>
                            </View>
                            {proposal.onChain && (
                                <View style={styles.onChainBadge}>
                                    <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />
                                    <Text style={styles.onChainText}>On-Chain</Text>
                                </View>
                            )}
                        </View>

                        {/* Title & Description */}
                        <Text style={styles.proposalTitle}>{proposal.title}</Text>
                        <Text style={styles.proposalDesc} numberOfLines={2}>{proposal.description}</Text>

                        {/* AI Score Section */}
                        {proposal.aiScore > 0 && (
                            <View style={styles.aiScoreContainer}>
                                <View style={[styles.aiScoreCircle, { borderColor: proposal.scoreColor }]}>
                                    <Ionicons name="sparkles" size={14} color={proposal.scoreColor} />
                                </View>
                                <View style={styles.aiScoreContent}>
                                    <View style={styles.aiScoreHeaderRow}>
                                        <Text style={[styles.aiScoreLabel, { color: proposal.scoreColor }]}>AI QUALITY SCORE</Text>
                                        <Text style={styles.aiScoreValue}>
                                            {proposal.aiScore}<Text style={styles.aiScoreMax}>/100</Text>
                                        </Text>
                                    </View>
                                    <Text style={styles.aiAnalysis}>Analysis: {proposal.analysis}</Text>
                                </View>
                            </View>
                        )}

                        {/* Progress Bar (for faded/closed proposals) */}
                        {proposal.faded && (
                            <View style={styles.progressSection}>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${proposal.votesYes}%` }]} />
                                </View>
                                <View style={styles.progressLabels}>
                                    <Text style={styles.progressLabel}>Yes: {proposal.votesYes}%</Text>
                                    <Text style={styles.progressLabel}>No: {proposal.votesNo}%</Text>
                                </View>
                            </View>
                        )}

                        {/* Footer */}
                        <View style={styles.cardFooter}>
                            <View style={styles.timeRow}>
                                <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                                <Text style={styles.timeText}>{proposal.endsIn}</Text>
                            </View>
                            {!proposal.faded && (
                                <TouchableOpacity style={styles.voteNowButton}>
                                    <Text style={styles.voteNowText}>Vote Now</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Floating Create Button */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={28} color={COLORS.bgDark} />
            </TouchableOpacity>
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
    notifButton: {
        position: 'relative',
        padding: 8,
        borderRadius: RADIUS.full,
    },
    notifDot: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: COLORS.bgDark,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceDark,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.md,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textPrimary,
    },

    // Filters
    filterRow: {
        gap: SPACING.md,
        marginBottom: SPACING.xxl,
        paddingBottom: 2,
    },
    filterChip: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm + 2,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
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

    // List Header
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: SPACING.lg,
    },
    listTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    listCount: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },

    // Proposal Cards
    proposalCard: {
        backgroundColor: COLORS.surfaceDark,
        borderRadius: RADIUS.xxl,
        padding: SPACING.xl,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.borderDark,
    },
    proposalCardFaded: {
        opacity: 0.5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    propIdBadge: {
        backgroundColor: COLORS.bgDark + 'CC',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: RADIUS.sm,
    },
    propIdText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    onChainBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary + '25',
    },
    onChainText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.primary,
    },
    proposalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
        lineHeight: 22,
        marginBottom: SPACING.sm,
        paddingRight: SPACING.lg,
    },
    proposalDesc: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.lg,
    },

    // AI Score
    aiScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        backgroundColor: COLORS.bgDark + '80',
        padding: SPACING.md,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.borderDark,
        borderStyle: 'dashed',
        marginBottom: SPACING.lg,
    },
    aiScoreCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiScoreContent: {
        flex: 1,
    },
    aiScoreHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    aiScoreLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    aiScoreValue: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    aiScoreMax: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '400',
        color: COLORS.textMuted,
    },
    aiAnalysis: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
    },

    // Progress
    progressSection: {
        marginTop: SPACING.lg,
    },
    progressBar: {
        height: 6,
        backgroundColor: COLORS.borderDark,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    progressLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    // Footer
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderDark,
        paddingTop: SPACING.md,
        marginTop: SPACING.sm,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    voteNowButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.sm + 2,
        borderRadius: RADIUS.md,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    voteNowText: {
        color: COLORS.bgDark,
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 100,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});
