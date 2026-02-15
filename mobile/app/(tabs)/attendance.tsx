import { Platform, StyleSheet, ScrollView, View, Text, TouchableOpacity, StatusBar, Alert, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import * as Location from 'expo-location';
import * as algorandService from '@/services/algorandService';

// VIT Bibwewadi Campus coordinates
const VIT_CAMPUS = {
  latitude: 18.4897,
  longitude: 73.8554,
  name: 'VIT Bibwewadi Campus, Pune',
};

const LOCATION_THRESHOLD_METERS = 500; // Allow 500m radius

const RECENT_ATTENDANCE = [
  { date: 'TODAY', time: '09:00', course: 'Intro to CS 101', status: 'Pending AI Review', statusColor: '#F59E0B', icon: 'chevron-forward' },
  { date: 'YEST.', time: '14:00', course: 'Blockchain Ethics', status: 'Verified On-Chain', statusColor: COLORS.primary, icon: 'link' },
  { date: 'OCT 12', time: '10:00', course: 'Macroeconomics', status: 'Flagged (Loc Mismatch)', statusColor: '#EF4444', icon: 'warning' },
];

export default function AttendanceScreen() {
  const { isConnected, balance, address, isDemoMode } = useWallet();
  const [checkedIn, setCheckedIn] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'verified' | 'failed' | 'idle'>('idle');
  const [currentLocation, setCurrentLocation] = useState<string>('Unknown');
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [faceVerificationStep, setFaceVerificationStep] = useState<'detecting' | 'matching' | 'verified' | 'failed' | 'idle'>('idle');
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [blockchainProof, setBlockchainProof] = useState<any>(null);
  const [showProof, setShowProof] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const verifyLocation = async () => {
    setLocationStatus('checking');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('failed');
        Alert.alert('Permission Denied', 'Location permission is required to verify attendance.');
        return false;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        VIT_CAMPUS.latitude,
        VIT_CAMPUS.longitude
      );

      if (distance <= LOCATION_THRESHOLD_METERS) {
        setLocationStatus('verified');
        setCurrentLocation(VIT_CAMPUS.name);
        return true;
      } else {
        setLocationStatus('failed');
        Alert.alert(
          'Location Mismatch',
          `You are ${Math.round(distance)}m away from ${VIT_CAMPUS.name}.\n\nAttendance requires you to be within ${LOCATION_THRESHOLD_METERS}m of campus.`
        );
        return false;
      }
    } catch (error) {
      setLocationStatus('failed');
      Alert.alert('Error', 'Failed to get your location. Please try again.');
      return false;
    }
  };

  const simulateFaceRecognition = () => {
    return new Promise<boolean>((resolve) => {
      setShowFaceScanner(true);
      setFaceVerificationStep('detecting');
      setFaceConfidence(0);

      // Step 1: Face Detection (1.5s)
      setTimeout(() => {
        setFaceConfidence(40);
        setFaceVerificationStep('matching');
        
        // Step 2: Feature Matching (1.5s)
        setTimeout(() => {
          setFaceConfidence(75);
          
          // Step 3: Verification (1s)
          setTimeout(() => {
            // High success rate in demo, can fail sometimes
            const verified = Math.random() > 0.05; // 95% success rate
            setFaceConfidence(verified ? 100 : 0);
            setFaceVerificationStep(verified ? 'verified' : 'failed');
            
            setTimeout(() => {
              setShowFaceScanner(false);
              setFaceVerificationStep('idle');
              setFaceConfidence(0);
              
              if (verified) {
                Alert.alert('✅ Face Verified', 'Your face matches the registered profile in database.\n\nMatch Confidence: 98.6%');
                resolve(true);
              } else {
                Alert.alert('❌ Face Not Recognized', 'Face verification failed. Please ensure:\n\n• Good lighting\n• Face directly to camera\n• Remove glasses if needed\n\nTry again?');
                resolve(false);
              }
            }, 800);
          }, 1000);
        }, 1500);
      }, 1500);
    });
  };

  const handleCheckIn = async () => {
    if (checkedIn) {
      Alert.alert('Already Checked In', 'You have already checked in for this session.');
      return;
    }

    if (!isConnected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to record attendance on blockchain.');
      return;
    }

    // Step 1: Verify location
    const locationVerified = await verifyLocation();
    if (!locationVerified) return;

    // Step 2: Verify face
    const faceVerified = await simulateFaceRecognition();
    if (!faceVerified) return;

    // Step 3: Record on blockchain
    try {
      const proof = await algorandService.recordAttendanceOnChain(
        address!,
        'CS101-2024-SPRING',
        currentLocation
      );

      setBlockchainProof(proof);
      setCheckedIn(true);
      setShowProof(true);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to record attendance on blockchain: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons name="school" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.brandName}>CAMPUSTRUST</Text>
              <View style={styles.networkRow}>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>MainNet</Text>
              </View>
            </View>
          </View>
          <View style={styles.algoChip}>
            <Ionicons name="wallet" size={14} color={COLORS.textPrimary} />
            <Text style={styles.algoAmount}>{isConnected ? `${balance.toFixed(0)}` : '245'} ALGO</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Attendance Rate</Text>
              <Ionicons name="calendar" size={18} color={COLORS.textMuted} />
            </View>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>92%</Text>
              <Text style={styles.statTrend}>↑ 2%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '92%', backgroundColor: COLORS.primary }]} />
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>AI Trust Score</Text>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.textMuted} />
            </View>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>98</Text>
              <Text style={styles.statMax}> / 100</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
              <Text style={styles.trustText}>EXCELLENT</Text>
            </View>
          </View>
        </View>

        {/* Check-In Button */}
        <View style={styles.checkInSection}>
          <TouchableOpacity
            style={[styles.checkInButton, checkedIn && styles.checkInDone]}
            onPress={handleCheckIn}
            activeOpacity={0.8}>
            <View style={styles.checkInOuter}>
              <View style={[styles.checkInInner, checkedIn && styles.checkInInnerDone]}>
                <Ionicons
                  name={checkedIn ? 'checkmark-circle' : 'finger-print'}
                  size={48}
                  color={checkedIn ? COLORS.success : COLORS.primary}
                />
                <Text style={[styles.checkInLabel, checkedIn && styles.checkInLabelDone]}>
                  {checkedIn ? 'CHECKED IN' : locationStatus === 'checking' ? 'VERIFYING...' : 'CHECK IN'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Location Info */}
          <View style={styles.locationChip}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>Science Building Block B</Text>
            <Text style={styles.locationVerified}>(Verified)</Text>
          </View>
        </View>

        {/* Recent Attendance */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Attendance</Text>
            <TouchableOpacity onPress={() => Alert.alert('Attendance History', 'Showing all attendance records:\n\n• Intro to CS 101 — Pending\n• Blockchain Ethics — Verified\n• Macroeconomics — Flagged\n• Data Structures — Verified\n• Linear Algebra — Verified\n\nTotal: 92% attendance rate', [{ text: 'OK' }])}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {RECENT_ATTENDANCE.map((item, index) => (
            <TouchableOpacity key={index} style={styles.attendanceCard}
              onPress={() => Alert.alert(
                item.course,
                `Date: ${item.date}\nTime: ${item.time}\nStatus: ${item.status}\n\n${item.status.includes('Verified') ? 'Transaction recorded on Algorand blockchain.' : item.status.includes('Flagged') ? 'Location mismatch detected by AI. Please contact your instructor.' : 'Awaiting AI verification. Results expected within 1 hour.'}`,
                [{ text: 'OK' }]
              )}>
              <View style={styles.attendanceLeft}>
                <Text style={styles.attendanceDate}>{item.date}</Text>
                <Text style={styles.attendanceTime}>{item.time}</Text>
              </View>
              <View style={styles.attendanceDivider} />
              <View style={styles.attendanceContent}>
                <Text style={styles.courseName}>{item.course}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusIndicator, { backgroundColor: item.statusColor }]} />
                  <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                </View>
              </View>
              <Ionicons name={item.icon as any} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Face Scanner Modal */}
      <Modal visible={showFaceScanner} animationType="slide" transparent>
        <View style={styles.faceScannerOverlay}>
          <View style={styles.faceScannerBox}>
            <View style={styles.scannerFrame}>
              <View style={[styles.scannerCorner, styles.cornerTopLeft]} />
              <View style={[styles.scannerCorner, styles.cornerTopRight]} />
              <View style={[styles.scannerCorner, styles.cornerBottomLeft]} />
              <View style={[styles.scannerCorner, styles.cornerBottomRight]} />
              
              <View style={styles.faceIconContainer}>
                <Ionicons 
                  name={faceVerificationStep === 'verified' ? 'checkmark-circle' : faceVerificationStep === 'failed' ? 'close-circle' : 'scan'} 
                  size={120} 
                  color={faceVerificationStep === 'verified' ? COLORS.success : faceVerificationStep === 'failed' ? '#EF4444' : COLORS.primary} 
                />
              </View>
              
              {faceVerificationStep !== 'verified' && faceVerificationStep !== 'failed' && (
                <View style={styles.scanningLine} />
              )}
            </View>
            
            <Text style={styles.scannerTitle}>
              {faceVerificationStep === 'detecting' ? 'Detecting Face...' :
               faceVerificationStep === 'matching' ? 'Matching Features...' :
               faceVerificationStep === 'verified' ? 'Face Verified!' :
               faceVerificationStep === 'failed' ? 'Verification Failed' :
               'Face Recognition'}
            </Text>
            <Text style={styles.scannerSubtitle}>
              {faceVerificationStep === 'detecting' ? 'Analyzing facial features using OpenCV' :
               faceVerificationStep === 'matching' ? 'Comparing with registered database' :
               faceVerificationStep === 'verified' ? 'Match confidence: 98.6%' :
               faceVerificationStep === 'failed' ? 'Please try again' :
               'Position your face within the frame'}
            </Text>
            
            <View style={styles.scannerProgress}>
              <View style={[styles.scannerProgressBar, { width: `${faceConfidence}%` }]} />
            </View>
            <Text style={styles.scannerPercentage}>{faceConfidence}%</Text>

            {faceVerificationStep !== 'idle' && (
              <View style={styles.verificationSteps}>
                <View style={styles.stepRow}>
                  <Ionicons name={faceConfidence >= 40 ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={faceConfidence >= 40 ? COLORS.success : COLORS.textMuted} />
                  <Text style={styles.stepText}>Face Detection</Text>
                </View>
                <View style={styles.stepRow}>
                  <Ionicons name={faceConfidence >= 75 ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={faceConfidence >= 75 ? COLORS.success : COLORS.textMuted} />
                  <Text style={styles.stepText}>Feature Extraction</Text>
                </View>
                <View style={styles.stepRow}>
                  <Ionicons name={faceConfidence >= 100 ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={faceConfidence >= 100 ? COLORS.success : COLORS.textMuted} />
                  <Text style={styles.stepText}>Database Match</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Blockchain Proof Modal */}
      <Modal visible={showProof} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.proofHeader}>
              <View style={[styles.proofIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
              </View>
              <Text style={styles.proofTitle}>Attendance Recorded!</Text>
              <Text style={styles.proofSubtitle}>Blockchain proof generated</Text>
            </View>

            {blockchainProof && (
              <ScrollView style={styles.proofScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>ATTENDANCE DETAILS</Text>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Student:</Text>
                    <Text style={styles.proofValue}>{blockchainProof.details?.studentAddress?.substring(0, 12)}...</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Class ID:</Text>
                    <Text style={styles.proofValue}>{blockchainProof.details?.classId}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Location:</Text>
                    <Text style={styles.proofValue}>{blockchainProof.details?.location}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>GPS:</Text>
                    <Text style={styles.proofValue}>{blockchainProof.details?.gpsCoordinates}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Verification:</Text>
                    <Text style={styles.proofValue}>{blockchainProof.details?.verificationMethod}</Text>
                  </View>
                </View>

                <View style={styles.proofSection}>
                  <Text style={styles.proofSectionTitle}>BLOCKCHAIN PROOF</Text>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Transaction ID:</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(blockchainProof.explorerUrl)}>
                      <Text style={styles.proofValueLink}>{blockchainProof.txId?.substring(0, 16)}...</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Network:</Text>
                    <Text style={styles.proofValue}>{blockchainProof.network}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Block Round:</Text>
                    <Text style={styles.proofValue}>{blockchainProof.confirmedRound?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Timestamp:</Text>
                    <Text style={styles.proofValue}>{new Date(blockchainProof.timestamp).toLocaleString()}</Text>
                  </View>
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel}>Fee:</Text>
                    <Text style={styles.proofValue}>{blockchainProof.fee}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.explorerButton}
                  onPress={() => Linking.openURL(blockchainProof.explorerUrl)}>
                  <Ionicons name="open-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.explorerButtonText}>View on Algorand Explorer</Text>
                </TouchableOpacity>

                {isDemoMode && (
                  <View style={styles.demoWarningBox}>
                    <Ionicons name="information-circle" size={16} color="#F59E0B" />
                    <Text style={styles.demoWarningBoxText}>
                      Demo mode: This is simulated blockchain data
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProof(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
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
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  networkText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  algoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  algoAmount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
    marginBottom: SPACING.xxxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statTrend: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 6,
  },
  statMax: {
    fontSize: FONT_SIZES.md,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.borderDark,
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  trustText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },

  // Check-In
  checkInSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  checkInButton: {
    alignItems: 'center',
  },
  checkInDone: {},
  checkInOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  checkInInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  checkInInnerDone: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success + '40',
  },
  checkInLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
    letterSpacing: 2,
  },
  checkInLabelDone: {
    color: COLORS.success,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginTop: SPACING.xl,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  locationVerified: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Recent
  recentSection: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  attendanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: SPACING.md,
  },
  attendanceLeft: {
    alignItems: 'center',
    minWidth: 50,
  },
  attendanceDate: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  attendanceTime: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  attendanceDivider: {
    width: 2,
    height: 36,
    backgroundColor: COLORS.borderDark,
    borderRadius: 1,
  },
  attendanceContent: {
    flex: 1,
  },
  courseName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },

  // Face Scanner
  faceScannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  faceScannerBox: {
    alignItems: 'center',
    width: '100%',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    marginBottom: SPACING.xxl,
  },
  scannerCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  faceIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -60 }],
  },
  scanningLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.7,
  },
  scannerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  scannerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  scannerProgress: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.borderDark,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scannerProgressBar: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  scannerPercentage: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.md,
  },
  verificationSteps: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  // Instructions
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  instructionsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Blockchain Proof Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceDark,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  proofHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  proofIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  proofTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  proofSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  proofScroll: {
    maxHeight: 400,
  },
  proofSection: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  proofSectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  proofRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  proofLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  proofValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  proofValueLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    marginVertical: SPACING.lg,
  },
  explorerButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  demoWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#F59E0B' + '15',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F59E0B' + '30',
  },
  demoWarningBoxText: {
    fontSize: FONT_SIZES.xs,
    color: '#F59E0B',
    flex: 1,
  },
  closeButton: {
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  closeButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // Proof Modal (legacy)
  proofContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
});
