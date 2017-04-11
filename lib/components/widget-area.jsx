/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://www.laxarjs.org
 */
import React from 'react';
import { assert } from 'laxar';


/**
 * Provides and manages a LaxarJS widget area
 *
 * - _name_ (`String`): the local name of the widget area _(required)_.
 *   This is the part after the `.` in the page definition. Must be constant
 *
 * - _axAreaHelper_ (`Object`): the widget injection `axAreaHelper` _(required)_
 *
 * - _axVisibility_ (`Object`): the widget injection `axVisibility`.
 *   This is required for the area visibility to ever be `false`
 *
 * - _className_ (`String`, `Object`): forwarded to the `className` of the generated container DIV
 *
 * - _visible_ (`Boolean`): `false` if the widget area should be hidden (default: `true`).
 *   The area will be hidden using CSS `display: none`, and will be kept in the DOM
 */
export class AxWidgetArea extends React.Component {

   constructor( props ) {
      super( props );
      assert( props.name ).hasType( String ).isNotNull();
      assert( props.axAreaHelper ).hasType( Object ).isNotNull();
      assert( props.visible ).hasType( Boolean );
      this.register = div => {
         if( div === null ) { return; }
         props.axAreaHelper.register( props.name, div );
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   shouldComponentUpdate( nextProps ) {
      return nextProps.visible !== this.props.visible;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   render() {
      const { name, visible, axVisibility } = this.props;
      if( axVisibility ) {
         axVisibility.updateAreaVisibility( { [ name ]: visible } );
      }
      else if( visible === false ) {
         assert.codeIsUnreachable( 'AxWidgetArea requires `axVisibility` prop for visible=false' );
      }

      return (
         <div style={ visible === false ? { display: 'none' } : null }
              className={ this.props.className || null }
              ref={ this.register }
         />
      );
   }

}
