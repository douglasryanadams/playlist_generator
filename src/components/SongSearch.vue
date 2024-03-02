<template>
  <h2>Search for Songs</h2>
  <div class="p-inputgroup">
    <InputText
      v-model="songSearch"
      placeholder="Artist or Song"
      @keyup.enter="search"
    />
    <Button label="Search" @click="search" />
  </div>

  <DataTable
    v-if="songStore.searchResults.length > 0"
    :value="songStore.searchResults"
    tyleStyle="min-width: 50rem"
  >
    <Column header="Add">
      <template #body="slotProps">
        <Button
          label="Add"
          @click="songStore.selectTrack(slotProps.data)"
          severity="success"
          raised
        />
      </template>
    </Column>
    <Column field="name" header="Track Name"></Column>
    <Column field="artist" header="Artist"></Column>
  </DataTable>
</template>

<script setup>
import { inject, ref } from "vue";
import { useSongsStore } from "../stores/songsStore";
import { useSpotifyTokenStore } from "../stores/spotifyTokenStore";

const handleError = inject("handle-error");
const truncate = inject("truncate");
const songSearch = ref("");

const songStore = useSongsStore();
const spotifyTokenStore = useSpotifyTokenStore();

const search = async (event) => {
  if (!songSearch.value) {
    return;
  }
  const paramString = new URLSearchParams(
    Object.entries({
      q: songSearch.value,
      type: "track",
      limit: 8,
    })
  ).toString();

  const response = await fetch(
    "https://api.spotify.com/v1/search?" + paramString,
    { headers: { Authorization: "Bearer " + spotifyTokenStore.token } }
  );
  await handleError(response, spotifyTokenStore);

  const rJson = await response.json();
  const tracks = [];
  for (const track of rJson.tracks.items) {
    tracks.push({
      name: truncate(track.name, 50),
      artist: truncate(track.artists.map(({ name }) => name).join(", "), 20),
      trackId: track.id,
      uri: track.uri,
    });
  }
  songStore.searchResults = tracks;
};
</script>

<style scoped></style>
