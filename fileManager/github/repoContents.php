<?php

include 'init.php';

$contents = array(
    'dirs' => array(),
    'files' => array()
);
$data = $client->repos->contents->getContents($owner, $repo, $path);

foreach ($data as &$content) {
    $name = $content->getName();
    if ($content->getType() == "file") {
        $contents['files']['i' . count($contents['files'])] = $name;
    } else {
        $contents['dirs']['i' . count($contents['dirs'])] = $name;
    }
}

header('Content-Type: application/json');
echo json_encode($contents);