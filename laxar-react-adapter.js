/**
 * Copyright 2016 aixigo AG
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

const noOp = () => {};

export const technology = 'react';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( { widgets }, { widgetLoader } ) {

   const { adapterErrors } = widgetLoader;
   const widgetModules = {};
   const activitySet = {};
   widgets.forEach( ({ descriptor, module }) => {
      widgetModules[ descriptor.name ] = module;
      if( descriptor.integration.type === 'activity' ) {
         activitySet[ descriptor.name ] = true;
      }
   } );

   return {
      create,
      technology
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( { widgetName, anchorElement, services, onBeforeControllerCreation } ) {

      let domAttached = false;
      let onDomAvailable = null;
      createController();
      return {
         domAttachTo,
         domDetach
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController() {
         // backwards compatibility with old-style AMD widgets:
         const module = widgetModules[ widgetName ].default || widgetModules[ widgetName ];
         if( !module ) {
            throw adapterErrors.unknownWidget( { technology, widgetName } );
         }

         const reactServices = {
            axReactRender( componentInstance ) {
               if( domAttached ) {
                  ReactDom.render( componentInstance, anchorElement );
               }
            }
         };

         const injectionsByName = {};
         const injections = ( module.injections || [] ).map( injection => {
            const value = reactServices[ injection ] || services[ injection ];
            if( value === undefined ) {
               throw adapterErrors.unknownInjection( { technology, injection, widgetName } );
            }
            if( injection === 'axReactRender' && activitySet[ widgetName ] ) {
               throw adapterErrors.activityAccessingDom( { technology, injection, widgetName } );
            }
            injectionsByName[ injection ] = value;
            return value;
         } );
         onBeforeControllerCreation( injectionsByName );
         ( { onDomAvailable = noOp } = module.create( ...injections ) || {} );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement ) {
         domAttached = true;
         areaElement.appendChild( anchorElement );
         onDomAvailable();
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
