# LaxarJS React Adapter [![Build Status](https://travis-ci.org/LaxarJS/laxar.svg?branch=master)](https://travis-ci.org/LaxarJS/laxar-react-adapter)

> Write LaxarJS widgets and controls using React

<span class="laxar-developer-view">This is the developer version. Take a look at our <a href="http://www.laxarjs.org/docs/laxar-react-adapter">documentation site</a> with the released version.</span>


## Installation

Note: these instructions are for LaxarJS v2, which is still in alpha stage.
Use laxar-react-adapter v0.x for projects using LaxarJS v1.

```sh
npm install --save laxar-react-adapter
```

This will automatically install React if not already installed.

Load the React adapter module (`laxar-react-adapter.js`) into your project and pass it to `laxar.bootstrap`.

```js
import { bootstrap } from 'laxar';
import * as reactAdapter from 'laxar-react-adapter';

bootstrap( document.querySelector( '[data-ax-page]' ), {
   widgetAdapters: [ reactAdapter /* possibly more adapters */ ],
   configuration: { ... },
   artifacts: { ... }
} );
```

If you already have other custom adapters in your project, simply add the React adapter to the existing list.


### Use JSX and ES6 with Webpack

If you use webpack and you want to develop widgets with JSX and ES6 there are some things to do.

First install the `babel-loader` for webpack.
```sh
npm install --save-dev babel-loader babel-core babel-preset-es2015 webpack
```


Below is a very simple example, showing only the modified parts:
```js
config = {

   resolve: {
      // Here we add support for JSX file extension
      extensions: [ '.js', '.jsx' ]
   },

   module: {
      rules: [
         // And here we add the loader rule for the extension
         {
            test: /\.(js|jsx)$/,
            exclude: /(node_modules)/,
            use: 'babel-loader'
         }
      ]
   }
};
```

Finally include support for JSX in your `.babelrc`:

```json
{
   "presets": [ "es2015" ],
   "plugins": [
      "transform-react-jsx"
   ],
   "retainLines": true
}
```

That's it.


## Usage

With the adapter in place, you can now write widgets and controls using React.
The LaxarJS Yeoman generator can create simple widgets and controls with the integration technology _"react"_.
Continue reading for details.


### Creating a React Widget

You can use the LaxarJS generator for Yeoman to create a React widget.
by selecting _"react"_ as _integration technology_.
The new widget has a JSX file with a simple widget controller.

For example `myNewWidget.jsx`:

```javascript
import React from 'react';

const injections = [ 'axContext', 'axReactRender' ];

function create( context, reactRender ) {

   return {
      onDomAvailable: render
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function render() {
      reactRender( <div></div> );
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default {
   name: 'myNewWidget',
   injections: injections,
   create: create
};
```

The controller in this file injects the `axContext` which is a complete object containing all configuration and API specifically available to this widget instance.
The injected `axReactRender` is provided by the React adapter.
This injected function is a no-op as long as the widget is invisible (e.g. in a background-tab, or within a closed popup).
As soon as the widget has been attached to the page DOM, `axReactRender` goes through to `React.render`.

Read the LaxarJS documentation for more about [writing widget controllers](https://github.com/LaxarJS/laxar/blob/master/docs/manuals/writing_widget_controllers.md) and the available injections.


#### Providing a Widget Area to embed other Widgets

LaxarJS widgets can provide widget areas in their own html template.
These areas can then be referenced from within page definitions in order to add widgets to them.
To create such a widget with React, the component class `AxWidgetArea` is provided by the adapter.

The AxWidgetArea excepts some properties:

- areaName {String}: the name of the widget area
- axAreaHelper {Object}: the LaxarJS service axAreaHelper
- axVisibility {Object}: the LaxarJS service axVisibility
- cssClassName {String}: a string with CSS class names which will redirect to Reacts className attribute
- visible {Boolean}: true if the widget area should be visible

An example how to implement a widget area in a React widget:

```
import { AxWidgetArea } from 'laxar-react-adapter';

const injections = [
   'axReactRender', 'axAreaHelper', 'axVisibility'
];

function create( reactRender, areaHelper, axVisibility ) {

   return (
      <AxWidgetArea
         areaName='myWidgetArea'
         cssClassName="optionalCssClass"
         axAreaHelper={ areaHelper }
         visible=true
         axVisibility={ axVisibility }
      />
   )
}
```

The React widget must import the `AxWidgetArea` from the *laxar-react-adapter*.
Then it injects the `axReactRender` and for the widget area the two LaxarJS services `axAreaHelper` and `axVisisbility`.
In its create function it can then use the `AxWidgetArea` component.
With the property `visible` the widget can handle if the widget area with its embeded widgets should be visible or hide.
In this example the widget area is always visible.


### Creating a React Control

A LaxarJS control allows you to encapsulates one or more React components with associated CSS styles, that can be overwritten by themes.

React controls are implemented as regular AMD-modules, just like *plain* controls.
Select `"react"` as the integration technology when you generate the control with the LaxarJS Yeoman generator.

```javascript
import React from 'react';

const MyReactControl = React.createClass({
render() {
      return (
         <div className='my-new-control'></div>
      );
   }
} );

export default MyNewControl;
```

In your new control make sure to export all components that you wish to make available to widgets.

Read the LaxarJS documentation for more about [providing controls](https://github.com/LaxarJS/laxar/blob/master/docs/manuals/providing_controls.md).


### Testing with LaxarJS Mocks

Starting with [laxar-mocks](https://github.com/LaxarJS/laxar-mocks) v2.0.0, you can easily create tests with the `setupForWidget` function.
Simply write your specs like this:

```js

import * as axMocks from 'laxar-mocks';

describe( 'The my-counter-widget', () => {

   beforeEach( axMocks.setupForWidget() );

   beforeEach( () => {
         axMocks.widget.configure( {
            feature: 'configuration'
         } );
      } );

   beforeEach( axMocks.widget.load );

   beforeEach( () => {
      widgetDom = axMocks.widget.render();
   } );

   // ... tests ...

   afterEach( axMocks.tearDown );
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
