(function() {

    var mesh_view = document.getElementById("mesh-view");
    var mesh_ctx = mesh_view.getContext("2d");
    var raster_view = document.getElementById("raster-view");
    var raster_ctx = raster_view.getContext("2d");
    var dist_view = document.getElementById("dist-view");
    var dist_ctx = dist_view.getContext("2d");
    var result_view = document.getElementById("result-view");
    var result_ctx = result_view.getContext("2d");

    var grid_select = document.getElementById("grid-select");
    var mesh_select = document.getElementById("mesh-select");
    var distance_input = document.getElementById("distance-input");
    var distance_output = document.getElementById("distance-output");

    var mesh = [];
    var raster = [];
    var dist = [];

    var imgWidth = grid_select.value;
    var imgHeight = grid_select.value;

    var isInGrid = function(p) {
        return p.x < imgWidth  && p.x > -1 &&
               p.y < imgHeight && p.y > -1
    };

    var sideDist = 1.0;
    var diagDist = Math.sqrt(2);
    var getNeighbors = function(p) {
        var neighbors = [];

        if(p.x !== 0)
        {
            neighbors.push({pos:{x:p.x-1, y:p.y}, dist: sideDist});
            if(p.y !== 0)
                neighbors.push({pos:{x:p.x-1, y:p.y-1}, dist: diagDist});
            if(p.y !== imgHeight-1)
                neighbors.push({pos:{x:p.x-1, y:p.y+1}, dist: diagDist});
        }

        if(p.x !== imgWidth-1)
        {
            neighbors.push({pos:{x:p.x+1, y:p.y}, dist: sideDist});
            if(p.y !== 0)
                neighbors.push({pos:{x:p.x+1, y:p.y-1}, dist: diagDist});
            if(p.y !== imgHeight-1)
                neighbors.push({pos:{x:p.x+1, y:p.y+1}, dist: diagDist});
        }

        if(p.y !== 0)
            neighbors.push({pos:{x:p.x, y:p.y-1}, dist: sideDist});
        if(p.y !== imgHeight-1)
            neighbors.push({pos:{x:p.x, y:p.y+1}, dist: sideDist});

        return neighbors;
    }

    var computeBaseSurface = function() {

        // Reset mesh structure
        mesh = [];

        if(mesh_select.value === "flower") {
            // Compute new vertices positions
            var nb = 64;
            var w_2 = imgWidth / 2;
            var h_2 = imgHeight / 2;
            var rmax = imgWidth / 6;
            for(var a=0; a<=nb; a+=1) {
                var ang = (a*2/nb) * Math.PI;
                var cos = Math.cos(ang);
                var sin = Math.sin(ang);
                var r = (Math.cos(3*ang) + 1.3) * rmax;
                mesh.push({
                    x: cos * r + w_2,
                    y: sin * r + h_2
                });
            }
        }
        else if(mesh_select.value === "box") {
            mesh.push({x: imgWidth/3, y:imgHeight/3});
            mesh.push({x: imgWidth*2/3, y:imgHeight/3});
            mesh.push({x: imgWidth*2/3, y:imgHeight*2/3});
            mesh.push({x: imgWidth/3, y:imgHeight*2/3});
            mesh.push({x: imgWidth/3, y:imgHeight/3});
        }
        else if(mesh_select.value === "lambda") {
            // Head
            mesh.push({x: imgWidth * 7/20, y:imgHeight * 6/20});
            mesh.push({x: imgWidth * 6/20, y:imgHeight * 6/20});
            mesh.push({x: imgWidth * 6/20, y:imgHeight * 5/20});
            mesh.push({x: imgWidth * 9/20, y:imgHeight * 5/20});
            // Front legt
            mesh.push({x: imgWidth * 13/20, y:imgHeight * 13/20});
            mesh.push({x: imgWidth * 15/20, y:imgHeight * 12/20});
            mesh.push({x: imgWidth * 16/20, y:imgHeight * 14/20});
            mesh.push({x: imgWidth * 12/20, y:imgHeight * 16/20});
            // Rear leg
            mesh.push({x: imgWidth * 9/20, y:imgHeight * 10/20});
            mesh.push({x: imgWidth * 7/20, y:imgHeight * 14/20});
            mesh.push({x: imgWidth * 5/20, y:imgHeight * 14/20});
            mesh.push({x: imgWidth * 8/20, y:imgHeight * 8/20});
            // Closing the loop
            mesh.push({x: imgWidth * 7/20, y:imgHeight * 6/20});
        }


        // Draw mesh_view
        mesh_view.width = mesh_view.offsetWidth;
        mesh_view.height = mesh_view.offsetHeight;
        var xRatio = mesh_view.width / imgWidth;
        var yRatio = mesh_view.height / imgHeight;
        mesh_ctx.beginPath();
        mesh_ctx.strokeStyle="#000";
        mesh_ctx.moveTo(mesh[0].x*xRatio+0.5, mesh[0].y*yRatio+0.5);
        for(var v=1; v < mesh.length; ++v)
            mesh_ctx.lineTo(mesh[v].x*xRatio+0.5, mesh[v].y*yRatio+0.5);
        mesh_ctx.lineWidth = 3;
        mesh_ctx.stroke();
    };

    var computeRasterSurface = function() {
        // Reset raster structure
        raster = [];

        // Draw mesh on down scaled image
        raster_view.width = imgWidth;
        raster_view.height = imgHeight;
        raster_ctx.imageSmoothingEnabled = false;
        raster_ctx.beginPath();
        raster_ctx.strokeStyle="#000";
        raster_ctx.moveTo(mesh[0].x, mesh[0].y);
        for(var i=1; i < mesh.length; ++i)
            raster_ctx.lineTo(mesh[i].x, mesh[i].y);
        raster_ctx.fill();

        // Interpret image content
        var img = raster_ctx.getImageData(
            0, 0, imgWidth, imgHeight);
        for(var y=0; y<imgHeight; ++y) {
            var raster_line = [];

            for(var x=0; x<imgWidth; ++x) {
                var idx = (y*imgWidth + x) * 4;
                raster_line.push(img.data[idx+3] > 115 ? 0 : 1);
            }

            raster.push(raster_line);
        }

        // Find borders
        for(y=0; y<imgHeight; ++y) {
            for(x=0; x<imgWidth; ++x) {
                if(raster[y][x] === 0){
                    if((x < 1            || raster[y][x-1] !== 1) &&
                       (x >= imgWidth-1  || raster[y][x+1] !== 1) &&
                       (y < 1            || raster[y-1][x] !== 1) &&
                       (y >= imgHeight-1 || raster[y+1][x] !== 1)) {
                        raster[y][x] = -1;
                    }
                }
            }
        }


        // Draw raster_view
        raster_view.width = raster_view.offsetWidth;
        raster_view.height = raster_view.offsetHeight;
        xRatio = raster_view.width / imgWidth;
        yRatio = raster_view.height / imgHeight;
        for(y=0; y<imgHeight; ++y) {
            for(x=0; x<imgWidth; ++x) {
                var rast = raster[y][x];
                if(rast === 0)
                    raster_ctx.fillStyle = "#000";
                else if(rast === -1)
                    raster_ctx.fillStyle = "#ddd";
                else
                    raster_ctx.fillStyle = "#fff";

                raster_ctx.fillRect(x*xRatio, y*yRatio, xRatio, yRatio);
            }
        }
        raster_ctx.strokeStyle = "#888";
        for(i=0; i<=imgWidth; ++i) {
            var lx = i*xRatio+0.5;
            raster_ctx.moveTo(lx, 0);
            raster_ctx.lineTo(lx, yRatio*imgHeight);
            raster_ctx.stroke();
        }
        for(j=0; j<=imgWidth; ++j) {
            var ly = j*yRatio+0.5;
            raster_ctx.moveTo(0, ly);
            raster_ctx.lineTo(xRatio*imgWidth, ly);
            raster_ctx.stroke();
        }
    };

    var computDistanceField = function() {

        // Reset distance field
        dist = [];
        for(var y=0; y<imgHeight; ++y) {
            var dist_line = [];
            for(var x=0; x<imgWidth; ++x) {
                var rast = raster[y][x];
                if(rast === 0)
                    dist_line.push(0);
                else
                    dist_line.push(Infinity);
            }
            dist.push(dist_line);
        }

        // Setup grid traversal structures
        origins = [
            {x:0,           y:0},
            {x:imgWidth-1,  y:0},
            {x:imgWidth-1,  y:imgHeight-1},
            {x:0,           y:imgHeight-1}
        ];

        progressions = [
            [{x:1,  y:0},  {x:0,  y:1},  {x:-1, y:1} ],
            [{x:0,  y:1},  {x:-1, y:0},  {x:-1, y:-1}],
            [{x:-1, y:0},  {x:0,  y:-1}, {x:1, y:-1} ],
            [{x:0,  y:-1}, {x:1,  y:0},  {x:1, y:1}  ]
        ];

        // Do distance field computation
        positions = [];

        for(var i=0; i<4; ++i) {
            var orig  = origins[i];
            var proga = progressions[i][0];
            var progb = progressions[i][1];
            var dir   = progressions[i][2];

            var lineOrig = {x:orig.x, y:orig.y};
            while(isInGrid(lineOrig)) {
                var pos = {x:lineOrig.x, y:lineOrig.y};
                while(isInGrid(pos)) {
                    positions.push({x:pos.x, y:pos.y});
                    pos.x += dir.x;
                    pos.y += dir.y;
                }
                lineOrig.x += proga.x;
                lineOrig.y += proga.y;
            }

            // Come back one step in proga
            lineOrig.x -= proga.x;
            lineOrig.y -= proga.y;

            // Advance one step in progb
            lineOrig.x += progb.x;
            lineOrig.y += progb.y;

            while(isInGrid(lineOrig)) {
                pos = {x:lineOrig.x, y:lineOrig.y};
                while(isInGrid(pos)) {
                    positions.push({x:pos.x, y:pos.y});
                    pos.x += dir.x;
                    pos.y += dir.y;
                }
                lineOrig.x += progb.x;
                lineOrig.y += progb.y;
            }
        }


        var posCount = positions.length;
        for(var d=0; d<posCount; ++d) {

            pos = positions[d];

            var neighbors = getNeighbors(pos);
            var neiPos = neighbors[0].pos;
            var relDist = neighbors[0].dist;
            var minDist = dist[neiPos.y][neiPos.x] + relDist;
            for(var n=1; n<neighbors.length; ++n) {
                neiPos = neighbors[n].pos;
                relDist = neighbors[n].dist;
                var neiDist = dist[neiPos.y][neiPos.x] + relDist;
                if(neiDist < minDist) {
                    minDist = neiDist;
                }
            }

            if(minDist < dist[pos.y][pos.x])
                dist[pos.y][pos.x] = minDist;
        }

        var currDist = 0;
        var globalMin = 0;
        var globalMax = 0;
        var absMax = 0;
        for(y=0; y<imgHeight; ++y) {
            for(x=0; x<imgWidth; ++x) {

                rast = raster[y][x];
                currDist = dist[y][x] * rast;
                dist[y][x] = currDist;

                globalMin = Math.min(globalMin, currDist);
                globalMax = Math.max(globalMax, currDist);
                absMax = Math.max(absMax, Math.abs(currDist));
            }
        }

        // Update slider min max and value
        distance_input.min = Math.floor(globalMin);
        distance_input.max = Math.ceil(globalMax);
        distance_input.value = 0;
        distance_output.value = 0;

        var rgb = function(r, g, b) {
            var rs = Math.floor(r*255);
            var gs = Math.floor(g*255);
            var bs = Math.floor(b*255);
            return "rgb("+rs+","+gs+","+bs+")";
        };

        var distToRgb = function(d) {
            var val = (d - globalMin) / (globalMax - globalMin);
            var mul = 1.0 - Math.pow(1 - Math.abs(d) / absMax, 16);

            if(val < 0.33) {
                val *= 3;
                return rgb(
                    mul * (1-val*val),
                    mul * (1 - (val-1)*(val-1)),
                    mul * (0));

            } else if(val < 0.66) {
                val = (val - 0.33) * 3;
                return rgb(
                    mul * (0),
                    mul * (1 - val*val),
                    mul * (1 - (val-1)*(val-1)));

            } else {
                val = (val-0.66) * 3;
                return rgb(
                    mul * ((1 - (val-1)*(val-1))*(1-val)),
                    mul * (0),
                    mul * (1 - val*val));
            }
        };

        // Draw dist_view
        dist_view.width = dist_view.offsetWidth;
        dist_view.height = dist_view.offsetHeight;
        xRatio = dist_view.width / imgWidth;
        yRatio = dist_view.height / imgHeight;
        for(y=0; y<imgHeight; ++y) {
            for(x=0; x<imgWidth; ++x) {
                dist_ctx.fillStyle = distToRgb(dist[y][x]);
                dist_ctx.fillRect(x*xRatio, y*yRatio, xRatio, yRatio);
            }
        }
    };

    var updateResultSurface = function() {

        var stroke = function(x0, y0, x1, y1) {
            result_ctx.moveTo((x0+0.5)*xRatio, (y0+0.5)*yRatio);
            result_ctx.lineTo((x1+0.5)*xRatio, (y1+0.5)*yRatio);
            result_ctx.lineWidth = 1.5;
            result_ctx.stroke();
        };

        // Draw raster_view
        result_view.width = result_view.offsetWidth;
        result_view.height = result_view.offsetHeight;
        xRatio = result_view.width / imgWidth;
        yRatio = result_view.height / imgHeight;
        result_ctx.strokeStyle = "#000";

        var distance = distance_input.value;

        for(var y=0; y<imgHeight-1; ++y) {
            for(var x=0; x<imgWidth-1; ++x) {

                var curr = dist[y][x] < distance;
                var right = dist[y][x+1] < distance;
                var top = dist[y+1][x] < distance;
                var tplf = dist[y+1][x+1] < distance;

                var cell = 0;

                if(curr)
                    if(right)
                        if(top)
                        {
                            if(!tplf)
                                cell = 11;
                        }
                        else
                            if(tplf)
                                cell = 7;
                            else
                                cell = 3;
                    else
                        if(top)
                            if(tplf)
                                cell = 13;
                            else
                                cell = 9;
                        else
                            if(tplf)
                                cell = 5;
                            else
                                cell = 1;
                else
                    if(right)
                        if(top)
                            if(tplf)
                                cell = 14;
                            else
                                cell = 10;
                        else
                            if(tplf)
                                cell = 6;
                            else
                                cell = 2;
                    else
                        if(top)
                            if(tplf)
                                cell = 12;
                            else
                                cell = 8;
                        else
                            if(tplf)
                                cell = 4;

                if(cell === 0)
                    continue;

                var orig  = dist[y][x] - distance;
                var side = dist[y][x+1] - distance;
                var above = dist[y+1][x] - distance;
                var diag  = dist[y+1][x+1] - distance;

                var mbt = (-orig)  / (side - orig);
                var mlf = (-orig)  / (above - orig);
                var mrt = (-side) / (diag - side);
                var mtp = (-above) / (diag - above);

                switch(cell) {
                case 1:  stroke((x),     (y+mlf), (x+mbt), (y));     break;
                case 2:  stroke((x+mbt), (y),     (x+1.0), (y+mrt)); break;
                case 3:  stroke((x),     (y+mlf), (x+1.0), (y+mrt)); break;
                case 4:  stroke((x+1.0), (y+mrt), (x+mtp), (y+1.0)); break;
                case 5:  stroke((x),     (y+mlf), (x+mtp), (y+1.0));
                         stroke((x+mbt), (y),     (x+1.0), (y+mrt)); break;
                case 6:  stroke((x+mbt), (y),     (x+mtp), (y+1.0)); break;
                case 7:  stroke((x),     (y+mlf), (x+mtp), (y+1.0)); break;
                case 8:  stroke((x),     (y+mlf), (x+mtp), (y+1.0)); break;
                case 9:  stroke((x+mbt), (y),     (x+mtp), (y+1.0)); break;
                case 10: stroke((x),     (y+mlf), (x+mbt), (y));
                         stroke((x+mtp), (y+1.0), (x+1.0), (y+mrt)); break;
                case 11: stroke((x+mtp), (y+1.0), (x+1.0), (y+mrt)); break;
                case 12: stroke((x),     (y+mlf), (x+1.0), (y+mrt)); break;
                case 13: stroke((x+mbt), (y),     (x+1.0), (y+mrt)); break;
                case 14: stroke((x),     (y+mlf), (x+mbt), (y));     break;
                }
            }
        }
    };

    var recompute = function() {
        computeBaseSurface();
        computeRasterSurface();
        computDistanceField();
        updateResultSurface();
    };

    grid_select.addEventListener("change", function() {
        imgWidth = grid_select.value;
        imgHeight = grid_select.value;
        recompute();
    }, false);

    mesh_select.addEventListener("change", function() {
        recompute();
    }, false);

    distance_input.addEventListener("input", function() {
        distance_output.value = distance_input.value;
        updateResultSurface();
    }, false);


    recompute();

}());
