<?php
/**
 * @author Shivashriganesh Mahato
 */

use \MongoDB\Driver\Query;
use \MongoDB\Driver\Exception\Exception;
use \MongoDB\BSON\ObjectId;

include 'fileManager/github/init.php';

$input = $_GET['input'];

/**
 * Search for a user given a search box input and determine whether he/she is a friend
 *
 * @param $man \MongoDB\Driver\Manager
 * @param $userID
 * @param $input
 * @return array
 */
function searchUser($man, $userID, $input) {
    $encodedInput = preg_quote($input);
    $filter = ['$or' => [['name' => ['$regex' => $encodedInput]], ['username' => ['$regex' => $encodedInput]]]];
    $query = new Query($filter, []);
    try {
        $docs = array();
        $cursor = $man->executeQuery("sandbox.users", $query);
        foreach ($cursor as $doc) {
            unset($doc->_id);
            unset($doc->roomIDs);
            $doc->isFriend = in_array(new ObjectId($userID), $doc->friends);
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

$results = searchUser($man, '5b2acced5a1857e1fe988db0', $input) + searchRooms($man, $input);

echo '<pre>';
var_dump($results);
echo '</pre>';