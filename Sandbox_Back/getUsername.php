<?php

session_start();
header("Content-type: application/json");

echo json_encode(['username' => $_SESSION['username']]);
