<?php
	$folderpath = $_POST["folderpath"];
	mkdir($folderpath, 0700, true);
?>