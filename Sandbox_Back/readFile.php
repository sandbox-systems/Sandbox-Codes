<?php
/****************************************************
 ****************** INPUT VARIABLES *****************
 ****************************************************/
	$path = $_POST["path"];
	echo file_get_contents($path);
?>