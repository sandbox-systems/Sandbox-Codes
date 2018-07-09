<?php
	include("checklogin.php");

	$code = $_POST["code"]; //code to compile
	$filepath = $_POST["filepath"]; //path to file
	$filename = basename($filepath); //name of file
	$lang = substr($filepath, strrpos($filepath, ".")+1); //extension without '.'
	$path = substr($filepath, 0, strrpos(DIRECTORY_SEPARATOR)); //path without file
	
	//$path = $username."/".$filename;
		
	if(strcmp($lang, "c")==0){
		shell_exec("rm ".$name." && rm ".$name.".out");
		write($code, $name.".c");
		exec("gcc -o ".$name.".out ".$name.".c 2>&1; echo $?", $error);
		if($error[0]!="0"){
			echo '<a target="_blank" href="http://www.google.com/search?q='.urlencode(linkError($error))." ".$lang.'">'.display($error).'</a>';
		}else{
			shell_exec("chmod +x ".$name.".out");
			exec("./".$name.".out",$info);
			echo display($info);
		}
	}else if(strcmp($lang, "java")==0){
		shell_exec("rm ".$name.".java && rm ".$name.".class");
		//echo "echo "."'".$_GET["code"]."'".">>".$name.".java";
		write($code, $name.".java");
		exec("javac ".$name.".java 2>&1; echo $?", $error);
		if($error[0]!="0"){
			echo '<a target="_blank" href="http://www.google.com/search?q='.urlencode(linkError($error))." ".$lang.'">'.display($error).'</a>';
		}else{
			//exec("cd ".$username." && java ".$filename, $info);
			exec("java ".$filename, $info);
			echo display($info);
		}
	}else if(strcmp($lang, "bash")==0){
		shell_exec("rm ".$name.".sh");
		write($code, $name.".sh");
		shell_exec("chmod +x ".$name.".sh");
		exec("./".$name.".sh 2>&1", $info);
		echo displayBash($info);
	}

	function write($in_code, $in_file){
		$file = fopen($in_file, "w");
		fwrite($file, $in_code);
		fclose();
	}

	function display($in_arr){
		$string = "";
		foreach ($in_arr as &$value) {
    		$string .= $value."<br />";
		}
		return $string;
	}
	
	function linkError($line){
		$data = explode(":", $line[0]);
		
		if($lang == "java"){
			$data[3] = $data[2].$data[3];
		}
		return str_replace(array("'","\"",":"),"",$data[3].$data[4]);
	}

	function displayBash($line){
		$string = "";
		foreach ($line as &$value) {
			if(strpos($value, "./".$name.".sh")!==false){
    			$quervalue = preg_replace("/^(.\/".$name.".sh:) ([\w\s]+:) /", "", $value)." ".$_GET["language"];
				$string .= '<a target="_blank" href="http://www.google.com/search?q='.urlencode($quervalue).'">'.$value.'</a><br />';
				continue;
			}
			$string .= $value."<br />";
		}
		return $string;
	}
?>