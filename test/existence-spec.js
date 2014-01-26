define(
  ['angular', 'angular-mocks', '../paginated-resource.js', 'jasmine-as-promised'],
  function (ng, mock) {
    'use strict';

    var $httpBackend, $resource;
    beforeEach(function () {
      mock.module('begriffs.paginated-resource');
      mock.inject(['$httpBackend', 'paginated-resource', function (httpBackend, resource) {
        $httpBackend = httpBackend;
        $resource = resource;
      }]);
    });

    describe('paginated-resource', function () {

      it('exists', function () {
        expect($resource).toBeDefined();
      });

      function incompleteRangeHeaders(hdrs) {
        return hdrs['Range-Unit'] === 'items';
      }
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

        $httpBackend.expectGET('/items', incompleteRangeHeaders).respond(413,
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

        $httpBackend.expectGET('/items', incompleteRangeHeaders).respond(413,
          '', { 'Accept-Ranges': 'items' }
        );
        $httpBackend.flush(1);
        $httpBackend.verifyNoOutstandingRequest();

        expect(handlers.success).not.toHaveBeenCalled();
        expect(handlers.failure).toHaveBeenCalled();
      });

      it('include next page information when available', function () {
        $httpBackend.expectGET('/items', rangeHeaders()).respond(206, '[]',
          {
            'Accept-Ranges': 'items',
            'Range': '0-24/100',
            'Link': '</items>; rel="next"; items="25-49"'
          }
        );
        $httpBackend.expectGET('/items', rangeHeaders([25, 49])).respond(206, '[]');

        $resource('/items', [0,24]).query(function (data, headers) {
          $resource.nextPage(headers).query();
        });
        $httpBackend.flush();
      });
    });
  }
);
