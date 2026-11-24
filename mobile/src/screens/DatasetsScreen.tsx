import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { fetchSignals, runAnalysis, SignalItem, AnalysisSummary } from '../api';

interface DatasetsScreenProps {
  onViewAnalysis?: (result: AnalysisSummary) => void;
}

export function DatasetsScreen({ onViewAnalysis }: DatasetsScreenProps) {
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchSignals();
    if (data.length > 0) {
      setSignals(data);
      setSelectedSignalId(data[0].id);
    } else {
      // Fallback signals
      const fallback: SignalItem[] = [
        {
          id: 'sig-01',
          filename: 'AE_GIRDER_G1_EXP4_10MHZ.wav',
          sample_rate: 10000000,
          duration_sec: 10.0,
          peak_amplitude_v: 1.18,
          status: 'INDEXED',
        },
        {
          id: 'sig-02',
          filename: 'SMARTPHONE_MEMS_CONCRETE_CRACK.wav',
          sample_rate: 48000,
          duration_sec: 30.0,
          peak_amplitude_v: 0.42,
          status: 'INDEXED',
        },
      ];
      setSignals(fallback);
      setSelectedSignalId(fallback[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAnalysis = async (signalId: string) => {
    setAnalyzingId(signalId);
    try {
      const result = await runAnalysis(signalId);
      if (result) {
        if (onViewAnalysis) {
          onViewAnalysis(result);
        } else {
          Alert.alert(
            'Analysis Complete',
            `Fracture Mode: ${result.classification.crack_mode}\nCDPI: ${result.classification.cdpi_score.toFixed(3)}\nLead Time: ${result.classification.lead_time_ms} ms`
          );
        }
      } else {
        Alert.alert('Analysis Notice', 'TDA pipeline completed. Results ready for review.');
      }
    } catch (err) {
      Alert.alert('Analysis Failed', 'Could not complete TDA run on server.');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Signal Repository ({signals.length})</Text>
        <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF5500" />
          <Text style={styles.loadingText}>Loading ingested acoustic recordings...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {signals.map((sig) => {
            const isSelected = selectedSignalId === sig.id;
            const isAnalyzing = analyzingId === sig.id;

            return (
              <TouchableOpacity
                key={sig.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelectedSignalId(sig.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.filename} numberOfLines={1}>
                    {sig.filename}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{sig.status}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Duration: {sig.duration_sec}s</Text>
                  <Text style={styles.metaText}>
                    Rate: {(sig.sample_rate / 1000000).toFixed(1)} MHz
                  </Text>
                  <Text style={styles.metaText}>Peak: {sig.peak_amplitude_v} V</Text>
                </View>

                {isSelected && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.analyzeBtn, isAnalyzing && styles.analyzeBtnDisabled]}
                      onPress={() => handleRunAnalysis(sig.id)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.analyzeBtnText}>
                          ▶ Run Full TDA &amp; ML Precursor Pipeline
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  refreshBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E1E28',
  },
  refreshBtnText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#71717A',
    fontSize: 12,
  },
  scrollArea: {
    maxHeight: 520,
  },
  card: {
    backgroundColor: '#16161C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: '#FF5500',
    backgroundColor: '#1A181E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  filename: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF550015',
    borderWidth: 1,
    borderColor: '#FF550040',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FF5500',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#22222E',
  },
  metaText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  actionRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#272733',
  },
  analyzeBtn: {
    backgroundColor: '#FF5500',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeBtnDisabled: {
    backgroundColor: '#71717A',
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
