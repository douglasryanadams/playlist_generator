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
    const signedIn = ref(false);

    function clear() {
      this.token = "";
      this.refreshToken = "";
      this.codeVerifier = "";
      this.myId = "";
      this.myName = "";
      this.signedIn = false;
    }
    return { token, refreshToken, codeVerifier, myId, myName, signedIn, clear };
  },
  { persist: true }
);
