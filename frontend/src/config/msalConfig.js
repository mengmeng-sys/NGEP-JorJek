import { PublicClientApplication, InteractionType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

export const msalConfig = {
  auth: {
    clientId: clientId || "",
    authority: "https://login.microsoftonline.com/1e9461ec-5362-4329-ae46-61fa3e91c6d2",
    redirectUri: "http://localhost:3000",
    postLogoutRedirectUri: "http://localhost:3000",
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
