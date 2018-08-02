/*
 * Route file manager paths to respective templates and requests
 *
 * @author Shivashriganesh Mahato
 */

let castle = angular.module('castle', ['castle.treasury', 'ui.router', 'ngSanitize']).config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'home.html',
        controller: 'BlankCtrl'
    }).state('playground', {
        url: '/playground',
        templateUrl: 'Sandbox_Back/playground.php',
        controller: 'playgroundCtrl'
    }).state('treasury', {
        url: '/treasury',
        templateUrl: 'fileManager/FileM.html',
        controller: 'fmCtrl'
    }).state('chat', {
        url: '/chat',
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

    $urlRouterProvider.otherwise('/');
});

castle.controller('BlankCtrl', function () {
});

castle.controller('fmCtrl', function ($state) {
    $state.go('treasury.projects');
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
