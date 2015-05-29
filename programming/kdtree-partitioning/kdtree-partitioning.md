---
layout: default
title: K-D Tree Mesh Partitioning
style: /programming/kdtree-partitioning/kdtree-partitioning.css
script: /programming/kdtree-partitioning/kdtree-partitioning.js
---

# K-D Tree Mesh Partitionning

<h2>Point Cloud
<select id="distribution">
    <option value="uniform">Uniform</option>
    <option value="circular">Circular</option>
</select></h2>
<div class="wrapper">
    <canvas id="cloud-canvas"></canvas>
</div>
<h2>K-D Tree</h2>
<div class="wrapper">
    <canvas id="kdtree-canvas"></canvas>
</div>
<h2>Delaunay Clusters</h2>
<div class="wrapper">
    <canvas id="clusters-canvas"></canvas>
</div>
<h2>Glued clusters</h2>
<div class="wrapper">
    <canvas id="glued-canvas"></canvas>
</div>