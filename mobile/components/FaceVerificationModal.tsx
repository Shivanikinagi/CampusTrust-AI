import { Modal, View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';

const CAMERA_WIDTH = 320;
const CAMERA_HEIGHT = 420;

interface FaceVerificationModalProps {
  visible: boolean;
  step: 'detecting' | 'matching' | 'verified' | 'failed' | 'idle';
  confidence: number;
}

export default function FaceVerificationModal({ visible, step, confidence }: FaceVerificationModalProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);

  // Request camera permission when modal becomes visible
  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
    if (!visible) {
      setCameraReady(false);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && step !== 'idle') {
      // Pulse animation for face outline
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // Scanning line animation
      const scanLoop = Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      scanLoop.start();

      return () => {
        pulseLoop.stop();
        scanLoop.stop();
        pulseAnim.setValue(1);
        scanAnim.setValue(0);
      };
    }
  }, [visible, step]);

  const getStepInfo = () => {
    switch (step) {
      case 'detecting':
        return { text: 'Detecting Face...', icon: 'scan', color: COLORS.primary };
      case 'matching':
        return { text: 'Matching Features...', icon: 'finger-print', color: '#F59E0B' };
      case 'verified':
        return { text: 'Face Verified!', icon: 'checkmark-circle', color: COLORS.success };
      case 'failed':
        return { text: 'Verification Failed', icon: 'close-circle', color: '#EF4444' };
      default:
        return { text: 'Initializing...', icon: 'camera', color: COLORS.textMuted };
    }
  };

  const stepInfo = getStepInfo();
  const canShowCamera = permission?.granted && visible;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Camera Preview */}
          <View style={styles.cameraView}>
            {canShowCamera ? (
              <CameraView
                style={styles.cameraFill}
                facing="front"
                onCameraReady={() => setCameraReady(true)}
              />
            ) : (
              <View style={[styles.cameraFill, { backgroundColor: COLORS.bgDark }]} />
            )}

            {/* Overlay on top of camera */}
            <View style={styles.cameraOverlay} pointerEvents="none">
              {/* Vignette / darkened edges */}
              <View style={styles.vignetteTop} />
              <View style={styles.vignetteBottom} />

              {/* Face Outline */}
              <Animated.View
                style={[
                  styles.faceOutline,
                  {
                    transform: [{ scale: pulseAnim }],
                    borderColor: stepInfo.color,
                  },
                ]}
              >
                <View style={[styles.corner, styles.topLeft, { borderColor: stepInfo.color }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: stepInfo.color }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: stepInfo.color }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: stepInfo.color }]} />
              </Animated.View>

              {/* Scanning Line */}
              {(step === 'detecting' || step === 'matching') && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      backgroundColor: stepInfo.color,
                      transform: [
                        {
                          translateY: scanAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 100],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}

              {/* Center Icon for Success/Failure */}
              {(step === 'verified' || step === 'failed') && (
                <View style={[styles.resultIcon, { backgroundColor: stepInfo.color + '30' }]}>
                  <Ionicons name={stepInfo.icon as any} size={80} color={stepInfo.color} />
                </View>
              )}

              {/* Camera not ready indicator */}
              {canShowCamera && !cameraReady && (
                <View style={styles.loadingCamera}>
                  <Ionicons name="camera" size={32} color={COLORS.textMuted} />
                  <Text style={styles.loadingCameraText}>Starting camera...</Text>
                </View>
              )}

              {/* No permission fallback */}
              {!permission?.granted && visible && (
                <View style={styles.loadingCamera}>
                  <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                  <Text style={styles.loadingCameraText}>Camera permission needed</Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Info */}
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <Ionicons name={stepInfo.icon as any} size={24} color={stepInfo.color} />
              <Text style={[styles.statusText, { color: stepInfo.color }]}>{stepInfo.text}</Text>
            </View>

            {/* Progress Bar */}
            {confidence > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${confidence}%`, backgroundColor: stepInfo.color }]} />
                </View>
                <Text style={styles.confidenceText}>{confidence}% Confidence</Text>
              </View>
            )}

            {/* Instructions */}
            {step === 'detecting' && (
              <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Position your face:</Text>
                <Text style={styles.instructionText}>• Look directly at camera</Text>
                <Text style={styles.instructionText}>• Ensure good lighting</Text>
                <Text style={styles.instructionText}>• Remove glasses if needed</Text>
              </View>
            )}

            {step === 'verified' && (
              <View style={styles.successMessage}>
                <Text style={styles.successText}>Match Confidence: 98.6%</Text>
                <Text style={styles.successSubtext}>Your identity has been verified</Text>
              </View>
            )}

            {step === 'failed' && (
              <View style={styles.errorMessage}>
                <Text style={styles.errorText}>Unable to verify face</Text>
                <Text style={styles.errorSubtext}>Please try again with better lighting</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  cameraView: {
    width: CAMERA_WIDTH,
    height: CAMERA_HEIGHT,
    backgroundColor: '#000',
    borderRadius: Platform.OS === 'android' ? 0 : RADIUS.xl,
    overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    position: 'relative',
  },
  cameraFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CAMERA_WIDTH,
    height: CAMERA_HEIGHT,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CAMERA_WIDTH,
    height: CAMERA_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  faceOutline: {
    width: 200,
    height: 260,
    borderRadius: 100,
    borderWidth: 3,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 100,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 100,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 100,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 100,
  },
  scanLine: {
    position: 'absolute',
    width: 200,
    height: 2,
    opacity: 0.6,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    paddingHorizontal: SPACING.xl,
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statusText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: SPACING.lg,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.md,
  },
  confidenceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: COLORS.surfaceCard,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  instructionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  instructionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  successMessage: {
    backgroundColor: COLORS.success + '15',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
    alignItems: 'center',
  },
  successText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  errorMessage: {
    backgroundColor: '#EF444415',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  loadingCamera: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingCameraText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
