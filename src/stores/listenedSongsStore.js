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

    return {
      listenedSongs,
      addListenedTrack,
    };
  },
  { persist: true }
);
