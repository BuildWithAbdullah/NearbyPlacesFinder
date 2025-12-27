import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Services
import { fetchNearbyPlaces, fetchPlaceDetails } from './services/placesService';

// Bottom Sheet
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedType, setSelectedType] = useState('restaurant');
  const [radius, setRadius] = useState(5000);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  // For bottom sheet
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const bottomSheetRef = useRef(null);

  // Get location once
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Fetch places when needed
  useEffect(() => {
    if (!location) return;
    (async () => {
      setLoadingPlaces(true);
      const placesData = await fetchNearbyPlaces(location.latitude, location.longitude, radius, selectedType);
      setPlaces(placesData || []);
      setLoadingPlaces(false);
    })();
  }, [location, selectedType, radius]);

  // When a marker is tapped
  const handleMarkerPress = async (place) => {
    setSelectedPlace(place);
    const details = await fetchPlaceDetails(place.place_id);
    setPlaceDetails(details);
    bottomSheetRef.current?.snapToIndex(0); // Open bottom sheet
  };

  // Photo URL helper
  const getPhotoUrl = (photoReference) => {
    if (!photoReference) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Map */}
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
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="You are here"
            pinColor="red"
          />

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

        {/* Filters Panel */}
        <View style={styles.filters}>
          <Text style={styles.label}>Select Type:</Text>
          <Picker selectedValue={selectedType} onValueChange={setSelectedType} style={styles.picker}>
            {/* Your picker items */}
            <Picker.Item label="Restaurant" value="restaurant" />
            <Picker.Item label="Cafe" value="cafe" />
            <Picker.Item label="Hospital" value="hospital" />
            <Picker.Item label="Pharmacy" value="pharmacy" />
            <Picker.Item label="ATM" value="atm" />
            <Picker.Item label="Bank" value="bank" />
            {/* Add more */}
          </Picker>

          <Text style={styles.label}>Radius: {radius / 1000} km</Text>
          <Slider style={styles.slider} minimumValue={1000} maximumValue={20000} step={1000} value={radius} onValueChange={setRadius} />

          {loadingPlaces && <ActivityIndicator size="small" color="#fff" style={{ marginTop: 8 }} />}
        </View>

        {/* Bottom Sheet for Place Details */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1} // Start closed
          snapPoints={['50%', '80%']}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: '#fff' }}
        >
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {placeDetails ? (
              <>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{placeDetails.name}</Text>
                <Text style={{ fontSize: 16, color: '#666', marginVertical: 8 }}>
                  {placeDetails.formatted_address || 'No address'}
                </Text>
                {placeDetails.rating && (
                  <Text style={{ fontSize: 18 }}>Rating: {placeDetails.rating} ⭐</Text>
                )}

                {placeDetails.photos && placeDetails.photos[0] && (
                  <Image
                    source={{ uri: getPhotoUrl(placeDetails.photos[0].photo_reference) }}
                    style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 16 }}
                  />
                )}
              </>
            ) : selectedPlace ? (
              <ActivityIndicator size="large" />
            ) : null}
          </ScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  label: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  picker: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16 },
  slider: { width: '100%', height: 40 },
});