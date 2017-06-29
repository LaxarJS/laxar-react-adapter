# LaxarJS React Adapter [![Build Status](https://travis-ci.org/LaxarJS/laxar.svg?branch=master)](https://travis-ci.org/LaxarJS/laxar-react-adapter)

> Create LaxarJS widgets and controls using React

<span class="laxar-external-documentation-hint">
   Take a look at the <a href="http://www.laxarjs.org/docs/laxar-react-adapter">documentation site</a> to browse documentation for all releases of this artifact.
</span>


## Installation

```console
npm install --save laxar-react-adapter babel-plugin-transform-react-jsx babel-plugin-transform-class-properties
```

This will automatically add React if not already installed.
These instructions assume that Babel is already configured with [ES2015](https://babeljs.io/learn-es2015/) support, e.g. by using the [LaxarJS Yeoman generator](https://laxarjs.org/laxar/).

Load the React adapter module (`laxar-react-adapter`) into your project and pass it to LaxarJS `create`:

```js
import { create } from 'laxar';
import * as reactAdapter from 'laxar-react-adapter';
import artifacts from 'laxar-loader/artifacts?flow=main&theme=cube';
const configuration = { /* ... */ };
create( [ reactAdapter /* , ... */ ], artifacts, configuration )
   .flow( /* ... name, element ... */ )
   .bootstrap();
```


### webpack Configuration

If you did not use the Yeoman generator to pre-configure webpack for React, your loader configuration will probably need to be adjusted.
For webpack to resolve JSX files and to process them using Babel, the configuration (usually `webpack.config.js`) needs to be adjusted:

```js
   resolve: { extensions: [ '.js', '.jsx' ] },
   module: {
      rules: [
         // ...,
         {
            test: /\.jsx?$/,
            exclude: path.resolve( __dirname, './node_modules' );
            use: 'babel-loader'
         }
      ]
   }
```

Finally include support for JSX in your `.babelrc`:

```js
{
   // ...
   "plugins": [
      // ...,
      "transform-class-properties",
      "transform-react-jsx"
   ]
}
```

For [ESLint](http://eslint.org/) support, check out the [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react) module.
That's it.


## Usage

With the adapter in place, you can now write widgets and controls using React.
The [LaxarJS Yeoman generator](https://laxarjs.org/docs/generator-laxarjs2-latest/) can create implementation stubs for you, if you specify the integration technology `"react"`.
When creating widgets _manually_, make sure to set the `"integration.technology"` to `"react"` in the `widget.json`.


### Creating a React Widget

Widgets can be created from a JSX file containing a basic widget component.

For example `my-new-widget.jsx`:

```js
import React from 'react';
import { injections } from 'laxar-react-adapter';

export default class MyNewWidget extends React.Component {
   static [ injections ] = [ 'axFeatures' ];
   render() {
      const [ features ] = this.props.injections;
      return <div>Hello, world! { features.some.config }</div>;
   }
}
```

The component in this example is _injected_ the `axFeatures` object.
This object can be used to access the widget instance configuration.
If a widget does not require any `injections`, the static property may be omitted.

Another injection called `axReactRender` is provided only when using `"react"` as the integration technology, and it can be used to update the widget DOM after a data change. When using component classes, this is not necessary, as `this.forceUpdate()` can be used instead. The following example uses the `axReactRender` injection in a functional component:

```js
import React from 'react';
import { injections } from 'laxar-react-adapter';

MyNewWidget[ injections ] = [ 'axReactRender' ];
export default function MyNewWidget( props ) {
   const [ reactRender ] = props.injections;

   let count = 0;
   return <div onClick={ increment }>Clicks: { count }</div>;

   function increment() {
      ++count;
      reactRender();
   }
}
```

The render function is a no-op as long as the widget has not been attached to the DOM (e.g. while in a background-tab, or within a closed popup).
As soon as the widget has been attached to the page DOM, `axReactRender` calls the `forceUpdate()` method of the component.

Read the LaxarJS documentation for more about [creating widgets and activities](https://laxarjs.org/docs/laxar-v2-latest/manuals/widgets_and_activities/) and the [available injections](https://laxarjs.org/docs/laxar-v2-latest/manuals/widget_services/).


#### Providing a Widget Area to embed other Widgets

LaxarJS widgets can provide widget areas in their own HTML template.
These areas can then be referenced from within page definitions in order to add widgets to them.
To create such a widget with React, the component `AxWidgetArea` is provided by the adapter.

An AxWidgetArea instance accepts the following React props:

- _name_ (`String`): the local name of the widget area _(required)_.
  This is the part after the `.` in the page definition. Must be constant

- _axAreaHelper_ (`Object`): the widget injection `axAreaHelper` _(required)_

- _axVisibility_ (`Object`): the widget injection `axVisibility`.
  This is required for the area visibility to ever be `false`

- _className_ (`String`, `Object`): forwarded to the `className` of the generated container DIV

- _visible_ (`Boolean`): `false` if the widget area should be hidden (default: `true`).
  The area will be hidden using CSS `display: none`, and will be kept in the DOM

Here is an example of a `"react"` widget providing a widget area "myContent" (accessible in the page as `<widget-id>.myContent`):

```js
import React from 'react';
import { AxWidgetArea, injections } from 'laxar-react-adapter';

export default class MyNewWidget extends React.Component {
   static [ injections ] = [ 'axAreaHelper' ];

   render() {
      const [ areaHelper ] = this.props.injections;
      return <AxWidgetArea name='myContent' axAreaHelper={ areaHelper } />;
   }
}
```

In this example the widget area is always visible.
For the visibility to change at runtime, the additional injection `axVisibility` is required.
We're using React's `setState` to trigger change detection and automatic re-rending of the component.

```js
import React from 'react';
import { AxWidgetArea, injections } from 'laxar-react-adapter';


export default class MyNewWidget extends React.Component {
   static [ injections ] = [ 'axAreaHelper', 'axVisibility' ];
   constructor( props ) {
      super( props );
      this.state = {
         showing: true
      }
   }
   render() {
      const [ areaHelper, visibility ] = this.props.injections;
      const toggleShowing = () => {
         this.setState(prev => ({ showing: !prev.showing }));
      };
      return (
         <div onClick={ toggleShowing }>
            <AxWidgetArea
               name='myContent'
               visible={ this.state.showing }
               axAreaHelper={ areaHelper }
               axVisibility={ visibility } />
         </div>
      );
   }
}
```


### Creating a React Control

A _LaxarJS control_ allows you to encapsulates one or more React components with associated CSS styles that can be overwritten by _LaxarJS themes._

React controls are implemented as regular JavaScript modules, just like *plain* LaxarJS controls:

```js
// my-new-control.jsx
import React from 'react';

export default class MyNewControl extends React.Component {
   render() {
      return <div className='my-new-control'></div>;
   }
}
```

Select `"react"` as the integration technology when you generate the control with the LaxarJS Yeoman generator, or set it as the `"integration.technology"` of the `control.json` descriptor when creating a control manually:

```js
// control.json
{
   "name": "my-new-control",
   "integration": {
      "technology": "react"
   }
}
```

Widgets can access the control by loading its module, or by requesting it through the [axControls](https://laxarjs.org/docs/laxar-v2-latest/api/runtime.widget_services/#axControls) injection.
The latter is _recommended_ as it does not depend as much on the project-specific loader configuration:

```js
// my-new-widget.jsx
import React from 'react';
import { injections } from 'laxar-react-adapter';

export class MyNewWidget extends React.Component {
   static [ injections ] = [ 'axControls' ];
   render() {
      const [ controls ] = this.props.injections;
      const MyReactControl = controls.provide( 'my-new-control' );
      return <div>Hello, world! <MyReactControl /></div>;
   }
}
```

For this to work the widget needs to list their controls in the `"controls"` section of the descriptor, which also ensures that CSS theming works:

```js
// widget.json
{
   "name": "my-new-widget",
   "integration": {
      "technology": "react",
      "type": "widget"
   },
   "controls": [ "my-new-control" ],
   "features": { /* ... */ }
}
```

Read the LaxarJS documentation for general information on [providing controls](https://laxarjs.org/docs/laxar-v2-latest/manuals/providing_controls).


### Testing with LaxarJS Mocks

Starting with [laxar-mocks](https://laxarjs.org/docs/laxar-mocks-v2-latest/) v2.0.0, you can easily create tests with the `setupForWidget` function.
Simply write your specs like this:

```js
import * as axMocks from 'laxar-mocks';

describe( 'The my-counter-widget', () => {

   beforeEach( axMocks.setupForWidget() );
   beforeEach( () => {
      axMocks.widget.configure( { someFeature: 'someConfigValue' } );
   } );

   beforeEach( axMocks.widget.load );

   let widgetDom;
   beforeEach( () => { widgetDom = axMocks.widget.render(); } );

   // ... tests ...

   afterEach( axMocks.tearDown );
} );
```


### Building the Adapter from Source

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
npm  start
```

Now you can select a spec-runner by browsing to http://localhost:8080/dist/spec/.
