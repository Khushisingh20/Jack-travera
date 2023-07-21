// findbus.js
/*
var getStopNames, getCookie, setCookie, getWinDim, getLocation, 
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
var gNearStop = {'id':'', 'value':''};
var geoPos;
var NEARLAT = 0.01;
var firstLoad = true;
var oNearestStop = null;
var arBusList;
var stopBus;
var selectedStop;
var near_stop;
var MAXRECENTSTOPS = 7;
var url;

$(document).ready(function () {

	var sStop, dStop, sId, dId, w;
	stopNames = getStopNames();	
	busMaster = getbusmaster();
	arBusList = getbuslist();
	stopBus = getStopBusList();
	
    scrollTo(0, 0); 

	stopId = gup('s');
	if(stopId === '') {
		alert('No start stop selected');
		return;
	}

	url = "http://mesn.org/bestbus/svr/busStatus.php?s=" + stopId;
	getBusStatus(stopId);
//	getLocation();	// runs setGeoPos(pos), showLocation(pos)


	function handle_error(err) {
	  if (err.code === 1) {
		return 1;// user said no!
	  }
	}
	function get_position() {
	 alert('Getting position');
	}

/*	
	function myLocStop() {
		$('#startStop').val(document.getElementById('nearStop').value);
//		sessionStorage.startStop = document.getElementById('nearStop').value;
		setCookie('cStartStop', document.getElementById('nearStop').value, 1);

		$('#startStopId').val(document.getElementById('nearStopId').value);
		setCookie('cStartStopId', document.getElementById('nearStopId').value, 1);
		
//		sessionStorage.startStopId = document.getElementById('nearStopId').value;
		 updateStartInfo('n');
	}
*/
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
//					document.getElementById('stopsnearyou').innerHTML = 'Nearby Stops (' + near_stop.area + ')';
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
	document.getElementById("busroutesatstart").innerHTML = 'Buses due at ' + oNearestStop.stopname + ' (' +oNearestStop.area + ')'; 

				//				document.myForm.startStop.value = oNearestStop.stopname;

//				showRoutesAtStop(oNearestStop);
				$('#destStop').focus();
				firstLoad = false;
			}
		}
		contentString = contentString + '</tbody></table>';
//		document.getElementById("myLoc").innerHTML = contentString;
		getBusStatus();
/*		xmlhttp=new XMLHttpRequest();
//			var url = "http://www.mesn.org/bestbus/svr/busStatus.php";
url = 'http://www.mesn.org/bestbus/svr/busStatus.php';
			xmlhttp.open("POST", url, false);
			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");	
			xmlhttp.send("s=" + gNearStop[0].id );
			var resp = xmlhttp.responseText;
			document.getElementById("routesAtStop").innerHTML = resp;
*/




		setCookie('cMyLat', pos.coords.latitude, 1);
		setCookie('cMyLon', pos.coords.longitude, 1);
	}

// set the local variable so it can be used in this js file
function setGeoPos(pos) {
	geoPos = pos;
}

function getBusStatus(stopId){
	var ajaxRequest;  // The variable that makes Ajax possible!
	
	try{
		// Opera 8.0+, Firefox, Safari
		ajaxRequest = new XMLHttpRequest();
	} catch (e){
		// Internet Explorer Browsers
		try{
			ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try{
				ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e){
				// Something went wrong
//				alert("Your browser broke!");
				return false;
			}
		}
	}
	// Create a function that will receive data sent from the server
	ajaxRequest.onreadystatechange = function(){
		if(ajaxRequest.readyState == 4){
			resp = ajaxRequest.responseText;
			document.getElementById("routesAtStop").innerHTML = resp;
//			alert(resp);
//			document.myForm.time.value = ajaxRequest.responseText;
		}
	}
	ajaxRequest.open("GET", url, true);
	ajaxRequest.send(null); 
}

