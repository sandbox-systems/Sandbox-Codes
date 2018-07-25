<?php

require_once(__DIR__ . '/../GitHubClient.php');
require_once(__DIR__ . '/../GitHubService.php');
require_once(__DIR__ . '/../objects/GitHubBlob.php');
	

class GitHubGitBlobs extends GitHubService
{

	/**
	 * Get a Blob
	 * 
	 * @return GitHubBlob
	 */
	public function getBlob($owner, $repo, $sha)
	{
		$data = array();
		
		return $this->client->request("/repos/$owner/$repo/git/blobs/$sha", 'GET', $data, 200, 'GitHubBlob', true);
	}

	public function createBlob($owner, $repo, $content)
	{
		$data = array(
		    "content" => $content,
            "encoding" => "utf-8"
        );

		return $this->client->request("/repos/$owner/$repo/git/blobs", 'GET', $data, 200, 'GitHubBlob', true);
	}
	
}

