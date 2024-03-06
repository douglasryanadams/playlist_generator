<script setup>
import { inject, ref } from "vue";
import { useSpotifyTokenStore } from "@/stores/spotifyTokenStore";
import { retrieveTrackFeatures } from "@/downloadSongData";

const handleError = inject("handle-error");

const processing = ref(false)
const spotifyTokenStore = useSpotifyTokenStore();

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const clean = (unclean) => unclean.replace(/"/g, '""');

function generateCsv(trackList) {
  let csv = [];
  csv.push("data:text/csv;charset=utf-8,");
  csv.push("id,name,artist,duration_milliseconds,");
  csv.push("url,uri,end_time,listened_milliseconds,");
  csv.push("tempo,time_signature,loudness,key,mode,");
  csv.push("valence,danceability,energy,instrumentalness,acousticness");
  csv.push("\r\n");
  for (const track of trackList) {
    csv.push(`${track.id},"${clean(track.name)}",`);
    csv.push(`"${clean(track.artist)}", ${track.durationMilliseconds},`);
    csv.push(`${track.url},${track.uri},${track.endTime},`);
    csv.push(`${track.listenedMilliseconds},`);
    csv.push(`${track.tempo},${track.timeSignature},`);
    csv.push(`${track.loudness},${track.key},${track.mode},`);
    csv.push(`${track.valence},${track.danceability},${track.energy},`);
    csv.push(`${track.instrumentalness},${track.acousticness}`);
    csv.push(`\r\n`);
  }
  const encodedUri = encodeURI(csv.join(""));
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `listening_history_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
}
const retrieveTrack = async (song, songData) => {
  const artistSearchString = song.artistName.replace(/["']/g, "");
  const trackSearchString = song.trackName.replace(/["']/g, "");
  const paramString = new URLSearchParams(
    Object.entries({
      q: `artist:"${artistSearchString}" track:"${trackSearchString}"`,
      type: "track",
      limit: 1,
    })
  ).toString();
  const songSearchResponse = await fetch(
    "https://api.spotify.com/v1/search?" + paramString,
    { headers: { Authorization: "Bearer " + spotifyTokenStore.token } }
  );
  await handleError(songSearchResponse, spotifyTokenStore);
  songData.push({ song: song, response: await songSearchResponse.json() });
};

const pullSongData = async (jsonData) => {
  const songData = [];
  const songChunkSize = 5;
  for (let i = 0; i < jsonData.length; i += songChunkSize) {
    const songs = jsonData.slice(i, i + songChunkSize);
    const promises = [];
    for (const song of songs) {
      promises.push(retrieveTrack(song, songData));
    }
    await Promise.all(promises);
  }

  const trackList = [];
  for (const songDatum of songData) {
    const song = songDatum.song;
    const track = songDatum.response.tracks.items[0];
    const trackId = track.id;

    trackList.push({
      id: trackId,
      name: track.name,
      artist: track.artists.map(({ name }) => name).join(", "),
      durationMilliseconds: track.duration_ms,
      url: track.external_urls.spotify,
      uri: track.uri,
      endTime: song.endTime,
      listenedMilliseconds: song.msPlayed,
    });
  }

  const chunkSize = 50;
  for (let i = 0; i < trackList.length; i += chunkSize) {
    const songs = trackList.slice(i, i + chunkSize);
    const trackIds = [];
    for (const track of songs) trackIds.push(track.id);

    const trackFeaturesById = await retrieveTrackFeatures(
      trackIds,
      spotifyTokenStore.token
    );

    for (const track of songs) {
      const features = trackFeaturesById[track.id];
      track["tempo"] = features.tempo;
      track["timeSignature"] = features.time_signature;
      track["loudness"] = features.loudness;
      track["key"] = features.key;
      track["mode"] = features.mode;
      track["valence"] = features.valence;
      track["danceability"] = features.danceability;
      track["energy"] = features.energy;
      track["instrumentalness"] = features.instrumentalness;
      track["acousticness"] = features.acousticness;
    }
  }

  trackList.sort((a, b) => a.endTime.localeCompare(b.endTime));

  console.log(trackList);
  generateCsv(trackList);
};

const interceptUpload = async (event) => {
  console.log("nothing sent to server on upload");
  const file = event.files[0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onloadend = async function () {
    processing.value = true
    const text = reader.result;
    const jsonData = JSON.parse(text);
    await pullSongData(jsonData);
    processing.value = false
  };
};
</script>

<template>
  <h2>Generate CSV from Song Data</h2>
  <p>To request your data:</p>
    <ol>
      <li>Go to this page: <a href="https://www.spotify.com/us/account/privacy/">Spotify Privacy</a></li>
      <li>Scroll to the bottom and click: "Request Data"</li>
    </ol>
  <p>Once you've received an e-mail from Spotify:</p>
    <ol>
      <li>Click "Download" in the e-mail</li>
      <li>Unzip the zip file you receive</li>
      <li>Find the file in the unzipped folder named: "StreamingHistory_music_0.json"</li>
      <li>Click the "Upload Song Data" button on this page (below) and select your file</li>
    </ol>
  <p>After completing these steps you should receive a download of the CSV containing your data within a couple minutes</p>

  <FileUpload :disabled="processing" chooseLabel="Upload Song Data" mode="basic" customUpload @uploader="interceptUpload" auto>
    <template #uploadicon><div class="mr-3"><i :class="processing ? 'pi pi-spin pi-spinner' : 'pi pi-upload' "/></div></template>
  </FileUpload>
</template>

<style scoped></style>
