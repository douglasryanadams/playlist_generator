<script setup>
import { useRoute, useRouter } from "vue-router";
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";
import RecentlyPlayed from "@/components/RecentlyPlayed.vue";
import ActivityMonitor from "@/components/ActivityMonitor.vue";

const router = useRouter();
const route = useRoute();

const spotifyTokenStore = useSpotifyTokenStore();

const signout = (event) => {
  spotifyTokenStore.clear();
  router.push({ name: "sign-in" });
};
</script>

<template>
  <div class="flex w-full p-3">
    <div class="site-title">Playlist Generator</div>
    <div class="flex ml-auto">
      <Button
        label="Back"
        icon="pi pi-arrow-left"
        severity="info"
        v-if="route.name === 'playlist-generation'"
        @click="() => router.push({ name: 'song-selection' })"
        class="mr-3"
      />
      <RecentlyPlayed />
      <Button
        label="Sign Out"
        icon="pi pi-times"
        severity="danger"
        @click="signout"
        v-if="spotifyTokenStore.token"
        class="ml-3"
      />
    </div>
    <ActivityMonitor />
  </div>
  <div class="px-5">
    <router-view />
  </div>
</template>

<style scoped>
.site-title {
  font-size: 2rem;
}
</style>
