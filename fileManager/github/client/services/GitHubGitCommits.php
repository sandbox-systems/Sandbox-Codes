<?php

require_once(__DIR__ . '/../GitHubClient.php');
require_once(__DIR__ . '/../GitHubService.php');
require_once(__DIR__ . '/../objects/GitHubGitCommit.php');
	

class GitHubGitCommits extends GitHubService
{

	/**
	 * Get a Commit
	 * 
	 * @return GitHubGitCommit
	 */
	public function getCommit($owner, $repo, $sha)
	{
		$data = array();
		
		return $this->client->request("/repos/$owner/$repo/git/commits/$sha", 'GET', $data, 200, 'GitHubGitCommit');
	}

	/**
	 * Get a Commit
	 *
	 * @return GitHubGitCommit
	 */
	public function createCommit($owner, $repo, $message, $treeSha, $parentSha)
	{
		$data = array();
		$data['message'] = $message;
		$data['tree'] = $treeSha;
		$data['parents'] = [$parentSha];

		return $this->client->request("/repos/$owner/$repo/git/commits", 'POST', $data, 201, 'GitHubGitCommit');
	}
	
}

