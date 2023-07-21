<!DOCTYPE HTML>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://www.facebook.com/2008/fbml">

<head>

<title>BestBus Route Finder (Mumbai)</title>
<meta name="viewport" content="user-scalable=yes, width=device-width">

<!-- <link rel="stylesheet" type="text/css" href="css/common.css"> -->
<link rel="stylesheet" type="text/css" href="lib/jquery/jquerymobilemin.css">

<script type="text/javascript" src="lib/jquery/jquerymin.js"></script>
<script type="text/javascript" src="lib/jquery/jquerymobilemin.js"></script>
   
</head>

<body>
<div data-role="page" data-theme="a">
	<div data-role="header" data-theme="a">
	<h1>BestBus Route Finder (Mumbai)</h1>
	<a href="help/bestbushelp.html" rel="external" data-icon="search">Help</a>
	</div>
<!--
    	<td style="width: 581px;" class="header_txt">&nbsp; &nbsp; &nbsp;
&nbsp; &nbsp;&nbsp;BestBus Route Finder (Mumbai)</td>
     <td style="width: 24px;" class="header_right_img"><a
 href="help/BestbusHelp.html"> <img
 style="border: 0px solid ; width: 24px; height: 24px;" id="Help"
 title="Help" onclick="window.location='help/bestbushelp.html';"
 src="./images/px24help.png"></a></td>
	</div>
<!--
<div class="menu">
<h6><a href="findbus.html">Find your Bus</a></h6>
<h6><a href="busroute.html">Show a route</a></h6>
</div>
-->

	<div data-role="content">
		<ul data-role="listview" data-inset="true" data-theme="c" data-dividertheme="a">
			<li><a href="findbus.html" data-transition="slidedown" rel="external">Find your Bus</a></li>
			<li><a href="busroute.html" data-transition="slidedown"  rel="external">Show a route</a></li>
		</ul>
	</div>
	<div data-role="footer" data-position="fixed" data-theme="c">



<?php
// AdMob Publisher Code
// Language: PHP (fsockopen)
// Version: 20081105
// Copyright AdMob, Inc., All rights reserved
// Documentation at http://developer.admob.com/wiki/Main_Page

$admob_params = array(
  'PUBLISHER_ID'      => 'a14df5265566847', // Required to request ads. To find your Publisher ID, log in to your AdMob account and click on the "Sites & Apps" tab.
  'ANALYTICS_ID'      => 'a14df5a1a495612', // Required to collect Analytics data. To find your Analytics ID, log in to your Analytics account and click on the "Edit" link next to the name of your site.
  'AD_REQUEST'        => true, // To request an ad, set to TRUE.
  'ANALYTICS_REQUEST' => true, // To enable the collection of analytics data, set to TRUE.
  'TEST_MODE'         => false, // While testing, set to TRUE. When you are ready to make live requests, set to FALSE.
  // Additional optional parameters are available at: http://developer.admob.com/wiki/AdCodeDocumentation
  'OPTIONAL'          => array()
);

// Optional parameters for AdMob Analytics (http://analytics.admob.com)
//$admob_params['OPTIONAL']['title'] = "Enter Page Title Here"; // Analytics allows you to track site usage based on custom page titles. Enter custom title in this parameter.
//$admob_params['OPTIONAL']['event'] = "Enter Event Name Here"; // To learn more about events, log in to your Analytics account and visit this page: http://analytics.admob.com/reports/events/add

/* This code supports the ability for your website to set a cookie on behalf of AdMob
 * To set an AdMob cookie, simply call admob_setcookie() on any page that you call admob_request()
 * The call to admob_setcookie() must occur before any output has been written to the page (http://www.php.net/setcookie)
 * If your mobile site uses multiple subdomains (e.g. "a.example.com" and "b.example.com"), then pass the root domain of your mobile site (e.g. "example.com") as a parameter to admob_setcookie().
 * This will allow the AdMob cookie to be visible across subdomains
 */
//admob_setcookie();

/* AdMob strongly recommends using cookies as it allows us to better uniquely identify users on your website.
 * This benefits your mobile site by providing:
 *    - Improved ad targeting = higher click through rates = more revenue!
 *    - More accurate analytics data (http://analytics.admob.com)
 */
 
// Send request to AdMob. To make additional ad requests per page, copy and paste this function call elsewhere on your page.
echo admob_request($admob_params);

/////////////////////////////////
// Do not edit below this line //
/////////////////////////////////

// This section defines AdMob functions and should be used AS IS.
// We recommend placing the following code in a separate file that is included where needed.

function admob_request($admob_params) {
  static $pixel_sent = false;

  $ad_mode = false;
  if (!empty($admob_params['AD_REQUEST']) && !empty($admob_params['PUBLISHER_ID'])) $ad_mode = true;
  
  $analytics_mode = false;
  if (!empty($admob_params['ANALYTICS_REQUEST']) && !empty($admob_params['ANALYTICS_ID']) && !$pixel_sent) $analytics_mode = true;
  
  $protocol = 'http';
  if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) != 'off') $protocol = 'https';
  
  $rt = $ad_mode ? ($analytics_mode ? 2 : 0) : ($analytics_mode ? 1 : -1);
  if ($rt == -1) return '';
  
  list($usec, $sec) = explode(' ', microtime()); 
  $params = array('rt=' . $rt,
                  'z=' . ($sec + $usec),
                  'u=' . urlencode($_SERVER['HTTP_USER_AGENT']), 
                  'i=' . urlencode($_SERVER['REMOTE_ADDR']), 
                  'p=' . urlencode("$protocol://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']),
                  'v=' . urlencode('20081105-PHPFSOCK-33fdd8e59a40dd9a')); 

  $sid = empty($admob_params['SID']) ? session_id() : $admob_params['SID'];
  if (!empty($sid)) $params[] = 't=' . md5($sid);
  if ($ad_mode) $params[] = 's=' . $admob_params['PUBLISHER_ID'];
  if ($analytics_mode) $params[] = 'a=' . $admob_params['ANALYTICS_ID'];
  if (!empty($_COOKIE['admobuu'])) $params[] = 'o=' . $_COOKIE['admobuu'];
  if (!empty($admob_params['TEST_MODE'])) $params[] = 'm=test';

  if (!empty($admob_params['OPTIONAL'])) {
    foreach ($admob_params['OPTIONAL'] as $k => $v) {
      $params[] = urlencode($k) . '=' . urlencode($v);
    }
  }

  $ignore = array('HTTP_PRAGMA' => true, 'HTTP_CACHE_CONTROL' => true, 'HTTP_CONNECTION' => true, 'HTTP_USER_AGENT' => true, 'HTTP_COOKIE' => true);
  foreach ($_SERVER as $k => $v) {
    if (substr($k, 0, 4) == 'HTTP' && empty($ignore[$k]) && isset($v)) {
      $params[] = urlencode('h[' . $k . ']') . '=' . urlencode($v);
    }
  }

  $post = implode('&', $params);
  $request_timeout = 1; // 1 second timeout
  $contents = '';
  $errno = 0;
  $errstr = '';
  list($usec_start, $sec_start) = explode(' ', microtime());
  $request = @fsockopen('r.admob.com', 80, $errno, $errstr, $request_timeout);
  if($request) {
    stream_set_timeout($request, $request_timeout);
    $post_body = "POST /ad_source.php HTTP/1.0\r\nHost: r.admob.com\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: " . strlen($post) . "\r\n\r\n" . $post;
    $post_body_len = strlen($post_body);
    $bytes_written = 0;
    $body = false;

    $info = stream_get_meta_data($request);
    $timeout = $info['timed_out'];
    while($bytes_written < $post_body_len && !$timeout) { 
      $current_bytes_written = fwrite($request, $post_body); 
      if($current_bytes_written === false) return ''; // write failed 
      $bytes_written += $current_bytes_written; 
      if($bytes_written === $post_body_len) break;
      $post_body = substr($post_body, $bytes_written); 
      $info = stream_get_meta_data($request);
      $timeout = $info['timed_out'];
    }

    while(!feof($request) && !$timeout) {
      $line = fgets($request);
      if(!$body && $line == "\r\n") $body = true;
      if($body && !empty($line)) $contents .= $line;
      $info = stream_get_meta_data($request);
      $timeout = $info['timed_out'];
    }
    fclose($request);
  }
  else {
    $contents = '';
  }
  
  if (!$pixel_sent) {
    $pixel_sent = true;
    list($usec_end, $sec_end) = explode(' ', microtime());
    $contents .= "<img src=\"$protocol://p.admob.com/e0?"
              . 'rt=' . $rt
              . '&amp;z=' . ($sec + $usec)
              . '&amp;a=' . ($analytics_mode ? $admob_params['ANALYTICS_ID'] : '')
              . '&amp;s=' . ($ad_mode ? $admob_params['PUBLISHER_ID'] : '')
              . '&amp;o=' . (empty($_COOKIE['admobuu']) ? '' : $_COOKIE['admobuu'])
              . '&amp;lt=' . ($sec_end + $usec_end - $sec_start - $usec_start)
              . '&amp;to=' . $request_timeout
              . '" alt="" width="1" height="1"/>';
  }
  
  return $contents;
}

function admob_setcookie($domain = '', $path = '/') {
  if (empty($_COOKIE['admobuu'])) {    
    $value = md5(uniqid(rand(), true));
    if (!empty($domain) && $domain[0] != '.') $domain = ".$domain";
    if (setcookie('admobuu', $value, mktime(0, 0, 0, 1, 1, 2038), $path, $domain)) {
      $_COOKIE['admobuu'] = $value; // make it visible to admob_request()
    } 
  }
}
  
?>  

<!--		
	<fb:like></fb:like>

    <div id="fb-root"></div>
    <script>
      window.fbAsyncInit = function() {
        FB.init({appId: '179731092083198', status: true, cookie: true,
                 xfbml: true});
      };
      (function() {
        var e = document.createElement('script');
        e.type = 'text/javascript';
        e.src = document.location.protocol +
          '//connect.facebook.net/en_US/all.js';
        e.async = true;
        document.getElementById('fb-root').appendChild(e);
      }());
    </script>

-->

 

<!--
<div id="desc">
You are at the main screen of the Mumbai Bus Route Finder. <br>
To find a bus from Point A (eg. Worli Naka) to Point B (Churgate
Station), select the Find a Bus option. <br>
To see a particular route (e.g. 2 L), select the Show a Route option.<br>
<br>
Disclaimer: The route suggestions, timings, frequencies are accurate to
the best of our knowledge. MESN, Tech. Services and its employees or
agents bear no responsibility for any information that may not be
updated or accurate. <br>
By continuing past this page you implicitly absolve us of any
responsibility or damages caused by the use of this software.<br>
Your location is determined by the different way. On a computer, it may
be based on the location of your Internet Service provider.<br>
On a GPS equipped phone, the location is based on either the GPS or the
cell phone tower location.<br>
Please make sure that you verify your location based on your
surroundings and do not completely
rely on this software.
</div>
-->
  <script type="text/javascript" charset="utf-8" src="phonegap.js"></script>      
  <script type="text/javascript" charset="utf-8">
        document.addEventListener("deviceready", function() {
//            alert('initialized');
    }, true);
  </script>


  
  
  </body>
</html>

