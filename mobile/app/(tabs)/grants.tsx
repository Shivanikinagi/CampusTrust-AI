import { Platform, StyleSheet, ScrollView, TouchableOpacity, View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

export default function GrantsScreen() {
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

  const projects = [
    {
      id: 1,
      title: 'IoT Smart Campus System',
      budget: 500,
      aiScore: 92,
      milestones: [
        { title: 'Proposal', amount: 125, status: 'completed' },
        { title: 'Prototype', amount: 250, status: 'in_progress' },
        { title: 'Final', amount: 125, status: 'locked' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in_progress': return COLORS.primary;
      default: return COLORS.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '✓ Paid';
      case 'in_progress': return 'In Progress';
      default: return 'Locked';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Smart Grants</Text>
          <Text style={styles.subtitle}>AI-powered project funding</Text>
        </View>

        {/* Apply for Grant */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apply for Grant</Text>

          <Text style={styles.label}>Project Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project title"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.label}>Budget (ALGO)</Text>
          <TextInput
            style={styles.input}
            placeholder="500"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your project..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.submitButton}>
            <Ionicons name="sparkles" size={20} color={COLORS.bgDark} />
            <Text style={styles.submitButtonText}>Get AI Evaluation</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              AI will evaluate your proposal. Score ≥70 gets auto-approved!
            </Text>
          </View>
        </View>

        {/* My Projects */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Projects</Text>
        </View>

        {projects.map((project) => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectBudget}>{project.budget} ALGO</Text>
              </View>
              <View style={styles.aiScoreBadge}>
                <Text style={styles.aiScoreLabel}>AI</Text>
                <Text style={styles.aiScoreValue}>{project.aiScore}</Text>
              </View>
            </View>

            <View style={styles.milestonesContainer}>
              <Text style={styles.milestonesTitle}>Milestones & Funding</Text>
              {project.milestones.map((milestone, idx) => (
                <View key={idx} style={styles.milestoneRow}>
                  <View style={styles.milestoneInfo}>
                    <View style={[styles.milestoneIndicator, { backgroundColor: getStatusColor(milestone.status) }]} />
                    <View>
                      <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                      <Text style={styles.milestoneAmount}>{milestone.amount} ALGO</Text>
                    </View>
                  </View>
                  <Text style={[styles.milestoneStatus, { color: getStatusColor(milestone.status) }]}>
                    {getStatusLabel(milestone.status)}
                  </Text>
                </View>
              ))}

              {project.milestones[1].status === 'in_progress' && (
                <TouchableOpacity style={styles.claimButton}>
                  <Ionicons name="download" size={16} color={COLORS.bgDark} />
                  <Text style={styles.claimButtonText}>Claim Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* How It Works */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          {[
            'Submit proposal for AI evaluation',
            'AI checks feasibility & budget',
            'Complete milestones to unlock funds',
            'Smart contract releases payment automatically',
          ].map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
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
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  infoText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },

  // Section
  sectionHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Project Card
  projectCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  projectTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  projectBudget: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aiScoreBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
  },
  aiScoreLabel: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  aiScoreValue: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },

  // Milestones
  milestonesContainer: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  milestonesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  milestoneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestoneTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  milestoneAmount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  milestoneStatus: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  claimButtonText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },

  // How It Works
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: COLORS.bgDark,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    flex: 1,
  },
});
