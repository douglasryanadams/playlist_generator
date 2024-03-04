<script setup>
import { inject, ref } from "vue";
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";
import { downloadListenedSongs, downloadSongData } from "@/downloadSongData";
import { useListenedSongsStore } from "@/stores/listenedSongsStore";

const handleError = inject("handle-error");

const buildingRecentlyPlayed = ref(false);
const errorMessage = ref("");

const spotifyTokenStore = useSpotifyTokenStore();
const listenedSongs = useListenedSongsStore();

const fourHoursAgo = () => {
  return new Date().getTime() - 4 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
};

const downloadRecentlyPlayed = async (event) => {
  buildingRecentlyPlayed.value = true;
  try {
    await downloadSongData(fourHoursAgo(), null, spotifyTokenStore.token);
  } catch (error) {
    if (error.response) await handleError(error.response, spotifyTokenStore);
    errorMessage.value = error.message;
    return;
  }
  buildingRecentlyPlayed.value = false;
};

const downloadSongDataAction = async (event) => {
  buildingRecentlyPlayed.value = true;
  await downloadListenedSongs(listenedSongs.listenedSongs, spotifyTokenStore);
  buildingRecentlyPlayed.value = false;
};
</script>

<template>
  <InlineMessage v-if="errorMessage" severity="error" class="ml-3">{{
    errorMessage
  }}</InlineMessage>
  <!--
  <Button
    label="Recently Played"
    :icon="
      'pi ' + (buildingRecentlyPlayed ? 'pi-spin pi-spinner' : 'pi-download')
    "
    severity="help"
    @click="downloadRecentlyPlayed"
    v-if="spotifyTokenStore.token && !errorMessage"
    :disabled="buildingRecentlyPlayed"
  />
  -->
  <Button
    label="Recently Played"
    :icon="
      'pi ' + (buildingRecentlyPlayed ? 'pi-spin pi-spinner' : 'pi-download')
    "
    severity="help"
    @click="downloadSongDataAction"
    v-if="spotifyTokenStore.token && !errorMessage"
    :disabled="buildingRecentlyPlayed"
  />
</template>

<style scoped></style>
