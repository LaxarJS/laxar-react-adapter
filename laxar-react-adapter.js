/**
 * Copyright 2015 aixigo AG
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
 * @param {Object} laxarServices
 *   adapter-visible laxarjs services
 *
 * @return {{
 *   technology: String,
 *   create: Function,
 *   applyViewChanges: Function
 * }}
 *   The instantiated adapter factory.
 */
export function bootstrap( modules, laxarServices ) {

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
      applyViewChanges: () => {}
   };

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( environment, services ) {

      const widgetName = environment.specification.name;
      const context = environment.context;
      let isAttached = true;
      let controller = null;
      return {
         createController,
         domAttachTo,
         domDetach,
         destroy: () => {}
      };

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController( config ) {
         const widgetModule = widgetModules[ widgetName ];
         const injector = createInjector();
         const injections = ( widgetModule.injections || [] )
            .map( injection => injector.get( injection ) );
         config.onBeforeControllerCreation( environment, injector.get() );
         controller = widgetModule.create( ...injections );
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement ) {
         isAttached = true;
         areaElement.appendChild( environment.anchorElement );
         controller.onDomAvailable();
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         isAttached = false;
         const parent = environment.anchorElement.parentNode;
         if( parent ) {
            parent.removeChild( environment.anchorElement );
         }
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      function createInjector() {
         const map = {
            axLog: laxarServices.log,
            axConfiguration: laxarServices.configuration,
            axContext: context,
            axEventBus: context.eventBus,
            axFeatures: context.features || {},
            axReactRender: componentInstance => {
               if( isAttached ) {
                  ReactDom.render(
                     componentInstance,
                     environment.anchorElement
                  );
               }
            }
         };

         //////////////////////////////////////////////////////////////////////////////////////////////////

         return {
            get: name => {
               if( !name ) {
                  return map;
               }

               if( name in map ) {
                  return map[ name ];
               }

               if( name in services ) {
                  return services[ name ];
               }

               throw new Error( `laxar-react-adapter: Unknown injection: "${name}"` );
            }
         };
      }

   }

}
