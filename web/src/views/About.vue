<template>
<div>
  <div class="row m-0">
    <div class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5" style="min-height: 70vh;">
      <div class="container half-page">
        <h1>About</h1>
        <div class="logo row m-0 w-100 d-flex justify-content-center">
          <img class="w-50 mb-5" src="@/assets/logo-full-01.svg" alt="Outbreak.info"/> 
        </div>
       
        <h5 class="justify-content-left text-left" style="font-size:30px" v-if="buildName || total || gitRepo"> Your Local Build at a Glance</h5>
          <div class="text-left" style="font-size:24px">
            <div class="item1" v-if="buildName">{{buildName}}</div> 
            <div class="item2" v-if="total">Total Sequences: {{total}}</div>
            <div class="item3" v-if="gitRepo">Orignal Data Located At: {{ gitRepo }}</div>
          </div>
        <div class="glance"/>
        <p class="text-left focustext py-2">In response to the current outbreak of SARS-CoV-2 (the virus that causes COVID-19), researchers worldwide have been generating and openly sharing data, publications, reagents, code, protocols, and more.
          Broad sharing of these resources improves the speed and efficiency of science. Unfortunately, there are no uniform standards and repositories for collecting all this information in one place.</p>
        
        <p class="text-left focustext pt-2"><strong>Outbreak.info</strong> is a project that aggregates data across scientific sources and provides tools to analyze this data.</p>
        <p class="text-left focustext pt-2"><strong>Outbreak.network</strong> is an offshoot project that allows users to create a local build of outbreak.info in order to analyze genomic data using custom data sources.</p>
        <p class="text-left focustext mty-5 py-4 border-top">
          Outbreak.info is a project from the <a href="http://sulab.org/" rel="noreferrer" target="_blank">Su</a>, <a href="http://wulab.io/" rel="noreferrer" target="_blank">Wu</a>, and <a href="https://andersen-lab.com/" rel="noreferrer"
            target="_blank">Andersen</a> labs at Scripps Research and is supported <span class="my-4" v-if="funding">by the <span v-for="(grant, idx) in funding" :key="idx">
              <span v-if="grant.funder.name">{{ grant.funder.name }}</span> ({{ grant.identifier }})<span v-if="idx < funding.length - 2">, </span>
              <span v-if="idx == funding.length - 2">, and </span>
            </span>.</span>
        </p>

        <div class="d-flex flex-wrap align-items-center justify-content-center">
            </div>
      </div>
    </div>
    <div class="glance"/>

      <div class="col-sm-12 my-5 justify-content-center align-items-center">
        <div class="container text-left mb-5 font-size:24px justify-content-center">
          <h1 class="text-highlight">How to cite outbreak.info</h1>
          <CiteUs class="mt-3"/>
        </div>
      </div>
    
 
    <!-- TEAM -->
    <div class="bg-light d-flex justify-content-center align-items-center">
      <div class="bg-light d-flex flex-column justify-content-center align-items-center w-75 border-top py-5">
        <h4 class="mb-4">Outbreak.info team</h4>
        <div class="d-flex flex-wrap">
          <div v-for="(person, idx) in team" :key="idx" class="team-member d-flex flex-column align-items-center mx-5 my-3">
            <img :src="require(`@/assets/team/${person.img}`)" class="profile-pic text-" />
            <span class="mt-1">{{person.name}}</span>
            <div class="d-flex">

              <a :href="`mailto:${person.email}`" target="_blank" v-if="person.email" class="mr-2">
                <font-awesome-icon :icon="['fas', 'at']" />
              </a>
              <a :href="person.twitter" target="_blank" v-if="person.twitter" class="mr-2">
                <font-awesome-icon :icon="['fab', 'twitter']" />
              </a>
              <a :href="person.linkedin" target="_blank" v-if="person.linkedin" class="mr-2">
                <font-awesome-icon :icon="['fab', 'linkedin-in']" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center w-100 border-top py-5 mx-auto">
      <a class="twitter-timeline" data-width="500" data-height="400" href="https://twitter.com/DiseaseOutbreak?ref_src=twsrc%5Etfw">Tweets by DiseaseOutbreak</a>
    </div>


    <div class="col-sm-12 jumbotron rounded-0 bg-grey__darker mb-0">
      <h4 class="text-light m-2">
        Notice a bug, know of a COVID-19 data source, or want to suggest a
        feature?
        <svg viewBox="0 0 100 3">
          <line x1="0" y1="0" x2="100" stroke="#D13B62" />
        </svg>
        <a class="btn btn-outline-light mt-5" href="https://github.com/outbreak-info/outbreak.info/issues" rel="noreferrer" target="_blank">Submit an issue on Github</a>
      </h4>
    </div>
  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";
import {
  mapState
} from "vuex";
// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons";
import {
  faAt
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faLinkedinIn
} from "@fortawesome/free-brands-svg-icons";
library.add(faAt, faTwitter, faLinkedinIn);
import {
  getResourceTotal
} from "@/api/resources.js";
import {
  getSequenceCount,
  getLocationBasics,
  getBasicLocationReportData,
} from "@/api/genomics.js";
import EmailSubscription from "@/components/EmailSubscription.vue";
import CiteUs from "@/components/CiteUs.vue";

import json from "@/localConfig.json";
export default Vue.extend({
  name: "About",
  computed: {
    ...mapState("admin", ["funding", "team"])
  },
  components: {
    FontAwesomeIcon,
    CiteUs
  },
  data() {
    return ({
      loc: "Worldwide",
      total: null,
      gitRepo: null,
      buildName:null,
      resourceCount: null,
      gisaidCount: null,
      summaryData:null,
      curatedSubscription: null,
      basicSubscription: null,
      genomicsSubscription: null
    })
  },
  methods:{
    setupReport(){
    this.basicSubscription = getBasicLocationReportData(this.$genomicsurl, this.loc).subscribe(results => {
        this.dateUpdated = results.dateUpdated.dateUpdated;
        this.lastUpdated = results.dateUpdated.lastUpdated;
        this.totalSequences = results.total;
        this.curatedLineages = results.curated;
        this.voc = results.voc;
        this.voi = results.voi;
        this.selectedLocation = results.location;
        
      })
    }
  },
  mounted() {
    this.setupReport();
    this.buildName = json["localBuildName"];
    this.gitRepo = json["gitRepo"];
    let twitterScript = document.createElement('script');
    twitterScript.setAttribute("src", "https://platform.twitter.com/widgets.js");
    document.head.appendChild(twitterScript);
    
    this.curatedSubscription = getLocationBasics(this.$genomicsurl).subscribe(results => {
      this.total = results.total;
    })

    this.resourceSubscription = getResourceTotal(this.$resourceurl).subscribe(total => {
      this.resourceCount = total.floor;
    })
    
    this.genomicsSubscription = getSequenceCount(this.$genomicsurl, null, true, true).subscribe(total => {
      this.gisaidCount = total;
    })
  },
  destroyed() {
     if (this.resourceSubscription) {
     this.resourceSubscription.unsubscribe();
    }
    if (this.curatedSubscription) {
      this.curatedSubscription.unsubscribe();
    }
    if (this.genomicsSubscription) {
      this.genomicsSubscription.unsubscribe();
    }
  }
});
</script>

<style lang="scss">
.logo {
   display: flex;
   align-items: center;
   jusitfy-content: center;
}
.citeContainer{
  align-items: center;  
  margin-top: 25px;
  margin-bottom: 25px;
  margin-left: 25px;
  margin-right:25px;
  width:100%;
  height:10%;
 }
.glance {
  margin-top: 25px;
  margin-bottom: 25px;
  width:100%;
  height:10px;
  background-color: $secondary-color;
  display:grid;
  padding:0;
  grid-template-columns: 200px 200px;
  grid-row: auto auto;
  grid-column-gap: 5px;
  grid-row-gap: 5px;
  .box{
    margin-top:20px;
    //background-color:#fff;
    //color:#fff;
    //padding:10px;
    display:flex;
    //align-items:center;
    //justify-content:center;
  }
}

.team-member {
    flex-basis: 15%;
}
.profile-pic {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: contain;
}
.w-30 {
    width: 30% !important;
}
.large {
    font-size: large;
}
</style>
