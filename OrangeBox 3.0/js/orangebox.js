/*
 * version: 3.0.0
 * package: OrangeBox
 * author: David Paul Hamilton - http://davidpaulhamilton.net/orangebox
 * copyright: Copyright (c) 2012 David Hamilton / DavidPaulHamilton.net All rights reserved.
 * license: GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
if (typeof oB !== 'undefined') {
    console.log('OrangeBox: Variable "oB", used by OrangeBox, is already defined');
} else {
    var oB;
    (function ($) {
        oB = {
            gallery: [],
            settings: {
                autoplay: false,
                searchTerm: 'lightbox',
                fadeControls: false,
                keyboardNavigation: true,
                orangeControls: false,
                showClose: true,
                showDots: false,
                showNav: true,
                addThis: true,
                addThisServices: 'twitter,facebook,digg,delicious,more',
                notFound: 'Not Found',
                overlayOpacity: 0.95,
                contentBorderWidth: 4,
                contentRoundedBorder: true,
                contentMinSize: [100, 200],
                contentMaxSize: [0.75, 0.75],
                videoAspect: [390, 640],
                fadeTime: 200,
                slideshowTimer: 3000,
                streamItems: 10,
                logging: false,
                checkAlias: true
            },
            methods: {
                init: function (o) {
                    function checkURL(searchTerm) {
                        if (oB.ourl.match(/#\..{1,}\.facebook/)) {
                            oB.ourl = oB.ourl.substr(0, oB.ourl.search(/#\..{1,}\.facebook/));
                        }
                        if (oB.ourl.match(/^#\w{1,}$/) && $('#' + oB.ourl).length > 0) {
                            oB.methods.create($('#' + oB.ourl));
                        } else {
                            $(searchTerm).each(function () {
                                var href = $(this).attr('href');
                                href = href.replace(/\//gi,'').replace(/\./gi,'').replace(/:/gi,'').replace(/\?/gi,'').replace(/&/gi,'').replace(/\=/gi,'').replace(/#/gi,'');

                                if (href.indexOf(oB.ourl) !== -1) {
                                    oB.methods.create($(this));
                                    return false;
                                }
                            });
                        }
                    }
                    if (!$('#ob_content').length) {
                        if (o) {
                            $.extend(oB.settings, o);
                        }
                        var searchTerm = 'a[data-ob*=lightbox], area[data-ob*=lightbox], a[rel*=lightbox], area[rel*=lightbox]';
                        if(oB.settings.searchTerm !== "") {
                            searchTerm = 'a[data-ob*='+oB.settings.searchTerm+'], area[data-ob*='+oB.settings.searchTerm+'], a[rel*='+oB.settings.searchTerm+'], area[rel*='+oB.settings.searchTerm+']';
                        }
                        oB.windowURL = window.location.href;
                        if (oB.windowURL.match(/(&|\?)orangebox=/)) {
                            oB.windowURL = oB.windowURL.substr(0, oB.windowURL.search(/(&|\?)orangebox=/));
                        }
                        oB.ourl = oB.methods.getUrlVars()['orangebox'];
                        try {
                            document.createEvent("TouchEvent");
                            oB.touch = true;
                            oB.methods.logit('Touch device detected', true);
                        } catch (e) {
                            oB.touch = false;
                            oB.methods.logit('Touch device not detected', true);
                        }
                        if (oB.settings.orangeControls === true && !$().orangeControls) {
                            oB.methods.logit('Connection with OrangeControls failed');
                            oB.settings.orangeControls = false;
                        }
                        oB.browser = $.browser;

                        if (oB.settings.addThis) {
                            $.getScript('http://s7.addthis.com/js/250/addthis_widget.js#pubid=ra-4dd42f2b5b9fc332', function () {
                                if (oB.ourl) {
                                    checkURL(searchTerm);
                                }
                            });
                        } else if (oB.ourl) {
                            checkURL(searchTerm);
                        }
                        return this.each(function () {
                            oB.methods.setupData($(this));
                        });
                    }
                    return false;
                },
                setupData: function (o) {
                    var u = o.attr('href'), c = false, s = [0, 0], i = 0, t = "", g = false, rel = o.attr('data-ob'), id, alias = false, unique = true, cap = o.attr('data-ob_caption');
                    if(!rel || rel === "") {
                        rel = o.attr('rel');
                        o.attr('data-ob', rel);
                    }
                    if (rel && rel.match(/\[/)) {
                        g = rel.substring(rel.indexOf("[") + 1, rel.indexOf("]")).replace(/ /g, "_");
                        $.each(oB.gallery, function() {
                            if (this.name === g) {
                                unique = false;
                                if (oB.settings.checkAlias) {
                                    $.each(this.objects, function() {
                                        if (this.data('oB') && this.data('oB').href === o.attr('href')) {
                                            oB.methods.logit('Object already added: ' + u, true);
                                            alias = this;
                                        }
                                    });
                                }
                            }
                        });
                        if (unique) {
                            oB.gallery.push({name: g, objects: []});
                        }
                    }
                    if (oB.settings.checkAlias && (o.data('oB') || alias)) {
                        oB.methods.logit('Object already added: ' + u, true);
                        o.click(function (e) {
                            e.preventDefault();
                            oB.methods.create(alias);
                        });
                    } else if (u) {
                        if (typeof o.attr('title') !== "undefined") {
                            t = o.attr('title');
                        }
                        if (typeof o.attr('data-ob_height') !== 'undefined') {
                            s[0] = parseInt(o.attr('data-ob_height'), 10);
                        }
                        if (typeof o.attr('data-ob_width') !== 'undefined') {
                            s[1] = parseInt(o.attr('data-ob_width'), 10);
                        }
                        if (typeof o.attr('data-ob_iframe') !== 'undefined' && o.attr('data-ob_iframe') === "true") {
                            c = "iframe";
                        } else if (u.match(/\.(?:jpg|jpeg|bmp|png|gif)/i)) {
                            c = "image";
                        } else if (u.match(/\.pdf/i)) {
                            c = "pdf";
                        } else if (u.match(/\.swf/i)) {
                            c = "flash";
                        } else if (u.match(/^http:\/\/api\.flickr\.com\/services\/feeds\/.{1,}\.gne\?id=\d{1,}@.{1,}&lang=.{1,}&format=rss_200/i)) {
                            c = "flickr";
                            u = u.replace('rss_200', 'json') + "&jsoncallback=?";
                            if (!rel.match(/\[/)) {
                                g = 'flickr' + newDate.getTime();
                            }
                            $.getJSON(u, function (data) {
                                $.each(data.items, function (index, item) {
                                    var item_href = item.media.m.replace('_m.jpg', '.jpg'), delay = "";
                                    if(typeof o.attr('data-ob_delayTimer') !== "undefined" && o.attr('data-ob_delayTimer') !== "0") {
                                        delay = 'data-ob_delayTimer="' + o.attr('data-ob_delayTimer') + '"';
                                    }
                                    if (index === 0) {
                                        o.attr({
                                            href: item_href,
                                            "data-ob_share": "false",
                                            caption: cap,
                                            title: item.title
                                        });
                                        oB.methods.setupData(o);
                                    } else if (index < oB.settings.streamItems) {
                                        oB.methods.setupData($('<a href="' + item_href + '" data-ob_linkText="' + o.attr('data-ob_linkText') + '" data-ob_link="' + o.attr('data-ob_link') + '" data-ob_linkTarget="' + o.attr('data-ob_linkTarget') + '" ' + delay + ' data-ob_share="false" title="' + item.title + '" data-ob="lightbox[' + g + ']"></a>'));
                                    } else {
                                        return false;
                                    }
                                });
                            });
                        } else if (u.match(/^https:\/\/picasaweb\.google\.com\/data\/feed\/base\//i)) {
                            c = "picasa";
                            u = u.replace('/base/', '/api/').replace('alt=rss', 'alt=json-in-script') + '&max-results=' + oB.settings.streamItems + '&callback=?';
                            if (!rel.match(/\[/)) {
                                g = 'picasa' + newDate.getTime();
                            }
                            $.ajax({
                                url: u,
                                dataType: 'json',
                                success: function (data) {
                                    $.each(data.feed.entry, function (index, item) {
                                        var picasaSrc, delay = "";
                                        if(typeof o.attr('data-ob_delayTimer') !== "undefined" && o.attr('data-ob_delayTimer') !== "0") {
                                            delay = 'data-ob_delayTimer="' + o.attr('data-ob_delayTimer') + '"';
                                        }
                                        if (item.content) {
                                            picasaSrc = item.content.src;
                                        } else if (item.media$group.media$content[0]) {
                                            picasaSrc = item.media$group.media$content[0].url;
                                        } else {
                                            return false;
                                        }
                                        if(cap === "") {
                                            cap = item.summary.$t;
                                        }
                                        if (index === 0) {
                                            o.attr({
                                                href: picasaSrc,
                                                "data-ob_share": "false",
                                                "data-ob_caption": cap,
                                                title: item.title.$t
                                            });
                                            oB.methods.setupData(o);
                                        } else if (index < oB.settings.streamItems) {
                                            oB.methods.setupData($('<a href="' + picasaSrc + '" data-ob_caption="' + item.summary.$t + '" data-ob_linkText="' + o.attr('data-ob_linkText') + '" data-ob_link="' + o.attr('data-ob_link') + '" data-ob_linkTarget="' + o.attr('data-ob_linkTarget') + '" ' + delay + ' data-ob_share="false" title="' + item.title.$t + '" data-ob="lightbox[' + g + ']"></a>'));
                                        } else {
                                            return false;
                                        }
                                    });
                                }
                            });
                        } else if (u.match(/^http:\/\/\w{0,3}\.?youtube\.\w{2,3}\/watch\?v=[\w\-]{11}/i)) {
                            id = u.match(/\?v=[\w\-]{11}/)[0].substring(3);
                            c = "youtube";
                        } else if (u.match(/^http:\/\/\w{0,3}\.?youtu\.be\/[\w\-]{11}$/i)) {
                            id = u.match(/youtu\.be\/[\w\-]{11}$/)[0].substring(9);
                            c = "youtube";
                        } else if (u.match(/^http:\/\/\w{0,3}\.?youtube\.\w{2,3}\/embed\/[\w\-]{11}$/i)) {
                            id = u.match(/\/embed\/[\w\-]{11}$/)[0].substring(7);
                            c = "youtube";
                        } else if (u.match(/^http:\/\/\w{0,3}\.?vimeo\.com\/\d{1,10}$/i)) {
                            id = u.match(/vimeo\.com\/\d{1,}/)[0].substring(10);
                            c = "vimeo";
                        } else if (u.match(/^http:\/\/\w{0,3}\.?viddler\.com\/(?:simple|player)\/\w{1,10}$/i)) {
                            id = u.match(/viddler\.com\/(player|simple)\/\w{1,}/)[0].substring(19);
                            c = "viddler";
                        } else if (u.match(/^#\w{1,}$/i)) {
                            c = "inline";
                        } else {
                            oB.methods.logit('Unsupported Media: ' + u);
                        }
                        if (c && c !== "flickr" && c !== "picasa") {
                            $.each(oB.gallery, function() {
                                if (this.name === g) {
                                    i = this.objects.push(o) - 1;
                                }
                            });
                            o.data('oB', {
                                size: s,
                                css: '',
                                gallery: g,
                                index: i,
                                contentType: c,
                                href: u,
                                title: t,
                                linkText: o.attr('data-ob_linkText'),
                                "link": o.attr('data-ob_link'),
                                linkTarget: o.attr('data-ob_linkTarget'),
                                caption: cap,
                                share: o.attr('data-ob_share'),
                                delayTimer: o.attr('data-ob_delayTimer'),
                                id: id
                            }).click(function (e) {
                                    e.preventDefault();
                                    oB.methods.create(o);
                                });
                        }
                    } else {
                        oB.methods.logit('Object has no "href" attribute');
                    }
                },
                create: function (obj, o) {
                    function handleEscape(e) {
                        if (e.keyCode === 27 && oB.progress === null) {
                            oB.methods.destroy();
                        } else if (e.keyCode === 37 && oB.progress === null) {
                            oB.methods.slideshowPause();
                            oB.methods.navigate(-1);
                        } else if (e.keyCode === 39 && oB.progress === null) {
                            oB.methods.slideshowPause();
                            oB.methods.navigate(1);
                        }
                    }
                    if (!$('#ob_content').length) {
                        if (o) {
                            $.extend(oB.settings, o);
                        }
                        if (!obj) {
                            obj = (this instanceof jQuery) ? this : $(this);
                        }
                        if (!obj.data('oB')) {
                            oB.methods.setupData(obj);
                        }
                        if (obj.data('oB').contentType) {
                            //Set Vars
                            oB.currentGallery = [];
                            oB.playing = oB.settings.autoplay;
                            oB.progress = null;
                            oB.docHeight = $(document).height();
                            oB.docWidth = $(document).width();
                            $.each(oB.gallery, function() {
                                if (this.name === obj.data('oB').gallery) {
                                    oB.currentGallery = this.objects;
                                    return false;
                                }
                            });
                            var overlay = $('<div id="ob_overlay"></div>').css({
                                "opacity": oB.settings.overlayOpacity,
                                "height": oB.docHeight,
                                "min-height": oB.docHeight,
                                "min-width": oB.docWidth
                            }), container = $('<div id="ob_container"></div>'), ob_content = $('<div id="ob_content"></div>').click(function (e) {
                                e.stopPropagation();
                            }).css("border-width", oB.settings.contentBorderWidth);
                            if(oB.settings.contentRoundedBorder) {
                                ob_content.css({
                                    "-moz-border-radius": oB.settings.contentBorderWidth,
                                    "border-radius": oB.settings.contentBorderWidth
                                });
                            }
                            if (oB.touch) {
                                container.css("min-width", oB.docWidth);
                            }

                            //Check for addThis
                            if (oB.settings.addThis === true && typeof addthis === 'undefined') {
                                oB.methods.logit('Connection with addThis failed');
                                oB.settings.addThis = false;
                            }

                            //if IE 6
                            if (typeof document.body.style.maxHeight === "undefined") {
                                $("body", "html").css({
                                    height: "100%",
                                    width: "100%"
                                });
                            }

                            //Click to Hide Modal
                            $("body").append(overlay.fadeIn(oB.settings.fadeTime).click(function () {
                                oB.methods.destroy();
                            })).append(container.click(function () {
                                oB.methods.destroy();
                            }));
                            $("#ob_container").append('<div id="ob_float"></div>').append(ob_content);

                            //Listens for Escape
                            if (oB.settings.keyboardNavigation) {
                                $(document).keydown(handleEscape);
                            }

                            //Fire in the Hole
                            oB.methods.showContent(obj, true);
                        }
                    }
                },
                showContent: function (obj, initial) {
                    var href = obj.data('oB').href,
                        title = obj.data('oB').title,
                        contentType = obj.data('oB').contentType,
                        content,
                        ob_caption = '',
                        ob_caption_text = '',
                        tag = href,
                        navRight = $('<a class="ob_nav" id="ob_right"><span class="ob_controls" id="ob_right-ico"></span></a>').click(function (e) {
                            if (oB.progress === null) {
                                oB.methods.slideshowPause();
                                e.stopPropagation();
                                oB.methods.navigate(1);
                            }
                        }),
                        navLeft = $('<a class="ob_nav" id="ob_left"><span class="ob_controls" id="ob_left-ico"></span></a>').click(function (e) {
                            if (oB.progress === null) {
                                oB.methods.slideshowPause();
                                e.stopPropagation();
                                oB.methods.navigate(-1);
                            }
                        }),
                        dotnav = $('<ul id="ob_dots"></ul>').click(function (e) { e.stopPropagation(); }),
                        ob_link;
                    if(obj.data('oB').caption) {
                        ob_caption_text = $.trim(obj.data('oB').caption);
                        if(ob_caption_text !== "") {
                            ob_caption = $('<div id="ob_caption"></div>').click(function (e) {
                                e.stopPropagation();
                            }).append('<p>' + ob_caption_text + '</p>');
                        }
                    }
                    tag = tag.replace(/\//gi,'').replace(/\./gi,'').replace(/:/gi,'').replace(/\?/gi,'').replace(/&/gi,'').replace(/\=/gi,'').replace(/#/gi,'');
                    ob_link = (oB.windowURL.match(/\?/)) ? oB.windowURL + "&orangebox=" + tag : oB.windowURL + "?orangebox=" + tag;
                    oB.currentIndex = obj.data('oB').index;
                    oB.methods.showLoad();
                    $('#ob_content').removeClass().addClass('content' + oB.currentIndex);

                    //Setup Dot Nav
                    if (oB.settings.showDots) {
                        $.each(oB.currentGallery, function (x) {
                            dotnav.append($('<li id="ob_dot' + x + '"></li>').click(function (e) {
                                e.stopPropagation();
                                if (!$(this).hasClass('current') && oB.progress === null) {
                                    oB.methods.slideshowPause();
                                    var x = $(this).attr('id').substr(6);
                                    dotnav.find("li").removeClass('current');
                                    $(this).addClass('current');
                                    oB.methods.navigate("", x);
                                }
                            }));
                        });
                    }

                    //Append Navigation
                    if (oB.currentGallery.length > 1) {
                        if (oB.settings.orangeControls) {
                            $(document).orangeControls();
                        }
                        if (oB.settings.showDots) {
                            $('#ob_content').append(dotnav);
                        }
                    }
                    if (oB.settings.showClose) {
                        $('#ob_content').append($('<div title="close" class="ob_controls ob_cs" id="ob_close"></div>').click(function (e) {
                            e.stopPropagation();
                            oB.methods.destroy();
                        }));
                    }

                    //Update Navigation
                    function setControls() {
                        if (oB.settings.showDots) {
                            $('#ob_dots').find('li').each(function () {
                                var i = 'ob_dot' + obj.data('oB').index;
                                if ($(this).attr('id') === i) {
                                    $(this).addClass('current');
                                } else {
                                    $(this).removeClass('current');
                                }
                            });
                        }
                        if (oB.settings.showNav) {
                            if (oB.currentGallery[oB.currentIndex + 1]) {
                                $('#ob_content').append(navRight);
                            }
                            if (oB.currentGallery[oB.currentIndex - 1]) {
                                $('#ob_content').append(navLeft);
                            }
                        }
                        clearTimeout(oB.controlTimer);
                        if (oB.settings.fadeControls && !oB.touch) {
                            if(!oB.playing || initial) {
                                $('.ob_controls').fadeIn(oB.settings.fadeTime);
                            }
                            else {
                                $('.ob_controls').hide();
                            }
                            oB.controlTimer = setTimeout(function () {
                                $('.ob_controls').fadeOut(oB.settings.fadeTime);
                            }, 1200);
                            $(document).mousemove(function (event) {
                                $('.ob_controls').fadeIn(oB.settings.fadeTime);
                                clearTimeout(oB.controlTimer);
                                oB.controlTimer = setTimeout(function () {
                                    if (!$(event.target).hasClass('ob_controls') && !$(event.target).parent().hasClass('ob_controls')) {
                                        oB.controlTimer = setTimeout(function () {
                                            $('.ob_controls').fadeOut(oB.settings.fadeTime);
                                        }, 1200);
                                    }
                                }, 20);
                            });
                        } else {
                            $('.ob_controls').fadeIn(oB.settings.fadeTime);
                        }
                    }

                    //Set Window Margin
                    function setWindowMargin(w) {
                        var copied_elem = $('<div>' + title + '</div>').css({
                            visibility: "hidden",
                            display: "block",
                            position: "absolute",
                            width: w - 40,
                            "line-height": $('#ob_title').css('line-height'),
                            "font-size": $('#ob_title').css('font-size')
                        });
                        $("body").append(copied_elem);
                        $('#ob_content').css('margin-top', copied_elem.height() + 44);
                        $('#ob_title').css({
                            'margin-top': -copied_elem.height() - oB.settings.contentBorderWidth - 4,
                            'margin-right': -oB.settings.contentBorderWidth
                        });
                        copied_elem.remove();
                    }

                    //Adjust Modal Properties
                    function adjustModalProperties() {
                        var size = [content.outerHeight(), content.outerWidth()], dim;
                        if (obj.data('oB').css[0]) {
                            size[0] = obj.data('oB').css[0];
                        }
                        if (obj.data('oB').css[1]) {
                            size[1] = obj.data('oB').css[1];
                        }
                        if (content.attr('id') !== "ob_error" && size[0] < oB.settings.contentMinSize[0]) {
                            size[0] = oB.settings.contentMinSize[0];
                        }
                        if (size[1] < oB.settings.contentMinSize[1]) {
                            size[1] = oB.settings.contentMinSize[1];
                        }
                        dim = [Math.round(size[0]), Math.round(size[1])];
                        if (contentType !== "error") {
                            setWindowMargin(dim[1]);
                        } else {
                            dim[1] = 250;
                        }
                        $('#ob_float').css({
                            "margin-bottom": -(dim[0] + (oB.settings.contentBorderWidth * 2) + 44) / 2
                        });
                        $('#ob_content').css({
                            "min-height": dim[0],
                            "width": dim[1]
                        });
                    }

                    //Build the Window
                    function buildWindow() {
                        var delayTimer = (obj.data('oB').delayTimer) ? parseInt(obj.data('oB').delayTimer, 10) + parseInt(oB.settings.slideshowTimer, 10) : oB.settings.slideshowTimer,
                            target = 'target="_blank"',
                            addThis = $('<a id="ob_share" class="addthis_button_compact"></a>'),
                            shareHTML = $('<span class="at300bs at15nc at15t_compact"></span>').css('display', 'inline-block'),
                            p = $(window).scrollTop();
                        if (p === 0) {
                            p = $(document).scrollTop();
                        }
                        if (p === 0) {
                            p = window.pageYOffset;
                        }
                        $("#ob_container").css("margin-top", p);
                        $('#ob_content').append('<div id="ob_title"></div>').append(content.addClass('ob_contents'));
                        if(contentType !== "error") {
                            $('#ob_content').append(ob_caption);
                            if (obj.data('oB').link && obj.data('oB').link !== "" && obj.data('oB').link !== "undefined" ) {
                                if (obj.data('oB').linkTarget === "_self") {
                                    target = 'target="_self"';
                                }
                                title = (obj.data('oB').linkText && obj.data('oB').linkText !== "undefined") ? title + ' <a href="' + obj.data('oB').link + '" ' + target + ' >' + obj.data('oB').linkText + '</a>' : title + ' <a href="' + obj.data('oB').link + '" ' + target + ' >' + obj.data('oB').link + '</a>';
                            }
                            if (oB.settings.addThis && obj.data('oB').share !== "false") {
                                addThis.addClass("ob_share");
                                title = $.trim(title);
                                if (title === "") { title = "&nbsp;"; }
                                $('#ob_title').append(addThis);
                                addthis.button('.ob_share', {
                                    services_compact: oB.settings.addThisServices,
                                    ui_offset_left: -244,
                                    ui_offset_top: 4
                                }, {
                                    url: ob_link,
                                    title: title
                                });
                                $('#ob_share').html('').append(shareHTML);
                            }
                            $('#ob_title').prepend(title).click(function (e) { e.stopPropagation(); });
                            setControls();
                            if(obj.data('oB').share !== "false") {
                                $(document).trigger('oB_init', ob_link);
                                oB.methods.logit('ID:' + oB.currentIndex + ' href:"' + href + '" link:"' + ob_link + '"', true);
                            } else {
                                $(document).trigger('oB_init', "");
                                oB.methods.logit('ID:' + oB.currentIndex + ' href:"' + href + '"', true);
                            }
                            oB.progress = null;
                            if (oB.playing) {
                                oB.slideshowTimer = setTimeout(function () {
                                    oB.methods.navigate(1);
                                }, delayTimer);
                            }
                        } else {
                            oB.methods.logit('Could not find file');
                        }
                        oB.methods.showLoad(1);
                        $('#ob_content').fadeIn(oB.settings.fadeTime, function () {
                            $('#ob_overlay').css("height", $(document).height());
                        });
                        adjustModalProperties();
                    }

                    //Error Content
                    function throwError() {
                        content = $('<div id="ob_error">' + oB.settings.notFound + '</div>');
                        $('#ob_content').append(content.addClass('ob_contents'));
                        contentType = "error";
                        clearTimeout(oB.controlTimer);
                        clearTimeout(oB.slideshowTimer);
                        clearTimeout(oB.scrollTimer);
                        $(document).unbind("keydown").unbind("mousemove");
                        buildWindow();
                    }

                    //iFrame Content
                    function showiFrame() {
                        var dim = oB.methods.getSize(obj, [0, 0]);
                        obj.data('oB').css = dim;
                        content = $('<div id="ob_iframe"><iframe allowTransparency="true" height="100%" width="100%" scrolling="auto" type="text/html" frameborder="0" hspace="0" src="' + href + '"></iframe></div>').css("width", dim[1]);
                        if (dim[0] !== 0) {
                            content.css("height", dim[0]);
                        }
                        buildWindow();
                    }

                    //Inline Content
                    function showInline() {
                        var dim = oB.methods.getSize(obj, [0, 0]), inline_content = $('<div class="inline_content"></div>'), s = obj.data('oB').size, clone, copied_elem, copied_content, height;
                        if (href.match(/\?/)) {
                            href = href.substr(0, href.indexOf("?"));
                        }
                        if ($(href).length && $(href).html() !== "") {

                            if (s[0] === 0) {
                                clone = $(href).clone();
                                clone.css('display', 'block');
                                copied_elem = $('<div id="ob_inline"></div>').css({visibility: "hidden", display: "block", position: "absolute", width: dim[1]});
                                copied_content = $('<div class="inline_content"></div>').append(clone);
                                copied_elem.append(copied_content);
                                $("body").append(copied_elem);
                                height = copied_elem.height();
                                copied_content.empty().remove();
                                copied_elem.remove();
                                if(dim[0] > height) {
                                    dim[0] = height;
                                }
                            }

                            obj.data('oB').css = dim;
                            content = $('<div id="ob_inline"></div>').css({
                                "width": dim[1]
                            });
                            $(href).parent().addClass('ob_inline_content_holder');
                            if($(href).is(':visible')) {
                                $(href).appendTo(inline_content).addClass('ob_inline_content');
                            }else {
                                $(href).appendTo(inline_content).addClass('ob_inline_content').addClass('ob_inline_hide').show();
                            }
                            content.append(inline_content);
                            if (dim[0] !== 0) {
                                content.css("height", dim[0]);
                            }
                            buildWindow();
                        } else {
                            throwError();
                        }
                    }

                    //Video Content
                    function showVideo() {
                        var dim = oB.methods.getSize(obj, [0, 0]), src;
                        switch (contentType) {
                            case "youtube":
                                src = 'http://www.youtube.com/embed/'+ obj.data('oB').id +'?autoplay=1&fs=1&modestbranding=1&rel=0&showsearch=0&wmode=transparent';
                                break;
                            case "vimeo":
                                src = 'http://player.vimeo.com/video/' + obj.data('oB').id + '?title=0&byline=0&portrait=0&autoplay=1&wmode=transparent';
                                break;
                            case "viddler":
                                src = 'http://cdn.static.viddler.com/flash/publisher.swf?key=' + obj.data('oB').id + '&title=0&byline=0&portrait=0&autoplay=1&wmode=transparent';
                                break;
                        }
                        obj.data('oB').css = dim;
                        content = $('<div id="ob_iframe"><iframe allowTransparency="true" id="ob_video" width="100%" height="100%" type="text/html" frameborder="0" hspace="0" scrolling="no" src="' + src + '"></iframe></div>').css({
                            "height": dim[0],
                            "width": dim[1],
                            "background-color": "#000000"
                        });
                        buildWindow();
                    }

                    //Flash Content
                    function showFlash() {
                        var dim = oB.methods.getSize(obj, [0, 0]);
                        obj.data('oB').css = dim;
                        content = $('<div id="ob_video">' +
                            '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + dim[1] + '" height="' + dim[0] + '" id="ob_flash_content" align="middle">' +
                            '<param name="movie" value="' + href + '"/><param name="wmode" value="transparent"/><param name="allowFullScreen" value="true"/>' +
                            '<embed name="ob_flash_content" flashVars="playerVars=autoPlay=yes" src="' + href + '" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer" allowFullScreen="true" allowScriptAccess="always" width="' + dim[1] + '" height="' + dim[0] + '" type="application/x-shockwave-flash"></embed>' +
                            '</object></div>').css({
                            "height": dim[0],
                            "width": dim[1]
                        });
                        buildWindow();
                    }

                    //Image Content
                    function showImage() {
                        var img = new Image();
                        content = $(img);
                        content.load(function () {
                            var oSize = [img.height, img.width],
                                sSize = [0, 0],
                                running = false,
                                dim,
                                margin;
                            if (obj.data('oB').size) { //If there is a size set by parameters width=&height=, get them
                                sSize = obj.data('oB').size;
                            }
                            if (sSize[0] > 0 && sSize[1] === 0) { //If height= is set but width= is not scale correctly
                                sSize[1] = oSize[1] / oSize[0] * sSize[0];
                            } else if (sSize[1] > 0 && sSize[0] === 0) { //If width= is set but height= is not scale correctly
                                sSize[0] = oSize[0] / oSize[1] * sSize[1];
                            } else if (sSize[0] === 0 && sSize[1] === 0) { //If neither is set, set to original size
                                sSize = [oSize[0], oSize[1]];
                            }
                            obj.data('oB').size = sSize;
                            dim = oB.methods.getSize(obj, [0, 0]);
                            margin = (oB.settings.contentMinSize[0] / 2) - (dim[0] / 2);
                            obj.data('oB').css = dim;
                            $('#ob_content').unbind('click').click(function (e) {
                                e.stopPropagation();
                                var fullDim = oB.methods.getSize(false, oSize, true),
                                    newDim = oB.methods.getSize(obj, [0, 0]),
                                    setDim,
                                    p = $(window).scrollTop();
                                if (p === 0) {
                                    p = $(document).scrollTop();
                                }
                                if (p === 0) {
                                    p = window.pageYOffset;
                                }
                                if (!running && dim[0] < oSize[0] && fullDim[1] !== newDim[1]) {
                                    $('#ob_title').stop().hide();
                                    running = true;
                                    $('.ob_controls').fadeOut(50);
                                    if ($(this).hasClass('expanded') || fullDim[0] < $('#ob_image').height()) {
                                        $(this).removeClass('expanded');
                                        setDim = newDim;
                                    } else {
                                        $(this).addClass('expanded');
                                        setDim = fullDim;
                                    }
                                    setWindowMargin(setDim[1]);
                                    $("#ob_container").animate({
                                        "margin-top": p
                                    }, 400);
                                    $('#ob_float').animate({
                                        "margin-bottom": -(setDim[0] + (oB.settings.contentBorderWidth * 2) + 44) / 2
                                    }, 400);
                                    $('#ob_content').animate({
                                        "min-height": setDim[0],
                                        "width": setDim[1]
                                    }, 400);
                                    $('#ob_image').animate({
                                        "height": setDim[0],
                                        "width": setDim[1]
                                    }, 400, function () {
                                        running = false;
                                        $('.ob_controls').fadeIn(50);
                                        $('#ob_title').stop().fadeIn(50);
                                    });
                                }
                            });
                            if (dim[0] < oB.settings.contentMinSize[0]) {
                                content.css("margin-top", margin);
                            }
                            content.css({
                                "height": dim[0],
                                "width": dim[1]
                            });
                            buildWindow();
                        }).error(function () {
                                throwError();
                            }).attr({
                                src: href,
                                id: 'ob_image'
                            });
                    }
                    switch (contentType) {
                        case "iframe":
                        case "pdf":
                            showiFrame();
                            break;
                        case "image":
                        case "flickr":
                        case "picasa":
                            showImage();
                            break;
                        case "inline":
                            showInline();
                            break;
                        case "youtube":
                        case "vimeo":
                        case "viddler":
                            showVideo();
                            break;
                        case "flash":
                            showFlash();
                            break;
                        default:
                            oB.methods.logit('Unsupported Media: ' + href);
                            return false;
                    }
                },
                createCustom: function (content, o) {
                    if (o) {
                        $.extend(oB.settings, o);
                    }
                    if(content.href === "undefined" || content.href === "") { return false; }
                    var obj = $('<a href="'+ content.href +'"></a>'), html;
                    if(content.title) { obj.attr('title', content.title); }
                    if(content.caption) { obj.attr('data-ob_caption', content.caption); }

                    if(content.link) { obj.attr('data-ob_link', content.link); }
                    if(content.linkText) { obj.attr('data-ob_linkText', content.linkText); }
                    if(content.linkTarget) { obj.attr('data-ob_linkTarget', content.linkTarget); }

                    if(content.delay) { obj.attr('data-ob_delayTimer', content.delay); }

                    obj.attr('data-ob_share', 'false');

                    if(content.html) {
                        html = $(content.html).css('display', 'none');
                        $(body).append(html);
                    }

                    if(content.gallery) { obj.attr('data-ob', oB.settings.searchTerm + '['+ content.gallery +']'); }
                    else { obj.attr('data-ob', oB.settings.searchTerm); }

                    oB.methods.setupData(obj);
                    oB.methods.create(obj);
                },
                navigate: function (d, i, o) {
                    if (o) {
                        $.extend(oB.settings, o);
                    }
                    if (!i) {
                        if (d === 1) {
                            i = oB.currentIndex + 1;
                        } else if (d === -1) {
                            i = oB.currentIndex - 1;
                        }
                    }
                    if (oB.currentGallery[i]) {
                        oB.progress = true;
                        $(document).trigger('oB_navigate', [i]);
                        $('#ob_content').fadeOut(oB.settings.fadeTime, function () {
                            if($('#ob_iframe').length > 0) {
                                $('#ob_iframe iframe').attr('src', 'about:blank');
                            }
                            if($('#ob_inline').length) {
                                $('#ob_inline').find('.ob_inline_content').appendTo('.ob_inline_content_holder').removeClass('ob_inline_content');
                                $('.ob_inline_hide').hide().removeClass('ob_inline_hide');
                                $('.ob_inline_content_holder').removeClass('ob_inline_content_holder');
                            }
                            $(this).removeClass('expanded').css({
                                "min-height": ''
                            }).empty();
                            oB.delayTimer = oB.currentGallery[i].data('oB').delayTimer;
                            oB.methods.showContent(oB.currentGallery[i]);
                        });
                    } else {
                        oB.progress = null;
                    }
                    if (!oB.currentGallery[i + 1]) {
                        oB.methods.slideshowPause();
                    }
                },
                slideshowPlay: function () {
                    $(document).trigger('oB_play');
                    oB.playing = true;
                    if (oB.currentGallery[parseInt($('#ob_content').attr('class').substr(7), 10) + 1]) {
                        oB.methods.navigate(1);
                    } else {
                        oB.methods.navigate(0, 0);
                    }
                },
                slideshowPause: function () {
                    if (oB.playing) {
                        $(document).trigger('oB_pause');
                        oB.playing = false;
                        clearTimeout(oB.slideshowTimer);
                    }
                },
                showLoad: function (x) {
                    var ob_load = $('<div id="ob_load"></div>').hide();
                    if ($('#ob_load').length > 0 || x) {
                        clearTimeout(oB.loadTimer);
                        $('#ob_load').remove();
                    } else {
                        clearTimeout(oB.loadTimer);
                        $("body").append(ob_load);
                        oB.loadTimer = setTimeout(function () {
                            $('#ob_load').fadeIn();
                        }, 600);
                    }
                },
                destroy: function (o, x) {
                    if ($('#ob_content').length > 0) {
                        $(document).trigger('oB_closing');
                        if (o) {
                            $.extend(oB.settings, o);
                        }
                        oB.methods.showLoad(1);
                        clearTimeout(oB.controlTimer);
                        clearTimeout(oB.slideshowTimer);
                        clearTimeout(oB.scrollTimer);
                        if (oB.settings.orangeControls) {
                            $(document).orangeControls('destroy', oB.settings.fadeTime);
                        }
                        $(document).unbind("keydown").unbind("mousemove");
                        $('#ob_container').stop().fadeOut(oB.settings.fadeTime, function () {
                            if($('#ob_inline').length) {
                                $('#ob_inline').find('.ob_inline_content').appendTo('.ob_inline_content_holder').removeClass('ob_inline_content');
                                $('.ob_inline_hide').hide().removeClass('ob_inline_hide');
                                $('.ob_inline_content_holder').removeClass('ob_inline_content_holder');
                            }
                            if($('#ob_iframe').length > 0) {
                                $('#ob_iframe iframe').attr('src', 'about:blank');
                            }
                            $(this).empty().remove();
                            $(document).trigger('oB_closed');
                            if (x && $.isFunction(x)) {
                                x();
                            }
                        });
                        $('#ob_overlay').fadeOut(oB.settings.fadeTime, function () {
                            $(this).remove();
                            if($('#ob_container').length > 0) {
                                $('#ob_container').remove();
                            }
                        });
                    }
                },
                getSize: function (obj, s, noMaxHeight) {
                    var ww = $(window).width(), wh = $(window).height(), mSize = [wh - 44, ww - 44], m, a, c;
                    if (oB.docWidth > ww) {
                        mSize[1] = oB.docWidth - 44;
                    }
                    if (oB.settings.showNav) {
                        mSize[1] -= 120;
                    }
                    if (obj) {
                        s[0] = obj.data('oB').size[0];
                        s[1] = obj.data('oB').size[1];
                        m = oB.settings.contentMaxSize;
                        a = oB.settings.videoAspect;
                        c = obj.data('oB').contentType;

                        if(c === "youtube" || c === "vimeo" || c === "viddler" || c === "flash") {
                            if (s[0] > 0 && s[1] === 0) { //If height= is set but width= is not scale correctly
                                s[1] = a[1] / a[0] * s[0];
                            } else if (s[1] > 0 && s[0] === 0) { //If width= is set but height= is not scale correctly
                                s[0] = a[0] / a[1] * s[1];
                            } else if (s[0] === 0 && s[1] === 0) { //If neither is set, set to original size
                                s = a;
                            }
                        }
                        if(c === "iframe" || c === "pdf") {
                            mSize[0] -= 120;
                        }

                        if (m[0] === 0 && c !== "iframe" && c !== "pdf") {
                            mSize[0] = 0;
                        } else if (m[0] > 1 && m[0] < mSize[0]) {
                            mSize[0] = m[0];
                        } else if (m[0] > 0 && m[0] <= 1) {
                            mSize[0] = Math.round(mSize[0] * m[0]);
                        }
                        if (m[1] > 1 && m[1] < mSize[1]) {
                            mSize[1] = m[1];
                        } else if (m[1] > 0 && m[1] <= 1) {
                            mSize[1] = Math.round(mSize[1] * m[1]);
                        }
                        if (s[1] <= 1) {
                            s[1] = mSize[1];
                        }
                        if (s[0] === 0 && mSize[0] !== 0) {
                            s[0] = mSize[0];
                        }
                    }

                    //Scale Content to fit
                    if (!noMaxHeight && mSize[0] && s[0] > mSize[0]) {
                        s[1] = s[1] * mSize[0] / s[0];
                        s[0] = mSize[0];
                    }
                    if (s[1] > mSize[1]) {
                        s[0] = s[0] * mSize[1] / s[1];
                        s[1] = mSize[1];
                    }
                    return [Math.round(s[0]), Math.round(s[1])];
                },
                getUrlVars: function () {
                    var i,
                        vars = [],
                        hash,
                        hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
                    for (i = 0; i < hashes.length; i++) {
                        hash = hashes[i].split('=');
                        vars[hash[0]] = hash[1];
                    }
                    return vars;
                },
                logit: function (m, d) {
                    if (d && oB.settings.logging === "debug") {
                        console.log('OrangeBox: ' + m);
                    } else if (!d && oB.settings.logging) {
                        console.log('OrangeBox: ' + m);
                    }
                }
            }
        };

        $.fn.orangeBox = function (method) {
            if (method === "showContent" || method === "getSize" || method === "getUrlVars" ||  method === "logit") {
                oB.methods.logit(method + ' cannot be called externally');
            } else if (oB.methods[method]) {
                return oB.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return oB.methods.init.apply(this, arguments);
            } else {
                oB.methods.logit(method + ' does not exist in OrangeBox');
            }
        };
    })(jQuery);
}
jQuery(document).ready(function ($) {
    var searchTerm = 'a[data-ob*=lightbox], area[data-ob*=lightbox], a[rel*=lightbox], area[rel*=lightbox]';
    if(typeof orangebox_vars !== "undefined") {
        $.extend(oB.settings, orangebox_vars);
    }
    if(oB.settings.searchTerm !== "") {
        searchTerm = 'a[data-ob*='+oB.settings.searchTerm+'], area[data-ob*='+oB.settings.searchTerm+'], a[rel*='+oB.settings.searchTerm+'], area[rel*='+oB.settings.searchTerm+']';
    }
    $(searchTerm).orangeBox();
    $(document).trigger('oB_ready');
});