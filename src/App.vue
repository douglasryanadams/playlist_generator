<script setup>
import {useSpotifyTokenStore} from "./stores/spotifyTokenStore";
import {useRoute, useRouter} from "vue-router";
import {inject} from "vue";
const router = useRouter();
const route = useRoute();

const handleExpiredToken = inject("handle-expired-token");

const spotifyTokenStore = useSpotifyTokenStore()

const utcToLocalTime = (timestamp) => {
  const utcDate = new Date(timestamp);
  return utcDate.toString();
}

const downloadRecentlyPlayed = async (event) => {
  const params = {
    limit: 50
  }
  const paramString = new URLSearchParams(Object.entries(params)).toString()
  const response = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?${paramString}`,
      {headers: {Authorization: `Bearer ${spotifyTokenStore.token}`}}
  )
  handleExpiredToken(response, spotifyTokenStore)
  const rJson = await response.json();

  const recentlyPlayed = []
  for (const item of rJson.items) {
    recentlyPlayed.push({
      trackName: item.track.name,
      trackArtist: item.track.artists.map(({name}) => name).join(', '),
      trackId: item.track.id,
      trackUrl: item.track.external_urls.spotify,
      playedAt: item.played_at,
      playedAtLocal: utcToLocalTime(item.played_at)
    });
  }

  let csv = "data:text/csv;charset=utf-8,"
  csv += "id,name,artist,url,played_at_utc,played_at_local\r\n"
  for (const play of recentlyPlayed) {
    csv += `"${play.trackId}","${play.trackName}","${play.trackArtist}","${play.trackUrl}","${play.playedAt}","${play.playedAtLocal}"\r\n`
  }
  const encodedUri  = encodeURI(csv);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "recently_played.csv");
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
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
