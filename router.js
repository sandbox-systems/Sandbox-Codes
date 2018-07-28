/*
 * Route file manager paths to respective templates and requests
 *
 * @author Shivashriganesh Mahato
 */

let castle = angular.module('castle', ['castle.treasury', 'ui.router']).config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'home.html',
        controller: 'BlankCtrl'
    }).state('playground', {
        url: '/playground',
        templateUrl: 'Sandbox_Back/playground.php',
        controller: 'BlankCtrl'
    }).state('treasury', {
        url: '/treasury',
        templateUrl: 'fileManager/FileM.html',
        controller: 'fmCtrl'
    }).state('chat', {
        url: '/chat',
        templateUrl: 'chat.html',
        controller: 'BlankCtrl'
    }).state('settings',{
        url:'/settings',
        templateUrl: 'settings.html',
        controller: 'BlankCtrl'
    });

    $urlRouterProvider.otherwise('/');
});

castle.controller('BlankCtrl', function () {
});

castle.controller('fmCtrl', function ($state) {
    $state.go('treasury.projects');
});