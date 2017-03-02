/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://www.laxarjs.org
 */
import React from 'react';

/**
 * This react component renders a laxar widget area.
 *
 *
 * areaName {String}: the name of the widget area
 *
 * axAreaHelper {Object}: this component requires the axAreaHelper and expects it as an attribute
 *
 * axVisibility {String}: this component requires the axVisibility and expects it as an attribute
 *
 * cssClassName {String}: a string with css class names which will redirect to Reacts className attribute
 *
 * visible {Boolean}: true if the widget area should be visible
 */

export class AxWidgetArea extends React.Component {

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
         <div style={ divStyle }
              className={ this.props.cssClassName || '' }
              ref={ this.register }
         />
      );
   }
}

AxWidgetArea.propTypes = {
   areaName: React.PropTypes.string.isRequired,
   axAreaHelper: React.PropTypes.object.isRequired,
   axVisibility: React.PropTypes.object.isRequired,
   cssClassName: React.PropTypes.string,
   visible: React.PropTypes.bool.isRequired
};
