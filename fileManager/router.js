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
        .when('/owners/:owner/repos/:repo/branches/:branch/file/:file', {
            templateUrl: 'templates/file.html',
            controller: 'fileController'
        })
        .when('/owners/:owner/repos/:repo/branches/:branch/:path*/file/:file', {
            templateUrl: 'templates/file.html',
            controller: 'fileController'
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

fmApp.controller('mainController', function ($scope, $routeParams, $http) {
    clearFileList();

    $http({
        url: "requests/getProjects.php",
        params: {},
        method: "get"
    }).then(function (response) {
        $scope.repos = response.data;
    });

    $scope.addedIDs = [];
    $scope.addRepo = function (id, owner, name) {
        if (!$scope.addedIDs.includes(id)) {
            $scope.addedIDs.push(id);
            let href = "owners/" + owner + "/repos/" + name + "/branches/master";
            addFolder(name, href, function () {
                window.scrollTo(0, 0);
            });
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

    $http({
        url: "requests/projectContents.php",
        params: $scope.params,
        method: "get"
    }).then(function (response) {
        $scope.contents = response.data;
    });

    $http({
        url: "github/branches.php",
        params: {
            owner: $scope.params.owner,
            repo: $scope.params.repo
        },
        method: "get"
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
    $scope.addFile = function (id, name) {
        if (!$scope.addedIDs.files.includes(id)) {
            $scope.addedIDs.files.push(id);
            let href = "owners/" + $scope.params.owner + "/repos/" + $scope.params.repo + "/branches/" +
                $scope.params.branch + "/" + $scope.params.path + ($scope.params.path.length === 0 ? '' : '/') +
                'file/' + name;
            addFile(name, href, function () {
                window.scrollTo(0, 0);
            })
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

fmApp.controller('fileController', function ($scope, $http, $routeParams) {
    clearFileList();

    $scope.params = {
        owner: $routeParams.owner || "",
        repo: $routeParams.repo || "",
        path: $routeParams.path || "",
        branch: $routeParams.branch || "master",
        file: $routeParams.file || ""
    };

    $http({
        url: "requests/fileContents.php",
        params: $scope.params,
        method: "get"
    }).then(function (response) {
        $scope.contents = response.data;
    });
});