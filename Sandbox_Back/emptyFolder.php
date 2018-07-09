<?php
	$folderpath = $_POST["folderpath"];
	function emptyFolder($folderpath){
		$files = glob($folderpath.DIRECTORY_SEPARATOR."*"); // get all file names
		foreach($files as $file){ // iterate files
			if(is_file($file)){
				unlink($file); // delete file
			}else if(is_dir($file)){
				emptyFolder($file);	
				rmdir($file);
			}
		}
	}
	emptyFolder($folderpath);
?>