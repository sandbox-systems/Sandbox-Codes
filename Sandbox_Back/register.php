<?php
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    /*require "../composer/vendor/phpmailer/phpmailer/src/Exception.php";
    require "../composer/vendor/phpmailer/phpmailer/src/PHPMailer.php";
    require "../composer/vendor/phpmailer/phpmailer/src/SMTP.php";*/
    require '../composer/vendor/autoload.php';

    try {
        $mng = new MongoDB\Driver\Manager("mongodb://sandbox:NhJLmHZb$@localhost:27017/admin");
        $query = new MongoDB\Driver\Query(["username" => (string)$_POST['username']]);
        $rows = $mng->executeQuery("sandbox.users", $query);

        if(sizeof($rows->toArray())!=0){
            throw new Exception("Username already exists.");
        }
        if($_POST['username']==NULL){
            throw new Exception("Username cannot be null.");
        }

        $ecode = sha1(openssl_random_pseudo_bytes(30));
        $salt = sha1(openssl_random_pseudo_bytes(256));
        $hash = sha1((string)$_POST['password'].$salt);
        $iv = openssl_random_pseudo_bytes(16);
        $email_enc = openssl_encrypt($_POST['email'], "AES-256-CBC", $salt, $options=OPENSSL_RAW_DATA, $iv);

        $write = new MongoDB\Driver\BulkWrite;
        $newUser = array(
            'username' => (string)$_POST['username'],
            'fname' => (string)$_POST['firstname'],
            'lname' => (string)$_POST['lastname'],
            'email' => new MongoDB\BSON\Binary($email_enc, MongoDB\BSON\Binary::TYPE_GENERIC),
            'hash' => new MongoDB\BSON\Binary($hash, MongoDB\BSON\Binary::TYPE_GENERIC),
            'salt' => new MongoDB\BSON\Binary($salt, MongoDB\BSON\Binary::TYPE_GENERIC),
            'iv' => new MongoDB\BSON\Binary($iv, MongoDB\BSON\Binary::TYPE_GENERIC),
            'ecode' => new MongoDB\BSON\Binary($ecode, MongoDB\BSON\Binary::TYPE_GENERIC),
            'everify' => false,
            'github' => (string)"github.com",
            'features' => (string)$_POST['features'],
            'relax' => true,
            'timestamp' => (new MongoDB\BSON\UTCDateTime())->toDateTime()->format('U.u')
        );
        $write->insert($newUser);
        $mng->executeBulkWrite('sandbox.users', $write);
        echo "User successfully created";

        $mail = new PHPMailer(true);
        try {
            //Server settings
            //$mail->SMTPDebug = 2;
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'info.codesandbox@gmail.com';
            $mail->Password = 'beatCloud!9';
            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;

            //Recipients
            $mail->setFrom('info@sandboxcodes.com', 'Sandbox Systems');
            $mail->addAddress((string)$_POST["email"], (string)$_POST["firstname"]." ".(string)$_POST["lastname"]);

            //Content
            $mail->isHTML(true);                                
            $mail->Subject = 'Sandbox Email Verification';
            $mail->Body    = "<p>Dear ".(string)$_POST["username"].",</p>".
            "<p>Thank you for choosing Sandbox. Your account is waiting for you! Please click the following link to activate your email.<br />".
            "<a href=\"https://sandboxcodes.com/Sandbox_Back/verifyemail.php?username=".(string)$_POST["username"]."&code=$ecode\">Verify Email!<a><br />".
            "Sincerely,<br />".
            "The Sandbox Team";
            $mail->AltBody = "Click this: https://sandboxcodes.com/Sandbox_Back/verifyemail.php?username=".(string)$_POST["username"]."&code=$ecode";

            $mail->send();
            header("Location: https://sandboxcodes.com/Login.html");
        } catch (Exception $e) {
            echo 'Message could not be sent. Mailer Error: ', $mail->ErrorInfo;
        }
    }catch(Exception $e){
        die($e->getMessage());
    }
?>