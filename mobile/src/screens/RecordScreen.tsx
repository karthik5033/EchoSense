import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';

export function RecordScreen({ onRecordingFinished }: { onRecordingFinished?: (signalId?: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [peakV, setPeakV] = useState(0.08);
  const [specimen, setSpecimen] = useState('Prestressed Concrete Girder G1');
  const [locationNote, setLocationNote] = useState('Midspan Station 4 - Sensor #2');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
        // Simulate real-time microphone VU meter oscillation
        const noise = Math.random() * 0.15;
        const transient = Math.random() < 0.15 ? Math.random() * 0.95 : 0;
        setPeakV(parseFloat((0.08 + noise + transient).toFixed(2)));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordSeconds(0);
      setUploadStatus(null);
    } else {
      setIsRecording(false);
      handleSaveAndUpload();
    }
  };

  const handleSaveAndUpload = async () => {
    setIsUploading(true);
    setUploadStatus('Processing 48 kHz PCM stream & segmenting bursts...');

    // Simulate chunked background upload
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus('Recording uploaded & indexed. STA/LTA slices generated.');
      onRecordingFinished?.();
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <View style={styles.recordCard}>
        <Text style={styles.title}>Smartphone Acoustic Field Sensor</Text>
        <Text style={styles.desc}>
          Acquires high-frequency structural acoustic transients using smartphone MEMS microphone array calibrated to ASTM E1316.
        </Text>

        {/* Live VU Meter Display */}
        <View style={styles.meterContainer}>
          <Text style={styles.meterValue}>
            {isRecording
              ? `${Math.floor(recordSeconds / 60).toString().padStart(2, '0')}:${(recordSeconds % 60).toString().padStart(2, '0')}`
              : '00:00'}
          </Text>

          <View style={styles.vMeterBar}>
            <View
              style={[
                styles.vMeterFill,
                { width: `${Math.min(100, (peakV / 1.5) * 100)}%` },
                peakV > 0.6 ? styles.vMeterCritical : styles.vMeterNominal,
              ]}
            />
          </View>
          <Text style={styles.meterSub}>
            Peak: {peakV.toFixed(2)} Vpp • Rate: 48.0 kHz • 24-bit PCM
          </Text>
        </View>

        {/* Start / Stop Trigger */}
        <TouchableOpacity
          style={[styles.recordBtn, isRecording ? styles.recordBtnActive : styles.recordBtnIdle]}
          onPress={toggleRecording}
          disabled={isUploading}
        >
          <View style={[styles.recIndicator, isRecording && styles.recIndicatorStop]} />
          <Text style={styles.recordBtnText}>
            {isRecording ? 'Stop & Upload Field Recording' : 'Start Acoustic Acquisition'}
          </Text>
        </TouchableOpacity>

        {isUploading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#FF5500" />
            <Text style={styles.loadingText}>Uploading to EchoSense Backend...</Text>
          </View>
        )}

        {uploadStatus && (
          <View style={styles.statusBox}>
            <Text style={styles.statusSuccess}>✓ {uploadStatus}</Text>
          </View>
        )}
      </View>

      {/* Field Inspection Metadata Form */}
      <View style={styles.paramsCard}>
        <Text style={styles.paramTitle}>Field Specimen Metadata</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Target Structure / Specimen</Text>
          <TextInput
            style={styles.input}
            value={specimen}
            onChangeText={setSpecimen}
            placeholder="Specimen Name"
            placeholderTextColor="#71717A"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Sensor Placement Location</Text>
          <TextInput
            style={styles.input}
            value={locationNote}
            onChangeText={setLocationNote}
            placeholder="Location description"
            placeholderTextColor="#71717A"
          />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>GPS Telemetry:</Text>
          <Text style={styles.metaValue}>37.7749° N, 122.4194° W (&plusmn;2m)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#16161C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 18,
    gap: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    color: '#A1A1AA',
    fontSize: 12,
    lineHeight: 18,
  },
  meterContainer: {
    backgroundColor: '#0C1017',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  meterValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  vMeterBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#1E1E28',
    borderRadius: 5,
    overflow: 'hidden',
  },
  vMeterFill: {
    height: '100%',
    borderRadius: 5,
  },
  vMeterNominal: {
    backgroundColor: '#FF5500',
  },
  vMeterCritical: {
    backgroundColor: '#EF4444',
  },
  meterSub: {
    color: '#71717A',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  recordBtnIdle: {
    backgroundColor: '#FF5500',
  },
  recordBtnActive: {
    backgroundColor: '#DC2626',
  },
  recIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  recIndicatorStop: {
    borderRadius: 2,
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  statusBox: {
    backgroundColor: '#16281E',
    borderWidth: 1,
    borderColor: '#22C55E40',
    borderRadius: 8,
    padding: 10,
  },
  statusSuccess: {
    color: '#4ADE80',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  paramsCard: {
    backgroundColor: '#16161C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 16,
    gap: 12,
  },
  paramTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    color: '#A1A1AA',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#0C1017',
    borderWidth: 1,
    borderColor: '#272733',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#272733',
  },
  metaLabel: {
    color: '#71717A',
    fontSize: 11,
  },
  metaValue: {
    color: '#A1A1AA',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
