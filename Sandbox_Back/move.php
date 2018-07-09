<?php
	$fromPath = $_POST["from"];
	$toPath = $_POST["to"];
	
	$name = basename($fromPath);
	$toPath .= DIRECTORY_SEPARATOR.$name;

	rename($fromPath, $toPath);
?>