<?php
/**
 * Save changes locally stored to appropriate storage API
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

if ($storageMethod == "GITHUB") {
    include '../github/commitChanges.php';
}