<template>
<div>
  <h5 id="citing">Please cite the authors and curators of the data:</h5>

  <div id="outbreakinfo-citation" class="mb-2 py-3 border-top border-bottom">
    <h6 class="m-0">outbreak.info</h6>
    <p class="m-0">
      {{outbreak.authors}} <i>outbreak.info</i>. Available online: <a href="https://outbreak.info/" target="_blank">https://outbreak.info/</a> (2020)
    </p>
    <small class="d-block mt-2">
      <span class="font-weight-700">data license</span>:
      All data and content that our team creates is covered by the
      <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">Creative Commons CC0 Waiver</a>, which states that you can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission. However, consistent with scientific norms, we ask that you cite <router-link to="/">outbreak.info</router-link> in any tools or publications that use <router-link to="/">outbreak.info</router-link>.
    </small>

  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";

export default Vue.extend({
  name: "CiteUs",
  components: {},
  computed: {
    ...mapState("admin", ["outbreak", "sources", "geoSources", "resources", "genomicSources"])
  }
});
</script>
