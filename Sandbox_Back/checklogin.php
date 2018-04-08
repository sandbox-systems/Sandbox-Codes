<?php
	session_start();
	if(!isset($_SESSION["username"])){
		 header("Location: http://localhost:8888/Sandbox%202.0/Sandbox_Front/login.html");
	}
?>