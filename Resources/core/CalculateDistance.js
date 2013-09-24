exports.CalculateDistance = function(annLat, annLon, currentLat, currentLon){
	Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
	};
	Number.prototype.toRad = function() {
    return this * Math.PI / 180;
	};
 
	function getDistance(lat1,lon1,lat2,lon2){
	    var R = 6371; // km
	    var dLat = (lat2-lat1).toRad();
	    var dLon = (lon2-lon1).toRad();
	    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
	    Math.sin(dLon/2) * Math.sin(dLon/2);
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	    var d = R * c;
	 
	    return d;
	};
 
	var distance = getDistance(annLat,annLon,currentLat,currentLon);

	return distance;

};
