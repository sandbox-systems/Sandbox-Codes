<?php
/**
 * @author Shivashriganesh Mahato
 */

use \MongoDB\Driver\Query;
use \MongoDB\Driver\Exception\Exception;
use \MongoDB\BSON\ObjectId;

include 'fileManager/github/init.php';

$input = $_GET['input'];
//$curUsername = $_SESSION['username'];
$curUsername = 'jsmith43';
//$userID = $_SESSION['object_id'];
$userID = '5b2acced5a1857e1fe988db0';

/**
 * Search for a user given a search box input and determine whether he/she is a friend
 *
 * @param $man \MongoDB\Driver\Manager
 * @param $username
 * @param $userID
 * @param $inputUname
 * @return array
 */
function searchUser($man, $username, $userID, $inputUname) {
    if ($username == $inputUname) {
        return [];
    }
    $encodedInput = preg_quote($inputUname);
    $filter = ['username' => ['$regex' => $encodedInput]];
    $query = new Query($filter, []);
    try {
        $docs = array();
        $cursor = $man->executeQuery("sandbox.users", $query);
        foreach ($cursor as $doc) {
            unset($doc->_id);
            unset($doc->roomIDs);
            $doc->isFriend = $userID == "" ? null : in_array(new ObjectId($userID), $doc->friends);
            unset($doc->friends);
            $docs[] = $doc;
        }
        return $docs;
    } catch (Exception $ex) {
        printf("Error: %s\n", $ex->getMessage());
        exit;
    }
}

/**
 * @param $man \MongoDB\Driver\Manager
 * @param $input
 * @return array
 */
function searchRooms($man, $input) {
    $encodedInput = preg_quote($input);
    $filter = ['name' => ['$regex' => $encodedInput]];
    $query = new Query($filter, []);
    try {
        $docs = array();
        $cursor = $man->executeQuery("sandbox.rooms", $query);
        foreach ($cursor as $doc) {
            unset($doc->_id);
            unset($doc->chatEntries);
            unset($doc->members);
            $docs[] = $doc;
        }
        return $docs;
    } catch (Exception $ex) {
        printf("Error: %s\n", $ex->getMessage());
        exit;
    }
}

/**
 * @param $client GitHubClient
 * @param $man \MongoDB\Driver\Manager
 * @param $username
 * @param $owner
 * @param $filename
 * @return array
 */
function searchFile($client, $man, $username, $owner, $filename) {
    $contents = [];
    $GHUname = searchUser($man, $username, "", $owner)[0]->GHUsername;
    $results = $client->search->searchCode($GHUname, $filename);
    foreach ($results as $result) {
        $contents[] = array(
            'name' => $result->name,
            'path' => $result->path
        );
    }
    return $contents;
}

header('Content-Type: application/json');

// @user (filename)
$userOrFile = '/^@([A-Za-z0-9_.!-]+) ?([^ ]+)?/';
// other/filename (@user)
$otherOrFile = '/^([^ ]+) ?@([A-Za-z0-9_.!-]+)?/';
if (preg_match($userOrFile, $input, $groups)) {
    if (isset($groups[2])) {
        echo "File";
        echo json_encode(searchFile($client, $man, $curUsername, $groups[1], $groups[2]));
    } else {
        echo "User";
        echo json_encode(searchUser($man, $curUsername, $userID, $groups[1]));
    }
} else if (preg_match($otherOrFile, $input, $groups)) {
    if (isset($groups[2])) {
        echo "File";
        echo json_encode(searchFile($client, $man, $curUsername, $groups[2], $groups[1]));
    } else {
        echo json_encode(searchRooms($man, $groups[1]));
    }
} else {
    echo json_encode(searchRooms($man, $input));
}