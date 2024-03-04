import { ref } from "vue";
import { defineStore } from "pinia";

export const useSpotifyTokenStore = defineStore(
  "spotifyToken",
  () => {
    const token = ref("");
    const refreshToken = ref("");
    const codeVerifier = ref("");
    const myId = ref("");
    const myName = ref("");

    function clear() {
      this.token = "";
      this.refreshToken = "";
      this.codeVerifier = "";
      this.myId = "";
      this.myName = "";
    }
    return { token, refreshToken, codeVerifier, myId, myName, clear };
  },
  { persist: true }
);
