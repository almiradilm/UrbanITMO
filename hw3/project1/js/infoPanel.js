/** Class implementing the infoPanel view. */
class InfoPanel
{
    /**
     * Creates a infoPanel Object
     */
    constructor() {}

    /**
     * Update the info panel to show info about the currently selected world cup
     * @param oneWorldCup the currently selected world cup
     */
    updateInfo(oneWorldCup)
    {
		var cup = 
		[{
			"edition" : oneWorldCup["EDITION"],
			"host" : oneWorldCup["host"],
			"winner" : oneWorldCup["winner"],
			"silver" : oneWorldCup["runner_up"],
			"teams" : oneWorldCup["teams_names"]
		}];
				
		var spans = d3.select("#details").selectAll("span");
		
		spans.each(function()
		{
			var id = this.id;
						
			var label = d3.select(this).selectAll("label")
			.remove().exit().data(cup);
			
			label.enter().append("label")
			.html(function(d)
			{
				var tmp = "";
				
				if(d[id] instanceof Array)
				{
					d[id].forEach(function(d)
					{
						tmp += d + "<br />";
					})
				}
				else
				{
					tmp = d[id];
				}
				
				return tmp;
			});
		});
        // ******* TODO: PART III *******

        // Update the text elements in the infoBox to reflect:
        // World Cup Title, host, winner, runner_up, and all participating teams that year

        // Hint: For the list of teams, you can create an list element for each team.
        // Hint: Select the appropriate ids to update the text content.

        //Set Labels
    }
}
