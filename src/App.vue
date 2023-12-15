<script setup>
import {useSpotifyTokenStore} from "./stores/spotifyTokenStore";
import {useRoute, useRouter} from "vue-router";
import {inject} from "vue";

const router = useRouter();
const route = useRoute();

const handleExpiredToken = inject("handle-expired-token");

const spotifyTokenStore = useSpotifyTokenStore();

const utcToLocalTime = (timestamp) => {
  const utcDate = new Date(timestamp);
  return utcDate.toString();
};

const fourHoursAgo = () => {
  return new Date().getTime() - (4 * 60 * 60 * 1000)  // hours * minutes * seconds * milliseconds
}

const fourHoursAgoReadable = () => {
  const four_hours_ago = new Date(fourHoursAgo());
  return four_hours_ago.getHours() + ":" + String(four_hours_ago.getMinutes()).padStart(2, '0')
}

const downloadRecentlyPlayed = async (event) => {
  console.log(new Date(fourHoursAgo()).toString())
  const params = {
    limit: 5,
    after: fourHoursAgo(),
  };
  const paramString = new URLSearchParams(Object.entries(params)).toString();

  let next_url = `https://api.spotify.com/v1/me/player/recently-played?${paramString}`
  const recentlyPlayed = [];
  console.log(next_url)

  while (next_url != null) {
    const response = await fetch(
        next_url,
        {headers: {Authorization: `Bearer ${spotifyTokenStore.token}`}}
    );
    handleExpiredToken(response, spotifyTokenStore);
    const rJson = await response.json();
    next_url = rJson.next
    console.log(next_url)
    console.log(rJson)

    for (const item of rJson.items) {
      recentlyPlayed.push({
        trackId: item.track.id,
        trackName: item.track.name,
        trackArtist: item.track.artists.map(({name}) => name).join(", "),
        trackDurationMilliseconds: item.track.duration_ms,
        trackUrl: item.track.external_urls.spotify,
        trackUri: item.track.uri,
        contextType: item.context.type,
        contextUrl: item.context.external_urls.spotify,
        contextUri: item.context.uri,
        playedAt: item.played_at,
        playedAtLocal: utcToLocalTime(item.played_at),
      });
    }
  }

  let csv = []
  csv.push("data:text/csv;charset=utf-8,");
  csv.push("id,name,artist,duration_milliseconds,url,uri,context,context_url,context_uri,played_at_utc,played_at_local\r\n");
  for (const play of recentlyPlayed) {
    csv.push(`"${play.trackId}","${play.trackName}","${play.trackArtist}",`)
    csv.push(`"${play.trackDurationMilliseconds}", "${play.trackUrl}", "${play.trackUri}", `)
    csv.push(`"${play.contextType}","${play.contextUrl}","${play.contextUri}",`)
    csv.push(`"${play.playedAt}", "${play.playedAtLocal}"\r\n`)
  }
  const encodedUri = encodeURI(csv.join(""));
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "recently_played.csv");
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};

const signout = (event) => {
  spotifyTokenStore.clear();
  router.push({name: "sign-in"});
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
      />
      <Button
          :label="'Recently Played (Since About ' +  fourHoursAgoReadable() + ')'"
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
