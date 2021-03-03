/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/dataschema
 */

import { toArray } from 'ckeditor5/src/utils';

/**
 * Holds representation of the extended HTML document type definitions to be used by the
 * editor in content compatibility support.
 *
 * Data schema is represented by data schema definitions. To add new definition, use {@link #register} method:
 *
 *		dataSchema.register( {
 *			view: 'section',
 *			model: 'my-section',
 *			schema: {
 *				inheritAllFrom: '$block'
 *			}
 *		} );
 */
export default class DataSchema {
	constructor() {
		/**
		 * A map of registered data schema definitions via {@link #register} method.
		 *
		 * @readonly
		 * @private
		 * @member {Map<string, module:content-compatibility/dataschema~DataSchemaDefinition>}
		 * module:content-compatibility/dataschema~DataSchema#_definitions
		 */
		this._definitions = new Map();

		// Add block elements.
		this.register( {
			model: '$ghsBlock',
			allowChildren: '$block',
			schema: {
				allowIn: [ '$root', '$ghsBlock' ],
				isBlock: true
			}
		} );

		this.register( {
			view: 'article',
			model: 'ghsArticle',
			schema: {
				inheritAllFrom: '$ghsBlock'
			}
		} );

		this.register( {
			view: 'section',
			model: 'ghsSection',
			schema: {
				inheritAllFrom: '$ghsBlock'
			}
		} );

		// Add data list elements.
		this.register( {
			view: 'dl',
			model: 'ghsDl',
			schema: {
				allowIn: [ '$ghsBlock', '$root' ],
				isBlock: true
			}
		} );

		this.register( {
			model: '$ghsDatalist',
			allowChildren: '$block',
			schema: {
				allowIn: 'ghsDl',
				isBlock: true
			}
		} );

		this.register( {
			view: 'dt',
			model: 'ghsDt',
			schema: {
				inheritAllFrom: '$ghsDatalist'
			}
		} );

		this.register( {
			view: 'dd',
			model: 'ghsDd',
			schema: {
				inheritAllFrom: '$ghsDatalist'
			}
		} );

		// Add details elements.
		this.register( {
			view: 'details',
			model: 'ghsDetails',
			schema: {
				inheritAllFrom: '$ghsBlock'
			}
		} );

		this.register( {
			view: 'summary',
			model: 'ghsSummary',
			allowChildren: '$text',
			schema: {
				allowIn: 'ghsDetails'
			}
		} );
	}

	/**
	 * Add new data schema definition.
	 *
	 * @param {module:content-compatibility/dataschema~DataSchemaDefinition} definition
	 */
	register( definition ) {
		this._definitions.set( definition.model, definition );
	}

	/**
	 * Returns all definitions matching the given view name.
	 *
	 * @param {String|RegExp} viewName
	 * @param {Boolean} [includeReferences] Indicates if this method should also include definitions of referenced models.
	 * @returns {Set<module:content-compatibility/dataschema~DataSchemaDefinition>}
	 */
	getDefinitionsForView( viewName, includeReferences ) {
		const definitions = new Set();

		for ( const definition of this._getMatchingViewDefinitions( viewName ) ) {
			if ( includeReferences ) {
				for ( const reference of this._getReferences( definition.model ) ) {
					definitions.add( reference );
				}
			}

			definitions.add( definition );
		}

		return definitions;
	}

	/**
	 * Returns definitions matching the given view name.
	 *
	 * @private
	 * @param {String|RegExp} viewName
	 * @returns {Array}
	 */
	_getMatchingViewDefinitions( viewName ) {
		return Array.from( this._definitions.values() )
			.filter( def => def.view && testViewName( viewName, def.view ) );
	}

	/**
	 * Resolves all definition references registered for the given data schema definition.
	 *
	 * @private
	 * @param {String} modelName Data schema model name.
	 * @returns {Iterable<module:content-compatibility/dataschema~DataSchemaDefinition>}
	 */
	* _getReferences( modelName ) {
		const { schema } = this._definitions.get( modelName );
		const inheritProperties = [ 'inheritAllFrom', 'inheritTypesFrom', 'allowWhere', 'allowContentOf', 'allowAttributesOf' ];

		for ( const property of inheritProperties ) {
			for ( const referenceName of toArray( schema[ property ] || [] ) ) {
				const definition = this._definitions.get( referenceName );

				if ( referenceName !== modelName && definition ) {
					yield* this._getReferences( definition.model );
					yield definition;
				}
			}
		}
	}
}

/**
 * Test view name against the given pattern.
 *
 * @private
 * @param {String|RegExp} pattern
 * @param {String} viewName
 * @returns {Boolean}
 */
function testViewName( pattern, viewName ) {
	if ( typeof pattern === 'string' ) {
		return pattern === viewName;
	}

	if ( pattern instanceof RegExp ) {
		return pattern.test( viewName );
	}

	return false;
}

/**
 * A definition of {@link module:content-compatibility/dataschema data schema}.
 *
 * @typedef {Object} module:content-compatibility/dataschema~DataSchemaDefinition
 * @property {String} [view] Name of the view element.
 * @property {String} model Name of the model element.
 * @property {module:engine/model/schema~SchemaItemDefinition} Model schema item definition describing registered model.
 * @property {String|Array} allowChildren Extends the given children list to allow definition model.
 * or custom schema item definition.
 */