<?php

session_start();

header("Access-Control-Allow-Origin: localhost:3000");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Origin");
header("Content-Type: application/json");

echo json_encode(array('username' => $_SESSION['username']));
