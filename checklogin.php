<?php
        session_start();
	if(!isset($_SESSION["username"])){
		 header("Location: https://sandboxcodes.com/Login.html");
	}
?>
