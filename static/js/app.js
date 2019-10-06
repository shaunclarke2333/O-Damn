
var MaleOrFemaleChart = dc.pieChart('#male-female-chart');
var RaceChart = dc.pieChart('#race-chart');
var DrugChart = dc.barChart('#bar-chart');
var WeekChart = dc.rowChart('#week-chart');
var AgeChart = dc.pieChart('#age-chart');
var DrugCount = dc.dataCount('.dc-data-count');
var DrugTable = dc.dataTable('.dc-data-table');

d3.csv("/static/data/ConnecticutAccidentalDeath.csv").then(function (data) {
    console.log(data)

    var dateFormatSpecifier = '%m/%d/%Y';
    var dateFormat = d3.timeFormat(dateFormatSpecifier);
    var dateFormatParser = d3.timeParse(dateFormatSpecifier);
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.parsed_date = dateFormatParser(d.Date);
        d.month = d3.timeMonth(d.parsed_date); // pre-calculate month for better performance
        d.age = +d.Age;
        d.count = +d.CountOfDrugs;
    });


    var ndx = crossfilter(data);
    var all = ndx.groupAll();
    
    //returning Full year
    var yearlyDimension = ndx.dimension(function (d) {
        return d3.timeYear(d.parsed_date).getFullYear();
    });

    
    //Dimension by full date
    var dateDimension = ndx.dimension(function (d) {
        return d.parsed_date;
    });

    //Dimension by month
    var moveMonths = ndx.dimension(function (d) {
        return d.month;
    });
    

    //Create Gender Dimension
    var MaleOrFemale = ndx.dimension(function (d) {
        return d.Sex;
    });

    //Produce counts records in the dimension
    var MaleOrFemaleGroup = MaleOrFemale.group();

    //Create Race Dimension
    var race = ndx.dimension(function (d){
        return d.Race
    })

    var raceGroup = race.group();

    //Counts per weekday
    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.parsed_date.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });

    var dayOfWeekGroup = dayOfWeek.group();

    //Create Dimension drugs
    var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
        return d.count;
    });

    var age = ndx.dimension(function (d) {
        var actual_age = d.Age
        if (actual_age <= 25) {
            return 'Youth';
        } else if (actual_age > 25 && actual_age <= 35) {
            return 'Young Adult';
        } else if (actual_age > 35 && actual_age <= 65) {
            return 'Middle Age';
        } else {
            return 'Senior';
        }
    });
    var AgeGroup = age.group().reduceSum(function (d) {
        return d.count;
    });

    MaleOrFemaleChart
    .width(180)
    .height(180)
    .radius(80)
    .dimension(MaleOrFemale)
    .group(MaleOrFemaleGroup)
    .label(function (d) {
        if (MaleOrFemaleChart.hasFilter() && !MaleOrFemaleChart.hasFilter(d.key)) {
            return d.key + '(0%)';
        }
        var label = d.key;
        if (all.value()) {
            label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
        }
        return label;
    })

    RaceChart
    .width(180)
    .height(180)
    .radius(80)
    .dimension(race)
    .group(raceGroup)

    AgeChart
    .width(180)
    .height(180)
    .radius(80)
    .dimension(age)
    .group(AgeGroup)
    .innerRadius(30)

    WeekChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
        .width(200)
        .height(200)
        .margins({top: 20, left: 30, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            return d.key.split('.')[1];
        })
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(6);

        DrugCount 
        .crossfilter(ndx)
        .groupAll(all)
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });
    DrugChart
        .width(990)
        .height(400)
        .margins({top: 30, right: 50, bottom: 50, left: 50})
        .dimension(moveMonths)
        .group(monthlyMoveGroup)
        .centerBar(false)
        .gap(1)
        .x(d3.scaleTime().domain([new Date(2012, 0, 1), new Date(2018, 11, 31)]))
        .round(d3.timeMonth.round)
        .xUnits(d3.timeMonths)
        .mouseZoomable(true)
        .xAxisLabel('Years')
        .yAxisLabel('# of Drugs')

    DrugTable 
        .dimension(dateDimension)
        .section(function (d) {
            var format = d3.format('02d');
            return d3.timeYear(d.parsed_date).getFullYear() + '/' + format((d.parsed_date.getMonth() + 1));
        })
        .columns(['Date','Age','Sex','Race','COD'])

    // map

    /*                             */
/* Initialize the maps objects */
/*                             */

// Configurations => API keys, etc
var apiKey = "pk.eyJ1IjoiZ2wwYmUzNjB0cm90dGVyIiwiYSI6ImNqeXZ2cDZzbjBlbmozbHBleDZoMncwbGEifQ.WP92mvLKR1EwD6VELELF3Q";

// Make the initial map 41.6032° N, 73.0877° W
var mymap = L.map('mapid').setView([41.6573, -72.6566], 12);

// var csvDataPts = "/MAP_boilerplate/db/ConnecticutAccidentalDeath.csv";

// Initial Layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.streets',
    accessToken: apiKey
}).addTo(mymap);


// Grab the data from the Earthquake Data Provider using d3 JSON
d3.csv('ConnecticutAccidentalDeath.csv')
.then(
    function(data) {
        console.log('Successfully fetched the data from the ConnecticutAccidentalDeath csv:', data);
        
        var death_data = data.map(function (d) {
            return {
                ID: d.ID,
                Age: d.Age,
                DC: d.DeathCity,
                DCLat: d.DCLat,
                DCLong: d.DCLong,
                RC: d.ResidenceCity,
                // RCLat: d.RCLati,
                // RCLong: d.RCLong,
                COD: d.COD
            }
        })
        console.log('Transform:', death_data);
            // console.log('eq_data_compact:', eq_data_compact);
        // Create CircleMarker points layer
        
        // forEach L.circleMarker(death_data,L.latLng(death_data.DCLat,death_data.DCLong),radius=10, color='#0000FF',fillColor='CC2EFA',
        //     fillOpacity=0.5).addTo(mymap);
        // var marker = L.marker([51.5, -0.09]).addTo(mymap);

        var markers = L.markerClusterGroup();

        // Loop through data
        for (var i = 0; i < death_data.length; i++) {

            // Set the data location property to a variable
            // {
            //     'type': 'Point',
            //     'coordinates': [death_data[i].DCLat, death_data[i].DCLong]
            // }

            // Check to see if there is a Lat/Long coordinate

            try {
                var location = {
                    'type': 'Point',
                    'coordinates': [+death_data[i].DCLat, +death_data[i].DCLong]
                }
    
                // Check for location property
                if (location) {
                    // console.log('location:', location);
    
                    // Add a new marker to the cluster group and bind a pop-up
                    markers.addLayer(L.marker([location.coordinates[0], location.coordinates[1]])
                    .bindPopup(
                        'Age: ' + death_data[i].Age + '</br>' +'COD:' + death_data[i].COD + '</br>' + 'City of residence: ' + death_data[i].RC
                        + '</br>' + 'City at death: ' + death_data[i].DC)
                        );
                }
            }
            catch {
                console.log('Error with data:', death_data[i]);
            }

        }

        // Add our marker cluster layer to the map
        mymap.addLayer(markers);
        }
    )


// Render the map

// // Render the map
  
    dc.renderAll();

   


    })


   



