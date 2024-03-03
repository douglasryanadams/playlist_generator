<template>
  <Button
    label="Log in with Spotify"
    severity="info"
    @click="spotifyPCKELogin"
    size="large"
  />
</template>

<script setup>
import { inject } from "vue";
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";

const spotifyTokenStore = useSpotifyTokenStore();

const CLIENT_ID = inject("client-id");
const SCOPE =
  "playlist-modify-public playlist-modify-private user-read-recently-played user-read-currently-playing";
const STATE = Math.random().toString().substring(2);

const redirectUri = inject("redirect-uri");
if (!redirectUri) {
  throw new Error("Redirect URI not found");
}
const generateRandomString = (length) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const spotifyPCKELogin = async (event) => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const authUrl = new URL("https://accounts.spotify.com/authorize");

  // generated in the previous step
  spotifyTokenStore.codeVerifier = codeVerifier;

  const params = {
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPE,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
};
</script>

<style scoped></style>
