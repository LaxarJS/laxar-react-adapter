/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as ReactDom from 'react-dom';

export const technology = 'react';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line valid-jsdoc
/**
 * Implements the LaxarJS adapter API:
 * https://github.com/LaxarJS/laxar/blob/master/docs/manuals/adapters.md
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
         const module = widgetModules[ environment.specification.name ];
         const availableInjections = {
            ...environment.services,
            axReactRender( componentInstance ) {
               if( isAttached ) {
                  ReactDom.render( componentInstance, environment.anchorElement );
               }
            }
         };
         const injections = ( module.injections || [] ).map( injection => {
            if( !( injection in availableInjections ) ) {
               throw new Error( `Trying to inject unknown service "${injection}".` );
            }
            return availableInjections[ injection ];
         } );
         config.onBeforeControllerCreation( environment, Object.freeze( injections ) );
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
