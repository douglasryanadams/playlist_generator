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
import Divider from "primevue/divider";
import InputText from "primevue/inputtext";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InlineMessage from "primevue/inlinemessage";
import TabMenu from "primevue/tabmenu";

const app = createApp(App);

app.use(PrimeVue);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);

app.component("Button", Button);
app.component("Divider", Divider);
app.component("InputText", InputText);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("InlineMessage", InlineMessage);
app.component("TabMenu", TabMenu);

app.provide(
  "redirect-uri",
  process.env.NODE_ENV === "production"
    ? "https://mixtapestudy.com"
    : "http://localhost:5173"
);
app.provide("handle-expired-token", async (response, spotifyTokenStore) => {
  if (response.status === 401) {
    spotifyTokenStore.token = "";
    spotifyTokenStore.myId = "";
    spotifyTokenStore.myName = "";
    await router.push({ name: "sign-in" });
  }
});
app.provide("truncate", (text, length, clamp) => {
  clamp = clamp || "...";
  return text.length > length ? text.slice(0, length) + clamp : text;
});

app.mount("#app");
