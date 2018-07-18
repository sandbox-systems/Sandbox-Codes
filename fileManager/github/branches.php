<?php
/**
 * Fetch all branches that the selected repository has
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$owner = $_GET['owner'];
$repo = $_GET['repo'];

$branches = array();
$data = $client->repos->listBranches($owner, $repo);

foreach ($data as &$branch) {
    $branches[] = $branch->getName();
}

header('Content-Type: application/json');
echo json_encode($branches);