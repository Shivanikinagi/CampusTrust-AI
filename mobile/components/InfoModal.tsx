/**
 * InfoModal - Styled replacement for Alert.alert
 * ================================================
 * Dark-themed modal that replaces native white popup alerts.
 * Supports: success, error, warning, info types with icons.
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

type ModalType = 'success' | 'error' | 'warning' | 'info';

interface InfoModalAction {
  label: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: ModalType;
  actions?: InfoModalAction[];
}

const TYPE_CONFIG: Record<ModalType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  success: { icon: 'checkmark-circle', color: COLORS.success },
  error: { icon: 'close-circle', color: COLORS.danger },
  warning: { icon: 'warning', color: COLORS.warning },
  info: { icon: 'information-circle', color: COLORS.info },
};

export default function InfoModal({ visible, onClose, title, message, type = 'info', actions }: InfoModalProps) {
  const config = TYPE_CONFIG[type];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon} size={36} color={config.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <ScrollView style={styles.messageScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.message}>{message}</Text>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {actions && actions.length > 0 ? (
              actions.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.actionBtn,
                    action.style === 'destructive' && styles.actionBtnDestructive,
                    action.style === 'cancel' && styles.actionBtnCancel,
                    idx === actions.length - 1 && styles.actionBtnPrimary,
                  ]}
                  onPress={() => { action.onPress(); onClose(); }}
                >
                  <Text
                    style={[
                      styles.actionText,
                      action.style === 'destructive' && styles.actionTextDestructive,
                      action.style === 'cancel' && styles.actionTextCancel,
                      idx === actions.length - 1 && styles.actionTextPrimary,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={onClose}>
                <Text style={[styles.actionText, styles.actionTextPrimary]}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  container: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  messageScroll: {
    maxHeight: 200,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionBtnDestructive: {
    backgroundColor: COLORS.danger + '18',
    borderColor: COLORS.danger + '40',
  },
  actionBtnCancel: {
    backgroundColor: COLORS.surfaceCard,
    borderColor: COLORS.borderLight,
  },
  actionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionTextPrimary: {
    color: COLORS.white,
  },
  actionTextDestructive: {
    color: COLORS.danger,
  },
  actionTextCancel: {
    color: COLORS.textSecondary,
  },
});
