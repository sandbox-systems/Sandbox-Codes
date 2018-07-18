<?php

include 'init.php';

$data = $client->repos->contents->getContents($owner, $repo, $path . '/' . $file);
$blob = $data->content;

echo base64_decode($blob);