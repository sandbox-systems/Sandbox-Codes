<?php

require "../../checklogin.php";

$usersha = escapeshellcmd(sha1($_SESSION["username"]));

try {
    exec("docker create --cpus .2 --memory 400m --memory-swap -1 --name $usersha  -it ripple  /bin/sh 2>&1", $info);
    if(strpos($info[0], "Error")!==false){
        throw new Exception("Error: User already has a container.");
    }
    echo "Container successfully created.";
}catch(Exception $e){
    die($e->getMessage());
}

?>