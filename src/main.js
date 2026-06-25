import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/styles/main.css";
import "./assets/styles/00-base.css";
import "./assets/styles/01-header.css";
import "./assets/styles/02-sidebar.css";
import "./assets/styles/03-home.css";
import "./assets/styles/04-module-pages.css";
import "./assets/styles/05-tool-workspaces.css";
import "./assets/styles/06-login.css";
import "./assets/styles/07-home-ascii.css";
import "./assets/styles/08-network-identity.css";
import "./assets/styles/09-platform-guide.css";
import "./assets/styles/10-tool-catalog.css";
import "./assets/styles/11-tool-hero.css";
import "./assets/styles/90-category-themes.css";
import "./assets/styles/91-portfolio-access.css";
import "./assets/styles/12-mobile-polish.css";

createApp(App).use(store).use(router).mount("#app");
