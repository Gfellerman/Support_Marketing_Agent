/**
 * Support Marketing Agent - Admin JavaScript
 * @package Support_Marketing_Agent
 */

jQuery(document).ready(function($) {
    'use strict';

    // Toggle API key visibility
    $('#sma-toggle-key').on('click', function() {
        var input = $('#sma_api_key');
        var btn = $(this);
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            btn.text(smaAdmin.strings.hide || 'Hide');
        } else {
            input.attr('type', 'password');
            btn.text(smaAdmin.strings.show || 'Show');
        }
    });

    // Test connection
    $('#sma-test-connection').on('click', function() {
        var btn = $(this);
        var status = $('#sma-connection-status');
        
        btn.prop('disabled', true);
        status.removeClass('success error').text(smaAdmin.strings.testing);

        $.ajax({
            url: smaAdmin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'sma_test_connection',
                nonce: smaAdmin.nonce
            },
            success: function(response) {
                if (response.success) {
                    status.addClass('success').text(response.data || smaAdmin.strings.connected);
                } else {
                    status.addClass('error').text(response.data || smaAdmin.strings.failed);
                }
            },
            error: function() {
                status.addClass('error').text(smaAdmin.strings.failed);
            },
            complete: function() {
                btn.prop('disabled', false);
            }
        });
    });
});
