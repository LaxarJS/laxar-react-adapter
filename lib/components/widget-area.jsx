/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://www.laxarjs.org
 */
import React from 'react';

export default class AxWidgetArea extends React.Component {

   constructor( props ) {
      super( props );
      this.props = props;
      this.register = this.register.bind( this );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   register( div ) {
      if( div === null ){ return; }
      this.props.areaHelper.register( this.props.name, div );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   render() {
      let divStyle = {};
      if( this.props.activeTab === null || (
         this.props.activeTab && this.props.activeTab.name !== this.props.name
         ) ) {
         divStyle = { display: 'none' };
         this.props.axVisibility.updateAreaVisibility( { [ this.props.name ]: false } );
      }
      else {
         this.props.axVisibility.updateAreaVisibility( { [ this.props.name ]: true } );
      }

      return (
         <div data-ax-widget-area={ this.props.name }
              style={divStyle}
              className={ this.props.css }
              ref={ this.register }
         />
      );
   }
}
