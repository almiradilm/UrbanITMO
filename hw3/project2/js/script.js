d3.csv("data/fifa-matches.csv", function (error, matchesCSV) 
{
	function ranking(arg)
	{
		var result = 0;
		switch(arg)
		{
			case "Round of Sixteen": result = 1; break;
			case "Quarter Finals": result = 2; break;
			case "Semi Finals": result = 3; break;
			case "Fourth Place": result = 4; break;
			case "Third Place": result = 5; break;
			case "Runner-Up": result = 6; break;
			case "Winner": result = 7; break;
			default: break;
		};
		return result;
	}
	
	var data = d3.nest()
    .key(function (d)
    {
        return d["Team"];
    })
    .rollup(function (leaves)
    {
        return {
			"Goals Made": d3.sum(leaves, function(l) { return l["Goals Made"]; }),
			"Goals Conceded": d3.sum(leaves, function(l) {return l["Goals Conceded"];}),
			"Delta Goals": d3.sum(leaves, function(l) {return l["Delta Goals"];}),
			"Wins": d3.sum(leaves, function(l) {return l["Wins"];}),
			"Losses": d3.sum(leaves, function(l) {return l["Losses"];}),
			"Result": leaves.reduce(function(prev, current)
			{
				var tmp = {"label" : current["Result"], "ranking": ranking(current["Result"])};
				return tmp.ranking > prev.ranking ? tmp : prev;
			}, {"label": "Group", "ranking": 0}),
			"TotalGames": leaves.length,
			"games": d3.nest()
			.key(function (d)
			{
				return d["Opponent"];
			})
			.rollup(function (l)
			{
				return {
					"Goals Made": l[0]["Goals Made"],
					"Goals Conceded": l[0]["Goals Conceded"],
					"Delta Goals": [],
					"Wins": [],
					"Losses": [],
					"Result": {"label": l[0]["Result"], "ranking": ranking(l[0]["Result"])},
					"type": "game",
					"Opponent": l[0]["Team"]
				};
			})
			.entries(leaves),
			"type": "aggregate"
		};
	})
    .entries(matchesCSV);

	d3.csv("data/fifa-tree.csv", function (error, csvData)
    {
		csvData.forEach(function (d, i)
		{
            d.id = d.Team + d.Opponent + i;
        });
		
		csvData.forEach(function (d, i, ar)
		{
			if(d.ParentGame)
				d.ParentGame = ar[+d.ParentGame].id;
        });
		
        var tree = new Tree();
        tree.createTree(csvData);

        var table = new Table(data,tree);

        table.createTable();
        table.updateTable();
	});
});
