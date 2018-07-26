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

include 'fetchTree.php';

// Fetch most recent commit in branch as the parent of the commit to be made
$parent = $client->git->refs->getReference($owner, $repo, "heads/$branch")->getObject()->getSha();
// Ensure that there is a working tree with changes to push
if ($_SESSION['tree'] != $parent) {
    $tree = $_SESSION['tree'];
    // Create commit object from working tree
    $commit = $client->git->commits->createCommit($owner, $repo, $message, $tree, $parent)->getSha();
    include 'removeTree.php';
    // Point branch HEAD to new commit
    $client->git->refs->updateReference($owner, $repo, "heads/$branch", $commit);
}