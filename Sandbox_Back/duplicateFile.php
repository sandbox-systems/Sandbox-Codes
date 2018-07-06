<?php
	$filepath = $_POST["filepath"];

	$name = substr($filepath, strrpos($filepath, DIRECTORY_SEPARATOR)+1);
	$name = substr($name, 0, strrpos($name, "."));
	$ext = substr($filepath, strrpos($filepath, ".")+1);
	$copy = substr($filepath, 0, strrpos($filepath, DIRECTORY_SEPARATOR)+1).$name."_copy.".$ext;
	
	copy($filepath, $copy);
?>