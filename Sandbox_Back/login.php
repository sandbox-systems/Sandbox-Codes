<?php
	$username = mysql_real_escape_string($_POST["username"]);
	$password = mysql_real_escape_string($_POST["password"]);

	$mysqli = new mysqli("localhost", "root", "root", "sandbox");
	$salt = $mysqli->query("SELECT salt FROM login_info WHERE username='$username'")->fetch_assoc();
	$salt = $salt["salt"];
	$hash = sha1($password.$salt);

	$result = $mysqli->query("SELECT * FROM login_info WHERE username='$username' AND hash='$hash'");
	if($result->num_rows == 1){
		$result = $result->fetch_assoc();
		if($result["email_verification"] == 1){
			session_start();
			$_SESSION["username"] = $result["username"];
			$_SESSION["type"] = $result["type"];
			$_SESSION["firstname"] = $result["firstname"];
			$_SESSION["lastname"] = $result["lastname"];
			$_SESSION["email"] = $result["email"];
			$_SESSION["tagline"] = $result["tagline"];
			$_SESSION["credentials"] = $result["credentials"];
			$_SESSION["dob"] = $results["dob"];
			$_SESSION["profilepic"] = $results["profilepic"];
			$_SESSION["card"] = $results["card"];
			echo "Success";
		}else{
			echo "Email Verification Incomplete";	
		}
	}else{
		echo("Invalid Username or Password");
	}

	$mysqli->close();
?>