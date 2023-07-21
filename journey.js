// Shows a bus route with the stops 
// Parameters: b - busno (eg. 301 or 2 L), s - start stopno (eg. 2 or 0 for start), 
//					d - dest stopno (e.g. 25 or 0 for last stop)

/* global $, document, gup */

var dBugLvl = 3;
var stopBusLines = '';
var called_times = 0;

var STOPNO = 0;
var SEARCHSTR = 1;
var NXTDIST = 2;
var NXTTIME = 3;
var LAT = 4;
var LON = 5;
var MAXROUTEDIST = 50;
var MAXSTOPDIST = 2;
var MAXRECENTJOURNEYS = 7;
var geoPos;
var gStartStop = {}; 
var gDestStop = {};
var gStartStopNo;
var gStartSearchStr;
var gDestStopNo;
var gDestSearchStr;
var total_dist = 0;
var total_time = 0;

var firstStop = 0;
var lastStop = 0;
var arBusStops = [];
var colStart = '';
var colEnd = '<br>';

var dispSize;
var wdth;
var busNo, firstStop, lastStop;
var addJourney = true;
var trackJourney = true;
// var bDir = 'u';
var sDir = 'u';

$(document).ready(function () {

	var dispSize, wdth, s, d, startStop, destStop;
	dispSize = getWinDim();
	wdth = dispSize.wd * 0.98;
	if (dispSize.wd > 240) { // Screen too small to display columns
		colStart = '<td>';
		colEnd = '</td>';
	}
	busNo = gup('b');	// get URL params
	s = gup('s');
	d = gup('d');
	sDir = gup('dir');

	if (s === "" && d === "") {
		busNo = getCookie('cBusNo');
		s = getCookie('cStartStopNo');
		d = getCookie('cDestStopNo');
	}
	if(busNo === "") {
		alert('No Journey selected yet. Select one from the Find Bus tab or the Routes tab');
			window.location.href = "index.html";
			return;
	}

	startStop = parseInt(s, 10);
	destStop = parseInt(d, 10);
	if(startStop > 0 && destStop > 0) {
		if(startStop > destStop)
			sDir = 'd';
		else
			sDir = 'u';
	}
	if(startStop === 0 && destStop === 0)
		trackJourney = false;	// User is just browsing a route

// dBug('', 'b=' + busNo + ' s = ' + s + ', d = ' + d, 5);
// showBBCookies();
	
	startStop = startStop > 0 ? startStop : 1;
	if (startStop === "" && destStop === "") {
		document.write('Cannot find a valid start or destination');
		return false;
	}
	gStartStop.stopno = startStop;
	gStartStop.searchstr = '';
	gDestStop.stopno = destStop;
	gDestStop.searchstr = '';
	firstStop = startStop > 0 ? startStop : 0;
	lastStop = destStop > 0 ? destStop : 0;
	
	dBug('ready: ', 'busno= ' + busNo + ', s ' + startStop + ', d=' + destStop, 5);
	document.getElementById("routeTitle").innerHTML = "Bus no.: " + busNo;
//	readRouteStopFile(busNo, startStop, destStop);
	arBusStops = getb();
	dBug('arBusStops: ', arBusStops.length, 5);

	//	<tr><th>Stop no.</th><th>[Area] Stop name </th><th>Next Stop<br>Dist. (Time)</th></tr>';

	var ht = showRouteStops(arBusStops, 0, startStop, destStop);

	gStartStopNo = startStop;
	gDestStopNo = destStop;
	if(addJourney) {
		addRecentJourney({'busNo':busNo, 'firstStop':firstStop, 'firstStopName':gStartStop.searchstr,
		'lastStop':lastStop, 'lastStopName':gDestStop.searchstr});
		addJourney = false;
	}

	getLocation();

//	document.getElementById("journey").innerHTML = "Total distance: " + distFormat(total_dist, MAXROUTEDIST) + " (" + total_time + "&nbsp;mins)";	
	document.getElementById("routeStops").innerHTML = ht;  
	return;
});

function initmodule() {
	var x;
	a = getb();
	for (x=0;x<a.length;x++) 
		document.write( '<br>' + a[x][0] + ", " + a[x][1] +  ", " + a[x][2]);

}

// Show route stops in table
function showRouteStops(stops, hlstop, sS, dS) {
	var sStop, dStop;	
	sStop = parseInt(sS);
	dStop = parseInt(dS);
	
	var dir = 1;
	
	if(sDir === 'd')
		dir = -1;
/*		
	if(sStop > dStop && dStop) {
		bDir = 'd';
		dir = -1;
	}
*/
	if (sStop)
		sStop -=1;
	if(dStop) 
		dStop -=1;
		
	if((dStop == 0 || dStop == -1) && dir != -1) {
		dStop = stops.length - 1;
		lastStop = dStop;
	}
	stopsHtml = "";
	if(hlstop > 0)
		hlStyle = 'style="background-color:cyan; color:red;"';
	else
		hlStyle = '';
	var x = sStop;
	total_dist = 0; total_time = 0;
	if(sStop > dStop) {
		firstStop = dStop + 1;
		lastStop = sStop + 1;
	} else {
		firstStop = sStop + 1;
		lastStop = dStop + 1;
	}
	
	while(true) { //	for(var x=0; x < stops.length; x++) {
	
		if(stops[x] != "") {
			ar = stops[x];
			if(x == hlstop && hlstop != 0)
				stopsHtml = stopsHtml + '<tr ' + hlStyle + ' >';
			else
				stopsHtml = stopsHtml + '<tr>';
			
			if(x+1 == gStartStop.stopno)
				gStartStop.searchstr = ar[SEARCHSTR];
			if(x == dStop)
				gDestStop.searchstr = ar[SEARCHSTR];
			
			mins = "";
// 			stopsHtml = stopsHtml + colStart + ar[STOPNO] + colEnd;
			stopsHtml = stopsHtml + colStart + ar[SEARCHSTR] + colEnd;
			met = typeof(ar[NXTDIST]) != "undefined" ? distFormat(parseInt(ar[NXTDIST]), MAXSTOPDIST) : "";
			var missingLoc = true;
			if(typeof(ar[NXTTIME]) != "undefined" && ar[NXTDIST] < 2000) {
				missingLoc = false;
				mins = " (" + ar[NXTTIME] + "&nbsp;mins)";		
			}
			stopsHtml = stopsHtml + colStart + met + colEnd;
			stopsHtml = stopsHtml + colStart + mins + " ";
			stopsHtml = stopsHtml + "</td></tr>";
			if(missingLoc) { // if no info, take average distance as 500 m and average time as 3 mins 
				total_dist += 500;
				total_time += 3;
			} else {
				total_dist += typeof(ar[NXTDIST]) != "undefined" ? parseInt(ar[NXTDIST]) : 0;
				total_time += typeof(ar[NXTTIME]) != "undefined" ? parseInt(ar[NXTTIME]) : 0;
			}
		}
		x += dir;
		if(x < 0 || x > stops.length)
			break;
		if(dir < 0 && x < dStop)
			break;
		if(dir > 0 && x > dStop)
			break;
			
	}
	if(gDestStop.stopno == 0) {
		gDestStop.stopno = x-2;
		gDestStop.searchstr = ar[SEARCHSTR];
	}
	var hdrHtml = '<table class="tbl_color" style="width: ' + wdth + 'px;">'  
	hdrHtml = hdrHtml + '<tr><th>[Area] Stop name </th><th>Dist. to Next Stop</th><th>Time to Next Stop</th></tr>';

	stopsHtml = hdrHtml + stopsHtml + "</table>";


	
	return stopsHtml;
}




/*
// Read the route from server and write to file			
function openBusRouteFile(busNo) {
	var xmlhttp;
	xmlhttp=new XMLHttpRequest();
	xmlhttp.open("POST","init/busstoplist.php",false);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");	
	xmlhttp.send("busno=" + busNo + "&s=0&d=0");
	return xmlhttp.responseText.split("\n");
}
*/

// Shows the current location and hilites the stop in the stop list
function showLocation(pos) {
	dBug('showLocation: ', 'lat: ' +  pos.coords.latitude + ', lon: ' + pos.coords.longitude, 5);
// send location to server to identify bus route
	called_times++;
	var curStopNo = 0;
	
//	var bDir = 'd';
	var idxnearstop = -1;
	if(arBusStops.length == 0 || pos == undefined) {
		document.getElementById("nearStop").innerHTML = 'N/A';;
		return;
	}
		
	nearStop = "";
	locHtml = "";
	prvdi = -1;
	for(var x=0; x < arBusStops.length; x++) {
		if(arBusStops[x] != "") {
			ar = arBusStops[x];
			if(x == 1)	{
				firstStop = ar[STOPNO];
				firstStopName =  ar[SEARCHSTR];
				document.getElementById("nearStop").innerHTML = 'First Stop: ' + firstStop;
			}	
		}
//				dBug('Stop: ' + x  + ' of ' + stopLines.length + ' - ' + ar[SEARCHSTR]);
	}
//	document.getElementById("myLoc").innerHTML = 'First Stop: ' + firstStop;
	
	lastStop = lastStop > 0 ? lastStop :ar[STOPNO];
//	document.getElementById("myLoc").innerHTML = 'Last Stop: ' + lastStop; 
// dBug('first: ' + firstStop + ', last: ' + lastStop);
	if(pos == undefined)
		return;

	diTillNearStop = 0;
	timeTillNearStop = 0;

	// Get nearest stop
	for(var x=0; x < arBusStops.length; x++) {
//		document.getElementById("myLoc").innerHTML = '';
		if(arBusStops[x] == "") 
			continue;
		ar = arBusStops[x];
//		document.getElementById("myLoc").innerHTML = 'Stop: ' + x  + ' of ' 
//				+ arBusStops.length + ' - ' + ar[SEARCHSTR];

		dLat = ar[LAT];
		dLon = ar[LON];
		if(dLat !== 0 && dLon !== 0) {
			diNearStop = Math.abs(distanceLatLon(dLat, dLon, pos.coords.latitude, pos.coords.longitude));
			if(diNearStop < prvdi || prvdi == -1) {
				prvdi = diNearStop;
				idxnearstop = x;
				arNearStop = ar;
			}
			diTillNearStop += typeof(ar[NXTDIST]) != "undefined" ? parseInt(ar[NXTDIST]) : 0;
			timeTillNearStop +=  typeof(ar[NXTTIME]) != "undefined" ? parseInt(ar[NXTTIME]) : 0;
		}
	}
	diNearStop = prvdi;	
	var maxStop = firstStop;
	var minStop = lastStop;
		
	var locationFound = true;
	var nowMs = new Date();
	var fixTime = new Date(pos.timestamp);
	var fixAge = nowMs - fixTime;
//	dBug('fixms' + pos.timestamp + ', time:' + fixTime + ' Now:' + nowMs);
	if ( typeof showLocation.called_times == 'undefined' ) {
			// first time, define static vars lat and lon
			called_times = 0;
			dLat = 0;
			dLon = 0;
//			return;
	}

	if(firstStop < lastStop) {
//		bDir = 'u';
		minStop = firstStop;
		maxStop = lastStop;
	}
	var pastDestination = false;
	var beforeStart = false;
	var beforeMsg = "<span id='before'>Journey hasn't started</span>"; 
	var pastMsg = "<span id='past'>You have passed your destination, please get down when bus stops</span>";
	var atMsg = "<span id='at' Reached. Please alight when bus stops<div></span>";
	var myLoc = '';
	
	var htmLocInfo = "<tr>" + colStart + 
		"(Location Accuracy - " + distFormat(pos.coords.accuracy, MAXROUTEDIST) + ", at " +
				timeStr(fixTime) + ") " + colEnd + "</tr>";

	if(prvdi != -1)	{
//		document.getElementById("myLoc").innerHTML = 'Found location ....';
	try {
//		document.getElementById("myLoc").innerHTML = 'Processing location ....';
	if(sDir == 'u') {
		if(arNearStop[STOPNO] < minStop || diNearStop > 2000) // proably far away 2 km from any stop
			beforeStart = true;
		if(arNearStop[STOPNO] > maxStop) 
			pastDestination = true;
	} else {
		if(arNearStop[STOPNO] < minStop)
			pastDestination = true;
		if(arNearStop[STOPNO] > maxStop) 
			beforeStart = true;
	}
	sDiNearStop = diNearStop != undefined ? distFormat(diNearStop, 5) : "N/A";
	var elm =  "Nearest stop: " + arNearStop[STOPNO] + ". " + arNearStop[SEARCHSTR] + " (" + 
		 sDiNearStop + ") " ; 
	
	myLoc = myLoc + elm;
	myLoc = '<table style="width: ' + wdth + 'px;">'  + myLoc + htmLocInfo + '</table>';

	myLoc = myLoc + colEnd + '</tr>';

	var stops_remaining = Math.abs(lastStop - arNearStop[STOPNO]);
	var bc = '';	// background color for remaining stops\
	var almostthere = '';
	if(stops_remaining <= 2)	{
		bc = "id='neardest'"
		if(stops_remaining < 1 ) {
			almostthere = '<span id="at">Please Alight</span>';
			myLoc = atMsg + myLoc;
		} else {
			almostthere = '<span>(Almost There)</span>';
		}
	}

	var d = Math.abs(total_dist - diTillNearStop);
	remJourney = '';
	rem_time = Math.abs(total_time - timeTillNearStop);
	nearStop = myLoc;
	if(pastDestination) {
			myLoc = pastMsg + myLoc;
			pastB4 = pastMsg;
	}
	else if(beforeStart) {
			myLoc = beforeMsg + myLoc;
			pastB4 = beforeMsg;
		}
		else
			if(stops_remaining > 0) {
				myLoc = myLoc + '<tr ' + bc + '>' + colStart + 'Remaining ' + almostthere + 
				colEnd + colStart + stops_remaining + ' Stops, '
				+  distFormat(d, MAXROUTEDIST) + ", " +  rem_time
				+ ' min. ' + colEnd + '</tr>';
				remJourney = 'Remaining ' + almostthere + stops_remaining + ' Stops, '
				+  distFormat(d, MAXROUTEDIST) + ", " +  rem_time
				+ ' min. ';
			}
		} catch(e)	{
			$("location").innerHTML = myLoc;
			return;
		}
		myLoc = '<div id="loc"><table style="width: ' + wdth + 'px;">'  + myLoc + '</table></div>'
//		document.getElementById("myLoc").innerHTML = myLoc;
	}

	ht = showRouteStops(arBusStops, idxnearstop, gStartStopNo, gDestStopNo);
	document.getElementById("routeStops").innerHTML = ht;

	locAccur =  "(Location Accuracy - " + distFormat(pos.coords.accuracy, MAXROUTEDIST) + 
				", at " + timeStr(fixTime) + ") " + colEnd + "</tr>";
	nearStop = elm;
//	$('#pastB4').html(pastB4);
	$('#nearStop').html(nearStop);
	$('#locAccuracy').html(locAccur);
//	$('#remainingJourney').html(remJourney);
	
/*	+ 
			distFormat(pos.coords.accuracy, MAXROUTEDIST) + ", at " +
				timeStr(fixTime) + ") " + colEnd + "</tr>";
*/
// send location to server to identify bus route
	if(trackJourney)
		sendBusInfo(busNo, pos, arNearStop, sDir);

	return;

// dBug('In showLocation');
//	showPosDetails(pos);
} 	// eofn: showLocation(pos) 
	

function setGeoPos(pos) {
	geoPos = pos;
}

function include(arquivo){
//By Fabr�cio Magri e Micox
//http://elmicox.blogspot.com/2006/12/include-em-javascript.html
 var novo = document.createElement('script');
 novo.setAttribute('type', 'text/javascript');
 novo.setAttribute('src', arquivo);
 document.getElementsByTagName('head')[0].appendChild(novo);
 //apos a linha acima o navegador inicia o carregamento do arquivo
 //portanto aguarde um pouco at� o navegador baix�-lo. :)
}

function showStopsMap() {
	loc = "http://mesn.org/bestbus/showstopsmap.php?busno=" + busNo + "&s=" + firstStop 
			+ "&d=" + lastStop;
	window.location.href = loc;
	return true;

}

// Send the location and bus info to server
function sendBusInfo(busno, pos, arNearBus, dir)
{
	var xmlhttp=new XMLHttpRequest();

	xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
	//    document.getElementById("txtHint").innerHTML=xmlhttp.responseText;
		}
	  }
	url = "http://mesn.org/bestbus/svr/sendbusinfo.php?b=" + busno + "&lat=" 
					+ pos.coords.latitude + "&lon=" + pos.coords.longitude 
					+ '&a=' + pos.coords.accuracy + '&s=' + arNearBus[STOPNO] 
					+  '&sn=' + arNearBus[SEARCHSTR] + '&d=' + dir;
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}


// Add to the list of recent journeys
function addRecentJourney(oJourney) {
	var rs = localStorage['recentJourneys'];
	
	var recentJourneysPrv;
	if(rs != null)
		recentJourneysPrv = JSON.parse(rs);
	recentJourneys = null;
	var recentJourneys = new Array;
	recentJourneys[0] = oJourney;
	if(recentJourneysPrv !== null && recentJourneysPrv != undefined) {
		for(var i = 0; i < recentJourneysPrv.length; i++) {
			if(recentJourneysPrv[i] === undefined || recentJourneysPrv[i] === null)
				continue;
			// check if already in array, else add
			alreadyThere = false;
			for(var j = 0; j < recentJourneys.length; j++) {
				if(recentJourneys[j].busNo === recentJourneysPrv[i].busNo &&
					recentJourneys[j].firstStop === recentJourneysPrv[i].firstStop &&
					recentJourneys[j].lastStop === recentJourneysPrv[i].lastStop) {
					alreadyThere = true;
					break;
				}
			}
			if(!alreadyThere)
				recentJourneys[recentJourneys.length] = recentJourneysPrv[i];
		}
	}
	localStorage['recentJourneys']=JSON.stringify(recentJourneys);
	showRecentJourneys();
}

function showRecentJourneys() {
	if(localStorage['recentJourneys'] === undefined || localStorage['recentJourneys'] === null)
		return;
	var recentJourneys = JSON.parse(localStorage['recentJourneys']);
	recentJourneysStr = '<table id="recentJourneys" class="tbl_color">';	
	if(recentJourneys === null)
		return;
	if(recentJourneys.length) {
//		recentJourneysStr = '<table id="recentJourneys">';				
		for(var i = 0; i < recentJourneys.length && i < MAXRECENTJOURNEYS; i++) {
			if(recentJourneys[i] !== null && recentJourneys[i] !== undefined 
					&& typeof(recentJourneys[i]) === 'object') {
				elm = '<tr><td><a rel="external" href="journey.html?b=' + recentJourneys[i].busNo + 
					'&s=' + recentJourneys[i].firstStop + '&d=' + recentJourneys[i].lastStop + '">' +
					recentJourneys[i].busNo + '</td><td>' + recentJourneys[i].firstStopName + '</td><td>' + 
						recentJourneys[i].lastStopName + "</a></td></tr>"; 
				recentJourneysStr = recentJourneysStr + elm;
			}
		}
		recentJourneysStr = recentJourneysStr + '</table>';
		document.getElementById("recentJourneys").innerHTML = recentJourneysStr;
	
	}

}

