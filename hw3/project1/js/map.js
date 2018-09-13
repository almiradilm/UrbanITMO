/** Class implementing the map view. */
class Map
{
    /**
     * Creates a Map Object
     */
    constructor()
    {
        this.projection = d3.geoConicConformal().scale(150).translate([400, 350]);
    }

    /**
     * Function that clears the map
     */
    clearMap() 
    {	
		d3.select("#map").selectAll(".host")
		.attr("class", "countries");
		
		d3.select("#map").selectAll(".team")
		.attr("class", "countries");
		
		d3.select("#points").selectAll("circle").remove();
		
        // ******* TODO: PART V*******
        // Clear the map of any colors/markers; You can do this with inline styling or by
        // defining a class style in styles.css

        // Hint: If you followed our suggestion of using classes to style
        // the colors and markers for hosts/teams/winners, you can use
        // d3 selection and .classed to set these classes on and off here.
    }

    /**
     * Update Map with info for a specific FIFA World Cup
     * @param wordcupData the data for one specific world cup
     */
    updateMap(worldcupData)
    {	
        this.clearMap();
        
		worldcupData["teams_iso"].forEach(function(d)
		{
			d3.select("#" + d)
			.attr("class", "team");
		})
		
		d3.select("#" + worldcupData["host_country_code"])
		.attr("class", "host");
		
		d3.select("#" + worldcupData["winner"])
		.attr("class", "host");
		
		d3.select("#" + worldcupData["runner_up"])
		.attr("class", "host");
		
		var winner = this.projection([worldcupData["WIN_LON"], worldcupData["WIN_LAT"]]);
		var silver = this.projection([worldcupData["RUP_LON"], worldcupData["RUP_LAT"]]);
		
		d3.select("#points")
		.append("circle")
		.attr("class", "gold")
		.attr("cx", winner[0])
		.attr("cy", winner[1])
		.attr("r", 10);
		
		d3.select("#points")
		.append("circle")
		.attr("class", "silver")
		.attr("cx", silver[0])
		.attr("cy", silver[1])
		.attr("r", 10);

        // ******* TODO: PART V *******

        // Add a marker for the winner and runner up to the map.

        // Hint: remember we have a conveniently labeled class called .winner
        // as well as a .silver. These have styling attributes for the two
        // markers.


        // Select the host country and change it's color accordingly.

        // Iterate through all participating teams and change their color as well.

        // We strongly suggest using CSS classes to style the selected countries.


        // Add a marker for gold/silver medalists
    }

    /**
     * Renders the actual map
     * @param the json data with the shape of all countries
     */
    drawMap(world) 
    {	
		var map = d3.select("#map");

		var geopath = d3.geoPath().projection(this.projection);
		
		var countries = topojson.feature(world, world.objects.countries).features;
		
		map.selectAll("path")
		.data(countries)
		.enter()
		.append("path")
		.attr("class", "countries")
		.attr("id", function(d)
		{
			return d["id"];
		})
		.attr("d", geopath);
		
		map.append('path')
        .datum(d3.geoGraticule())
        .attr("class", "grat")
        .attr('d', geopath);
		
        //(note that projection is a class member
        // updateMap() will need it to add the winner/runner_up markers.)

        // ******* TODO: PART IV *******

        // Draw the background (country outlines; hint: use #map)
        // Make sure and add gridlines to the map

        // Hint: assign an id to each country path to make it easier to select afterwards
        // we suggest you use the variable in the data element's .id field to set the id

        // Make sure and give your paths the appropriate class (see the .css selectors at
        // the top of the provided html file)

    }
}
