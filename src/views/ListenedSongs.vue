<script setup>
import { useListenedSongsStore } from "@/stores/listenedSongsStore";
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";

const listenedSongs = useListenedSongsStore();
const spotifyTokenStore = useSpotifyTokenStore();
</script>

<template>
  <DataTable
    :value="
      listenedSongs.listenedSongs.filter(
        (song) => song.userId === spotifyTokenStore.myId
      )
    "
    paginator
    :rows="20"
  >
    <column header="#">
      <template #body="slotProps">{{ slotProps.index + 1 }}</template>
    </column>
    <Column field="id" header="ID" />
    <Column field="name" header="Name" />
    <Column field="artist" header="Artist(s)" />
    <Column header="Timestamp">
      <template #body="{ data }">{{
        new Date(data.timestamp).toISOString()
      }}</template>
    </Column>
  </DataTable>
</template>

<style scoped></style>
