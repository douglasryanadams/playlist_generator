const utcToLocalTime = (timestamp) => {
  const utcDate = new Date(timestamp);
  return utcDate.toString();
};

function generateAndDownloadCSV(recentlyPlayed) {
  let csv = [];
  csv.push("data:text/csv;charset=utf-8,");
  csv.push(
    "id,name,artist,duration_milliseconds,url,uri,context,context_url,context_uri,played_at_utc,played_at_local,"
  );
  csv.push("tempo,time_signature,");
  csv.push("loudness,key,mode,");
  csv.push("valence,danceability,energy,instrumentalness,acousticness");
  csv.push("\r\n");
  for (const play of recentlyPlayed) {
    csv.push(`"${play.trackId}","${play.trackName}","${play.trackArtist}",`);
    csv.push(
      `"${play.trackDurationMilliseconds}","${play.trackUrl}","${play.trackUri}", `
    );
    csv.push(
      `"${play.contextType}","${play.contextUrl}","${play.contextUri}",`
    );
    csv.push(`"${play.playedAt}","${play.playedAtLocal}",`);
    csv.push(`${play.featureTempo},${play.featureTimeSignature},`);
    csv.push(`${play.featureLoudness},${play.featureKey},${play.featureMode},`);
    csv.push(
      `${play.featureValence},${play.featureDanceability},${play.featureEnergy},${play.featureInstrumentalness},${play.featureAcousticness}`
    );
    csv.push(`\r\n`);
  }
  const encodedUri = encodeURI(csv.join(""));
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `recently_played_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
}

export async function retrieveTrackFeatures(trackIds, spotifyToken) {
  const trackIdParams = new URLSearchParams({ ids: trackIds });
  const trackFeaturesResponse = await fetch(
    `https://api.spotify.com/v1/audio-features?${trackIdParams}`,
    { headers: { Authorization: `Bearer ${spotifyToken}` } }
  );
  if (trackFeaturesResponse.status > 299) {
    throw {
      response: trackFeaturesResponse,
      message:
        "Error downloading recently played song features. Please sign out and sign back in to try again.",
    };
  }

  const trackFeaturesJson = await trackFeaturesResponse.json();
  const trackFeaturesById = {};
  for (const track of trackFeaturesJson.audio_features) {
    if (track) trackFeaturesById[track.id] = track;
  }
  return trackFeaturesById;
}

export const downloadSongData = async (startTime, endTime, spotifyToken) => {
  const params = {
    limit: 50,
  };
  if (endTime) params["before"] = endTime;
  else params["after"] = startTime;

  const paramString = new URLSearchParams(Object.entries(params)).toString();

  let next_url = `https://api.spotify.com/v1/me/player/recently-played?${paramString}`;
  const recentlyPlayed = [];

  let foundLastTrack = false;
  while (next_url != null && !foundLastTrack) {
    const response = await fetch(next_url, {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });
    if (response.status > 299) {
      throw {
        response: response,
        message:
          "Error downloading recently played. Please sign out and sign back in to try again.",
      };
    }
    const rJson = await response.json();
    next_url = rJson.next;

    const trackIds = [];
    for (const item of rJson.items) trackIds.push(item.track.id);
    const trackFeaturesById = await retrieveTrackFeatures(
      trackIds,
      spotifyToken
    );

    for (const item of rJson.items) {
      const trackId = item.track.id;
      const trackFeatures = trackFeaturesById[trackId];

      const playedAtTime = new Date(item.played_at).getTime();
      if (playedAtTime < startTime) {
        foundLastTrack = true;
        break;
      }

      recentlyPlayed.push({
        trackId: trackId,
        trackName: item.track.name,
        trackArtist: item.track.artists.map(({ name }) => name).join(", "),
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
  generateAndDownloadCSV(recentlyPlayed);
};

export const downloadListenedSongs = async (
  listenedSongs,
  spotifyTokenStore
) => {
  const songData = [];
  const mySongs = [];
  for (const song of listenedSongs) {
    if (song.userId === spotifyTokenStore.myId) mySongs.push(song);
  }

  const chunkSize = 50;
  for (let i = 0; i < mySongs.length; i += chunkSize) {
    const songs = mySongs.slice(i, i + chunkSize);
    const trackIds = [];
    for (const track of songs) trackIds.push(track.id);

    const trackFeaturesById = await retrieveTrackFeatures(
      trackIds,
      spotifyTokenStore.token
    );
    for (const track of songs) {
      const trackFeatures = trackFeaturesById[track.id];
      songData.push({
        trackId: track.id,
        trackName: track.name,
        trackArtist: track.artist,
        trackDurationMilliseconds: track.durationMilliseconds,
        trackUrl: track.url,
        trackUri: track.uri,
        contextType: track.contextType,
        contextUrl: track.contextUrl,
        contextUri: track.contextUri,
        playedAt: new Date(track.timestamp).toISOString(),
        playedAtLocal: track.timestampLocal,
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
  generateAndDownloadCSV(songData);
};
