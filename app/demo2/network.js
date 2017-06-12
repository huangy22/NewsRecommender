var width = 600,
    height = 600,
    radius = 3,
    padding = 0.5;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var d3cola = cola.d3adaptor(d3)
             .size([width, height])
             .linkDistance(function (l) { return l.value * weightFactor; });

d3.json("user_network_gt_5.json", function(error, graph) {
// d3.json("savedGraph.json", function(error, graph) {
    if (error) throw error;
    draw(graph);
});

var link, node;
function draw(graph){
    fill = d3.scale.category10();
    weightFactor = 90;

    d3cola
        .avoidOverlaps(true)
        .handleDisconnected(true)
        .start(20, 15, 20);

    link = svg.selectAll("line")
        .data(graph.links)
      .enter().append("line")
        .attr("stroke", "black")
        .attr("stroke-width", function(d){return d.value;});

    node = svg.selectAll("circle")
          .data(graph.nodes)
        .enter().append("circle")
          .attr("r", function(d){return 3;})
          .style("fill", function(d) { return fill(d.group); })
          .call(d3cola.drag);

    // node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    // node.append("text")
    //     .attr("dx", 12)
    //     .attr("dy", ".35em")
    //     .text(function(d) { return d.name });

    d3cola
      .nodes(graph.nodes) // graph is your graph
      .links(graph.links)
      .on("tick", tick)
      .start();

    for (var i = 100; i > 0; --i) d3cola.tick();
    d3cola.stop(); 

    // Resolves collisions between d and all other circles.
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(graph.nodes);
      return function(d) {
        var r = radius + Math.max(padding),
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = radius + radius + padding;
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

    function tick() {

      node
          // .each(collide(.5))
          .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
          .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    }
}

function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        // if (typeof(object[prop]) == 'object'){
        //     continue;
        // }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};
