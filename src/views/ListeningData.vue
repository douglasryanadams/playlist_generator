<script setup>
import { inject, ref } from "vue";
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";
import { downloadSongData } from "@/downloadSongData";

const handleError = inject("handle-error");
const spotifyTokenStore = useSpotifyTokenStore();

const date = ref(new Date());
const downloadingData = ref(false);
const errorMessage = ref("");

const downloadData = async (event) => {
  downloadingData.value = true;
  const startOfDate = date.value.getTime();
  const endOfDate = startOfDate + 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  try {
    await downloadSongData(startOfDate, endOfDate, spotifyTokenStore.token);
  } catch (error) {
    if (error.response) await handleError(error.response, spotifyTokenStore);
    errorMessage.value = error.message;
    return;
  }
  downloadingData.value = false;
};
</script>

<template>
  <h2>Select a Date and Click "Download Listening History"</h2>
  <Calendar v-model="date" class="mb-2" inline showWeek />
  <br />
  <InlineMessage v-if="errorMessage" severity="error" class="ml-3">{{
    errorMessage
  }}</InlineMessage>
  <Button
    label="Download Listening Data"
    :icon="'pi ' + (downloadingData ? 'pi-spin pi-spinner' : 'pi-download')"
    severity="help"
    @click="downloadData"
    v-if="spotifyTokenStore.signedIn && !errorMessage"
    :disabled="downloadingData"
  />
</template>

<style scoped></style>
