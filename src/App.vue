<script setup>
import {useSpotifyTokenStore} from "./stores/spotifyTokenStore";
import {useRoute, useRouter} from "vue-router";
const router = useRouter();
const route = useRoute();

const spotifyTokenStore = useSpotifyTokenStore()

const downloadRecentlyPlayed = (event) => {

}

const signout = (event) => {
  spotifyTokenStore.clear();
  router.push({name: 'sign-in'})
}

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
          @click="() => router.push({name: 'song-selection'})"
      />
      <Button
          label="Recently Played"
          icon="pi pi-download"
          severity="help"
          @click="downloadRecentlyPlayed"
          v-if="spotifyTokenStore.signedIn"
          class="ml-3"
      />
      <Button
          label="Sign Out"
          icon="pi pi-times"
          severity="danger"
          @click="signout"
          v-if="spotifyTokenStore.signedIn"
          class="ml-3"
      />
    </div>
  </div>
  <div class="px-5">
    <router-view/>
  </div>
</template>

<style scoped>
.site-title {
  font-size: 2rem;
}
</style>
