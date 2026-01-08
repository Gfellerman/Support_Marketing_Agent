/**
 * Onboarding Wizard JavaScript
 * @package Support_Marketing_Agent
 */

(function($) {
    'use strict';

    const SMA_Onboarding = {
        currentStep: 1,
        totalSteps: 5,
        data: {},

        init: function() {
            this.bindEvents();
            this.updateProgress();
        },

        bindEvents: function() {
            $(document).on('click', '.sma-btn-next', this.nextStep.bind(this));
            $(document).on('click', '.sma-btn-prev', this.prevStep.bind(this));
            $(document).on('click', '.sma-btn-skip', this.skipOnboarding.bind(this));
            $(document).on('click', '.sma-btn-complete', this.completeOnboarding.bind(this));
            $(document).on('click', '.sma-color-option', this.selectColor.bind(this));
            $(document).on('click', '.sma-test-connection', this.testConnection.bind(this));
        },

        nextStep: function(e) {
            e.preventDefault();

            // Save current step data
            this.saveStepData();

            if (this.currentStep < this.totalSteps) {
                this.goToStep(this.currentStep + 1);
            }
        },

        prevStep: function(e) {
            e.preventDefault();

            if (this.currentStep > 1) {
                this.goToStep(this.currentStep - 1);
            }
        },

        goToStep: function(step) {
            // Hide current step
            $('.sma-step').removeClass('active');

            // Show new step
            this.currentStep = step;
            $('.sma-step[data-step="' + step + '"]').addClass('active');

            this.updateProgress();
            this.updateButtons();
        },

        updateProgress: function() {
            $('.sma-progress-step').each((index, el) => {
                const stepNum = index + 1;
                $(el).removeClass('active completed');

                if (stepNum < this.currentStep) {
                    $(el).addClass('completed');
                } else if (stepNum === this.currentStep) {
                    $(el).addClass('active');
                }
            });
        },

        updateButtons: function() {
            const $prev = $('.sma-btn-prev');
            const $next = $('.sma-btn-next');
            const $complete = $('.sma-btn-complete');

            $prev.toggle(this.currentStep > 1);
            $next.toggle(this.currentStep < this.totalSteps);
            $complete.toggle(this.currentStep === this.totalSteps);
        },

        saveStepData: function() {
            const $step = $('.sma-step[data-step="' + this.currentStep + '"]');
            const stepName = $step.data('name');
            const data = {};

            // Collect form data
            $step.find('input, select').each(function() {
                const $input = $(this);
                const name = $input.attr('name');

                if (!name) return;

                if ($input.attr('type') === 'checkbox') {
                    data[name] = $input.is(':checked') ? '1' : '';
                } else {
                    data[name] = $input.val();
                }
            });

            // Save via AJAX
            $.ajax({
                url: smaOnboarding.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'sma_save_onboarding_step',
                    nonce: smaOnboarding.nonce,
                    step: stepName,
                    data: data
                }
            });

            this.data[stepName] = data;
        },

        selectColor: function(e) {
            const $option = $(e.currentTarget);
            const color = $option.data('color');

            $option.siblings().removeClass('active');
            $option.addClass('active');
            $option.siblings('input[name="color"]').val(color);
        },

        testConnection: function(e) {
            e.preventDefault();

            const $btn = $(e.currentTarget);
            const $apiKey = $('input[name="api_key"]');
            const $status = $('.sma-connection-status');

            $btn.prop('disabled', true).text(smaOnboarding.strings.testing);

            $.ajax({
                url: smaOnboarding.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'sma_save_onboarding_step',
                    nonce: smaOnboarding.nonce,
                    step: 'api_key',
                    data: { api_key: $apiKey.val() }
                }
            }).done(function(response) {
                if (response.success) {
                    $status.html('<span class="success">✓ ' + smaOnboarding.strings.success + '</span>');
                } else {
                    $status.html('<span class="error">✕ ' + (response.data.message || smaOnboarding.strings.error) + '</span>');
                }
            }).fail(function() {
                $status.html('<span class="error">✕ ' + smaOnboarding.strings.error + '</span>');
            }).always(function() {
                $btn.prop('disabled', false).text('Test Connection');
            });
        },

        skipOnboarding: function(e) {
            e.preventDefault();

            if (!confirm('Are you sure you want to skip the setup wizard? You can configure settings manually later.')) {
                return;
            }

            $.ajax({
                url: smaOnboarding.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'sma_skip_onboarding',
                    nonce: smaOnboarding.nonce
                }
            }).done(function(response) {
                if (response.success && response.data.redirect) {
                    window.location.href = response.data.redirect;
                }
            });
        },

        completeOnboarding: function(e) {
            e.preventDefault();

            const $btn = $(e.currentTarget);
            $btn.prop('disabled', true).text(smaOnboarding.strings.saving);

            $.ajax({
                url: smaOnboarding.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'sma_complete_onboarding',
                    nonce: smaOnboarding.nonce
                }
            }).done(function(response) {
                if (response.success && response.data.redirect) {
                    window.location.href = response.data.redirect;
                }
            }).always(function() {
                $btn.prop('disabled', false).text('Go to Dashboard');
            });
        }
    };

    $(document).ready(function() {
        SMA_Onboarding.init();
    });

})(jQuery);
