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
import SignIn from "../components/SignIn";
import { inject, onMounted } from "vue";
import { useSpotifyTokenStore } from "../stores/spotifyTokenStore";
import { useRouter } from "vue-router";

const handleError = inject("handle-error");

const spotifyTokenStore = useSpotifyTokenStore();
const router = useRouter();

onMounted(async () => {
  // Check to see if the URL contains a hash (because of the callback from logging in)
  const windowURL = new URL(window.location.href);
  if (windowURL.hash) {
    const hashParams = "?" + windowURL.hash.substring(1);
    const urlParams = new URLSearchParams(hashParams);
    spotifyTokenStore.token = urlParams.get("access_token");
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
      spotifyTokenStore.signedIn = true;
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
