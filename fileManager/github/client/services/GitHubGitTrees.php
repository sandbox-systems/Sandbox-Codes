<?php

require_once(__DIR__ . '/../GitHubClient.php');
require_once(__DIR__ . '/../GitHubService.php');
require_once(__DIR__ . '/../objects/GitHubTree.php');
require_once(__DIR__ . '/../objects/GitHubTreeExtra.php');


class GitHubGitTrees extends GitHubService
{

    /**
     * Get a Tree
     *
     * @return GitHubTreeExtra
     */
    public function getTree($owner, $repo, $sha)
    {
        $data = array();

        return $this->client->request("/repos/$owner/$repo/git/trees/$sha", 'GET', $data, 200, 'GitHubTreeExtra');
    }

    /**
     * Get a Tree Recursively
     *
     * @return GitHubTreeExtra
     */
    public function getTreeRecursively($owner, $repo, $sha)
    {
        $data = array();

        return $this->client->request("/repos/$owner/$repo/git/trees/$sha?recursive=1", 'GET', $data, 200, 'GitHubTreeExtra');
    }

    /**
     * @param $owner
     * @param $repo
     * @param $treeData
     * @return GitHubTreeExtra
     */
    public function createTree($owner, $repo, $treeData)
    {
        $data = array();
        $data['tree'] = $treeData;

        return $this->client->request("/repos/$owner/$repo/git/trees?recursive=1", "POST", $data, 201, "GitHubTreeExtra");
    }
}

