<?php
/**
 * @author Shivashriganesh Mahato
 */

use \MongoDB\Driver\Query;
use \MongoDB\Driver\Exception\Exception;
use \MongoDB\BSON\ObjectId;

include 'fileManager/github/init.php';

header('Content-Type: application/json');

abstract class Types
{
    const User = array('type' => 'user');
    const Chatroom = array('type' => 'chatroom');
    const File = array('type' => 'file');
}

$input = $_POST['input'];
$curUsername = $_SESSION['username'];
//$curUsername = 'jdoe1';
$userID = $_SESSION['object_id'];
//$userID = '5b2acced5a1857e1fe988db0';

/**
 * Search for a user given a search box input and determine whether he/she is a friend
 *
 * @param $man \MongoDB\Driver\Manager
 * @param $username
 * @param $userID
 * @param $inputUname
 * @param $shouldVerify
 * @return array
 */
function searchUser($man, $username, $userID, $inputUname, $shouldVerify) {
    if ($shouldVerify && $username == $inputUname) {
        return [];
    }
    $encodedInput = preg_quote($inputUname);
    $filter = ['username' => ['$regex' => '^' . $encodedInput]];
    $query = new Query($filter, []);

    try {
        $docs = array();
        $cursor = $man->executeQuery("sandbox.users", $query);
        foreach ($cursor as $doc) {
            if ($shouldVerify ? $doc->username != $username : true) {
                $foundUser = array(
                    'username' => $doc->username,
                    'name' => $doc->name,
                    'isFriend' => $userID == "" ? null : in_array($userID, $doc->friends)
                );
                if (userID != "") {
                    $foundUser['isRequested'] = count(getDocuments($man, "requests", ['$or' => array(['fromID' => (string) $doc->_id, 'to' => $userID], ['fromID' => $userID, 'to' => (string) $doc->_id])], [])) > 0;
                }
                if (isset($doc->GHUsername))
                    $foundUser['ghUsername'] = $doc->GHUsername;
                $docs[] = $foundUser;
            }
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
    $users = searchUser($man, $username, "", $owner, false);
    foreach ($users as $user) {
        if (!isset($user['ghUsername'])) {
            if (!isset($contents['notsynced'])) {
                $contents['notsynced'] = array();
            }
            $contents['notsynced'][] = $user['username'] == $username ? '' : $user['name'];
            continue;
        }
        $GHUname = $user['ghUsername'];
        $results = $client->search->searchCode($GHUname, $filename);
        foreach ($results as $result) {
            $contents[] = array(
                'name' => $result->name,
                'path' => $result->path
            );
        }
    }
    return $contents;
}

// @user (filename)
$userOrFile = '/^@([A-Za-z0-9_.!-]+) ?([^ ]+)?/';
// other/filename (@user)
$otherOrFile = '/^([^ ]+) ?@([A-Za-z0-9_.!-]+)?/';
if (preg_match($userOrFile, $input, $groups)) {
    if (isset($groups[2])) {
        echo json_encode(searchFile($client, $man, $curUsername, $groups[1], $groups[2]) + Types::File);
    } else {
        echo json_encode(searchUser($man, $curUsername, $userID, $groups[1], true) + Types::User);
    }
} else if (preg_match($otherOrFile, $input, $groups)) {
    if (isset($groups[2])) {
        echo json_encode(searchFile($client, $man, $curUsername, $groups[2], $groups[1]) + Types::File);
    } else {
        echo json_encode(searchRooms($man, $groups[1]) + Types::Chatroom);
    }
} else {
    echo json_encode(searchRooms($man, $input) + Types::Chatroom);
}
