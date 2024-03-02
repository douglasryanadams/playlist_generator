<script setup>
import {inject, ref} from "vue";
import {useSpotifyTokenStore} from "@/stores/spotifyTokenStore";
import {downloadSongData} from "@/downloadSongData"

const handleError = inject("handle-error");

const buildingRecentlyPlayed = ref(false)
const errorMessage = ref("")

const spotifyTokenStore = useSpotifyTokenStore();

const utcToLocalTime = (timestamp) => {
  const utcDate = new Date(timestamp);
  return utcDate.toString();
}

const fourHoursAgo = () => {
  return new Date().getTime() - (4 * 60 * 60 * 1000)  // hours * minutes * seconds * milliseconds
}

const fourHoursAgoReadable = () => {
  const four_hours_ago = new Date(fourHoursAgo());
  return four_hours_ago.getHours() + ":" + String(four_hours_ago.getMinutes()).padStart(2, '0')
}

const downloadRecentlyPlayed = async (event) => {
  buildingRecentlyPlayed.value = true
  try {
    await downloadSongData(fourHoursAgo(), null, spotifyTokenStore.token)
  } catch (error){
    if (error.response) await handleError(error.response, spotifyTokenStore)
    errorMessage.value = error.message
    return
  }
  buildingRecentlyPlayed.value = false
}

</script>

<template>
  <InlineMessage v-if="errorMessage" severity="error" class="ml-3 ">{{errorMessage}}</InlineMessage>
  <Button
      label="Recently Played"
      :icon="'pi ' + (buildingRecentlyPlayed ? 'pi-spin pi-spinner' : 'pi-download')"
      severity="help"
      @click="downloadRecentlyPlayed"
      v-if="spotifyTokenStore.signedIn && !errorMessage"
      :disabled="buildingRecentlyPlayed"
  />
</template>

<style scoped>

</style>