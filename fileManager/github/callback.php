<?php
/**
 * Respond to callback with list of repositories
 *
 * @author Shivashriganesh Mahato
 */

include 'util.php';

// TODO Replace session with DB

if (isset($_SESSION['token'])) {
    header("Location: ../FileM.html");
} else {
    $code = $_GET['code'];
    $token = fetchToken($code, $client_id, $client_secret);

    if ($token) {
        $_SESSION['token'] = $token;
        header("Location: ../FileM.html");
    } else {
        header("Location: sync.php?unsuccessful");
    }
}
