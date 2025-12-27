import axios from 'axios';
import { GOOGLE_API_KEY } from '../constants/apiKeys';

export const fetchNearbyPlaces = async (latitude, longitude, radius = 5000, type = 'restaurant') => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
};

// New function for place details
export const fetchPlaceDetails = async (placeId) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,photos&key=${GOOGLE_API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};