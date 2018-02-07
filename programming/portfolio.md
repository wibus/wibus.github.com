---
layout: default
title: Portfolio
---

# Portfolio

## Path Tracer

*1. Progressive Render:*

![Progressive render](/img/portfolio/pt_albedo.png){:height="400px" style="margin:-30px 0;"}

* Updated tile by tile (32x32 pixels)
* Average of 4 samples  per pixel per pass


*2. Sample count (weight):*

![Sample count](/img/portfolio/pt_weight.png){:height="400px" style="margin:-30px 0;"}

* Luminosity = number of samples
* Noisy pixels need more samples


*3. Radiance Variance:*

![Radiance Variance](/img/portfolio/pt_variance.png){:height="400px" style="margin:-30px 0;"}

* Color jumbs from samples to samples
* High variance = high level of noise


*4. Divergence map:*

![Divergence Map](/img/portfolio/pt_divergence.png){:height="400px" style="margin:-30px 0;"}

* Approximately : Variance / Weight
* Uniform divergence = Uniform noise levels


*5. Priority map:*

![Priority Map](/img/portfolio/pt_priority.png){:height="400px" style="margin:-30px 0;"}

* Based on divergence map and a threshold
* Red : requires many samples in next pass
* Blue : requires few samples in next pass
* Gray : won't not be touched in next pass

*6. Sample Pictures*

![](/img/portfolio/PathTracing/Fog_and_DepthOfField_1600f.png){:height="250px"}
![](/img/portfolio/PathTracing/Lamp_1660f_2h30m.png){:height="250px"}

![](/img/portfolio/PathTracing/PaintingIntTheMorningSun_Enhanced_152_0h25m.png){:height="238px" style="margin-top:-25px"}
![](/img/portfolio/PathTracing/WholeHome_1265f_2h45m.png){:height="238px" style="margin-top:-25px"}

<br>


## GPU Mesh Adaptation


*Topological Smoothing*

![](/img/portfolio/GPUMesh/TetCubeA1.png){:width="280px" style="margin-top:-25px"}
![](/img/portfolio/GPUMesh/TetCubeA4.png){:width="280px" style="margin-top:-25px"}
![](/img/portfolio/GPUMesh/TetCubeA16.png){:width="280px" style="margin-top:-25px"}


*Geometric Smoothing*

![](/img/portfolio/GPUMesh/HexCube initial.png){:width="380px" style="margin-left:70px;margin-top:-25px"}
![](/img/portfolio/GPUMesh/HexCube adapted.png){:width="380px" style="margin-top:-25px"}


*Beams and Beads Shading*

![](/img/portfolio/GPUMesh/BeamBeads.png){:width="870px" style="margin-top:-25px"}

<br>

## Volume Rendering

![](/img/portfolio/VolumeRendering/BallFloorShadow.png){:height="280px"}
![](/img/portfolio/VolumeRendering/Shell.png){:height="280px"}
![](/img/portfolio/VolumeRendering/SinNoise.png){:height="280px"}
