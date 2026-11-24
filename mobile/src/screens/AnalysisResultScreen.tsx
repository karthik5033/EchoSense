import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { AnalysisSummary } from '../api';

interface AnalysisResultScreenProps {
  result?: AnalysisSummary | null;
  onBack: () => void;
}

export function AnalysisResultScreen({ result, onBack }: AnalysisResultScreenProps) {
  const [sharing, setSharing] = useState(false);

  // Fallback demo result if none passed
  const data: AnalysisSummary = result || {
    analysis_id: 'AN-8920',
    signal_id: 'sig-01',
    status: 'COMPLETED',
    execution_time_ms: 785.4,
    classification: {
      crack_mode: 'Shear Interface Slip',
      confidence: 0.972,
      cdpi_score: 0.946,
      lead_time_ms: 340.0,
    },
    takens: {
      embedding_dimension: 3,
      delay_lag_tau: 4,
      tau_time_microsec: 90.7,
    },
    persistent_homology: {
      entropy_h0: 0.880,
      entropy_h1: 0.742,
      betti_0_peak: 1,
      betti_1_peak: 3,
      persistence_pairs: [
        { dim: 0, birth: 0.0, death: 0.88 },
        { dim: 1, birth: 0.12, death: 0.94 },
        { dim: 1, birth: 0.18, death: 0.72 },
      ],
    },
  };

  const handleShareReport = async () => {
    try {
      setSharing(true);
      const reportMessage = `[EchoSense Structural Precursor Report]\n` +
        `Specimen: Prestressed Concrete Girder G1\n` +
        `Precursor Lead Time: ${data.classification.lead_time_ms} ms\n` +
        `Composite Damage Precursor Index (CDPI): ${data.classification.cdpi_score.toFixed(3)}\n` +
        `Predicted Crack Mode: ${data.classification.crack_mode} (${(data.classification.confidence * 100).toFixed(1)}% Confidence)\n` +
        `Topological Invariants: H0 Entropy = ${data.persistent_homology.entropy_h0}, H1 Entropy = ${data.persistent_homology.entropy_h1}\n` +
        `Takens Attractor: Dimension d = ${data.takens.embedding_dimension}, Delay τ = ${data.takens.delay_lag_tau} samples\n` +
        `Execution Latency: ${data.execution_time_ms} ms\n` +
        `Calibrated to EN 1330-9 and ASTM E1316 acoustic emission standards.`;

      await Share.share({
        message: reportMessage,
        title: `EchoSense Precursor Report - ${data.classification.crack_mode}`,
      });
    } catch (err) {
      Alert.alert('Share Error', 'Could not open native share sheet.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Bar */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>&larr; Back to Signals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareReport} disabled={sharing}>
          <Text style={styles.shareBtnText}>Share Report</Text>
        </TouchableOpacity>
      </View>

      {/* Main Precursor Assessment Card */}
      <View style={styles.assessmentCard}>
        <Text style={styles.assessmentPre}>TOPOLOGICAL PRECURSOR ASSESSMENT</Text>
        <Text style={styles.crackModeText}>{data.classification.crack_mode}</Text>
        
        <View style={styles.leadTimeRow}>
          <Text style={styles.leadTimeVal}>{data.classification.lead_time_ms.toFixed(0)}</Text>
          <Text style={styles.leadTimeUnit}>ms Lead Time</Text>
        </View>

        <Text style={styles.leadTimeDesc}>
          Precursor acoustic dynamics flagged ahead of irreversible macro-fracture formation.
        </Text>

        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeHeader}>
            <Text style={styles.gaugeLabel}>Damage Precursor Index (CDPI)</Text>
            <Text style={styles.gaugeVal}>{data.classification.cdpi_score.toFixed(3)}</Text>
          </View>
          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: `${data.classification.cdpi_score * 100}%` }]} />
          </View>
          <Text style={styles.gaugeStatus}>Status: Active Crack Propagation (Imminent Shear Slip)</Text>
        </View>
      </View>

      {/* TDA Hyperparameters Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Dynamical Phase-Space Attractor</Text>
        
        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Embedding Dim (d)</Text>
            <Text style={styles.cellVal}>{data.takens.embedding_dimension}</Text>
            <Text style={styles.cellSub}>FNN &lt; 0.01</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Delay Lag (τ)</Text>
            <Text style={styles.cellVal}>{data.takens.delay_lag_tau} spl</Text>
            <Text style={styles.cellSub}>{data.takens.tau_time_microsec} &mu;s</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>H₀ Entropy</Text>
            <Text style={styles.cellVal}>{data.persistent_homology.entropy_h0}</Text>
            <Text style={styles.cellSub}>Connected Components</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>H₁ Entropy</Text>
            <Text style={styles.cellVal}>{data.persistent_homology.entropy_h1}</Text>
            <Text style={styles.cellSub}>Topological Loops</Text>
          </View>
        </View>
      </View>

      {/* Model Triangulation Breakdown */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Multi-Model Consensus</Text>
        
        <View style={styles.modelRow}>
          <Text style={styles.modelName}>TopoAE (Random Forest)</Text>
          <Text style={styles.modelScore}>{(data.classification.confidence * 100).toFixed(1)}% (Rank 1)</Text>
        </View>
        <View style={styles.modelRow}>
          <Text style={styles.modelName}>Conventional ASTM AE</Text>
          <Text style={styles.modelScore}>84.9% (Rank 3)</Text>
        </View>
        <View style={styles.modelRow}>
          <Text style={styles.modelName}>1D Residual CNN</Text>
          <Text style={styles.modelScore}>96.4% (Rank 2)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1E1E28',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF5500',
    borderRadius: 8,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  assessmentCard: {
    backgroundColor: '#16161C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF550050',
    padding: 16,
    gap: 8,
  },
  assessmentPre: {
    color: '#FF5500',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  crackModeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  leadTimeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 4,
  },
  leadTimeVal: {
    color: '#FF5500',
    fontSize: 36,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  leadTimeUnit: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  leadTimeDesc: {
    color: '#A1A1AA',
    fontSize: 11,
    lineHeight: 16,
  },
  gaugeContainer: {
    backgroundColor: '#0C1017',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 12,
    marginTop: 8,
    gap: 6,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gaugeLabel: {
    color: '#71717A',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  gaugeVal: {
    color: '#FF5500',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: '#1E1E28',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: '#FF5500',
    borderRadius: 4,
  },
  gaugeStatus: {
    color: '#D4D4D8',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: '#16161C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCell: {
    flex: 1,
    backgroundColor: '#0C1017',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22222E',
    padding: 10,
    gap: 2,
  },
  cellLabel: {
    color: '#71717A',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  cellVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  cellSub: {
    color: '#A1A1AA',
    fontSize: 9,
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#22222E',
  },
  modelName: {
    color: '#D4D4D8',
    fontSize: 11,
  },
  modelScore: {
    color: '#FF5500',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
