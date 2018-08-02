<?php

require "../../checklogin.php";

try{
    $usersha = escapeshellcmd(sha1($_SESSION["username"]));
    $options = array(CURLOPT_URL => "http:/v1.24/containers/$usersha/stop",
        CURLOPT_UNIX_SOCKET_PATH => "/var/run/docker.sock",
        CURLOPT_POST => 0,
        CURLOPT_POSTFIELDS => array(),
        CURLOPT_RETURNTRANSFER => true
    );

    $ch = curl_init();
    curl_setopt_array($ch, $options);
    $resp = json_decode(curl_exec($ch));
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    switch($status){
        case 204:
            echo "Container stopped successfully.";
            break;
        case 304:
            throw new Exception("Container already stopped.");
        case 404:
            throw new Exception("Container does not exist.");
        case 505:
            throw new Exception("Internal server error.");
    }
}catch(Exception $e){
    die($e->getMessage());
}
?>