<?php
/**
 * Save new tree sha to Sandbox DB by either updating existent member or upserting new one
 * Assumes dbInit.php has already been loaded and $owner, $repo, $branch, and $_SESSION['tree'] are initialized
 *
 * @author Shivashriganesh Mahato
 */

updateDocument($man, "repos", ['owner' => $owner, 'name' => $repo], Operators::Set,
    [$branch => $_SESSION['tree']]);