define(
  ['angular', 'angular-mocks', '../paginated-resource.js', 'jasmine-as-promised'],
  function (ng, mock) {
    'use strict';

    var $httpBackend, $resource, $http;
    beforeEach(function () {
      mock.module('begriffs.paginated-resource');
      mock.inject(['$httpBackend', 'paginated-resource', '$http', function (httpBackend, resource, http) {
        $httpBackend = httpBackend;
        $resource = resource;
        $http = http;
      }]);
    });

    describe('paginated-resource', function () {

      function rangeHeaders(range) {
        return function (hdrs) {
          if(range) {
            return hdrs['Range-Unit'] === 'items' &&
              hdrs.Range === range.join('-');
          } else {
            return hdrs['Range-Unit'] === 'items' &&
              hdrs.Range.match(/^\d+-\d+$/);
          }
        };
      }

      it('retries with range if response too large', function () {
        var handlers = {
          success: function (r) {
            expect(r.status).toEqual(206);
          },
          failure: function () { }
        };
        spyOn(handlers, 'success').andCallThrough();
        spyOn(handlers, 'failure');

        $resource('/items').query().$promise.then(handlers.success).catch(handlers.failure);

        $httpBackend.expectGET('/items').respond(413,
          '', { 'Accept-Ranges': 'items' }
        );
        $httpBackend.expectGET('/items', rangeHeaders()).respond(206,
          '[]', { 'Accept-Ranges': 'items', 'Range': '0-24/*' }
        );
        $httpBackend.flush();

        expect(handlers.success).toHaveBeenCalled();
        expect(handlers.failure).not.toHaveBeenCalled();
      });

      it('does not retry when response too large if range previously specified', function () {
        var handlers = {
          success: function () { },
          failure: function (r) {
            expect(r.status).toEqual(413);
          }
        };
        spyOn(handlers, 'success');
        spyOn(handlers, 'failure').andCallThrough();

        $resource('/items', [0,24]).query().$promise.then(handlers.success).catch(handlers.failure);

        $httpBackend.expectGET('/items').respond(413,
          '', { 'Accept-Ranges': 'items' }
        );
        $httpBackend.flush(1);
        $httpBackend.verifyNoOutstandingRequest();

        expect(handlers.success).not.toHaveBeenCalled();
        expect(handlers.failure).toHaveBeenCalled();
      });

      it('includes page navigation functions when available', function () {
        $httpBackend.expectGET('/items', rangeHeaders([20,29])).respond(206, '[]',
          {
            'Accept-Ranges': 'items',
            'Content-Range': '20-29/50',
            'Link': [
              '</items>; rel="prev"; items="10-19"',
              '</items>; rel="next"; items="30-39"',
              '</items>; rel="last"; items="40-49"',
              '</items>; rel="first"; items="0-9"'
            ]
          }
        );
        $httpBackend.expectGET('/items', rangeHeaders([30, 39])).respond(206, '[]');
        $httpBackend.expectGET('/items', rangeHeaders([10, 19])).respond(206, '[]');
        $httpBackend.expectGET('/items', rangeHeaders([40, 49])).respond(206, '[]');
        $httpBackend.expectGET('/items', rangeHeaders([0, 9])).respond(206, '[]');

        $resource('/items', [20,29]).query(function (data, headers) {
          $resource.nextPage(headers).query();
          $resource.prevPage(headers).query();
          $resource.lastPage(headers).query();
          $resource.firstPage(headers).query();
        });
        $httpBackend.flush();
      });

      it('reports current range and total number of items', function () {
        $httpBackend.expectGET('/items', rangeHeaders()).respond(206, '[]',
          { 'Content-Range': '0-4/10' }
        );
        $resource('/items', [0,4]).query(function (data, headers) {
          expect($resource.totalItems(headers)).toEqual(10);
          expect($resource.currentRange(headers)).toEqual([0,4]);
        });
        $httpBackend.flush();
      });

      it('reports an infinite number of items when neccesary', function () {
        $httpBackend.expectGET('/items', rangeHeaders()).respond(206, '[]',
          { 'Content-Range': '0-4/*' }
        );
        $resource('/items', [0,4]).query(function (data, headers) {
          expect($resource.totalItems(headers)).toEqual(Infinity);
        });
        $httpBackend.flush();
      });

      it('infers total number of items from HEAD response', function () {
        $httpBackend.expect('HEAD', '/items').respond(200, '',
          {
            'Accept-Ranges': 'items',
            'Content-Range': '*/100'
          }
        );
        $http({method: 'HEAD', url: '/items'}).success(function (data, status, headers) {
          expect($resource.totalItems(headers)).toEqual(100);
        });
        $httpBackend.flush();
      });

    });
  }
);
