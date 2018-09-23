<?php
    $isInLoginPage = True;

    require "../checklogin.php";

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

        $_SESSION["username"] = $row->current()->username;
        $_SESSION["type"] = $row->current()->features;
        $_SESSION["name"] = $row->current()->name;
        $_SESSION["profilepic"] = property_exists($row->current(), "profilepic")?$row->current()->profilepic:"default_profile_pic";
        $_SESSION["object_id"] = (string)($row->current()->_id);
        //setcookie("5IJFbNgniGHUzVc1SuqWiSPokLMCN0CVOr", "Sree Grandhe", 1440, "/", "sandboxcodes.com", true, false);

        include "Docker/runContainer.php";

        echo "User authenticated.5IJFbNgniGHUzVc1SuqWiSPokLMCN0CVOr=" . $row->current()->ecode;
        //header("Location: https://sandboxcodes.com/Castle.php");

    }catch(Exception $e){
	    die($e->getMessage());
    }
?>
