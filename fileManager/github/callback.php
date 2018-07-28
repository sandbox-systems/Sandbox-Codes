<?php
/**
 * Respond to callback with list of repositories
 *
 * @author Shivashriganesh Mahato
 */

include 'util.php';

// TODO Replace session with DB

if (isset($_SESSION['token'])) {
    header("Location: ../../Castle.html#/treasury/projects");
} else {
    $code = $_GET['code'];
    $token = fetchToken($code, $client_id, $client_secret);

    if ($token) {
        $_SESSION['token'] = $token;
        header("Location: ../../Castle.html#/treasury/projects");
    } else {
        header("Location: sync.php?unsuccessful");
    }
}
