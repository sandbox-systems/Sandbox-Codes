<?php
	$username = $_GET["username"];
	$code = $_GET["code"];

	$mysqli = new mysqli("localhost", "root", "root", "sandbox");
	$update = $mysqli->query("UPDATE login_info SET email_verification=1 WHERE username='$username' AND code='$code'");
	if($update === TRUE){
		header("Location: http://localhost:8888/Sandbox%202.0/Sandbox_Front/Login.html");
		if (!file_exists("Users/$username")) {
			mkdir("Users/$username", 0777, true);
		}
	}else{
		echo "Username/Code combination invalid. Please check your email for the correct link and feel free to contact Sandbox for any assistance.";	
	}
?>