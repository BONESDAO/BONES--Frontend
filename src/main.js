import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import {createPinia} from "pinia";
import piniaPersist from "pinia-plugin-persist";
// import Vue3TouchEvents from "vue3-touch-events";

const app = createApp(App);

const pinia = createPinia();
// 防止页面刷新后数据丢失
pinia.use(piniaPersist);

app.use(router);
app.use(pinia);
// app.use(Vue3TouchEvents,{touchHoldTolerance: 5000, disableClick: true});

app.mount("#app");
