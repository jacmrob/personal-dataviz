# Querying "Bloodbound", a YA fantasy novel

Data from the querying trenches, visualized.
<br/>

```js
import * as aq from "npm:arquero"
const op = aq.op
const queries = FileAttachment("./data/bloodbound_querying.csv").arquero()
```

## Overview

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Total queries</h2>
    <span class="big">${queries.numRows()}</span>
  </div>
  <div class="card">
    <h2>Query letter versions</h2>
    <span class="big">${queries.groupby("version").count().size}</span>
  </div>
  <div class="card">
    <h2>First query sent</h2>
    <span class="big">${queries.get("date", 0)}</span>
  </div>
  <div class="card">
    <h2>Last query sent</h2>
    <span class="big">${queries.get("date", -1)}</span>
  </div>
  <div class="card">
    <h2>Requests for more pages</h2>
    <span class="big">${queries.filter(r => r.request).size}</span>
  </div>
  <div class="card">
    <h2>Success rate for requests</h2>
    <span class="big">${Math.round((queries.filter(r => r.request).size / queries.numRows() * 100) * 100)/100}%</span>
  </div>
</div>
<br/>

```js
const types = queries.groupby("contact_type").count()
```

## How did we contact agents?
```js
Plot.plot({
  color: { legend: true },
  marks: [
    Plot.barX(queries, Plot.groupZ({ x: "count" }, { fill: "contact_type" })),
  ]
})
```

<br/>

## Response statistics
All our individual queries and their response trends.

```js
const originalNodes = queries.derive({id: d => d.agent + ', ' + d.agency})

const originalLinks = originalNodes
  .derive({source: d => d.id})
  .derive( {target: d => d.request ? d.request : d.response})
  .derive({value: d => 1})

const requestNodes = queries
  .groupby("request")
  .filter(d => d.request != null)
  .count()
  .derive({id: d => d.request})

const requestLinks = queries
  .filter(r => r.request != null)
  .derive({target: d => d.response})
  .derive({source: d => d.request})
  .derive({value: d => 1})

const responseNodes = queries.groupby("response").count().derive({id: r => r.response})

```

```js
const allNodes = originalNodes.concat(requestNodes).concat(responseNodes).objects({columns: ["id"]})
```
```js
const allLinks = originalLinks.concat(requestLinks).objects({columns: ["source", "target", "value"]})
```

```js
const data = {
  links: allLinks,
  nodes: allNodes,
}
// const colors = {"Form Rejection": "#ed5163", "Personal Rejection": "#edbe51", "No Response": "#e388d8"}
```

```js
import * as d3 from "d3"
import * as d3Sankey from "d3-sankey"
```
```js
function chart() {
  // Specify the dimensions of the chart.
  const width = 928;
  const height = 1500;
  const format = d3.format(",.0f");

  // Create a SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Constructs and configures a Sankey generator.
  const sankey = d3Sankey.sankey()
      .nodeId(d => d.id)
      .nodeAlign(d3Sankey.sankeyJustify) // d3.sankeyLeft, etc.
      .nodeWidth(50)
      .nodePadding(5)
      .extent([[1, 5], [width - 1, height]]);

  // Applies it to the data. We make a copy of the nodes and links objects
  // so as to avoid mutating the original.
  const {nodes, links} = sankey({
    nodes: data.nodes.map(d => Object.assign({}, d)),
    links: data.links.map(d => Object.assign({}, d))
  });

  // Defines a color scale.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Creates the rects that represent the nodes.
  const rect = svg.append("g")
      .attr("stroke", "#000")
    .selectAll()
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", "#6a6a95");

  // Adds a title on the nodes.
  rect.append("title")
      .text(d => `${d.id}`);

  // Creates the paths that represent the links.
  const link = svg.append("g")
      .attr("stroke", "#7d738c")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.3)
    .selectAll()
    .data(links)
    .join("g")
      .style("mix-blend-mode", "multiply");

  link.append("path")
      .attr("d", d3Sankey.sankeyLinkHorizontal())
      .attr("stroke-width", d => Math.max(1, d.width))

  // link.append("path")
  //     .attr("d", d3.sankeyLinkHorizontal())
  //     .attr("stroke", linkColor === "source-target" ? (d) => d.uid
  //         : linkColor === "source" ? (d) => color(d.source.category)
  //         : linkColor === "target" ? (d) => color(d.target.category)
  //         : linkColor)
  //     .attr("stroke-width", d => Math.max(1, d.width));

  link.append("title")
      .text(d => `${d.source.id} → ${d.target.id}`);

  // Adds labels on the nodes.
  svg.append("g")
    .selectAll()
    .data(nodes)
    .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.id);

  return svg.node();
}
```

```js
chart()
```
