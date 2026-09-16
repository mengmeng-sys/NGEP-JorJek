import { PublicClientApplication, InteractionType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

export const msalConfig = {
  auth: {
    clientId: clientId || "",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

export const msalInstance = new PublicClientApplication(msalConfig);

export { MsalProvider, InteractionType };
