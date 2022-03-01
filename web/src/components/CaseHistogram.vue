<template>
<div>
  <h5 class="m-0">Seven Day Average Case Rate in {{targetLocation}}</h5>
  <svg :width="width" :height="height" class="report-stacked-bar" ref="stacked_bar" :name="title">
    <g :transform="`translate(${margin.left},${margin.bottom})`" ref="chart">
    </g>
    <g class="epi-axis axis--y" ref="yAxis" :transform="`translate(${margin.left},${margin.bottom})`"></g>
    <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height-margin.top})`"></g>
  </svg>
  <div ref="tooltip_choro" class="tooltip-basic box-shadow" id="tooltip-choro">
    <h5 id="location-name"></h5>
    <div class="d-flex align-items-center">
      <b id="proportion" class="font-size-2"></b>
      <span id="confidence-interval" class="text-muted ml-2"></span>
    </div>
    <div id="case-count"></div>
  </div>


  <DownloadReportData :data="data" figureRef="report-stacked-bar" dataType="Mutation Report Prevalence over Time" />
</div>
</template>


<script lang="js">
import Vue from "vue";
import json from "@/localConfig.json";
import uniq from "lodash/uniq";
import {
  select,
  selectAll,
  scaleTime,
  scaleLinear,
  axisLeft,
  axisBottom,
  axisTop,
  scaleBand,
  area,
  stack,
  stackOrderAscending,
  forceY,
  forceSimulation,
  event,
  extent,
  format,
  InternSet,
  scaleOrdinal,
  max,
  map,
  round
} from "d3";

export default Vue.extend({
  name: "CaseHistogram",
  props: {
    data: Array,
    targetLocation : String
 },
  computed: {
    title() {
      return (`Cases Sequenced in the Last 4 weeks.`);
    },
    rectWidth() {
        return(1/this.data.length);
    }
  },
  watch: {
    width: function() {
      this.sortByAdmin();
      this.setupPlot();
      this.updatePlot();
    },
    data: function() {
      this.sortByAdmin();
      this.setupPlot(); 
      this.updatePlot();
    }
  },
 data() {
    return ({
      // dimensions
      margin: {
        top: 100,
        bottom: 10,
        left: 100,
        right: 10
      },
      marginHist: {
        top: 100,
        bottom: 10,
        left: 55,
        right: 55
      },
      width: 400,
      height: 400,
      legendHeight: null,
      // variables
      fillVar: "key",
      // axes
      x: scaleBand(),
      y: scaleLinear(),
      xAxis: null,
      yAxis: null,
      py: 0.1,
      numXTicks: 5,
      numYTicks: 5,
      // methods
      ttips: null,
      area: null,
      // data
      series: null,
      lineages: null,
      // refs
      chart: null,
      legend: null,
      prevLoc: [],
    })
  },
  mounted() {
    document.getElementById("button").addEventListener("click", this.buttonBack)
    this.$nextTick(function() {
      window.addEventListener("resize", this.debounceSetDims);
      document.addEventListener("mousemove", evt => {
        if (!evt.target.className || !evt.target.className.baseVal || !evt.target.className.baseVal.includes("rect")){
            this.mouseOff();
        }}, 
      {passive:true} 
      );
      
      document.addEventListener("mouseleave", evt => {
        //console.log(evt.target.className);
        if (!evt.target.className || !evt.target.className.baseVal || !evt.target.className.baseVal.includes("rect")){
            this.mouseOff();
        }
      },
      {passive:true});
    });
 
    // set initial dimensions for the plotss
    this.setupPlot();
    this.updatePlot();
  },
  created: function() {
    this.debounceMouseon = this.debounce(this.mouseOn, 250);
  },
  methods: {
    setupPlot() {
      this.chart = select(this.$refs.chart);
      this.ttips = select(this.$refs.choropleth_tooltip);
    },
    //change the labels so that they have a newline to make them more readable
   updateScales() {
      // scale the y component so that it refers to amount
      this.x = this.x
        .range([0, this.width-this.margin.left-this.margin.right])
        .paddingInner(0.1)
        .domain(this.data.map(d => d.current_date_range));

      var ymax = max($.map(this.data, function(d) { return d.f7_day_average_case_rate; })); 
      
      // scale the x component
      this.y = this.y
        .domain([ymax,0])
        .range([0, this.height-this.margin.top-this.margin.bottom]);
      
      this.yAxis = axisLeft(this.y);    
      this.xAxis = axisBottom(this.x).tickPadding(20);

     (this.data)
      select(this.$refs.yAxis).call(this.yAxis);
      select(this.$refs.xAxis).call(this.xAxis)
        .selectAll("text")
        .attr("transform", function (d) {
        return "rotate(-20)";});
    },
    updatePlot() {
      if (this.data) {
        this.updateScales();
        this.drawPlot();
      }
    },

   prepData(){
      this.data.sort(function(x, y) {
        var a = x.current_date_range.split("-").at(0);
        var b = y.current_date_range.split('-').at(0);
        var aDate = new Date(a);
        var bDate = new Date(b);
        return aDate < bDate ? -1 : (aDate > bDate ? 1 : 0);
      })
   },
   drawPlot() {
      this.prepData();
      this.updateScales();
      const barSelector = this.chart
        .selectAll(".stacked-bar-chart")
        .data(this.data);
     
     // calculate label positions so they don't overlap
      const labelHeight = 18;
      
      barSelector.join(
        enter => {
          const barGrp = enter.append("g")
            .attr("class", "stacked-bar-chart")
            .attr("id", d => d.name)
          barGrp.append("rect")
            .attr("height", d => this.y(0)-this.y(d.f7_day_average_case_rate))
            .attr("y", d => this.y(d.f7_day_average_case_rate))
            .attr("x", d => this.x(d.current_date_range))
            .attr("width", this.x.bandwidth())
            .style("fill", "#69b3a2")
       },
        update => {
          update
            .attr("id", d => d.key.replace(/\./g, "-"))
          update.select("rect")
            .attr("x", d => this.x(d[0][1]))
            .attr("width", d => this.x(d[0][0]) - this.x(d[0][1]))
            .style("fill", d => this.colorScale(d.key))
          update.select("text")
            .attr("x", d => d.y)
            .style("fill", d => this.colorScale(d.key))
       },
        exit =>
        exit.call(exit =>
          exit
          .transition()
          .style("opacity", 1e-5)
          .remove()
        )
      )

      this.chart.selectAll("rect")
        .on("mouseenter", d => this.debounceMouseon(d))

    },
    mouseOn(d){
      const ttipShift = 15;
      const ttip = select(this.$refs.tooltip_choro)
   
    ttip.select("#case-count")
      .text(`Case count ${d.f7_day_average_case_rate}`)     
      .classed("hidden", false);
        
     // fix location
      ttip
        .style("left", `${this.event.clientX + ttipShift}px`)
        .style("top", `${this.event.clientY + ttipShift}px`)
        .style("display", "block");
    },

    mouseOff() {
      select(this.$refs.tooltip_choro)
        .style("display", "none");
   },
   removeElements(){
      this.chart.selectAll("g").remove();
      this.chart.selectAll("rect").remove();
    },
    debounce(fn, delay) {
      var timer = null;
      return function() {
        var context = this,
          args = arguments,
          evt = event;
        //we get the D3 event here
        clearTimeout(timer);
        timer = setTimeout(function() {
          context.event = evt;
          //and use the reference here
          fn.apply(context, args);
        }, delay);
      };
    }
  }
})
</script>

<style lang="scss">
.hover-underline:hover {
    text-decoration: underline;
}
.report-stacked-bar {
    .axis--y text {
        font-size: 14pt;
    }
}
</style>
