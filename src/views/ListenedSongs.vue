<script setup>
import { useListenedSongsStore } from "@/stores/listenedSongsStore";

const listenedSongs = useListenedSongsStore();
</script>

<template>
  <DataTable :value="listenedSongs.listenedSongs">
    <Column field="id" header="ID" />
    <Column field="name" header="Name" />
    <Column field="artist" header="Artist(s)" />
    <Column field="timestamp" header="Timestamp">
      <template #body="{ data }">{{
        new Date(data.timestamp).toISOString()
      }}</template>
    </Column>
  </DataTable>
</template>

<style scoped></style>
