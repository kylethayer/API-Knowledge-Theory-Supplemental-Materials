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

d3.csv("exoplanets.csv", type, function(error, allPlanets) {
  var planets = allPlanets.filter(function(d) { return d.distance === 0; });
  var exoplanets = allPlanets.filter(function(d) { return d.distance !== 0; });

  color.domain(d3.extent(allPlanets, function(d) { return d.radius; }));

  var root = d3.hierarchy({children: exoplanets})
      .sum(function(d) { return 5});

  svg.selectAll("circle")
    .data(pack(root).descendants().slice(1))
    .enter().append("circle")
      .attr("r", 10)
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
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