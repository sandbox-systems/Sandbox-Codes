<?php

$opts = array(
    'http'=>array(
        'method' => "GET",
        'header' => "Accept: application/json\r\n" .
                    "Content: application/json\r\n" .
                    "User-agent: Sandbox\r\n" .
                    "Authorization: token " . $_SESSION['token'] . "\r\n"
    )
);

$context = stream_context_create($opts);
$data = json_decode(file_get_contents('https://api.github.com/user', false, $context));

$ghUsername = $data->login;
updateDocument($man, "users", ['username' => $_SESSION['username']],
    DBUpdateOperators::Set, ['GHUsername' => $ghUsername]);

