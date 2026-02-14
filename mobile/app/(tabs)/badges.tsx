import { StyleSheet, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

export default function BadgesScreen() {
  const [badges, setBadges] = useState([
    {
      id: 1,
      skill: 'Python Mastery',
      score: 92,
      level: 'Expert',
      tokenId: 'ASA1001',
      earned: '7 days ago',
    },
    {
      id: 2,
      skill: 'Smart Contract Dev',
      score: 88,
      level: 'Advanced',
      tokenId: 'ASA1002',
      earned: '14 days ago',
    },
    {
      id: 3,
      skill: 'AI/ML Engineering',
      score: 85,
      level: 'Advanced',
      tokenId: 'ASA1003',
      earned: '21 days ago',
    },
  ]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return '#a855f7';
      case 'Advanced': return '#3b82f6';
      default: return '#22c55e';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Skill Badges</ThemedText>
        <ThemedText style={styles.subtitle}>Verifiable skills on Algorand</ThemedText>
      </ThemedView>

      {/* Overview Stats */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewValue}>{badges.length}</Text>
          <Text style={styles.overviewLabel}>Badges Earned</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.overviewStat}>
          <Text style={styles.overviewValue}>
            {Math.round(badges.reduce((acc, b) => acc + b.score, 0) / badges.length)}
          </Text>
          <Text style={styles.overviewLabel}>Avg Score</Text>
        </View>
      </View>

      {/* Earn New Badge Button */}
      <TouchableOpacity style={styles.earnButton}>
        <IconSymbol size={24} name="plus.circle.fill" color="#fff" />
        <Text style={styles.earnButtonText}>Earn New Badge</Text>
      </TouchableOpacity>

      {/* Badges Grid */}
      <View style={styles.badgesContainer}>
        <Text style={styles.sectionTitle}>My Portfolio</Text>
        {badges.map((badge) => (
          <View key={badge.id} style={styles.badgeCard}>
            <View style={styles.badgeHeader}>
              <View style={styles.badgeTitleContainer}>
                <IconSymbol size={32} name="trophy.fill" color={getLevelColor(badge.level)} />
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeTitle}>{badge.skill}</Text>
                  <Text style={styles.badgeToken}>Token: {badge.tokenId}</Text>
                </View>
              </View>
              <View style={styles.badgeScore}>
                <Text style={styles.badgeScoreValue}>{badge.score}</Text>
              </View>
            </View>

            <View style={[styles.badgeLevel, { backgroundColor: getLevelColor(badge.level) + '30' }]}>
              <Text style={[styles.badgeLevelText, { color: getLevelColor(badge.level) }]}>
                {badge.level}
              </Text>
            </View>

            <View style={styles.badgeFooter}>
              <Text style={styles.badgeEarned}>Earned {badge.earned}</Text>
              <TouchableOpacity>
                <Text style={styles.badgeView}>View →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* How to Earn Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How to Earn Badges</Text>
        <View style={styles.infoStep}>
          <Text style={styles.infoStepNumber}>1</Text>
          <Text style={styles.infoStepText}>Submit your GitHub project or PDF report</Text>
        </View>
        <View style={styles.infoStep}>
          <Text style={styles.infoStepNumber}>2</Text>
          <Text style={styles.infoStepText}>AI analyzes your code quality and skills</Text>
        </View>
        <View style={styles.infoStep}>
          <Text style={styles.infoStepNumber}>3</Text>
          <Text style={styles.infoStepText}>Score ≥70 mints a Soulbound Token on Algorand</Text>
        </View>
        <View style={styles.infoStep}>
          <Text style={styles.infoStepNumber}>4</Text>
          <Text style={styles.infoStepText}>Badge lives permanently on blockchain</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  overviewCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#334155',
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    color: '#a855f7',
    fontSize: 36,
    fontWeight: 'bold',
  },
  overviewLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#334155',
    marginHorizontal: 16,
  },
  earnButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  earnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  badgesContainer: {
    padding: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  badgeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badgeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  badgeToken: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  badgeScore: {
    backgroundColor: '#a855f7',
    borderRadius: 20,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeScoreValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  badgeLevel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeLevelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeEarned: {
    color: '#94a3b8',
    fontSize: 12,
  },
  badgeView: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  infoTitle: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoStepNumber: {
    color: '#a855f7',
    fontSize: 20,
    fontWeight: 'bold',
    width: 28,
  },
  infoStepText: {
    color: '#e2e8f0',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
