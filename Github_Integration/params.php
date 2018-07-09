<?php
/**
 * Global parameters and object declarations
 *
 * @author Shivashriganesh Mahato
 */

include '../client/GitHubClient.php';

// Parameters given by Github when you register your application for OAuth
// TODO Setup Environment Variables to store values; DO NOT HARD CODE IN PRODUCTION
$client_id = "271533d001c5a5b7724f";
$client_secret = "a8a1fda0069ea877b495b44d188a8faa318f5877";

// Define GithubClient from library
$client = new GitHubClient();
$client->setAuthType($client::GITHUB_AUTH_TYPE_OAUTH);