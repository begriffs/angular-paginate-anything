define(['angular', 'angular-mocks', '../paginated-resource.js'], function (ng, mock) {
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
      return expect($resource).toBeDefined();
    });

    function incompleteRangeHeaders(hdrs) {
      return hdrs['Range-Unit'] === 'items';
    }
    function rangeHeaders(hdrs) {
      return hdrs['Range-Unit'] === 'items' &&
        hdrs.Range.match(/^\d+-\d+$/);
    }

    it('retries with range if response too large', function () {
      $resource('/items').query();

      $httpBackend.expectGET('/items', incompleteRangeHeaders).respond(413,
        '', { 'Accept-Ranges': 'items' }
      );
      $httpBackend.expectGET('/items', rangeHeaders).respond(206,
        '', { 'Accept-Ranges': 'items', 'Range': '0-24/*' }
      );
      $httpBackend.flush();
    });
  });
});
