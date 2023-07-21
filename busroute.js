var bDbug = true;
var dBugLvl = 3;

var STOPNO = 0;
var SEARCHSTR = 1;
var NXTDIST = 2;
var NXTTIME = 3;
var LAT = 4;
var LON = 5;
var NEARLAT = 0.01;

var busno = '';
var called_times = 0;
var stopLines = "";

var geoPos;
var arBusList = [];
var busNoList = [];
var stopBusLines = '';
var gStartStopnameId = 0;
var gDestStopnameId = 0;
var gStartStopSearchStr;
var gDestStopSearchStr;
var gStartStop;
var gDestStop;
var busMaster = [];

var homePage;


var gFndBus = "";

var startStopLat = 0;
var startStopLon = 0;
var destStopLat = 0;
var destStopLon = 0;
var stopBus = [];
var stopNames = [];
var db;		
$(document).ready(function() {
	arBusList = getbuslist();
	stopBus = getStopBusList();
	busMaster = getbusmaster();
	stopNames = getStopNames();	

	for(var i=0; i<arBusList.length; i++)
		busNoList[i] = arBusList[i][0];
	PopulateAllBusList();
	PopulateOtherBusLists();
	getLocation();	// runs setGeoPos(pos), showLocation(pos)
});



function PopulateOtherBusLists() {
	var oBus = document.getElementById('oBus');
	var lBus = document.getElementById('lBus');
	var aBus = document.getElementById('aBus');
	var asBus = document.getElementById('asBus');
	var cBus = document.getElementById('cBus');

	
	if(oBus === null || lBus === null || aBus === null || asBus === null)
		return;
	for(var x=0; x<arBusList.length; x++) {
		var option = document.createElement("option");
		var busInfo = getBusInfo(arBusList[x][1]);
		var busfreq = "";
		if(busInfo != undefined && busInfo.frequency !="")
			busfreq = '(' + busInfo.frequency + " mins)";

		option.text = arBusList[x][1] + " - " + arBusList[x][2] + " to " + 
				arBusList[x][3]; // + ' ' + busfreq;
		option.value = arBusList[x][1];
		if(arBusList[x][1] == arBusList[x][0])
			oBus.add(option, null);
		else if(arBusList[x][1].indexOf('AC Exp') >= 0)
			aBus.add(option, null);
		else if(arBusList[x][1].indexOf('L') >= 0)
			lBus.add(option, null);
		else if(arBusList[x][1].indexOf('AS') >= 0)
			asBus.add(option, null);
		else if(arBusList[x][1].indexOf('C') >= 0)
			cBus.add(option, null);

	}
}

$(function () {
	
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
			}
	});

});



function showLocation(pos) { // Stops near you

	
//	showRoutesAtStop({'area':'Tardeo', 'id':'bhatiahospital'}, 'Bus Routes Near You');
	var oStop = findNearestStop(pos);
	showRoutesAtStop(oStop, 'Bus Routes Near You ');
}

// set the local variable so it can be used in this js file
function setGeoPos(pos) {
	geoPos = pos;
}

