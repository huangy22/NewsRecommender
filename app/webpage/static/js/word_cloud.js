function plot_word_cloud(group){
    words_file = "./static/data/group"+group+"_words.json";
    var color = d3.scale.linear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

    d3.json(words_file, function(error, text) {
        if (error) throw error;
        d3.layout.cloud().size([800, 300])
            .words(text.words)
            .rotate(0)
            .fontSize(function(d) { return d.size; })
            .on("end", draw)
            .start();

        function draw(words) {

            var svg = d3.select("#word-cloud").append("svg")
                .attr("width", 800)
                .attr("height", 300);
                // without the transform, words words would get cutoff to the left and top, they would
                // appear outside of the SVG area
            svg.attr("transform", "translate(320,200)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });
        }

    });
}


// plot_word_cloud("common_words.json", 1.0);
plot_word_cloud(0);
// plot_word_cloud("group1_words.json", 15.0);
// plot_word_cloud("group2_words.json", 5.0);