import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function SystemScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EchoSense Pipeline Architecture</Text>
      
      <View style={styles.card}>
        <Text style={styles.specLabel}>Topological Engine</Text>
        <Text style={styles.specVal}>C++ GUDHI & Ripser Engine (Vietoris-Rips Filtration)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.specLabel}>Dynamical Embedding</Text>
        <Text style={styles.specVal}>Takens Delay Coordinates: dim d=3, lag tau=4 samples</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.specLabel}>Precursor Changepoint Algorithm</Text>
        <Text style={styles.specVal}>Bayesian Online Changepoint Detection (BOCD)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.specLabel}>Compliance Standards</Text>
        <Text style={styles.specVal}>EN 1330-9, ASTM E1316, ISO 9712 NDT</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.specLabel}>Hardware Clock Synchronization</Text>
        <Text style={styles.specVal}>IEEE 1588 Precision Time Protocol (&lt; 42ns inter-channel drift)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#16161C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#272733',
    padding: 14,
  },
  specLabel: {
    color: '#8B949E',
    fontSize: 11,
  },
  specVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
});
