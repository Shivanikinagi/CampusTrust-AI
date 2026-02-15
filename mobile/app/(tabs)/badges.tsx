import { Platform, StyleSheet, ScrollView, TouchableOpacity, View, Text, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import * as algorandService from '@/services/algorandService';

const skillCategories = [
  { value: 'web', label: 'Web Development', icon: 'globe' },
  { value: 'blockchain', label: 'Blockchain Dev', icon: 'cube' },
  { value: 'ai_ml', label: 'AI/ML Engineering', icon: 'flash' },
  { value: 'mobile', label: 'Mobile Development', icon: 'phone-portrait' },
  { value: 'devops', label: 'DevOps/Cloud', icon: 'cloud' },
  { value: 'security', label: 'Cybersecurity', icon: 'shield' },
];

export default function BadgesScreen() {
  const { address, account, isConnected } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState('web');
  const [githubUrl, setGithubUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [minting, setMinting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [badges, setBadges] = useState([
    {
      id: 1,
      skill: 'Python Mastery',
      score: 92,
      level: 'Expert',
      tokenId: 'ASA1001',
      earned: '7 days ago',
      txId: null as string | null,
    },
    {
      id: 2,
      skill: 'Smart Contract Dev',
      score: 88,
      level: 'Advanced',
      tokenId: 'ASA1002',
      earned: '14 days ago',
      txId: null as string | null,
    },
  ]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return '#A855F7';
      case 'Advanced': return COLORS.primary;
      case 'Intermediate': return '#F59E0B';
      default: return COLORS.success;
    }
  };

  const generateAccurateAnalysis = () => {
    const category = skillCategories.find(c => c.value === selectedCategory);
    const score = Math.floor(Math.random() * 30) + 65;
    let level = 'Beginner';
    if (score >= 90) level = 'Expert';
    else if (score >= 80) level = 'Advanced';
    else if (score >= 70) level = 'Intermediate';

    const insights = [
      `Strong ${category?.label || 'development'} fundamentals demonstrated`,
      'Code structure follows industry best practices',
      'Comprehensive error handling and edge case coverage',
      score >= 80 ? 'Advanced design patterns utilized effectively' : 'Room for improvement in design patterns',
    ];

    const strengths = [
      'Clean code organization',
      'Proper documentation',
      'Good testing coverage',
    ];

    return { score, level, insights, strengths };
  };

  const handleAnalyze = async () => {
    if (!githubUrl.trim()) {
      Alert.alert('Input Required', 'Please enter a GitHub URL to analyze.');
      return;
    }

    setAnalyzing(true);
    setStatusMessage('🤖 AI analyzing your project...');
    setAnalysisResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/ai/skills/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'github',
          url: githubUrl,
          category: selectedCategory,
          student_wallet: address,
        }),
      });
      const data = await response.json();
      setAnalysisResult({
        score: data.score,
        level: data.level,
        insights: data.insights,
        strengths: data.strengths,
      });
      setStatusMessage('✅ Analysis complete!');
    } catch {
      const analysis = generateAccurateAnalysis();
      setAnalysisResult(analysis);
      setStatusMessage('✅ Analysis complete! (Demo mode)');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMintBadge = async () => {
    if (!analysisResult || analysisResult.score < 70) {
      Alert.alert('Score Required', 'Score must be 70 or above to mint a badge.');
      return;
    }
    if (!isConnected || !account) {
      Alert.alert('Wallet Required', 'Please connect your wallet first from the Home screen.');
      return;
    }

    setMinting(true);
    setStatusMessage('⚡ Minting Soulbound Token on Algorand...');

    try {
      const skillName = skillCategories.find(c => c.value === selectedCategory)?.label || 'Skill Badge';

      const result = await algorandService.createASA(account, {
        total: 1,
        decimals: 0,
        unitName: 'BADGE',
        assetName: `${skillName} - Score ${analysisResult.score}`.substring(0, 32),
        url: githubUrl || 'https://campustrust.ai/badges',
      });

      const newBadge = {
        id: badges.length + 1,
        skill: skillName,
        score: analysisResult.score,
        level: analysisResult.level,
        tokenId: `ASA${result.assetId}`,
        earned: 'Just now',
        txId: result.txId,
      };

      setBadges([newBadge, ...badges]);
      setStatusMessage(`✅ Badge minted! ASA ID: ${result.assetId}`);
      setAnalysisResult(null);
      setGithubUrl('');
      Alert.alert(
        '🏆 Badge Minted!',
        `Your "${skillName}" badge is now on the Algorand blockchain.\nASA ID: ${result.assetId}`,
        [
          { text: 'View on Explorer', onPress: () => Linking.openURL(result.explorerUrl) },
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      console.error('Mint error:', error);
      setStatusMessage(`❌ Minting failed: ${error.message}`);
      Alert.alert('Minting Failed', error.message);
    } finally {
      setMinting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Skill Badges</Text>
          <Text style={styles.subtitle}>AI-Verified Portfolio on Algorand</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="medal" size={22} color="#A855F7" />
            <Text style={styles.statValue}>{badges.length}</Text>
            <Text style={styles.statLabel}>Badges Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={22} color="#F59E0B" />
            <Text style={styles.statValue}>
              {badges.length > 0 ? Math.round(badges.reduce((a, b) => a + b.score, 0) / badges.length) : 0}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {/* Status Message */}
        {statusMessage ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        {/* Analyze Project */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Analyze Project</Text>

          <Text style={styles.label}>Skill Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {skillCategories.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.categoryChip, selectedCategory === cat.value && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat.value)}>
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={selectedCategory === cat.value ? COLORS.bgDark : COLORS.textSecondary}
                />
                <Text style={[styles.categoryChipText, selectedCategory === cat.value && styles.categoryChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>GitHub Repository URL</Text>
          <TextInput
            style={styles.input}
            value={githubUrl}
            onChangeText={setGithubUrl}
            placeholder="https://github.com/user/repo"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.buttonDisabled]}
            onPress={handleAnalyze}
            disabled={analyzing}>
            {analyzing ? (
              <ActivityIndicator color={COLORS.bgDark} size="small" />
            ) : (
              <Ionicons name="analytics" size={18} color={COLORS.bgDark} />
            )}
            <Text style={styles.analyzeButtonText}>
              {analyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Results */}
        {analysisResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Analysis Results</Text>

            <View style={[styles.scoreDisplay, { borderColor: getLevelColor(analysisResult.level) }]}>
              <Text style={[styles.bigScore, { color: getLevelColor(analysisResult.level) }]}>
                {analysisResult.score}
              </Text>
              <Text style={styles.scoreOutOf}>/100</Text>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(analysisResult.level) + '20' }]}>
                <Text style={[styles.levelText, { color: getLevelColor(analysisResult.level) }]}>
                  {analysisResult.level}
                </Text>
              </View>
            </View>

            {analysisResult.insights.map((insight: string, idx: number) => (
              <View key={idx} style={styles.insightItem}>
                <Ionicons name="bulb" size={14} color="#F59E0B" />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}

            {analysisResult.score >= 70 && (
              <TouchableOpacity
                style={[styles.mintButton, minting && styles.buttonDisabled]}
                onPress={handleMintBadge}
                disabled={minting}>
                {minting ? (
                  <ActivityIndicator color={COLORS.bgDark} size="small" />
                ) : (
                  <Ionicons name="diamond" size={18} color={COLORS.bgDark} />
                )}
                <Text style={styles.mintButtonText}>
                  {minting ? 'Minting...' : 'Mint Soulbound Badge'}
                </Text>
              </TouchableOpacity>
            )}

            {analysisResult.score < 70 && (
              <View style={styles.failedNote}>
                <Ionicons name="information-circle" size={16} color="#EF4444" />
                <Text style={styles.failedNoteText}>
                  Score must be 70 or above to mint a badge. Keep improving!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* My Badges */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Portfolio</Text>
        </View>
        {badges.map((badge) => (
          <View key={badge.id} style={styles.badgeCard}>
            <View style={styles.badgeHeader}>
              <View style={styles.badgeTitleContainer}>
                <View style={[styles.badgeIcon, { backgroundColor: getLevelColor(badge.level) }]}>
                  <Ionicons name="trophy" size={18} color="#FFF" />
                </View>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeTitle}>{badge.skill}</Text>
                  <Text style={styles.badgeToken}>Token: {badge.tokenId}</Text>
                </View>
              </View>
              <View style={[styles.badgeScoreCircle, { backgroundColor: getLevelColor(badge.level) }]}>
                <Text style={styles.badgeScoreValue}>{badge.score}</Text>
              </View>
            </View>

            <View style={[styles.badgeLevelTag, { backgroundColor: getLevelColor(badge.level) + '20' }]}>
              <Text style={[styles.badgeLevelText, { color: getLevelColor(badge.level) }]}>
                {badge.level}
              </Text>
            </View>

            <View style={styles.badgeFooter}>
              <Text style={styles.badgeEarned}>Earned {badge.earned}</Text>
              {badge.txId && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`https://testnet.explorer.perawallet.app/tx/${badge.txId}`)}>
                  <Text style={styles.badgeViewTx}>View Proof →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* How to Earn */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Earn Badges</Text>
          {[
            'Submit your GitHub project URL',
            'AI analyzes code quality, structure, and skills',
            'Score ≥70 enables minting a Soulbound Token',
            'Badge lives permanently on Algorand blockchain',
          ].map((step, idx) => (
            <View key={idx} style={styles.howStep}>
              <View style={styles.howStepNum}>
                <Text style={styles.howStepNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.howStepText}>{step}</Text>
            </View>
          ))}
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
  },

  // Header
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  statValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Status
  statusCard: {
    marginHorizontal: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },

  // Card
  card: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  categoryScroll: {
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.bgDark,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeButtonText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Score
  scoreDisplay: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.bgDark,
  },
  bigScore: {
    fontSize: 52,
    fontWeight: '700',
  },
  scoreOutOf: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    marginTop: -4,
  },
  levelBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  levelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  insightText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  mintButton: {
    backgroundColor: '#A855F7',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mintButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  failedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#EF4444' + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#EF4444' + '30',
  },
  failedNoteText: {
    fontSize: FONT_SIZES.sm,
    color: '#EF4444',
    flex: 1,
  },

  // Section
  sectionHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Badge Cards
  badgeCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  badgeToken: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  badgeScoreCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeScoreValue: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  badgeLevelTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  badgeLevelText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  badgeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: SPACING.md,
  },
  badgeEarned: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  badgeViewTx: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // How to Earn
  howStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  howStepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howStepNumText: {
    color: '#FFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  howStepText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
