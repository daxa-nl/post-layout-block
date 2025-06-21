# Posts Layout Block

A custom Gutenberg block to display your WordPress posts in various layouts with "Load More" functionality and responsive design.

---

## Description

**Posts Layout Block** is a flexible Gutenberg block plugin for WordPress that allows you to showcase your posts in Grid or List formats. It’s perfect for blogs, portfolios, and content-heavy websites that need dynamic post listings.

---

## Features

- Multiple layout options: Grid and List
- Load More button (AJAX-based) for seamless pagination
- Customizable number of posts per page
- Responsive design for all screen sizes
- Supports post featured images
- Includes post excerpts and "Read More" links

---

## Installation

1. Upload the `posts-layout-block` folder to the `/wp-content/plugins/` directory
2. Activate the plugin via the **Plugins** menu in WordPress
3. Use the block editor to insert the **Posts Layout** block

---

## Usage

1. In the WordPress editor, add the **Posts Layout** block to your post or page
2. Configure the block options:
   - Choose layout: Grid or List
   - Set number of posts to show
   - Enable/disable "Load More" functionality
   - Customize "Load More" button text
3. Save and preview your content

---

## Development

Built using modern WordPress development tools:

- `@wordpress/scripts` for building and bundling
- Block Editor API for Gutenberg compatibility
- WordPress REST API for loading posts via AJAX

To develop or contribute:

```bash
# Clone the repository
git clone https://github.com/daxa-nl/post-layout-block.git

# Install dependencies
npm install

# Start development
npm start

# Build for production
npm run build
