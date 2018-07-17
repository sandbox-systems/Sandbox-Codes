var scotchApp = angular.module('fileManager', ['ngRoute']);

scotchApp.config(function ($routeProvider, $locationProvider) {
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
            controller: 'aboutController'
        });

    $locationProvider.html5Mode(true);
});

scotchApp.controller('mainController', function ($scope) {
    $scope.message = 'Everyone come and see how good I look!';
});

scotchApp.controller('aboutController', function ($scope, $routeParams) {
    $scope.message = 'Look! I am an about page #' + $routeParams.id;
});

scotchApp.controller('contactController', function ($scope) {
    $scope.message = 'Contact us! JK. This is just a demo.';
});