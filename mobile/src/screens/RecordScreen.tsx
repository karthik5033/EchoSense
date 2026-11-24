import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import {
  uploadAudioSignal,
  runAnalysis,
  AnalysisSummary,
  sendClientLog,
  API_BASE_URL,
} from '../api';
import { AcousticOscilloscope } from '../components/AcousticOscilloscope';
import { DiagnosticModal } from '../components/DiagnosticModal';
import { useAcousticSensor } from '../hooks/useAcousticSensor';

interface RecordScreenProps {
  onRecordingFinished?: (signalId: string, result?: AnalysisSummary) => void;
}

export function RecordScreen({ onRecordingFinished }: RecordScreenProps) {
  // Ultra-responsive acoustic sensor hook (laptop mic + mobile MEMS array)
  const micSensor = useAcousticSensor(true);

  const [isRecording, setIsRecording] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [specimen, setSpecimen] = useState('Prestressed Concrete Girder G1');
  const [locationNote, setLocationNote] = useState('Midspan Station 4 - Sensor #2');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Web MediaRecorder references for laptop audio capture
  const webMediaRecorderRef = useRef<any>(null);
  const webChunksRef = useRef<any[]>([]);
  const timerRef = useRef<any>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setDurationSec(0);
      timerRef.current = setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new (window as any).MediaRecorder(stream);
        webChunksRef.current = [];

        mediaRecorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) {
            webChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start();
        webMediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        setUploadStatus(null);
        await sendClientLog('INFO', 'startRecording.web', 'Web audio acquisition recording started');
      } else {
        // Native mobile phone recording
        if (micSensor.rawRecorder) {
          await micSensor.rawRecorder.prepareToRecordAsync();
          micSensor.rawRecorder.record();
          setIsRecording(true);
          setUploadStatus(null);
          await sendClientLog('INFO', 'startRecording.native', 'Mobile MEMS acquisition started');
        }
      }
    } catch (err: any) {
      await sendClientLog('ERROR', 'startRecording', err.message);
      Alert.alert('Microphone Access Error', err.message || 'Could not start acoustic acquisition.');
    }
  };

  const stopAndUpload = async () => {
    try {
      setIsUploading(true);
      setIsRecording(false);
      setUploadStatus('Finalizing audio stream & packaging PCM envelope...');

      let uploadedSignal = null;

      if (Platform.OS === 'web') {
        if (!webMediaRecorderRef.current) {
          throw new Error('No active web media recording stream found.');
        }

        const stoppedPromise = new Promise<Blob>((resolve) => {
          webMediaRecorderRef.current.onstop = () => {
            const blob = new Blob(webChunksRef.current, { type: 'audio/webm' });
            resolve(blob);
          };
        });

        webMediaRecorderRef.current.stop();
        const audioBlob = await stoppedPromise;

        const filename = `mems_laptop_recording_${Date.now()}.webm`;
        const formData = new FormData();
        formData.append('file', audioBlob, filename);
        formData.append('specimen', specimen);

        setUploadStatus('Uploading recording to EchoSense API...');
        const res = await fetch(`${API_BASE_URL}/signals/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Upload failed (${res.status}): ${errText}`);
        }
        uploadedSignal = await res.json();
      } else {
        // Native phone audio upload
        if (!micSensor.rawRecorder) {
          throw new Error('Native recorder unavailable.');
        }
        await micSensor.rawRecorder.stop();
        const uri = micSensor.rawRecorder.uri;
        if (!uri) throw new Error('Recording ended with no audio URI.');

        const filename = `mems_recording_${Date.now()}.m4a`;
        setUploadStatus('Uploading recording to EchoSense API...');
        uploadedSignal = await uploadAudioSignal(uri, filename, specimen);
      }

      if (!uploadedSignal) {
        throw new Error('Server rejected acoustic recording upload.');
      }

      setUploadStatus('Upload successful! Running TDA & ML inference pipeline...');
      const analysisResult = await runAnalysis(uploadedSignal.id);

      if (analysisResult) {
        setUploadStatus('Topological classification complete!');
        if (onRecordingFinished) {
          onRecordingFinished(uploadedSignal.id, analysisResult);
        }
      } else {
        setUploadStatus(`Signal ${uploadedSignal.id} uploaded and indexed successfully.`);
        if (onRecordingFinished) {
          onRecordingFinished(uploadedSignal.id);
        }
      }
    } catch (err: any) {
      await sendClientLog('ERROR', 'stopAndUpload', err.message);
      Alert.alert(
        'Upload / Analysis Error',
        `${err.message}\n\nDiagnostic logs forwarded to backend. Tap Diagnostics to view system status.`,
        [
          { text: 'OK', style: 'cancel' },
          { text: 'View Diagnostics', onPress: () => setShowDiagnostics(true) },
        ]
      );
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopAndUpload();
    } else {
      startRecording();
    }
  };

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Diagnostics Modal */}
      <DiagnosticModal
        visible={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        micPermissionGranted={micSensor.permissionGranted}
        liveDbLevel={isRecording ? micSensor.peakV : undefined}
      />

      <View style={styles.recordCard}>
        {/* Header & Subsystem quick link */}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.title}>Smartphone Acoustic Field Sensor</Text>
          <TouchableOpacity
            style={styles.diagBtn}
            onPress={() => setShowDiagnostics(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.diagBtnText}>Diagnostics</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.desc}>
          Acquires live real-time structural acoustic transients using the microphone calibrated to ASTM E1316.
        </Text>

        {/* Live Audio Oscilloscope Display with real physical microphone audio */}
        <AcousticOscilloscope
          waveform={micSensor.waveform}
          peakV={micSensor.peakV}
          freqKhz={48.0}
          rms={micSensor.rms}
          sourceLabel={isRecording ? "RECORDING ACTIVE" : "LIVE MIC SENSOR"}
          isLive={true}
          fftData={micSensor.fftBands}
        />

        {/* Digital Time & Vpp Readout */}
        <View style={styles.meterContainer}>
          <Text style={styles.meterValue}>{formatSec(durationSec)}</Text>
          <Text style={styles.meterSub}>
            Peak: {micSensor.peakV.toFixed(2)} Vpp • Rate: 48.0 kHz • 24-bit PCM
          </Text>
        </View>

        {/* Start / Stop Trigger Button */}
        <TouchableOpacity
          style={[styles.recordBtn, isRecording ? styles.recordBtnActive : styles.recordBtnIdle]}
          onPress={toggleRecording}
          disabled={isUploading}
          activeOpacity={0.8}
        >
          <View style={[styles.recIndicator, isRecording && styles.recIndicatorStop]} />
          <Text style={styles.recordBtnText}>
            {isRecording ? 'Stop & Run Topological Analysis' : 'Start Acoustic Acquisition'}
          </Text>
        </TouchableOpacity>

        {isUploading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#FF5500" />
            <Text style={styles.loadingText}>Processing pipeline on backend...</Text>
          </View>
        )}

        {uploadStatus && !isUploading && (
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
          <Text style={styles.metaLabel}>Hardware Protocol:</Text>
          <Text style={styles.metaValue}>MEMS Audio PCM • 48 kHz / 24-bit</Text>
        </View>
      </View>
    </ScrollView>
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
    padding: 16,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  diagBtnText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'monospace',
    flex: 1,
  },
  desc: {
    color: '#A1A1AA',
    fontSize: 12,
    lineHeight: 18,
  },
  meterContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  meterValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  meterSub: {
    color: '#71717A',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
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
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    color: '#FF5500',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  statusBox: {
    backgroundColor: '#0F291E',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    padding: 10,
  },
  statusSuccess: {
    color: '#34D399',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  paramsCard: {
    backgroundColor: '#16161C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 14,
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  paramTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: '#71717A',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#0C1017',
    borderWidth: 1,
    borderColor: '#272733',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#22222E',
  },
  metaLabel: {
    color: '#71717A',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  metaValue: {
    color: '#D4D4D8',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
