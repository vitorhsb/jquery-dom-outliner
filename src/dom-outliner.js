/*
 * dom-outliner
 *
 *
 * Copyright (c) 2014 Vitor Barbosa
 * Licensed under the MIT license.
 */

(function ($) {
    var initialized = false,
        active = false,
        options = {},
        namespace = 'dom-outliner',
        selectedClass = namespace + '-selected',
        labelClass = namespace + '-label',
        labelSelectedClass = labelClass + '-selected',
        glassClass = namespace + '-glass',
        transparentClass = namespace + '-transparent-glass',
        glasses = {},
        helpers = {},
        currentSelection = null;


    var utils = (function(){
        var $window = $(),
            $document = $(),
            $body = $();

        return {
            getWindow : function() {
                return $window.length ? $window : ($window = $(window));
            },
            getDocument : function() {
                return $document.length ? $document : ($document = $(document));
            },
            getBody : function() {
                return $body.length ? $body : ($body = $('body'));
            }
        };
    })();

    function initialize() {
        createHelpers();
        createGlassElements();
        initStylesheet();
    }

    function destroy() {
        removeHelpers();
        removeGlassElements();
    }

    function writeCSS(css) {
        var el = document.createElement('style');
        el.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(el);

        if (el.styleSheet) {
            el.styleSheet.cssText = css; // IE
        } else {
            el.innerHTML = css; // Non-IE
        }
    }

    function initStylesheet() {
        var css = '.' + namespace + ' {' +
                'outline: ' + options.outlineWidth + 'px ' +
                    options.outlineStyle + ' ' + options.outlineColor + ';' +
            '}' +
            '.' + labelClass + ' {' +
                'background: ' + options.outlineColor + ';' +
                'color: #fff;' +
                'font: bold 12px/12px Helvetica, Arial, sans-serif;' +
                'padding: 5px;' +
                'margin: 0;' +
                'position: absolute;' +
                'z-index: 1000001;' +
            '}' +
            '.' + selectedClass + ' {' +
                'outline: ' + options.outlineWidth + 'px ' +
                    options.outlineStyle + ' ' + options.outlineSelectedColor + ';' +
            '}' +
            '.' + labelSelectedClass + ' {' +
                'background: ' + options.outlineSelectedColor + ';' +
                'z-index: 2000002;' +
            '}' +
            '.' + glassClass + ' {' +
                'opacity: 0.8 !important;' +
                '-moz-opacity: 0.8 !important;' +
                'filter: alpha(opacity=0.8) !important;' +
                '-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=($value*100))" !important;' +
                'background: #F4F5F6;' +
                'position: absolute;' +
                'top: 0;' +
                'left: 0;' +
                'z-index: 2000001;' +
                'min-height: 0 !important;' +
                'min-width: 0 !important;' +
            '}'+
            '.' + transparentClass + ' {' +
                'background: rgba(0, 0, 0, 0);' +
                'opacity: 1.0 !important;' +
                '-moz-opacity: 1 !important;' +
                'filter: alpha(opacity=1) !important;' +
                '-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=($value*100))" !important;' +
            '}';

        writeCSS(css);
    }

    function createHelpers() {
        helpers = {
            label: $('<div></div>').addClass(namespace + '-label').appendTo(utils.getBody())
        };
    }

    function removeHelpers() {
        $.each(helpers, function(name, $el) {
            $el.remove();

        });
        helpers = {};
    }

    function createGlassElements() {
        glasses = {
            center : $('<div id="' + glassClass + '-center" class="' + glassClass + ' ' + transparentClass + '"/></div>')
                .appendTo(utils.getBody()),
            top : $('<div id="' + glassClass + '-top" class="' + glassClass + '"/></div>').appendTo(utils.getBody()),
            right : $('<div id="' + glassClass + '-right" class="' + glassClass + '"/></div>').appendTo(utils.getBody()),
            bottom : $('<div id="' + glassClass + '-bottom" class="' + glassClass + '"/></div>').appendTo(utils.getBody()),
            left : $('<div id="' + glassClass + '-left" class="' + glassClass + '"/></div>').appendTo(utils.getBody())
        };

        $.each(glasses, function(pos, $el){
            $el.on('click.' + namespace, function(){
                cancelSelection($(currentSelection));
            });
        });
    }

    function removeGlassElements() {
        $.each(glasses, function(pos, $el){
            $el.off('click.' + namespace).remove();
        });
        glasses = {};
    }



    function setSelection($el) {
        var $doc = utils.getDocument(),
            docHeight = $doc.height(),
            docWidth = $doc.width();

        $el.each(function(){
            $(this).addClass(selectedClass);
        });

        if(options.showGlasses) {
            try {
                var offset = $el.offset(),
                    height = $el.outerHeight(),
                    width = $el.outerWidth();

                glasses.center.css({
                    top: offset.top-options.outlineWidth,
                    left: offset.left-options.outlineWidth,
                    height: height + ( 2 * options.outlineWidth),
                    width: width + ( 2 * options.outlineWidth)
                }).show();

                glasses.top.css({
                    top: 0,
                    left: 0,
                    height: offset.top - options.outlineWidth,
                    width: docWidth
                }).show();

                glasses.right.css({
                    top: offset.top - options.outlineWidth,
                    left: offset.left + width + options.outlineWidth,
                    height: height + ( 2 * options.outlineWidth),
                    width: (docWidth-offset.left-width) - options.outlineWidth
                }).show();

                glasses.bottom.css({
                    top: (offset.top + height + options.outlineWidth),
                    left: 0,
                    height: (docHeight - offset.top - height - options.outlineWidth),
                    width: docWidth
                }).show();

                glasses.left.css({
                    top: offset.top - options.outlineWidth,
                    left: 0,
                    height: height + ( 2 * options.outlineWidth),
                    width: offset.left - options.outlineWidth
                }).show();

            } catch (err) {
            } finally {}
        }

        if(options.showLabel) {
            helpers.label.addClass(labelSelectedClass);
        }
    }

    function unsetSelection($el) {
        $el.removeClass(selectedClass).removeClass(namespace).off('.' + namespace);
        helpers.label.removeClass(labelSelectedClass).hide();
    }

    function onSelection($el) {
        currentSelection = $el;
        setSelection($el);

        if ($.isFunction(options.onSelection)) {
            options.onSelection($el.get(0));
        }
    }

    function cancelSelection() {
        if(currentSelection) {
            $.each(glasses, function(dir, $el) {
                $el.hide();
            });

            unsetSelection($(currentSelection));

            if (active && $.isFunction(options.onCancel)) {
                options.onCancel(currentSelection);
            }

            currentSelection = null;
        }
    }

    function shouldIgnore($el) {
        var ignore = false;

        if(options.filter) {
            ignore = true;

            $.each(options.filter, function(i, exp) {
                ignore = ignore && !$el.is(exp);
            });
        }

        if(!ignore && options.exclude) {
            $.each(options.exclude, function(i, exp) {
                ignore = ignore || $el.is(exp);
                // break cicle on ignore
                return ignore ? false : true;
            });
        }

        // Prevent from losing focus on selected element
        if (!ignore && currentSelection) {
            if($el.filter(':outliner').length) {
                ignore = true;
            }
        }

        if (!ignore && options.excludeClosest && $el.closest(options.excludeClosest).length) {
            ignore = true;
        }

        return ignore;
    }

    function getElementLabel($el) {
        var el = $el.get(0),
            label = el.tagName.toLowerCase(),
            className = el.className;

        className = className.replace(selectedClass, '');
        className = className.replace(namespace, '');

        label += el.id ? '#' + el.id : '';
        if (className) {
            label += ('.' + $.trim(className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        return label + ' (' + Math.round($el.width()) + 'x' + Math.round($el.height()) + ')';
    }

    function updateOutlinePosition($el) {
        var label = '',
            offset = $el.offset();

        $el.toggleClass(namespace);

        if(options.showLabel) {
            label = getElementLabel($el);
            helpers.label.html(label).show().css({
                top: Math.max(0, offset.top - options.outlineWidth - helpers.label.outerHeight()),
                left: Math.max(0, offset.left - options.outlineWidth)
            });

            if (!$el.hasClass(namespace)) {
                helpers.label.hide();
            }
        }
    }

    function updateSelection($el) {
        return currentSelection ? cancelSelection() : onSelection($el);
    }


    /**
     * CONTROL METHODS
     */
    function start() {
        var $base;

        options.base = options.base || $('body');
        $base = $(options.base);

        if (!initialized) {
            initialize();
        }

        initialized = true;
        active = true;

        if($base.length) {
            $base
                .off('.' + namespace)
                .on('mouseover.' + namespace + ' mouseout.' + namespace + ' click.' + namespace, function(e) {
                    var $tgt = $(e.target);

                    if(shouldIgnore($tgt)) {
                        return;
                    }

                    if (e.type === 'click') {
                        updateSelection($tgt);
                    } else {
                        updateOutlinePosition($tgt);
                    }
                });
        }

    }

    function stop() {
        var $base = options.$base || $();

        active = false;
        cancelSelection();
        destroy();

        if($base.length) {
            $base.off('.' + namespace);
        }
    }

    // Collection method.
    $.fn.outliner = function (opt) {
        // Override default options with passed-in options.
        options = $.extend({}, $.outliner.options, options, opt);
        start();

        cancelSelection();
        return this.each(function() {
            var $this = $(this).addClass(namespace);
            onSelection($this);
        });
    };

    // Static method.
    $.outliner = function (opt) {
        if(opt && typeof opt === 'string') {
            switch(opt) {
                case 'stop':
                    stop();
                    break;
                default: break;
            }

            return;
        }

        // Override default options with passed-in options.
        options = $.extend({}, $.outliner.options, options, opt);

        start();

        return this;
    };

    // Static method default options.
    options = $.outliner.options = {
        base: null,
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: '#c00',
        outlineSelectedColor: 'blue',
        showGlasses: true,
        showLabel: true,
        stopOnSelection: false,
        onSelection: null,
        onCancel: null,
        filter: null,
        exclude: ['.' + namespace + '-glass', '.' + namespace + '-label'],
        excludeClosest: null
    };

    // Custom selector.
    $.expr[':'].outliner = function (elem) {
        // Is this element outlined
        return $(elem).hasClass(namespace) || $(elem).hasClass(selectedClass);
    };

}(jQuery));
