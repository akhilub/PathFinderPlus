function getSnapToRoadLocationHere([lat, lon])  {
    /*
    Uses here.com API to determine the nearest location on a road from a given location.
    See https://developer.here.com/documentation/routing-api/8.21.6/api-reference-swagger.html 
        
    There doesn't appear to be a "snap to road" or "nearest" function.
    This is hacky, but you can get snapped locations by routing from 
    a location to itself.

    Example Use:
        [status, latLonAlt] = getSnapToRoadLocationHere([52.5308, 13.3847])	
    */

    var shapeUrl = 'https://router.hereapi.com/v8/routes?' + 
        'apiKey=' + here_api_key + 
        '&transportMode=' + 'car' + 
        '&origin=' + lat + ',' + lon + 
        '&destination=' + lat + ',' + lon + 
        '&return=' + 'polyline' + ',' + 'elevation';
        
    var myStatus = 0;
    var latLonAlt = [lat, lon, 0];
    
    $.ajax({
        url: shapeUrl,
        dataType: 'json',
        async: false,
        success: function (data){
            myStatus = 1;
            var loc = data.routes[0]['sections'][0]['departure']['place']['location'];
            latLonAlt = [loc.lat, loc.lng, loc.elv];
        },
        error: function (request, status, error) {
            console.log('error');
            console.log(request, status, error);

            myStatus = 0;			
        }
    });	
    
    return [myStatus, latLonAlt];		
}
	
function getRoadRouteHere(origLatLon, destLatLon, via=[], transportMode='car')  {
    /*
    Uses here.com API to determine turn-by-turn road route from an origin to a destination.
    See https://developer.here.com/documentation/routing-api/8.21.6/api-reference-swagger.html 
    
    Inputs:
        origLatLon:  A list, of the form [lat, lon], describing the starting location.
        destLatLon:  A list, of the form [lat, lon], describing the ending location.
        transportMode:  A string.  Mode of transport to be used for the calculation of the route.
                        Valid options include "car" (default), "truck", "pedestrian", "bicycle", "scooter", "taxi", "bus"

                        Note: bus and taxi modes are currently provided as Beta, with limited functionality. The API and behaviour may change drastically, or even become unsupported, without warning. The functionality only allows pick-up and drop-off inside the bus-only / taxi-only areas. Please refer to the developers' guide for more details.

    Returns:
        [status, polyline, lenMeters]
            status:   An integer.  1 --> here.com found a route, 0 --> we simply return a straight line from orig to dest.
            polyline:  A list of lists, of the form [[lat, lon, alt], [lat, lon, alt], ...].  The altitude might not be included.
            lenMeters:  Float.  Length of the route in meters.
            
    Example Use:
        [status, polyline, lenMeters] = getRoadRouteHere([52.5308, 13.3847], [52.5264, 13.3686])	
    */
    
    var shapeUrl = 'https://router.hereapi.com/v8/routes?' + 
        'apiKey=' + here_api_key + 
        '&transportMode=' + transportMode + 
        '&origin=' + origLatLon[0] + ',' + origLatLon[1] + 
        '&destination=' + destLatLon[0] + ',' + destLatLon[1];
    if(via.length > 0){
        shapeUrl += '&via=' + via[0] + ',' + via[1]; // Assuming only one intermediate waypoint
        shapeUrl += '&return=' + 'polyline' + ',' + 'passthrough' + ',' + 'elevation' + ',' + 'travelSummary';
    }else{
        shapeUrl += '&return=' + 'polyline' + ',' + 'elevation' + ',' + 'travelSummary';
    }
    
    console.log(shapeUrl);
    var polyline = [];
    var myStatus = 0;
    var lenMeters = 0;
    var routeCode;
    var duration = 0;
    
    $.ajax({
        url: shapeUrl,
        dataType: 'json',
        async: false,
        success: function (data){
            for(i=0; i<data.routes[0]['sections'].length; i++){
                routeCode = data.routes[0]['sections'][i]['polyline'];
                polyline = polyline.concat(decode(routeCode).polyline);
                lenMeters += data.routes[0]['sections'][i]['travelSummary']['length'];
                duration += data.routes[0]['sections'][i]['travelSummary']['duration'];
            }
            // routeCode = data.routes[0]['sections'][0]['polyline'];
            // polyline = decode(routeCode).polyline;
            // lenMeters = data.routes[0]['sections'][0]['travelSummary']['length']
            myStatus = 1;
        },
        error: function (request, status, error) {
            console.log('error');
            console.log(request, status, error);

            // We'll just create a straight line from origin to destination.
            polyline = [origLatLon, destLatLon];
            myStatus = 0;

            console.log('FIXME -- Need to calculate the length of the straight line.')	
            // lenMeters = ???;
        }
    });	
    
    return [myStatus, polyline, lenMeters, duration, routeCode];
}

function getIsolineHere([lat, lon], rangeType, rangeValues, isOrigin=true, transportMode='car')  {
    // See https://developer.here.com/documentation/isoline-routing-api/8.4.0/dev_guide/topics/send-request.html 
    // https://developer.here.com/documentation/isoline-routing-api/8.4.0/api-reference-swagger.html 
    
    /*
    rangeType: Specifies the range of values to be included in the isoline.
        Range[type] : Specifies the type of range. Possible Values:
            'distance' with units in meters
            'time' with units in seconds
            'consumption' with units in Wh
    rangeValues:
        Range[values] : A comma-separated list of ranges. The unit is defined by the type parameter. 

    Example Use:
        [status, ???] = getIsolineHere([52.5308, 13.3847], 'distance', [30, 50], true, 'car')

    */	
        
    
    var isoUrl = 'https://isoline.router.hereapi.com/v8/isolines?' + 
        'apiKey=' + here_api_key + 
        '&transportMode=' + transportMode + 
        '&range[type]=' + rangeType + 
        '&range[values]=' + rangeValues.join(',') +
        '&origin=' + lat + ',' + lon;	

    console.log(isoUrl);
    
    var myData = {};
    
    $.ajax({
        url: isoUrl,
        dataType: 'json',
        async: false,
        success: function (data){
            myData = data;
            myStatus = 1;

            for (i=0; i < rangeValues.length; i++)  {
                console.log('range:' + rangeValues[i]);
                console.log(data['isolines'][i]['range']['value']);
                console.log(decode(data['isolines'][i]['polygons'][0]['outer']).polyline);				
            }

                                            
        },
        error: function (request, status, error) {
            console.log('error');
            console.log(request, status, error);

            // We'll just create a straight line from origin to destination.
            myStatus = 0;
        }
    });	

    // FIXME -- Not sure what to return
    return [myStatus, myData];
}

function searchIntermediatePlaces (queryText, bbox, searchLimit, routeOptions=false){
    // Searching in a radius at a given lat lon
    // example: https://discover.search.hereapi.com/v1/discover?apiKey=O9Hg9mex8CfcyrMbryKAtSANkpNQAZ_yjUKDyapEEmY&q=Insomnia%20Cookies&in=circle:42.99981911246973,-78.7891529772581;r=2000&limit=5
    var discoverUrl;
    if(routeOptions){
        discoverUrl = 'https://discover.search.hereapi.com/v1/discover?' + 
            'apiKey=' + here_api_key + 
            '&q=' + queryText +
            '&limit=' + searchLimit +
            '&in=bbox:' + bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3] +
            '&route=' + routeOptions['route'] + ';' +
            'w=' + routeOptions['width'];
    }
    // }else{
    //     discoverUrl = 'https://discover.search.hereapi.com/v1/discover?' + 
    //         'apiKey=' + here_api_key + 
    //         '&q=' + queryText +
    //         '&in=circle:' + lat + ',' + lon + ';' +
    //         'r=' + radiusMeters +
    //         '&limit=' + searchLimit;
    // }
    console.log(discoverUrl);
    var searchResults = {};
    
    $.ajax({
        url: discoverUrl,
        dataType: 'json',
        async: false,
        success: function (data){
            console.log('found '+ data['items'].length + ' locations');
            for(i=0; i<data['items'].length; i++){
                searchResults[i] = {};
                searchResults[i]['title'] = data['items'][i]['title'];
                searchResults[i]['address'] = data['items'][i]['address']['label'];
                searchResults[i]['location'] = data['items'][i]['position'];
                if(data['items'][i]['isOpen'] == 'true'){
                    searchResults[i]['isOpen'] = 'Open';
                }else{
                    searchResults[i]['isOpen'] = "Closed";
                }
            }
            myStatus = 1;
        },
        error: function (request, status, error) {
            console.log('error');
            console.log(request, status, error);

            // We'll just create a straight line from origin to destination.
            polyline = [origLatLon, destLatLon];
            myStatus = 0;
            // lenMeters = ???;
        }
    });
    return [myStatus, searchResults];
}