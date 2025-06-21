/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Edit from './edit';
import metadata from './block.json';
import './styles/style.scss';
import './styles/editor.scss';

/**
 * Define a custom SVG icon for the block. This icon will appear in
 * the Inserter and when the user selects the block in the Editor.
 */
const postsIcon = (
	<svg
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M4 4h6v6H4V4zm0 7h6v6H4v-6zm7-7h9v6h-9V4zm0 7h9v6h-9v-6zM4 18h6v2H4v-2zm7 0h9v2h-9v-2z"></path>
	</svg>
);

/**
 * Every block starts by registering a new block type definition.
 */
registerBlockType( metadata.name, {
	icon: postsIcon,
	/**
	 * @see ./edit.js
	 */
	edit: Edit,
	/**
	 * @see ./save.js
	 */
	save: () => {
		return null;
	},
} );
