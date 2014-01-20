define(['angular', 'angular-resource'], function (ng) {
  'use strict';

  return ng.module('begriffs.paginated-resource', ['ngResource']).
    factory('paginated-resource', ['$resource', function (resource) {
      return function (url, range, params, actions) {

        //var nextRange, prevRange;

        actions = ng.extend(
          actions || {},
          {
            query: {
              isArray: true,
              method: 'GET',
              headers: {
                'Range-Unit': 'items',
                'Range': range ? [range[0], range[1]].join(' - ') : ''
              }
            }
          }
        );

        return resource(url, params, actions);
      };
    }]);
});
