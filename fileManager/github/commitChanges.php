<?php
/**
 * Fetch tree whose sha is stored in session, create commit from it, and point branch HEAD to it
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];
$message = $_POST['message'];

// Ensure that there is a working tree with changes to push
if (!isset($_SESSION['tree']) || $_SESSION['tree'] == "") {
    die("NO CHANGES");
}
$tree = $_SESSION['tree'];
// Fetch most recent commit in branch as the parent of the commit to be made
$parent = $client->git->refs->getReference($owner, $repo, "heads/$branch")->getObject()->getSha();
// Create commit object from working tree
$commit = $client->git->commits->createCommit($owner, $repo, $message, $tree, $parent)->getSha();
$_SESSION['tree'] = "";
// Point branch HEAD to new commit
$client->git->refs->updateReference($owner, $repo, "heads/$branch", $commit);