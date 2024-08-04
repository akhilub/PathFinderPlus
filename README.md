# PathFinder Plus: Your Smart Route Companion

## About 
PathFinder Plus is an innovative web application that enhances your journey planning experience. It allows you to discover and explore points of interest along your route, making every trip more exciting and efficient. With PathFinder Plus, you can:

1.Plan your route between two locations
2.Search for specific places or amenities along your path
3.Customize your search radius to find nearby attractions
4.View detailed information about each point of interest
5.Optimize your journey by including multiple stops
6.Whether you're planning a road trip, looking for convenient pit stops, or exploring a new area, PathFinder Plus helps you make the most of your travels. Say goodbye to missed opportunities and hello to smarter, more enjoyable journeys!

---

## 
This is an exercise/project for a data visualization and optimization. With the goal of learning how to visualize geospatial data with Cesium, this web application emulates a simplified routing application from start to destination, while also allowing the user to search for places near the route as an intermediate stop. The route is finalized once the user selects the intermediate waypoint they desire.


The web pages are all defined in `index.html`. For simplicity, I have implemented almost all back-end functionality inside `index.html` as well. 
You may visit:

https://search-enroute.vercel.app 

## Storyboard

The initial design of the web app is documented in the `Storyboard.docx` Word document. The actual implementation of the web pages and turned out somewhat different. See https://github.com/akhilub/search-enroute/blob/main/Storyboard.docx 

---

## Deployment
The project has been shifted from the local server to Vercel, aiming for seamless deployment directly from the main branch

---

## Future Work

There are many areas for improvement and future work described in the sections below.For more details checkout the issues

### Web Design

The design and layout of the web pages, mainly the top menu and a couple windows need work. Ideally, the pages should be designed to work well for both mobile and desktop and this was most of the difficulty. 

- Layout of the header menu 
- Layout of the buttons, dropdowns inside the menu
- Consistent 'back' button option? 

A particular challenge to the flow of this web app involves the final stage where the user must confirm the search result location that is selected, to finalize the route. We tried to use Cesium's `infoBox` and embed a button which would then call a JavaScript function. The button can be embedded, however, the function was not visible to the html of the `infoBox`.

A workaround was made by placing our own html element right above the `infoBox` when a search location is selected, where the additional duration is displayed, and the button to confirm. The layout of this html element is not quite right, especially on mobile. This could use a fix.

### Select Destination by Search

We did not get to impelmenting the destination selection by text input. This would be a nice addition as well, to be able to search an address or a location name and to have auto-suggestions.

### Search Location (along the route)

The search results are provided by the HERE Geocode & Search API, see https://developer.here.com/documentation/geocoding-search-api/dev_guide/topics/implementing-route.html. Note that this is BETA.

For our use, we would like to know if a point of interest is located within a certain distance at any point in the route. However, this doesn't seem to be straightforward. The api call requires one of the three parameters: a single location, a circle/radius or a bounding box. Calling each point of the route would expend our API, so the other two parameters are in play. We have implemented the bounding box, where the box is defined by the min and max latitudes and longitudes. When testing, it appears to include search location matches within the bounding box that are **not** within the search width of the route. Something to keep in mind...

### User Object

A simple red-circle vector image is used to represent the user. Since we're using Cesium we can implement a 3D object instead. We used a circular image because we did not implement heading/direction. If implemented, the object can be a car, or arrow, something that is not uniform.

### Destination Pin

A checkered flag vector image was embedded in a Cesium Pin, however, the checkered pattern is not visible, just a white outline of the flags. It would be great for a visible flag image, and it does not need to be in a pin necessarily if the image itself is clear. Could also use a 3D object.

### Color Selection

Some of the colors used for entites, labels and text may be clashing or not as visible as they should be. A close look and evaluation of what colors are best for every case in this application would be beneficial.


### The List Goes On..
