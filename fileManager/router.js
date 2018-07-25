/**
 * Route file manager paths to respective templates and requests
 *
 * @author Shivashriganesh Mahato
 */

let fmApp = angular.module('fileManager', ['ngRoute']);

fmApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/FileM.html', {
            redirectTo: '/'
        })
        .when('/', {
            templateUrl: 'templates/projects.html',
            controller: 'mainController'
        })
        .when('/sync', {
            templateUrl: 'github/sync.php',
            controller: 'syncController'
        })
        .when('/owners/:owner/repos/:repo/branches/:branch', {
            templateUrl: 'templates/project.html',
            controller: 'repoController'
        })
        .when('/owners/:owner/repos/:repo/branches/:branch/:path*', {
            templateUrl: 'templates/project.html',
            controller: 'repoController'
        })
        .otherwise({
            templateUrl: 'templates/404.html'
        });

    $locationProvider.html5Mode(true);
});

fmApp.controller('mainController', function ($scope, $route, $routeParams, $http, $location) {
    clearFileList();

    $http({
        url: "requests/getProjects.php",
        data: $.param({}),
        method: "post",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
    }).then(function (response) {
        if (response.data === "UNSYNCED") {
            $location.path('/sync');
        }
        $scope.repos = response.data;
    });

    $scope.addedIDs = [];
    $scope.addRepo = function (id, owner, name, isPrivate) {
        if (!$scope.addedIDs.includes(id)) {
            $scope.addedIDs.push(id);
            let href = "owners/" + owner + "/repos/" + name + "/branches/master";
            addFolder(name, href, function () {
                window.scrollTo(0, 0);
            }, isPrivate);
        }
    };
});

fmApp.controller('syncController', function ($scope) {
    clearFileList();
});

fmApp.controller('repoController', function ($scope, $routeParams, $http) {
    clearFileList();
    clearBranches();

    $scope.params = {
        owner: $routeParams.owner || "",
        repo: $routeParams.repo || "",
        path: $routeParams.path || "",
        branch: $routeParams.branch || "master"
    };

    updateBreadCrumbs("owners/" + $scope.params.owner + "/repos/" + $scope.params.repo + "/branches/" +
        $scope.params.branch, $scope.params.path, $scope.params.repo);

    setCurPath("owners/" + $scope.params.owner + "/repos/" + $scope.params.repo + "/branches/" +
        $scope.params.branch + "/" + $scope.params.path + ($scope.params.path.length === 0 ? '' : '/'));

    setOnCommitPress(function (msg) {
        $http({
            url: "requests/saveChanges.php",
            data: $.param({...$scope.params, ...{message: msg}}),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
        }).then(function (response) {
        });
    });

    setOnCreateFile(function (name) {
        $http({
            url: "requests/createFile.php",
            data: $.param({...$scope.params, ...{name: name}}),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
        }).then(function (response) {
        });
    });

    setOnFileDelete(function (name) {
        $http({
            url: "requests/deleteFile.php",
            data: $.param({...$scope.params, ...{name: name}}),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
        }).then(function (response) {
        });
    });

    setFetchFleContents(function (name) {
        $http({
            url: "requests/getFileContents.php",
            data: $.param({...$scope.params, ...{file: name}}),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
        }).then(function (response) {
            showFileContents(response.data);
        });
    });

    $http({
        url: "requests/getProjectContents.php",
        data: $.param($scope.params),
        method: "post",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'}
    }).then(function (response) {
        $scope.contents = response.data;
    });

    $http({
        url: "github/branches.php",
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
            }, sha)
        }
    };
    $scope.addBranch = function (name) {
        if (!$scope.branchesAdded.includes(name)) {
            $scope.branchesAdded.push(name);
            let href = "owners/" + $scope.params.owner + "/repos/" + $scope.params.repo + "/branches/" + name + "/" +
                $scope.params.path;
            addBranch(name, href, function () {
                window.scrollTo(0, 0);
            })
        }
    };
});