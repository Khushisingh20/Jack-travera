/*!
 * Common funcs needed for bestbus
 * 
 * Copyright 2011, Chetan Temkar
 *
 * Date: Thu Mar 31 15:28:23 2011 -0400
 */
 
var CTIME = 100;	// Cookie expires after 100 days
var MAXNEARSTOPDIST = 1000;	// Nearest stops should be within 1 km.
var NEARLATLON = .001 // Within 1.1 kms.

function loadStyles() {
	bl = BrowserLevel(); 
	
	if(bl == 'A') {
		document.write('<meta name="viewport" content="user-scalable=no, width=device-width" />');
	}  
	loadjscssfile("css/basic.css", 'css');
	loadjscssfile("css/main.css", 'css');
}	

// See if smartphone or lower
function BrowserLevel() {
	browser = navigator.userAgent.toLowerCase();

	if(browser.search('safari') || browser.search('android') )
			return 'A';
	if(browser.search('firefox'))
		return 'FF'; // Firefox problems with offline storage
	if(browser.search('blackberry'))
		return 'BB'; // Firefox problems with offline storage
		
	else
			return 'C';
}


// distance between 2 lat, lon pairs
function distanceLatLon(lat1, lon1, lat2, lon2) {
	var R = 6371; // km
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180; 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2* Math.PI / 180) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return Math.ceil(d * 1000);	// return distance in meters
}


// setup location handler to get location by gps or cell towers

function getLocation() {
	var lat, lon, gps, options, geo, watch;
	gps = navigator.geolocation;
	options = {timeout:60000, maximumAge:330000};

	if(gps) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
			lat = position.coords.latitude;
			lon = position.coords.longitude;
		}, function() {
			handleNoGeolocation(browserSupportFlag);
		});
	// Try Google Gears Geolocation
	} else if (google.gears) {
		browserSupportFlag = true;
		geo = google.gears.factory.create('beta.geolocation');
		geo.getCurrentPosition(function(position) {
			setGeoPos(pos);
			showLocation(position);
		}, function() {
		handleNoGeoLocation(browserSupportFlag);
		});
	// Browser doesn't support Geolocation
	} else {
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}

	if(gps != undefined) {	
		trackerId = gps.watchPosition(function(pos){
			setGeoPos(pos);
			showLocation(pos);

		}, errorHandler, options);
	}
	else if (geo != undefined) {
		watch = geo.watchPosition(function(pos){
			setGeoPos(pos);
			showLocation(pos);

		}, errorHandler, options); 
	}
}


  function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
//     alert("Geolocation service failed.");
      initialLocation = null;
    } else {
//      alert("Your browser doesn't support geolocation");
      initialLocation = null;
    }
//    map.setCenter(initialLocation);
  }

function showLoc(pos) {
	setGeoPos(pos);
	showLocation(pos);	

}
function errorHandler(err) {
  if(err.code == 1) {
    dBug("geo:", "Error: Access is denied!", 5);
  }else if( err.code == 2) {
    dBug("geo", "Error: Position is unavailable!", 5);
  }
}


// Format a date into hours, minutes
function timeStr(dt) {
	var currentTime = dt;
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();

	var suffix = "AM";
	if (hours >= 12) {
		suffix = "PM";
		hours = hours - 12;
	}
	if (hours === 0) {
		hours = 12;
	}

	if (minutes < 10)
		minutes = "0" + minutes;

	return hours + ":" + minutes + " " + suffix;

}

function distFormat(d, maxd) {	// d in meters, maxd -max distance allowed in km., else show as NA
	if(maxd === undefined)
		maxd = 10;
	if(d / 1000 > maxd || typeof(d) == undefined || isNaN(d))
		return "N/A";
	if( d >= 1000)
		return Math.round((d/ 1000)*100)/100 + '&nbsp;km';
	else
		return Math.round(d*1000)/1000 + '&nbsp;m';

}
	
function getFile(fileName){
    oxmlhttp = null;
    try{
        oxmlhttp = new XMLHttpRequest();
        oxmlhttp.overrideMimeType("text/xml");
    }
    catch(e){
        try{
            oxmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch(e){
            return null;
        }
    }
    if(!oxmlhttp) return null;
    try{
       oxmlhttp.open("GET",fileName,false);
       oxmlhttp.send(null);
    }
    catch(e){
       return null;
    }
    return oxmlhttp.responseText;
}



function stopTracking(){
	if (trackerId){
		navigator.geolocation.clearWatch(trackerId);
	}
}


function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays===null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name)
		{
			return unescape(y);
		}
	}
	return '';
}
	
	
function dBug(sModule, sDebugStr, lvl) {
	if(dBug && lvl < dBugLvl)
		alert(sModule + ': ' + sDebugStr);
	
	
}	


var STOPNAMEID = 1;
var SEARCHSTR = 0;

// return the first search string for a stopnameid
function findStopSs(stopnameid)
{
	stopnameid = stopnameid.toLowerCase();
	stops = getStopNames();
	nStopsFound = 0;
	for(var x=0; x < stops.length; x++) {
		if(stopnameid == stops[x][STOPNAMEID])
			return stops[x][SEARCHSTR];
	}
	return null;
}

// Find a stopnameid in the stopnames array and returns information about it
// returns no. of stops found, 
function findStopId(stopid) {
	stopid = stopid.toLowerCase();
	stopNames = getStopNames();
	nStopsFound = 0;
	stopsFound = [];
	stopsSrchStr = [];
	for(var x=0; x < stopNames.length; x++) {
		searchstr = stopNames[x][3].toLowerCase();
		if(searchstr.search(stopid) != -1) {
			nStopsFound++;
			stopsFound = stopNames[x][3];
			stopsSrchStr = stopNames[x][0] + ': ' + stopNames[x][1] + ' ' + stopNames[x][2];
			break;
		}
	}
	return {'nostopsFound':nStopsFound, 'stopsfound':stopsFound, 'stopsrchstr':stopsSrchStr};
}


// Find a stop searchstr in the stopnames array and returns information about it
// returns no. of stops found, 
function findStop(stopstr) {
	stopstr = stopstr.replace(/[^0-9a-zA-Z]+/g,'').toLowerCase(); // remove special characters, spaces
	stops = getStopNames();
	nStopsFound = 0;
	stopsFound = [];
	stopsSrchStr = [];
	for(var x=0; x < stops.length; x++) {
		searchstr = stops[x][0].replace(/[^0-9a-zA-Z]+/g,'').toLowerCase();
		if(searchstr.search(stopstr) != -1) {
			nStopsFound++;
			stopsFound[stopsFound.length] = stops[x][1];
			stopsSrchStr[stopsSrchStr.length] = stops[x][0];
			if(searchstr.length == stopstr.length)
				break;	// exact match, so we have found our stop
		}
	}
	return [nStopsFound, stopsFound, stopsSrchStr];
}

// Find a searchstr based on the stop name id	
function getSearchStr(stopid) {
	stops = getStopNames();
	for(var x=0; x < stops.length; x++) {
		if(stopid == stops[x][1]) {
//			startStopLat = stopll[STOPLAT];
//			startStopLon = stopll[STOPLON];
//			startStopIdx = x;
			return stops[x][0];
		}
	}
	return '';
}


function getWinDim() {
	var winW = 630, winH = 460;

	if (document.body && document.body.offsetWidth) {
	 winW = document.body.offsetWidth;
	 winH = document.body.offsetHeight;
	}
	if (document.compatMode=='CSS1Compat' &&
	    document.documentElement &&
	    document.documentElement.offsetWidth ) {
	 winW = document.documentElement.offsetWidth;
	 winH = document.documentElement.offsetHeight;
	}
	if (window.innerWidth && window.innerHeight) {
		winW = window.innerWidth;
		winH = window.innerHeight;
	}
	// winW = screen.width < winW ? screen.width : winW;
	// winH = screen.height < winH ? screen.height : winH;
//	dBug('$window.width: ' + $(window).width() + ', $document.width(): ' +  $(document).width());
	return {
		"wd": parseInt(winW, 10),
		"ht": parseInt(winH, 10)
	};
}

// get frequency, first bus time, last bus time from busmaster
function getBusInfo(busno) {
	busno = busno.replace(/[^0-9a-zA-Z]+/g,'').toLowerCase(); 
	busno = busno.replace('expacexp', 'e');
	for(var x=0; x<busMaster.length; x++) {
		if(busmaster[x][0] == busno) {
			return { "firstFrom":busmaster[x][1], "lastFrom":busmaster[x][2],
						"frequency":busmaster[x][3]};
		}	
	}
}

// Call this link when bus is selected to set cookies and then fire the link.
// Done so that parameters are passed through cookies not link 
//	because offline storage does not work with changing links
function goLinkBusRoute(busNo, startStopNo, destStopNo, direction) {
	url = 'journey.html?b=' + busNo + '&s=' + startStopNo + 
			'&d=' + destStopNo + '&dir=' + direction;
	setCookie('cBusNo', busNo, 1);
	setCookie('cStartStopNo', startStopNo, CTIME);
	setCookie('cDestStopNo', destStopNo, CTIME);
	setCookie('cDirection', direction, CTIME);
	
	window.location = url;
	return false;
}

// Build the url for showstops
function buildUrl(busNo, startStopNo, destStopNo) {
	busInfo = getBusInfo(busNo);
	busfreq = "";
	var direction = 'd';
	if(startStopNo < destStopNo)
		direction = 'u';
	if(busInfo != undefined && busInfo.frequency !="")
		busfreq = "&nbsp;(&nbsp;" + busInfo.frequency + "&nbsp;mins)";
	url = '<a href="#"' + ' onClick="return goLinkBusRoute(' 
			+ "'" + busNo + "'" + ',' + startStopNo + ',' + destStopNo + 
			", '" + direction + "'" + ')">' 
			+ busNo.replace(/ /g, '&nbsp;') + busfreq + "</a>" ;
	return url;

}

// Show all bestbus cookies for debugging
function showBBCookies() {
alert(printCookie('cMyLat') + printCookie('cMyLon') + printCookie('cStartStop') 
		+ printCookie('cStartStopId') + printCookie('cDestStop') 
		+ printCookie('cDestStopId') + printCookie('cStartStopNameId')  
		+ printCookie('cDestStopNameId') + printCookie('cBusNo') 
		+ printCookie('cStartStopNameid') + printCookie('cDestStopnameId'));
	return;	
}

function printCookie(cookieName) {
	return cookieName + " : " + getCookie(cookieName) + ", ";
}

// This disables enter key for BB where you can select from auto suggest only with enter
function disableEnterKey(e)
{
     var key;      
     if(window.event)
          key = window.event.keyCode; //IE
     else
          key = e.which; //firefox      

     return (key != 13);
}

function showRoutesAtStop(oStop, title) {	// Bus routes at stop
	var busList = null;

	document.getElementById("busroutesatstart").innerHTML = title + '(' + oStop.area + ')'; 

	for(var i = 0; i < arStopBus.length; i++) {
		if(arStopBus[i][1] == oStop.id) {
				busList = arStopBus[i][5];
				break;
		}
	}
	var firstStop, lastStop;
	if(busList != null) {
		arNearBuses = busList.split(",");

		routesAtStopStr = '<table id="routesAtStop" class="tbl_color">';
		for(var j = 0; j < arNearBuses.length; j++) {
			busNo = arNearBuses[j].split("|")[0].trim();
			for(var a = 0; a < arBusList.length; a++) {
				if(arBusList[a][1] == busNo) {
					firstStop =  arBusList[a][2];
					lastStop =  arBusList[a][3];
					
				}
			}

			busInfo = getBusInfo(busNo);
			busfreq = "";
			if(busInfo != undefined && busInfo.frequency !="")
				busfreq = "&nbsp;(&nbsp;" + busInfo.frequency + "&nbsp;mins)";
				
			busInfo = getBusInfo(busNo);
			busfreq = "";
			if(busInfo != undefined && busInfo.frequency !="")
				busfreq = busInfo.frequency + "&nbsp;mins";
			sBusNo= busNo.replace('Exp AC Exp', 'AC Exp');
			sBusNo = sBusNo.replace(/ /g, '&nbsp;');
			url = '<a href="#"' + ' onClick="return goLinkBusRoute(' + "'" + busNo + "'" 
				+ ', 0, 0)' + '">' + '<span style="font-weight:bold;">' + sBusNo + '</span>' +
				'</td><td>' + firstStop + ' - ' + lastStop + 
				'</td><td>' + busfreq + "</a>" ;

			routesAtStopStr = routesAtStopStr + '<tr><td>' + url +  "</a></td></tr>";
//			routesAtStopStr = routesAtStopStr + '<tr><td>' + recentStops[i] + '</td></tr>';
		}

		routesAtStopStr = routesAtStopStr + '</table>';
		document.getElementById("routesAtStop").innerHTML = routesAtStopStr;
	}
}

// Find stops near a postion (lat, lon)
function findNearStops(pos) {
	var nearStop, retNearStop, x, y, dLat, dLon, di;
	nearStop = [];
	aoNearStops= [];
	y = 0;
	for (x = 0; x < arStopNames.length; x += 1) {
		dLat = parseFloat(arStopNames[x][4]);
		dLon = parseFloat(arStopNames[x][5]);
		if (Math.abs(pos.coords.latitude - dLat) < NEARLAT  
			&& Math.abs(pos.coords.longitude - dLon) < NEARLAT) {
			di = distanceLatLon(pos.coords.latitude, pos.coords.longitude,
						dLat, dLon);
			if (di < MAXNEARSTOPDIST) {
				var sname = stopNames[x][1];
				var lmark = stopNames[x][2];

				stopnameext = lmark !== null ? sname + ' /' + lmark : sname;
				aoNearStops[aoNearStops.length] = {"di": di, "id": arStopNames[x][3], 
						"area": arStopNames[x][0], "stopname": arStopNames[x][1], 
						"landmark": arStopNames[x][2], 'stopnameext':stopnameext};
			}
		}
	}
//	aoNearStops.sort(distSort);
	aoNearStops.sort(function(a, b) {return a.di - b.di});
	if(aoNearStops.length === 0)
		return null;
	aoNearStops.length = 3;	// return only 3 stops
	
	return aoNearStops;

}


function showRoute(busNo)
{
		goLinkBusRoute(busNo, 0, 0);
}
// Show a complete bus route
function showRouteComplete() {

	bTxt = $('#busNo').val();
	// Find the route in array
	if(bTxt.length > 0) {
		bTxt = bTxt.replace(/ /g, "");
		bTxt = bTxt.toUpperCase();
		var busFound = false;
		for(var x=0; x<arBusList.length; x++) {
			if(bTxt == arBusList[x][1].replace(/ /g, "").toUpperCase()) {
				bTxt = arBusList[x][1];
				busFound = true;
				break;
			}
		}
		if(!busFound) {
			alert('Bus not found, please re-enter');
			return false;
		}
		busNo = bTxt;
		setCookie('cBusNo', bTxt, 365);
	}
	else {
		bCombo = document.getElementById('busNoCombo');
		busNo = bCombo.options[bCombo.selectedIndex].value;
	}

	goLinkBusRoute(busNo, 0, 0);

return;

}				

// Populate the All buses List combo 
function PopulateAllBusList() {

	bCombo = document.getElementById('busNoCombo');
	for(var x=0; x<arBusList.length; x++) {
		var busInfo = getBusInfo(arBusList[x][1]);
		var busfreq = "";
		if(busInfo != undefined && busInfo.frequency !="")
			busfreq = '(' + busInfo.frequency + " mins)";
		var option = document.createElement("option");
		option.text = arBusList[x][1] + " - " + arBusList[x][2] + " : " 
			+ arBusList[x][3]; // + ' ' + busfreq; 
		option.value = arBusList[x][1];
		bCombo.add(option, null); 
	}
//	$("#busNoCombo").selectmenu('refresh', true);
}


function supports_local_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch(e){
    return false;
  }
}


function showAndroidToast(toast) {
/*
txt = "<p>Browser CodeName: " + navigator.appCodeName + "</p>";
txt+= "<p>Browser Name: " + navigator.appName + "</p>";
txt+= "<p>Browser Version: " + navigator.appVersion + "</p>";
txt+= "<p>Cookies Enabled: " + navigator.cookieEnabled + "</p>";
txt+= "<p>Platform: " + navigator.platform + "</p>";
txt+= "<p>User-agent header: " + navigator.userAgent + "</p>";
alert(txt);
*/
if(navigator.userAgent.indexOf('Android') === -1)
	alert(toast);
else
	Android.showToast(toast);
}
	