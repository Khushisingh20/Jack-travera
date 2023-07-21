// findbus.js
/*
var getStopNames, getStopLatLon, getCookie, setCookie, getWinDim, getLocation, 
	updateDestInfo, BrowserLevel, findNearestStop, updateStartInfo, goLinkBusesFound, findStop,
	getCombo, setGeoPos, distanceLatLon, window;
*/

var startVld;
startVld = false;
var selectedInput = 1;
var dBugLvl = 3;
var phoneIA = true; // Iphone or Android

var stopNames;
var busMaster;
var gStartStop = {'id':'', 'value':''};
var gDestStop = {'id':'', 'value':''};
var geoPos;
var NEARLAT = 0.01;
var firstLoad = true;
var oNearestStop = null;
var arBusList;
var stopBus;
var selectedStop;
var near_stop;
var MAXRECENTSTOPS = 7;

$(document).ready(function () {

	var sStop, dStop, sId, dId, w;
	stopNames = getStopNames();	
	stopLatLon = getStopLatLon();
	busMaster = getbusmaster();
	arBusList = getbuslist();
	stopBus = getStopBusList();
	
    scrollTo(0, 0); 
	console.log('In index.js before initStops()');
	initStops();
//	w = getWinDim();
//	$('#startStop').width(w.wd * 0.90);
	$('#startStop').width("95%");
	$('#startStop').height('18px');
	$('#startStop').css('font-size', '16px');
	
	$('#destStop').width("95%");
	$('#destStop').height('18px');
	$('#destStop').css('font-size', '16px');

	getLocation();	// runs setGeoPos(pos), showLocation(pos)
	PopulateAllBusList();
	PopulateOtherBusLists();
	activateList('ALL');

	showRecentStops();
//		$("#startStop").focus();
	document.getElementById('busNoCombo').checked = true;

		
$(function () {
	$("#startStop").autocomplete({
		source: function(req, response) {
			var re = $.ui.autocomplete.escapeRegex(req.term);
			re = re.toLowerCase();
			stopid = re.replace(/[^a-zA-Z0-9]+/g,'');
			var len = stopid.length;
			var i = 0;
			matchArr = [];
			for(var j=0; j<stopNames.length; j++) {
				if(stopid == stopNames[j][0].toLowerCase().substring(0, len)) {
					matchArr[i] = createOStop(stopNames[j]);
					i = i + 1;
				}
			}
			if(!matchArr.length) { // No matching areas found, look for stops
				for(var j=0; j<stopNames.length; j++) {
					if(stopNames[j][3].indexOf(stopid) >= 0) {
					matchArr[i] = createOStop(stopNames[j]);
					i = i + 1;
					}
				}
			}
			response(matchArr);
			},
		minLength: 2,
		select: function(event, ui) {
			$('#startStop').val(ui.item.value);
			setStart(ui.item);
			$('#destStop').focus();
		} /* ,
		focus: function(event, ui) {
		$('#startStop').autocomplete("close").val(ui.item.value)
		}
*/		
 //        $('#abbrev').val(ui.item.abbrev);
	});
	$('#startStop').focus(function() {
		selectedInput = 1;
	});
	
	
	$('#destStop').autocomplete({
	source: function(req, response) {
	    var re = $.ui.autocomplete.escapeRegex(req.term);
		re = re.toLowerCase();
		stopid = re.replace(/[^a-zA-Z0-9]+/g,'');
		var len = stopid.length;
		var i = 0;
		matchArr = [];
		for(var j=0; j<stopNames.length; j++) {
			if(stopid == stopNames[j][0].toLowerCase().substring(0, len)) {
				matchArr[i] = createOStop(stopNames[j]);
//				{'id':stopNames[j][3], 'label':stopNames[j][0] + ': ' + stopNames[j][1] + ' ' + stopNames[j][2],
//									'area':stopNames[j][0], 'value':stopNames[j][1], 'stopname':stopNames[j][2]};
				i = i + 1;
			}
		}
		if(!matchArr.length) { // No matching areas found, look for stops
			for(var j=0; j<stopNames.length; j++) {
				if(stopNames[j][3].indexOf(stopid) >= 0) {
				matchArr[i] = createOStop(stopNames[j]);
//				{'id':stopNames[j][3], 'label':stopNames[j][0] + ': ' + stopNames[j][1] + ' ' + stopNames[j][2],
//									'area':stopNames[j][0], 'value':stopNames[j][1], 'stopname':stopNames[j][2]};
				i = i + 1;
				}
			}
		}
		response(matchArr);
//	    response($.grep(stopNames, function(item){return matcher.test(item[0]); }) );
	    },
      minLength: 2,
      select: function(event, ui) {
			$('#destStopId').val(ui.item.id);
			setCookie('cDestStop', ui.item.value, 1);
			setCookie('cDestStopNameId', ui.item.id, 1);
//			addRecentStop(ui.item.value);
			setDest(ui.item);
			$('#fndBusBtn').focus();
		} /*,
		focus: function(event, ui) {
		$('#destStop').autocomplete("close").val(ui.item.value)
		}
		*/
	}); 
	$('#destStop').focus(function() {
		selectedInput = 2;
	});

	$("#busNo").autocomplete({
		source: function(req, response) {
			var re = $.ui.autocomplete.escapeRegex(req.term);
			re = re.toLowerCase();
			var len = re.length;
			var i = 0;
			matchArr = [];
			for(var j=0; j<arBusList.length; j++) {
				if(re == arBusList[j][0].toLowerCase().substring(0, len)
						|| re == arBusList[j][1].toLowerCase().substring(0, len)) {
					matchArr[i] = arBusList[j][1];
					i = i + 1;
				}
			}

			response(matchArr);
			} /*,
			focus: function(event, ui) {
			$('#busNo').autocomplete("close").val(ui.item.value)
			}
			*/
	});	

});	

	function handle_error(err) {
	  if (err.code === 1) {
		return 1;// user said no!
	  }
	}
	function get_position() {
	 alert('Getting position');
	}

	
	function myLocStop() {
		$('#startStop').val(document.getElementById('nearStop').value);
//		sessionStorage.startStop = document.getElementById('nearStop').value;
		setCookie('cStartStop', document.getElementById('nearStop').value, 1);

		$('#startStopId').val(document.getElementById('nearStopId').value);
		setCookie('cStartStopId', document.getElementById('nearStopId').value, 1);
		
//		sessionStorage.startStopId = document.getElementById('nearStopId').value;
		 updateStartInfo('n');
	}

});


function showLocation(pos) { // Stops near you
		if(typeof(document.getElementById("myLoc")) === 'undefined')
			return;	// dom not loaded as yet
		var resparr, contentString, x, near_stop, elm;
		resparr = findNearestStop(pos);
		contentString = '<table id="myLoc" class="tbl_color">';				
		if (resparr !== null) {
			for (x = 0; x < resparr.length; x += 1) {
				near_stop = resparr[x];
				if(x === 0) { // Nearest stop and area
					oNearestStop = near_stop;
					document.getElementById('stopsnearyou').innerHTML = 'Nearby Stops (' + near_stop.area + ')';
					setStart(near_stop);
				}

				elm = '<tr><td><a href="javascript:popStart({\'di\':' + x + ',\'id\':\'' +
					near_stop.id + '\', \'area\': \'' + near_stop.area + 
					'\', \'stopname\': \'' + near_stop.stopname + '\', \'landmark\': \'' + 
					near_stop.landmark + '\', \'stopnameext\': \'' + near_stop.stopnameext + '\'})">' +
					near_stop.stopname + "</td><td>" + near_stop.di + "&nbsp;m" + "</a></td></tr>"; 

					contentString = contentString + elm;
				if (x >= 2) {// Show 2 nearest stops
					break; }
			}	
		} else {
			contentString = contentString + '<tr><td>' + 'No stops near you found' + '</td></tr>'; }

		if(firstLoad) {
			if(oNearestStop !== null) {
				$("#startStop").val(oNearestStop.stopname);
//				document.myForm.startStop.value = oNearestStop.stopname;
				showRoutesAtStop(oNearestStop);
				$('#destStop').focus();
				firstLoad = false;
			}
		}
		contentString = contentString + '</tbody></table>';
		document.getElementById("myLoc").innerHTML = contentString;
		
		setCookie('cMyLat', pos.coords.latitude, 1);
		setCookie('cMyLon', pos.coords.longitude, 1);
	}

// set the local variable so it can be used in this js file
function setGeoPos(pos) {
	geoPos = pos;
}

function findNearestStop(pos) {
	var nearStop, retNearStop, x, y, dLat, dLon, di;
	nearStop = [];
	retNearStop = [];
	y = 0;
	for (x = 0; x < stopLatLon.length; x += 1) {
		dLat = parseFloat(stopLatLon[x][1]);
		dLon = parseFloat(stopLatLon[x][2]);
		if (Math.abs(pos.coords.latitude - dLat) < NEARLAT  
			|| Math.abs(pos.coords.longitude - dLon) < NEARLAT) {
			di = distanceLatLon(pos.coords.latitude, pos.coords.longitude,
						dLat, dLon);
			if (di < 750) {
				nearStop[di] = stopLatLon[x][0];
				y += 1;
			}
		}
	}
	for (x = 0; x < nearStop.length; x += 1) {
		if (nearStop[x] !== undefined) {
			for (y = 0; y < stopNames.length; y += 1) {
				if (stopNames[y][3] === nearStop[x]) {
					var sname = stopNames[y][1];
					var lmark = stopNames[y][2];
					
					stopnameext = lmark !== null ? sname + ' /' + lmark : sname;
					retNearStop[retNearStop.length] = {"di": x, "id": stopNames[y][3], 
						"area": stopNames[y][0], "stopname": stopNames[y][1], 
						"landmark": stopNames[y][2], 'stopnameext':stopnameext};
					break;
				}
			}
//			retNearStop[retNearStop.length] = {"di":x, "stopnameid":nearStop[x]};
		}
	}
	return retNearStop;
}

// fn run on submit find bus form
function validateFindBusForm() {
 // document.getElementById("loading").className = "loading-visible";
	var loc, sNameId, dNameId, rSFound, 
		nomatch, rDFound, bSMatch, bDMatch, w;
	loc = '';
	sNameId = ''; dNameId = '';
	if (gStartStop.id === '' && gDestStop.id === '') {
		alert('Enter a start stop or a start and destination stop');
		return false;
	}
	if (gStartStop.id === '' && gDestStop.id !== '') {
		alert('To check buses near a stop enter only start stop');
		return false;
	}
	if (gStartStop.id !== '' && gDestStop.id === '') { // empty destination - display info for start stop
		if (gStartStop !== undefined && gStartStop.id !== "") {// came from autocomplete, we already have stopnameid 
			sNameId = gStartStop.id;
			dNameId = '';
			loc = "busesfound.html?s=" + gStartStop.id; 
		} 
	}  // We have both a start and destination entered by user
	if (gStartStop !== null && gDestStop.id !== null) {
			sNameId = gStartStop.id;
			dNameId = gDestStop.id;
			loc = "busesfound.html?s=" + gStartStop.id + "&d=" + gDestStop.id; 
	} 
	
	if (loc !== '') {		
		goLinkBusesFound(gStartStop.id, gDestStop.id);
		return false;
	}
//		window.location = loc;
	return;
	

}

function goLinkBusesFound(startStopNameId, destStopNameId) {
	var d;
	setCookie("cStartStopNameId", startStopNameId, 1);
	setCookie("cDestStopNameId", destStopNameId, 1);
	if (startStopNameId !== "") {
		d = destStopNameId !== "" ? "&d=" + destStopNameId : "";
		window.location = "busesfound.html"; 
//		window.location = "busesfound.html?s=" + startStopNameId + d; 
	}
	return false;

}


// Show the bus nos. at a stop
// input stop object
function showRoutesAtStop(oStop) {	// Bus routes at start - buses at start
	var busList = null;

	document.getElementById("busroutesatstart").innerHTML = 'Buses at ' + oStop.stopname + ' (' + oStop.area + ')'; 

	for(var i = 0; i < stopBus.length; i++) {
		if(stopBus[i][1] == oStop.id) {
				busList = stopBus[i][5];
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
			
			sBusNo = busNo.replace(/ /g, '&nbsp;').replace('Exp AC Exp', 'AC Exp');
			url = '<a href="#"' + ' onClick="return goLinkBusRoute(' + "'" + busNo + "'" 
				+ ', 0, 0)' + '">' + '<span style="font-weight:bold; width:15%;">' 
				+ sBusNo + '</span>' +
				'</td><td>' + firstStop + ' - ' + lastStop + 
				'</td><td>' + busfreq + "</a>" ;

			routesAtStopStr = routesAtStopStr + '<tr><td>' + url +  "</a></td></tr>";
//			routesAtStopStr = routesAtStopStr + '<tr><td>' + recentStops[i] + '</td></tr>';
		}

		routesAtStopStr = routesAtStopStr + '</table>';
		document.getElementById("routesAtStop").innerHTML = routesAtStopStr;
	}
}

// Clear start or destination fields
function clearInput()
{
	if (selectedInput === 1) {
		document.getElementById("startStop").value =  "";
		setCookie('cStartStop', "", 1);
		setCookie('cStartStopNameId', 0, 1);
		setCookie('cStartStopInfo', 0, 1);
		$("#startStop").focus();
		gStartStop = null;

	} else {
		document.getElementById("destStop").value =  "";
		setCookie('cDestStop', "", 1);
		setCookie('cDestStopNameId', 0, 1);
		setCookie('cDestStopInfo', 0, 1);
		$("#destStop").focus();
		gDestStop = null;

	}
}

// Stuff value from link into start field
function popStart(oStop) {
	$("#startStop").val(oStop.stopname);
	setStart(oStop);
	$("#destStop").focus();

}

// Stuff value from link into the input field

function popStop(oStop) {
	if(selectedInput === 1) {
		$("#startStop").val(oStop.stopname);
		setCookie('cStartStop', oStop.stopname, 1);
		setStart(oStop);
		$("#destStop").focus();
	} else if(selectedInput === 2) {
		$("#destStop").val(oStop.stopname);
		setCookie('cDestStop', oStop.stopname, 1);
		setDest(oStop);
		$("#findBus").focus();

	}
}



function setStart(oStop) {
	gStartStop = oStop;
	localStorage['startStop']=JSON.stringify(gStartStop);
	setCookie('cStartStop', oStop.stopname, 1);
	setCookie('cStartStopNameId', oStop.id, 1);
	addRecentStop(oStop);
	showRoutesAtStop(oStop);
}

function setDest(oStop) {
	gDestStop = oStop;
	localStorage['destStop']=JSON.stringify(gDestStop);
	setCookie('cDestStop', oStop.stopname, 1);
	setCookie('cDestStopNameId', oStop.id, 1);
	addRecentStop(oStop);
}

// Initialize the input fields, start and destination from cookies/loca storage
function initStops() {
	
	if(typeof(localStorage['destStop']) !== 'undefined')
	if(localStorage['startStop'] !== null && localStorage['startStop'] !== 'undefined') {
		gStartStop = JSON.parse(localStorage['startStop']);
		$("#startStop").val(gStartStop.stopname);
	}
	if(typeof(localStorage['destStop']) !== 'undefined')
	if(localStorage['destStop'] !== null && localStorage['destStop'] !== 'undefined') {
		gDestStop = JSON.parse(localStorage['destStop']);
		$("#destStop").val(gDestStop.stopname);
	}
}

// Add to the list of recent stops
function addRecentStop(oStop) {
	var rs = localStorage['recentStops'];
	
	var recentStopsPrv;
	if(rs != null)
		recentStopsPrv = JSON.parse(rs);
	recentStops = null;
	var recentStops = new Array;
	recentStops[0] = oStop;
	if(recentStopsPrv !== null && recentStopsPrv != undefined) {
		for(var i = 0; i < recentStopsPrv.length; i++) {
			if(recentStopsPrv[i] === undefined || recentStopsPrv[i] === null)
				continue;
			// check if already in array, else add
			alreadyThere = false;
			for(var j = 0; j < recentStops.length; j++) {
				if(recentStops[j].stopname === recentStopsPrv[i].stopname) {
					alreadyThere = true;
					break;
				}
			}
			if(!alreadyThere)
				recentStops[recentStops.length] = recentStopsPrv[i];
		}
	}
	localStorage['recentStops']=JSON.stringify(recentStops);
	showRecentStops();
}

function showRecentStops() {

	if(localStorage['recentStops'] === undefined || localStorage['recentStops'] === null)
		return;

	var recentStops = JSON.parse(localStorage['recentStops']);
	recentStopsStr = '<table id="recentStops" class="tbl_color">';	
	if(recentStops === null)
		return;
	if(recentStops.length) {
//		recentStopsStr = '<table id="recentStops">';				
		for(var i = 0; i < recentStops.length && i < MAXRECENTSTOPS; i++) {
			if(recentStops[i] !== null && recentStops[i] !== undefined && typeof(recentStops[i]) === 'object') {
				lmark = typeof(recentStops[i].landmark) == 'undefined' || recentStops[i].landmark == 'undefined' 
					? '' :  recentStops[i].landmark;
				elm = '<tr><td><a href="javascript:popStop({\'id\':\'' +
					recentStops[i].id + '\', \'area\': \'' + recentStops[i].area + 
					'\', \'stopname\': \'' + recentStops[i].stopname + '\', \'landmark\': \'' + 
					recentStops[i].landmark + '\', \'stopnameext\': \'' + recentStops[i].stopnameext + '\'})">' +
					recentStops[i].stopname + '</td><td>' + recentStops[i].area + '</td><td>' + lmark 
					+ "</a></td></tr>"; 
				recentStopsStr = recentStopsStr + elm;
			}
		}
		recentStopsStr = recentStopsStr + '</table>';
		document.getElementById("recentStops").innerHTML = recentStopsStr;
	
	}

}

function showR() {
	b = $('#busNo').val(); 
	if(b === '')
		alert('Please type a Bus no. before hitting Select Route');
	else
		showRouteComplete();
}
function createOStop(os) {
	return {'id':os[3], 'label':os[0] + ': ' + os[1] + ' ' + os[2],
				'area':os[0], 'value':os[1], 'stopname':os[1], 'landmark':os[2]};

}

function activateList(cList) {

	document.getElementById('busNoCombo').style.display = 'none';
	document.getElementById('oBus').style.display = 'none';
	document.getElementById('lBus').style.display = 'none';
	document.getElementById('aBus').style.display = 'none';
	document.getElementById('asBus').style.display = 'none';
	document.getElementById('cBus').style.display = 'none';
	
	
	if(cList === "ALL")
		document.getElementById('busNoCombo').style.display='block';
	else if(cList === "O")
		document.getElementById('oBus').style.display='block';
	else if(cList === "L")
		document.getElementById('lBus').style.display='block';
	else if(cList === "A")
		document.getElementById('aBus').style.display='block';
	else if(cList === "AS")
		document.getElementById('asBus').style.display='block';
	else if(cList === "C")
		document.getElementById('cBus').style.display='block';
	
}	




