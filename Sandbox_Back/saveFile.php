<?php
/****************************************************
 ****************** INPUT VARIABLES *****************
 ****************************************************/
	$path = $_POST["path"];
	$code = $_POST["code"];

	$myfile = fopen($path, "w") or die("ERROR SAVING FILE");
	fwrite($myfile, $code);
	fclose($myfile);
?>