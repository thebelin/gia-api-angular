angular.module('giaApp', [])
  // Declare the controller with all the required libraries
  .controller('giadataController', ['$scope', '$http',
    function($scope, $http) {
      // Adding to $scope is like creating new variables
      $scope.giaUrl       = 'https://script.google.com/macros/s/AKfycbyvb-2gd5IDPf42P2CIS1f8EVesZfPTMZJNCsLyAvDnEnbYdJhb/exec';
      // @type string The querystring value to attach to the data URL
      $scope.qs           = '?prefix=JSON_CALLBACK';
      // @type string The field in the data returned which tracks the update signature
      $scope.memoField    = 'menuHash';
      // @type string The localData storage DOM for this transfer
      $scope.localDataDom = window.location.href;
      // @type string A memo which indicates the state of the source data
      $scope.memo         = '';
      // @type object Default to a list view in the giadata object
      $scope.giadata      = {viewFormat:'list',currItem:{},config:{}};
      // @type array A collection of objects representing social systems
      $scope.socialModules = [];

      // @type function Update the giadata and do update related tasks
      $scope.updateGiaData = function (newData, callback) {
        // Update the local date 
        $scope.giadata = angular.extend($scope.giadata, newData);

        // Store the data locally
        $scope.localDataDom && localStorage && localStorage.setItem($scope.localDataDom + '_data', JSON.stringify($scope.giadata));

        // Update the locally stored memo
        $scope.memo = newData[$scope.memoField] || '';
 
        // Also update the social data when there's a gia data update
        $scope.updateSocialModules();

        // Perform any callback
        if (typeof callback === 'function') {
          callback();
        }
      };

      // @type function Return some configurations of popular social integrations
      $scope.updateSocialModules = function (callback) {
        console.log('updateSocialModules ', $scope.socialModules);
        $scope.socialModules = [
          {system:'facebook',  icon:'facebook',    data: $scope.giadata.config.facebookAppId  || false},
          {system:'twitter',   icon:'twitter',     data: $scope.giadata.config.twitter   || false},
          {system:'google',    icon:'google-plus', data: $scope.giadata.config.google    || false},
          {system:'youtube',   icon:'youtube',     data: $scope.giadata.config.youtube   || false},
          {system:'pinterest', icon:'pinterest',   data: $scope.giadata.config.pinterest || false},
          {system:'rss',       icon:'rss',         data: $scope.giadata.config.rss       || false},
        ];
        if (typeof callback === 'function') {
          callback();
        }
      };

      $scope.getSocialModules = function () {
        return $scope.socialModules;
      };

      // @type function A safe JSON parse routine
      $scope.safeParse = function (parseData) {
        try {
          return JSON.parse(parseData);
        } catch(e) {
          return parseData;
        }
      };

      //@type function Something to run on resize and load for responsive layout
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
          content.style.height = window.innerHeight * .9 + 'px';
          content.style.width = window.innerWidth + 'px';
        }
      };

      //@type function Angular runs this on account of the ng-init directive in the controller
      $scope.init = function() {
        $scope.resizer();
        window.onresize = function(){$scope.resizer();};
      };

      // If there's a local store of information, assign it to the giadata 
      if ($scope.localDataDom && localStorage) {
        $scope.updateGiaData($scope.safeParse(localStorage.getItem($scope.localDataDom + '_data')), function() {
          // If the memo exists in the cachedData, set it to the local memo
          if ($scope.giadata && $scope.giadata[$scope.memoField] !== 'undefined') {
            $scope.memo = $scope.giadata[$scope.memoField];
            $scope.qs += '&action=poll&' + $scope.memoField + '=' + $scope.giadata[$scope.memoField];
          } 
        });
      }

      // The controller is initiating, get data:
      $http.jsonp($scope.giaUrl + $scope.qs).
        success(function(data, status, headers, config) {
          $scope.updateGiaData(data);
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          $scope.updateGiaData({});
        });
  }]);