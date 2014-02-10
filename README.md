<img src="img/paginated-resource-logo.png" alt="Logo" align="right" />
## AngularJS Paginated Resource
[![Build Status](https://travis-ci.org/begriffs/angular-paginated-resource.png?branch=master)](https://travis-ci.org/begriffs/angular-paginated-resource)

Server-side pagination the way the good
[RFC2616](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.16) intended it. Pairs
nicely with [begriffs/clean_pagination](https://github.com/begriffs/clean_pagination) on the
server side.

### Usage

```js
angular.module('app', ['begriffs.paginated-resource']).
  controller('MyController', ['$scope', 'paginated-resource', function ($scope, paginated) {
    // just like $resource
    $scope.items = paginated('/items').query();

    // or specify a range
    $scope.items = paginated('/items', [0, 9]).query();

    // get the next page
    paginated('/items', [0, 9]).query(function (data, headers) {
      $scope.nextItems = paginated.nextPage(headers).query();
    });
  }]);
```

### Methods

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>args</th>
      <th>returns</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>nextPage</td>
      <td>headers</td>
      <td>paginated resource or null</td>
    </tr>
    <tr>
      <td>prevPage</td>
      <td>headers</td>
      <td>paginated resource or null</td>
    </tr>
    <tr>
      <td>lastPage</td>
      <td>headers</td>
      <td>paginated resource or null</td>
    </tr>
    <tr>
      <td>firstPage</td>
      <td>headers</td>
      <td>paginated resource or null</td>
    </tr>
    <tr>
      <td>totalItems</td>
      <td>headers</td>
      <td>integer, Infinity, or null</td>
    </tr>
    <tr>
      <td>currentRange</td>
      <td>headers</td>
      <td>[first, last] or null</td>
    </tr>
  </tbody>
</table>

### Protocol

This Angular module communicates with compatible servers through HTTP range headers.

#### Do you paginate with ranges? Yes, I do.

Also there are one million total items in this collection.

```
Request
  HEAD /biglist
Response
  Accept-Ranges → items
  Content-Range → */1000000
```

#### Give me everything! Nope too much.

(Paginated resource will then retry with a default size range.)

```
Request
  GET /biglist
Response
  Accept-Ranges → items
  Status → 413 Request Entity Too Large
```

#### Give me a range. OK here it is, with related links.

```
Request
  GET /biglist; Range-Unit: items; Range: 0-99
Response
  Status → 206
  Range-Unit → items
  Content-Range → 0-99/1000000
  Link → </biglist>; rel="next"; items="100-199",
         </biglist>; rel="first"; items="0-99",
         </biglist>; rel="last"; items="999900-999999"
```
