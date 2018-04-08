<?php
	$oldpath = $_POST["oldpath"];
	$newpath = $_POST["newpath"];
	rename($oldpath, $newpath);
?>