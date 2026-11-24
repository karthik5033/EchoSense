import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Vibration } from 'react-native';
import { DashboardStats } from '../api';

interface Props {
  stats: DashboardStats | null;
}

export function TelemetryScreen({ stats }: Props) {
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [telemetry, setTelemetry] = useState({
    amplitude_v: 1.18,
    peak_frequency_khz: 148.6,
    rms_energy: 0.038,
    bocd_changepoint_prob: 0.04,
    bocd_alarm: false,
    cdpi_score: 0.946,
    crack_mode: 'Shear Interface Slip',
    lead_time_ms: 340.0,
    timestamp: '23:59:12',
  });
  const [waveform, setWaveform] = useState<number[]>([
    0.02, -0.04, 0.08, -0.12, 0.45, -0.85, 1.18, -0.92, 0.65, -0.38, 0.22, -0.11, 0.05, -0.02,
  ]);
  const [alertActive, setAlertActive] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Try connecting to live WebSocket server
    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://10.0.2.2:8000/ws/monitoring/mobile-telemetry';
    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsLiveConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry_frame') {
            setTelemetry({
              amplitude_v: data.amplitude_v,
              peak_frequency_khz: data.peak_frequency_khz,
              rms_energy: data.rms_energy,
              bocd_changepoint_prob: data.bocd_changepoint_prob,
              bocd_alarm: data.bocd_alarm,
              cdpi_score: data.cdpi_score,
              crack_mode: data.crack_mode,
              lead_time_ms: data.lead_time_ms,
              timestamp: data.timestamp,
            });

            if (data.waveform_chunk && data.waveform_chunk.length > 0) {
              setWaveform(data.waveform_chunk.slice(0, 16));
            }

            if (data.bocd_alarm) {
              setAlertActive(true);
              Vibration.vibrate(300);
            }
          }
        } catch {}
      };

      ws.onclose = () => setIsLiveConnected(false);
      ws.onerror = () => setIsLiveConnected(false);
    } catch {
      setIsLiveConnected(false);
    }

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Alert Banner when BOCD alarm triggers */}
      {alertActive && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertTitle}>CRITICAL STRUCTURAL PRECURSOR ALARM</Text>
          <Text style={styles.alertSub}>
            BOCD statistical changepoint detected: P(CP) = {(telemetry.bocd_changepoint_prob * 100).toFixed(0)}%. Lead time: {telemetry.lead_time_ms} ms.
          </Text>
          <TouchableOpacity style={styles.dismissBtn} onPress={() => setAlertActive(false)}>
            <Text style={styles.dismissBtnText}>Acknowledge Alert</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hero Precursor Metric Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroPretitle}>STRUCTURAL DAMAGE PRECURSOR LEAD TIME</Text>
          <Text style={[styles.statusText, isLiveConnected ? styles.statusLive : styles.statusSim]}>
            {isLiveConnected ? '10 Hz WebSocket Live' : 'Simulated Telemetry'}
          </Text>
        </View>

        <View style={styles.heroValueRow}>
          <Text style={styles.heroValue}>{telemetry.lead_time_ms.toFixed(0)}</Text>
          <Text style={styles.heroUnit}>ms</Text>
        </View>

        <Text style={styles.heroDescription}>
          Bayesian Online Changepoint Detection (BOCD) identified precursor {telemetry.lead_time_ms.toFixed(0)} ms ahead of macro crack opening.
        </Text>

        <View style={styles.metricBadgeRow}>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeLabel}>CDPI Precursor</Text>
            <Text style={styles.subBadgeValue}>{telemetry.cdpi_score.toFixed(3)}</Text>
          </View>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeLabel}>Crack Mode</Text>
            <Text style={styles.subBadgeValue} numberOfLines={1}>{telemetry.crack_mode}</Text>
          </View>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeLabel}>BOCD P(CP)</Text>
            <Text style={styles.subBadgeValue}>{(telemetry.bocd_changepoint_prob * 100).toFixed(1)}%</Text>
          </View>
        </View>
      </View>

      {/* Simplified Live Waveform Strip */}
      <View style={styles.waveformCard}>
        <Text style={styles.waveformTitle}>Real-Time Acoustic Waveform Strip</Text>
        <View style={styles.waveformBars}>
          {waveform.map((val, idx) => {
            const height = Math.min(60, Math.max(6, Math.abs(val) * 55));
            return (
              <View
                key={idx}
                style={[
                  styles.waveformBar,
                  { height },
                  val > 0.5 ? styles.waveformBarPeak : styles.waveformBarNominal,
                ]}
              />
            );
          })}
        </View>
        <View style={styles.waveformMeta}>
          <Text style={styles.waveformMetaText}>Center Frequency: {telemetry.peak_frequency_khz} kHz</Text>
          <Text style={styles.waveformMetaText}>Amplitude: {telemetry.amplitude_v} Vpp</Text>
        </View>
      </View>

      {/* Telemetry Metrics Quad */}
      <View style={styles.row}>
        <View style={styles.halfCard}>
          <Text style={styles.cardLabel}>Peak Frequency</Text>
          <Text style={styles.cardValue}>{telemetry.peak_frequency_khz} kHz</Text>
          <Text style={styles.cardHint}>Girder G1 Midspan</Text>
        </View>
        <View style={styles.halfCard}>
          <Text style={styles.cardLabel}>Peak Amplitude</Text>
          <Text style={styles.cardValue}>{telemetry.amplitude_v} Vpp</Text>
          <Text style={styles.cardHint}>Transient Burst</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfCard}>
          <Text style={styles.cardLabel}>Total Signals</Text>
          <Text style={styles.cardValue}>{stats?.metrics.total_signals ?? 6}</Text>
          <Text style={styles.cardHint}>Indexed Recordings</Text>
        </View>
        <View style={styles.halfCard}>
          <Text style={styles.cardLabel}>Macro Accuracy</Text>
          <Text style={styles.cardValue}>94.6%</Text>
          <Text style={styles.cardHint}>5-Fold Stratified CV</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  alertBanner: {
    backgroundColor: '#3B1812',
    borderWidth: 1,
    borderColor: '#FF5500',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    marginBottom: 8,
  },
  alertTitle: {
    color: '#FF5500',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  alertSub: {
    color: '#F4F4F5',
    fontSize: 11,
    lineHeight: 16,
  },
  dismissBtn: {
    backgroundColor: '#FF5500',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  dismissBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: '#16161C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 16,
    gap: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPretitle: {
    color: '#FF5500',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  statusLive: {
    color: '#22C55E',
  },
  statusSim: {
    color: '#71717A',
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  heroUnit: {
    color: '#FF5500',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  heroDescription: {
    color: '#A1A1AA',
    fontSize: 12,
    lineHeight: 18,
  },
  metricBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#272733',
  },
  subBadge: {
    flex: 1,
    backgroundColor: '#0C1017',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22222E',
  },
  subBadgeLabel: {
    color: '#71717A',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  subBadgeValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  waveformCard: {
    backgroundColor: '#16161C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 14,
    gap: 10,
    marginVertical: 4,
  },
  waveformTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    backgroundColor: '#0C1017',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  waveformBar: {
    width: 12,
    borderRadius: 4,
  },
  waveformBarNominal: {
    backgroundColor: '#FF5500',
    opacity: 0.8,
  },
  waveformBarPeak: {
    backgroundColor: '#EF4444',
  },
  waveformMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waveformMetaText: {
    color: '#71717A',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#16161C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 12,
    gap: 4,
  },
  cardLabel: {
    color: '#71717A',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  cardHint: {
    color: '#52525B',
    fontSize: 10,
  },
});
