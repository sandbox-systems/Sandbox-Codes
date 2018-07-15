<?php
/**
 * Global parameters and object declarations
 *
 * @author Shivashriganesh Mahato
 */

include 'client/GitHubClient.php';

// Parameters given by Github when you register your application for OAuth
// TODO Setup Environment Variables to store values; DO NOT HARD CODE IN PRODUCTION
$client_id = "cfcb9d0319f6d921ae8d";
$client_secret = "f011bb24a20ece7cb495df5cd057c3aeaa3f7de2";

// Define GithubClient from library
$client = new GitHubClient();
$client->setAuthType($client::GITHUB_AUTH_TYPE_OAUTH);