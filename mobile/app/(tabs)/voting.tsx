import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, TextInput, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import * as algorandService from '@/services/algorandService';
import InfoModal from '@/components/InfoModal';
import { useInfoModal } from '@/hooks/useInfoModal';

type FilterTab = 'active' | 'past' | 'mine';

interface Proposal {
    id: string;
    title: string;
    description: string;
    aiScore: number;
    scoreColor: string;
    analysis: string;
    endsIn: string;
    onChain: boolean;
    votesYes: number;
    votesNo: number;
    filter: FilterTab;
    voted?: 'yes' | 'no' | null;
}

export default function VotingScreen() {
    const { isConnected, address, isDemoMode } = useWallet();
    const [activeFilter, setActiveFilter] = useState<FilterTab>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { modalState, hideModal, showInfo, showError, showWarning } = useInfoModal();
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [showProofModal, setShowProofModal] = useState(false);
    const [blockchainProof, setBlockchainProof] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [proposals, setProposals] = useState<Proposal[]>([
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
            filter: 'active',
            voted: null,
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
            filter: 'active',
            voted: null,
        },
        {
            id: '#PROP-1022',
            title: 'Campus WiFi Upgrade - Phase 2',
            description: 'Hardware procurement for dormitories. Completed with 79% approval vote.',
            aiScore: 85,
            scoreColor: COLORS.primary,
            analysis: 'Strong technical justification.',
            endsIn: 'Voting closed',
            onChain: true,
            votesYes: 79,
            votesNo: 21,
            filter: 'past',
            voted: 'yes',
        },
        {
            id: '#PROP-1019',
            title: 'New Lab Equipment for CS Department',
            description: 'Request for 20 high-spec workstations with GPUs for AI/ML curriculum.',
            aiScore: 88,
            scoreColor: COLORS.primary,
            analysis: 'Well-justified budget allocation.',
            endsIn: 'Ended 3 days ago',
            onChain: true,
            votesYes: 82,
            votesNo: 18,
            filter: 'past',
            voted: 'yes',
        },
        {
            id: '#PROP-1026',
            title: 'Student Council Travel Fund',
            description: 'My proposal to establish a reimbursable travel fund for student conference attendance.',
            aiScore: 74,
            scoreColor: '#F59E0B',
            analysis: 'Policy clarity needs improvement.',
            endsIn: 'Ends in 4 days',
            onChain: true,
            votesYes: 31,
            votesNo: 12,
            filter: 'mine',
            voted: null,
        },
    ]);

    const handleVote = async (proposalId: string, vote: 'yes' | 'no', proposalTitle: string) => {
        if (!isConnected && !isDemoMode) {
            showWarning('Wallet Required', 'Please connect your Algorand wallet from the Home screen to vote.');
            return;
        }

        setIsSubmitting(true);
        try {
            const proof = await algorandService.castVote(address || 'DEMO', proposalId, vote, proposalTitle);
            
            setProposals(prev => prev.map(p => {
                if (p.id === proposalId) {
                    const wasYes = p.voted === 'yes';
                    const wasNo = p.voted === 'no';
                    let newYes = p.votesYes;
                    let newNo = p.votesNo;

                    if (wasYes) newYes--;
                    if (wasNo) newNo--;

                    if (vote === 'yes') newYes++;
                    else newNo++;

                    return { ...p, voted: vote, votesYes: newYes, votesNo: newNo };
                }
                return p;
            }));

            setBlockchainProof(proof);
            setShowProofModal(true);
        } catch (error: any) {
            showError('Vote Failed', error.message || 'Failed to cast vote on blockchain.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateProposal = async () => {
        if (!newTitle.trim() || !newDescription.trim()) {
            showWarning('Missing Fields', 'Please enter both a title and description.');
            return;
        }
        if (!isConnected && !isDemoMode) {
            showWarning('Wallet Required', 'Please connect your Algorand wallet first.');
            return;
        }

        setIsSubmitting(true);
        try {
            const proof = await algorandService.createProposal(address || 'DEMO', newTitle, newDescription) as any;

            const newProp: Proposal = {
                id: proof.proposalId || `#PROP-${Date.now()}`,
                title: newTitle,
                description: newDescription,
                aiScore: proof.aiScore || 85,
                scoreColor: (proof.aiScore || 85) >= 80 ? COLORS.primary : '#F59E0B',
                analysis: `AI Score: ${proof.aiScore || 85}/100`,
                endsIn: 'Ends in 7 days',
                onChain: true,
                votesYes: 0,
                votesNo: 0,
                filter: 'mine',
                voted: null,
            };
            setProposals(prev => [newProp, ...prev]);
            setNewTitle('');
            setNewDescription('');
            setShowCreateModal(false);
            setBlockchainProof(proof);
            setShowProofModal(true);
        } catch (error: any) {
            showError('Creation Failed', error.message || 'Failed to create proposal on blockchain.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProposals = proposals
        .filter(p => p.filter === activeFilter || (activeFilter === 'mine' && p.filter === 'mine'))
        .filter(p => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
        });

    const filterLabels: Record<FilterTab, string> = {
        active: 'Active Proposals',
        past: 'Past Proposals',
        mine: 'My Proposals',
    };

    const filters: { key: FilterTab; label: string }[] = [
        { key: 'active', label: 'Active' },
        { key: 'past', label: 'Past' },
        { key: 'mine', label: 'My Proposals' },
    ];

    const isClosedProposal = (p: Proposal) => p.filter === 'past';

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
                            <Text style={styles.networkText}>Algorand TestNet</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.notifButton}
                        onPress={() => showInfo('Notifications', 'No new voting notifications.')}>
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
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
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
                    <Text style={styles.listTitle}>{filterLabels[activeFilter]}</Text>
                    <Text style={styles.listCount}>{filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''}</Text>
                </View>

                {/* Empty State */}
                {filteredProposals.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No proposals match your search.' : 'No proposals found in this category.'}
                        </Text>
                    </View>
                )}

                {/* Proposal Cards */}
                {filteredProposals.map((proposal, index) => (
                    <View
                        key={proposal.id + index}
                        style={[styles.proposalCard, isClosedProposal(proposal) && styles.proposalCardFaded]}>

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

                        {/* Progress Bar */}
                        <View style={styles.progressSection}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, {
                                    width: `${Math.round((proposal.votesYes / Math.max(proposal.votesYes + proposal.votesNo, 1)) * 100)}%`,
                                    backgroundColor: proposal.voted === 'yes' ? COLORS.success : COLORS.primary,
                                }]} />
                            </View>
                            <View style={styles.progressLabels}>
                                <Text style={styles.progressLabel}>Yes: {proposal.votesYes}</Text>
                                <Text style={styles.progressLabel}>No: {proposal.votesNo}</Text>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.cardFooter}>
                            <View style={styles.timeRow}>
                                <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                                <Text style={styles.timeText}>{proposal.endsIn}</Text>
                            </View>
                            {!isClosedProposal(proposal) && !proposal.voted && (
                                <View style={styles.voteButtons}>
                                    <TouchableOpacity
                                        style={styles.voteYesButton}
                                        onPress={() => handleVote(proposal.id, 'yes', proposal.title)}
                                        disabled={isSubmitting}>
                                        <Ionicons name="thumbs-up" size={14} color={COLORS.bgDark} />
                                        <Text style={styles.voteYesText}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.voteNoButton}
                                        onPress={() => handleVote(proposal.id, 'no', proposal.title)}
                                        disabled={isSubmitting}>
                                        <Ionicons name="thumbs-down" size={14} color="#EF4444" />
                                        <Text style={styles.voteNoText}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {proposal.voted && (
                                <View style={[styles.votedBadge, { backgroundColor: proposal.voted === 'yes' ? COLORS.success + '20' : '#EF4444' + '20' }]}>
                                    <Ionicons
                                        name={proposal.voted === 'yes' ? 'checkmark-circle' : 'close-circle'}
                                        size={14}
                                        color={proposal.voted === 'yes' ? COLORS.success : '#EF4444'} />
                                    <Text style={[styles.votedText, { color: proposal.voted === 'yes' ? COLORS.success : '#EF4444' }]}>
                                        Voted {proposal.voted === 'yes' ? 'Yes' : 'No'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Floating Create Button */}
            <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
                <Ionicons name="add" size={28} color={COLORS.bgDark} />
            </TouchableOpacity>

            {/* Create Proposal Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Proposal</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.fieldLabel}>Proposal Title</Text>
                        <TextInput
                            style={styles.fieldInput}
                            placeholder="e.g. Extend Library Hours"
                            placeholderTextColor={COLORS.textMuted}
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />

                        <Text style={styles.fieldLabel}>Description</Text>
                        <TextInput
                            style={[styles.fieldInput, { minHeight: 100, textAlignVertical: 'top' }]}
                            placeholder="Describe your proposal in detail..."
                            placeholderTextColor={COLORS.textMuted}
                            multiline numberOfLines={4}
                            value={newDescription}
                            onChangeText={setNewDescription}
                        />

                        <View style={styles.aiHint}>
                            <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                            <Text style={styles.aiHintText}>AI will analyze and score your proposal automatically</Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.submitButton} 
                            onPress={handleCreateProposal}
                            disabled={isSubmitting}>
                            <Ionicons name="rocket" size={18} color={COLORS.bgDark} />
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? 'Submitting...' : 'Submit Proposal On-Chain'}
                            </Text>
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

                            {/* Action Details */}
                            {blockchainProof?.voteChoice && (
                                <View style={styles.proofSection}>
                                    <Text style={styles.proofSectionTitle}>Vote Details</Text>
                                    <View style={styles.proofField}>
                                        <Text style={styles.proofLabel}>Proposal</Text>
                                        <Text style={styles.proofValue}>{blockchainProof.proposalTitle || blockchainProof.proposalId}</Text>
                                    </View>
                                    <View style={styles.proofField}>
                                        <Text style={styles.proofLabel}>Your Vote</Text>
                                        <View style={styles.voteChoiceBadge}>
                                            <Ionicons 
                                                name={blockchainProof.voteChoice === 'yes' ? 'thumbs-up' : 'thumbs-down'} 
                                                size={14} 
                                                color={blockchainProof.voteChoice === 'yes' ? COLORS.success : '#EF4444'} 
                                            />
                                            <Text style={[
                                                styles.voteChoiceText,
                                                { color: blockchainProof.voteChoice === 'yes' ? COLORS.success : '#EF4444' }
                                            ]}>
                                                {blockchainProof.voteChoice.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.proofField}>
                                        <Text style={styles.proofLabel}>Voting Power</Text>
                                        <Text style={styles.proofValue}>{blockchainProof.votingPower} tokens</Text>
                                    </View>
                                </View>
                            )}

                            {/* Proposal Details */}
                            {blockchainProof?.proposalTitle && !blockchainProof?.voteChoice && (
                                <View style={styles.proofSection}>
                                    <Text style={styles.proofSectionTitle}>Proposal Created</Text>
                                    <View style={styles.proofField}>
                                        <Text style={styles.proofLabel}>Title</Text>
                                        <Text style={styles.proofValue}>{blockchainProof.proposalTitle}</Text>
                                    </View>
                                    {blockchainProof.aiScore && (
                                        <View style={styles.proofField}>
                                            <Text style={styles.proofLabel}>AI Quality Score</Text>
                                            <View style={styles.aiScoreBadge}>
                                                <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                                                <Text style={styles.aiScoreText}>{blockchainProof.aiScore}/100</Text>
                                            </View>
                                        </View>
                                    )}
                                    <View style={styles.proofField}>
                                        <Text style={styles.proofLabel}>Status</Text>
                                        <Text style={[styles.proofValue, { color: COLORS.success }]}>Active</Text>
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
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingTop: Platform.OS === 'ios' ? 60 : 44, marginBottom: SPACING.xl,
    },
    pageTitle: { fontSize: FONT_SIZES.xxxl, fontWeight: '700', color: COLORS.textPrimary },
    networkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    networkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    networkText: { fontSize: FONT_SIZES.xs, color: COLORS.primary + 'B0', fontWeight: '500' },
    notifButton: { position: 'relative', padding: 8, borderRadius: RADIUS.full },
    notifDot: {
        position: 'absolute', top: 8, right: 10, width: 8, height: 8,
        borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 2, borderColor: COLORS.bgDark,
    },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceDark,
        borderRadius: RADIUS.xl, marginBottom: SPACING.xl, paddingHorizontal: SPACING.md,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 14, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary },

    filterRow: { gap: SPACING.md, marginBottom: SPACING.xxl, paddingBottom: 2 },
    filterChip: {
        backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'transparent',
    },
    filterChipActive: {
        backgroundColor: COLORS.primary, shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    filterChipText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.textSecondary },
    filterChipTextActive: { color: COLORS.bgDark, fontWeight: '600' },

    listHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.lg,
    },
    listTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textPrimary },
    listCount: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, marginTop: SPACING.md, textAlign: 'center' },

    proposalCard: {
        backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.xxl, padding: SPACING.xl,
        marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.borderDark,
    },
    proposalCardFaded: { opacity: 0.6 },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md,
    },
    propIdBadge: { backgroundColor: COLORS.bgDark + 'CC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm },
    propIdText: {
        fontSize: FONT_SIZES.xs, color: COLORS.textMuted,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', textTransform: 'uppercase', letterSpacing: 0.5,
    },
    onChainBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.primary + '25',
    },
    onChainText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.primary },
    proposalTitle: {
        fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary,
        lineHeight: 22, marginBottom: SPACING.sm, paddingRight: SPACING.lg,
    },
    proposalDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.lg },

    aiScoreContainer: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        backgroundColor: COLORS.bgDark + '80', padding: SPACING.md, borderRadius: RADIUS.xl,
        borderWidth: 1, borderColor: COLORS.borderDark, borderStyle: 'dashed', marginBottom: SPACING.lg,
    },
    aiScoreCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
    aiScoreContent: { flex: 1 },
    aiScoreHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    aiScoreLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    aiScoreValue: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
    aiScoreMax: { fontSize: FONT_SIZES.xs, fontWeight: '400', color: COLORS.textMuted },
    aiAnalysis: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },

    progressSection: { marginBottom: SPACING.md },
    progressBar: { height: 6, backgroundColor: COLORS.borderDark, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: 6, borderRadius: 3 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    progressLabel: {
        fontSize: FONT_SIZES.xs, color: COLORS.textMuted,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: COLORS.borderDark, paddingTop: SPACING.md, marginTop: SPACING.sm,
    },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timeText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },

    voteButtons: { flexDirection: 'row', gap: SPACING.sm },
    voteYesButton: {
        flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    },
    voteYesText: { color: COLORS.bgDark, fontSize: FONT_SIZES.sm, fontWeight: '700' },
    voteNoButton: {
        flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
        borderWidth: 1, borderColor: '#EF4444' + '50',
    },
    voteNoText: { color: '#EF4444', fontSize: FONT_SIZES.sm, fontWeight: '600' },

    votedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    },
    votedText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },

    fab: {
        position: 'absolute', bottom: 100, right: SPACING.xl, width: 56, height: 56,
        borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: COLORS.surfaceDark, borderTopLeftRadius: RADIUS.xxl,
        borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHandle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.borderLight,
        alignSelf: 'center', marginBottom: SPACING.xl,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xxl,
    },
    modalTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.textPrimary },
    fieldLabel: {
        fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary,
        marginBottom: SPACING.sm, marginTop: SPACING.md,
    },
    fieldInput: {
        backgroundColor: COLORS.bgDark, borderRadius: RADIUS.lg, padding: SPACING.md,
        fontSize: FONT_SIZES.md, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.borderDark,
    },
    aiHint: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        backgroundColor: COLORS.primary + '10', padding: SPACING.md,
        borderRadius: RADIUS.lg, marginTop: SPACING.lg,
    },
    aiHintText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, flex: 1 },
    submitButton: {
        backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.lg,
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    submitButtonText: { color: COLORS.bgDark, fontSize: FONT_SIZES.lg, fontWeight: '700' },

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
    voteChoiceBadge: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.bgDark, borderRadius: RADIUS.md,
        alignSelf: 'flex-start',
    },
    voteChoiceText: { fontSize: FONT_SIZES.md, fontWeight: '700', letterSpacing: 0.5 },
    aiScoreBadge: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.md,
        alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.primary + '30',
    },
    aiScoreText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.primary },
    networkBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
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
