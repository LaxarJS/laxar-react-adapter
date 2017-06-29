/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Implements the LaxarJS adapter API for the integration technology "react":
 * https://github.com/LaxarJS/laxar/blob/master/docs/manuals/adapters.md
 *
 * @module laxar-react-adapter
 */

import React from 'react';
import * as ReactDom from 'react-dom';
export { AxWidgetArea } from './lib/components/widget-area';

const randomIdentifier = () => (`00${Math.ceil(Math.random() * 255).toString(16)}`).substr(-2);
const Symbol = window.Symbol || (name => `Symbol(${name}-${randomIdentifier})`);

const injectionsProperty = Symbol('injections');

export const technology = 'react';

export { injectionsProperty as injections };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( { widgets }, { adapterUtilities } ) {

   const widgetModules = {};
   const activitySet = {};
   widgets.forEach( ({ descriptor, module }) => {
      widgetModules[ descriptor.name ] = module;
      if( descriptor.integration.type === 'activity' ) {
         activitySet[ descriptor.name ] = true;
      }
   } );

   return {
      create
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( { widgetName, anchorElement, services, provideServices } ) {
      const element = createElement();

      return {
         domAttachTo( areaElement ) {
            ReactDom.render( element, anchorElement );
            areaElement.appendChild( anchorElement );
         },
         domDetach() {
            ReactDom.unmountComponentAtNode( anchorElement );
         }
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createElement() {
         // backwards compatibility with old-style AMD widgets:
         const module = widgetModules[ widgetName ].default || widgetModules[ widgetName ];
         if( !module ) {
            throw adapterUtilities.unknownWidget( { technology, widgetName } );
         }

         const Component = module.create ?
            wrapModule( module ) :
            module;

         let component;

         const reactServices = {
            axReactRender() {
               if( component ) {
                  component.forceUpdate();
               }
            }
         };

         const injectionsByName = {};
         const injections = ( Component[ injectionsProperty ] || [] ).map( injection => {
            const value = reactServices[ injection ] || services[ injection ];
            if( value === undefined ) {
               throw adapterUtilities.unknownInjection( { technology, injection, widgetName } );
            }
            if( injection === 'axReactRender' && activitySet[ widgetName ] ) {
               throw adapterUtilities.activityAccessingDom( { technology, injection, widgetName } );
            }
            injectionsByName[ injection ] = value;
            return value;
         } );
         provideServices( injectionsByName );

         if( module.create ) {
            Component.prototype.render = module.create( ...injections ) || (() => null);
         }

         return React.createElement( Component, {
            injections,
            ref( c ) {
               component = c;
            }
         }, null );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function wrapModule( { name = widgetName, injections = [] } ) {
         class Component extends React.Component {
         }

         Component.displayName = name;
         Component[ injectionsProperty ] = injections;

         return Component;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

   }

}
