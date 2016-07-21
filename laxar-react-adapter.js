/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as ReactDom from 'react-dom';

export const technology = 'react';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Implements the LaxarJS adapter API:
 * https://github.com/LaxarJS/laxar/blob/master/docs/manuals/adapters.md
 *
 * @param {Array} modules
 *   The widget and control modules matching this adapter's technology.
 *
 * @return {{
 *   technology: String,
 *   create: Function,
 *   applyViewChanges: Function
 * }}
 *   The instantiated adapter factory.
 */
export function bootstrap( modules ) {

   const widgetModules = {};

   modules
      .map( _ => _.default || _ )
      .filter( _ => !!_.name )
      .forEach( module => {
         widgetModules[ module.name ] = module;
      } );

   return {
      technology,
      create,
      applyViewChanges() {}
   };

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( environment ) {

      let isAttached = true;
      let controller = null;
      return {
         createController,
         domAttachTo,
         domDetach,
         destroy() {}
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController( config ) {
         const { onBeforeControllerCreation } = config;
         const { anchorElement, services, specification } = environment;
         const module = widgetModules[ specification.name ];
         const reactServices = {
            axReactRender( componentInstance ) {
               if( isAttached ) {
                  ReactDom.render( componentInstance, anchorElement );
               }
            }
         };

         const injections = ( module.injections || [] ).map( injection => {
            const value = reactServices[ injection ] || services[ injection ];
            if( value === undefined ) {
               throw new Error(
                  `Trying to inject unknown service "${injection}" into widget "${specification.name}".`
               );
            }
            return value;
         } );
         onBeforeControllerCreation( environment, injections );
         controller = module.create( ...injections );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement ) {
         isAttached = true;
         areaElement.appendChild( environment.anchorElement );
         controller.onDomAvailable();
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         isAttached = false;
         const parent = environment.anchorElement.parentNode;
         if( parent ) {
            parent.removeChild( environment.anchorElement );
         }
      }

   }

}
