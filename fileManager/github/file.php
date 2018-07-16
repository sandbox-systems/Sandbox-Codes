<?php
/**
 * Display file contents.
 *
 * @author Shivashriganesh Mahato
 */

include "init.php";

if (!setupToken($client)) {
    echo "Github account is not synced<br/>";
    echo "<a href='sync.php'>Go to sync</a>";
    die();
}
$token = $_SESSION['token'];

$owner = "";
if (isset($_SESSION['owner'])) {
    $owner = $_SESSION['owner'];
} else {
    if (isset($_GET['owner'])) {
        $_SESSION['owner'] = $_GET['owner'];
        header("Refresh:0");
    }
}

if (!isset($_GET['repo'])) {
    unset($_SESSION['owner']);
    foreach ($client->repos->listYourRepositories() as &$repo) {
        $name = $repo->getName();
        $owner = $repo->getOwner()->getLogin();
        $params = 'token=' . $token . '&owner=' . $owner . '&repo=' . $name . '&branch=master&path=';
        echo "<a class='repo' href='?$params'>$owner/$name</a>";
        echo "<br>";
    }
} else if (!isset($_GET['filename'])) {
    $repo = $_GET['repo'];
    $path = $_GET['path'];
    $branch = $_GET['branch'];
    foreach ($client->repos->listBranches($owner, $repo) as &$_branch) {
        $branchName = $_branch->getName();
        $params = 'token=' . $token . '&owner=' . $owner . '&repo=' . $repo . '&branch=' . $branchName . '&path=' . $path;
        echo "<a class='branch' href='?$params'>$branchName</a>";
        echo '&nbsp;&nbsp;&nbsp;&nbsp;';
    }
    echo '<br><br>';
    foreach ($client->repos->contents->getContents($owner, $repo, $path, $ref = $branch) as &$content) {
        $name = $content->getName();
        if ($content->getType() == "file") {
            $params = 'token=' . $token . '&owner=' . $owner . '&repo=' . $repo . '&branch=' . $branch . '&path=' . $path . '&filename=' . $name;
            echo "<a class='file' href='?$params'>$name</a>";
            echo "<br>";
        } else {
            $params = 'token=' . $token . '&owner=' . $owner . '&repo=' . $repo . '&branch=' . $branch . '&path=' . $path . '/' . $name;
            echo "<a class='directory' href='?$params'>$name</a>";
            echo "<br>";
        }
    }
} else {
    $repo = $_GET['repo'];
    $path = $_GET['path'];
    $filename = $_GET['filename'];
    $branch = $_GET['branch'];
    foreach ($client->repos->listBranches($owner, $repo) as &$_branch) {
        $branchName = $_branch->getName();
        $params = 'token=' . $token . '&owner=' . $owner . '&repo=' . $repo . '&branch=' . $branchName . '&path=' . $path . '&filename=' . $filename;
        echo "<a class='branch' href='?$params'>$branchName</a>";
        echo '&nbsp;&nbsp;&nbsp;&nbsp;';
    }
    echo '<br><br>';
    echo "&nbsp;&nbsp;&nbsp;&nbsp;$filename:<br>";
    echo getFileContents($client, $owner, $repo, $path, $filename, $branch);
}
?>

<link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">

<style>
    body {
        font-family: 'Open Sans', sans-serif;
    }

    a {
        text-decoration: none;
    }

    a.repo {
        color: purple;
    }

    a.branch {
        color: green;
    }

    a.directory {
        color: red;
    }

    a.file {
        color: blue;
    }
</style>
