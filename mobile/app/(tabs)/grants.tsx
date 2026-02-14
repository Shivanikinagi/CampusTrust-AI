import { StyleSheet, ScrollView, TouchableOpacity, View, Text, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

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

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Smart Grants</ThemedText>
        <ThemedText style={styles.subtitle}>AI-powered project funding</ThemedText>
      </ThemedView>

      {/* Apply for Grant */}
      <View style={styles.applyCard}>
        <Text style={styles.cardTitle}>Apply for Grant</Text>

        <Text style={styles.label}>Project Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter project title"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Budget (ALGO)</Text>
        <TextInput
          style={styles.input}
          placeholder="500"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your project..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.submitButton}>
          <IconSymbol size={20} name="checkmark.circle.fill" color="#fff" />
          <Text style={styles.submitButtonText}>Get AI Evaluation</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <IconSymbol size={16} name="info.circle.fill" color="#06b6d4" />
          <Text style={styles.infoText}>
            AI will evaluate your proposal. Score ≥70 gets auto-approved!
          </Text>
        </View>
      </View>

      {/* My Projects */}
      <View style={styles.projectsSection}>
        <Text style={styles.sectionTitle}>My Projects</Text>

        {projects.map((project) => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View style={styles.projectInfo}>
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
                    <View style={[styles.milestoneIndicator, {
                      backgroundColor: milestone.status === 'completed' ? '#22c55e' :
                                    milestone.status === 'in_progress' ? '#3b82f6' : '#64748b'
                    }]} />
                    <View>
                      <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                      <Text style={styles.milestoneAmount}>{milestone.amount} ALGO</Text>
                    </View>
                  </View>
                  <Text style={[styles.milestoneStatus, {
                    color: milestone.status === 'completed' ? '#22c55e' :
                           milestone.status === 'in_progress' ? '#3b82f6' : '#64748b'
                  }]}>
                    {milestone.status === 'completed' ? '✓ Paid' :
                     milestone.status === 'in_progress' ? 'In Progress' : 'Locked'}
                  </Text>
                </View>
              ))}

              {project.milestones[1].status === 'in_progress' && (
                <TouchableOpacity style={styles.claimButton}>
                  <Text style={styles.claimButtonText}>Claim Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* How It Works */}
      <View style={styles.howItWorksCard}>
        <Text style={styles.cardTitle}>How It Works</Text>
        <View style={styles.stepRow}>
sendMessage          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
          <Text style={styles.stepText}>Submit proposal for AI evaluation</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
          <Text style={styles.stepText}>AI checks feasibility & budget</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
          <Text style={styles.stepText}>Complete milestones to unlock funds</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
          <Text style={styles.stepText}>Smart contract releases payment automatically</Text>
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
  applyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#0c4a6e',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  infoText: {
    color: '#bae6fd',
    fontSize: 12,
    flex: 1,
  },
  projectsSection: {
    padding: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectBudget: {
    color: '#22c55e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  aiScoreBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  aiScoreLabel: {
    color: '#bfdbfe',
    fontSize: 10,
  },
  aiScoreValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  milestonesContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
  },
  milestonesTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  milestoneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestoneTitle: {
    color: '#fff',
    fontSize: 14,
  },
  milestoneAmount: {
    color: '#94a3b8',
    fontSize: 12,
  },
  milestoneStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  claimButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  howItWorksCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    color: '#e2e8f0',
    fontSize: 14,
    flex: 1,
  },
});
