/*
/*
var getStopNames, getCookie, setCookie, getWinDim, getLocation, 
	updateDestInfo, BrowserLevel, findNearestStop, updateStartInfo, goLinkBusesFound, findStop,
	getCombo, setGeoPos, distanceLatLon, window;
*/

var firstLoad = true;
var arStopNames, arBusMaster, arBusList, arStopBus;
var gStartStop, gDestStop;
var gaoNearStops = null; //Array of near stop objects
var goNearestStop = null;
var MAXRECENTSTOPS = 7;
var selectedInput = 1;
var goCurStop = {'id':''};

$(document).ready(function () {

	arStopNames = getStopNames();	
	arBusMaster = getbusmaster();
	arBusList = getbuslist();
	arStopBus = getStopBusList();

	scrollTo(0, 0); 

	getLocation();	// runs setGeoPos(pos), showLocation(pos)
	
	PopulateAllBusList();
	PopulateOtherBusLists();
	activateList('ALL');
	initStops();
	showRecentStops();
//		$("#startStop").focus();
	document.getElementById('busNoCombo').checked = true;
	
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


	

});
	
// set the local variable so it can be used in this js file
function setGeoPos(pos) {
	geoPos = pos;
}

function showLocation(pos) { // Stops near you

if(typeof(document.getElementById("myLoc")) === 'undefined')
	return;	// dom not loaded as yet
var aoNearStops = [];
var oNearestStop, contentString, x, oNearStop, elm;
aoNearStops = findNearStops(pos);
contentString = '<table id="myLoc" class="tbl_color">';				
if (aoNearStops !== null) {
	for (x = 0; x < aoNearStops.length; x += 1) {
		oNearStop = aoNearStops[x];
		if(x === 0) { // Nearest stop and area
			goNearestStop = oNearStop;
			document.getElementById('stopsnearyou').innerHTML = 'Nearby Stops (' + oNearStop.area + ')';
			setStart(oNearStop);
		}

		elm = '<tr><td><a href="javascript:popStop({\'di\':' + x + ',\'id\':\'' +
			oNearStop.id + '\', \'area\': \'' + oNearStop.area + 
			'\', \'stopname\': \'' + oNearStop.stopname + '\', \'landmark\': \'' + 
			oNearStop.landmark + '\', \'stopnameext\': \'' + oNearStop.stopnameext + '\'}, 1)">' +
			oNearStop.stopname + "</td><td>" + oNearStop.di + "&nbsp;m" + "</a></td></tr>"; 

			contentString = contentString + elm;
		if (x >= 2) {// Show 2 nearest stops
			break; }
	}	
} else {
	contentString = contentString + '<tr><td>' + 'No stops near you found' + '</td></tr>'; }

if(firstLoad) {
	if(goNearestStop !== null) {
		$("#startStop").val(goNearestStop.stopname);
		showRoutesAtStop(goNearestStop, 'Buses at ' + goNearestStop.stopname + ' ');
		$('#destStop').focus();
		firstLoad = false;
	}
}
contentString = contentString + '</tbody></table>';
document.getElementById("myLoc").innerHTML = contentString;

setCookie('cMyLat', pos.coords.latitude, 1);
setCookie('cMyLon', pos.coords.longitude, 1);
}


function setStart(oStop) {
	gStartStop = oStop;
	localStorage['startStop']=JSON.stringify(gStartStop);
	setCookie('cStartStop', oStop.stopname, 1);
	setCookie('cStartStopNameId', oStop.id, 1);
	addRecentStop(oStop);
	showRoutesAtStop(oStop, 'Buses at ' + oStop.stopname + ' ');
}

// Add to the list of recent stops
function addRecentStop(oStop) {
	if(oStop.id === goCurStop.id)	// stop hasn't changed
		return;
	oCurStop = oStop;
	var rs = localStorage['recentStops'];
	var recentStopsPrv;
	if(rs != null)
		recentStopsPrv = JSON.parse(rs);
	recentStops = null;
	var recentStops = new Array;
	recentStops[0] = oStop;
	var alreadyThere = false;
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
	if(!alreadyThere) {
		localStorage['recentStops']=JSON.stringify(recentStops);
		showRecentStops();
	}
}

function showRecentStops() {
// alert('in showrecentstops');
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
					recentStops[i].landmark + '\', \'stopnameext\': \'' + recentStops[i].stopnameext + '\'}, selectedInput)">' +
					recentStops[i].stopname + '</td><td>' + recentStops[i].area + '</td><td>' + lmark 
					+ "</a></td></tr>"; 
				recentStopsStr = recentStopsStr + elm;
			}
		}
		recentStopsStr = recentStopsStr + '</table>';
		document.getElementById("recentStops").innerHTML = recentStopsStr;
	
	}

}

// Buses lists, hide and show per radio button selection
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


function createOStop(os) {
	return {'id':os[3], 'label':os[0] + ': ' + os[1] + ' ' + os[2],
				'area':os[0], 'value':os[1], 'stopname':os[1], 'landmark':os[2]};

}

function popStop(oStop, stop) {
	if(stop === 1) {
		$("#startStop").val(oStop.stopname);
		setCookie('cStartStop', oStop.stopname, 1);
		setStart(oStop);
		$("#destStop").focus();
	} else if(stop === 2) {
		$("#destStop").val(oStop.stopname);
		setCookie('cDestStop', oStop.stopname, 1);
		setDest(oStop);
		$("#findBus").focus();

	}
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

function showStatus()
{
	window.location='status.html?s=' + gStartStop.id;
}

function showR() {
	b = $('#busNo').val(); 
	if(b === '')
		alert('Please type a Bus no. before hitting Select Route');
	else
		showRouteComplete();
}