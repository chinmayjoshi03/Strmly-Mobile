import 'dotenv/config';

export default {
  "expo": {
    "name": "native-movie",
    "slug": "native-movie",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "movies",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    extra: {
      BACKEND_API_URL: process.env.BACKEND_API_URL,
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.strmly.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "softwareKeyboardLayoutMode": "resize",
      "edgeToEdgeEnabled": true
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-video",
        {
          "supportsBackgroundPlayback": true,
          "supportsPictureInPicture": true
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ],
      "expo-web-browser"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
