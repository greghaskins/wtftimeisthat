'use strict';
(function(angular) {

  var MINUTES_PER_HOUR = 60;

  angular.module('wtfTimeIsThatApp')
    .controller('MainCtrl', ['$scope', 'meaningfulUTCTimes',
      function($scope, meaningfulUTCTimes) {

        $scope.timeZones = [{
          name: 'IST',
          utcOffsetMinutes: 5 * MINUTES_PER_HOUR + 30
        }, {
          name: 'EDT',
          utcOffsetMinutes: -4 * MINUTES_PER_HOUR
        }, {
          name: 'CDT',
          utcOffsetMinutes: -5 * MINUTES_PER_HOUR
        }, {
          name: 'PDT',
          utcOffsetMinutes: -7 * MINUTES_PER_HOUR
        }];

        $scope.utcTimes = meaningfulUTCTimes();
      }
    ]);

  angular.module('wtfTimeIsThatApp').factory('clockTime', function() {

    var HOURS_PER_DAY = 24;
    var MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;

    var _makeClockTime = function(minutesIntoTheDay) {
      var _minutesIntoTheDay = minutesIntoTheDay;

      return {
        getHours: function() {
          return Math.floor(_minutesIntoTheDay / MINUTES_PER_HOUR);
        },

        getMinutes: function() {
          return _minutesIntoTheDay % MINUTES_PER_HOUR;
        },

        addMinutes: function(minutes) {
          var newClockTimeMinutes = (_minutesIntoTheDay + minutes) % MINUTES_PER_DAY;
          while (newClockTimeMinutes < 0) {
            newClockTimeMinutes += MINUTES_PER_DAY;
          }
          return _makeClockTime(newClockTimeMinutes);
        }
      };
    };

    var currentClockTime = function() {
      var now = new Date();
      var hours = now.getUTCHours();
      var minutesIntoTheDay = hours * MINUTES_PER_HOUR;
      return _makeClockTime(minutesIntoTheDay);
    };

    return currentClockTime;
  });

  angular.module('wtfTimeIsThatApp').factory('meaningfulUTCTimes', ['clockTime',
    function(clockTime) {
      return function() {
        var currentUTCTime = clockTime();

        var utcTimes = [];
        for (var hour = 0; hour < 24; hour++) {
          var nextTime = currentUTCTime.addMinutes(hour * MINUTES_PER_HOUR);
          utcTimes.push(nextTime);
        }
        return utcTimes;
      };
    }
  ]);

  angular.module('wtfTimeIsThatApp').filter('shortTimeFormat', function() {
    return function(localDate) {
      var hours = localDate.getHours();
      var minutes = localDate.getMinutes();

      var shortTime;
      if (hours === 0 && minutes === 0) {
        shortTime = 'midnight';
      } else if (hours === 12 && minutes === 0) {
        shortTime = 'noon';
      } else {
        var formattedHours = hours % 12 || 12;
        var formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        var ampm = hours < 12 ? 'a' : 'p';
        shortTime = formattedHours + ':' + formattedMinutes + ' ' + ampm;
      }

      return shortTime;
    };

  });

})(angular);
