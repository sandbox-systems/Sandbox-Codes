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
        if(sizeof($rows->toArray())){
            echo "User authenticated.";
        }

    }catch(Exception $e){
	    die($e->getMessage());
    }
?>