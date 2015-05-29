(function() {

    // System variables
    var distribSelect = document.getElementById('distribution');
    var cloudCan = document.getElementById('cloud-canvas');
    var cloudCtx = cloudCan.getContext('2d');
    var kdtreeCan = document.getElementById('kdtree-canvas');
    var kdtreeCtx = kdtreeCan.getContext('2d');
    var clustersCan = document.getElementById('clusters-canvas');
    var clustersCtx = clustersCan.getContext('2d');
    var gluedCan = document.getElementById('glued-canvas');
    var gluedCtx = gluedCan.getContext('2d');
    var last = 0;


    // Project variables
    var subdivide = function(pts, indices, isHoriz, bbMin, bbMax, depth) {
        var sort, side;
        if(isHoriz) {
            sort = function(a, b) {return pts[a].x - pts[b].x;};
            side = function(mid, pt) {return pt.x < mid.x;};
        }
        else {
            sort = function(a, b) {return pts[a].y - pts[b].y;};
            side = function(mid, pt) {return pt.y < mid.y;};
        }

        indices.sort(sort);
        var idCount = indices.length;
        var mid = indices[Math.floor(idCount/2)];

        var node = {};
        node.midId = mid;
        node.indices = indices;
        node.bbMin = bbMin;
        node.bbMax = bbMax;

        if(depth !== 0 && idCount !== 0) {
            var left = [];
            var right = [];
            for(var i=0; i<idCount; ++i) {
                var id = indices[i];
                if(side(pts[mid], pts[id]))
                    left.push(id);
                else
                    right.push(id);
            }

            var bbLeftMax = {
                x: isHoriz  ? pts[mid].x : bbMax.x,
                y: !isHoriz ? pts[mid].y : bbMax.y};
            var bbRightMin = {
                x: isHoriz  ? pts[mid].x : bbMin.x,
                y: !isHoriz ? pts[mid].y : bbMin.y};

            node.left = subdivide(pts, left, !isHoriz, bbMin, bbLeftMax, depth-1);
            node.right = subdivide(pts, right, !isHoriz, bbRightMin, bbMax, depth-1);
            node.separator = {
                x1: isHoriz  ? pts[mid].x : bbMin.x,
                y1: !isHoriz ? pts[mid].y : bbMin.y,
                x2: isHoriz  ? pts[mid].x : bbMax.x,
                y2: !isHoriz ? pts[mid].y : bbMax.y
            };
        }

        return node;
    }

    var dist2 = function (pt1, pt2) {
        var dx = pt1.x - pt2.x;
        var dy = pt1.y - pt2.y;
        return dx*dx + dy*dy;
    }

    var circumcenter = function(A, B, C) {
        var Adot = A.x*A.x + A.y*A.y;
        var Bdot = B.x*B.x + B.y*B.y;
        var Cdot = C.x*C.x + C.y*C.y;
        var D = 2*(A.x*(B.y-C.y) + B.x*(C.y-A.y) + C.x*(A.y-B.y));
        var Ox = (Adot*(B.y-C.y) + Bdot*(C.y-A.y) + Cdot*(A.y-B.y)) / D;
        var Oy = (Adot*(C.x-B.x) + Bdot*(A.x-C.x) + Cdot*(B.x-A.x)) / D;
        return {x: Ox, y: Oy};
    }

    var addVertex = function(pts, tri, pt) {
        var edgeBuffer = [];
        var newTriSet = [];

        var triCount = tri.length;
        for(var t=0; t<triCount; ++t) {
            var p0 = pts[tri[t][0]];
            var p1 = pts[tri[t][1]];
            var p2 = pts[tri[t][2]];
            var O = circumcenter(p0, p1, p2);
            var radius2 = dist2(p0, O);

            if(radius2 < dist2(pts[pt], O)) {
                newTriSet.push(tri[t]);
            }
            else {
                var small0, small1, small2,
                    big0, big1, big2;

                if(tri[t][0] < tri[t][1]) {
                    small0 = tri[t][0];
                    big0 = tri[t][1];
                }
                else {
                    small0 = tri[t][1];
                    big0 = tri[t][0];
                }

                if(tri[t][1] < tri[t][2]) {
                    small1 = tri[t][1];
                    big1 = tri[t][2];
                }
                else {
                    small1 = tri[t][2];
                    big1 = tri[t][1];
                }

                if(tri[t][2] < tri[t][0]) {
                    small2 = tri[t][2];
                    big2 = tri[t][0];
                }
                else {
                    small2 = tri[t][0];
                    big2 = tri[t][2];
                }

                var isPresent0 = false;
                var isPresent1 = false;
                var isPresent2 = false;
                var edgeCount = edgeBuffer.length;
                for(var e=0; e<edgeCount; ++e) {

                    if(edgeBuffer[e].small === small0 &&
                       edgeBuffer[e].big === big0) {
                        edgeBuffer[e] += 1;
                        isPresent0 = true;
                    }

                    if(edgeBuffer[e].small === small1 &&
                       edgeBuffer[e].big === big1) {
                        edgeBuffer[e] += 1;
                        isPresent1 = true;
                    }

                    if(edgeBuffer[e].small === small2 &&
                       edgeBuffer[e].big === big2) {
                        edgeBuffer[e] += 1;
                        isPresent2 = true;
                    }
                }

                if(!isPresent0) {
                    edgeBuffer.push({small: small0, big: big0, count: 1});
                }
                if(!isPresent1) {
                    edgeBuffer.push({small: small1, big: big1, count: 1});
                }
                if(!isPresent2) {
                    edgeBuffer.push({small: small2, big: big2, count: 1});
                }
            }
        }

        edgeCount = edgeBuffer.length;
        for(e=0; e<edgeCount; ++e) {
            if(edgeBuffer[e].count === 1){
                newTriSet.push([pt, edgeBuffer[e].small, edgeBuffer[e].big]);
            }
        }

        return newTriSet;
    }

    var triangulate = function(pts, node) {

        var finalTri = [];

        if(node.left && node.right) {
            finalTri = triangulate(pts, node.left);
            finalTri = finalTri.concat(triangulate(pts, node.right));
        }
        else {
            var idCount = node.indices.length;
            if(idCount >= 3) {
                var dx = node.bbMax.x - node.bbMin.x;
                var dy = node.bbMax.y - node.bbMin.y;
                var xMid = (node.bbMin.x + node.bbMax.x) / 2.0;
                var yMid = (node.bbMin.y + node.bbMax.y) / 2.0;
                var dMax = dx > dy ? dx : dy;

                var first = pts.length;
                pts.push({x: xMid - 20 * dMax,  y: yMid - dMax});
                pts.push({x: xMid,              y: yMid + 20 * dMax});
                pts.push({x: xMid + 20 * dMax,  y: yMid - dMax});
                var tri = [[first, first+1, first+2]];


                for(i=0; i<idCount; ++i) {
                    var id = node.indices[i];
                    tri = addVertex(pts, tri, id);
                }

                var triCount = tri.length;
                for(var t=0; t<triCount; ++t) {
                    if(tri[t][0] < first &&
                       tri[t][1] < first &&
                       tri[t][2] < first)
                        finalTri.push(tri[t]);
                }
            }

            node.tri = finalTri;
        }

        return finalTri;
    }

    var triColorId = 0;
    var triColorTable = [
        "rgb(30, 30, 30)",
        "rgb(150, 0, 150)",
        "rgb(200, 0, 0)",
        "rgb(150, 150, 0)",
        "rgb(0, 200, 0)",
        "rgb(0, 150, 150)",
        "rgb(0, 0, 200)"];
    
    var drawSeparators = function(pts, node, colorId, width, ctx) {
        colorId = (colorId+2);
        if(colorId >= triColorTable.length)
            colorId = 0;
        
        if(node.left)
            drawSeparators(pts, node.left, colorId, width-1, ctx);
        if(node.right)
            drawSeparators(pts, node.right, colorId, width-1, ctx);
        if(node.separator) {
            ctx.lineWidth = width;
            ctx.strokeStyle = triColorTable[colorId];
            ctx.strokeRect(node.separator.x1, node.separator.y1,
                           node.separator.x2 - node.separator.x1,
                           node.separator.y2 - node.separator.y1);
        }
    }

    var drawTriangles = function(pts, node, ctx) {
        if(node.left)
            drawTriangles(pts, node.left, ctx);
        if(node.right)
            drawTriangles(pts, node.right, ctx);
        if(node.tri) {
            var tri = node.tri;
            var triCount = tri.length;
            ctx.strokeStyle = triColorTable[triColorId];
            triColorId = (triColorId+1) % triColorTable.length;
            for(var t=0; t<triCount; ++t) {
                var p0 = pts[tri[t][0]];
                var p1 = pts[tri[t][1]];
                var p2 = pts[tri[t][2]];

                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    var drawPointCloud = function(pts, radius, borderWidth, ctx) {
        var twoPi = 2*Math.PI;
        ctx.fillStyle = 'green';
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = borderWidth;
        var pointCount = pts.length;
        for(i=0; i<pointCount; ++i) {
            var pt = pts[i];
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radius, 0, twoPi, false);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
    }


    var exec = function(timestamp) {
        // Elapsed time in seconds
        var dt = (timestamp - last) / 1000.0;


        /// Script ///
        var width = cloudCan.width;
        var height = cloudCan.height;
        var minSide = Math.min(width, height);
        var center = {x:width/2, y:height/2};
        var subdivisions = 5;
        var pointCount = 400;
        var pointSize = 3;
        var border = pointSize+2;
        var cloud = [];
        var indices = [];

        // Generate point cloud
        if(distribSelect.value === "uniform") {
            for(var i=0; i<pointCount; ++i) {
                var randx = Math.random() - 0.5;
                var randy = Math.random() - 0.5;

                var pt = {
                    x: center.x + randx * (width - 2*border),
                    y: center.y + randy * (height - 2*border)
                };

                cloud.push(pt);
                indices.push(i);
            }
        }
        else if(distribSelect.value === "circular") {
            for(i=0; i<pointCount; ++i) {
                var randAngle = Math.random() * 2 * Math.PI;
                var dir = {x: Math.cos(randAngle), y: Math.sin(randAngle)};

                var randRadius = Math.random() * (minSide/2 - border);
                var radius = randRadius - minSide/4;
                radius = (radius * radius * radius) / (minSide*minSide/16) + minSide/4;

                pt = {
                    x: center.x + dir.x * radius,
                    y: center.y + dir.y * radius
                };

                cloud.push(pt);
                indices.push(i);
            }
        }

        // Build kd-tree
        var bbMin = {x: 0,     y: 0};
        var bbMax = {x: width, y: height};
        var root = subdivide(cloud, indices, true, bbMin, bbMax, subdivisions);
        var glueRoot = subdivide(cloud, indices, true, bbMin, bbMax, 0);

        // Build triangulation
        var tri = triangulate(cloud, root);
        var glueTri = triangulate(cloud, glueRoot);

        // Draw
        drawPointCloud(cloud, pointSize, 2, cloudCtx);

        drawSeparators(cloud, root, 0, subdivisions+1, kdtreeCtx);
        drawPointCloud(cloud, pointSize, pointSize/2, kdtreeCtx);

        triColorId = 0;
        drawTriangles(cloud, root, clustersCtx);
        drawPointCloud(cloud, pointSize, pointSize/2, clustersCtx);

        triColorId = 0;
        drawTriangles(cloud, glueRoot, gluedCtx);
        drawPointCloud(cloud, pointSize, pointSize/2, gluedCtx);


        // Immediate refresh?
        return false;
    };

    var wrapExec = function(timestamp) {
        // Clear canvas 2D context
        cloudCan.width = cloudCan.offsetWidth;
        cloudCan.height = cloudCan.offsetHeight;
        cloudCtx.clearRect ( 0 , 0 , cloudCan.width, cloudCan.height );

        kdtreeCan.width = kdtreeCan.offsetWidth;
        kdtreeCan.height = kdtreeCan.offsetHeight;
        kdtreeCtx.clearRect ( 0 , 0 , kdtreeCan.width, kdtreeCan.height );

        clustersCan.width = clustersCan.offsetWidth;
        clustersCan.height = clustersCan.offsetHeight;
        clustersCtx.clearRect ( 0 , 0 , clustersCan.width, clustersCan.height );

        gluedCan.width = gluedCan.offsetWidth;
        gluedCan.height = gluedCan.offsetHeight;
        gluedCtx.clearRect ( 0 , 0 , gluedCan.width, gluedCan.height );

        // Call exec() method
        var needRefresh = exec(timestamp);

        // ask new frame
        if(needRefresh) {
            window.requestAnimationFrame(wrapExec);
        }

    }; wrapExec();

    distribSelect.addEventListener("change", function() {
        wrapExec();
    });
})();

