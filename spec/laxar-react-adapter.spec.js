import { bootstrap, technology } from '../laxar-react-adapter';
import { create as createConfigurationMock } from 'laxar/lib/testing/configuration_mock';
import { create as createLogMock } from 'laxar/lib/testing/log_mock';
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

      let factory;

      beforeEach( () => {
         factory = bootstrap( [], {
            configuration: createConfigurationMock(),
            log: createLogMock()
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'produces a factory-object which is tagged with the technology "react"', () => {
         expect( factory.technology ).toEqual( 'react' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'produces a factory-object with a create-method', () => {
         expect( factory.create ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'produces a factory-object with an applyViewChanges method', () => {
         expect( factory.applyViewChanges ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to create a widget adapter', () => {
         expect( factory.create( {
            specification: widgetData.specification,
            context: {}
         }, {} ) )
            .toEqual( {
               createController: jasmine.any( Function ),
               domAttachTo: jasmine.any( Function ),
               domDetach: jasmine.any( Function ),
               destroy: jasmine.any( Function )
            } );
      } );

   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'a react widget adapter', () => {

   let adapter;
   let fakeModule;
   let beforeCreationSpy;

   beforeEach( () => {
      beforeCreationSpy = jasmine.createSpy( 'onBeforeControllerCreation' );
      fakeModule = {
         create: jasmine.createSpy( 'some-widget.create' ),
         name: widgetData.specification.name
      };

      const factory = bootstrap( [ fakeModule ], {
         configuration: createConfigurationMock(),
         log: createLogMock()
      } );

      adapter = factory.create( {
         specification: widgetData.specification,
         context: {
            eventBus: { fake: 'I am a mock event bus!' },
            features: widgetData.configuration.features
         }
      }, {} );
   } );

   describe( 'asked to instantiate a widget controller', () => {

      beforeEach( () => {
         adapter.createController( { onBeforeControllerCreation: beforeCreationSpy } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates that controller', () => {
         expect( fakeModule.create ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls the onBeforeControllerCreation spy', () => {
         expect( beforeCreationSpy ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to instantiate a widget controller with injections', () => {

      beforeEach( () => {
         fakeModule.injections = [ 'axContext', 'axReactRender', 'axFeatures' ];
         adapter.createController( { onBeforeControllerCreation: beforeCreationSpy } );
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
