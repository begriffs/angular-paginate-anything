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

      self.followLink = function (rel) {
        return function (headers) {
          var match, links = headers('Link').split(',');
          for(var i in links) {
            if(links[i].indexOf('rel="' + rel + '"') >= 0) {
              match = (new RegExp('<(.*?)>;.*items="(\\d+)-(\\d+)"')).exec(links[i]);
              if(match) {
                return self(match[1], [+match[2], +match[3]]);
              }
            }
          }
          return null;
        };
      };
      self.nextPage   = self.followLink('next');
      self.prevPage   = self.followLink('prev');
      self.lastPage   = self.followLink('last');
      self.firstPage  = self.followLink('first');

      self.totalItems = function (headers) {
        var match = (new RegExp('/(\\d+|\\*)$')).exec(headers('Content-Range'));
        if(match) {
          if(match[1] === '*') {
            return Infinity;
          } else {
            return +match[1];
          }
        }
        return null;
      };
      self.currentRange = function (headers) {
        var match = (new RegExp('^(\\d+)-(\\d+)/')).exec(headers('Content-Range'));
        if(match) {
          return [+match[1], +match[2]];
        }
        return null;
      };

      return self;
    }]);
});
