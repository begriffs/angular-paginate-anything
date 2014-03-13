(function () {
  'use strict';

  var $httpBackend, $compile, scope;
  beforeEach(function () {
    angular.mock.module('begriffs.paginate-anything');
    angular.mock.module('tpl/paginate-anything.html');

    angular.mock.inject(
      ['$httpBackend', '$compile', '$rootScope',
      function (httpBackend, compile, rootScope) {
        $httpBackend = httpBackend;
        $compile = compile;
        scope = rootScope.$new();
      }]
    );
  });

  var template = '<pagination ' + [
    'collection="collection"', 'page="page"',
    'client-limit="clientLimit"',
    'per-page="perPage"', 'url="/items"',
    'num-pages="numPages"',
    'per-page-presets="perPagePresets"'
  ].join(' ') + '></pagination>';

  function finiteStringBackend(s, maxRange) {
    maxRange = maxRange || s.length;

    return function(method, url, data, headers) {
      var m = headers.Range.match(/^(\d+)-(\d+)$/);
      if(m) {
        m[1] = +m[1];
        m[2] = +m[2];
        m[2] = Math.min(m[2] + 1, m[1] + maxRange);
        return [
          m[2] < s.length ? 206 : 200,
          s.slice(m[1], m[2]).split(''),
          {
            'Range-Unit': 'items',
            'Content-Range': [m[1], Math.min(s.length, m[2])-1].join('-') + '/' + s.length
          }
        ];
      }
    };
  }

  describe('paginate-anything', function () {
    it('does not appear for a non-range-paginated resource', function () {
      $httpBackend.expectGET('/items').respond(200, '');
      var elt = $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(elt.find('ul').length).toEqual(0);
    });

    it('does not appear for a ranged yet complete resource', function () {
      $httpBackend.expectGET('/items').respond(200,
        '', { 'Range-Unit': 'items', 'Content-Range': '0-24/25' }
      );
      var elt = $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(elt.find('ul').length).toEqual(0);
    });

    it('appears for a ranged incomplete resource', function () {
      $httpBackend.expectGET('/items').respond(206,
        '', { 'Range-Unit': 'items', 'Content-Range': '0-24/26' }
      );
      var elt = $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(elt.find('ul').length).toEqual(1);
    });

    it('starts at page 0', function () {
      $httpBackend.expectGET('/items').respond(206,
        '', { 'Range-Unit': 'items', 'Content-Range': '0-24/26' }
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(scope.page).toEqual(0);
    });

    it('knows total pages', function () {
      $httpBackend.expectGET('/items').respond(206,
        '', { 'Range-Unit': 'items', 'Content-Range': '0-24/26' }
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(scope.numPages).toEqual(2);
    });

    it('discovers server range limit when range comes back small', function () {
      $httpBackend.expectGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz', 2)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(scope.numPages).toEqual(13);
      expect(scope.perPage).toEqual(2);
    });

    it('changing the page on the scope updates the collection', function () {
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz', 20)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.page = 1;
      scope.$digest();
      $httpBackend.flush();

      expect(scope.collection).toEqual(['u', 'v', 'w', 'x', 'y', 'z']);
    });

    it('can start on a different page', function () {
      scope.perPage = 20;
      scope.page = 1;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz', 20)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      expect(scope.collection).toEqual(['u', 'v', 'w', 'x', 'y', 'z']);
    });

    it('limited range at the end does not trigger resizing perPage', function () {
      scope.perPage = 20;
      scope.page = 1;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz', 20)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.page = 0;
      scope.$digest();
      $httpBackend.flush();

      expect(scope.perPage).toEqual(20);
    });

    it('decreasing perPage keeps the middle item on the current page', function () {
      scope.perPage = 3;
      scope.page = 1;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz')
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.perPage = 1;
      scope.$digest();
      $httpBackend.flush();
      expect(scope.collection).toEqual(['e']);
      expect(scope.page).toEqual(4);
    });

    it('increasing perPage keeps the middle item on the current page', function () {
      scope.perPage = 12;
      scope.page = 2;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz')
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.perPage = 13;
      scope.$digest();
      $httpBackend.flush();
      expect(scope.page).toEqual(1);
    });

    it('changing perPage rounds down for middle item', function () {
      scope.perPage = 2;
      scope.page = 1;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz')
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.perPage = 1;
      scope.$digest();
      $httpBackend.flush();
      expect(scope.collection).toEqual(['c']);
      expect(scope.page).toEqual(2);
    });

    it('halving perPage fixes the first item on the current page', function () {
      scope.perPage = 4;
      scope.page = 1;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz')
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.perPage = 2;
      scope.$digest();
      $httpBackend.flush();
      expect(scope.collection).toEqual(['e', 'f']);
      expect(scope.page).toEqual(2);
    });

    it('doubling perPage fixes first item on the current page (for pp*2<remaining)', function () {
      scope.perPage = 3;
      scope.page = 2;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz')
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.perPage = 6;
      scope.$digest();
      $httpBackend.flush();
      expect(scope.collection).toEqual(['g', 'h', 'i', 'j', 'k', 'l']);
      expect(scope.page).toEqual(1);
    });

    it('doubling perPage does not fix the first item when new size >= total', function () {
      scope.perPage = 20;
      scope.page = 1;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz')
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.perPage = 40;
      scope.$digest();
      $httpBackend.flush();
      expect(scope.page).toEqual(0);
    });

    it('small server limits adjusts perPagePresets', function () {
      $httpBackend.expectGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', 46)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      expect(scope.perPagePresets).toEqual([5, 10, 25, 45]);
    });
  });
}());
