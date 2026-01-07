/**
 * Email Marketing Forms JavaScript
 * 
 * @package Support_Marketing_Agent
 */

(function($) {
    'use strict';
    
    var SMAEmail = {
        
        init: function() {
            this.bindFormSubmit();
            this.initPopup();
            this.initSlideIn();
        },
        
        /**
         * Bind form submissions
         */
        bindFormSubmit: function() {
            $(document).on('submit', '.sma-email-form__form', function(e) {
                e.preventDefault();
                SMAEmail.handleFormSubmit($(this));
            });
        },
        
        /**
         * Handle form submission
         */
        handleFormSubmit: function($form) {
            var $button = $form.find('button[type="submit"]');
            var $message = $form.closest('.sma-email-form, .sma-popup__content, .sma-slidein__content').find('.sma-email-form__message');
            var originalText = $button.text();
            
            var email = $form.find('input[name="email"]').val();
            var name = $form.find('input[name="name"]').val() || '';
            var listId = $form.data('list-id') || '';
            var nonce = $form.find('input[name="sma_email_nonce"]').val();
            
            // Validate email
            if (!this.isValidEmail(email)) {
                this.showMessage($message, smaEmail.i18n.invalidEmail, 'error');
                return;
            }
            
            // Disable button
            $button.prop('disabled', true).text(smaEmail.i18n.subscribing);
            
            // Submit
            $.ajax({
                url: smaEmail.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'sma_subscribe',
                    nonce: nonce,
                    email: email,
                    name: name,
                    list_id: listId,
                    source: this.getFormSource($form)
                },
                success: function(response) {
                    if (response.success) {
                        SMAEmail.showMessage($message, smaEmail.i18n.success, 'success');
                        $form[0].reset();
                        
                        // Hide popup/slidein after success
                        setTimeout(function() {
                            $('#sma-popup-overlay').fadeOut();
                            $('#sma-slidein').fadeOut();
                        }, 2000);
                        
                        // Set cookie to prevent showing again
                        SMAEmail.setCookie('sma_subscribed', '1', 365);
                    } else {
                        SMAEmail.showMessage($message, response.data || smaEmail.i18n.error, 'error');
                    }
                },
                error: function() {
                    SMAEmail.showMessage($message, smaEmail.i18n.error, 'error');
                },
                complete: function() {
                    $button.prop('disabled', false).text(originalText);
                }
            });
        },
        
        /**
         * Get form source identifier
         */
        getFormSource: function($form) {
            if ($form.closest('.sma-popup').length) return 'popup';
            if ($form.closest('.sma-slidein').length) return 'slidein';
            return 'form';
        },
        
        /**
         * Initialize popup
         */
        initPopup: function() {
            if (!smaEmail.settings.popupEnabled) return;
            if (this.getCookie('sma_subscribed')) return;
            if (this.getCookie('sma_popup_dismissed')) return;
            
            var trigger = smaEmail.settings.popupTrigger;
            var delay = parseInt(smaEmail.settings.popupDelay) || 5;
            
            switch (trigger) {
                case 'time':
                    setTimeout(function() {
                        SMAEmail.showPopup();
                    }, delay * 1000);
                    break;
                    
                case 'scroll':
                    $(window).on('scroll.smaPopup', function() {
                        var scrollPercent = ($(window).scrollTop() / ($(document).height() - $(window).height())) * 100;
                        if (scrollPercent >= delay) {
                            SMAEmail.showPopup();
                            $(window).off('scroll.smaPopup');
                        }
                    });
                    break;
                    
                case 'exit':
                    $(document).on('mouseleave.smaPopup', function(e) {
                        if (e.clientY < 10) {
                            SMAEmail.showPopup();
                            $(document).off('mouseleave.smaPopup');
                        }
                    });
                    break;
            }
            
            // Close handlers
            $(document).on('click', '.sma-popup__close', function() {
                SMAEmail.hidePopup();
            });
            
            $(document).on('click', '.sma-popup-overlay', function(e) {
                if ($(e.target).hasClass('sma-popup-overlay')) {
                    SMAEmail.hidePopup();
                }
            });
            
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape') {
                    SMAEmail.hidePopup();
                }
            });
        },
        
        /**
         * Show popup
         */
        showPopup: function() {
            $('#sma-popup-overlay').fadeIn();
        },
        
        /**
         * Hide popup
         */
        hidePopup: function() {
            $('#sma-popup-overlay').fadeOut();
            this.setCookie('sma_popup_dismissed', '1', 7); // Don't show for 7 days
        },
        
        /**
         * Initialize slide-in
         */
        initSlideIn: function() {
            if (!smaEmail.settings.slideInEnabled) return;
            if (this.getCookie('sma_subscribed')) return;
            if (this.getCookie('sma_slidein_dismissed')) return;
            
            // Show after scrolling 50%
            $(window).on('scroll.smaSlideIn', function() {
                var scrollPercent = ($(window).scrollTop() / ($(document).height() - $(window).height())) * 100;
                if (scrollPercent >= 50) {
                    $('#sma-slidein').fadeIn();
                    $(window).off('scroll.smaSlideIn');
                }
            });
            
            // Close handler
            $(document).on('click', '.sma-slidein__close', function() {
                $('#sma-slidein').fadeOut();
                SMAEmail.setCookie('sma_slidein_dismissed', '1', 7);
            });
        },
        
        /**
         * Show message
         */
        showMessage: function($element, message, type) {
            $element
                .removeClass('sma-email-form__message--success sma-email-form__message--error')
                .addClass('sma-email-form__message--' + type)
                .text(message)
                .fadeIn();
        },
        
        /**
         * Validate email
         */
        isValidEmail: function(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        /**
         * Set cookie
         */
        setCookie: function(name, value, days) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + value + expires + '; path=/';
        },
        
        /**
         * Get cookie
         */
        getCookie: function(name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    };
    
    $(document).ready(function() {
        SMAEmail.init();
    });
    
})(jQuery);
