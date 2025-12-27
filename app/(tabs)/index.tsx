import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { fetchNearbyPlaces, fetchPlaceDetails } from '../../services/placesService';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GOOGLE_API_KEY } from '../../constants/apiKeys';

export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('restaurant');
  const [radius, setRadius] = useState(5000);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Fetch nearby places whenever location, type, or radius changes
  useEffect(() => {
    if (!location) return;

    (async () => {
      setLoadingPlaces(true);
      const placesData = await fetchNearbyPlaces(
        location.latitude,
        location.longitude,
        radius,
        selectedType
      );
      setPlaces(placesData || []);
      setLoadingPlaces(false);
    })();
  }, [location, selectedType, radius]);

  // Handle marker tap → fetch details and open bottom sheet
  const handleMarkerPress = async (place: any) => {
    setSelectedPlace(place);
    const details = await fetchPlaceDetails(place.place_id);
    setPlaceDetails(details);
    bottomSheetRef.current?.snapToIndex(0);
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 16, fontSize: 18 }}>Loading your location...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Google Map */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {/* Your current location */}
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="You are here"
            pinColor="red"
          />

          {/* Nearby places markers */}
          {places.map((place) => (
            <Marker
              key={place.place_id}
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              description={place.vicinity || 'No address'}
              pinColor="blue"
              onPress={() => handleMarkerPress(place)}
            />
          ))}
        </MapView>

        {/* Filters Panel at Bottom */}
        <View style={styles.filters}>
          <Text style={styles.label}>Select Type:</Text>
          <Picker
            selectedValue={selectedType}
            onValueChange={setSelectedType}
            style={styles.picker}
            dropdownIconColor="#000"
          >
            <Picker.Item label="Restaurant" value="restaurant" />
            <Picker.Item label="Cafe" value="cafe" />
            <Picker.Item label="Hospital" value="hospital" />
            <Picker.Item label="Pharmacy" value="pharmacy" />
            <Picker.Item label="ATM" value="atm" />
            <Picker.Item label="Bank" value="bank" />
            <Picker.Item label="Gas Station" value="gas_station" />
            <Picker.Item label="Supermarket" value="supermarket" />
          </Picker>

          <Text style={styles.label}>Radius: {radius / 1000} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={1000}
            maximumValue={20000}
            step={1000}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#4285F4"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#4285F4"
          />

          {loadingPlaces && (
            <ActivityIndicator size="small" color="#fff" style={{ marginTop: 8 }} />
          )}
        </View>

        {/* Bottom Sheet for Place Details */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1} // Start closed
          snapPoints={['50%', '80%']}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: '#ffffff' }}
        >
          <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
            {placeDetails ? (
              <>
                <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 8 }}>
                  {placeDetails.name}
                </Text>

                <Text style={{ fontSize: 16, color: '#555', marginBottom: 12 }}>
                  {placeDetails.formatted_address || 'No address available'}
                </Text>

                {placeDetails.rating && (
                  <Text style={{ fontSize: 18, marginBottom: 16 }}>
                    Rating: {placeDetails.rating} ⭐
                  </Text>
                )}

                {/* Photo - only show if available and has reference */}
                {placeDetails.photos &&
                  placeDetails.photos.length > 0 &&
                  placeDetails.photos[0].photo_reference && (
                    <Image
                      source={{
                        uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${placeDetails.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`,
                      }}
                      style={{
                        width: '100%',
                        height: 220,
                        borderRadius: 16,
                        marginTop: 8,
                      }}
                      resizeMode="cover"
                    />
                  )}
              </>
            ) : selectedPlace ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color="#4285F4" />
                <Text style={{ marginTop: 16 }}>Loading details...</Text>
              </View>
            ) : null}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  filters: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 50,
  },
});