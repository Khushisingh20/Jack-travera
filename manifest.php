<?php 
// man.php
	header('Content-Type: text/cache-manifest');
	echo "CACHE MANIFEST\n";
	$hashes = "";
	$dir = new RecursiveDirectoryIterator(".");

	foreach(new RecursiveIteratorIterator($dir) as $file) {
		if ($file->IsFile() &&
			$file != ".\manifest.php" && $file !=".\comfuncs.js" && 
				!strpos($file, '/.') && 
				!strstr($file, ".bak") &&
				substr($file->getFilename(), 0, 1) != ".") 
		{
//			if(!strpos($file, '.html'))		// html files are cached by incl. cache manifest in the code 
				echo $file . "\n";
			$hashes .= md5_file($file);
		}
	}
//	echo "NETWORK:\n";
//	echo "http://*\n";
//	echo "*\n";
	echo '# Hash: ' . md5($hashes) . "\n";
?>



