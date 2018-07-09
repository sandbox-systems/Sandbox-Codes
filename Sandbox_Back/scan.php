<?php
/****************************************************
 ****************** INPUT VARIABLES *****************
 ****************************************************/
	$scandir = $_POST["scandir"];
	//$wd = getcwd().DIRECTORY_SEPARATOR.$scandir;
	$wd = "Users/aadhi0319".$scandir;

/****************************************************
 **************** DIRECTORY FUNCTIONS ***************
 ****************************************************/
	function dirToArray($dir) { 
   
	   $result = array(); 

	   $cdir = scandir($dir); 
	   foreach ($cdir as $key => $value) 
	   { 
		  if (!in_array($value,array(".",".."))) 
		  { 
			 if (is_dir($dir . DIRECTORY_SEPARATOR . $value)) 
			 {
				$result[$value.":".$dir] = dirToArray($dir . DIRECTORY_SEPARATOR . $value); 
			 } 
			 else 
			 { 
				$result[] = $value.":".$dir.DIRECTORY_SEPARATOR.$value; 
			 } 
		  } 
	   } 

	   return $result; 
	}

	function arrayToHTML($dir){
		$html = "<ul>";
		global $wd;
		foreach($dir as $key => $file) {
			if(is_array($file)){
				$wd .= DIRECTORY_SEPARATOR.$key;
				$keyarr = explode(":", $key);
				$name = $keyarr[0];
				$directory = $keyarr[1];
				$html .= "<li class='dropdownli folder' data-name='".$name."' data-wd='".$directory.DIRECTORY_SEPARATOR.$name."'>".$name;
				$html .= arrayToHTML($file);
				$html .= "</li>";
				$wdarr = explode(DIRECTORY_SEPARATOR, $wd);
				$wd = "";
				for($i = 0; $i < sizeof($wdarr)-1; $i++){
					$wd .= $wdarr[$i];
				}
			}else{
				$filearr = explode(":", $file);
				$name = $filearr[0];
				$directory = $filearr[1];
				$html .= "<li class='file' data-name='".$name."' data-wd='".$directory."'>".$name."</li>";	
			}
		}
		$html .= "</ul>";
		return $html;
	}

	$directory = dirToArray(getcwd().DIRECTORY_SEPARATOR.$wd);
	echo arrayToHTML($directory);
?>