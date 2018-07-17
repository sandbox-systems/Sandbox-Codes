var scotchApp = angular.module('fileManager', ['ngRoute']);

scotchApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/FileM.html', {
            redirectTo: '/'
        })
        .when('/', {
            templateUrl: 'content.php',
            controller: 'mainController'
        })
        .when('/about/:id*', {
            templateUrl: 'content.php',
            controller: 'aboutController'
        })
        .when('/contact', {
            templateUrl: 'content.php',
            controller: 'contactController'
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