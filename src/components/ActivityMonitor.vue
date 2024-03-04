<script setup>
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";
import { inject } from "vue";
import { useListenedSongsStore } from "@/stores/listenedSongsStore";
const spotifyTokenStore = useSpotifyTokenStore();
const listenedSongs = useListenedSongsStore();

const handleError = inject("handle-error");
const truncate = inject("truncate");

const checkCurrentListening = async () => {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${spotifyTokenStore.token}` } }
    );
    await handleError(response, spotifyTokenStore);
    const responseJson = await response.json();

    if (responseJson.item) {
      const track = responseJson.item;
      const context = responseJson.context;
      console.log("Current track:", track.id);
      listenedSongs.addListenedTrack({
        id: track.id,
        name: track.name,
        artist: truncate(track.artists.map(({ name }) => name).join(", "), 20),
        durationMilliseconds: track.duration_ms,
        url: track.external_urls.spotify,
        uri: track.uri,
        contextType: context.type,
        contextUrl: context.external_urls.spotify,
        contextUri: context.uri,
        timestamp: responseJson.timestamp,
        timestampLocal: new Date(responseJson.timestamp).toString(),
        userId: spotifyTokenStore.myId,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// await checkCurrentListening();
// setInterval(checkCurrentListening, 10_000);

const checkRecentlyPlayed = async () => {
  console.info("Checking recently played and caching them")
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      { headers: { Authorization: `Bearer ${spotifyTokenStore.token}` } }
    );
    await handleError(response, spotifyTokenStore);
    const responseJson = await response.json();
    const listenedTracks = [];

    for (const item of responseJson.items) {
      const track = item.track;
      const context = item.context;
      listenedTracks.push({
        id: track.id,
        name: track.name,
        artist: truncate(track.artists.map(({ name }) => name).join(", "), 20),
        durationMilliseconds: track.duration_ms,
        url: track.external_urls.spotify,
        uri: track.uri,
        contextType: context.type,
        contextUrl: context.external_urls.spotify,
        contextUri: context.uri,
        timestamp: item.played_at,
        timestampLocal: new Date(item.played_at).toString(),
        userId: spotifyTokenStore.myId,
      });

    }

    listenedSongs.addListenedTracks(listenedTracks);
  } catch (error) {
    console.error(error);
  }
};

await checkRecentlyPlayed()
setInterval(checkRecentlyPlayed, 30_000)

</script>

<template>
  <div id="activity-monitor" hidden>&nbsp;</div>
</template>

<style scoped></style>
