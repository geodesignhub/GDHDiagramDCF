// http://bl.ocks.org/3687826
d3.divgrid = function(config) {
  var columns = [];

  var dg = function(selection) {
    if (columns.length == 0) columns = d3.keys(selection.data()[0][0]);

    // header
    selection.selectAll(".divgrid_header")
        .data([true])
      .enter().append("div")
        .attr("class", "divgrid_header")

    var header = selection.select(".divgrid_header")
      .selectAll(".divgrid_cell")
      .data(columns);

    header.enter().append("div")
      .attr("class", function(d,i) { return "col-" + i; })
      .classed("divgrid_cell", true)

    selection.selectAll(".divgrid_header .divgrid_cell")
      .text(function(d) { return d; });

    header.exit().remove();

    // rows
    var rows = selection.selectAll(".divgrid_row")
        .data(function(d) { return d; })

    rows.enter().append("div")
        .attr("class", "divgrid_row")

    rows.exit().remove();

    var cells = selection.selectAll(".divgrid_row").selectAll(".divgrid_cell")
        .data(function(d) { return columns.map(function(col){return d[col];}) })

    // cells
    cells.enter().append("div")
      .attr("class", function(d,i) { return "col-" + i; })
      .classed("divgrid_cell", true)

    cells.exit().remove();

    selection.selectAll(".divgrid_cell")
      .text(function(d) { return d; });

    return dg;
  };

  dg.columns = function(_) {
    if (!arguments.length) return columns;
    columns = _;
    return this;
  };

  return dg;
};
