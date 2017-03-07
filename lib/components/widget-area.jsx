/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://www.laxarjs.org
 */
import React from 'react';

/**
 * This react component renders a laxar widget area.
 *
 * @param {String} areaName
 *    the name of the widget area
 * @param {Object} axAreaHelper
 *    this component requires the axAreaHelper and expects it as an attribute
 * @param {String} axVisibility
 *    this component requires the axVisibility and expects it as an attribute
 * @param {String} cssclassName
 *    a string with css class names which will redirect to reacts className attribute
 * @param {Object} visible
 *    true if the widget area should be visible
 */

export default class AxWidgetArea extends React.Component {

   constructor( props ) {
      super( props );
      this.props = props;
      this.register = this.register.bind( this );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   register( div ) {
      if( div === null ) { return; }
      this.props.axAreaHelper.register( this.props.areaName, div );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   render() {
      let divStyle = {};

      if( this.props.visible ) {
         this.props.axVisibility.updateAreaVisibility( { [ this.props.areaName ]: true } );
      }
      else {
         divStyle = { display: 'none' };
         this.props.axVisibility.updateAreaVisibility( { [ this.props.areaName ]: false } );
      }

      return (
         <div data-ax-widget-area={ this.props.areaName }
              style={ divStyle }
              className={ this.props.cssClassName }
              ref={ this.register }
         />
      );
   }
}
