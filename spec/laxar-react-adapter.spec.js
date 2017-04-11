/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import React from 'react';
import { AxWidgetArea, bootstrap, technology } from '../laxar-react-adapter';
import * as widgetData from './widget_data';

describe( 'A react widget adapter module', () => {

   it( 'advertises "react" as its technology', () => {
      expect( technology ).toEqual( 'react' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a `bootstrap` method', () => {
      expect( bootstrap ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a `AxWidgetArea` component', () => {
      expect( AxWidgetArea ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when bootstrapped with services and modules', () => {

      let artifacts;
      let services;
      let factory;

      beforeEach( () => {
         artifacts = { widgets: [ widgetData ], controls: [] };
         services = { adapterUtilities: createAdapterUtilitiesMock() };
         factory = bootstrap( artifacts, services );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'produces a factory-object with a create-method', () => {
         expect( factory.create ).toEqual( jasmine.any( Function ) );
      } );

   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'a react widget adapter factory', () => {

   let artifacts;
   let services;
   let factory;

   let anchorElement;
   let fakeModule;
   let fakeCreate;
   let provideServices;
   let environment;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   beforeEach( () => {
      fakeCreate = () => {}
      fakeModule = {
         create: jasmine.createSpy( 'some-widget.create' )
            .and.callFake( ( ...args ) => fakeCreate( ...args ) )
      };

      artifacts = {
         widgets: [
            { ...widgetData, module: fakeModule }
         ],
         controls: []
      };

      services = { adapterUtilities: createAdapterUtilitiesMock() };
      factory = bootstrap( artifacts, services );

      const context = {
         eventBus: { fake: 'I am a mock event bus!' },
         features: widgetData.configuration.features
      };
      anchorElement = document.createElement( 'div' );
      provideServices = jasmine.createSpy( 'provideServices' );

      environment = {
         widgetName: widgetData.descriptor.name,
         anchorElement,
         provideServices,
         services: {
            axContext: context,
            axEventBus: context.eventBus,
            axFeatures: context.features
         }
      };
   } );

   describe( 'asked to instantiate a widget adapter', () => {

      let adapter;
      beforeEach( () => {
         adapter = factory.create( environment );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates the widget controller', () => {
         expect( fakeModule.create ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls provideServices', () => {
         expect( provideServices ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns an adapter API', () => {
         expect( adapter ).toEqual( {
            domAttachTo: jasmine.any( Function ),
            domDetach: jasmine.any( Function )
         } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to instantiate a widget controller with injections', () => {

      let adapter;
      let axReactRender;
      let renderSpy;

      beforeEach( () => {

         renderSpy = jasmine.createSpy( 'render' ).and.callFake(
            () => React.createElement( 'p', {}, null )
         );
         fakeModule.injections = [ 'axReactRender', 'axContext', 'axFeatures' ];
         fakeCreate = reactRender => {
            axReactRender = reactRender;
            return renderSpy;
         };
         adapter = factory.create( environment );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates that controller with injections', () => {
         expect( fakeModule.create ).toHaveBeenCalledWith(
            jasmine.any( Function ),
            { eventBus: jasmine.any( Object ), features: jasmine.any( Object ) },
            { myFeature: {} }
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when attached to the DOM', () => {

         let domContainer;
         beforeEach( () => {
            domContainer = document.createElement( 'DIV' );
            adapter.domAttachTo( domContainer );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'renders the widget', () => {
            expect( renderSpy ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'implements axReactRender calls', () => {
            renderSpy.calls.reset();
            axReactRender();
            expect( renderSpy ).toHaveBeenCalled();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'while not attached to the DOM', () => {

         let domContainer;
         beforeEach( () => {
            domContainer = document.createElement( 'DIV' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not render the widget', () => {
            expect( renderSpy ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'drops axReactRender calls', () => {
            axReactRender();
            expect( renderSpy ).not.toHaveBeenCalled();
         } );

      } );

   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createAdapterUtilitiesMock() {
   const utilities = {};
   [ 'unknownWidget', 'unknownInjection', 'activityAccessingDom' ].forEach( method => {
      utilities[ method ] = jasmine.createSpy( method ).and.returnValue( new Error() );
   } );
   return utilities;
}
