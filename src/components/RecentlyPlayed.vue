<script setup>
import {inject, ref} from "vue";
import {useSpotifyTokenStore} from "@/stores/spotifyTokenStore";

const handleError = inject("handle-error");

const buildingRecentlyPlayed = ref(false)
const errorMessage = ref("")

const spotifyTokenStore = useSpotifyTokenStore();


// Last Year
// Specific Date
// Last 4 Hours

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
    await handleError(response, spotifyTokenStore)
    if (response.status > 399) {
      errorMessage.value = "Error downloading recently played. Please refresh the page and try again."
      return
    }
    const rJson = await response.json()
    next_url = rJson.next

    const trackIds = []
    for (const item of rJson.items) trackIds.push(item.track.id)

    const trackIdParams = new URLSearchParams({ids: trackIds})
    const trackFeaturesResponse = await fetch(
        `https://api.spotify.com/v1/audio-features?${trackIdParams}`,
        {headers: {Authorization: `Bearer ${spotifyTokenStore.token}`}}
    );
    await handleError(trackFeaturesResponse, spotifyTokenStore)
    if (trackFeaturesResponse.status > 399){
      errorMessage.value = "Error downloading recently played song features. Please refresh the page and try again."
      return
    }

    const trackFeaturesJson = await trackFeaturesResponse.json()
    const trackFeaturesById = {}
    for (const track of trackFeaturesJson.audio_features) {
      if (track) trackFeaturesById[track.id] = track
    }

    for (const item of rJson.items) {
      const trackId = item.track.id
      const trackFeatures = trackFeaturesById[trackId]

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
        featureTempo: trackFeatures.tempo,
        featureTimeSignature: trackFeatures.time_signature,
        featureLoudness: trackFeatures.loudness,
        featureKey: trackFeatures.key,
        featureMode: trackFeatures.mode,
        featureValence: trackFeatures.valence,
        featureDanceability: trackFeatures.danceability,
        featureEnergy: trackFeatures.energy,
        featureInstrumentalness: trackFeatures.instrumentalness,
        featureAcousticness: trackFeatures.acousticness,
      });
    }
  }

  let csv = []
  csv.push("data:text/csv;charset=utf-8,");
  csv.push("id,name,artist,duration_milliseconds,url,uri,context,context_url,context_uri,played_at_utc,played_at_local,")
  csv.push("tempo,time_signature,")
  csv.push("loudness,key,mode,")
  csv.push("valence,danceability,energy,instrumentalness,acousticness")
  csv.push("\r\n");
  for (const play of recentlyPlayed) {
    csv.push(`"${play.trackId}","${play.trackName}","${play.trackArtist}",`)
    csv.push(`"${play.trackDurationMilliseconds}","${play.trackUrl}","${play.trackUri}", `)
    csv.push(`"${play.contextType}","${play.contextUrl}","${play.contextUri}",`)
    csv.push(`"${play.playedAt}","${play.playedAtLocal}",`)
    csv.push(`${play.featureTempo},${play.featureTimeSignature},`)
    csv.push(`${play.featureLoudness},${play.featureKey},${play.featureMode},`)
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

</script>

<template>
  <InlineMessage v-if="errorMessage" severity="error" class="ml-3 ">{{errorMessage}}</InlineMessage>
  <Button
      label="Recently Played"
      :icon="'pi ' + (buildingRecentlyPlayed ? 'pi-spin pi-spinner' : 'pi-download')"
      severity="help"
      @click="downloadRecentlyPlayed"
      v-if="spotifyTokenStore.signedIn && !errorMessage"
      :disabled="buildingRecentlyPlayed"
      class="ml-3 "
  />
</template>

<style scoped>

</style>