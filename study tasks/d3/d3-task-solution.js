/*global d3*/

var color = d3.scaleQuantize()
    .range(["#156b87", "#876315", "#543510", "#872815"]);

var size = 960;

var pack = d3.pack()
    .size([size, size])
    .padding(5);

var svg = d3.select("body").append("svg")
    .attr("width", size)
    .attr("height", size);
    
    svg.append("text")
      .text("Exoplanets")
      .attr("dy", "20px");

d3.csv("exoplanets.csv", type, function(error, data) {
  var planets = data.filter(function(d) { return d.distance === 0; }),
      exoplanets = data.filter(function(d) { return d.distance !== 0; });

  color.domain(d3.extent(data, function(d) { return d.radius; }));

  var root = d3.hierarchy({children: [{children: planets}].concat(exoplanets)})
      .sum(function(d) { return d.radius * d.radius; })
      .sort(function(a, b) {
        return !a.children - !b.children
            || isNaN(a.data.distance) - isNaN(b.data.distance)
            || a.data.distance - b.data.distance;
      });

  pack(root);

  svg.selectAll("circle")
    .data(root.descendants().slice(1))
    .enter().append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .classed("hollow-circle", function(d) { return d.children; })
    .filter(function(d) { return d.data; })
      .style("fill", function(d) { return color(d.data.radius); })
    .append("title")
      .text(function(d) {
        return d.data.name
            + "\nplanet radius: " + d.data.radius + " EU"
            + "\nstar distance: " + (isNaN(d.data.distance) ? "N/A" : d.data.distance + " pc");
      });
});

function type(d) {
  d.radius = +d.radius;
  d.distance = d.distance ? +d.distance : NaN;
  return d;
}