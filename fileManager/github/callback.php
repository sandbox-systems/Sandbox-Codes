<?php
/**
 * Respond to callback with list of repositories
 *
 * @author Shivashriganesh Mahato
 */

include 'util.php';

// TODO Replace session with DB

$code = $_GET['code'];
$token = fetchToken($code, $client_id, $client_secret);

var_dump($man);
if ($token) {
    $_SESSION['token'] = $token;
    include 'saveUsername.php';
    header("Location: ../../Castle.php#/settings");
} else {
    header("Location: ../../Castle.php#/settings?unsuccessful");
}
