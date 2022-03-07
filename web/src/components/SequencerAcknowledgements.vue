<template>
<div>
  <h5 class="m-0">Top {{displayCount}} Sequence Contributers</h5>
  <svg :width="width" :height="height" class="report-stacked-bar" ref="stacked_bar" :name="title">
    <g :transform="`translate(${margin.left},${margin.bottom})`" ref="chart">
    </g>
    <g class="stacked-legend" ref="legend"></g>
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
    <div id="location-name"></div>
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
  round,
  interpolateYlGn,
  quantize,
  interpolate
} from "d3";

export default Vue.extend({
  name: "SequencerAcknowledgements",
  props: {
    data: Array,
    color: String,
    displayCount: Number,
 },
  computed: {
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
        top: 40,
        bottom: 30,
        left: 100,
        right: 10
      },
      marginHist: {
        top: 100,
        bottom: 10,
        left: 55,
        right: 100
      },
      width: 500,
      height: 500,
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
      colors: null,
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
      this.legend = select(this.$refs.legend);
    },
    //change the labels so that they have a newline to make them more readable
   updateScales() {
      // scale the y component so that it refers to amount
      this.x = this.x
        .range([0, this.width-this.margin.left-this.margin.right])
        .paddingInner(0.1)
        .domain(this.data.map(d => d.name));

      var ymax = max($.map(this.data, function(d) { return d.count; })); 
      // scale the x component
      this.y = this.y
        .domain([ymax,0])
        .range([0, this.height-this.margin.top-this.margin.bottom]);
      
      this.yAxis = axisLeft(this.y);    
      this.xAxis = axisBottom(this.x).tickPadding(20);

     (this.data)
      select(this.$refs.yAxis).call(this.yAxis);
   },
    updatePlot() {
      if (this.data) {
        this.updateScales();
        this.drawPlot();
      }
    },
   // takes d3 generated rgb and creates a hex code
   handleRGB(rgb){
     var a = rgb.split("(")[1].split(")")[0];
     a = a.split(",");
     var b = a.map(function(x){             //For each array element
        x = parseInt(x).toString(16);      //Convert to a base16 string
        return (x.length==1) ? "0"+x : x;  //Add zero if we get only one character
    })
    b = "#"+b.join("");
    return b;
   },
   // preps data for charting, sorts, adds colors
   prepData(){
      this.data.sort(function(x, y) {
        var b = x.count
        var a = y.count
        return a < b ? -1 : (a > b ? 1 : 0);
      })
      this.data = this.data.slice(0, this.displayCount);
      this.colors = []
      var i = 0;
      var colorInterpolator = interpolate("orange", "green");
      var allColors = quantize(colorInterpolator, this.displayCount);
      console.log("ALL COLORS", allColors);
      this.data.forEach(d=>{
        var color = allColors.at(i);
        var x = this.handleRGB(color);
        this.colors.push([d.name, x]); 
        d.color = x;
        i++;
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
            .attr("height", d => this.y(0)-this.y(d.count))
            .attr("y", d => this.y(d.count))
            .attr("x", d => this.x(d.name))
            .attr("width", this.x.bandwidth())
            .style("fill", d => d.color)
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

    //legend
    const legendSelector = this.legend
        .selectAll(".stacked-legend")
        .data(this.colors);
      
    const legendText = this.legend
        .selectAll("text")
        .data(this.colors);
      legendText.enter()
          .append("text")
          .style("font-size", 10)
          .attr("x", this.width - 282)
          .attr("y", function(d, i) {
            return i * 20 + 9 + 10;
            })
          .text(d=> d[0])

      legendSelector.join(
        enter => {
          const legGrp = enter.append("g")
            .attr("class", "stacked-legend")
            .attr("id", d => d[0])
          legGrp.append("rect")
            .attr("height", 10)
            .attr("x", d => this.width - 300)
            .attr("width", 10)
            .attr("y", function(d,i) {
                return 10+(i*20);
            })
            .style("fill", d => d[1])
       },
        update => {
          update
            .attr("id", d => d.key.replace(/\./g, "-"))
          update.select("rect")
            .attr("x", d => this.width-65)
            .attr("width", d => 10)
            .style("fill", d => this.colorScale(d.key))
          update.select("text")
            .attr("x", d => d[0])
            .style("fill", d => d[1])
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
    
    ttip.select("#location-name")
      .text(`Lab Name: ${d.name}`)     
      .classed("hidden", false);
   
    ttip.select("#case-count")
      .text(`Sequence count: ${d.count}`)     
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
