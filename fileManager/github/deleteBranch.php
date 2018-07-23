<?php
/**
 * Delete a branch from currently selected repo
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];

$client->git->refs->deleteReference($owner, $repo, "heads/$branch");