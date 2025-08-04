import 'dotenv/config';

export default {
  expo: {
    name: "strmly",
    slug: "strmly",
    scheme: "strmly",
    owner: "strmly-technologies",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.anonymous.strmly",
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.anonymous.strmly",
      softwareKeyboardLayoutMode: "resize",
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "expo-video",
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true
        }
      ],
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      BACKEND_API_URL: process.env.BACKEND_API_URL,
      googleClientIdAndroid: process.env.GOOGLE_CLIENT_ID_ANDROID,
      googleClientIdIOS: process.env.GOOGLE_CLIENT_ID_IOS,
      googleClientIdWeb: process.env.GOOGLE_CLIENT_ID_WEB,
      eas: {
        projectId: "d455cc31-c9ac-409d-92de-b847919939d4"
      }
    }
  }
};