import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
} from 'react-native';
import {
  checkBackendHealth,
  fetchSystemDiagnostics,
  getLocalDiagnosticLogs,
  clearLocalDiagnosticLogs,
  ClientLogEntry,
  API_BASE_URL,
} from '../api';

interface DiagnosticModalProps {
  visible: boolean;
  onClose: () => void;
  micPermissionGranted: boolean;
  liveDbLevel?: number;
}

export function DiagnosticModal({
  visible,
  onClose,
  micPermissionGranted,
  liveDbLevel,
}: DiagnosticModalProps) {
  const [checking, setChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    online: boolean;
    latencyMs: number;
    error?: string;
  } | null>(null);
  const [sysDiag, setSysDiag] = useState<any | null>(null);
  const [logs, setLogs] = useState<ClientLogEntry[]>([]);

  const runAllChecks = async () => {
    setChecking(true);
    const health = await checkBackendHealth();
    setHealthStatus(health);

    if (health.online) {
      const diag = await fetchSystemDiagnostics();
      setSysDiag(diag);
    }

    setLogs(getLocalDiagnosticLogs());
    setChecking(false);
  };

  useEffect(() => {
    if (visible) {
      runAllChecks();
    }
  }, [visible]);

  const handleShareLogs = async () => {
    const report = {
      deviceTime: new Date().toISOString(),
      apiEndpoint: API_BASE_URL,
      apiHealth: healthStatus,
      micPermission: micPermissionGranted ? 'GRANTED' : 'DENIED/NOT_REQUESTED',
      meteringDb: liveDbLevel !== undefined ? `${liveDbLevel.toFixed(1)} dB` : 'IDLE',
      systemDiagnostics: sysDiag,
      recentClientLogs: logs,
    };

    const textPayload = `=== ECHOSENSE CLIENT DIAGNOSTIC REPORT ===\n${JSON.stringify(report, null, 2)}`;
    try {
      await Share.share({
        title: 'EchoSense Diagnostic Report',
        message: textPayload,
      });
    } catch {}
  };

  const handleClearLogs = () => {
    clearLocalDiagnosticLogs();
    setLogs([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>System Diagnostics & Log Hub</Text>
              <Text style={styles.subTitle}>End-to-end hardware, API & telemetry health</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Real-time Subsystem Status Cards */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>SUBSYSTEM HEALTH</Text>

              {/* 1. Backend Gateway */}
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemTitle}>EchoSense API Gateway</Text>
                  <Text style={styles.itemSub}>{API_BASE_URL}</Text>
                </View>
                <View style={styles.itemRight}>
                  <View
                    style={[
                      styles.indicatorDot,
                      { backgroundColor: healthStatus?.online ? '#10B981' : '#EF4444' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: healthStatus?.online ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {healthStatus?.online
                      ? `ONLINE (${healthStatus.latencyMs}ms)`
                      : 'OFFLINE'}
                  </Text>
                </View>
              </View>

              {/* 2. Microphone Hardware & Permission */}
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemTitle}>MEMS Acoustic Transducer</Text>
                  <Text style={styles.itemSub}>
                    {liveDbLevel !== undefined
                      ? `Metering: ${liveDbLevel.toFixed(1)} dB (Active)`
                      : 'Standby / Armed'}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <View
                    style={[
                      styles.indicatorDot,
                      { backgroundColor: micPermissionGranted ? '#10B981' : '#F59E0B' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: micPermissionGranted ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    {micPermissionGranted ? 'HARDWARE READY' : 'PERMISSION REQ'}
                  </Text>
                </View>
              </View>

              {/* 3. Server Database & ML Compute */}
              <View style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemTitle}>ML Pipeline & TDA Engine</Text>
                  <Text style={styles.itemSub}>
                    {sysDiag?.ml_compute?.device || 'PyTorch Inference Engine'}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <View
                    style={[
                      styles.indicatorDot,
                      { backgroundColor: sysDiag?.status === 'HEALTHY' ? '#10B981' : '#3B82F6' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: sysDiag?.status === 'HEALTHY' ? '#10B981' : '#3B82F6' },
                    ]}
                  >
                    {sysDiag?.status || 'STANDBY'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Diagnostic Logs Section */}
            <View style={styles.section}>
              <View style={styles.logHeaderRow}>
                <Text style={styles.sectionHeading}>
                  DEVICE TELEMETRY & ERROR LOGS ({logs.length})
                </Text>
                {logs.length > 0 && (
                  <TouchableOpacity onPress={handleClearLogs}>
                    <Text style={styles.clearLogsText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {logs.length === 0 ? (
                <View style={styles.emptyLogsBox}>
                  <Text style={styles.emptyLogsText}>
                    No client errors recorded. All subsystems running normally.
                  </Text>
                </View>
              ) : (
                logs.map((log) => (
                  <View
                    key={log.id}
                    style={[
                      styles.logCard,
                      log.level === 'ERROR' ? styles.logError : styles.logWarn,
                    ]}
                  >
                    <View style={styles.logMetaRow}>
                      <Text
                        style={[
                          styles.logLevel,
                          { color: log.level === 'ERROR' ? '#EF4444' : '#F59E0B' },
                        ]}
                      >
                        [{log.level}] {log.context}
                      </Text>
                      <Text style={styles.logTime}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Text style={styles.logMsg} selectable={true}>
                      {log.message}
                    </Text>
                    {log.details && (
                      <Text style={styles.logDetails} selectable={true}>
                        {JSON.stringify(log.details)}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={runAllChecks}
              disabled={checking}
            >
              {checking ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.refreshBtnText}>Re-test Subsystems</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareLogs}
            >
              <Text style={styles.shareBtnText}>Copy / Share Diagnostics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F131D',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    maxHeight: '88%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  subTitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#151C2A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 8,
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  itemSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearLogsText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  emptyLogsBox: {
    backgroundColor: '#151C2A',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emptyLogsText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  logCard: {
    backgroundColor: '#151C2A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  logError: {
    borderLeftColor: '#EF4444',
  },
  logWarn: {
    borderLeftColor: '#F59E0B',
  },
  logMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logLevel: {
    fontSize: 11,
    fontWeight: '700',
  },
  logTime: {
    color: '#64748B',
    fontSize: 10,
  },
  logMsg: {
    color: '#E2E8F0',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  logDetails: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    paddingTop: 12,
  },
  refreshBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  shareBtn: {
    flex: 1.3,
    backgroundColor: '#FF5500',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
