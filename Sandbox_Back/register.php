<?php
	$username = mysql_real_escape_string($_POST["username"]);
	$password = mysql_real_escape_string($_POST["password"]);
	$type = mysql_real_escape_string($_POST["type"]);
	$card = mysql_real_escape_string($_POST["card"]);
	$firstname = mysql_real_escape_string($_POST["firstname"]);
	$lastname = mysql_real_escape_string($_POST["lastname"]);
	$dob = mysql_real_escape_string($_POST["dob"]);
	$email = mysql_real_escape_string($_POST["email"]);
	$profilepic = mysql_real_escape_string($_POST["profilepic"]);
	$tagline = mysql_real_escape_string($_POST["tagline"]);
	$credentials = mysql_real_escape_string($_POST["credentials"]);
		
	$salt = sha1(openssl_random_pseudo_bytes(256));
	$hash = sha1($password.$salt);
    $iv = openssl_random_pseudo_bytes(16);
    $card = openssl_encrypt($card, "AES-256-CBC", $salt, $options=OPENSSL_RAW_DATA, $iv);
	$email_enc = openssl_encrypt($email, "AES-256-CBC", $salt, $options=OPENSSL_RAW_DATA, $iv);

	$mysqli = new mysqli("localhost", "root", "root", "sandbox");
	$result = $mysqli->query("SELECT * FROM login_info WHERE username='$username' OR email='$email'");
	if($result->num_rows > 0){
		die("Username already exists.");	
	}

	$code = sha1(openssl_random_pseudo_bytes(30));

	$insert = $mysqli->query("INSERT INTO `login_info` (`username`, `hash`, `salt`, `iv`, `type`, `card`, `firstname`, `lastname`, `email`, `dob`, `profilepic`, `tagline`, `credentials`, `code`) VALUES ('$username', '$hash', '$salt', '$iv', '$type', '$card', '$firstname', '$lastname', '$email_enc', '$dob', '$profilepic', '$tagline', '$credentials', '$code')");
	if($insert === TRUE){
		echo "Success";
		$subject = 'Sandbox Email Verification';
		$message = "<p>Dear $username,<p>".
			"<p>Thank you for choosing Sandbox. Your account is waiting for you! Please click the following link to activate your email.<br />".
			"<a href=\"http://localhost:8888/Sandbox%202.0/Sandbox_Back/verifyemail.php?username=$username&code=$code\">Verify Email!<a><br />".
			"Sincerely,<br />".
			"The Sandbox Team";
		$headers = 'From: webmaster@sandbox.com' . "\r\n" .
			'Reply-To: no-reply@sandbox.com' . "\r\n" .
			'Content-type: text/html';
		mail($email, $subject, $message, $headers);
	}else{
		echo "Failure";	
	}
?>