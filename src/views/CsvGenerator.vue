<script setup>
import {useSpotifyTokenStore} from "../stores/spotifyTokenStore";
import {inject} from "vue";

const handleError = inject("handle-error");

const spotifyTokenStore = useSpotifyTokenStore()

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


const pullSongData = async (jsonData) => {
  const trackList = []
  const trackIds = []

  for (const song of jsonData) {
    await sleep(100)
    const paramString = new URLSearchParams(
        Object.entries({
          q: `artist:"${song.artistName}" track:"${song.trackName}"`,
          type: "track",
          limit: 1,
        })
    ).toString();
    const songSearchResponse = await fetch(
        "https://api.spotify.com/v1/search?" + paramString,
        { headers: { Authorization: "Bearer " + spotifyTokenStore.token } }
    )
    await handleError(songSearchResponse, spotifyTokenStore)
    const songJson = await songSearchResponse.json()
    const track = songJson.tracks.items[0]
    const trackId = track.id;


    trackIds.push(trackId)
    trackList.push({
      trackId: trackId,
      trackName: track.name,
      trackArtist: track.artists.map(({ name }) => name).join(", "),
      trackDurationMilliseconds: track.duration_ms,
      trackUrl: track.external_urls.spotify,
      trackUri: track.uri,
      endTime: song.endTime,
      listenDurationMilliseconds: song.msPlayed
    })
  }


}

const interceptUpload = async (event) => {
  console.log("nothing sent to server on upload")
  const file = event.files[0]
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onloadend = function () {
    const text = reader.result
    const jsonData = JSON.parse(text)
    pullSongData(jsonData)
  }
}


</script>

<template>
  <FileUpload mode="basic" customUpload @uploader="interceptUpload" auto/>
</template>

<style scoped>

</style>