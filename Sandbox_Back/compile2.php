<?php
	$code = $_POST["code"]; //code to compile
	$filepath = $_POST["filepath"]; //path to file
	$name = substr(basename($filepath), 0, strrpos(basename($filepath), ".")); //name of file
	$lang = substr($filepath, strrpos($filepath, ".")+1); //extension without '.'
	$path = substr($filepath, 0, strrpos($filepath, DIRECTORY_SEPARATOR)); //path without file

	write($code, $filepath);

	switch($lang){
		case "c":
			break;
		case "java":
			exec("cd '".$path."' && javac -g '".$filepath."' 2>&1; echo $?", $error);
			if($error[0]!="0"){
				 exec("cd '".$path."' && rm *.class");
				 die(displayErrorJava($error));
			}
			exec("cd '".$path."' && /usr/local/bin/ttyd -p 7680 -o java ".$name." && rm *.class", $info);
			break;
		case "sh":
			break;
	}
		
	function write($in_code, $in_file){
		$file = fopen($in_file, "w");
		fwrite($file, $in_code);
		fclose($file);
	}

	function displayArray($in_arr){
		$string = "";
		foreach ($in_arr as $value) {
    		$string .= $value."<br />";
		}
		return $string;
	}
	
	function linkError($line){
		$data = explode(":", $line[0]);
		switch($lang){
			case "c":
				break;
			case "java":
				$data[3] = $data[2].$data[3];
		}
		return str_replace(array("'","\"",":"),"",$data[3].$data[4]);
	}
		
	function displayErrorJava($error){
		global $lang;
		return '<a target="_blank" href="http://www.google.com/search?q='.urlencode(linkError($error))." ".$lang.'">'.displayArray($error).'</a>';
	}

	function displayFrame(){
		echo "<iframe id='compileFrame' src='http://localhost:7680/' width='100%' height='100%'></iframe>";
	}
?>