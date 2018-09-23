<?php
//        header("location: https://sandboxcodes.com/offline.html");
        session_start();
	if(!isset($isInLoginPage) && !isset($_SESSION["username"])){
		 header("Location: https://sandboxcodes.com/Login.html");
	}
?>
