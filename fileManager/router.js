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
        .when('/owners/:owner/repos/:repo', {
            templateUrl: 'templates/project.html',
            controller: 'repoController'
        })
        .when('/owners/:owner/repos/:repo/file/:file', {
            templateUrl: 'templates/file.html',
            controller: 'fileController'
        })
        .when('/owners/:owner/repos/:repo/:path*/file/:file', {
            templateUrl: 'templates/file.html',
            controller: 'fileController'
        })
        .when('/owners/:owner/repos/:repo/:path*', {
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
            let href = "owners/" + owner + "/repos/" + name;
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

    $scope.params = {
        owner: $routeParams.owner || "",
        repo: $routeParams.repo || "",
        path: $routeParams.path || ""
    };

    $http({
        url: "requests/projectContents.php",
        params: $scope.params,
        method: "get"
    }).then(function (response) {
        $scope.contents = response.data;
    });

    $scope.addedIDs = {dirs: [], files: []};
    $scope.addFolder = function (id, name) {
        if (!$scope.addedIDs.dirs.includes(id)) {
            $scope.addedIDs.dirs.push(id);
            let href = "owners/" + $scope.params.owner + "/repos/" + $scope.params.repo + "/" + $scope.params.path +
                ($scope.params.path.length === 0 ? '' : '/') + name;
            addFolder(name, href, function () {
                window.scrollTo(0, 0);
            });
        }
    };
    $scope.addFile = function (id, name) {
        if (!$scope.addedIDs.files.includes(id)) {
            $scope.addedIDs.files.push(id);
            let href = "owners/" + $scope.params.owner + "/repos/" + $scope.params.repo + "/" + $scope.params.path +
                ($scope.params.path.length === 0 ? '' : '/') + 'file/' + name;
            addFile(name, href, function () {
                window.scrollTo(0, 0);
            })
        }
    }
});

fmApp.controller('fileController', function ($scope, $http, $routeParams) {
    clearFileList();

    $scope.params = {
        owner: $routeParams.owner || "",
        repo: $routeParams.repo || "",
        path: $routeParams.path || "",
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