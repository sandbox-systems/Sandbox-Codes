<?php
	try{
	    $username = (string)$_POST["username"];
	    $password = (string)$_POST["password"];
        $mng = new MongoDB\Driver\Manager("mongodb://sandbox:NhJLmHZb$@localhost:27017/admin");
        $query = new MongoDB\Driver\Query(["username" => $username], ["limit" => 1]);
        $rows = $mng->executeQuery("sandbox.users", $query);

        foreach($rows as $row){
            if(!$row->everify){
                throw new Exception("Email not verified.");
            }
        }

        $hash = sha1($password.$row->salt);
        $query = new MongoDB\Driver\Query(["username" => $username, "hash" => new MongoDB\BSON\Binary($hash, MongoDB\BSON\Binary::TYPE_GENERIC)], ["limit" => 1]);
        $rows = $mng->executeQuery("sandbox.users", $query);

        $row = new IteratorIterator($rows);
        $row->rewind();

        if(!$row->valid()){
            throw new Exception("Invalid Login.");
        }

        session_start();
        $_SESSION["username"] = $row->current()->username;
        $_SESSION["type"] = $row->current()->features;
        $_SESSION["fname"] = $row->current()->fname;
        $_SESSION["lname"] = $row->current()->lname;
        $_SESSION["profilepic"] = property_exists($row->current(), "profilepic")?$row->current()->profilepic:"default_profile_pic";
        $_SESSION["object_id"] = $row->current()->_id;

        echo "User authenticated.";
        //header("Location: https://sandboxcodes.com/Castle.php");

    }catch(Exception $e){
	    die($e->getMessage());
    }
?>
