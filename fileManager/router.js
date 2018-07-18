let fmApp = angular.module('fileManager', ['ngRoute']);

fmApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/FileM.html', {
            redirectTo: '/'
        })
        .when('/', {
            templateUrl: 'projects.php',
            controller: 'mainController'
        })
        .when('/sync', {
            templateUrl: 'github/sync.php',
            controller: 'syncController'
        })
        .when('/owners/:owner/repos/:repo', {
            templateUrl: 'project.html',
            controller: 'repoController'
        })
        .when('/owners/:owner/repos/:repo/:path*', {
            templateUrl: 'project.html',
            controller: 'repoController'
        })
        .otherwise({
            templateUrl: '404.html'
        });

    $locationProvider.html5Mode(true);
});

fmApp.controller('mainController', function ($scope) {
});

fmApp.controller('syncController', function ($scope) {
});

fmApp.controller('repoController', function ($scope, $routeParams, $http) {
    clearFileList();

    $scope.params = {
        owner: $routeParams.owner || "",
        repo: $routeParams.repo || "",
        path: $routeParams.path || ""
    };

    $http({
        url: "projectContents.php",
        params: $scope.params,
        method: "get"
    }).then(function (response) {
        $scope.contents = response.data;
    });

    $scope.addedIDs = {dirs: [], files: []};
    $scope.addFolder = function(id, name, href) {
        if (!$scope.addedIDs.dirs.includes(id)) {
            $scope.addedIDs.dirs.push(id);
            addFolder(name, href, function () {
                window.scrollTo(0, 0);
            });
        }
    };
    $scope.addFile = function (id, name, href) {
        if (!$scope.addedIDs.files.includes(id)) {
            $scope.addedIDs.files.push(id);
            addFile(name, href, function () {
                window.scrollTo(0, 0);
            })
        }
    }
});