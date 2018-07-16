<?php
/**
 * Respond to callback with list of repositories
 *
 * @author Shivashriganesh Mahato
 */

include 'util.php';

// TODO Replace session with DB

if (isset($_SESSION['token'])) {
    header("Location: file.php");
} else {
    $code = $_GET['code'];
    $token = fetchToken($code, $client_id, $client_secret);

    if ($token) {
        $_SESSION['token'] = $token;
        header("Location: file.php");
    } else {
        header("Location: sync.php?unsuccessful");
    }
}
