(function(){
  "use strict";
  function CommitStreamAdminBoot(el) {
    var persistentOptions = {
      headers: { Bearer: '' }
    };

    var app = angular.module('commitStreamAdmin', ['commitStreamAdmin.config', 'angular-hal', 'ngRoute']);
    app.config(function($sceProvider) {
      $sceProvider.enabled(false);
    });

    app.factory('CommitStreamApi', ['serviceUrl', 'halClient', function(serviceUrl, halClient) {
      return {
        'load' : function() {
          return halClient.$get(serviceUrl + '/api/public', persistentOptions);
        },
      };
    }]);

    app.config(['serviceUrlProvider', '$routeProvider', function(serviceUrlProvider, $routeProvider) {
      var serviceUrl = serviceUrlProvider.$get();
      $routeProvider.when('/', {templateUrl: serviceUrl + '/partials/instances.html', controller: 'InstancesController'});
      $routeProvider.when('/inboxes', {templateUrl: serviceUrl + '/partials/inboxes.html', controller: 'InboxesController'});
      $routeProvider.otherwise({redirectTo: serviceUrl + '/'});
    }]);

    app.directive('toggleCheckbox', function($timeout) {
      /**
       * Directive
       */
      return {
        restrict: 'A',
        transclude: true,
        replace: false,
        require: 'ngModel',
        link: function ($scope, $element, $attr, ngModel) {
          // update model from Element
          var updateModelFromElement = function() {
            // If modified
            var checked = $element.prop('checked');
            if (checked != ngModel.$viewValue) {
              // Update ngModel
              ngModel.$setViewValue(checked);
              $scope.$apply();
            }
          };

          // Update input from Model
          var updateElementFromModel = function(newValue) {
            $element.trigger('change');
          };

          // Observe: Element changes affect Model
          $element.on('change', function() {
            updateModelFromElement();
          });

          $scope.$watch(function() {
            return ngModel.$viewValue;
          }, function(newValue) { 
            updateElementFromModel(newValue);
          }, true);

          // Initialise BootstrapToggle
          $element.bootstrapToggle();
        }
      };
    });

    app.controller('InstancesController',
      ['$rootScope', '$scope', '$http', '$location', 'CommitStreamApi', 'serviceUrl', 'configGetUrl', 'configSaveUrl',
      function($rootScope, $scope, $http, $location, CommitStreamApi, serviceUrl, configGetUrl, configSaveUrl) {        
        var config;

        CommitStreamApi
        .load()
        .then(function(resources) {
          $rootScope.resources = resources;
          if (!configGetUrl) return {
            data: {
              serviceUrl: serviceUrl,
              instanceId: '',
              apiKey: '',
              globalDigestId: '',
              configured: false,
              enabled: false
            }
          }
          return $http.get(configGetUrl);
        })
        .then(function(configRes) {
          // TODO handle null case?
          config = configRes.data;
          if (config.configured) {
            persistentOptions.headers.Bearer = config.apiKey;
            return $rootScope.resources.$get('instance', {instanceId: config.instanceId});
          } else {
            return $rootScope.resources.$post('instances');
          }
        })
        .then(function(instance) {
          persistentOptions.headers.Bearer = instance.apiKey; // Ensure apiKey for NEW instance
          $rootScope.instance = instance;

          if (config.configured) {
            return $rootScope.resources.$get('digest', {
              instanceId: config.instanceId,
              digestId: config.globalDigestId
            });
          }
          else {
            return instance.$post('digest-create', {}, {
              description: 'Global Repositories List'
            });
          }
        })
        .then(function(digest) {
          $rootScope.digest = digest;

          if (!config.configured) {
            config.instanceId = $rootScope.instance.instanceId;
            config.globalDigestId = $rootScope.digest.digestId;
            config.apiKey = $rootScope.instance.apiKey;
            if (configSaveUrl) {
              $http.post(configSaveUrl, config).then(function(configSaveResult) {
                // TODO?
                $location.path('/inboxes');
              });
            } else {
              $location.path('/inboxes');
            }
          } else {
            $location.path('/inboxes');
          }
        })
        .catch(function(error) {
          console.error("Caught an error adding an instance or a repo list!");
          console.error(error);
        });
      }]
    );

    app.controller('InboxesController', ['$rootScope', '$scope', '$timeout', 'serviceUrl', function($rootScope, $scope, $timeout, serviceUrl) {
      $scope.newInbox = {
        url: '',
        name: '',
        family: 'GitHub'
      };

      $scope.loaderUrl = serviceUrl + '/ajax-loader.gif';
      
      $scope.inboxes = [];

      $scope.enabledState = { 
        enabled: false,
        applying: false,
        onText: 'Enabled',
        offText: 'Disabled'
      };

      $scope.message = { value: ''};

      $scope.enabledChanged = function() {
        $rootScope.digest.$get('inboxes').then(function(inboxesRes) {
          inboxesRes.$get('inboxes').then(function(inboxes) {
            // TODO: fix all this up
            console.log(inboxes);
            inboxes.forEach(function(inbox) {
              console.log(inbox.name);
              var links = inbox.$links();
              console.log(links['self'].href);
            });
          });
        });       
        apply();
      };

      var apply = function() {
        $scope.enabledState.applying = true;
        $('.enabled').bootstrapToggle('disable');
        $timeout(function() {          
          $scope.enabledState.applying = false;
          $('.enabled').bootstrapToggle('enable');
        }, 2000);
      };

      $scope.applying = function() {
        return $scope.enabledState.applying;
      };

      $scope.reposVisible = function() {
        return ($scope.enabledState.enabled && !$scope.enabledState.applying) 
        || (!$scope.enabledState.enabled && $scope.enabledState.applying);
      }

      $scope.inboxCreate = function() {
        var index = $scope.newInbox.url.lastIndexOf('/');
        $scope.newInbox.name = $scope.newInbox.url.substr(index + 1);

        $rootScope.digest.$post('inbox-create', {}, $scope.newInbox)
        .then(function(inbox) {
          var links = inbox.$links();
          inbox.addCommit = links['add-commit'].href + 'apiKey=' + persistentOptions.headers.Bearer;
          inbox.removeHref = links['self'].href + 'apiKey=' + persistentOptions.headers.Bearer;          
          $scope.inboxes.unshift(inbox);
          $scope.newInbox.url = '';
        })
        .catch(function(error) {
          console.error("Caught an error adding a repo!");
          console.error(error);
        });
      };

      $scope.inboxRemove = function(inbox) {
        inbox.$del('self').then(function(result) {
          $scope.message.value = 'Successfully removed inbox';      
          var index = $scope.inboxes.indexOf(inbox);
          $scope.inboxes.splice(index, 1);
          $timeout(function() {
            $('.message').fadeOut('slow', function() {
              $scope.message.value = '';
            });
          }, 4000);
        });
      };

      var inboxHighlight = function(el) {
        el.focus();
        el.select();
      };

      $scope.inboxHighlight = function(evt) {
        inboxHighlight(evt.currentTarget);
      };

      $scope.inboxHighlightTop = function() {
        var el = $($('.inbox')[0]);
        $timeout(function() {
          inboxHighlight(el);
        }, 0);      
      };

    }]);

    angular.bootstrap(el, ['commitStreamAdmin']);
  };
  window.CommitStreamAdminBoot = CommitStreamAdminBoot;
}());
