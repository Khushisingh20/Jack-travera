// Find buses between start and destination stop 
// Parameters: s - startstopnameid to d - deststopnameid
//					

var dBugLvl = 3;
var WALKDIST = 1000; // Find stops within 1 km radius
var NEARLATLON = 0.01;
var CHECKSTOPS = 40;
var SHOWMAXSTOPS = 5;
var MAXBUSESTOSHOW = 4;
var MAXRECENTBUSESFOUND = 7;

var stopLines;
var stopBusLines;
var busMaster;
var oStartStop, oDestStop;	// The stopbus info for start and dest
var startStopArea, destStopArea;
var arBusesFound = [];
var sAr, dAr;		// Array of stops near start and destination

/*
$(document).ready(function() {
//	var XMLFileSupport = CheckXMLHttpFile();
 busesfoundinit();
	return;
});
*/

function busesfoundinit() {
	scrollTo(0, 0);
	s = gup('s');
	d = gup('d');
	if(s === "" && d === "") {
		s = getCookie('cStartStopNameId');
		d = getCookie('cDestStopNameId');
	}
	if(d === "") {
		alert('No Buses Found as yet. Select from the Find Bus tab');
			window.location.href = "index.html";
			return;
	}

	startStopNameId = s;
	destStopNameId = d;
dBug('', ' s = ' + s + ', d = ' + d, 5);
	stopBusLines = getStopBusList();
	busMaster = getbusmaster();
	var sStopSs = findStopId(startStopNameId).stopsrchstr;
	var dStopSs = findStopId(destStopNameId).stopsrchstr;
	var htmlTitle = sStopSs.stopsrchstr + ' <br>' + dStopSs;
	var dirHdr = "<table class='tbl_color' id='directbuses'><tr><th>Stop name</th><th>Buses (frequency)</th></tr>";
	var dirHdrClose = '</table>';
	var htmlBody = '';
	var dHTML = '', nHTML = '', cHTML = '';
	if(startStopNameId !== '')	{ // start not empty, find near stops, needed for all
		rAr = getStopsNear(startStopNameId);
		if(rAr !== null) {
			sAr = rAr.startStops;
			oStartStop = rAr.stopInfo;
		}
		document.getElementById("foundBusFrom").innertHTML = sStopSs;
	}
	if(destStopNameId !== '')	{ // dest not empty, find near stops
		rAr = getStopsNear(destStopNameId);
		dAr = rAr.startStops;
		oDestStop = rAr.stopInfo;
		var el = "To: " + dStopSs;
		document.getElementById("foundBusTo").innertHTML = el;
	}
	if(startStopNameId === '' && destStopNameId !== '') {	// start is blank so stops at destination
		htmlTitle = 'Buses at and near destination: ' + dStopSs;
//		document.getElementById("foundBusTitle").innerHTML = dStopSs; 
		htmlStart = stopsNear(destStopNameId);
		htmlBody = htmlStart;
	}
	else if(startStopNameId !== '' && destStopNameId === '') {
		htmlTitle = 'Buses at and near start: ' + sStopSs;
		htmlDest = stopsNear(startStopNameId);
		
		htmlBody = dirHdr + htmlDest + dirHdrClose;
	}
	else {
		var rtDb = [0, ''];
		var rtNb = [0, ''];
		rtDb = getDirectBuses(oStartStop, oDestStop);
		dHTML = '';
		if(rtDb != undefined) {
			if(rtDb[0]) 
				dHTML = rtDb[1];
			else
				dHTML = '<div class="hilite"> No Direct buses found</div>'; 
			if(rtDb[0] < 3) {
				rtNb = getNearBuses(startStopNameId, destStopNameId);
				if(rtNb[0]) 
					nHTML = rtNb[1];
				else
					if(!rtDb[0])	// no message if we found direct buses
						nHTML = '<div class="hilite"> No buses from nearby stops</div>'; 
			}
		}
		cHTML = '';
		if(arBusesFound.length < 1) {
	//	if(rtDb[0]< 3 && rtNb[0] < 3) {
			rtCb = conxions(startStopNameId, destStopNameId);
			if(rtCb !== null && rtCb[0])
				cHTML = rtCb[1];
			if(rtCb === null || !rtCb[0])	// no message if we found direct buses
				cHTML = '<div class="hilite"> No bus connections</div>'; 
				
	/*		if(cHTML != "")
				fndBus = fndBus + "<br>" + cHTML
			else
				fndBus = fndBus + "<div id='notfound'>" + "No Connections found" + '</div>'; */
		}
//		var dirHdr = '', dirHdrClose = '';
		if((rtDb == undefined || rtDb[0] === 0) && rtNb[0] === 0) {
			dirHdr = "";
			dirHdrClose = '';
		}

		htmlBody = dirHdr + dHTML + nHTML + dirHdrClose + cHTML;
	}		
//	document.getElementById("foundBusTitle").innerHTML = htmlTitle; 
	if (startStopNameId != "")
		if ( destStopNameId != "" )
			document.getElementById("foundBusFrom").innerHTML = "From: " + sStopSs;
		else
			document.getElementById("foundBusFrom").innerHTML = "Buses at and near: " + sStopSs;

	if(destStopNameId != "")
		document.getElementById("foundBusTo").innerHTML = "To: " + dStopSs;
	else
		document.getElementById("foundBusTo").innerHTML = ""; // No dest provided, blank it
		

	if(htmlBody == "")
		htmlBody = "<br>No buses found<br>";
	document.getElementById("directBuses").innerHTML = htmlBody;
	addRecentBusesFound({'busesFrom':sStopSs, 'busesTo':dStopSs, 'busHtml':htmlBody});
	showRecentBusesFound();

}

// Buses from exact start to dest
function getDirectBuses(oStartStop, oDestStop) {	

	dBug('getDirectBuses', 'start', 5);
//	directBuses = "";
	var nDirectBuses = 0;
	rAr = directBus(oStartStop, oDestStop);
	if(rAr === null)
		return null;
	nDirectBuses = rAr[0];
	sDirectBuses = rAr[1];
	dBug('getDirectBuses', nDirectBuses + ', Start: ' + oStartStop.searchstr + ', Dest: ' + oDestStop, 5);  

//	dirHdr = "<tr><th>Stop name</th><th>Buses</th></tr>";
//	sDirectBuses = "<table id='directbuses'>" + dirHdr + "<tr><td>Direct Buses (" + 
//				nDirectBuses + ") </td><td>" + sDirectBuses + "</td></tr>";
	sDirectBuses = "<tr><td>Direct Buses (" + 
				nDirectBuses + ") </td><td>" + sDirectBuses + "</td></tr>";
	
	if(nDirectBuses)
		fndBusDirect = sDirectBuses;
	else
		fndBusDirect = "<div id='notfound'>No direct buses found</div>";

	fndBus = fndBusDirect;
	for(var x=0; x<nDirectBuses; x++)
		arBusesFound[arBusesFound.length] = rAr[2][x][0];

	return [nDirectBuses, fndBusDirect];
}
	
function getNearBuses(startStop, destStop) {	
	// Get the lat, lon of the current stop
	var STOPNAMEID = 0;
	var STOPLAT = 1;
	var STOPLON = 2;
	var startStopIdx = 0;
	var destStopIdx = 0;
	var x = 0;
	
	// Now find stops near start to stops near destination
	// Check for 10 stops before and after since our stops are ordered by lat lon
	// Also within 111 m, 0.001, max 5 stops;
	
	STOPIDX = 0;
	DIIDX = 0;
	
	// Check for near buses from near start to near dest
	var sNearBuses = "";
	var nNearBuses = 0;
	var arNearBuses = [];
	for(x=0; x < sAr.length; x++) {
		for(var y=0; y < dAr.length; y++) { 
			if(sAr[x][1].stopnameid == oStartStop.stopnameid && dAr[y][1].stopnameid == oDestStop)
				continue;
			
			rAr = directBus(sAr[x][1], dAr[y][1]);
			if(rAr[0] === 0)	// No direct buses found, go to the next one
				continue;
			// If the bus in any of the direct buses, skip it
			bFound = false;
			for(a=0; a<rAr[2].length; a++) 
				bFound = checkFoundB4(rAr[2][a][STOPIDX]);

			if(bFound)
				continue;
			
			nNearBuses = rAr[0];
			sBuses = rAr[1];
			distStartStop = sAr[x][DIIDX];
			distDestStop = dAr[y][DIIDX];
			s = distStartStop > 0 ? distStartStop : 0;
			d = distDestStop > 0 ? distDestStop : 0;
			if(nNearBuses) {
				startSearchStr = sAr[x][1].searchstr;
				destSearchStr = dAr[y][1].searchstr;
				if(startStop == sAr[x][STOPIDX])
					arNearBuses[arNearBuses.length] = [d, '', destSearchStr,
									sBuses, nNearBuses, rAr[2]];
//					sNearBuses = sNearBuses + '<tr><td>To ' + destSearchStr + 
//						' (' + nNearBuses + ') </td><td>' + sBuses + '</td></tr>';
				else if(destStop == dAr[y][STOPIDX])
					arNearBuses[arNearBuses.length] = [s, startSearchStr, '',
									sBuses, nNearBuses, rAr[2]];
				
//					sNearBuses = sNearBuses + '<tr><td>From : ' + startSearchStr + 
//						' (' + nNearBuses + ') </td><td>' + sBuses + '</td></tr>';
					else {
						var combDist = '';
						if( distStartStop > 0 || distDestStop > 0) {
							s = distStartStop > 0 ? distStartStop : 0;
							d = distDestStop > 0 ? distDestStop : 0;
//							combDist = '(' + distFormat(s + d)  + ')';
							arNearBuses[arNearBuses.length] = [s+d, startSearchStr, destSearchStr,
									sBuses, nNearBuses, rAr[2]];
						}
					}
							
			}
		}
	}
	arNearBuses.sort(sortDiStop);
	sNearBuses = '';
//	busesDone = [];
	sComma = '';
	sBus = '';
	nNearBuses = 0;
	for(x=0; x<arNearBuses.length; x++) {

		// build string of buses not displayed before - leave out buses already found
		nearBusList = arNearBuses[x][5];
		var busFound = false;
		var busesFoundInRow = 0;
		for(var a=0; a<nearBusList.length; a++) {
			busFound = false;
			for(var b=0; b<arBusesFound.length; b++) {
				if(arBusesFound[b] ==  nearBusList[a][0]) {
					busFound = true;
					busesFoundInRow++;
				}
			}
			if(!busFound) {
				url = 'journey.html?b=' + nearBusList[a][0] + '&s=' + nearBusList[a][1] + '&d=' + nearBusList[a][1] + '"> ' + nearBusList[a][0];
				sBus = sBus + sComma + '<a rel="external" href="javascript:window.location.href=' + url +  '"> ' + nearBusList[a][0] + "</a>" ;
			arBusesFound[arBusesFound.length] =  nearBusList[a][0];
			}
			sComma = ', ';
		}
		if(busesFoundInRow < nearBusList.length) {
			nNearBuses++;
			sNearBuses = sNearBuses + '<tr><td>' + (arNearBuses[x][1] !== "" ? 'From: ' + arNearBuses[x][1] : "");
			sNearBuses = sNearBuses + (arNearBuses[x][2] !== "" ? ' To: ' + arNearBuses[x][2] : "") + ' (' + arNearBuses[x][4] + ')  - ' + distFormat(arNearBuses[x][0]) + '</td><td>' + arNearBuses[x][3] + '</td></tr>';
		}
		
		if(arBusesFound.length >= MAXBUSESTOSHOW)
			break;
	}

	/*	if(!nDirectBuses)
		sNearBuses = "<table id='directbuses'>" + "<tr><th>Stop name</th><th>Buses</th></tr>"
						+ sNearBuses;
*/
	if(nNearBuses) {
		fndBus = fndBus + "<tr><td><h3>From stops near you:</h3></td></tr>";
		fndBus = fndBus +  sNearBuses;
	}
	else
		fndBus = fndBus + "<div id='notfound'>No near buses found</div>";
	
	// No direct or near buses found, look for connections

	return [nNearBuses, sNearBuses];
	
}
	
	


function directBus(oSStop, oDStop) {

	if(oSStop === undefined || oDStop === undefined)
		return null;
	dBug("directBus", "start", 5);
	var sDirectBus = '';
	var nDirectBus = 0;
	var startBuses = '';
	var destBuses = '';
	var x = 0;
	// Get the buses at the start and destination stops
	arStartBus = oSStop.busList.split(", ");
	arDestBus = oDStop.busList.split(", ");
	sComma = "";
	var retArray = [];
	var dBus = [];
	for(x=0; x < arStartBus.length; x++) {
		sb = arStartBus[x].split("|");
		for(var y=0; y < arDestBus.length; y++) { 
			db = arDestBus[y].split("|");
			if(sb[0] == db[0]) {
				busInfo = getBusInfo(sb[0]);
				busfreq = "";
				if(busInfo != undefined && busInfo.frequency !="")
					busfreq = "&nbsp;(&nbsp;" + busInfo.frequency + "&nbsp;mins)";
				url = 'journey.html?b=' +  sb[0] + '&s=' +  sb[1] + '&d=' + db[1]; 
url = '#';
				sDirectBus = sDirectBus + sComma + buildUrl(sb[0], sb[1], db[1]);
				nDirectBus++;
				sComma = ", &nbsp;";
				dBus[dBus.length] = [sb[0], sb[1], db[1]];
			}
		}		
	}
	retArray = [nDirectBus, sDirectBus, dBus];
	return retArray;

}


// Find connections - change bus at one point between start and destination
function conxions(startStop, destStop) {
	if(startStop == undefined || destStop == undefined)
		return null;
	var AREA = 0;
	var STOPNAMEID = 1;
	var SEARCHSTR = 2;
	var LAT = 3;
	var LON = 4;
	var BUSLIST = 5;
	var MAXROUTES = 5;
	var commonBus = new Array();
//	var sCB = new Array();
//	var dCB = new Array();
	var arBestDist = [];
	var areas = getAreas();
	var startBuses = '';
	var destBuses = '';
	var htmCommonStops = "";
	
	// first get the stop info

	if(oStartStop == undefined || oDestStop == undefined)
		return null;

	startBuses = oStartStop.busList;
	destBuses = oDestStop.busList;
	var startAreaLat = 0; 	var startAreaLon = 0; var destAreaLat = 0; 	var destAreaLon = 0;
	for(var i=0; i<areas.length; i++) {
		if(oStartStop.area == areas[i][0]) {
			startAreaLat = areas[i][1];
			startAreaLon = areas[i][2];
		}
		if(oDestStop.area == areas[i][0]) {
			destAreaLat = areas[i][1];
			destAreaLon = areas[i][2];
		}
	}
	nwLat = startAreaLat; nwLon = startAreaLon; seLat = destAreaLat; seLon = destAreaLon;
	if( startAreaLat < destAreaLat ) {
		nwLat = destAreaLat;
		seLat = startAreaLat;
	}
	if( startAreaLon > destAreaLon) {
		nwLon = destAreaLon;
		seLon = startAreaLon;
	}

	arStartBuses = startBuses.split(", ");
	arDestBuses = destBuses.split(", ");
	var commonStops = [];
	bStartFound = false;
	bDestFound = false;
			br = "<br>";
	var n = 1;
	curStop = "";			
	curSb = ""; curDb = "";
	
	
	for(x=0; x < stopBusLines.length; x++) {
//	dBug('conxion: ', 'checking common stops - ' + x, 5);
		if(stopBusLines[x] !== "") {
			ar = stopBusLines[x]; // ["138048", "10throad", "[Chembur W] 10Th Road", "8 L|34, 19 L|29, 92 L|48, 355 L|14, 362|2, 364|17"]
			// Check whether the area of this stop is within the square start and dest
			if(ar[LAT] > nwLat || ar[LON] > seLon || ar[LAT] < seLat || ar[LON] < nwLon)
				continue;
			sCb = ""; dCb = "";// Source and dest common buses
			
			buses = ar[BUSLIST].split(", "); // ["8 L|34", "19 L|29", "92 L|48" ....]
			// check if the stop has a bus in start and a bus in destination
			bStartFound = false; bDestFound = false;
			sCb = ''; sComma = ""; dCb = ''; dComma = "";
			for(var c=0; c<buses.length;c++) {
				bus = buses[c].split('|');
				for(var y=0; y<arStartBuses.length; y++) {	
					sb = arStartBuses[y].split("|"); // ["A 70 Exp AC Exp", "13"] - bus, stopno.
					if(bus[0] == sb[0] && !checkFoundB4(sb[0]))	{// start bus found, check if dest bus there
						bStartFound = true;
						busInfo = getBusInfo(sb[0]);
						busfreq = "";
						if(busInfo.frequency != undefined)
							busfreq = "&nbsp;(&nbsp;" + busInfo.frequency + "&nbsp;mins)";
	
						sCb = sCb + sComma + '<a rel="external" href="journey.html?b=' +  sb[0] + 
							'&s=' + sb[1] +  '&d=' + bus[1] + '"> ' + sb[0] + busfreq + "</a>";
					
						sComma = ", ";
					}
				}
				for(var z=0; z<arDestBuses.length; z++) {
					db = arDestBuses[z].split('|');
					if(bus[0] == db[0]) {
						bDestFound = true;
						busInfo = getBusInfo(sb[0]);
						busfreq = "";
						if(busInfo.frequency != undefined)
							busfreq = " ( " + busInfo.frequency + " mins)";

					dCb = dCb + dComma + '<a rel="external" href="journey.html?b=' + db[0] +'&s=' + bus[1] + '&d=' + db[1] +  '"> ' + db[0] + busfreq + "</a>";
//						dCb = dCb + dComma + db;
						dComma = ", ";
					}
				}
			}
			if(bStartFound && bDestFound) {
			dBug('conxions: ', 'Found stop', 5);
					var csLat = 0; var csLon = 0; var diStart = -1, diDest = -1;
					for(i=0; i<areas.length; i++) {
						if(ar[AREA] == areas[i][0]) {
							csLat = areas[i][1];
							csLon = areas[i][2];
							diStart = distanceLatLon(csLat, csLon, startAreaLat, startAreaLon);
							diDest = distanceLatLon(csLat, csLon, destAreaLat, destAreaLon);
						}
					}
						combDist = -1;
						if(diStart > 0 && diDest > 0) {
							combDist = diStart + diDest;
							arBestDist[combDist] = 
								[ar[STOPNAMEID], ar[SEARCHSTR], sCb, dCb, combDist];
								
			dBug('conxions: ', 'Comb. dist - ' + combDist, 5);
						}
						// Check if this bus is in the direct or near buses, if so skip
						
						
						commonStops[commonStops.length] = 
							[ar[STOPNAMEID], ar[SEARCHSTR], sCb, dCb, combDist];
						n++;
					
			}
			
		}
	}
	dBug('conxions: ', 'found - ' + arBestDist.length, 5);
	htmCommonStops = "";
	var nStops = 0;
	for(y=0; y<arBestDist.length; y++) {
		if(arBestDist[y] != undefined) {
			htmCommonStops = htmCommonStops + "<tr><td>" + arBestDist[y][1] + " (" + distFormat(arBestDist[y][4]) + ")</td><td>" + arBestDist[y][2] + "</td><td>" + arBestDist[y][3] + "</td><td></tr>";
			nStops++;
			dBug('conxions', arBestDist[y][1] + " (" + distFormat(arBestDist[y][4]), 5);
			if(nStops > MAXROUTES) 
			
				break;
		}
	}					
	if (!nStops) {
		for(x=0; x<commonStops.length; x++) {
			htmCommonStops = htmCommonStops + "<tr><td>" + commonStops[x][1] + ")</td><td>" 
				+ commonStops[x][2] + "</td><td>" + commonStops[x][3] + "</td><td></tr>";
		}
	}
	htmHdr = "<tr><th>Connecting Stop</th><th>Buses from start</th><th>Buses to Destination</th></tr>";						
	htmCommonStops = '<table class="tbl_color">' + htmHdr + htmCommonStops + "</table>";

	return [nStops, htmCommonStops];
}


// Check if bus already found 
function checkFoundB4(busno) {
	if(busno == undefined)
		return false;
	var bFound = false;
	for(b=0; b<arBusesFound.length; b++) {
		if(busno.replace(/ /g, '') == arBusesFound[b].replace(/ /g, ''))
			bFound = true;
	}
	return bFound;
}

function stopsNear(startStop) {
	var STOPNAMEID = 0;
	var STOPLAT = 1;
	var STOPLON = 2;
	var startStopIdx = 0;
	var destStopIdx = 0;
	var bStopFound = false;
		
	var rHTML = '';
	var arNearStopBuses = [];
	for(x=0; x<sAr.length  && x < SHOWMAXSTOPS; x++) {
		stopInfo = sAr[x][1];
/*		if(sAr[x][0] === 0)	// Its this stop, so we don't need it
			continue; */
		sBus = '';
		sComma = '';
		arStopBus = stopInfo.busList.split(", ");
		arBusesAtStop = [];
		var nNewBus = 0;
		var nBusesAtStop = 0;
		for(var y=0; y < arStopBus.length; y++) { 
			stopbus = arStopBus[y].split("|");
			
			var bBusFound = false;
			for(var a=0; a<arNearStopBuses.length; a++) {
				if(stopbus[0] == arNearStopBuses[a]) {
					bBusFound = true;
					break;
				}
			}
			if(!bBusFound) {
				arNearStopBuses[arNearStopBuses.length] = stopbus[0];
				nNewBus++;

			}
//			arBusesAtStop[arBuesesAtStop.length] = stopbus[0];
			sBus = sBus + sComma + '<a href="journey.html?b=' + stopbus[0] + '&s=0&d=0"> ' + stopbus[0]  + "</a>" ;
					sComma = ", &nbsp;";
		}
		if(nNewBus) {
			rHTML = rHTML + '<tr><td>' + stopInfo.searchstr + ' (' + distFormat(sAr[x][0]) + ')</td><td>';
			rHTML = rHTML + sBus + '</td></tr>'; 
		}
	}				

	return rHTML;
	
}

// Sort the distance, stops array by the shortest distance
function sortDiStop(a, b) {
	return ((a[0] < b[0]) ? -1 : ((a[0] > b[0]) ? 1 : 0));
}

function getStopInfo(stopnameid) {
	var oBus = null;
	for(x=0; x < stopBusLines.length; x++) {
		if(stopBusLines[x] !== "") {
			ar = stopBusLines[x];
			stopname = ar[1];
			if(stopname == stopnameid) {
				oBus = {"area":ar[0], "stopnameid":ar[1], "searchstr":ar[2],
								"lat":ar[3], "lon":ar[4], "busList":ar[5]};
				break;
			}
		}
	}
	return oBus;
}


function getStopsNear(stopNameId) {
	var STOPNAMEID = 0;
	var STOPLAT = 1;
	var STOPLON = 2;
	var startStopIdx = 0;
	var destStopIdx = 0;
	var bStopFound = false;
	oStop = getStopInfo(stopNameId);
	if(oStop === null)
		return 	null;
	var sAr = [];
	for(x=0; x < stopBusLines.length && oStop != null; x++) {
		var ar = stopBusLines[x];
		if(ar[3] != undefined && ar[4] != undefined) {
			if(oStop.lat != undefined && Math.abs(oStop.lat - ar[3]) < NEARLATLON &&
				Math.abs(oStop.lon - ar[4]) < NEARLATLON) {
				di = distanceLatLon(ar[3], ar[4], oStop.lat, oStop.lon);
				if( di < WALKDIST)
					sAr[sAr.length] = [di, {"area":ar[0], "stopnameid":ar[1], 
								"searchstr":ar[2], "lat":ar[3], "lon":ar[4], "busList":ar[5]}];
			}
		}
	}
	sAr.sort(sortDiStop);
	// Check if source and destination stops are there 
	// If not prolly because lat lon  not there add them
	var SHOWMAXSTOPS = 5;
	var stopFound = false;
	for(x=0; x<sAr.length; x++) {
		if(sAr[x][1] == stopNameId) {
			stopFound = true;
			break;
		}
	}
	if(!stopFound)
		sAr[sAr.length] = [0, oStop];

	return 	{ "startStops":sAr, "stopInfo":oStop };

	
}

// Add to the list of recent BusesFound
function addRecentBusesFound(oBusesFound) {
	var rs = localStorage['recentBusesFound'];
	
	var recentBusesFoundPrv;
	if(rs != null)
		recentBusesFoundPrv = JSON.parse(rs);
	recentBusesFound = null;
	var recentBusesFound = new Array;
	recentBusesFound[0] = oBusesFound;
	if(recentBusesFoundPrv !== null && recentBusesFoundPrv != undefined) {
		for(var i = 0; i < recentBusesFoundPrv.length; i++) {
			if(recentBusesFoundPrv[i] === undefined || recentBusesFoundPrv[i] === null)
				continue;
			// check if already in array, else add
			alreadyThere = false;
			for(var j = 0; j < recentBusesFound.length; j++) {
				if(recentBusesFound[j].busHtml === recentBusesFoundPrv[i].busHtml) {
					alreadyThere = true;
					break;
				}
			}
			if(!alreadyThere)
				recentBusesFound[recentBusesFound.length] = recentBusesFoundPrv[i];
		}
	}
	localStorage['recentBusesFound']=JSON.stringify(recentBusesFound);
}

function showRecentBusesFound() {
	if(localStorage['recentBusesFound'] === undefined || localStorage['recentBusesFound'] === null)
		return;
	var recentBusesFound = JSON.parse(localStorage['recentBusesFound']);
	recentBusesFoundStr = '<table id="recentBusesFound" class="tbl_color">';	
	if(recentBusesFound === null)
		return;
	if(recentBusesFound.length) {
//		recentBusesFoundStr = '<table id="recentBusesFound">';				
		for(var i = 1; i < recentBusesFound.length && i < MAXRECENTBUSESFOUND; i++) {
			if(recentBusesFound[i] !== null && recentBusesFound[i] !== undefined 
					&& typeof(recentBusesFound[i]) === 'object') {
				elm = recentBusesFound[i].busesFrom + '<br>' + 
						recentBusesFound[i].busesTo + '<br>' + 
						recentBusesFound[i].busHtml + '<br>';
				recentBusesFoundStr = recentBusesFoundStr + elm;
			}
		}
		recentBusesFoundStr = recentBusesFoundStr + '</table>';
		document.getElementById("recentBusesFound").innerHTML = recentBusesFoundStr;
	
	}

}

