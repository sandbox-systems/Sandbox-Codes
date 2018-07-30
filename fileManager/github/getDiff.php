<?php
/**
 * Fetch diff between local version and remote HEAD
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';
include 'fetchTree.php';

// Get HEAD commit sha
$parent = $client->git->refs->getReference($owner, $repo, "heads/$branch")->getObject()->getSha();
// Create temporary commit from current version tree
$commit = $client->git->commits->createCommit($owner, $repo, "", $_SESSION['tree'], $parent)->getSha();
// Fetch diff
$patches = array();
$diffs = $client->repos->commits->compareTwoCommits($owner, $repo, $parent, $commit)->getFiles();
foreach ($diffs as $diff) {
    $patches[] = array(
        'sha' => $diff->getSha(),
        'name' => $diff->getFilename(),
        'patch' => $diff->getPatch(),
        'additions' => $diff->getAdditions(),
        'deletions' => $diff->getDeletions(),
        'changes' => $diff->getChanges(),
        'status' => $diff->getStatus()
    );
}

// Respond with encoded diff
header('Content-Type: application/json');
echo json_encode($patches);
