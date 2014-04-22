'use strict';
(function(angular) {

  var HOURS_PER_DAY = 24;
  var MINUTES_PER_HOUR = 60;
  var MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;

  var MEANINGFUL_TIME_INTERVAL = 30;
  var NUMBER_OF_MEANINGFUL_INTERVALS = MINUTES_PER_DAY / MEANINGFUL_TIME_INTERVAL;

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
      var minutes = now.getUTCMinutes();
      var minutesIntoTheDay = hours * MINUTES_PER_HOUR + minutes;
      var roundedMinutesIntoTheDay = roundToMeaningfulInterval(minutesIntoTheDay);

      return _makeClockTime(roundedMinutesIntoTheDay);
    };

    var roundToMeaningfulInterval = function(minutes) {
      return roundToNearestInterval(minutes, MEANINGFUL_TIME_INTERVAL);
    };

    return currentClockTime;
  });

  angular.module('wtfTimeIsThatApp').factory('meaningfulUTCTimes', ['clockTime',
    function(clockTime) {
      return function() {
        var currentUTCTime = clockTime();

        var utcTimes = [];
        for (var intervalNumber = 0; intervalNumber < NUMBER_OF_MEANINGFUL_INTERVALS; intervalNumber++) {
          var nextTime = currentUTCTime.addMinutes(intervalNumber * MEANINGFUL_TIME_INTERVAL);
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

  function roundToNearestInterval(numberToRound, interval) {
    return Math.round(numberToRound / interval) * interval;
  }

})(angular);
