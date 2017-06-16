var width = 600,
    height = 600,
    radius = 3,
    padding = 0.5;

d3.select("#network").selectAll("*").remove();
var svg = d3.select("#network").append("svg")
    .attr("width", width)
    .attr("height", height);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        line1 = "<strong>Name:</strong> <span style='color:red'>" + d.name + "</span>";
        line2 = "<strong>Number of Retweets:</strong> <span style='color:red'>" + d.value + "</span>";
        return line1 + "<br></br>" + line2;
    });

svg.call(tip);

var weightFactor = 20;
var d3cola = cola.d3adaptor(d3)
    .size([width, height])
    .linkDistance(function(l) {
        return weightFactor / l.value;
    });

d3.json("./static/data/user_network_group0.json", function(error, graph) {
    // d3.json("savedGraph.json", function(error, graph) {
    if (error) throw error;
    draw(graph);
});

var link, node;

function draw(graph) {
    fill = d3.scale.category10();

    d3cola
        .avoidOverlaps(true)
        .handleDisconnected(true)
        .start(10, 15, 20);

    link = svg.selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke", "black")
        .attr("stroke-width", function(d) {
            return d.value / 3.0;
        });

    node = svg.selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", function(d) {
            return 3.0;
        })
        .style("fill", function(d) {
            return fill(d.group);
        })
        .call(d3cola.drag)
        .on("mouseover", function(d) {
            d3.select(this).attr("r", function(d) {
                return 5;
            });
            svg.selectAll("rect").style("opacity", 0.5);
            svg.select("#rect_" + d.group).style("opacity", 1.0);

            svg.selectAll("text").style("opacity", 0.5);
            svg.select("#text_" + d.group).style("opacity", 1.0);
            // svg.select("#title").style("opacity", 1.0);
            // svg.select("#footnote").style("opacity", 1.0);
            tip.show(d);
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("r", function(d) {
                return 3;
            });
            tip.hide(d);

            svg.selectAll("rect").style("opacity", 1.0);
            svg.selectAll("text").style("opacity", 1.0);
        })
        .on('click', function(d) {
            // if (d3.event.defaultPrevented) return;
            plot_word_cloud(d.group);
        });;

    var legend = svg.selectAll(".legend")
        .data(fill.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(0," + (+i * 18 + 40) + ")";
        });

    legend.append("rect")
        .attr("id", function(d) {
            return "rect_" + d;
        })
        .attr("x", 5)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", function(d) {
            return fill(d);
        });

    legend.append("text")
        .attr("id", function(d) {
            return "text_" + d;
        })
        .attr("font-size", "8pt")
        .attr("x", 24)
        .attr("y", 8)
        .attr("dy", ".25em")
        .style("text-anchor", "front")
        .text(function(d) {
            return d;
        });

    node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.name
        });

    d3cola
        .nodes(graph.nodes) // graph is your graph
        .links(graph.links)
        .on("tick", tick)
        .start();

    //for (var i = 100; i > 0; --i) d3cola.tick();
    //d3cola.stop(); 

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
            .attr("cx", function(d) {
                return d.x = Math.max(radius, Math.min(width - radius, d.x));
            })
            .attr("cy", function(d) {
                return d.y = Math.max(radius, Math.min(height - radius, d.y));
            });

        link.attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });
    }
}
