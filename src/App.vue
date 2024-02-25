<script setup>
import {useSpotifyTokenStore} from "./stores/spotifyTokenStore";
import {useRoute, useRouter} from "vue-router";
import {inject, ref} from "vue";

const router = useRouter();
const route = useRoute();

const handleExpiredToken = inject("handle-expired-token");

const buildingRecentlyPlayed = ref(false)

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
  console.log(new Date(fourHoursAgo()).toString())
  const params = {
    limit: 50,
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
    handleExpiredToken(response, spotifyTokenStore)
    const rJson = await response.json()
    next_url = rJson.next

    for (const item of rJson.items) {
      const trackId = item.track.id

      const trackAnalysisResponse = await fetch(
          `https://api.spotify.com/v1/audio-analysis/${trackId}`,
          {headers: {Authorization: `Bearer ${spotifyTokenStore.token}`}}
      );
      handleExpiredToken(trackAnalysisResponse, spotifyTokenStore)
      const trackAnalysisJson = await trackAnalysisResponse.json()
      console.log("trackAnalysisJson")
      console.log(trackAnalysisJson)

      const trackFeaturesResponse = await fetch(
          `https://api.spotify.com/v1/audio-features/${trackId}`,
          {headers: {Authorization: `Bearer ${spotifyTokenStore.token}`}}
      );
      handleExpiredToken(trackFeaturesResponse, spotifyTokenStore)
      const trackFeaturesJson = await trackFeaturesResponse.json()

      recentlyPlayed.push({
        trackId: trackId,
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
        analysisTempo: trackAnalysisJson.track.tempo,
        analysisTempoConfidence: trackAnalysisJson.track.tempo_confidence,
        analysisTimeSignature: trackAnalysisJson.track.time_signature,
        analysisTimeSignatureConfidence: trackAnalysisJson.track.time_signature_confidence,
        analysisLoudness: trackAnalysisJson.track.loudness,
        analysisKey: trackAnalysisJson.track.key,
        analysisKeyConfidence: trackAnalysisJson.track.key_confidence,
        analysisMode: trackAnalysisJson.track.mode,
        analysisModeConfidence: trackAnalysisJson.track.mode_confidence,
        featureValence: trackFeaturesJson.valence,
        featureDanceability: trackFeaturesJson.danceability,
        featureEnergy: trackFeaturesJson.energy,
        featureInstrumentalness: trackFeaturesJson.instrumentalness,
        featureAcousticness: trackFeaturesJson.acousticness,
      });
    }
  }

  let csv = []
  csv.push("data:text/csv;charset=utf-8,");
  csv.push("id,name,artist,duration_milliseconds,url,uri,context,context_url,context_uri,played_at_utc,played_at_local,")
  csv.push("tempo,tempo_confidence,time_signature,time_signature_confidence,")
  csv.push("loudness,key,key_confidence,mode,mode_confidence,")
  csv.push("valence,danceability,energy,instrumentalness,acousticness")
  csv.push("\r\n");
  for (const play of recentlyPlayed) {
    csv.push(`"${play.trackId}","${play.trackName}","${play.trackArtist}",`)
    csv.push(`"${play.trackDurationMilliseconds}","${play.trackUrl}","${play.trackUri}", `)
    csv.push(`"${play.contextType}","${play.contextUrl}","${play.contextUri}",`)
    csv.push(`"${play.playedAt}","${play.playedAtLocal}",`)
    csv.push(`${play.analysisTempo},${play.analysisTempoConfidence},${play.analysisTimeSignature},${play.analysisTimeSignatureConfidence},`)
    csv.push(`${play.analysisLoudness},${play.analysisKey},${play.analysisKeyConfidence},${play.analysisMode},${play.analysisModeConfidence},`)
    csv.push(`${play.featureValence},${play.featureDanceability},${play.featureEnergy},${play.featureInstrumentalness},${play.featureAcousticness}`)
    csv.push(`\r\n`)
  }
  const encodedUri = encodeURI(csv.join(""));
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `recently_played_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  buildingRecentlyPlayed.value = false
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
          :icon="'pi ' + (buildingRecentlyPlayed ? 'pi-spin pi-spinner' : 'pi-download')"
          severity="help"
          @click="downloadRecentlyPlayed"
          v-if="spotifyTokenStore.signedIn"
          :disabled="buildingRecentlyPlayed"
          class="ml-3 "
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
