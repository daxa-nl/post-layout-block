let currentPage = 1;

document.addEventListener('DOMContentLoaded', function(e) {
    e.preventDefault();

    const loadButton = document.querySelector('.posts__layout-load-button');
    const responseEl = document.querySelector('.posts__layout-row-posts');

    if(!loadButton || !responseEl) return;

    const fetchPosts = async (dataArgs) => {
        const { page, limit } = dataArgs;
        
        var formData = new FormData();
        formData.append('action', 'posts__layout_action');
        formData.append('page', page);
        formData.append('limit', limit);
        formData.append('nonce', postsLayoutNonce);

        try {
            const response = await fetch(ajaxurl, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const res = await response.json();

            if (!res.success) {
                throw new Error(res.data.message || 'Error loading posts');
            }

            if (res.html) {
                responseEl.insertAdjacentHTML('beforeend', res.html);
                if (!res.has_more) {
                    if(loadButton){
                        loadButton.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            errorMsg = error.message || 'Error loading posts. Try again.';
            responseEl.insertAdjacentHTML('beforeend', `<div style="color: #ff0000; margin: 10px 0;font-size: 14px;">${errorMsg}</div>`);
        }
    }

    loadButton.addEventListener('click', function(e) {
        e.preventDefault();
        let page = parseInt(this.getAttribute('data-page'), 10) || 1;
        let perPage = this.getAttribute('data-perPpage');
        let nextPage = page + 1;
        this.setAttribute('data-page', nextPage);
        currentPage = nextPage;

        // Show loading state
        this.textContent = 'Loading...';
        this.disabled = true;
        this.style.opacity = '0.5';

        fetchPosts({ page: nextPage, limit: perPage })
            .finally(() => {
                // Reset button state
                this.textContent = 'Load More';
                this.disabled = false;
                this.style.opacity = '1';
            });
    });
});