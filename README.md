# Frontend Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Expo Go](https://expo.dev/client) app on your mobile device (iOS/Android)

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2) **Set up environment variables**

   Copy .env.example → create a new .env file.

   - Replace the placeholder with your local IP address
   - EXPO_PUBLIC_API_BASE_URL=http://<your-local-ip>
   - Make sure your device running Expo Go is on the same Wi-Fi network as your development machine.

3) **Start the development server**

   ```bash
   npm start

   ```

4) **Run the app with Expo Go**

   - After running npm start, a QR code will appear in your terminal or browser.
   - Open Expo Go on your phone.
   - Scan the QR code to load the app.

**Notes**

- This project is configured to work out of the box with Expo Go (no custom dev client required).

If you encounter connection issues:

- Double-check your IP address in the .env file.
- Ensure both your phone and dev machine are on the same network.
