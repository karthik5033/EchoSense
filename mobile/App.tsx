import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { fetchDashboardStats, checkBackendHealth, DashboardStats, AnalysisSummary } from './src/api';
import { TelemetryScreen } from './src/screens/TelemetryScreen';
import { RecordScreen } from './src/screens/RecordScreen';
import { DatasetsScreen } from './src/screens/DatasetsScreen';
import { SystemScreen } from './src/screens/SystemScreen';
import { AnalysisResultScreen } from './src/screens/AnalysisResultScreen';

export default function App() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'record' | 'datasets' | 'system' | 'analysis'>('monitor');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisSummary | null>(null);

  const loadData = async () => {
    setLoading(true);
    const online = await checkBackendHealth();
    setIsOnline(online);
    if (online) {
      const data = await fetchDashboardStats();
      setStats(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>ES</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>EchoSense Mobile</Text>
            <Text style={styles.brandSubtitle}>Topological AE Monitoring</Text>
          </View>
        </View>

        <View style={[styles.statusPill, isOnline ? styles.statusOnline : styles.statusOffline]}>
          <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
          <Text style={styles.statusText}>{isOnline ? 'LIVE API' : 'OFFLINE'}</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'monitor' && styles.tabButtonActive]}
          onPress={() => setActiveTab('monitor')}
        >
          <Text style={[styles.tabText, activeTab === 'monitor' && styles.tabTextActive]}>Telemetry</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'record' && styles.tabButtonActive]}
          onPress={() => setActiveTab('record')}
        >
          <Text style={[styles.tabText, activeTab === 'record' && styles.tabTextActive]}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'datasets' && styles.tabButtonActive]}
          onPress={() => setActiveTab('datasets')}
        >
          <Text style={[styles.tabText, activeTab === 'datasets' && styles.tabTextActive]}>Datasets</Text>
        </TouchableOpacity>

        {selectedAnalysis && (
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'analysis' && styles.tabButtonActive]}
            onPress={() => setActiveTab('analysis')}
          >
            <Text style={[styles.tabText, activeTab === 'analysis' && styles.tabTextActive]}>Results</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'system' && styles.tabButtonActive]}
          onPress={() => setActiveTab('system')}
        >
          <Text style={[styles.tabText, activeTab === 'system' && styles.tabTextActive]}>TDA Engine</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#FF5500" />
            <Text style={styles.loadingText}>Connecting to EchoSense Engine...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'monitor' && <TelemetryScreen stats={stats} />}
            {activeTab === 'record' && <RecordScreen onRecordingFinished={() => setActiveTab('datasets')} />}
            {activeTab === 'datasets' && (
              <DatasetsScreen
                onViewAnalysis={(res) => {
                  setSelectedAnalysis(res);
                  setActiveTab('analysis');
                }}
              />
            )}
            {activeTab === 'analysis' && (
              <AnalysisResultScreen
                result={selectedAnalysis}
                onBack={() => setActiveTab('datasets')}
              />
            )}
            {activeTab === 'system' && <SystemScreen />}

            {activeTab !== 'analysis' && (
              <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
                <Text style={styles.refreshButtonText}>Refresh Telemetry</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C1017',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#272733',
    backgroundColor: '#16161C',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FF5500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  brandSubtitle: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },
  statusOnline: {
    backgroundColor: '#16281E',
    borderColor: '#22C55E40',
  },
  statusOffline: {
    backgroundColor: '#272733',
    borderColor: '#3F3F46',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOnline: {
    backgroundColor: '#22C55E',
  },
  dotOffline: {
    backgroundColor: '#71717A',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16161C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#272733',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#272733',
  },
  tabText: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF5500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#71717A',
    fontSize: 13,
  },
  refreshButton: {
    backgroundColor: '#16161C',
    borderWidth: 1,
    borderColor: '#272733',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
});
