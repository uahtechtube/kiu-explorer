#!/bin/bash
# Install all missing dependencies for KIU Explorer

echo "Installing missing dependencies..."

# Install expo-av for video player
echo "1. Installing expo-av..."
npm install expo-av

# Install Pusher WebSocket for real-time features
echo "2. Installing Pusher WebSocket..."
npm install @pusher/pusher-websocket-react-native

# Install any peer dependencies
echo "3. Installing peer dependencies..."
npm install

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Clear cache if needed: npx expo start -c"
