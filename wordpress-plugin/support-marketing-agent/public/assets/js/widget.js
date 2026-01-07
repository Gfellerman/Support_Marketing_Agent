/**
 * Support Marketing Agent - Public JavaScript
 * @package Support_Marketing_Agent
 */

(function() {
    'use strict';

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initChatWidget();
        initTicketForm();
        initStatusChecker();
    }

    /**
     * Chat Widget
     */
    function initChatWidget() {
        const widget = document.getElementById('sma-chat-widget');
        if (!widget) return;

        const toggle = widget.querySelector('.sma-chat-toggle');
        const minimize = widget.querySelector('.sma-chat-minimize');
        const prechatForm = widget.querySelector('.sma-prechat-form form');
        const messageForm = widget.querySelector('.sma-message-form');
        const messagesContainer = widget.querySelector('.sma-chat-messages');
        const chatInput = widget.querySelector('.sma-chat-input');

        // Toggle chat window
        toggle.addEventListener('click', () => {
            widget.classList.toggle('sma-open');
        });

        minimize.addEventListener('click', () => {
            widget.classList.remove('sma-open');
        });

        // Pre-chat form submission
        if (prechatForm) {
            prechatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = prechatForm.querySelector('input[name="name"]').value;
                const email = prechatForm.querySelector('input[name="email"]').value;

                if (name && email) {
                    // Store user info
                    widget.dataset.userName = name;
                    widget.dataset.userEmail = email;

                    // Update message form hidden fields
                    if (messageForm) {
                        const nameInput = messageForm.querySelector('input[name="name"]');
                        const emailInput = messageForm.querySelector('input[name="email"]');
                        if (nameInput) nameInput.value = name;
                        if (emailInput) emailInput.value = email;
                    }

                    // Show chat input, hide pre-chat form
                    prechatForm.parentElement.style.display = 'none';
                    chatInput.style.display = 'block';

                    // Add welcome message
                    addMessage('Thanks, ' + name + '! How can we help you today?', 'bot');
                }
            });
        }

        // Message submission
        if (messageForm) {
            messageForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const input = messageForm.querySelector('input[name="message"]');
                const message = input.value.trim();
                if (!message) return;

                // Add user message to chat
                addMessage(message, 'user');
                input.value = '';

                // Submit to API
                try {
                    const formData = new FormData(messageForm);
                    formData.append('subject', 'Chat from website');
                    
                    const response = await fetch(smaPublic.apiUrl + 'tickets', {
                        method: 'POST',
                        body: new URLSearchParams(formData),
                        headers: {
                            'X-WP-Nonce': smaPublic.nonce
                        }
                    });

                    const data = await response.json();

                    if (data.success) {
                        addMessage('Thanks for your message! We\'ll get back to you soon. Your ticket ID is #' + (data.ticket_id || 'pending'), 'bot');
                    } else {
                        addMessage(data.message || smaPublic.strings.error, 'bot');
                    }
                } catch (error) {
                    addMessage(smaPublic.strings.error, 'bot');
                }
            });
        }

        function addMessage(text, type) {
            const msg = document.createElement('div');
            msg.className = 'sma-message sma-message-' + type;
            msg.innerHTML = '<p>' + escapeHtml(text) + '</p>';
            messagesContainer.appendChild(msg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    /**
     * Ticket Form
     */
    function initTicketForm() {
        const forms = document.querySelectorAll('.sma-ticket-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const btn = form.querySelector('button[type="submit"]');
                const btnText = btn.querySelector('.sma-btn-text');
                const btnLoading = btn.querySelector('.sma-btn-loading');
                const messagesDiv = form.querySelector('.sma-form-messages');
                
                // Show loading state
                btn.disabled = true;
                btnText.style.display = 'none';
                btnLoading.style.display = 'inline';
                messagesDiv.style.display = 'none';
                messagesDiv.className = 'sma-form-messages';

                try {
                    const formData = new FormData(form);
                    
                    const response = await fetch(smaPublic.apiUrl + 'tickets', {
                        method: 'POST',
                        body: new URLSearchParams(formData),
                        headers: {
                            'X-WP-Nonce': smaPublic.nonce
                        }
                    });

                    const data = await response.json();

                    messagesDiv.textContent = data.message || (data.success ? 'Submitted!' : 'Error');
                    messagesDiv.classList.add(data.success ? 'sma-success' : 'sma-error');
                    messagesDiv.style.display = 'block';

                    if (data.success) {
                        form.reset();
                    }
                } catch (error) {
                    messagesDiv.textContent = smaPublic.strings.error;
                    messagesDiv.classList.add('sma-error');
                    messagesDiv.style.display = 'block';
                } finally {
                    btn.disabled = false;
                    btnText.style.display = 'inline';
                    btnLoading.style.display = 'none';
                }
            });
        });
    }

    /**
     * Ticket Status Checker
     */
    function initStatusChecker() {
        const forms = document.querySelectorAll('.sma-status-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const resultDiv = form.parentElement.querySelector('.sma-status-result');
                const formData = new FormData(form);

                try {
                    const response = await fetch(smaPublic.apiUrl + 'tickets/status', {
                        method: 'POST',
                        body: new URLSearchParams(formData),
                        headers: {
                            'X-WP-Nonce': smaPublic.nonce
                        }
                    });

                    const data = await response.json();

                    if (data.success && data.ticket) {
                        resultDiv.innerHTML = `
                            <strong>Ticket #${escapeHtml(data.ticket.id)}</strong><br>
                            Subject: ${escapeHtml(data.ticket.subject)}<br>
                            Status: <span class="sma-badge sma-badge-${escapeHtml(data.ticket.status)}">${escapeHtml(data.ticket.status)}</span>
                        `;
                    } else {
                        resultDiv.innerHTML = '<span class="sma-error">' + escapeHtml(data.message) + '</span>';
                    }
                    resultDiv.style.display = 'block';
                } catch (error) {
                    resultDiv.innerHTML = '<span class="sma-error">' + smaPublic.strings.error + '</span>';
                    resultDiv.style.display = 'block';
                }
            });
        });
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
