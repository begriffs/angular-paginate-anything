<img src="img/paginate-anything-logo.png" alt="Logo" align="right" />
## Angular Directive to Paginate Anything
[![Build Status](https://travis-ci.org/begriffs/angular-paginate-anything.png?branch=master)](https://travis-ci.org/begriffs/angular-paginate-anything)

Add server-side pagination to any list or table on the page. This
directive simply wires a variable in the local scope with a URL and
adds a pagination user interface.

### [DEMO](http://pagination.begriffs.com)

** TODO: Add video **

### Usage

Include with bower

```sh
bower install angular-paginate-anything
```

Then in your view

```html
<!-- elements such as an ng-table reading from someVariable -->

<pagination collection="someVariable" url="http://api.server.com/stuff"></pagination>
```

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
      <td>num-items</td>
      <td>Total items reported by server for the collection</td>
      <td>Read-only.</td>
    </tr>
    <tr>
      <td>num-pages</td>
      <td>num-items / per-page</td>
      <td>Read-only.</td>
    </tr>
  </tbody>
</table>

### What your server needs to do

**TODO:** describe.
