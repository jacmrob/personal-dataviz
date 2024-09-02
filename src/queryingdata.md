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
