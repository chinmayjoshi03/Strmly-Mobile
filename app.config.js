import 'dotenv/config';

export default {
  "expo": {
    "name": "strmly",
    "slug": "strmly",
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
      bundleIdentifier: "com.anonymous.strmly",
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      package: "com.anonymous.strmly",
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
      "expo-web-browser"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
