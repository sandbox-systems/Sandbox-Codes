<?php

require "../checklogin.php";

try{
    $usersha = escapeshellcmd(sha1($_SESSION["username"]));
    $options = array(CURLOPT_URL => "http:/v1.24/containers/$usersha/start",
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
            //echo "Container started successfully.";
            break;
        case 304:
            //Container already started
            break;
        case 404:
            //Container does not exist
            throw new Exception("Container does not exist.");
            break;
        case 505:
            //Internal server error
            throw new Exception("Internal server error.");
            break;
    }
}catch(Exception $e){
    die($e->getMessage());
}

?>