import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

export const BACKEND_API_URL = extra.BACKEND_API_URL;

export const getGoogleClientId = () => {
  if (Platform.OS === "android") return extra.googleClientIdAndroid;
  if (Platform.OS === "ios") return extra.googleClientIdIOS;
  return extra.googleClientIdWeb;
};

export const useGoogleAuth = () => {
  console.log("Redirect URI:", makeRedirectUri());

  const redirectUri = makeRedirectUri();

  const clientId = getGoogleClientId();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId,
    redirectUri,
    scopes: ["profile", "email"],
  });

  return { promptAsync, response, request };
};