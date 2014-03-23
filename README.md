<img src="img/paginate-anything-logo.png" alt="Logo" align="right" />
## Angular Directive to Paginate Anything
[![Build Status](https://travis-ci.org/begriffs/angular-paginate-anything.png?branch=master)](https://travis-ci.org/begriffs/angular-paginate-anything)

Add server-side pagination to any list or table on the page. This
directive simply wires a variable in the local scope with a URL and
adds a pagination user interface.

### [DEMO](http://begriffs.github.io/angular-paginate-anything/)

### Usage

Include with bower

```sh
bower install angular-paginate-anything
```

Load the javascript and declare your Angular dependency

```js
angular.module('myModule', ['begriffs.paginate-anything']);
```

Then in your view

```html
<!-- elements such as an ng-table reading from someVariable -->

<pagination collection="someVariable" url="'http://api.server.com/stuff'"></pagination>
```

The `pagination` directive uses an external template stored in
`tpl/paginate-anything.html`.  Host it in a place accessible to
your page and set the `template-url` attribute (see below).

### Benefits

* Attaches to anything — ng-repeat, ng-grid, ngTable etc
* Server side pagination scales to large data
* Works with any MIME type through RFC2616 Range headers
* Handles finite or infinite lists
* Negotiates per-page limits with server
* Keeps items in view when changing page size
* Twitter Bootstrap compatible markup

### Directive Attributes

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Access</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>url</td>
      <td>url of endpoint which returns a JSON array</td>
      <td>Read/write. Changing it will reset to the first page.</td>
    </tr>
    <tr>
      <td>headers</td>
      <td>additional headers to send during request</td>
      <td>Write-only.</td>
    </tr>
    <tr>
      <td>page</td>
      <td>the currently active page</td>
      <td>Read/write. Writing changes pages. Zero-based.</td>
    </tr>
    <tr>
      <td>per-page</td>
      <td>Max number of elements per page</td>
      <td>Read/write. The server may choose to send fewer items though.</td>
    </tr>
    <tr>
      <td>per-page-presets</td>
      <td>Array of suggestions for per-page. Adjusts depending on server limits</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>client-limit</td>
      <td>Biggest page size the directive will show. Server response may be smaller.</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>link-group-size</td>
      <td>Number of elements surrounding current page. <img src="img/link-group-size.png" alt="illustration" /></td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>num-items</td>
      <td>Total items reported by server for the collection</td>
      <td>Read-only.</td>
    </tr>
    <tr>
      <td>num-pages</td>
      <td>num-items / per-page</td>
      <td>Read-only.</td>
    </tr>
    <tr>
      <td>server-limit</td>
      <td>Maximum results the server will send (Infinity if not yet detected)</td>
      <td>Read-only.</td>
    </tr>
  </tbody>
</table>

### How to deal with sorting, filtering and facets?

Your server is responsible for interpreting URLs to provide these
features.  You can connect the `url` attribute of this directive
to a scope variable and change the url to sort etc. Changing the
url causes the pagination to reset to the first page and maintain
page size.

### What your server needs to do


