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
 */
export function bootstrap( modules, laxarServices ) {

   const widgetModules = {};

   modules
      .map( _ => _.default || _ )
      .filter( function ( module ) { return module.name; } )
      .forEach( function( module ) {
         widgetModules[ module.name ] = module;
      } );

   return {
      technology: technology,
      create: create,
      applyViewChanges: function() {}
   };

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( environment, services ) {

      const widgetName = environment.specification.name;
      const context = environment.context;
      let isAttached = true;
      let controller = null;
      return {
         createController: createController,
         domAttachTo: domAttachTo,
         domDetach: domDetach,
         destroy: function() {}
      };

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController( config ) {
         const widgetModule = widgetModules[ widgetName ];
         const injector = createInjector();
         const injections = ( widgetModule.injections || [] ).map( function( injection ) {
            return injector.get( injection );
         } );
         config.onBeforeControllerCreation( environment, injector.get() );
         controller = widgetModule.create.apply( widgetModule, injections );
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
            axReactRender: function( componentInstance ) {
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
            get: function( name ) {
               if( arguments.length === 0 ) {
                  return map;
               }

               if( name in map ) {
                  return map[ name ];
               }

               if( name in services ) {
                  return services[ name ];
               }

               throw new Error( 'laxar-react-adapter: Unknown dependency: "' + name + '"' );
            }
         };
      }

   }

}
