let dataset_Countries2012;
let dataset_CountriesByYears;

let sortingOrder = { // true for asc
    name: true,      // false for desc
    continent: true,
    gdp: true,
    life_expectancy: true,
    population: true,
    year: true
};

let cbContinentsState = {
    Americas: false,
    Africa: false,
    Asia: false,
    Europe: false,
    Oceania: false
};

let continentColors = {
    Americas: '#08573C',
    Africa: '#C8CE1A',
    Asia: '#108CB5',
    Europe: '#B43613',
    Oceania: '#5A042E'
};

let desireColumns = ['name', 'continent', 'gdp', 'life_expectancy', 'population', 'year'];

let gdpParseFormatter = (str) =>
    parseFloat(str.replace('.', '').replace('P', '1e15').replace('T', '1e12').replace('G', '1e9').replace('M', '1e6'));
let populationParseFormatter = (str) => parseInt(str.replace(/,/g, ''));
let sorter = (a, b, order) => order ? d3.ascending(a, b) : d3.descending(a, b);

let yearFilter = () => dataset.filter(e => Object.values(cbContinentsState).includes(true) ?
    cbContinentsState[e['continent']] : true);

let changeCursorState = (header) => header ?
    'url(images/down-arrow_2.png), auto' : 'url(images/up-arrow_2.png), auto';

let dataset;

let tableCleaner = (tableBody) => tableBody.selectAll('tr').remove();

let tableDrawer = () => d3.select('body').append('table').attr('class', 'tableClass');
let tableHeadDrawer = (table) =>  table.append('thead').attr('class', 'thead');
let tableBodyDrawer = (table) => table.append('tbody');

let tableCaptionDrawer = (table) => table.append('caption')
    .html("World Countries Ranking")
    .attr('class', 'caption');

function addTableHeaders(thead, tbody) {
    thead.append('tr').selectAll('th')
        .data(desireColumns)
        .enter()
        .append('th')
        .attr('class', 'tableHeaders')
        .text(d => d)
        .on('click', function(header) { tbody
            .selectAll('tr')
            .sort((a, b) => sorting(a, b, header)),
            sortingOrder[header] = !sortingOrder[header],
            colorizeTableInZebraStyle(tbody),
            d3.select(this)
                .style('cursor', () => changeCursorState(sortingOrder[header]))
        })
        .on('mouseover', function (header) {
            d3.select(this)
                .style('cursor', () => changeCursorState(sortingOrder[header]))
        });
}

function drawTableRows(body, columns, data){
    let rows = body.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    rows.selectAll("td")
        .data(row => columns.map((column, i) => row[desireColumns[i]]))
        .enter()
        .append("td")
        .text(d => d)
        .attr('class', 'customCell')
        .on('mouseover', function (d, i) {            // remember this shit, dear reader...
            d3.select(this.parentNode)                // in this place we couldn't use some lambdas. Why?
                .style("background-color", "#F3ED86") // because keyword 'this' in lambdas determined by where lambda
        })                                            // was defined. DEFINED - NOT USED, KARL!
        .on('mouseout', function () {
            body.selectAll('tr')
                .style("background-color", null);
            colorizeTableInZebraStyle(body);
        });
    colorizeTableInZebraStyle(body);
}

function rangeChangeYear(value){
    dataset = changeData(value - d3.select('#rangeYear').property('min'));
    if(needAggregation){
        dataset = aggregate();
    }

    year = value;

    dataset = yearFilter();

    dataset.forEach(o => formatStringRepresent(o));

    let tableBody = d3.select('table').select('tbody');

    tableCleaner(tableBody);
    drawTableRows(tableBody, desireColumns, dataset)
}

function changeData(year) {
    let data = [];

    dataset_CountriesByYears.forEach(x => {
        var a = {};
        a['continent'] = x.continent;
        a['name'] = x.name;
        a['gdp'] = x.years[year].gdp !== null ? x.years[year].gdp : 0.0;
        a['life_expectancy'] = x.years[year].life_expectancy;
        a['population'] = x.years[year].population;
        a['year'] = x.years[year].year;
        data.push(a);
    });

    return data;
}

function drawTable() {
    let table = tableDrawer(),
        thead = tableHeadDrawer(table),
        tbody = tableBodyDrawer(table);

    tableCaptionDrawer(table);
    addTableHeaders(thead, tbody);
    drawTableRows(tbody, desireColumns, dataset);

    colorizeTableInZebraStyle(tbody);
}

function drawTableByAllYears() {
    dataset = changeData(0);
    dataset.forEach(o => formatStringRepresent(o));

    drawTable();
}

function drawTableByOneYear() {
    dataset = dataset_Countries2012;
    dataset.forEach(o => formatStringRepresent(o));

    drawTable();
}

function onCbChanged(continent) {
    cbContinentsState[continent] = d3.select('#cb' + continent).property('checked');

    let tableBody = d3.select("table").select('tbody');

    var data = yearFilter();

    tableCleaner(tableBody);
    drawTableRows(tableBody,
        desireColumns,
        data
    )
}

function onRbChanged(aggregation) {
    dataset = changeData(year - d3.select('#rangeYear').property('min'));
    let data = dataset;
    needAggregation = false;
    if (!d3.select('#rb' + aggregation).property('checked') &&
        d3.select('#rb' + aggregation).attr('value') === 'None' ||
        d3.select('#rb' + aggregation).property('checked') &&
        d3.select('#rb' + aggregation).attr('value') === 'Continent' ){
            data = aggregate();
            needAggregation = true;
    }

    let tableBody = d3.select("table").select('tbody');

    tableCleaner(tableBody);
    data.forEach(x => formatStringRepresent(x));
    drawTableRows(d3.select('table').select('tbody'), desireColumns, data)
}

function aggregate() {
    let nestedRows =  d3.nest()
        .key(d => d['continent'])
        .rollup(leaves => {
            let initial = JSON.parse(JSON.stringify(leaves[0]));
            d3.keys(initial).forEach(key => initial[key] = 0);
            initial.name = initial.continent = leaves[0].continent;
            initial.year = leaves[0].year;

            return leaves.reduce( (prev, curr) => {
                let ans = {};
                d3.keys(prev).forEach(key => {
                    switch (key) {
                        case 'gdp':
                        case 'population':
                            curr[key] = curr[key] !== 0 ? curr[key] : 0.0;
                            ans[key] = prev[key] += curr[key];
                            break;
                        case 'life_expectancy':
                            ans[key] = prev[key] += curr[key] / leaves.length;
                            break;
                        default:
                            ans[key] = prev[key];
                    }
                });
                return ans;
            } , initial);
        },)
        .entries(dataset);

    let ret = [];
    nestedRows.map(e => e.value).forEach(x => ret.push(x));

    // ret.forEach(d => formatStringRepresent(d));
    return ret;
}

function sorting(a, b, header) {
    if (header === 'continent') {
        if(a[header] === b[header])
            return sorter(a['name'], b['name'], sortingOrder[header])
    }
    if (header === 'population') {
        return sorter(populationParseFormatter(a[header]), populationParseFormatter(b[header]), sortingOrder[header])
    }
    if (header === 'gdp') {
        a[header] = a[header].toString();
        b[header] = b[header].toString();
        return sorter(gdpParseFormatter(a[header]), gdpParseFormatter(b[header]), sortingOrder[header])
    }
    return sortingOrder[header] ? d3.ascending(a[header], b[header]) : d3.descending(a[header], b[header]);
}

function colorizeTableInZebraStyle(tbody) {
    tbody.selectAll('tr')
        .each(function (d, i) {
            d3.select(this)
                .attr('class', (i % 2 === 0) ? 'odd' : 'even')
        })
}

function formatStringRepresent(str) {
    str.population = d3.format(',')(str.population);
    str.life_expectancy = d3.format('.1f')(str.life_expectancy);

    if(str.gdp < 1e9)
        str.gdp = d3.formatPrefix(',.1', 1e6)(str.gdp);
    if(str.gdp >= 1e9 && str.gdp < 1e12)
        str.gdp = d3.formatPrefix(',.1', 1e9)(str.gdp);
    if(str.gdp >= 1e12 && str.gdp < 1e15)
        str.gdp = d3.formatPrefix(',.1', 1e12)(str.gdp);
    if(str.gdp >= 1e15)
        str.gdp = d3.formatPrefix(',.1', 1e15)(str.gdp);
}

//------------------------------------BARCHART---------------------------------------------------------------------

let year = 1995;
let needAggregation = false;

function drawChart() {
    dataset = changeData(0);

    var margin = {top: 50, bottom: 10, left:50, right: 40};
    var width = 1000 - margin.left - margin.right;
    var bar_height = 15;
    var height = bar_height*dataset.length - margin.top - margin.bottom;

    var xScale = d3.scaleLinear().range([0, width]);
    var yScale = d3.scaleBand().rangeRound([0, height], .8, 0);

    var svg = d3.select("body").append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom);

    var max = d3.max(dataset, function(d) { return d.population; } );
    var min = 0;

    xScale.domain([min, max]);
    yScale.domain(dataset.map(function(d) { return d.name; }));

    var bar = svg.selectAll('g')
        .data(dataset)
        .enter().append('g')
        .attr('transform', function(d, i) { return "translate(0," + i * bar_height + ")"; });

    bar.append('rect').transition().duration(1000)
        .attr('width', function(d) { return xScale(d.population); })
        .attr('height', bar_height - 1)
        .attr('x', 150)
        .attr('fill', function(d) { return continentColors[d.continent] });

    bar.append('text')
        .text(function(d){
            return d.name;
        })
        .attr('y', function(d, i){
            return i + 9;
        });
}

function rangeChangeYearForChart(value){
    if(needAggregation){
        dataset = changeData(value - d3.select('#rangeYear').property('min'));
        dataset = aggregate();
    }
    else
        dataset = changeData(value - d3.select('#rangeYear').property('min'));

    year = value;
    updateBarChart(yearFilter());

    setSortByDefault();
}

function onCbChangedForChart(continent) {
    cbContinentsState[continent] = d3.select('#cb' + continent).property('checked');
    updateBarChart(yearFilter());

    setSortByDefault();
}

function onRbChangedForChart(aggregation) {
    dataset = changeData(year - d3.select('#rangeYear').property('min'));
    let data = dataset;
    needAggregation = false;
    if (!d3.select('#rb' + aggregation).property('checked') &&
        d3.select('#rb' + aggregation).attr('value') === 'None' ||
        d3.select('#rb' + aggregation).property('checked') &&
        d3.select('#rb' + aggregation).attr('value') === 'Continent' ){
        data = aggregate();
        needAggregation = true;
    }
    updateBarChart(data);

    setSortByDefault();
}

function updateBarChart(data){
    var margin = {top: 50, bottom: 10, left:50, right: 40};
    var width = 1600 - margin.left - margin.right;
    var bar_height = 15;
    var height = bar_height*data.length - margin.top - margin.bottom;
    var xScale = d3.scaleLinear().range([0, width]);
    var yScale = d3.scaleBand().rangeRound([0, height], .8, 0);

    var svg = d3.select("svg")
        .attr("height", height+margin.top+margin.bottom);

    var max = d3.max(data, function(d) { return d.population; } );
    var min = 0;

    xScale.domain([min, max]);
    yScale.domain(data.map(function(d) { return d.name; }));

    var old_bar = svg.selectAll('g')
        .data(data);

    old_bar.select('rect').transition().duration(1000)
        .attr('width', function(d) { return xScale(d.population); })
        .attr('fill', function(d) { return continentColors[d.continent]})
        .attr('height', bar_height - 1)
        .attr('x', 150);

    old_bar.select('text')
        .text(function(d){
            return d.name;
        })
        .attr('class', 'lable');

    old_bar.exit().transition().duration(200).remove();
    old_bar.selectAll('text').remove();

    var new_bar = svg.selectAll('g')
        .data(data);

    new_bar.enter().append('g').attr('transform', function(d, i) { return "translate(0," + i * bar_height + ")"; })
        .append('rect').transition().duration(1000)
        .attr('fill', function(d) { return continentColors[d.continent] })
        .attr('width', function(d) { return xScale(d.population); })
        .attr('height', bar_height - 1)
        .attr('x', 150);

    svg.selectAll('g').append('text')
        .text(function(d){
            return d.name;
        })
        .attr('y', function(d, i){
            return i + 9;
        })
}

function onSortOrderChanged(value) {
    var d = yearFilter();

    d.sort((a, b) => d3.descending(a[value], b[value]));

    updateBarChart(d);
}

let setSortByDefault = () => d3.select('#defaultSort').property('checked', true);
