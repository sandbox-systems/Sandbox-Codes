<?php
/**
 * Add a branch to currently selected repo
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$from = $_GET['from'];
$branch = $_GET['branch'];

$sha = $client->git->refs->getReference($owner, $repo, "heads/$from")->getObject()->getSha();
$client->git->refs->addReference($owner, $repo, "refs/heads/$branch", $sha);