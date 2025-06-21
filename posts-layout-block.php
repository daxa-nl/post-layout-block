<?php
/**
 * Plugin Name:       Posts Layout Block
 * Description:       Display your site's posts in a different layout.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Daxa Narola
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       posts-layout-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using block.json and handles assets.
 */
function create_block_posts_layout_block_init() {
	register_block_type( __DIR__ . '/build', array(
		'render_callback' => 'posts_layout_block_render_callback',
	) );
}
add_action( 'init', 'create_block_posts_layout_block_init' );

/**
 * Enqueue view script and pass AJAX URL to it.
 */
add_action( 'enqueue_block_assets', function () {
	if ( is_admin() ) {
		return; // Don't enqueue on admin
	}

	// Make sure the script handle matches the one used in block.json's "viewScript"
	$handle = 'posts-layout-block-view'; // This must match the block.json handle

	wp_enqueue_script(
		$handle,
		plugins_url( 'build/view.js', __FILE__ ),
		[],
		null,
		true
	);

	// Pass ajaxurl and nonce to view.js
	wp_add_inline_script( $handle, 'const ajaxurl = "' . admin_url( 'admin-ajax.php' ) . '";', 'before' );
	wp_add_inline_script( $handle, 'const postsLayoutNonce = "' . wp_create_nonce( 'posts_layout_nonce' ) . '";', 'before' );
});

function posts_layout_block_get_query_args( $postsPerPage = -1, $page = 1, $postType = 'post' ) {
	return array(
		'post_type'      => $postType,
		'posts_per_page' => $postsPerPage,
		'paged'          => $page,
		'post_status'    => 'publish',
		'orderby'        => 'date',
		'order'          => 'DESC'
	);
}

function posts_layout_block_build_posts_html( $limit = -1, $page = 1 ) {
	$args  = posts_layout_block_get_query_args( $limit, $page, 'post' );
	$query = new WP_Query($args);
	$posts_html = '';

	$total_pages = $query->max_num_pages;
	$has_more    = $page < $total_pages;

	if ( $query->have_posts() ) {
		while ( $query->have_posts() ) {
			$query->the_post();
			$posts_html .= '<div class="posts__layout-col">';
			$posts_html .= '<div class="posts__layout-col-image">';
			
			// Check if post has thumbnail
			if ( has_post_thumbnail() ) {
				$posts_html .= get_the_post_thumbnail( get_the_ID(), 'large' );
			} else {
				$posts_html .= '<img src="https://placehold.co/600x400/png" alt="' . esc_attr(get_the_title()) . '" />';
			}
			
			$posts_html .= '</div>';
			$posts_html .= '<div class="posts__layout-col-content">';
			$posts_html .= '<a href="' . get_the_permalink() . '" class="posts__layout-col-link">';
			$posts_html .= '<h3 class="posts__layout-col-title">' . esc_html( get_the_title() ) . '</h3>';
			$posts_html .= '</a>';
			$posts_html .= '<div class="posts__layout-col-excerpt">';
			$posts_html .= esc_html( wp_trim_words( get_the_excerpt(), 20, '...' ) );
			$posts_html .= '</div>';
			$posts_html .= '<div class="posts__layout-read-more">';
			$posts_html .= '<a href="' . get_the_permalink() . '" class="posts__layout-read-more-link">Read More</a>';
			$posts_html .= '</div>';
			$posts_html .= '</div>';
			$posts_html .= '</div>';
		}
		wp_reset_postdata();
	} else {
		$posts_html .= '<p>' . __( 'No posts found.', 'posts-layout-block' ) . '</p>';
	}

	return array(
		'html'     => $posts_html,
		'has_more' => $has_more
	);
}

function posts_layout_block_render_callback( $attributes, $content, $block ) {
	$wrapper_attributes = get_block_wrapper_attributes();
	$postSettings = isset( $attributes['postSettings'] ) ? $attributes['postSettings'] : array();
	$layout = isset( $postSettings['layout'] ) ? $postSettings['layout'] : 'grid';
	$postsPerPage = isset( $postSettings['postsPerPage'] ) ? $postSettings['postsPerPage'] : -1;
	$enableLoadMore = isset( $postSettings['enableLoadMore'] ) ? $postSettings['enableLoadMore'] : false;
	$loadMoreText = isset( $postSettings['loadMoreText'] ) ? $postSettings['loadMoreText'] : __('Load More', 'posts-layout-block');
	$page = 1;

	$response_data = posts_layout_block_build_posts_html( $postsPerPage, $page );

	$html = '';
	$html .= sprintf('<div %s>', $wrapper_attributes);
	$html .= '<div class="posts__layout">';
	$html .= '<div class="posts__layout-body">';
	$html .= '<div class="posts__layout-row posts__layout-row-posts" data-layout="' . esc_attr( $layout ) . '" data-enable-load-more="' . esc_attr( $enableLoadMore ) . '">';
	$html .= $response_data['html'];
	$html .= '</div>';
	$html .= '</div>';

	if ( $enableLoadMore && $response_data['has_more'] ) {	
		$html .= '<div class="posts__layout-load-more">';
		$html .= '<button class="posts__layout-load-button" data-perPpage="' . $postsPerPage . '">' . esc_html($loadMoreText) . '</button>';
		$html .= '</div>';
	}
	$html .= '</div>';
	$html .= '</div>';
	return $html;
}

add_action('wp_ajax_posts__layout_action', 'posts_layout_block_load_more');
add_action('wp_ajax_nopriv_posts__layout_action', 'posts_layout_block_load_more');

function posts_layout_block_load_more() {
	// Verify nonce
	if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'posts_layout_nonce' ) ) {
		wp_send_json_error( array( 'message' => 'Security check failed' ) );
		wp_die();
	}

	$page = isset( $_POST['page'] ) ? intval( $_POST['page'] ) : 1;
	$limit = isset( $_POST['limit'] ) ? intval( $_POST['limit'] ) : 3;
	$post_type = isset( $_POST['postType'] ) ? sanitize_text_field( $_POST['postType'] ) : 'post';
	$posts_html = posts_layout_block_build_posts_html($limit, $page);

	wp_send_json( 
		array(
			'success'  => true, 
			'html'     => $posts_html['html'], 
			'has_more' => $posts_html['has_more']) );
	wp_die();
}
