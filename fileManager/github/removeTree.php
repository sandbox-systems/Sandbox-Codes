<?php
/**
 * Delete tree sha entry in Sandbox DB bound to current owner, repo, and branch
 * Assumes dbInit.php has already been loaded and $owner, $repo, and $branch are initialized
 *
 * @author Shivashriganesh Mahato
 */

unset($_SESSION['tree']);
updateDocument($man, "repos", ['owner' => $owner, 'name' => $repo], Operators::Unset,
    [$branch => ""]);