class Tree
{
    constructor() {}

    createTree(treeData) 
    {
		var treemap = d3.tree().size([800, 300]);
		        
		var tree = d3.stratify()
		.id(function(d)
		{
			return d.id;
		})
		.parentId(function(d)
		{
			return d.ParentGame;
		})
		(treeData);

		var nodes = d3.hierarchy(tree, function(d)
        {
			return d.children;
		});
		
		nodes = treemap(nodes);
				
		var g = d3.select("#tree")
		.attr("transform", "translate(100, 0)");
		
		var link = g.selectAll(".link")
		.data( nodes.descendants().slice(1))
		.enter().append("path")
		.attr("class", "link")
		.attr("d", function(d)
		{
			return "M" + d.y + "," + d.x
			 + "C" + (d.y + d.parent.y) / 2 + "," + d.x
			 + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
			 + " " + d.parent.y + "," + d.parent.x;
		});
       
		var node = g.selectAll(".node")
		.data(nodes.descendants())
		.enter().append("g")
		.attr("class", function(d)
		{
			return "node" + (d.parent && d.data.data.Team != d.parent.data.data.Team ? "" : " winner");
		})
		.attr("transform", function(d)
		{
			return "translate(" + d.y + "," + d.x + ")";
		});

		node.append("circle")
		.attr("r", 5);

		node.append("text")
		.attr("dy", ".35em")
		.attr("x", function(d)
		{
			return d.children ? -13 : 13;
		})
		.style("text-anchor", function(d)
		{ 
			return d.children ? "end" : "start";
		})
		.text(function(d)
		{
			return d.data.data.Team;
		});
    };

    updateTree(row) 
    {
        d3.selectAll(".link").filter(function(d)
        {
			if(row.value.type === "aggregate")
				return d.data.data.Team === row.key && d.parent.data.data.Team === row.key;
			else
			{
				return (d.parent.children[0].data.data.Team === row.key && d.parent.children[0].data.data.Opponent === row.value.Opponent) ||
				(d.parent.children[1].data.data.Team === row.key && d.parent.children[1].data.data.Opponent === row.value.Opponent);
			}
		})
		.attr("class", "link selected");
		
        d3.selectAll(".node").selectAll("text").filter(function(d)
        {
			if(row.value.type === "aggregate")
				return d.data.data.Team === row.key;
			else
				return (d.data.data.Team === row.key && d.data.data.Opponent === row.value.Opponent) ||
				(d.data.data.Team === row.value.Opponent && d.data.data.Opponent === row.key);
		})
		.attr("class", "selectedLabel");
    }

    clearTree() 
    {
		d3.selectAll(".selected").attr("class", "link");
		d3.selectAll(".selectedLabel").attr("class", null);
    }
}
