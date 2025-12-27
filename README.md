# Nearby Places Finder 📍

A **React Native** app built with **Expo** that helps you discover nearby places like restaurants, cafes, hospitals, pharmacies, ATMs, banks, gas stations, supermarkets, and more — using your real-time location!

Powered by **Google Maps** and **Google Places API**, with live filters for type and radius, beautiful markers, and detailed bottom sheet views (including photos and ratings).

## Live Demo 🚀

Try the app instantly on your phone:

1. Download the free **Expo Go** app (iOS/Android)
2. Open this link: https://u.expo.dev/ab8c3db2-b2e0-4e29-a967-b50ee411db3b

Grant location permission and explore places around you!

## Screenshots
























*(Map view with markers • Filters panel • Place details with photo)*

## Features ✨

- Real-time user location using device GPS
- Interactive Google Map with custom markers (red for you, blue for places)
- Live filters:
  - Type picker (restaurant, cafe, hospital, etc.)
  - Radius slider (1–20 km)
- Tap any marker → sliding bottom sheet with:
  - Name & full address
  - Rating (⭐)
  - High-quality photo (if available)
- Smooth loading indicators and error handling
- Cross-platform (iOS & Android)

## Tech Stack 🛠️

- **Expo** (managed workflow)
- **React Native**
- **react-native-maps** (Google Maps provider)
- **expo-location**
- **Google Places API** (Nearby Search + Place Details)
- **@gorhom/bottom-sheet** (beautiful details sheet)
- **@react-native-picker/picker** & **@react-native-community/slider**

## Setup & Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/buildwithabdullah/NearbyPlacesFinder.git
   cd NearbyPlacesFinder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   (or `yarn install`)

3. Add your Google API key:
   - Create `constants/apiKeys.js`:
     ```js
     export const GOOGLE_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY_HERE';
     ```
   - Enable Places API, Maps SDK for Android/iOS in Google Cloud Console.

4. Start the app:
   ```bash
   npx expo start
   ```
   Scan QR code with Expo Go app.

## Deployment

- Published via **EAS Update** for instant over-the-air updates.
- Live link: https://u.expo.dev/ab8c3db2-b2e0-4e29-a967-b50ee411db3b

## Contributing

Contributions welcome! Feel free to:
- Open issues
- Submit PRs (bug fixes, new place types, UI improvements)

## License

MIT License © 2025 Abdullah Shabbir

---

Built with ❤️ by [@buildwithabdullah](https://github.com/buildwithabdullah)

Star the repo if you like it! ⭐
