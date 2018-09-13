/** Class implementing the bar chart view. */
class BarChart
{
    /**
     * Create a bar chart instance and pass the other views in.
     * @param worldMap
     * @param infoPanel
     * @param allData
     */
    constructor(worldMap, infoPanel, allData)
    {
        this.worldMap = worldMap;
        this.infoPanel = infoPanel;
        this.allData = allData;
    }

    /**
     * Render and update the bar chart based on the selection of the data type in the drop-down box
     */
    updateBarChart(selectedDimension)
    {
		var map = this.worldMap;
		var panel = this.infoPanel;
				
		var svg = d3.select("#barChart");
        
        var max = d3.max(this.allData, function(d)
        {
			return +d[selectedDimension];
        });
                
		var xScale = d3.scaleBand()
		.rangeRound([490, 65])
		.domain(this.allData.map(function(d) { return d["YEAR"]; }));
		
		var yScale = d3.scaleLinear()
		.range([360, 0])
		.domain([0, max]);
		        
        var colorScale = d3.scaleLinear()
		.range([d3.rgb("#59aed9"), d3.rgb("#216c91")])
		.domain([0, max]);
        
        var xAxis = d3.axisBottom()
        .scale(xScale);
        
        svg.select("#xAxis")
        .attr("transform", "translate(0, 360)")
        .call(xAxis)
        .selectAll("text")	
            .style("text-anchor", "end")
            .attr("transform", "rotate(-90) translate(-10, -15)");
                    
        var yAxis = d3.axisLeft()
        .scale(yScale);
        
        svg.select("#yAxis")
        .attr("transform", "translate(65, 0)")
        .call(yAxis);

		var bars = svg.select("#bars")
		.selectAll("rect")
		.remove()
		.exit()
		.data(this.allData);
		
		var newbars = bars.enter().append("rect")
		.attr("x", function(d) { return xScale(d["YEAR"]); })
		.attr("width", 20)
		.attr("y", function(d)
		{
			return yScale(d[selectedDimension]);
		})
		.attr("height", function(d)
		{
			return yScale(max - d[selectedDimension]);
		})
		.style("fill", function(d)
		{
			return colorScale(d[selectedDimension]);
		})
		.on("click",function(d)
		{		
			newbars.style("fill", function(d)
			{
				return colorScale(d[selectedDimension]);
			});
			
			var selected = d3.select(this);
			selected.style("fill", "#d20a11");
			
			panel.updateInfo(selected.datum());
			map.updateMap(selected.datum());
		});
    }
}
