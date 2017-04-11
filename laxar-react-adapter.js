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

import * as ReactDom from 'react-dom';
export { AxWidgetArea } from './lib/components/widget-area';

const noOp = () => {};

export const technology = 'react';

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
      let domAttached = false;
      let render = noOp;
      createController();
      return {
         domAttachTo,
         domDetach
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function axReactRender() {
         if( domAttached ) {
            const reactDom = render();
            ReactDom.render( reactDom, anchorElement );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController() {
         // backwards compatibility with old-style AMD widgets:
         const module = widgetModules[ widgetName ].default || widgetModules[ widgetName ];
         if( !module ) {
            throw adapterUtilities.unknownWidget( { technology, widgetName } );
         }

         const reactServices = {
            axReactRender
         };

         const injectionsByName = {};
         const injections = ( module.injections || [] ).map( injection => {
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
         render = module.create( ...injections ) || render;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement ) {
         domAttached = true;
         areaElement.appendChild( anchorElement );
         axReactRender();
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         domAttached = false;
         const parent = anchorElement.parentNode;
         if( parent ) {
            parent.removeChild( anchorElement );
         }
      }

   }

}
