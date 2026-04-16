import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ route, navigation }: Props) {
  const { placeName, latitude, longitude } = route.params;
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting web location:", error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  // Construir la URL del mapa. 
  // Si tenemos ubicación del usuario, intentamos mostrar "direcciones"
  const mapUrl = userCoords 
    ? `https://maps.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=${latitude},${longitude}&hl=es&z=14&output=embed`
    : `https://maps.google.com/maps?q=${latitude},${longitude}&hl=es&z=15&output=embed`;

  return (
    <View style={styles.container}>
      {/* @ts-ignore */}
      <iframe
        src={mapUrl}
        style={styles.iframe}
        allowFullScreen={true}
        loading="lazy"
      />

      <SafeAreaView style={styles.headerAbsolute}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>
      
      <View style={styles.infoCard}>
         <Ionicons name="location" size={28} color={COLORS.primary} />
         <View style={{marginLeft: SPACING.sm, flex: 1}}>
            <Text style={styles.placeName} numberOfLines={2}>{placeName}</Text>
            <Text style={styles.latLngInfo}>Destino: {latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
            {userCoords && <Text style={styles.routeText}>Mostrando ruta desde tu ubicación actual</Text>}
         </View>
      </View>

      {loading && !userCoords && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{marginTop: 10, color: COLORS.textSecondary}}>Localizando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  iframe: {
    borderWidth: 0,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  headerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: SPACING.sm,
  },
  infoCard: {
     position: 'absolute',
     bottom: 40,
     left: SPACING.lg,
     right: SPACING.lg,
     backgroundColor: COLORS.surface,
     borderRadius: RADIUS.lg,
     padding: SPACING.md,
     flexDirection: 'row',
     alignItems: 'center',
     shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  placeName: {
     fontSize: TYPOGRAPHY.base,
     fontWeight: TYPOGRAPHY.bold,
     color: COLORS.textPrimary,
  },
  latLngInfo: {
     fontSize: TYPOGRAPHY.xs,
     color: COLORS.textSecondary,
     marginTop: 2,
  },
  routeText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.medium,
    marginTop: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  }
});
