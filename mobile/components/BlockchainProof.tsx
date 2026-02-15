/**
 * CampusTrust AI - Blockchain Proof Component
 * ============================================
 * Displays blockchain transaction proof with full details
 * and links to explorer for verification.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

interface BlockchainProofProps {
  proof: {
    success: boolean;
    txId: string;
    confirmedRound?: number;
    timestamp?: string;
    blockTimestamp?: string;
    explorerUrl?: string;
    action?: string;
    details?: any;
    network?: string;
    fee?: string;
    requestId?: string;
    stages?: Array<{ name: string; status: string; eta?: string }>;
    aiScore?: number;
    verified?: boolean;
    credentialId?: string;
    issuer?: string;
    issuedDate?: string;
    expiryDate?: string;
    blockchainRecord?: any;
    hashVerification?: any;
  };
  onClose?: () => void;
}

export default function BlockchainProof({ proof, onClose }: BlockchainProofProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const openExplorer = () => {
    if (proof.explorerUrl) {
      Linking.openURL(proof.explorerUrl);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: proof.success ? COLORS.success + '20' : '#EF4444' + '20' }]}>
            <Ionicons
              name={proof.success ? 'checkmark-circle' : 'close-circle'}
              size={32}
              color={proof.success ? COLORS.success : '#EF4444'}
            />
          </View>
          <Text style={styles.title}>{proof.success ? 'Transaction Confirmed' : 'Transaction Failed'}</Text>
          <Text style={styles.subtitle}>
            {proof.action ? proof.action.replace(/_/g, ' ') : 'Blockchain Operation'}
          </Text>
          {proof.network && (
            <View style={styles.networkBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} />
              <Text style={styles.networkText}>{proof.network}</Text>
            </View>
          )}
        </View>

        {/* Transaction ID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction ID</Text>
          <View style={styles.txIdBox}>
            <Text style={styles.txIdText} numberOfLines={2}>
              {proof.txId}
            </Text>
          </View>
          {proof.explorerUrl && (
            <TouchableOpacity style={styles.explorerButton} onPress={openExplorer}>
              <Ionicons name="open-outline" size={16} color={COLORS.primary} />
              <Text style={styles.explorerButtonText}>View on Algorand Explorer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Blockchain Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blockchain Details</Text>
          <View style={styles.detailsCard}>
            {proof.confirmedRound && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Confirmed Round</Text>
                <Text style={styles.detailValue}>#{proof.confirmedRound.toLocaleString()}</Text>
              </View>
            )}
            {proof.timestamp && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Timestamp</Text>
                <Text style={styles.detailValue}>{formatDate(proof.timestamp)}</Text>
              </View>
            )}
            {proof.fee && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction Fee</Text>
                <Text style={styles.detailValue}>{proof.fee}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Request Stages (for permission requests) */}
        {proof.stages && proof.stages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Approval Pipeline</Text>
            <View style={styles.stagesCard}>
              {proof.stages.map((stage, index) => (
                <View key={index} style={[styles.stageRow, index < proof.stages!.length - 1 && styles.stageRowBorder]}>
                  <View style={styles.stageLeft}>
                    <Ionicons
                      name={
                        stage.status === 'completed'
                          ? 'checkmark-circle'
                          : stage.status === 'in_progress'
                          ? 'hourglass'
                          : 'ellipse-outline'
                      }
                      size={20}
                      color={
                        stage.status === 'completed'
                          ? COLORS.success
                          : stage.status === 'in_progress'
                          ? '#F59E0B'
                          : COLORS.textMuted
                      }
                    />
                    <Text style={styles.stageName}>{stage.name}</Text>
                  </View>
                  {stage.eta && (
                    <Text style={styles.stageEta}>{stage.eta}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Score (for grants) */}
        {proof.aiScore !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Evaluation</Text>
            <View style={styles.aiScoreCard}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreText}>{proof.aiScore}</Text>
                <Text style={styles.scoreOutOf}>/100</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiVerdict}>
                  {proof.aiScore >= 70 ? '✅ AUTO-APPROVED' : '⚠️ MANUAL REVIEW REQUIRED'}
                </Text>
                <Text style={styles.aiVerdictDesc}>
                  {proof.aiScore >= 70
                    ? 'Your proposal passed AI evaluation and is recommended for approval.'
                    : 'Your proposal requires additional review by the committee.'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Credential Verification */}
        {proof.verified && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification Report</Text>
            <View style={styles.verificationCard}>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
                <Text style={styles.verifiedText}>VERIFIED ON BLOCKCHAIN</Text>
              </View>
              
              {proof.issuer && (
                <View style={styles.credentialRow}>
                  <Text style={styles.credentialLabel}>Issuer</Text>
                  <Text style={styles.credentialValue}>{proof.issuer}</Text>
                </View>
              )}
              
              {proof.issuedDate && (
                <View style={styles.credentialRow}>
                  <Text style={styles.credentialLabel}>Issued</Text>
                  <Text style={styles.credentialValue}>{proof.issuedDate}</Text>
                </View>
              )}
              
              {proof.expiryDate && (
                <View style={styles.credentialRow}>
                  <Text style={styles.credentialLabel}>Expires</Text>
                  <Text style={styles.credentialValue}>{proof.expiryDate}</Text>
                </View>
              )}

              {proof.blockchainRecord && (
                <View style={[styles.credentialRow, { marginTop: SPACING.md }]}>
                  <Text style={styles.credentialLabel}>Asset ID</Text>
                  <Text style={styles.credentialValue}>#{proof.blockchainRecord.assetId}</Text>
                </View>
              )}

              {proof.hashVerification && (
                <View style={styles.hashSection}>
                  <Text style={styles.hashTitle}>Document Hash Match</Text>
                  <View style={styles.hashMatch}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                    <Text style={styles.hashMatchText}>Document integrity verified ✅</Text>
                  </View>
                  <Text style={styles.hashAlgo}>Algorithm: {proof.hashVerification.algorithm}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Additional Details */}
        {proof.details && Object.keys(proof.details).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <View style={styles.detailsCard}>
              {Object.entries(proof.details).map(([key, value]) => {
                if (typeof value === 'object') return null;
                return (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>
                      {String(value)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Close Button */}
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      )}
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
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  networkText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  txIdBox: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  txIdText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.primary,
    fontWeight: '500',
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '15',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  explorerButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailsCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark + '40',
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  stagesCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  stageRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark + '40',
  },
  stageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  stageName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  stageEta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  aiScoreCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  scoreText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreOutOf: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  aiVerdict: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  aiVerdictDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  verificationCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
  },
  verifiedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.success,
  },
  credentialRow: {
    paddingVertical: SPACING.sm,
  },
  credentialLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  credentialValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  hashSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
  },
  hashTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  hashMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  hashMatchText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '500',
  },
  hashAlgo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  closeButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.bgDark,
  },
});
