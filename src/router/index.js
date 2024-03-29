import { createRouter, createWebHistory } from "vue-router";
import SignInAndWelcome from "@/views/SignInAndWelcome";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "sign-in",
      component: SignInAndWelcome,
    },
    {
      path: "/song-selection",
      name: "song-selection",
      component: () => import("@/views/SongSelection"),
    },
    {
      path: "/playlist-generation",
      name: "playlist-generation",
      component: () => import("@/views/PlaylistGeneration"),
    },
    {
      path: "/listening-data",
      name: "listening-data",
      component: () => import("@/views/ListeningData.vue"),
    },
    {
      path: "/listened-songs",
      name: "listened-songs",
      component: () => import("@/views/ListenedSongs.vue"),
    },
    {
      path: "/csv-generator",
      name: "csv-generator",
      component: () => import("@/views/CsvGenerator.vue"),
    },
  ],
});

export default router;
