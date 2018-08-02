<?php

require "../../checklogin.php";

//use Docker\Docker;
//require '../../composer/vendor/autoload.php';

try{
    $usersha = escapeshellcmd(sha1($_SESSION["username"]));
    $client = stream_socket_client("unix:///var/run/docker.sock", $errno, $errorMessage);

    if ($client === false) {
        throw new UnexpectedValueException("Failed to connect: $errorMessage");
    }

    fwrite($client, "http://v1.24/containers/$usersha/attach/ws?logs=1&stream=1&stdin=1&stdout=1&stderr=1");
    var_dump(stream_get_contents($client));
    fclose($client);
}catch(Exception $e){
    die($e->getMessage());
}
?>