<template>
  <div class="card">
    <div class="flex justify-content-center flex-wrap card-container mb-5">
      <div
        id="welcome"
        class="flex align-items-center justify-content-center font-bold"
      >
        Please sign in to generate a playlist.
      </div>
    </div>
  </div>
  <div class="card">
    <div class="flex justify-content-center flex-wrap card-container">
      <div id="sign-in" class="flex align-items-center justify-content-center">
        <SignIn />
      </div>
    </div>
  </div>
</template>

<script setup>
import SignIn from "@/components/SignIn";
import { inject, onMounted } from "vue";
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";
import { useRouter } from "vue-router";

const CLIENT_ID = inject("client-id");
const REDIRECT_URI = inject("redirect-uri");
const handleError = inject("handle-error");

const spotifyTokenStore = useSpotifyTokenStore();
const router = useRouter();

onMounted(async () => {
  // Check to see if the URL contains a hash (because of the callback from logging in)
  const urlParams = new URLSearchParams(window.location.search);
  let tokenRequestCode = urlParams.get("code");
  if (tokenRequestCode != null) {
    let codeVerifier = spotifyTokenStore.codeVerifier;

    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code: tokenRequestCode,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    };

    const body = await fetch("https://accounts.spotify.com/api/token", payload);
    const response = await body.json();

    spotifyTokenStore.token = response.access_token;
    spotifyTokenStore.refreshToken = response.refresh_token;
  }

  // If we already have a token, head to song selection
  if (spotifyTokenStore.token) {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: "Bearer " + spotifyTokenStore.token },
    });
    await handleError(response, spotifyTokenStore);

    if (response.ok) {
      const rJson = await response.json();
      spotifyTokenStore.myId = rJson.id;
      spotifyTokenStore.myName = rJson.display_name;
    }
    router.push({ name: "song-selection" });
  }
});
</script>

<style scoped>
#welcome {
  font-size: 1.2rem;
}
</style>
