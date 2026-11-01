# Re-enabling WebSocket (Pusher) Guide

## Current Status
WebSocket features are **temporarily disabled** because `@pusher/pusher-websocket-react-native` requires native modules that need an Expo development build.

## Why It's Disabled
- The Pusher package is a native module (not pure JavaScript)
- Expo Go doesn't support custom native modules
- Requires creating a development build with EAS Build

## How to Re-enable (When Ready)

### Option 1: Create Expo Development Build (Recommended)

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure EAS**:
```bash
eas build:configure
```

4. **Install Pusher Package**:
```bash
npx expo install @pusher/pusher-websocket-react-native
```

5. **Create Development Build**:
```bash
# For Android
eas build --profile development --platform android

# For iOS
eas build --profile development --platform ios
```

6. **Uncomment WebSocket Code**:
   - Open `context/WebSocketContext.tsx`
   - Uncomment the Pusher import (line 3)
   - Uncomment the Pusher implementation (lines 29-92)
   - Remove the TODO comments

7. **Test**:
```bash
npx expo start --dev-client
```

### Option 2: Use Alternative WebSocket Solution

If you don't want to create a development build, consider:

1. **Socket.IO** (works with Expo Go):
```bash
npm install socket.io-client
```

2. **Native WebSocket API** (built-in):
```javascript
const ws = new WebSocket('ws://your-server.com');
```

3. **Pusher Channels HTTP API** (polling instead of WebSocket):
```bash
npm install pusher-js
```

## Current Workaround

The app now runs without WebSocket features:
- ✅ All pages load correctly
- ✅ No bundling errors
- ⚠️ Real-time alerts disabled
- ⚠️ Admin alert notifications won't work

## When to Re-enable

Re-enable WebSocket when:
1. You're ready to create an Expo development build
2. You need real-time features for production
3. You want to test admin alert notifications

## Files Affected

- `context/WebSocketContext.tsx` - Main WebSocket implementation
- `app/admin/alerts/index.tsx` - Uses WebSocket context

## Testing After Re-enabling

1. Login as admin
2. Create a system alert from admin panel
3. Check if real-time notification appears
4. Verify `isConnected` status in WebSocket context

---

**For now, the app works perfectly without WebSocket. Re-enable when you're ready for production deployment!** 🚀
