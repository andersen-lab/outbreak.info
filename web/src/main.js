import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueGtag from "vue-gtag";
import VueRx from "vue-rx";
import VueCookies from "vue-cookies";
import VueMeta from "vue-meta";

import "tippy.js/dist/tippy.css";
import json from "@/localConfig.json";
Vue.config.productionTip = false;
var siteUrl = json["siteUrl"]

Vue.prototype.$apiurl = "http://" + siteUrl + ":9200/hcov19/";
//Vue.prototype.$apiurl = "https://api.outbreak.info/covid19/";
Vue.prototype.$resourceurl = "https://api.outbreak.info/resources/";
//Vue.prototype.$genomicsurl = "https://api.outbreak.info/genomics/";
Vue.prototype.$genomicsurl = "http://" + siteUrl + ":8000/hcov19/";
Vue.prototype.$shapeapiurl = "http://" + siteUrl + ":8000/shape/";
Vue.prototype.$zipcodesapiurl = "http://" + siteUrl + ":8000/zipcodes/";
Vue.prototype.$zipcodeFocus = json["zipcodeFocus"]
Vue.prototype.$epiapiurl = "http://" + siteUrl + ":8000/epi/";

Vue.use(VueRx);
Vue.use(VueCookies);
Vue.use(VueMeta); //https://www.dropbox.com/s/82v6ch025nbucpp/Screenshot%202020-06-23%2014.32.14.png?dl=0

Vue.use(
  VueGtag, {
    config: {
      id: "UA-159949707-1"
    },
    // fix via https://github.com/MatteoGabriele/vue-gtag/issues/229 to track query params in GA
    pageTrackerSkipSamePath: false,
    pageTrackerTemplate(to) {
      return {
        page_title: to.name,
        page_path: to.fullPath,
        page_location: window.location.href,
      };
    }
  },
  router
);

Vue.filter('capitalize', function(value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
