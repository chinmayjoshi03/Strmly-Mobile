import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

export const BACKEND_API_URL = extra.BACKEND_API_URL;

export const getGoogleClientId = () => {
  let clientId;
  if (Platform.OS === "android") {
    clientId = extra.googleClientIdAndroid;
  } else if (Platform.OS === "ios") {
    clientId = extra.googleClientIdIOS;
  } else {
    clientId = extra.googleClientIdWeb;
  }
  
  if (!clientId) {
    console.warn(`Google Client ID not found for platform: ${Platform.OS}`);
    console.warn('Available extra config:', extra);
    // Return a placeholder to prevent the error, but Google auth won't work
    return "placeholder-client-id";
  }
  
  return clientId;
};

export const useGoogleAuth = () => {
  console.log("Redirect URI:", makeRedirectUri());

  const redirectUri = makeRedirectUri();
  const clientId = getGoogleClientId();

  console.log("Google Client ID:", clientId);
  console.log("Platform:", Platform.OS);

  // Only initialize Google auth if we have a valid client ID
  const [request, response, promptAsync] = Google.useAuthRequest(
    clientId && clientId !== "placeholder-client-id" 
      ? {
          clientId,
          redirectUri,
          scopes: ["profile", "email"],
        }
      : {
          clientId: "", // This will cause the hook to not initialize properly
          redirectUri,
          scopes: ["profile", "email"],
        }
  );

  return { promptAsync, response, request };
};