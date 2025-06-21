/**
 * Retrieves the translation of text.
 */
import { __ } from '@wordpress/i18n';

/**
* Imports the InspectorControls component, which is used to wrap
* the block's custom controls that will appear in in the Settings
* Sidebar when the block is selected.
*
* Also imports the React hook that is used to mark the block wrapper
* element. It provides all the necessary props like the class name.
* 
*/
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';

/**
* Imports the necessary components that will be used to create
* the user interface for the block's settings.
*
*/
import { RadioControl, PanelBody, RangeControl, SelectControl, ToggleControl, TextControl } from '@wordpress/components';

/**
* Imports the useSelect hook from @wordpress/data to fetch posts for preview in the editor.
*/
import { useSelect } from '@wordpress/data';

/**
* Imports the store as coreStore from @wordpress/core-data.
*/
import { store as coreStore } from '@wordpress/core-data';

/**
* The edit function describes the structure of your block in the context of the
* editor. This represents what the editor will render when the block is used.
*
*/
export default function Edit({ attributes, setAttributes }) {
	const { postSettings } = attributes;
	const { layout, postsPerPage } = postSettings;
	const blockProps = useBlockProps();

	const posts = useSelect((select) => {
		return select(coreStore).getEntityRecords('postType', 'post', {
			per_page: postsPerPage,
			_embed: true,
			orderby: 'date',
			order: 'desc'
		});
	}, [postsPerPage]);

	const onChangePostSettingsHandler = (key, value) => {
		setAttributes({ postSettings: { ...postSettings, [key]: value } });
	};

	function stripTags(html) {
		const tmp = document.createElement('DIV');
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || '';
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Layout Settings', 'posts-layout-block')} initialOpen={false}>
					<RadioControl
						label={__('Layout', 'posts-layout-block')}
						selected={layout}
						options={[
							{ label: __('Grid', 'posts-layout-block'), value: 'grid' },
							{ label: __('List', 'posts-layout-block'), value: 'list' },
						]}
						onChange={(value) => onChangePostSettingsHandler('layout', value)}
					/>
				</PanelBody>
				<PanelBody title={__('Posts Settings', 'posts-layout-block')} initialOpen={false}>
					<RangeControl
						label={__('Posts Per Page', 'posts-layout-block')}
						value={postSettings.postsPerPage}
						onChange={(value) => setAttributes({ postSettings: { ...postSettings, postsPerPage: value } })}
						min={1}
						max={12}
					/>
					<ToggleControl
						label={__('Enable Load More', 'posts-layout-block')}
						checked={postSettings.enableLoadMore}
						onChange={(value) => setAttributes({ postSettings: { ...postSettings, enableLoadMore: value } })}
						help={postSettings.enableLoadMore ? __('Load more button is enabled', 'posts-layout-block') : __('Load more button is disabled', 'posts-layout-block')}
					/>
					{postSettings.enableLoadMore && (
						<TextControl
							label={__('Load More Button Text', 'posts-layout-block')}
							value={postSettings.loadMoreText || __('Load More', 'posts-layout-block')}
							onChange={(value) => setAttributes({ postSettings: { ...postSettings, loadMoreText: value } })}
							help={__('Customize the text shown on the load more button', 'posts-layout-block')}
						/>
					)}
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<div className='posts__layout'>
					<div className='posts__layout-body'>
					<div className='posts__layout-row' data-layout={layout}>
						{posts && posts.length > 0 ? (
							posts.map((post) => (
								<div className="posts__layout-col" key={post.id}>
									<div className="posts__layout-col-image">
										{post.featured_media ? (
											<img
												src={post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url ||
													post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
													'https://placehold.co/600x400/png'}
												alt={post.title.rendered}
											/>
										) : (
											<img
												src="https://placehold.co/600x400/png"
												alt={post.title.rendered}
											/>
										)}
									</div>
									<div className="posts__layout-col-content">
										<a href={post.link} className="posts__layout-col-link" target="_blank" rel="noopener noreferrer">
											<h3 className="posts__layout-col-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
										</a>
										<div className="posts__layout-col-excerpt">
											{post.excerpt && post.excerpt.rendered
												? stripTags(post.excerpt.rendered).split(' ').slice(0, 20).join(' ') + '...'
												: ''}
										</div>
										<div className="posts__layout-read-more">
											<a href={post.link} className="posts__layout-read-more-link" target="_blank" rel="noopener noreferrer">
												Read More
											</a>
										</div>
									</div>
								</div>
							))
						) : (
							<p>{__('No posts found.', 'posts-layout-block')}</p>
						)}
					</div>
					{postSettings.enableLoadMore && (
					<div className='posts__layout-load-more'>
						<button className="posts__layout-load-button load-more-button">
							{postSettings.loadMoreText || __('Load More', 'posts-layout-block')}
						</button>
					</div>
					)}
				</div>
				</div>
			</div>
		</>
	);
}
