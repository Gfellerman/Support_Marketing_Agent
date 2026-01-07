/**
 * Email Capture Gutenberg Block
 * 
 * @package Support_Marketing_Agent
 */

(function(blocks, element, blockEditor, components) {
    var el = element.createElement;
    var useBlockProps = blockEditor.useBlockProps;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var ToggleControl = components.ToggleControl;
    var SelectControl = components.SelectControl;
    
    blocks.registerBlockType('sma/email-capture', {
        title: 'Email Capture Form',
        icon: 'email',
        category: 'widgets',
        attributes: {
            title: {
                type: 'string',
                default: 'Subscribe to our newsletter'
            },
            description: {
                type: 'string',
                default: 'Get the latest updates and offers.'
            },
            buttonText: {
                type: 'string',
                default: 'Subscribe'
            },
            showName: {
                type: 'boolean',
                default: true
            },
            listId: {
                type: 'string',
                default: ''
            },
            style: {
                type: 'string',
                default: 'inline'
            }
        },
        
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps();
            
            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Form Settings', initialOpen: true },
                        el(TextControl, {
                            label: 'Title',
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        }),
                        el(TextControl, {
                            label: 'Description',
                            value: attributes.description,
                            onChange: function(value) {
                                setAttributes({ description: value });
                            }
                        }),
                        el(TextControl, {
                            label: 'Button Text',
                            value: attributes.buttonText,
                            onChange: function(value) {
                                setAttributes({ buttonText: value });
                            }
                        }),
                        el(ToggleControl, {
                            label: 'Show Name Field',
                            checked: attributes.showName,
                            onChange: function(value) {
                                setAttributes({ showName: value });
                            }
                        }),
                        el(SelectControl, {
                            label: 'Style',
                            value: attributes.style,
                            options: [
                                { label: 'Inline', value: 'inline' },
                                { label: 'Boxed', value: 'boxed' },
                                { label: 'Minimal', value: 'minimal' }
                            ],
                            onChange: function(value) {
                                setAttributes({ style: value });
                            }
                        }),
                        el(TextControl, {
                            label: 'List ID (optional)',
                            value: attributes.listId,
                            onChange: function(value) {
                                setAttributes({ listId: value });
                            }
                        })
                    )
                ),
                
                // Preview
                el('div', { className: 'sma-email-form sma-email-form--' + attributes.style },
                    attributes.title && el('h3', { className: 'sma-email-form__title' }, attributes.title),
                    attributes.description && el('p', { className: 'sma-email-form__description' }, attributes.description),
                    el('div', { className: 'sma-email-form__form', style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
                        attributes.showName && el('input', {
                            type: 'text',
                            placeholder: 'Your name',
                            className: 'sma-email-form__input',
                            style: { flex: '1 1 100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }
                        }),
                        el('input', {
                            type: 'email',
                            placeholder: 'Your email',
                            className: 'sma-email-form__input',
                            style: { flex: '1', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }
                        }),
                        el('button', {
                            type: 'button',
                            className: 'sma-email-form__button',
                            style: { padding: '10px 20px', background: '#0073aa', color: '#fff', border: 'none', borderRadius: '4px' }
                        }, attributes.buttonText)
                    )
                )
            );
        },
        
        save: function() {
            // Rendered via PHP
            return null;
        }
    });
    
})(window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components);
