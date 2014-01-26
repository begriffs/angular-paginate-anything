require(['angular', 'angular-resource'], function (ng) {
  'use strict';

  ng.module('begriffs.paginated-resource', ['ngResource']).

    factory('paginated-resource', ['$resource', '$http', '$q', function ($resource, $http, $q) {
      var self = function (url, range, params, actions) {
        var headers = {};
        if(range) {
          headers = {
            'Range-Unit': 'items',
            'Range': range ? [range[0], range[1]].join('-') : ''
          };
        }

        actions = ng.extend(
          actions || {},
          {
            query: {
              isArray: true,
              method: 'GET',
              headers: headers,
              interceptor: {
                responseError: function(r) {
                  if(r.status === 413 &&
                     r.headers('Accept-Ranges') === 'items' &&
                     !r.config.headers.Range) {
                    r.config.headers['Range-Unit'] = 'items';
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

        return $resource(url, params, actions);
      };

      self.nextPage = function (headers) {
        var match = (new RegExp('<(.*?)>;.*items="(\\d+)-(\\d+)"')).exec(headers('Link'));
        if(match) {
          return self(match[1], [+match[2], +match[3]]);
        }
        return null;
      };

      return self;
    }]);
});
