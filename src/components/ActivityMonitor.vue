<script setup>
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";
import { inject } from "vue";
import { useListenedSongsStore } from "@/stores/listenedSongsStore";
const spotifyTokenStore = useSpotifyTokenStore();
const listenedSongs = useListenedSongsStore();

const handleError = inject("handle-error");

const checkCurrentListening = async () => {
  console.log("Checking what you're currently listening to");
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: { Authorization: `Bearer ${spotifyTokenStore.token}` } }
  );
  await handleError(response, spotifyTokenStore);
  const responseJson = await response.json();
  console.log(responseJson);

  if (responseJson.item) {
    console.log(
      "Listening to:",
      responseJson.item.id,
      " - ",
      responseJson.item.name
    );
    listenedSongs.addListenedTrack({
      id: responseJson.item.id,
      timestamp: responseJson.timestamp,
    });
  }
};

await checkCurrentListening();
setInterval(checkCurrentListening, 10_000);
</script>

<template>
  <div id="activity-monitor" hidden>&nbsp;</div>
</template>

<style scoped></style>
