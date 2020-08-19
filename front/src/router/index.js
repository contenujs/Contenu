import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "management",
    component: require("../views/Management.vue").default
  },
  {
    path: "/login",
    name: "login",
    component: require("../views/Login.vue").default
  },
  {
    path: "/setup",
    name: "Setup",
    component: require("../views/Setup.vue").default
  },
  {
    path: "/reset_password",
    name: "ResetPassword",
    component: require("../views/ResetPassword.vue").default
  }
];

const router = new VueRouter({
  mode: "history",
  routes
});

export default router;
