import Vue from "vue";
import App from "./App.vue";
import "./assets/style.css";
import router from "./router";

import store from "./plugins/store";
import auth from "./plugins/auth";
import ContenuAPI from "./plugins/ContenuAPI";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

Vue.use(store);
Vue.use(auth);
Vue.use(ContenuAPI);
Vue.use({
  install: (Vue) => {
    Vue.prototype.$dayjs = dayjs;
  },
});

new Vue({
  el: "#app",
  router,
  render: (h) => h(App),
});
