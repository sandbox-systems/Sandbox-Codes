<?php
/**
 * Direct user to authenticate
 *
 * @author Shivashriganesh Mahato
 */

include 'params.php';

$wasSuccessful = !isset($_GET['unsuccessful']);
$url = "https://github.com/login/oauth/authorize?scope=repo delete_repo&client_id=$client_id";
