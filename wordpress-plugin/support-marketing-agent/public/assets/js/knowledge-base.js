/**
 * Knowledge Base JavaScript
 * @package Support_Marketing_Agent
 */

(function($) {
    'use strict';

    const SMA_KB = {
        init: function() {
            this.bindEvents();
            this.loadInitialData();
        },

        bindEvents: function() {
            // Search form
            $(document).on('submit', '.sma-kb-search-form', this.handleSearch.bind(this));
            $(document).on('input', '.sma-kb-search-input', this.debounce(this.handleSearchInput.bind(this), 300));

            // Category filter
            $(document).on('click', '.sma-kb-category-btn', this.handleCategoryClick.bind(this));

            // Article click
            $(document).on('click', '.sma-kb-article-card, .sma-kb-search-result', this.handleArticleClick.bind(this));

            // Modal
            $(document).on('click', '.sma-kb-modal-close, .sma-kb-modal-backdrop', this.closeModal.bind(this));
            $(document).on('keydown', this.handleKeydown.bind(this));

            // FAQ accordion
            $(document).on('click', '.sma-faq-question', this.handleFaqClick.bind(this));

            // Pagination
            $(document).on('click', '.sma-kb-page-btn', this.handlePagination.bind(this));
        },

        loadInitialData: function() {
            // Load KB articles
            $('.sma-knowledge-base').each((_, el) => {
                this.loadArticles($(el));
                this.loadCategories($(el));
            });

            // Load FAQs
            $('.sma-faq').each((_, el) => {
                this.loadFaqs($(el));
            });
        },

        handleSearch: function(e) {
            e.preventDefault();
            const $form = $(e.currentTarget);
            const query = $form.find('.sma-kb-search-input').val().trim();
            
            if (!query) return;
            
            this.performSearch(query, $form.closest('.sma-knowledge-base, .sma-kb-search-widget'));
        },

        handleSearchInput: function(e) {
            const $input = $(e.currentTarget);
            const query = $input.val().trim();
            const $container = $input.closest('.sma-knowledge-base, .sma-kb-search-widget');
            
            if (query.length < 2) {
                $container.find('.sma-kb-search-results').empty();
                $container.find('.sma-kb-ai-response').removeClass('active');
                return;
            }

            this.performSearch(query, $container);
        },

        performSearch: function(query, $container) {
            const $results = $container.find('.sma-kb-search-results');
            const aiEnabled = $container.data('ai-enabled') !== false;
            
            $results.html('<div class="sma-kb-loading">' + smaKB.strings.searching + '</div>');

            // Search knowledge base
            $.ajax({
                url: smaKB.restUrl + 'kb/search',
                method: 'GET',
                data: { query: query },
                headers: { 'X-WP-Nonce': smaKB.nonce }
            }).done((response) => {
                this.renderSearchResults(response.articles || [], $results);
            }).fail(() => {
                $results.html('<p>' + smaKB.strings.error + '</p>');
            });

            // Get AI suggestion if enabled
            if (aiEnabled) {
                this.getAISuggestion(query, $container);
            }
        },

        getAISuggestion: function(query, $container) {
            const $aiResponse = $container.find('.sma-kb-ai-response');
            
            $aiResponse.addClass('active').html(
                '<div class="sma-kb-ai-loading"><div class="spinner"></div> ' + smaKB.strings.aiThinking + '</div>'
            );

            $.ajax({
                url: smaKB.restUrl + 'ai/suggest',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ query: query }),
                headers: { 'X-WP-Nonce': smaKB.nonce }
            }).done((response) => {
                if (response.ai_response) {
                    $aiResponse.html(
                        '<div class="sma-kb-ai-header">' +
                        '<svg class="sma-kb-ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                        '<path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>' +
                        '<path d="M12 12v10"/><path d="M8 22h8"/>' +
                        '</svg>AI Suggested Answer</div>' +
                        '<div class="sma-kb-ai-content">' + response.ai_response + '</div>'
                    );
                } else {
                    $aiResponse.removeClass('active');
                }
            }).fail(() => {
                $aiResponse.removeClass('active');
            });
        },

        renderSearchResults: function(articles, $container) {
            if (!articles.length) {
                $container.html('<p class="sma-kb-no-results">' + smaKB.strings.noResults + '</p>');
                return;
            }

            let html = '';
            articles.forEach(article => {
                html += '<div class="sma-kb-search-result" data-id="' + article.id + '">' +
                    '<div class="sma-kb-search-result-title">' + this.escapeHtml(article.title) + '</div>' +
                    '<div class="sma-kb-search-result-excerpt">' + this.escapeHtml(article.excerpt || '') + '</div>' +
                    '</div>';
            });
            $container.html(html);
        },

        loadArticles: function($container, page = 1) {
            const category = $container.data('category');
            const $grid = $container.find('.sma-kb-articles-grid');
            
            $.ajax({
                url: smaKB.restUrl + 'kb/articles',
                method: 'GET',
                data: { category: category, page: page },
                headers: { 'X-WP-Nonce': smaKB.nonce }
            }).done((response) => {
                this.renderArticles(response.articles || [], $grid);
                this.renderPagination(response, $container.find('.sma-kb-pagination'), page);
            });
        },

        renderArticles: function(articles, $container) {
            let html = '';
            articles.forEach(article => {
                html += '<div class="sma-kb-article-card" data-id="' + article.id + '">' +
                    '<div class="sma-kb-article-category">' + this.escapeHtml(article.category || 'General') + '</div>' +
                    '<div class="sma-kb-article-title">' + this.escapeHtml(article.title) + '</div>' +
                    '<div class="sma-kb-article-excerpt">' + this.escapeHtml(article.excerpt || '') + '</div>' +
                    '</div>';
            });
            $container.html(html || '<p>No articles found.</p>');
        },

        loadCategories: function($container) {
            const $nav = $container.find('.sma-kb-categories-nav');
            
            $.ajax({
                url: smaKB.restUrl + 'kb/categories',
                method: 'GET',
                headers: { 'X-WP-Nonce': smaKB.nonce }
            }).done((response) => {
                let html = '<button class="sma-kb-category-btn active" data-category="">All</button>';
                (response.categories || []).forEach(cat => {
                    html += '<button class="sma-kb-category-btn" data-category="' + this.escapeHtml(cat.slug) + '">' +
                        this.escapeHtml(cat.name) + '</button>';
                });
                $nav.html(html);
            });
        },

        handleCategoryClick: function(e) {
            const $btn = $(e.currentTarget);
            const $container = $btn.closest('.sma-knowledge-base');
            
            $btn.siblings().removeClass('active');
            $btn.addClass('active');
            
            $container.data('category', $btn.data('category'));
            this.loadArticles($container);
        },

        handleArticleClick: function(e) {
            const articleId = $(e.currentTarget).data('id');
            this.openArticle(articleId);
        },

        openArticle: function(id) {
            const $modal = $('.sma-kb-article-modal');
            const $body = $modal.find('.sma-kb-modal-body');
            
            $body.html('<div class="sma-kb-loading">Loading...</div>');
            $modal.addClass('active');
            $('body').css('overflow', 'hidden');

            $.ajax({
                url: smaKB.restUrl + 'kb/article/' + id,
                method: 'GET',
                headers: { 'X-WP-Nonce': smaKB.nonce }
            }).done((article) => {
                $body.html(
                    '<h1>' + this.escapeHtml(article.title) + '</h1>' +
                    '<div class="sma-kb-article-content">' + article.content + '</div>'
                );
            }).fail(() => {
                $body.html('<p>Failed to load article.</p>');
            });
        },

        closeModal: function() {
            $('.sma-kb-article-modal').removeClass('active');
            $('body').css('overflow', '');
        },

        handleKeydown: function(e) {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        },

        loadFaqs: function($container) {
            const category = $container.data('category');
            const limit = $container.data('limit');
            const expandFirst = $container.data('expand-first') === 'true';
            
            $.ajax({
                url: smaKB.restUrl + 'kb/articles',
                method: 'GET',
                data: { category: category || 'faq', per_page: limit },
                headers: { 'X-WP-Nonce': smaKB.nonce }
            }).done((response) => {
                $container.find('.sma-faq-loading').hide();
                this.renderFaqs(response.articles || [], $container.find('.sma-faq-list'), expandFirst);
            }).fail(() => {
                $container.find('.sma-faq-loading').text('Failed to load FAQs.');
            });
        },

        renderFaqs: function(articles, $container, expandFirst) {
            let html = '';
            articles.forEach((article, index) => {
                const isActive = expandFirst && index === 0 ? ' active' : '';
                html += '<div class="sma-faq-item' + isActive + '">' +
                    '<button class="sma-faq-question">' +
                    '<span>' + this.escapeHtml(article.title) + '</span>' +
                    '<svg class="sma-faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<polyline points="6 9 12 15 18 9"/></svg>' +
                    '</button>' +
                    '<div class="sma-faq-answer">' +
                    '<div class="sma-faq-answer-content">' + (article.content || article.excerpt || '') + '</div>' +
                    '</div></div>';
            });
            $container.html(html || '<p>No FAQs found.</p>');
        },

        handleFaqClick: function(e) {
            const $item = $(e.currentTarget).closest('.sma-faq-item');
            $item.toggleClass('active');
        },

        renderPagination: function(response, $container, currentPage) {
            const totalPages = response.total_pages || 1;
            if (totalPages <= 1) {
                $container.empty();
                return;
            }

            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                const active = i === currentPage ? ' active' : '';
                html += '<button class="sma-kb-page-btn' + active + '" data-page="' + i + '">' + i + '</button>';
            }
            $container.html(html);
        },

        handlePagination: function(e) {
            const $btn = $(e.currentTarget);
            const page = $btn.data('page');
            const $container = $btn.closest('.sma-knowledge-base');
            this.loadArticles($container, page);
        },

        debounce: function(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

        escapeHtml: function(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    };

    $(document).ready(function() {
        SMA_KB.init();
    });

})(jQuery);
