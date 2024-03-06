import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primevue/resources/themes/md-light-indigo/theme.css";
import "primevue/resources/primevue.css";
import "@/assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Divider from "primevue/divider";
import InputText from "primevue/inputtext";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InlineMessage from "primevue/inlinemessage";
import TabMenu from "primevue/tabmenu";
import FileUpload from "primevue/fileupload";

const CLIENT_ID = "b5881a3f486f4533803ebdb7263a5996";
const HOME_URI =
  process.env.NODE_ENV === "production"
    ? "https://mixtapestudy.com"
    : "http://localhost:5173";
const app = createApp(App);

app.use(PrimeVue);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);

app.component("Button", Button);
app.component("Calendar", Calendar);
app.component("Divider", Divider);
app.component("InputText", InputText);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("InlineMessage", InlineMessage);
app.component("TabMenu", TabMenu);
app.component("FileUpload", FileUpload);

app.provide("redirect-uri", HOME_URI);
app.provide("handle-error", async (response, spotifyTokenStore) => {
  if (response.status > 299) {
    console.warn("Error received with status: ", response.status);
    // refresh token that has been previously stored
    const refreshToken = spotifyTokenStore.refreshToken;

    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    };
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      payload
    );

    if (tokenResponse.status > 299) {
      spotifyTokenStore.clear();
      window.location.href = HOME_URI;
      return;
    }
    const tokenResponseJson = await tokenResponse.json();

    spotifyTokenStore.token = tokenResponseJson.access_token;
    spotifyTokenStore.refreshToken = tokenResponseJson.refresh_token;
  }
});

app.provide("client-id", CLIENT_ID);

app.provide("truncate", (text, length, clamp) => {
  clamp = clamp || "...";
  return text.length > length ? text.slice(0, length) + clamp : text;
});

app.mount("#app");
