<template>
  <Button label="Log in with Spotify" severity="info" @click="spotifyLogin" size="large"/>
</template>

<script setup>
import {inject} from "vue";

const CLIENT_ID = "b5881a3f486f4533803ebdb7263a5996";
const SCOPE =  "playlist-modify-public user-read-recently-played"
const STATE = Math.random().toString().substring(2)

const redirectUri = inject('redirect-uri');
if (!redirectUri) {
  throw new Error('Redirect URI not found');
}
console.debug("redirect-uri: ", redirectUri);

const spotifyLogin = (event) => {
  console.log("Logging in to Spotify, about to forward browser...");
  const authorizeUrl = "https://accounts.spotify.com/authorize?";
  const ssoParams = {
    response_type: "token",
    client_id: CLIENT_ID,
    scope: SCOPE,
    redirect_uri: redirectUri,
    state: STATE
  };
  const ssoParamString = new URLSearchParams(Object.entries(ssoParams)).toString();
  window.location = authorizeUrl + ssoParamString;
}
</script>

<style scoped>

</style>