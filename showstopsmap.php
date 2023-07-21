<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
<link rel="stylesheet" type="text/css" href="showstopsmap.css" />

<style type="text/css">
  html { height: 100% }
  body { height: 100%; margin: 0px; padding: 0px }
  #map_canvas { height: 100% }
</style>

<script type="text/javascript"
    src="http://maps.google.com/maps/api/js?sensor=false"> 
</script>

</head>
<body onload="initialize()">
  <div id="map_canvas" style="width:100%; height:100%"></div>
</body>
</html>

<script>

function initialize() {
	// Try W3C Geolocation (Preferred)
	var myLatLng = new google.maps.LatLng(19.0623, 72.8);
	var myOptions = {
	zoom: 11,
	center: myLatLng,
	mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = new google.maps.Map(document.getElementById("map_canvas"),
      myOptions);
	var infowindow = new google.maps.InfoWindow();
	if(navigator.geolocation) {
		browserSupportFlag = true;
// dBug('Browser/Device supports geolocation');
		navigator.geolocation.getCurrentPosition(function(position) {
		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
// dBug(position.coords.latitude);	  

		var xmlhttp;
		xmlhttp=new XMLHttpRequest();
		xmlhttp.open("POST","latloninfo.php",false);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");	
		xmlhttp.send("busno=" +  busno + 
				"&lat=" +  position.coords.latitude +
				"&lon=" +  position.coords.longitude);
		contentString = '<table id="table1"> <tbody>';				
		contentString = contentString + '<tr><th>Stops near you on Route ' + busno + '</th></tr>';
		setCookie('cMyLat', position.coords.latitude, 1);
		setCookie('cMyLon', position.coords.longitude, 1);
		var resp = xmlhttp.responseText;
		if(resp != "")
			contentString = contentString + '<tr><td>' + xmlhttp.responseText + '</td></tr>';
		else
			contentString = contentString + '<tr><td>' + 'No stops near you found' + '<tr><td>';
		contentString = contentString + '</tbody></table>';
		
		infowindow.setContent(contentString);
		infowindow.setPosition(initialLocation);
		infowindow.open(map);
// dBug(contentString);
		//		map.setCenter(initialLocation);
	}, function() {
		handleNoGeolocation(browserSupportFlag),
		{maximumAge:60000, timeout: 200};
    });  	
  } 
  

	function handleNoGeolocation(errorFlag) {

// dBug('Could not get your position');
	switch(errorFlag.code)  
	{  
		case errorFlag.PERMISSION_DENIED: dBug("handleNoGeolocation", "You have not shared your geolocation data, you will see less information", 5);  
		break;  

		case errorFlag.POSITION_UNAVAILABLE: dBug("handleNoGeolocation", "could not detect current position", 5);  
		break;  

		case errorFlag.TIMEOUT: dBug("handleNoGeolocation", "retrieving position timed out", 5);  
		break;  

		default: dBug("handleNoGeolocation", "unknown error", 5);  
		break;  
	}  	
    map.setCenter(myLatLng);
  }

	function setCookie(c_name,value,exdays)
	{
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
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
	}
  
  
<?php include("./local/config.php");
// echo 'Starting showstopsmap';
    if($conn) {
		$busno = $_GET['busno'];
		$startStopId = $_GET['s'];
		$destStopId = $_GET['d'];
		$sql = "CALL showStopsBetween( '" . $busno . "', " .$startStopId. 
			", " . $destStopId . ");";
		echo "var busno = '" . $_GET['busno'] . "';\n";
// echo '// ' .$sql;		
/*
		echo "var  = " . $_GET['busno'] . ";\n";
		echo "var busno = " . $_GET['busno'] . ";\n";
*/		
// //echo $sql;	
		$rows_found = 0;
		$return_str = '';
		$comma = '';
		$i = 0;
		$curDestSearchStr = '';
		$return_str = 'Bus no.: ' . $busno . '<br>'; 
		$comma = "";
		$pline = "";
		$marker = "";
		$image = "images/bus.png";
		$info = "";
		$addListen = "";
		$bLatLonTop = false;
		$bLatLonBottom = false;
		$sw = "";
		print "\nvar markerBounds = new google.maps.LatLngBounds();\n";

		if (isset($_COOKIE["cMyLat"]) && isset($_COOKIE["cMyLon"])) {
			print "\n" . 'markerBounds.extend(new google.maps.LatLng(' .$_COOKIE["cMyLat"]. ', ' .$_COOKIE["cMyLon"]. '));' . "\n";
		}
//		echo $sql;
		foreach ($conn->query($sql) as $row) {
			$i++;
			$lat = $row['lat'];
			$lon = $row['lon'];
/* && $lat > 18 && $lat < 20 && $lon > 71 && $lon < 73 */			
			if($lat != 0 && $lon != 0 )	{
				print "\n" . 'markerBounds.extend(new google.maps.LatLng(' .$lat. ', ' .$lon. '));' . "\n";
				$bLatLonTop = true;
			}

			if($lat > 0 && $lon > 0)	{
				$stopno = $row['stopno'];
				$stopname = preg_replace("/'/", '&#39', $row['stopname']);
				$landmark =  preg_replace("/'/", '&#39', $row['landmark']);
				$nxt_stop = preg_replace("/'/", '&#39', $row['nxt_stopname']);
				$prv_stop = preg_replace("/'/", '&#39', $row['prv_stopname']);
				$searchstr = preg_replace("/'/", '&#39', $row['searchstr']);

				$pline = $pline . $comma . "new google.maps.LatLng(" . $lat . ", " . $lon . ")";
				$LatLng = "new google.maps.LatLng(" . $lat . ", " .$lon . ")";
				$comma = ", ";
				$marker = $marker . " var marker" . $i . "= new google.maps.Marker({ position: " . $LatLng .
				 ", map: map, title:'" .$stopno. "." .$searchstr. "', icon:'" .$image. "'});"
							.  "marker" . $i . ".setMap(map);\n";
				
				$htm = '<table id="table1"> <tbody>';
				$htm = $htm . '<tr><td>Bus no. </td><td><b> ' .$busno. ' (Stop: ' .$row['stopno']. ' )</b></td></tr>';
//				$htm = $htm .'<tr><td>Stop no. </td><td><b> ' .$row['stopno']. "</b></td></tr>";
				$htm = $htm. "<tr><td>Stop </td><td><b> " .$searchstr. "</b></td></tr>";


				if(strlen($nxt_stop) > 0) {
					$htm = $htm . '<tr><td>Next Stop</td><td><b> ' .$nxt_stop;
					
					$nxt_dist = $row['nxt_dist'];
					if($nxt_dist > 0)
						$htm = $htm . ' (' .$nxt_dist. ' m ) </b></td></tr>';
					else
						$htm = $htm . '</b></td></tr>';
				}

				if(strlen($prv_stop) > 0) {
					$htm = $htm . '<tr><td> Previous Stop</td><td><b> ' .$prv_stop;
					$prv_dist = $row['prv_dist'];
					if($prv_dist > 0)
						$htm = $htm . ' (' .$prv_dist. ' m) </b></td></tr>';
					else
						$htm = $htm . '</td></tr>';
				}		
				$htm = $htm . "</tbody></table>";
				if($lat != 0 && $lon != 0 && $lon != 0 && $lat > 18 && $lat < 20 && $lon > 71 && $lon < 73)	{
					$sw = 'var southWest = new google.maps.LatLng(' .$lat. ', ' .$lon. ');';
					$bLatLonBottom = true;
				}

				$info = $info . " var infowindow" .$i.  "= new google.maps.InfoWindow({ content: '"
					.$htm. "' });\n";
				$addListen = $addListen. " google.maps.event.addListener(marker" .$i. 
					", 'click', function() { infowindow" .$i. ".open(map, marker" .$i. ");});";		
		}
	}
	if($i == 0)
		echo 'No information found';
	else	{
		print "\n" .$sw. "\n";
//		print "\nvar southWest = new google.maps.LatLng(19.11782, 72.86523)\n";

		print 'var busRoutes = [' . $pline . "];\n\n" ;
		print $info . "\n\n";
		print $marker . "\n\n";
		print $addListen . "\n\n";
	
/*
 var southWest = new google.maps.LatLng(-31.203405,125.244141);
  var northEast = new google.maps.LatLng(-25.363882,131.044922);
*/

	if($bLatLonTop && $bLatLonBottom) {
		print "\n map.fitBounds(markerBounds);\n";
/*		print "\n" . 'var bounds = new google.maps.LatLngBounds(southWest, northEast);';
		print "\n" . "map.fitBounds(bounds);";
*/	}

	}
		
	}
	// close the database connection
	$conn = null;

?>
 
  var flightPath = new google.maps.Polyline({
    path: busRoutes,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);
}
</script>

<!--
/*
	  var busRoutes = [
    new google.maps.LatLng(37.772323, -122.214897),
    new google.maps.LatLng(21.291982, -157.821856),
    new google.maps.LatLng(-18.142599, 178.431),
    new google.maps.LatLng(-27.46758, 153.027892)
  ];
*/	  
-->