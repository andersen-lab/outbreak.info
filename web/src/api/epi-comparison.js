import {
  from,
  forkJoin,
  BehaviorSubject
} from "rxjs";
import axios from "axios";
import {
  finalize,
  catchError,
  pluck,
  map,
  mergeMap
} from "rxjs/operators";
import {
  nest,
  timeParse,
  format
} from "d3";

import {
  getAll
} from "@/api/biothings.js";
import store from "@/store";

export function getComparisonData(apiUrl, location, adminLevel, sort, page, size) {
  store.state.admin.loading = true;

  const queryString = location ? `${location} AND admin_level:("${adminLevel}")` : `admin_level:${adminLevel}`;

  return getCurrentData(apiUrl, queryString, sort, page, size)
  // return getAll(apiUrl, queryString)
    .pipe(
      map(results => {
        return(results)
      }),
    catchError(e => {
      console.log("%c Error in getting comparison!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getCurrentData(apiUrl, queryString, sort, page, size) {
  const parseDate = timeParse("%Y-%m-%d");

  const timestamp = Math.round(new Date().getTime() / 1e5);
  const fields = "date,location_id,name,state_name,confirmed,confirmed_numIncrease,confirmed_pctIncrease,confirmed_rolling,dead,dead_numIncrease,dead_pctIncrease,dead_rolling"

  const qString = `(date:"2020-06-22" OR date:"2020-06-08") AND (${queryString})&sort=${"-date"}&size=${size}&from=${page}&fields=${fields}`;
  return getAll(apiUrl, qString)
    .pipe(
      map(results => {
        results.forEach(result => {
          result["datetime"] = parseDate(result.date);
        })

        results.sort((a,b) => b.datetime < a.datetime ? -1 : 1);

        const nested = nest()
        .key(d => d.location_id)
        .rollup(values => {
          return({
          location_id: values[0].location_id,
          all: values,
          name: values[0].name,
          date: values[0].date,
          datetime: values[0].datetime,
          dead: values[0].dead,
          dead_numIncrease: values[0].dead_numIncrease,
          dead_rolling: values[0].dead_rolling,
          confirmed: values[0].confirmed,
          confirmed_numIncrease: values[0].confirmed_numIncrease,
          confirmed_rolling: values[0].confirmed_rolling,
          confirmed_change: values.length == 2 ? values[0].confirmed_rolling - values[1].confirmed_rolling : null
          })
        })
        .entries(results).map(d => d.value);

        return(nested)
      }),
    catchError(e => {
      console.log("%c Error in getting current data!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}
