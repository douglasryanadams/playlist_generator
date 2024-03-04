import { ref } from "vue";
import { defineStore } from "pinia";

export const useListenedSongsStore = defineStore(
  "listenedSongs",
  () => {
    const listenedSongs = ref([]);

    function addListenedTrack(track) {
      // prevent list from growing indefinitely
      if (this.listenedSongs.length > 10_000) this.listenedSongs.shift();

      const lastTrack =
        this.listenedSongs.length > 0
          ? this.listenedSongs[this.listenedSongs.length - 1]
          : { id: "" };
      console.log("lastTrack:", lastTrack.id);
      if (lastTrack.id !== track.id) this.listenedSongs.push(track);
    }

    function addListenedTracks(trackList) {
      // This uses the timestamp of the last listened track
        const orderedTrackList = Array.from(trackList)
        orderedTrackList.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp))

      const lastTrack =
        this.listenedSongs.length > 0
          ? this.listenedSongs[this.listenedSongs.length - 1]
          : { timestamp: "1970-01-01T00:00:00.000Z" };
      for (const track of orderedTrackList) {
        if (new Date(track.timestamp) > new Date(lastTrack.timestamp)) {
            console.info("Found new track: ", track.id)
          this.listenedSongs.push(track);
        }
      }
    }

    return {
      listenedSongs,
      addListenedTrack,
      addListenedTracks,
    };
  },
  { persist: true }
);
