/**
 * Route file manager paths to respective templates and requests
 *
 * @author Shivashriganesh Mahato
 */

let treasury = angular.module('castle.treasury', ['ui.router']).config(function ($stateProvider) {
    $stateProvider.state('treasury.projects', {
        url: '/',
        templateUrl: 'fileManager/templates/projects.html',
        controller: 'projectsController'
    }).state('treasury.projectRoot', {
        url: '/:owner/:repo/:branch',
        controller: 'rootCtrl'
    }).state('treasury.project', {
        url: '/:owner/:repo/:branch/{path:.*}',
        templateUrl: 'fileManager/templates/project.html',
        controller: 'projectController'
    });
});

treasury.controller('rootCtrl', function ($state, $stateParams) {
    $state.go('treasury.project', {owner: $stateParams.owner, repo: $stateParams.repo,
        branch: $stateParams.branch, path: ""});
});

treasury.controller('projectsController', function ($scope, $http, $state) {
    clearFileList();
    setCurBranchName("Select Branch");
    setIsViewingInsideRepo(false);

    $('#preloader').fadeIn();
    $http({
        url: "fileManager/requests/getProjects.php",
        data: $.param({}),
        method: "post",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
    }).then(function (response) {
        hidePreloader();
        if (response.data === "UNSYNCED") {
            $state.go('settings', {unsynced: true});
        }
        $scope.repos = response.data;
    });

    $scope.addedIDs = [];
    $scope.addRepo = function (id, owner, name, isPrivate) {
        if (!$scope.addedIDs.includes(id)) {
            $scope.addedIDs.push(id);
            let sref = "treasury.project({owner: " + owner + ", repo: " + name + ", branch: master})";
            addFolder(name, sref, function () {
                window.scrollTo(0, 0);
            }, isPrivate);
        }
    };

    $scope.drag = drag;
    $scope.allowDrop = allowDrop;
});

treasury.controller('syncController', function ($scope) {
    clearFileList();
});

treasury.controller('projectController', function ($scope, $stateParams, $http, $state) {
    clearFileList();
    clearBranches();
    setIsViewingInsideRepo(true);

    $scope.params = {
        owner: $stateParams.owner || "",
        repo: $stateParams.repo || "",
        path: $stateParams.path || "",
        branch: $stateParams.branch || "master"
    };

    $http({
        url: "fileManager/requests/getFriendsList.php",
        data: $.param({}),
        method: "post",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
    }).then(function (response) {
        $scope.friendsList = response.data;
    });

    setCurBranchName($scope.params.branch);
    updateBreadCrumbs("treasury/" + $scope.params.owner + "/" + $scope.params.repo + "/" +
        $scope.params.branch, $scope.params.path, $scope.params.repo);

    setCurPath("owners/" + $scope.params.owner + "/repos/" + $scope.params.repo + "/branches/" +
        $scope.params.branch + "/" + $scope.params.path + ($scope.params.path.length === 0 ? '' : '/'));

    setOnCommitPress(function (msg) {
        $http({
            url: "fileManager/requests/saveChanges.php",
            data: $.param({...$scope.params, ...{message: msg}}),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
        }).then(function (response) {
        });
    });

    setLocalRepoData({
        owner: $scope.params.owner,
        repo: $scope.params.repo,
        branch: $scope.params.branch
    });

    setOnRepoPlay(function() {
        $state.go('playground', {repo: $scope.params.owner + "/" + $scope.params.repo});
    });

    setOnCreateFile(function (name) {
        $http({
            url: "fileManager/requests/createFile.php",
            data: $.param({...$scope.params, ...{name: name}}),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
        }).then(function (response) {
        });
    });

    setOnFileDelete(function (name) {
        $http({
            url: "fileManager/requests/deleteFile.php",
            data: $.param({...$scope.params, ...{name: name}}),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
        }).then(function (response) {
        });
    });

    function showFileInfo (sha, path) {
        $http({
            url: "fileManager/requests/getFileDetails.php",
            data: $.param({...$scope.params, ...{sha: sha, path: $scope.params.path + ($scope.params.path === "" ? "" : "/") + path}}),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
        }).then(function (response) {
            showFileContents(atob(response.data.content), response.data.size, response.data.created, response.data.edited);
        });
    };

    setFetchFileContents(showFileInfo);
    setOnFileInfo(showFileInfo);

    $('#preloader').fadeIn();
    $http({
        url: "fileManager/requests/getProjectContents.php",
        data: $.param($scope.params),
        method: "post",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
    }).then(function (response) {
        $scope.contents = response.data;
        hidePreloader();
    });

    $http({
        url: "fileManager/github/branches.php",
        data: $.param({
            owner: $scope.params.owner,
            repo: $scope.params.repo
        }),
        method: "post",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
    }).then(function (response) {
        $scope.branches = response.data;
    });

    $scope.addedIDs = {dirs: [], files: []};
    $scope.branchesAdded = [];
    $scope.addFolder = function (id, name) {
        if (!$scope.addedIDs.dirs.includes(id)) {
            $scope.addedIDs.dirs.push(id);
            let href = "owners/" + $scope.params.owner + "/repos/" + $scope.params.repo + "/branches/" +
                $scope.params.branch + "/" + $scope.params.path + ($scope.params.path.length === 0 ? '' : '/') + name;
            addFolder(name, href, function () {
                window.scrollTo(0, 0);
            });
        }
    };
    $scope.addFile = function (id, name, sha) {
        if (!$scope.addedIDs.files.includes(id)) {
            $scope.addedIDs.files.push(id);
            addFile(name, function () {
            }, sha, $scope.params.path + ($scope.params.path === "" ? "" : "/") + name)
        }
    };
    $scope.addBranch = function (name, href) {
        if (!$scope.branchesAdded.includes(name)) {
            $scope.branchesAdded.push(name);
            let href = $scope.params.owner + "/" + $scope.params.repo + "/" + name + "/" +
                $scope.params.path;
            addBranch(name, href, function () {
                window.scrollTo(0, 0);
            })
        }
    };
});
