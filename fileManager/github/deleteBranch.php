<?php
/**
 * Delete a branch from currently selected repo
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$branch = $_GET['branch'];

$client->git->refs->deleteReference($owner, $repo, "heads/$branch");