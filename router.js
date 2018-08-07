/*
 * Route file manager paths to respective templates and requests
 *
 * @author Shivashriganesh Mahato
 */

let castle = angular.module('castle', ['castle.treasury', 'ui.router', 'ngSanitize']).config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('home', {
        url: '/home',
        templateUrl: 'home.html',
        controller: 'BlankCtrl'
    }).state('playground', {
        url: '/playground?repo',
        templateUrl: 'Sandbox_Back/playground.php',
        controller: 'playgroundCtrl'
    }).state('treasury', {
        url: '/treasury',
        abstract: true,
        templateUrl: 'fileManager/FileM.html',
        controller: 'BlankCtrl'
    }).state('chat', {
        url: '/luau',
        templateUrl: 'chat.html',
        controller: 'BlankCtrl'
    }).state('settings', {
        url: '/settings',
        templateUrl: 'Settings.php',
        controller: 'settingsCtrl',
        params: {
            unsynced: false
        }
    }).state('notifications', {
        url: '/notifications',
        templateUrl: 'Notifications.html',
        controller: 'notificationsCtrl'
    });

    $urlRouterProvider.otherwise(function($injector, $location) {
        let state = $injector.get("$state");
        if ($location.path() === "/treasury") {
            state.go('treasury.projects');
        } else {
            state.go('home');
        }
        return $location.path();
    });
    $urlRouterProvider.rule(function($injector, $location) {
        var path = $location.path();
        if (path === "/treasury/") {
            var hasTrailingSlash = path[path.length-1] === '/';

            if (hasTrailingSlash) {
                var newPath = path.substr(0, path.length - 1);
                return newPath;
            }
        }
    });
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
});

castle.controller('BlankCtrl', function () {
});

castle.controller('playgroundCtrl', playgroundCtrl);

castle.controller('settingsCtrl', function ($scope, $stateParams) {
    if ($stateParams.unsynced) {
        swal("Hey!", "Please sync into Github", "info");
    }
});

castle.controller('notificationsCtrl', function ($scope, $http) {
    $scope.notifications = [];
    $scope.friendRequestRespond = function (fromUname, fromID, response) {
        for (var i = 0; i < $scope.notifications.length; i++) {
            var notif = $scope.notifications[i];
            if (notif.from === fromUname) {
                $scope.notifications.splice(i, 1);
                break;
            }
        };
        $http({
            url: 'respondToFriendRequest.php',
            data: $.param({
                from: fromUname,
                fromID: fromID,
                accepted: response
            }),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;', 'Accept': 'application/json'}
        });
    }
    $scope.deleteNotif = function (notifID) {
        $http({
            url: 'deleteNotif.php',
            data: $.param({
                id: notifID
            }),
            method: "post",
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;', 'Accept': 'application/json'}
        });
    }
    $http({
        url: 'fetchNotifications.php',
        data: {},
        method: "post",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;', 'Accept': 'application/json'}
    }).then(function (response) {
        $scope.notifications = response.data.notifications;
    });
});
