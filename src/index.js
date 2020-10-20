import Vue from "vue";
import "bootstrap/dist/css/bootstrap.css";
import App from "./vue/App";
const app = new Vue({
  el: "#app",
  render: (h) => h(App),
});
