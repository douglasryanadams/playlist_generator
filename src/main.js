import {createApp} from 'vue'
import App from './App.vue'


const app = createApp(App)

// https://stackoverflow.com/a/43666185/2461430
app.config.globalProperties.$filters = {
    truncate(text, length, clamp) {
        clamp = clamp || '...';
        return text.length > length ? text.slice(0, length) + clamp : text;
    }
}

app.mount('#app')