import { ref } from "vue";
import { defineStore } from "pinia";

export const useListenedSongsStore = defineStore(
  "listenedSongs",
  () => {
    const listenedSongs = ref([]);

    function addListenedTrack(track) {
      this.listenedSongs.push(track);
    }

    return {
      listenedSongs,
      addListenedTrack,
    };
  },
  { persist: true }
);
