angular.module('giaApp', [])
  .controller('giadataController', ['$scope', '$http', '$templateCache',
    function($scope, $http, $templateCache) {
      // @type string The querystring value to attach to the data URL
      $scope.qs = '?prefix=JSON_CALLBACK';
      // @type string The field in the data returned which tracks the update signature
      $scope.memoField = 'menuHash';
      // @type string The localData storage DOM for this transfer
      $scope.localDataDom = window.location.href;
      // @type string A memo which indicates the state of the source data
      $scope.memo = '';

      // @type function A safe JSON parse routine
      $scope.safeParse = function (parseData) {
        try {
          return JSON.parse(parseData);
        } catch(e) {
          return parseData;
        }
      };

      $scope.resizer = function() {
        var
          // Set zoomTo to 800 for a regular screen, or 400 for mobile platforms
          zoomTo = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))
          ? 400 : 800,
          
          // format for landscape display
          fontSize = Math.floor((window.innerHeight / zoomTo) * 100) / 100 + 'em',

          content = document.getElementById('content');

        if (window.innerHeight > window.innerWidth) {
          // Portrait display
          fontSize = Math.floor((window.innerWidth / zoomTo) * 100) / 100 + 'em';
        }
        // Set the body fontSize attribute to the factored size for the screen
        document.getElementsByTagName("body")[0].style.fontSize = fontSize;
        // Also resize the main content area down to 90% of the screen
        
        if (content.style) {
          content.style.innerHeight = window.innerHeight * .9;
        }
      };
      
      $scope.init = function() {
        $scope.resizer();
        window.onresize = function(){$scope.resizer();};
      };

      if ($scope.localDataDom && localStorage) {
        $scope.giadata = $scope.safeParse(localStorage.getItem($scope.localDataDom + '_data'));
        // If the memo exists in the cachedData, set it to the local memo
        if ($scope.giadata && $scope.giadata[$scope.memoField] !== 'undefined') {
          $scope.memo = $scope.giadata[$scope.memoField];
          $scope.qs += '&action=poll&' + $scope.memoField + '=' + $scope.giadata[$scope.memoField];
        }
      }
      // The controller is initiating, get data:
      $http.jsonp('https://script.google.com/macros/s/AKfycbyvb-2gd5IDPf42P2CIS1f8EVesZfPTMZJNCsLyAvDnEnbYdJhb/exec' + $scope.qs).
        success(function(data, status, headers, config) {
          // Set the local memo if it has been supplied, and update the page data
          if (data[$scope.memoField]) {
            $scope.memo = data[$scope.memoField];
            // Store the data locally
            $scope.localDataDom && localStorage && localStorage.setItem($scope.localDataDom + '_data', JSON.stringify(data));
            // Set the local giadata attribute of the $scope to the returned data
            $scope.giadata = data;
          }
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $scope.giadata = {};
        });
  }]);