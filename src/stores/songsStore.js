import { ref } from "vue";
import { defineStore } from "pinia";

export const useSongsStore = defineStore("songs", () => {
  const searchResults = ref([]);
  const selectedSongs = ref([undefined, undefined, undefined]);
  const errorMessage = ref("");
  const playlist = ref([]);
  const listIsFull = ref(false);

  function addTrack(track) {
    let inserted = false;

    for (const index in this.selectedSongs) {
      if (this.selectedSongs[index]) {
        continue;
      }
      this.selectedSongs[index] = track;
      inserted = true;
      break;
    }

    if (!inserted) {
      this.errorMessage =
        "You may only select " +
        this.selectedSongs.length +
        " songs at once. Please remove one before adding another";
    }

    for (const index in this.selectedSongs) {
      if (!this.selectedSongs[index]) {
        this.listIsFull = false;
        break;
      }
      this.listIsFull = true;
    }
  }

  function removeSong(songIndex) {
    const selected = this.selectedSongs;
    selected[songIndex] = null;
    this.errorMessage = "";
    this.selectedSongs = selected;
    this.listIsFull = false;
  }

  return {
    searchResults,
    selectedSongs,
    errorMessage,
    playlist,
    listFull: listIsFull,
    selectTrack: addTrack,
    removeSong,
  };
});
