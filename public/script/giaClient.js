angular.module('giaApp', [])
  // Declare the controller with all the required libraries
  .controller('giadataController', ['$scope', '$http', '$sce',
    function($scope, $http, $sce) {
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
      // @type object Default to a grid view in the giadata object
      $scope.giadata      = {viewFormat: 'grid', currItem: {}, config: {}, dom:{}, showdetails: true};
      // @type array A collection of objects representing social systems
      $scope.socialModules = [];
      
      // @type function Update the giadata and do update related tasks
      $scope.updateGiaData = function (newData, callback) {
        if (newData[$scope.memoField] !== $scope.memo) {
          console.log('update GiaData:', $scope.giadata);
          console.log('with newData:', newData);
          console.log("newData[$scope.memoField] = %s $scope.memo = %s", newData[$scope.memoField], $scope.memo);

          // Update the locally stored memo
          $scope.memo = newData[$scope.memoField];

          // Update the local data
          $scope.giadata = angular.extend($scope.giadata, newData);

          // Store the data locally
          $scope.localDataDom && localStorage && localStorage.setItem($scope.localDataDom + '_data', JSON.stringify($scope.giadata));

          // Also update the social data when there's a gia data update
          $scope.updateSocialModules();

          // The $sce object wraps the maps url in a usable iframe
          if (typeof $scope.giadata.config.mapsaddress === 'string') {
            $scope.giadata.config.mapsaddress = $sce.trustAsResourceUrl($scope.giadata.config.mapsaddress);
          }
        }

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
          // Set zoomTo to 800 for a regular screen, or 600 for mobile platforms
          zoomTo = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))
          ? 600 : 800,
          
          // format for landscape display
          fontSize = Math.floor((window.innerHeight / zoomTo) * 100) / 100 + 'em',

          // DOM reference to the content object which is the primary display window
          content = document.getElementById('content'),
          
          // DOM reference to the drawer object which obstructs that content
          contentDrawer = document.getElementById('contentDrawer');

        if (window.innerHeight > window.innerWidth) {
          // Portrait display
          fontSize = Math.floor((window.innerWidth / zoomTo) * 100) / 100 + 'em';
        }
        // Set the body fontSize attribute to the factored size for the screen
        document.getElementsByTagName("body")[0].style.fontSize = fontSize;

        // Also resize the main content area down to 90% of the screen
        if (content.style) {
          content.style.height = window.innerHeight - contentDrawer.clientHeight + 'px';
          content.style.width = window.innerWidth + 'px';
        }
      };

      // @type function Angular runs this on account of the ng-init directive in the controller
      $scope.init = function () {
        $scope.resizer();
        window.onresize = function () {$scope.resizer();};
      };

      // @type function Get the local data store from the jsonp server
      $scope.getGiaData = function (callback) {
        $http.jsonp($scope.giaUrl + $scope.qs + '&rest=/1/two/3/four/5/six/7/8/9/10').
          success(function(data, status, headers, config) {
            // If the data retrieved isn't just the memo, update it
            if (typeof data !== 'string') {
              $scope.updateGiaData(data);
            }
            if (typeof callback === 'function') {
              callback(data);
            }
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.updateGiaData({});
          });
      };

      // If there's a local store of information, assign it to the giadata 
      if ($scope.localDataDom && localStorage && $scope.giadata.hasOwnProperty($scope.memoField)) {
        $scope.updateGiaData($scope.safeParse(localStorage.getItem($scope.localDataDom + '_data')), function() {
          // If the memo exists in the cachedData, set it to the local memo
          $scope.memo = $scope.giadata[$scope.memoField];
          $scope.qs += '&action=poll&' + $scope.memoField + '=' + $scope.giadata[$scope.memoField];
        });
      }

      // The controller is initiating, get data and start a refresh cycle:
      $scope.getGiaData(
        function () {
          window.setInterval(function () {
            $scope.getGiaData();
          }, 100000);
        }
      );
    }
  ])

  /**
   * A Shopping basket (because carts have wheels and this doesn't)
   * 
   * Which is totally open source
   *
   * written using angular.js framework
   * 
   * By Belin Fieldson <thebelin@gmail.com>
   * Use and modify as you find the need to
   */
  .controller('shopController', ['$scope', '$http',
    function($scope, $http) {

      // @type object A basket to use, create as many as required
      $scope.basket = {

        // @type int The last time the basket was updated
        lastUpdate: new Date().getTime(),

        // @type int The last time the total was updated
        lastTotalUpdate: this.lastUpdate,

        // @type array The contents of the basket
        contents: [],

        // The total of the value of the items added to this basket
        total: 0,

        // @type function Generate a signature for the item which includes the name and options
        //                but not the quantity
        // @return string A signature representing the item
        makeSignature: function (newItem) {
          for (
            // Note that this is an extended "for" statement declaration
            // @type array Items not included in scan
            var notIncluded = ['price','quantity','__total','description','available','signature','preview','thumbnail'],

            // @type object The object which the function will return
            retObj = {},

            // @type array The keys of the object passed in
            keys = Object.keys(newItem),

            // @type int An iterator
            i = 0;
            // End for statement var declarations
            i < keys.length;
            i ++) {
            // Add the item to the return if it's not banned and it's a property
            if (newItem.hasOwnProperty(keys[i]) && notIncluded.indexOf(keys[i]) === -1) {
              retObj[keys[i]] = newItem[keys[i]];
            }
          }

          return JSON.stringify(retObj);
        },

        // @type function Check if the basket already contains the item
        // @return bool|int The index of the item in the basket or false
        inBasket: function (newItem) {
          for (var i = 0; i < this.contents.length; i++) {
            if (this.contents[i].signature === newItem.signature) {
              return i;
            }
          }
          return false;
        },

        getTotal: function () {
          // If the lastUpdate hasn't changed return the cached total
          if (this.lastTotalUpdate === this.lastUpdate) {
            return this.total;
          }

          // Otherwise, get the totals of each basket item and total them
          this.total = 0;
          for (var i = 0; i < this.contents.length; i++) {
            this.total += this.contents[i].__total;
          }

          // Set the lastTotalUpdate and lastUpdate to the same timestamp
          this.lastTotalUpdate = this.lastUpdate;

          // Return the total
          return this.total;
        },

        // @type function Add item to the basket
        addItem: function (newItem) {
          // Establish item properties
          // Note that the || operator allows for shorthand property assignment
          newItem = angular.extend(
            {
              name:     newItem.name     || newItem.label    || 'null',
              price:    newItem.price    || newItem.cost     || 0,
              quantity: newItem.quantity || 1
            },
            newItem
          );

          // Establish the signature of the item
          newItem.signature = this.makeSignature(newItem);

          // Check if the item is in the basket already
          var basketId = this.inBasket(newItem);
          if (basketId !== false) {
            // increment the quantity
            this.contents[basketId].quantity += newItem.quantity;
            // Assign the existing item to the newItem for callback
            newItem = this.contents[basketId];
          } else {
            // else add the item to the basket
            this.contents.unshift(newItem);
            basketId = 0;
          }
          // Add a __total field to the basket item
          this.contents[basketId].__total = this.contents[basketId].quantity * this.contents[basketId].price;

          // record an update date to the tracker
          this.lastUpdate = new Date().getTime();

          // update the total
          this.getTotal();
        },

        addOneItem: function (newItem) {
          newItem.quantity = 1;
          this.addItem(newItem);
        },

        // @type function Add collection of items to the basket
        addItems: function (newItems) {
          // iterate every newItems item and add to the basket
          newItems.map(this.addItem(newItem), this);
        },

        // Remove the specified item from the contents
        removeItem: function (itemSpec) {
          var basketId = this.inBasket(itemSpec);
          if (basketId !== false) {
            // If the quantity is higher than one, decrement it
            if (this.contents[basketId].quantity > 1) {
              this.contents[basketId].quantity --;
  
              // update the __total field to the basket item
              this.contents[basketId].__total = this.contents[basketId].quantity * this.contents[basketId].price;
            } else {
              this.contents.splice(basketId, 1);
            }

            // record an update date to the tracker
            this.lastUpdate = new Date().getTime();

            // Update the total
            this.getTotal();
          }
        }
      };

    }
  ]);