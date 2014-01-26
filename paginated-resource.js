require(['angular', 'angular-resource'], function (ng) {
  'use strict';

  ng.module('begriffs.paginated-resource', ['ngResource']).

    factory('paginated-resource', ['$resource', '$http', '$q', function (resource, $http, $q) {
      return function (url, range, params, actions) {

        actions = ng.extend(
          actions || {},
          {
            query: {
              isArray: true,
              method: 'GET',
              headers: {
                'Range-Unit': 'items',
                'Range': range ? [range[0], range[1]].join('-') : ''
              },
              interceptor: {
                responseError: function(r) {
                  if(r.status === 413 &&
                     r.headers('Accept-Ranges') === 'items' &&
                     !r.config.headers.Range) {
                    r.config.headers.Range = '0-24';
                    return $http(r.config);
                  } else {
                    return $q.reject(r);
                  }
                }
              }
            }
          }
        );

        return resource(url, params, actions);
      };
    }]);
});
