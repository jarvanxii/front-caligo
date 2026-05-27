import { createRouter, createWebHistory } from "vue-router";

const HomeView = () => import("@/views/HomeView.vue");
const LoginView = () => import("@/views/LoginView.vue");

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: {
      hideHeader: true,
      authLayout: true,
    },
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
    meta: {
      hideHeader: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
});

export default router;
