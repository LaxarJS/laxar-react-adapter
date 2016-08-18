/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { bootstrap, technology } from '../laxar-react-adapter';
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

   describe( 'when bootstrapped with services and modules', () => {

      let artifacts;
      let services;
      let factory;

      beforeEach( () => {
         artifacts = { widgets: [ widgetData ], controls: [] };
         services = { widgetLoader: createWidgetLoaderMock() };
         factory = bootstrap( artifacts, services );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'produces a factory-object which is tagged with the technology "react"', () => {
         expect( factory.technology ).toEqual( 'react' );
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
   let onBeforeControllerCreation;
   let environment;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   beforeEach( () => {
      fakeModule = { create: jasmine.createSpy( 'some-widget.create' ) };

      artifacts = {
         widgets: [
            { ...widgetData, module: fakeModule }
         ],
         controls: []
      };

      services = { widgetLoader: createWidgetLoaderMock() };
      factory = bootstrap( artifacts, services );

      const context = {
         eventBus: { fake: 'I am a mock event bus!' },
         features: widgetData.configuration.features
      };
      anchorElement = document.createElement( 'div' );
      onBeforeControllerCreation = jasmine.createSpy( 'onBeforeControllerCreation' );

      environment = {
         widgetName: widgetData.descriptor.name,
         anchorElement,
         onBeforeControllerCreation,
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

      it( 'calls the onBeforeControllerCreation spy', () => {
         expect( onBeforeControllerCreation ).toHaveBeenCalled();
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

      beforeEach( () => {
         fakeModule.injections = [ 'axContext', 'axReactRender', 'axFeatures' ];
         factory.create( environment );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates that controller with injections', () => {
         expect( fakeModule.create ).toHaveBeenCalledWith(
            { eventBus: jasmine.any( Object ), features: jasmine.any( Object ) },
            jasmine.any( Function ),
            { myFeature: {} }
         );
      } );

   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createWidgetLoaderMock() {
   const artifactErrors = {};
   [ 'unknownWidget', 'unknownInjection', 'activityAccessingDom' ].forEach( method => {
      jasmine.createSpy( method ).and.returnValue( new Error() );
   } );
   return { artifactErrors };
}
