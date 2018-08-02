<?php

//require "../../checklogin.php";

/*use Docker\Docker;
require '../../composer/vendor/autoload.php';

$usersha = escapeshellcmd(sha1($_SESSION["username"]));

try{
    $docker = Docker::create();
    $containers = $docker->containerList();
    foreach ($containers as $container) {
        if(substr($container->getNames()[0], 1)==$usersha){
            throw new Exception("Container already running.");
        }
    }
    $docker->containerStart($usersha);
    echo "Container started.";
}catch(Exception $e){
    die($e->getMessage());
}*/

try{
    //$usersha = escapeshellcmd(sha1($_SESSION["username"]));
    $usersha = escapeshellcmd(sha1("aadhi0319"));

    $options = array(CURLOPT_URL => "http:/v1.24/containers/json",
        CURLOPT_UNIX_SOCKET_PATH => "/var/run/docker.sock",
        CURLOPT_RETURNTRANSFER => true
    );

    $ch = curl_init();
    curl_setopt_array($ch, $options);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $resp = json_decode($resp);
    foreach ($resp as $container){
        if(substr($container->Names[0], 1)==$usersha){
            throw new Exception("Container already running.");
        }
    }
}catch(Exception $e){
    die($e->getMessage());
}

?>