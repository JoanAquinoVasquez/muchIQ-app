import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

const { width, height } = Dimensions.get('window');

export default function MapScreen({ route, navigation }: Props) {
  const { placeName, latitude, longitude } = route.params;
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        
        // Si tenemos ambos puntos, ajustamos la vista
        if (mapRef.current) {
          const coordinates = [
            { latitude, longitude },
            { 
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude 
            }
          ];
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 100, bottom: 200, left: 100 },
            animated: true,
          });
        }
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={placeName}
          pinColor={COLORS.primary}
        />
        
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Tu ubicación"
            pinColor={COLORS.info || '#2196F3'}
          >
            <View style={styles.userMarkerContainer}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}
      </MapView>

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
            {userLocation && (
              <Text style={styles.routeInfo}>Estás cerca. Visualiza tu punto azul en el mapa.</Text>
            )}
         </View>
      </View>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
  map: {
    width: width,
    height: height,
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
  routeInfo: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.medium,
    marginTop: 4,
  },
  userMarkerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  }
});
