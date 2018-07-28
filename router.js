/*
 * Route file manager paths to respective templates and requests
 *
 * @author Shivashriganesh Mahato
 */

let castleApp = angular.module('castle', ['ngRoute']);

castleApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/Castle.html', {
            redirectTo: '/home'
        })
        .when('/home', {
            templateUrl:'home.html'
        })
        .when('/playground', {
            templateUrl:'Sandbox_Back/playground.php'
        })
        .when('/treasury', {
            templateUrl: 'fileManager/FileM.html',
        })
        .when('/chat', {
            templateUrl: 'chat.html',
        })
        .otherwise({
            // 404
        });

    $locationProvider.html5Mode(true);
});