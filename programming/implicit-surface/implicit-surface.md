---
layout: default
title: Implicit Surface
style: /programming/implicit-surface/implicit-surface.css
script: /programming/implicit-surface/implicit-surface.js
---

# Implicit Surface

<div class="options-box">
   <div class="option-line">
      <label>Grid size: </label>
      <select id="grid-select">
	 <option value="32">32x32</option>
	 <option value="64">64x64</option>
	 <option value="128">128x128</option>
	 <option value="256">256x256</option>
      </select>
   </div>
   <div class="option-line">
      <label>Original mesh: </label>
      <select id="mesh-select">
	 <option value="flower">Flower</option>
	 <option value="box">Box</option>
	 <option value="lambda">Lambda</option>
      </select>
   </div>
   <div class="option-line">
      <label class="slider-text">Distance: </label>
      <input type="range" id="distance-input"></input>
      <output class="slider-text" id="distance-output">0</output>
   </div>
</div>

<div>
   <div class="column-half">
      <h2>Original Mesh</h2>
      <canvas id="mesh-view"></canvas>
   </div>
   <div class="column-half">
      <h2>Offsetted Mesh</h2>
      <canvas id="result-view"></canvas>
   </div>
</div>

<div>
   <div class="column-half">
      <h2>Rasterized Mesh</h2>
      <canvas id="raster-view"></canvas>
   </div>
   <div class="column-half">
      <h2>Distance Field</h2>
      <canvas id="dist-view"></canvas>
   </div>
</div>