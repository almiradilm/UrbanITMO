class Table 
{
    constructor(teamData, treeObject)
    {
        this.tree = treeObject; 

        this.tableElements = teamData.slice();

        this.teamData = teamData;
        
        this.cell = {
            "width": 70,
            "height": 20
        };
		
		this.ascending = false;

        this.goalScale = d3.scaleLinear()
        .range([5, 135]); 

        this.gameScale = d3.scaleLinear()
        .range([0, this.cell.width]); 

        this.aggregateColorScale = d3.scaleLinear()
		.range([d3.rgb("#ece2f0"), d3.rgb("#016450")]); 
    }

    createTable()
    {
		var self = this;
		
		var gamemax = d3.max(this.tableElements, function(d)
		{
			return d.value["TotalGames"]; 
		});
		
		var goalmax = d3.max(this.tableElements, function(d)
		{
			return d.value["Delta Goals"] > 0 ? d.value["Goals Made"] : d.value["Goals Conceded"];
		});
		        
		this.gameScale.domain([0, gamemax]);
		
		this.goalScale.domain([0, goalmax]);
		
		this.aggregateColorScale.domain([0, gamemax]);
				
		var goalAxis = d3.axisTop()
        .scale(this.goalScale);
        
		d3.select("#goalHeader")
		.append("svg")
		.attr("width", 145)
		.attr("height", 20)
		.append("g")
		.attr("transform", "translate(0, 19)")
        .call(goalAxis);
		
		d3.selectAll(".Header")
		.on("click", function()
		{
			self.collapseList();
			
			var header = d3.select(this).text();
		
			var table = self.tableElements;
			
			self.ascending ^= 1;
			
			var ascending = self.ascending;
		
			if (table.length <= 1)
				return;
						
			table.sort(function(a, b)
			{
				var ret = 0;
				
				switch(header)
				{
					case "Team":
						ret = ascending ? d3.ascending(b.key, a.key) : d3.descending(b.key, a.key); break;
					case "Goals":
						ret = ascending ? +b.value["Goals Made"] - +a.value["Goals Made"] : +b.value["Goals Conceded"] - +a.value["Goals Conceded"]; break;
					case "Round/Result":
						ret = ascending ? +b.value.Result.ranking - +a.value.Result.ranking :  +a.value.Result.ranking - +b.value.Result.ranking; break;
					case "Wins":
						ret = ascending ? +b.value["Wins"] - +a.value["Wins"] : +a.value["Wins"] - +b.value["Wins"]; break;
					case "Losses":
						ret = ascending ? +b.value["Losses"] - +a.value["Losses"] : +a.value["Losses"] - +b.value["Losses"]; break;
					case "Total Games":
						ret = ascending ? +b.value["TotalGames"] - +a.value["TotalGames"] : +a.value["TotalGames"] - +b.value["TotalGames"]; break;
					default:
						console.log("?"); break;
				};
				return ret;
			});
			
			self.updateTable();
		});
    }
    
	updateTable() 
    {
		var self = this;
        var cell = this.cell;
        var gameScale = this.gameScale;
        var aggregateColorScale = this.aggregateColorScale;
        var goalColorScale = this.goalColorScale;
        var goalScale = this.goalScale;
                
		var rows = d3.select("#matchTable")
		.select("tbody").selectAll("tr")
		.data(this.tableElements);
		
		rows.exit().remove();
		rows = rows.merge(rows.enter().append("tr"));
		
		rows.on("click", function(row, i)
		{
			self.updateList(i);
		}).on("mouseover", function(row)
		{
			self.tree.updateTree(row);
		}).on("mouseleave", function()
		{
			self.tree.clearTree();
		});
		
		var names = rows.selectAll("th")
		.data(function(row)
		{	
			return [{
				"type": row.value["type"],
				"vis": "text",
				"value": row.key
			}];
		});
				        
		names.exit().remove();
		names = names.merge(names.enter().append("th"));
		names.attr("class", function(d)
		{
			return d.type;
		});
		
		var cells = rows.selectAll("td")
		.data(function(row)
		{	
			var ar = [[row.value["Goals Made"], row.value["Goals Conceded"], row.value["Delta Goals"]],
			row.value["Result"],
			row.value["Wins"],
			row.value["Losses"],
			row.value["TotalGames"]];
			
			return ar.map(function(d, i)
			{
				return {
					"type": row.value["type"],
					"vis": i == 0 ? "goals" : i == 1 ? "text" : "chart",
					"value": d
				};
			});
		})
		
		cells.exit().remove();
		cells = cells.merge(cells.enter().append("td"));
		
		d3.select("tbody").selectAll("svg").remove().exit();
		
		cells.filter(function(d)
		{
			return d.vis === "chart" && d.type === "aggregate";
		}).each(function(d)
		{	
			var svg = d3.select(this).append("svg")
			.attr("width", cell.width)
			.attr("height", cell.height);
			
			var bars = svg.selectAll("rect")
			.remove().exit()
			.data([d]);
			
			bars.enter().append("rect")
			.attr("x", 0)
			.attr("width", gameScale(d.value))
			.attr("y", cell.height/2 - 8)
			.attr("height", 16)
			.attr("fill", aggregateColorScale(d.value));
			
			var labels = svg.selectAll("text")
			.remove().exit()
			.data([d]);
			
			labels.enter().append("text")
			.attr("text-anchor","end")
			.attr("x", gameScale(d.value) - 1)
			.attr("y", cell.height/2 + 5)
			.attr("fill", "white")
			.text(d.value);
		})
				
		cells.filter(function(d)
		{
			return d.vis == "goals";
		}).each(function(d)
		{
			var svg = d3.select(this).append("svg")
			.attr("width", 145)
			.attr("height", cell.height);
			
			var min = d.value[1], max = d.value[0], color = "#4883a5";
			
			if(max < min)
			{
				min = d.value[0];
				max = d.value[1];
				color = "#ea565a";
			}
			
			var delta = svg.selectAll(".delta")
			.remove().exit()
			.data([d]);
						
			var delta_height = d.type === "game" ? 4 : 10;
						
			delta.enter().append("rect")
			.attr("x", goalScale(min))
			.attr("width", goalScale(max) - goalScale(min))
			.attr("y", cell.height/2 - delta_height/2)
			.attr("height", delta_height)
			.attr("class", "delta")
			.style("fill", color);
			
			var made = svg.selectAll(".made")
			.remove().exit()
			.data([d]);
						
			made.enter().append("circle")
			.attr("cx", goalScale(d.value[0]))
			.attr("cy", 10)
			.attr("r", 4)
			.attr("class", "made")
			.style("fill", d.type === "game" ? "white" : "#034e7b")
			.style("stroke-width", 2)
			.style("stroke", "#034e7b");
			
			var conceded = svg.selectAll(".conceded")
			.remove().exit()
			.data([d]);
						
			conceded.enter().append("circle")
			.attr("cx", goalScale(d.value[1]))
			.attr("cy", 10)
			.attr("r", 4)
			.attr("class", "conceded")
			.style("fill", d.type === "game" ? "white" : max === min ? "#999999" : "#cb181d")
			.style("stroke-width", 2)
			.style("stroke", max === min ? "#999999" : "#cb181d");
		})
		
		cells.filter(function(d)
		{
			return d.vis == "text";
		}).each(function(d)
		{
			d3.select(this)
			.text(d.value.label);
		})
		
		names.each(function(d)
		{
			d3.select(this)
			.text((d.type === "game" ? "x" : "") + d.value);
		})
    };

    updateList(i)
    {
		var table = this.tableElements;
		var j;
		
		if(table[i].value.type === "aggregate")
		{
			if(table.length <= 1 || i == table.length - 1 || table[i+1].value.type === "aggregate")
			{
				var data = this.teamData;
				
				for(j = 0; j < data.length; ++j)
					if(data[j].key === table[i].key)
						break;
				
				data[j].value.games.forEach(function(d, k)
				{
					table.splice(i + k + 1, 0, d);
				});
			}
			else
			{
				table.splice(i + 1, table[i].value.games.length);
			}
			this.updateTable();
		}
    }

    collapseList()
    {
        var table = this.tableElements;
        
        for(var i = 0; i < table.length - 1; i++)
			if(table[i].value.type === "aggregate" && table[i+1].value.type != "aggregate")
				table.splice(i + 1, table[i].value.games.length);
    }
}
