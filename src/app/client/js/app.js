(function(){
  'use strict';

  var persistentOptions = {
    headers: { Bearer: '' }
  };

  var app = angular.module('commitStream', ['ui.bootstrap', 'angular-hal', 'ngRoute']);

  app.factory('CommitStreamApi', ['halClient', function(halClient) {
    return {
      'load' : function() {
        return halClient.$get('http://localhost:6565/api/public', persistentOptions);
      },
    };
  }]);

  app.config(['$routeProvider', '$sceProvider', function($routeProvider, $sceProvider) {
    $sceProvider.enabled(false);
    $routeProvider.when('/', {templateUrl: 'http://localhost:6565/partials/instances.html', controller: 'InstancesController'});
    $routeProvider.when('/inboxes', {templateUrl: 'http://localhost:6565/partials/inboxes.html', controller: 'InboxesController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);

  app.controller('InstancesController',
    ['$rootScope', '$scope', '$location', 'CommitStreamApi',
    function($rootScope, $scope, $location, CommitStreamApi) {
      CommitStreamApi
      .load()
      .then(function(resources) {
        $rootScope.resources = resources;
        return resources.$post('instances');
      })
      .then(function(instance) {
        persistentOptions.headers.Bearer = instance.apiKey;
        $rootScope.instance = instance;

        return instance.$post('digest-create', {}, {
          description: 'My new digest'
        });
      })
      .then(function(digest) {
        $rootScope.digest = digest;
        $location.path('/inboxes');
      })
      .catch(function(error) {
        console.error("Caught an error adding an instance or a repo list!");
        console.error(error);
      });
    }]
  );

  app.controller('InboxesController', ['$rootScope', '$scope', function($rootScope, $scope) {
    $scope.newInbox = {
      url: '',
      name: '',
      family: 'GitHub'
    };
    
    $scope.inboxes = [];

    $scope.inboxCreate = function() {
      var index = $scope.newInbox.url.lastIndexOf('/');
      $scope.newInbox.name = $scope.newInbox.url.substr(index + 1);

      $scope.getWebHookUrl = function(inbox) {
        return inbox.$links()['add-commit'].href + '?apiKey=' + persistentOptions.headers.Bearer;
      };

      $rootScope.digest.$post('inbox-create', {}, $scope.newInbox)
      .then(function(inbox) {
        var links = inbox.$links();        
        $scope.inboxes.push(inbox);
      })
      .catch(function(error) {
        console.error("Caught an error adding a repo!");
        console.error(error);
      });
    };
  }]);

}());