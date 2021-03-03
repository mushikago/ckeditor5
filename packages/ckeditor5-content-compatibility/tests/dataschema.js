/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DataSchema from '../src/dataschema';

const fakeDefinitions = [
	{
		view: 'def1',
		model: 'ghsDef1',
		allowChildren: [ 'ghsDef2', 'ghsDef3' ],
		schema: {
			inheritAllFrom: '$block'
		}
	},
	{
		view: 'def2',
		model: 'ghsDef2',
		schema: {
			inheritAllFrom: 'ghsDef1'
		}
	},
	{
		view: 'def3',
		model: 'ghsDef3',
		schema: {
			inheritTypesFrom: 'ghsDef2'
		}
	},
	{
		view: 'def4',
		model: 'ghsDef4',
		schema: {
			allowWhere: 'ghsDef3'
		}
	},
	{
		view: 'def5',
		model: 'ghsDef5',
		schema: {
			allowContentOf: 'ghsDef4'
		}
	},
	{
		view: 'def6',
		model: 'ghsDef6',
		schema: {
			allowAttributesOf: 'ghsDef5'
		}
	}
];

describe( 'DataSchema', () => {
	let editor, dataSchema;

	beforeEach( () => {
		return VirtualTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;

				dataSchema = new DataSchema();
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should allow registering schema with proper definition', () => {
		const definitions = getFakeDefinitions( 'def1' );

		dataSchema.register( definitions[ 0 ] );

		const result = dataSchema.getDefinitionsForView( 'def1' );

		expect( Array.from( result ) ).to.deep.equal( definitions );
	} );

	it( 'should allow resolving definitions by view name (string)', () => {
		registerMany( dataSchema, fakeDefinitions );

		const result = dataSchema.getDefinitionsForView( 'def2' );

		expect( Array.from( result ) ).to.deep.equal( getFakeDefinitions( 'def2' ) );
	} );

	it( 'should allow resolving definitions by view name (RegExp)', () => {
		registerMany( dataSchema, fakeDefinitions );

		const result = dataSchema.getDefinitionsForView( /^def1|def2$/ );

		expect( Array.from( result ) ).to.deep.equal( getFakeDefinitions( 'def1', 'def2' ) );
	} );

	it( 'should allow resolving definitions by view name including references (inheritAllFrom)', () => {
		registerMany( dataSchema, fakeDefinitions );

		const result = dataSchema.getDefinitionsForView( 'def2', true );

		expect( Array.from( result ) ).to.deep.equal( getFakeDefinitions( 'def1', 'def2' ) );
	} );

	it( 'should allow resolving definitions by view name including references (inheritTypes)', () => {
		registerMany( dataSchema, fakeDefinitions );

		const result = dataSchema.getDefinitionsForView( 'def3', true );

		expect( Array.from( result ) ).to.deep.equal( getFakeDefinitions( 'def1', 'def2', 'def3' ) );
	} );

	it( 'should allow resolving definitions by view name including references (allowWhere)', () => {
		registerMany( dataSchema, fakeDefinitions );

		const result = dataSchema.getDefinitionsForView( 'def4', true );

		expect( Array.from( result ) ).to.deep.equal( getFakeDefinitions( 'def1', 'def2', 'def3', 'def4' ) );
	} );

	it( 'should allow resolving definitions by view name including references (allowContentOf)', () => {
		registerMany( dataSchema, fakeDefinitions );

		const result = dataSchema.getDefinitionsForView( 'def5', true );

		expect( Array.from( result ) ).to.deep.equal( getFakeDefinitions( 'def1', 'def2', 'def3', 'def4', 'def5' ) );
	} );

	it( 'should allow resolving definitions by view name including references (allowAttributesOf)', () => {
		registerMany( dataSchema, fakeDefinitions );

		const result = dataSchema.getDefinitionsForView( 'def6', true );

		expect( Array.from( result ) ).to.deep.equal( getFakeDefinitions( 'def1', 'def2', 'def3', 'def4', 'def5', 'def6' ) );
	} );

	it( 'should return nothing for invalid view name', () => {
		registerMany( dataSchema, fakeDefinitions );

		const result = dataSchema.getDefinitionsForView( null );

		expect( result.size ).to.equal( 0 );
	} );
} );

function registerMany( dataSchema, definitions ) {
	definitions.forEach( def => dataSchema.register( def ) );
}

function getFakeDefinitions( ...viewNames ) {
	return fakeDefinitions.filter( def => viewNames.includes( def.view ) );
}