# LaxarJS React Adapter

> Write LaxarJS widgets and controls using React


## Installation

Note: these instructions are for LaxarJS v2, which is still in early alpha stage.
Use laxar-react-adapter v0.x for projects using LaxarJS v1.

```console
npm install --save laxar-react-adapter
```

This will automatically install React if not already installed.
Load the react adapter module (`laxar-react-adapter.js`) into your project and pass it to `laxar.bootstrap`.

Make sure that your loader is able to resolve the adapter as specified by the package.json (e.g. `resolve` configuration for webpack, `path` for RequireJS):

```js
'laxar-react-adapter': 'laxar-react-adapter/laxar-react-adapter',
'react': 'react/react',
'react-dom': 'react/react-dom',
```

The adapter itself relies on `react-dom`, and your widgets will need to find `react`.
Now you can pass the adapter module using the second argument to `laxar.bootstrap`:

```js
import { bootstrap } from 'laxar';
bootstrap( /* applicationModules */, [ reactAdapter ] );
```

If you already have other custom adapters in your project, simply add the React adapter to the existing list.


## Usage

With the adapter in place, you can now write widgets and controls using React.
The LaxarJS Yeoman generator can create simple widgets and controls with the integration technology _"react"_.
Continue reading for details.


### Creating a React Widget

You can use the LaxarJS generator for Yeoman to create a _react_ widget.
by selecting _"react"_ as _integration technology_.
The new widget has a JSX file with a simple widget controller.

For example `myNewWidget.jsx`:

```javascript
import React from 'react';
import ax from 'laxar';

const injections = [ 'axContext', 'axReactRender' ];

function create( context, reactRender ) {

   return {
      onDomAvailable: render
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function render() {
      reactRender( <div></div> );
   }
};

export default {
   name: 'myNewWidget',
   injections: injections,
   create: create
};
```

The controller in this file injects the `axContext` which is a complete object containing all configuration and API specifically available to this widget instance. The injected `axReactRender` is provided by the react adapter. This injected function is a no-op as long as the widget is invisible (e.g. in a background-tab, or within a closed popup). As soon as the widget has been attached to the page DOM, `axReactRender` goes through to `React.render`.

Read the LaxarJS documentation for more about [writing widget controllers](https://github.com/LaxarJS/laxar/blob/master/docs/manuals/writing_widget_controllers.md) and the available injections.


### Creating a React Control

A LaxarJS control allows you to encapsulates one or more React components with associated CSS styles, that can be overwritten by themes.

React controls are implemented as regular AMD-modules, just like *plain* controls.
Select `"react"` as the integration technology when you generate the control with the LaxarJS Yeoman generator.

```javascript
import React from 'react';

const MyReactControl = React.createClass({
render() {
      return <div className='my-new-control'></div>;
   }
} );

export default MyNewControl;
```

In your new control make sure to export all components that you wish to make available to widgets.

Read the LaxarJS documentation for more about [providing controls](https://github.com/LaxarJS/laxar/blob/master/docs/manuals/providing_controls.md).


### Testing with LaxarJS Mocks

Starting with [laxar-mocks](https://github.com/LaxarJS/laxar-mocks) v0.5.0, you can pass custom adapters when creating the testbed-setup function.
Simply write your specs like this:


```js
define( [
   'json!../widget.json',
   'laxar-react-adapter',
   'laxar-mocks'
], function( descriptor, axReactAdapter, axMocks ) {
   'use strict';

   describe( 'The my-counter-widget', function() {

      beforeEach( axMocks.createSetupForWidget( descriptor, {
         // register the adapter:
         adapter: axReactAdapter,
         // with React JSX, usually we will not use an HTML template:
         knownMissingResources: [ 'default.theme/my-counter-widget.html' ]
      } ) );

      // ... tests ...

      afterEach( axMocks.tearDown );

   } );
} );
```



### Building the adapter from source

Instead of using a pre-compiled library within a project, you can also clone this repository:

```sh
git clone https://github.com/LaxarJS/laxar-react-adapter.git
cd laxar-react-adapter
npm install
```

To see changes in your application, either configure your project to work with the sources (e.g. by using webpack), or rebuild the webpack bundles by running `npm run dist`.

To run the automated karma tests:

```sh
npm test
```

To generate HTML spec runners for opening in your web browser, so that you can e.g. use the browser's developer tools:

```sh
npm run browser-spec
```

Now you can select a spec-runner by browsing to http://localhost:8084/spec-output/.
