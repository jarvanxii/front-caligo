import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      appName: "Caligo",
      user: null,
      modules: [
        {
          key: "openvas",
          name: "OpenVAS",
          status: "proximo",
        },
        {
          key: "metasploit",
          name: "Metasploit",
          status: "proximo",
        },
        {
          key: "urls",
          name: "URLs",
          status: "proximo",
        },
        {
          key: "contrasenas",
          name: "Contraseñas",
          status: "proximo",
        },
        {
          key: "esteganografia",
          name: "Esteganografía",
          status: "proximo",
        },
      ],
    };
  },
  getters: {
    availableModules(state) {
      return state.modules;
    },
  },
});
