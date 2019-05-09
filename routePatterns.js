/*
Written by Joshua Fabian
Last updated 25 Jan 2019
jfabian@mbta.com
*/

apiKey = config.PERFORMANCE_API_KEY

var time = document.getElementsByClassName('timeField'); //Get all elements with class "time"
for (var i = 0; i < time.length; i++) { //Loop trough elements
    time[i].addEventListener('keyup', function (e) {; //Add event listener to every element
        var reg = /[0-9]/;
        if (this.value.length == 2 && reg.test(this.value)) this.value = this.value + ":"; //Add colon if string length > 2 and string is a number 
        if (this.value.length > 5) this.value = this.value.substr(0, this.value.length - 1); //Delete the last digit if string length > 5
    });
};

var stationArray = []
var routeArray = []
var routePatternArray = []
var map = null
var currentMarkers = []

var stationSelectorString = 'Select route <select id="stationInput">'

jQuery(document).ready(function($) {
    $.ajax({
        url: 'route_patterns.csv',
        async: false,
        success: function (csvd) {
            stationJson = $.csv.toArrays(csvd);
            var display = '';
            console.log(stationJson)
            for (j = 1; j < stationJson.length; j++) {
                newStation = {
                    route_pattern_id: stationJson[j][0],
                    route_id: stationJson[j][1],
                    direction_id: stationJson[j][2],
                    route_pattern_name: stationJson[j][3],
                    route_pattern_time_desc: stationJson[j][4],
                    route_pattern_typicality: stationJson[j][5],
                    representative_trip_id: stationJson[j][7],
                };
                routePatternArray.push(newStation)
            }
        }
    });
});

console.log(routePatternArray)

jQuery(document).ready(function($) {
    $.ajax({
        url: 'routes.csv',
        async: false,
        success: function (csvd) {
            stationJson = $.csv.toArrays(csvd);
            var display = '';
            var stationSelectorString = 'Select route <select id="stationInput">'

            // iterate over all observed headways at this station
            console.log(stationJson)
            for (j = 1; j < stationJson.length; j++) {
                var route_id = stationJson[j][0];
                var route_name = stationJson[j][3];
                if (stationJson[j][2] != "") {
                    route_name = stationJson[j][2];
                }
                newStation = {
                    route_id: stationJson[j][0],
                    route_short_name: stationJson[j][2],
                    route_long_name: stationJson[j][3],
                    route_url: stationJson[j][7],
                    route_color: stationJson[j][8],
                    route_text_color: stationJson[j][9],
                    line_id: stationJson[j][11],
                    listed_route: stationJson[j][12],
                    route_desc: stationJson[j][4],
                    route_fare_class: stationJson[j][5],
                };
                stationSelectorString = stationSelectorString + '<option value="' + route_id + '">' + route_name + '</option>';
                routeArray.push(newStation)
            }
            console.log(routeArray)
            stationSelectorString = stationSelectorString + '</select>   <button onclick="nextStationUpdate()">View route patterns for selected route</button>';
            document.getElementById('stationSelector').innerHTML = stationSelectorString;
        }
    });
});

console.log(routeArray)


function nextStationUpdate() {
    document.getElementById("stationHeader").innerHTML = '';

    setTimeout(function() {
        // parse input date into epoch time, set beginning and ending time to search
        // by default, we search from 04:00 of chosen day until 03:00 next morning

        // also obtain a reference midnight time so that epoch times can be later converted
        // into generic seconds from midnight
        var e = document.getElementById('stationInput');
        var stationInput = e.options[e.selectedIndex].value;
        var stationName = '';
        var stationLat = '';
        var stationLon = '';
        console.log(stationInput)


        var route_id = stationInput;
        var route_short_name = '';
        var route_long_name = '';
        var route_color = '';
        var route_text_color = '';
        var route_desc = '';
        var route_fare_class = '';
        var route_url = '';
        var listed_route = '';

        for (var i = 0; i < routeArray.length; i++) { //Loop trough elements
            listed_route_text = "";
            if (routeArray[i]['listed_route'] == 1) {
                listed_route_text = "<b><i>THIS ROUTE IS HIDDEN FROM ROUTES LIST</i></b>"
            }
            if (routeArray[i]['route_id'] == route_id) {
                route_short_name = routeArray[i]['route_short_name'];
                route_long_name = routeArray[i]['route_long_name'];
                route_color = routeArray[i]['route_color'];
                route_text_color = routeArray[i]['route_text_color'];
                route_desc = routeArray[i]['route_desc'];
                route_fare_class = routeArray[i]['route_fare_class'];
                route_url = routeArray[i]['route_url'];
                listed_route = listed_route_text;
            }
        };

        matchedRoutePatternArray = []
        for (var i = 0; i < routePatternArray.length; i++) { //Loop trough elements
            if (routePatternArray[i]['route_id'] == route_id) {
                route_pattern_typicality = ""
                route_pattern_typicality = "Regular pattern for this route"
                if (routePatternArray[i]['route_pattern_typicality'] == 0) {
                    route_pattern_typicality = "Undefined"
                }
                if (routePatternArray[i]['route_pattern_typicality'] == 2) {
                    route_pattern_typicality = "Deviation from regular pattern for this route"
                }
                if (routePatternArray[i]['route_pattern_typicality'] == 3) {
                    route_pattern_typicality = "Highly-atypical pattern for this route"
                }
                if (routePatternArray[i]['route_pattern_typicality'] == 4) {
                    route_pattern_typicality = "Irregular service (planned detours, snow routes, bus shuttles)"
                }

                routePatternMatch = {
                    route_pattern_id: routePatternArray[i]['route_pattern_id'],
                    route_id: routePatternArray[i]['route_id'],
                    direction_id: routePatternArray[i]['direction_id'],
                    route_pattern_name: routePatternArray[i]['route_pattern_name'],
                    route_pattern_time_desc: routePatternArray[i]['route_pattern_time_desc'],
                    route_pattern_typicality: route_pattern_typicality,
                    representative_trip_id: routePatternArray[i]['representative_trip_id'],
                }
                matchedRoutePatternArray.push(routePatternMatch)
            }
        };

        setTimeout(function(){
            route_url_part = '';
            if (route_url != '') {
                route_url_part = '<br>Route URL: <b><a href="' + route_url + '">' + route_url + '</a></b>'
            }
            route_header_part = '<br><div style="background-color: #' + route_color + ' !important ; padding: 6px; border-radius: 8px; color: #' + route_text_color + ' !important;><span style="font-size: 30px !important;>Route: <b>' + route_short_name + ' ' + route_long_name + '</b><br><br>Level of service provided: <b>' + route_desc + '</b><br>Level of fare required: <b>' + route_fare_class + '</b>' + route_url_part + '<br>' + listed_route + '</span></div>';
            route_pattern_part = '';

            for (var i = 0; i < matchedRoutePatternArray.length; i++) {
                route_pattern_time_desc_part = '';
                if (matchedRoutePatternArray[i]['route_pattern_time_desc'] != '') {
                    route_pattern_time_desc_part = '<br>Restricted hours of service: <b>' + matchedRoutePatternArray[i]['route_pattern_time_desc'] + '</b>'
                }
                route_pattern_part = route_pattern_part + '<br><div style="background-color: #165C96 !important ; padding: 6px; border-radius: 8px; color: white !important;><span style="font-size: 30px !important;>Route pattern name: <b>' + matchedRoutePatternArray[i]['route_pattern_name'] + '</b><br><br>Route pattern ID: <b>' + matchedRoutePatternArray[i]['route_pattern_id'] + '</b>' + route_pattern_time_desc_part + '<br>Typicality: <b>' + matchedRoutePatternArray[i]['route_pattern_typicality'] + '</b><br>Representative trip ID: <b><a href="https://api-v3.mbta.com/schedules?filter[trip]=' + matchedRoutePatternArray[i]['representative_trip_id'] + '">' + matchedRoutePatternArray[i]['representative_trip_id'] + ' (link to API stops)</a></b></span></div>'
            }
            document.getElementById('map').innerHTML = route_header_part + route_pattern_part
        }, 1000);
    }, 100);
};

// GOOD SOURCES
// http://stackoverflow.com/questions/30093786/jquery-how-to-automatically-insert-colon-after-entering-2-numeric-digits
// http://www.d3noob.org/2013/01/format-date-time-axis-with-specified.html
//
