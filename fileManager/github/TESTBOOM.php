<?php
//The url you wish to send the POST request to
$url = "https://github.com/login/oauth/access_token";

//The data you want to send via POST
$fields = [
    'client_id' => 'cfcb9d0319f6d921ae8d',
    'client_secret' => 'f011bb24a20ece7cb495df5cd057c3aeaa3f7de2',
    'code' => $_GET['code']
];

//url-ify the data for the POST
$fields_string = http_build_query($fields);

var_dump($fields_string);

//open connection
$ch = curl_init();

//set the url, number of POST vars, POST data
curl_setopt($ch,CURLOPT_URL, $url);
curl_setopt($ch,CURLOPT_POST, count($fields));
curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);

//So that curl_exec returns the contents of the cURL; rather than echoing it
curl_setopt($ch,CURLOPT_RETURNTRANSFER, true); 

//execute post
$result = curl_exec($ch);
echo $result;
