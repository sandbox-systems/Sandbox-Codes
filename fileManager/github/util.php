<?php
/**
 * Utilities used throughout application
 *
 * In all functions, $client is a GithubClient object that should be preset with authentication token.
 * Unless otherwise specified, all functions that have $path as parameter should have argument with filename included
 * passed.
 *
 * @author Shivashriganesh Mahato
 */

include 'params.php';

/**
 * Get organized array of repository files.
 *
 * @param string $path Directory to get files from; don't pass argument if root of repository wanted
 * @return array Organized array of repo files
 */
function getFiles($client, $owner, $repo, $path = "", $branch="master")
{
    // Fetch contents of this subdirectory
    $contents = $client->repos->contents->getContents($owner, $repo, $path, $branch);

    $files = array();

    // Populate files array with files and directories in this subdirectory
    if (is_array($contents) || is_object($contents)) {
        foreach ($contents as $content) {
            $name = $content->getName();
            $type = $content->getType();
            if ($type == "file") {
                $files[] = $content;
            } else {
                $files[$name] = getFiles($client, $owner, $repo, $path . '/' . $name);
            }
        }
    }

    return $files;
}


/**
 * Get a file (GithubContents object) from the repository.
 *
 * @return GitHubContents object will all file information
 */
function getFile($client, $owner, $repo, $path, $filename, $branch = "master")
{
    return $client->repos->contents->getContents($owner, $repo, $path . '/' . $filename, $ref = $branch);
}

/**
 * Fetch contents of a file.
 *
 * @return string Contents of desired file
 * TODO parse raw contents to account for special characters (i.e. <>)
 */
function getFileContents($client, $owner, $repo, $path, $filename, $branch = "master")
{
    $file = getFile($client, $owner, $repo, $path, $filename, $branch);
    // Get and decode contents of file (fetched in Base 64)
    return base64_decode($file->getContent());
}

/**
 * Fetch access token from authentication server using callback code.
 *
 * @param string $client_id Application client ID
 * @param string $client_secret Application client secret
 * @param string $code Callback code; don't pass argument if already authenticated
 *
 * @return string Access Token
 */
function getToken($client_id, $client_secret, $code = "")
{
    // TODO Store and get access token from DB
    if (isset($_GET['token'])) {
        return $_GET['token'];
    } else {
        $token = fetchToken($code, $client_id, $client_secret);
        header('Location: ?token=' . $token);
        exit();
    }
}

function fetchToken($code, $client_id, $client_secret)
{
    // Location of Github authentication server where access token is given
    $auth_server_url = "https://github.com/login/oauth/access_token";

    // Define request parameters
    $data = array(
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'code' => $code,
        'accept' => 'application/json'
    );
    $payload = array(
        'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        )
    );

    // Send request and fetch response
    $context = stream_context_create($payload);
    $response_temp = file_get_contents($auth_server_url, false, $context);

    // Kill application if response was unsuccessfully fetched
    if ($response_temp === FALSE) {
        die("UNSUCCESSFUL");
    }

    // Parse response to array
    $response_to_array = explode('&', $response_temp);
    $response = array();
    for ($i = 0; $i < count($response_to_array); $i++) {
        $key_value = explode('=', $response_to_array [$i]);
        $response[$key_value [0]] = $key_value [1];
    }

    // Get token from response
    // TODO Store token in DB and reuse; fetch new one only once old one expires
    return $response['access_token'];
}

/**
 * Setup client with access code.
 */
function setupToken($client, $client_id, $client_secret)
{
    $code = "";
    if (isset($_GET['code']))
        $code = $_GET['code'];
    $client->setOauthToken(getToken($code, $client_id, $client_secret));
}

/**
 * Create file in a repository and push to remote.
 */
function createFile($client, $owner, $repo, $path, $commit_msg, $branch = "master")
{
    $client->repos->contents->createFile($owner, $repo, $path, $commit_msg, "", $branch);
}

/**
 * Commit and push changes to file to remote.
 *
 * @param GitHubContents $file File object with name, content, etc. of file to update on repository
 */
function updateFile($client, $owner, $repo, $file, $commit_msg, $content, $branch = "master")
{
    $client->repos->contents->updateFile($owner, $repo, $file->getPath(), $commit_msg, base64_encode($content),
        $file->getSha(), $branch);
}

/**
 * Push delete request for file in remote.
 *
 * @param GitHubContents $file File object with name, content, etc. of file to update on repository
 */
function deleteFile($client, $owner, $repo, $file, $commit_msg, $branch = "master")
{
    $client->repos->contents->deleteFile($owner, $repo, $file->getPath(), $commit_msg, $file->getSha(), $branch);
}

/**
 * Get list of branches in array.
 *
 * @return array List of branches
 */
function getBranches($client, $owner, $repo) {
    return $client->repos->listBranches($owner, $repo);
}