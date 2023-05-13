<template>
  <h2>Selected Songs</h2>

  <Button
      label="Generate Playlist"
      :disabled="!songStore.listIsFull"
      @click="generatePlaylist"
      class="mb-5"
  />

  <table class="w-full">
    <tr v-for="(track, index) in songStore.selectedSongs" class="selected-song">
      <td>
        {{ index + 1 }}.
      </td>
      <td v-if="track">{{ track.name }} ({{ track.artist }})</td>
      <td v-else class="placeholder">____________________________</td>
      <td v-if="track">
        <Button
            icon="pi pi-times"
            severity="danger"
            size="small"
            class="ml-auto"
            @click="songStore.removeSong(index)"
            text
            raised
            aria-label="Cancel"
        />
      </td>
      <td v-else class="w-10rem">&nbsp;</td>
    </tr>

  </table>

  <InlineMessage v-if="songStore.errorMessage" severity="error">
    {{ songStore.errorMessage }}
  </InlineMessage>


</template>

<script setup>
import {inject} from "vue";
import {useSongsStore} from "../stores/songsStore";
import {useSpotifyTokenStore} from "../stores/spotifyTokenStore";
import {useRouter} from "vue-router";

const router = useRouter();

const handleExpiredToken = inject("handle-expired-token");
const truncate = inject("truncate");

const songStore = useSongsStore()
const spotifyTokenStore = useSpotifyTokenStore()


const generatePlaylist = async (event) => {

  const seedTracks = []
  for (const song of songStore.selectedSongs) {
    seedTracks.push(song.trackId)
  }

  const params = {
    seed_tracks: seedTracks.join(","),
    limit: 50
  };

  const paramString = new URLSearchParams(Object.entries(params)).toString();
  const response = await fetch(
      'https://api.spotify.com/v1/recommendations?' + paramString,
      {headers: {Authorization: "Bearer " + spotifyTokenStore.token}}
  );
  handleExpiredToken(response, spotifyTokenStore)

  const playlistTracks = []
  const rJson = await response.json()
  for (const track of rJson.tracks) {
    playlistTracks.push({
      name: truncate(track.name, 36),
      artist: truncate(track.artists.map(({name}) => name).join(", "), 40),
      trackId: track.id,
      trackUri: track.uri,
    })
  }
  songStore.playlist = playlistTracks

  router.push({name: "playlist-generation"})
}
</script>

<style scoped>
.selected-song {
  font-size: 1.2rem;
  height: 3rem;
}

.placeholder {
  color: var(--gray-400);
}

</style>