/*
Author:       Connor Southwell South1cr@cmich.edu
License:     

*/

/**
 * Namespace: geoPro
 *
 * geoPro is a javascript library for extending functionality in OpenLayers.
 * In-order to use geoPro OpenLayers V.3. must be imported.
 *
 * 
 * 
 *  
 * 
 * 
 * 
 * 
 *
 * 
 *
 * 
 *
 * 
*/

/**
 * geoPro library
 */
	
geoPro =  { //geoPro constructor
	

	getCentroid: function(feature) { // getCentroid method utilizing extent to retrieve coordinates
		if(feature1.getGeometry().getType() != "Polygon"){
			return false;
		}
		var featGeom = feature.getGeometry(); // retrieve feature geometry
		var xCoordAvg=0; // intialize function variables
		var yCoordAvg=0;
		var xCoordVal=0;
		var yCoordVal=0;
		var featArea=0;
		if(featGeom.g.length == 1){ // determine if multipart feature
			var featArea = featGeom.getArea(); // get area of feature relative to coordinate system units
			var coordArray = featGeom.getCoordinates()[0]; // create array of coordinates
			if (coordArray.length = 1){
				coordArray = featGeom.getCoordinates()[0][0]; // create array of coordinates
			}
		} else { /// multipart polygon, the largest polygon is used to calculate the centroid
			var multiPolys = featGeom.getPolygons(); // get seperate polygons
			for(i=0;i<multiPolys.length;i++){ // loop through features
				if(multiPolys[i].getArea()>featArea){ // if area of feature is larger than the current value of featArea evaluate
					featArea = multiPolys[i].getArea(); // get area of largest polygon
					var coordArray = multiPolys[i].getCoordinates()[0]; // get coordinate array of largest polygon
				}
			}
		}
		var numCoords = coordArray.length; // number of coordinate pairs for averaging
		for(var i=0;i<coordArray.length-1;i++){
			var coord = coordArray[i]; // first node
			var nCoord = coordArray[i+1]; // next node
			xCoordVal += (coord[0] + nCoord[0]) * (coord[0] * nCoord[1] - nCoord[0] * coord[1]); // determine x Coordinate value
			yCoordVal += (coord[1] + nCoord[1]) * (coord[0] * nCoord[1] - nCoord[0] * coord[1]); // determine y Coordinate value
		}
		xCoordAvg = xCoordVal/6/featArea; // Average x coordinate value based on feature area
		yCoordAvg = yCoordVal/6/featArea;
		var featExtent = featGeom.getExtent(); // get extent of feature
		if(!(xCoordAvg <= featExtent[0] && xCoordAvg >= featExtent[2] || xCoordAvg >= featExtent[0] && xCoordAvg <= featExtent[2])){
			xCoordAvg = xCoordAvg * -1; // if coordinate is not in extent then coordinate system uses negative coordinates, invert the coordinates to correct
			yCoordAvg = yCoordAvg * -1;
		}
		return new ol.Feature({geometry: new ol.geom.Point([xCoordAvg,yCoordAvg])});

	},
	
	
	pointInPolygon: function(point, polygon){ /// utilizes ray casting method to evaluate number of times an intersection occurs, if odd then point is inside
		var x1 = point[0];
		var y1 = point[1];
		var x2 = polygon.getGeometry().getExtent()[2]*1.5; // create x coordinate guaranteed to be outside of polygon feature
		var y2 = polygon.getGeometry().getExtent()[3]*1.5; // create y coordinate guaranteed to be outside of polygon feature
		var a1 = y2 - y1; // find y difference between point feature coords and outside polygon coords
		var b1 = x1 - x2; // find x difference
		var c1 = a1 * x1 + b1 * y1;
		var polygonCoords = polygon.getGeometry().getCoordinates()[0]; // get coordinate array from polygon feature
		var intersectionCounter = 0; // counter to keep track of the number of times that a line segment is intersected
		
		for(var i=0;i<polygonCoords.length-1;i++){
			var x3 = polygonCoords[i][0]; // get relevant x and y coordinates from the polygon feature
			var y3 = polygonCoords[i][1]; // these coordinates represent the edges of the polygon
			var x4 = polygonCoords[i+1][0];
			var y4 = polygonCoords[i+1][1];
			var check1 = ((x4-x3)*(y1-y4))-((y4-y3)*(x1-x4)); // create checks to dtermine if the value is positive or negative representing inside or outside
			var check2 = ((x4-x3)*(y2-y4))-((y4-y3)*(x2-x4));
			
			var check3 = ((x2-x1)*(y3-y2))-((y2-y1)*(x3-x2));  
			var check4 = ((x2-x1)*(y4-y2))-((y2-y1)*(x4-x2));
				
				if(Math.min(check1,check2) < 0 && Math.max(check1,check2) > 0 && Math.min(check3,check4) < 0 && Math.max(check3,check4) > 0){ // for each check pair above if one of the checks is negative while the other is positive then there is an intersection
					var a2 = y4 - y3; // y difference of the polygon line
					var b2 = x3 - x4; // x difference of the polygon line
					var c2 = a2 * x3 + b2 * y3; // checks to make sure lines are not parallel
					var det = a1 * b2 - a2 * b1;
					if(det != 0){ // if not parallel
						intersectionCounter += 1; // increase intersection counter
				}
			}
		}
		if(intersectionCounter%2 == 0){ // if the number of intersections is even then the point is not inside the polygon
			return false; // return bolean
		} else {
			return true;
		}
	}, 

	
	_feature_featureIntersection: function(feature1,feature2){ // find where line features, either line segments or polygon borders, intersect

		var feat1Geom = feature1.getGeometry();
		var feat2Geom = feature2.getGeometry();
		var coords1Arr;
		var coords2Arr;
		var intPoints = [];
		if(feat1Geom.getType() == "Polygon"){ // get appropriate segment based on geometry type
			coords1Arr = feat1Geom.getCoordinates()[0];
		} else if (feat1Geom.getType() == "Polyline"){
			coords1Arr = feat1Geom.getLinearPaths();
		} else{
			console.log('error: feature_featureIntersection requires polygon or polyline inputs');
			return; // if one of the features is not a polygon or polyline feature then return
		}
		if(feat2Geom.getType() == "Polygon"){
			coords2Arr = feat2Geom.getCoordinates()[0];
		} else if (feat2Geom.getType() == "Polyline"){
			coords2Arr = feat2Geom.getLinearPaths();
		} else{
			console.log('error: feature_featureIntersection requires polygon or polyline inputs');
			return;
		}
		
		for(var i=0;i<coords1Arr.length-1;i++){
			var x1 = coords1Arr[i][0];
			var y1 = coords1Arr[i][1];
			var x2 = coords1Arr[i+1][0];
			var y2 = coords1Arr[i+1][1];
			var a1 = y2 - y1;
			var b1 = x1 - x2;
			var c1 = a1 * x1 + b1 * y1;
			for(var j=0;j<coords2Arr.length-1;j++){
				var x3 = coords2Arr[j][0];
				var y3 = coords2Arr[j][1];
				var x4 = coords2Arr[j+1][0];
				var y4 = coords2Arr[j+1][1];
				var check1 = ((x4-x3)*(y1-y4))-((y4-y3)*(x1-x4)); 
				var check2 = ((x4-x3)*(y2-y4))-((y4-y3)*(x2-x4));
				
				var check3 = ((x2-x1)*(y3-y2))-((y2-y1)*(x3-x2));  
				var check4 = ((x2-x1)*(y4-y2))-((y2-y1)*(x4-x2));
				
				if(Math.min(check1,check2) < 0 && Math.max(check1,check2) > 0 && Math.min(check3,check4) < 0 && Math.max(check3,check4) > 0){
					var a2 = y4 - y3;
					var b2 = x3 - x4;
					var c2 = a2 * x3 + b2 * y3;
					var det = a1 * b2 - a2 * b1;
					if(det != 0){
						var intX = (b2*c1 - b1*c2)/det;
						var intY = (a1*c2 - a2*c1)/det;
						var intFeature = new ol.Feature({
							geometry: new ol.geom.Point([intX,intY])
						});
						intPoints.push(intFeature);

					}
				}
			}
			
		}
		if(intPoints.length >0){
			return intPoints;
		} else{
			return;
		}
	},
	
	_segment_featureIntersection: function(segment,feature){ // find where line features, either line segments or polygon borders, intersect
		var featureGeom = feature.getGeometry();
		var coordsArr;
		var intersectionPoints = [];
		coordsArr = featureGeom.getCoordinates()[0];
		
		if(!(geoPro._isClockwise(coordsArr))){
			coordsArr = coordsArr.reverse();
		}

		var x1 = segment[0][0];
		var y1 = segment[0][1];
		var x2 = segment[1][0];
		var y2 = segment[1][1];
		var a1 = y2 - y1;
		var b1 = x1 - x2;
		var c1 = a1 * x1 + b1 * y1;
		for(var i=0;i<coordsArr.length-1;i++){ 
			var x3 = coordsArr[i][0];
			var y3 = coordsArr[i][1];
			var x4 = coordsArr[i+1][0];
			var y4 = coordsArr[i+1][1]; 
			var check1 = ((x4-x3)*(y1-y4))-((y4-y3)*(x1-x4)); 
			var check2 = ((x4-x3)*(y2-y4))-((y4-y3)*(x2-x4));
			
			var check3 = ((x2-x1)*(y3-y2))-((y2-y1)*(x3-x2));  
			var check4 = ((x2-x1)*(y4-y2))-((y2-y1)*(x4-x2));
			
			if(Math.min(check1,check2) < 0 && Math.max(check1,check2) > 0 && Math.min(check3,check4) < 0 && Math.max(check3,check4) > 0){
				var a2 = y4 - y3;
				var b2 = x3 - x4;
				var c2 = a2 * x3 + b2 * y3;
				var det = a1 * b2 - a2 * b1;
				if(det != 0){
					var intX = (b2*c1 - b1*c2)/det;
					var intY = (a1*c2 - a2*c1)/det;
					intersectionPoints.push([[intX,intY],i,i+1]);
				}
			}
		}
		
		if(intersectionPoints.length >1){ // order intersection points from x1,y1 to x2,y2
			var distanceTable = {};
			sortingArray = [];
			sortedIntPoints = [];
			for(var i=0;i<intersectionPoints.length;i++){
				var distance = Math.sqrt(Math.pow(intersectionPoints[i][0][0]-x1, 2) + Math.pow(intersectionPoints[i][0][1]-y1, 2));
				distanceTable[distance] = intersectionPoints[i];
				sortingArray.push(distance);
			}
			sortingArray.sort();
			console.log(sortingArray);
			sortingArray.forEach(function(key) {
				sortedIntPoints.push(distanceTable[key]);
			})
			
			return sortedIntPoints;
		} else {
			return intersectionPoints;
		}
	},
	
	_segment_segmentIntersection: function(segment1,segment2){ // find where line features, either line segments or polygon borders, intersect
		var intersectionPoint;
		var aX1 = segment1[0][0];
		var aY1 = segment1[0][1];
		var aX2 = segment1[1][0];
		var aY2 = segment1[1][1];

		var bX1 = segment2[0][0];
		var bY1 = segment2[0][1];
		var bX2 = segment2[1][0];
		var bY2 = segment2[1][1];
			
		var a1 = aY2 - aY1;
		var b1 = aX1 - aX2;
		var c1 = a1 * aX1 + b1 * aY1;

		var check1 = ((bX2-bX1)*(aY1-bY2))-((bY2-bY1)*(aX1-bX2)); 
		var check2 = ((bX2-bX1)*(aY2-bY2))-((bY2-bY1)*(aX2-bX2));
			
		var check3 = ((aX2-aX1)*(bY1-aY2))-((aY2-aY1)*(bX1-aX2));  
		var check4 = ((aX2-aX1)*(bY2-aY2))-((aY2-aY1)*(bX2-aX2));
			
		if(Math.min(check1,check2) < 0 && Math.max(check1,check2) > 0 && Math.min(check3,check4) < 0 && Math.max(check3,check4) > 0){
			var a2 = bY2 - bY1;
			var b2 = bX1 - bX2;
			var c2 = a2 * bX1 + b2 * bY1;
			var det = a1 * b2 - a2 * b1;
			if(det != 0){
				var intX = (b2*c1 - b1*c2)/det;
				var intY = (a1*c2 - a2*c1)/det;
				intersectionPoint = [intX,intY];
			}
		}
		
		return intersectionPoint;
	},
	
	_isClockwise: function(vertices){
		var area=0;
		for (var i = 0; i < (vertices.length); i++) {
			j = (i + 1) % vertices.length;
			area += vertices[i][0] * vertices[j][1];
			area -= vertices[j][0] * vertices[i][1];
			// console.log(area);
		}
		return (area < 0);
	},
	
	
	clip: function(feature1,feature2){ // feature to be clipped, clipping feature
		
		if(feature1.getGeometry().getType() != "Polygon" || feature2.getGeometry().getType() != "Polygon"){ // check for polygon geometry
			return false; // exit if either feature is not a polygon
		}
		
		var feat1Geom = feature1.getGeometry();
		var feat2Geom = feature2.getGeometry();

		var newFeatRings = [];
		var feat1Coords = feat1Geom.getCoordinates()[0];
		var feat2Coords = feat2Geom.getCoordinates()[0];
		
		if(!(geoPro._isClockwise(feat1Coords))){
			feat1Coords = feat1Coords.reverse();
		}
		if(!(geoPro._isClockwise(feat2Coords))){
			feat2Coords = feat2Coords.reverse();
		}
		
		// get appending rings
		for(var i=0;i<feat1Coords.length-1;i++){
			
			var x1 = feat1Coords[i][0];
			var y1 = feat1Coords[i][1];
			var x2 = feat1Coords[i+1][0];
			var y2 = feat1Coords[i+1][1];
			
			var inOut1 = geoPro.pointInPolygon([x1,y1],feature2);
			var inOut2 = geoPro.pointInPolygon([x2,y2],feature2);
			var intPoint = geoPro._segment_featureIntersection([[x1,y1],[x2,y2]],feature2);
			if(intPoint.length==0 && !(inOut2)){ // no intersection and second point is outside
				newFeatRings.push([x2,y2]);
				//console.log('no intersection and second point is outside');
			}
			if(intPoint.length == 1 && !(inOut2)){ // one intersection and second point is outside
				newFeatRings.push(intPoint[0][0],[x2,y2]);
				//console.log('intersection and second point is outside');
			}
			if(intPoint.length > 1 || intPoint.length == 1 && inOut2){
				for(var j=0;j<intPoint.length;j++){
					console.log(j);
					newFeatRings.push(intPoint[j][0]);
				//	if(!(i == 0 && j == 0)){ // do not start new feature coordinates on interior points as the polygon will not be drawn correctly 
						var index, iterator, intersectionNotFound = true;
						if(!(newFeatRings.indexOf(feat2Coords[intPoint[j][1]]) > -1 || newFeatRings.indexOf(feat2Coords[intPoint[j][2]]) > -1)){
							console.log(intPoint[j][1]);
							console.log('gonna check em');
							if(geoPro.pointInPolygon(feat2Coords[intPoint[j][1]],feature1)){ // negative loop
								newFeatRings.push(feat2Coords[intPoint[j][1]]);
								index = intPoint[j][1]-1;
								iterator = -1;
								
							} else if(geoPro.pointInPolygon(feat2Coords[intPoint[j][2]],feature1)){ // positive loop
								newFeatRings.push(feat2Coords[intPoint[j][2]]);
								index = intPoint[j][2]+1;
								iterator = 1;
							}
							else {
								console.log('broke');
								break;
							}
							do {
								if(index < 0){
									index = feat2Coords.length-1; // reset index within coordinate array to end
								}
								if(index > feat2Coords.length-1){ // reset index within coordinate array to beginnning
									index = 0;
								}
								if(geoPro.pointInPolygon(feat2Coords[index],feature1)){
									newFeatRings.push(feat2Coords[index]);
								} else {
									intersectionNotFound = false;
								}
								index+= iterator;
							} while(intersectionNotFound);
						}
					//}
				}
				if(!(inOut2)){
					newFeatRings.push([x2,y2]);
				}
			}
			
		}
		var clippedFeature = new ol.Feature({ geometry: new ol.geom.Polygon([newFeatRings])});
		return clippedFeature;
	},
	
	_extrapolatePoint: function(x,y,dist,angle){

		var tempX;
		var tempY;
		
		if(angle == 90 || angle == 270){ // handle complete vertical lines
			if(angle == 90){
				tempX = x;
				tempY = y + dist;
			}
			if(angle == 270){
				tempX = x;
				tempY = y - dist;
			}
		} else if(angle == 180 || angle == 0){ // handle complete horizontal lines
			if(angle == 180){
				tempX = x - dist;
				tempY = y;
			}
			if(angle == 0){
				tempX = x + dist;
				tempY = y;
			}
		} else {
			var yDist = (Math.sin(angle * Math.PI/180)) * dist;
			var xDist = (Math.cos(angle * Math.PI/180)) * dist;
			var tempX = x + xDist;
			var tempY = y + yDist;
		}
		return [tempX,tempY];
	},
	
	_drawArc: function(start,end,center,numNodes){ // draw perfectly circular arc between two points, distance between center and start and center and end must be the same
		var arcArray = [];
		var radius = Math.sqrt(Math.pow(end[0]-center[0], 2) + Math.pow(end[1]-center[1], 2)); 
		console.log(radius);
		var xStep = (end[0] - start[0]) / (numNodes + 1);
		var yStep = (end[1] - start[1]) / (numNodes + 1);
		console.log(start,end,end[0] - start[0],end[1] - start[1], xStep,yStep);
		for(var i=1;i<=numNodes;i++){
			var x = start[0] + (xStep * i);
			var y = start[1] + (yStep * i);
			var b = radius - Math.sqrt(Math.pow(x-center[0], 2) + Math.pow(y-center[1], 2)); 
			var angle = Math.atan2(y - center[1], x - center[0]) * 180 / Math.PI;
			var adjustmentY = (Math.sin(angle * Math.PI/180)) * b;
			var adjustmentX = (Math.cos(angle * Math.PI/180)) * b;
			var adjustedX = x + adjustmentX;
			var adjustedY = y + adjustmentY;
			arcArray.push([adjustedX,adjustedY]);
		}
		
		return arcArray;
		
		
	},
	
	buffer: function(feature, dist, units){
		if(feature.getGeometry().getType() != "Polygon" && feature.getGeometry().getType() != "LineString"){ // check for polygon geometry
			return; // exit if feature is not a polygon or polyline geometry type
		}
		var featGeom = feature.getGeometry();
		var featCoords = featGeom.getCoordinates();
		var posCoords = [];
		var negCoords = [];
		for(var i=0;i<featCoords.length-2;i++){
			
		
			var x1 = featCoords[i][0];
			var y1 = featCoords[i][1];
			var x2 = featCoords[i+1][0];
			var y2 = featCoords[i+1][1];
			var x3 = featCoords[i+2][0];
			var y3 = featCoords[i+2][1];
			
			var degree1 = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 90; // calculate angle
			var oppoDegree1 = degree1 - 180;
			
			var posPoint1 = geoPro._extrapolatePoint(x1,y1,dist,degree1);
			var posPoint2 = geoPro._extrapolatePoint(x2,y2,dist,degree1);
			var negPoint1 = geoPro._extrapolatePoint(x1,y1,dist,oppoDegree1);
			var negPoint2 = geoPro._extrapolatePoint(x2,y2,dist,oppoDegree1);
			
			var degree2 = Math.atan2(y3 - y2, x3 - x2) * 180 / Math.PI + 90; // calculate angle for second segment
			var oppoDegree2 = degree2 - 180;
			
			var posPoint3 = geoPro._extrapolatePoint(x2,y2,dist,degree2);
			var negPoint3 = geoPro._extrapolatePoint(x2,y2,dist,oppoDegree2);
			
			var posPoint4 = geoPro._extrapolatePoint(x3,y3,dist,degree2);
			var negPoint4 = geoPro._extrapolatePoint(x3,y3,dist,oppoDegree2);
			
			if(i == 0){ // first point does not have any segments behind it
				posCoords.push(posPoint1);
				negCoords.push(negPoint1);
			}
			console.log(posPoint1);
			zep = posPoint1;
			zap = posPoint2;
			zerg = posPoint3;
			var insideIntersection = geoPro._segment_segmentIntersection([negPoint1,negPoint2],[negPoint3,negPoint4]);
			negCoords.push(insideIntersection);
			
			/*if(i = featCoords.length-2){
				posCoords.push(posPoint4);
				negCoords.push(negPoint4);
				
			}*/
			
			

		}
		
		
		return [posCoords,negCoords];
		
		//var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
		
		
		
	},
	
	proportionalSymbol: function(layer,field,scalar,color){ // proportional symbol function 
		var vectorSource = new ol.source.Vector({}); // create vector layer constructor
		if(!color){ // if no color is chosen the default is red
			var tempStyle = new ol.style.Style ({
				fill: new ol.style.Fill({
				color: 'red',
				})
			});
		} else { // set user color option
			var tempStyle = new ol.style.Style ({
				fill: new ol.style.Fill({
				color: color,
			})
			});
		}
		var featArray = layer.getSource().getFeatures(); // get individual features from input layer
		featArray.forEach(function(i){ //loop through features in input layer
			try{ // check if numeric
				parseFloat(i.get(field));
				var scale = i.get(field) * scalar;
			} catch(err){ // return if not
				return;
			}
			var center = geoPro.getCentroid(i); // get centroid to place the proportional symbol
			var xCoord = center.getGeometry().getCoordinates()[0];
			var yCoord = center.getGeometry().getCoordinates()[1];
			var tempGeo = new ol.Feature({ //create temporary feature
				geometry: new ol.geom.Circle([xCoord,yCoord], scale),
			});
			
			vectorSource.addFeature(tempGeo); // add temp feature to constructor
			
			
		});
		
		var tempLayer = new ol.layer.Vector({ // create temporary layer from constructor
			source: vectorSource,
			style: tempStyle
		});
		return tempLayer; // return layer to user

		
	},

	
};
