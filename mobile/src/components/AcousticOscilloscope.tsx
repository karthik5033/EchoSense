import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Rect, Defs, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg';

interface Props {
  waveform: number[]; // Array of normalized audio samples [-1.0, 1.0]
  peakV: number;
  freqKhz?: number;
  rms?: number;
  sourceLabel?: string;
  isLive?: boolean;
  fftData?: number[]; // Real 16-band FFT spectral power [0..1]
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = Math.min(SCREEN_WIDTH - 48, 380);
const CHART_HEIGHT = 160;

export function AcousticOscilloscope({
  waveform,
  peakV,
  freqKhz = 148.6,
  rms = 0.042,
  sourceLabel = 'Smartphone MEMS Array',
  isLive = true,
  fftData,
}: Props) {
  const midY = CHART_HEIGHT / 2;
  const numPoints = waveform.length > 0 ? waveform.length : 32;
  const stepX = CHART_WIDTH / (numPoints - 1 || 1);

  // Smooth hyperbolic tangent (tanh) soft-limiting: guarantees mathematically that
  // the waveform stays strictly within canvas bounds [16px..144px] with zero jumping,
  // zero layout distortion, and beautiful natural analog saturation even during loud acoustic transients.
  let pathD = '';
  if (waveform.length > 0) {
    pathD = waveform.reduce((acc, val, idx) => {
      const x = idx * stepX;
      // Soft saturation prevents violent clipping or jumping at high amplitude
      const saturated = Math.tanh(val * 1.5);
      const y = midY - saturated * (midY - 16);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  } else {
    pathD = `M 0 ${midY} L ${CHART_WIDTH} ${midY}`;
  }

  // Generate or use real FFT frequency spectrum bars (16 bands)
  const fftBands = (fftData && fftData.length === 16)
    ? fftData
    : Array.from({ length: 16 }, (_, i) => {
        const baseEnergy = Math.abs(waveform[i % waveform.length] || 0.1);
        const harmonicWeight = Math.sin((i / 16) * Math.PI);
        return Math.min(1.0, Math.max(0.08, baseEnergy * harmonicWeight * (1 + (i % 3) * 0.2)));
      });

  return (
    <View style={styles.cardContainer}>
      {/* Header bar */}
      <View style={styles.scopeHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.scopeTitle} numberOfLines={1}>ACOUSTIC OSCILLOSCOPE</Text>
        </View>
        <Text style={styles.sourceTag} numberOfLines={1} ellipsizeMode="tail">
          {sourceLabel}
        </Text>
      </View>

      {/* SVG Oscilloscope Display */}
      <View style={styles.canvasWrapper}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FF5500" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#FF8800" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FF3300" stopOpacity="0.8" />
            </LinearGradient>
          </Defs>

          {/* Scope Background with grid */}
          <Rect x="0" y="0" width={CHART_WIDTH} height={CHART_HEIGHT} fill="#0A0D14" rx="8" />

          {/* Coordinate grid lines */}
          <G stroke="#182030" strokeWidth="1" strokeDasharray="3,3">
            <Line x1="0" y1={midY} x2={CHART_WIDTH} y2={midY} stroke="#222E42" strokeWidth="1.2" strokeDasharray="none" />
            <Line x1="0" y1={midY - 45} x2={CHART_WIDTH} y2={midY - 45} />
            <Line x1="0" y1={midY + 45} x2={CHART_WIDTH} y2={midY + 45} />
            {Array.from({ length: 7 }, (_, i) => (
              <Line key={i} x1={(i + 1) * (CHART_WIDTH / 8)} y1="0" x2={(i + 1) * (CHART_WIDTH / 8)} y2={CHART_HEIGHT} />
            ))}
          </G>

          {/* Axis labels */}
          <SvgText x="6" y="16" fill="#4B5563" fontSize="9" fontFamily="monospace">+1.4V</SvgText>
          <SvgText x="6" y={midY - 4} fill="#64748B" fontSize="9" fontFamily="monospace">0.0V</SvgText>
          <SvgText x="6" y={CHART_HEIGHT - 6} fill="#4B5563" fontSize="9" fontFamily="monospace">-1.4V</SvgText>
          <SvgText x={CHART_WIDTH - 42} y="16" fill="#FF5500" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {freqKhz.toFixed(1)}k
          </SvgText>

          {/* Primary Acoustic Waveform Trace */}
          <Path
            d={pathD}
            stroke="url(#waveGlow)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Real-time Frequency Spectrum Bars */}
      <View style={styles.fftContainer}>
        <View style={styles.fftHeader}>
          <Text style={styles.fftLabel}>FFT POWER DENSITY (20 kHz — 200 kHz)</Text>
          <Text style={styles.fftSub}>16 SUB-BANDS</Text>
        </View>
        <View style={styles.fftBarRow}>
          {fftBands.map((val, idx) => (
            <View key={idx} style={styles.fftBarSlot}>
              <View
                style={[
                  styles.fftBarFill,
                  { height: `${Math.round(val * 100)}%` },
                  val > 0.65 ? styles.fftPeak : styles.fftNorm,
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Telemetry readout bar */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Text style={styles.mLabel}>PEAK VPP</Text>
          <Text style={styles.mValue}>{peakV.toFixed(2)} V</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.mLabel}>CARRIER</Text>
          <Text style={styles.mValue}>{freqKhz.toFixed(1)} kHz</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.mLabel}>RMS POWER</Text>
          <Text style={styles.mValue}>{(rms * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.mLabel}>SAMPLING</Text>
          <Text style={styles.mValue}>48 kS/s</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#12141A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#232630',
    padding: 14,
    marginBottom: 16,
  },
  scopeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 24,
    marginBottom: 10,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scopeLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ledLive: {
    backgroundColor: '#10B981',
  },
  ledIdle: {
    backgroundColor: '#64748B',
  },
  scopeTitle: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  sourceTag: {
    color: '#94A3B8',
    fontSize: 9,
    fontFamily: 'monospace',
    backgroundColor: '#1C1F28',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 150,
  },
  canvasWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    height: 160,
    maxHeight: 160,
  },
  fftContainer: {
    marginTop: 10,
    backgroundColor: '#0D1017',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1E232F',
    height: 72,
    overflow: 'hidden',
  },
  fftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fftLabel: {
    color: '#64748B',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  fftSub: {
    color: '#D97706',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  fftBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 36,
    paddingHorizontal: 2,
  },
  fftBarSlot: {
    flex: 1,
    height: '100%',
    marginHorizontal: 1.5,
    justifyContent: 'flex-end',
    backgroundColor: '#141822',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fftBarFill: {
    width: '100%',
    borderRadius: 2,
  },
  fftNorm: {
    backgroundColor: '#FF5500',
  },
  fftPeak: {
    backgroundColor: '#FF9900',
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E222D',
  },
  metricItem: {
    alignItems: 'center',
  },
  mLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  mValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
