import { createStore } from "vuex";
import { mainModulePages } from "@/data/modulePages";
import { caligoApi, clearSession, getStoredToken, getStoredUser, login as apiLogin } from "@/services/caligoApi";

export default createStore({
  state() {
    return {
      appName: "Caligo",
      apiBaseUrl: caligoApi.baseUrl,
      token: getStoredToken(),
      user: getStoredUser(),
      modules: mainModulePages.map((module) => ({
        key: module.key,
        name: module.navLabel,
        routeName: module.routeName,
        status: module.status,
        description: module.summary,
      })),
    };
  },
  getters: {
    availableModules(state) {
      return state.modules;
    },
    isAuthenticated(state) {
      return Boolean(state.token);
    },
  },
  mutations: {
    setSession(state, session) {
      state.token = session?.accessToken || null;
      state.user = session?.user || null;
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
    },
  },
  actions: {
    async login({ commit }, credentials = {}) {
      const username = (credentials.username || "").trim();
      const password = credentials.password || "";
      if (!username || !password) {
        throw new Error("Introduce usuario y contraseña");
      }
      const session = await apiLogin(username, password);
      commit("setSession", session);
      return session;
    },
    logout({ commit }) {
      clearSession();
      commit("clearSession");
    },
  },
});
