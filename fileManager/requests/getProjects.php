<?php
/**
 * Fetch and respond with a list of the projects the user owns
 *
 * @author Shivashriganesh Mahato
 */

include 'global.php';

if ($storageMethod == "GITHUB") {
    include '../github/repos.php';
}