<?php
require "../../checklogin.php";

use Docker\Docker;
require '../../composer/vendor/autoload.php';

$usersha = escapeshellcmd(sha1($_SESSION["username"]));
//$running = false;

try{
    $docker = Docker::create();
    /*$containers = $docker->containerList();
    foreach ($containers as $container) {
        if(substr($container->getNames()[0], 1)==$usersha){
            $running = true;
        }
    }

    if(!$running){
        throw new Exception("Container not running.");
    }*/

    $webSocketStream = $docker->containerAttachWebsocket($usersha, [
        'stream' => true,
        'stdout' => true,
        'stderr' => true,
        'stdin'  => true,
    ]);

    $line = $webSocketStream->read();
    $webSocketStream->write('i send input to the container');
    echo $webSocketStream->read();
}catch(Exception $e){
    die($e->getMessage());
}

?>