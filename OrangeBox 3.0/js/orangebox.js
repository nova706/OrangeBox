/*
 * version: 3.0.0
 * package: OrangeBox
 * author: David Paul Hamilton - http://orangebox.davidpaulhamilton.net
 * copyright: Copyright (c) 2011 David Hamilton / DavidPaulHamilton.net All rights reserved.
 * license: GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
if (typeof oB !== 'undefined') console.log('OrangeBox: Variable "oB", used by OrangeBox, is already defined');
else {
	var oB;
	(function ($) {
        oB = {
            progress: '',
            playing: '',
            slideshowTimer: '',
            slideshow: '',
            docHeight: '',
            docWidth: '',
            controlTimer: '',
            settings: {
                autoplay : false,
                fadeControls: false,
                fadeCaption: true,
                keyboardNavigation: true,
                orangeControls: false,
                showClose: true,
                showDots: false,
                showNav: true,
                addThis: true,
                notFound: 'Not Found',
                overlayOpacity: 0.95,
                contentBorderWidth: 4,
                contentMinWidth: 200,
                contentMinHeight: 100,
                iframeWidth: 0.75,
                iframeHeight: 0.75,
                inlineWidth: 0.5,
                inlineHeight: 0,
                maxImageWidth: 0.75,
                maxImageHeight: 0.75,
                maxVideoWidth: 640,
                maxVideoHeight: 390,
                fadeTime: 200,
                slideshowTimer: 3000,
                streamItems: 10,
				logging: false
            },
            methods: {
                init : function (options) {
                    if (!$('#ob_window').length) {
                        if(options) $.extend( oB.settings, options );
                        return this.each(function() {
                            oB.methods.setupData($(this));
                            $(this).click(function(e) {
                                e.preventDefault();
                                oB.methods.create($(this));
                            });
                        });
                    }
                    return false;
                },
                create : function( obj, options ) {
                    if(options) $.extend( oB.settings, options );
                    if(!obj) { 
						obj = $(this); 
						oB.methods.setupData(obj); 
					}
                    oB.currentGallery = $('.ob_gallery-'+obj.data('ob_data').ob_gallery);
                    if(obj.data('ob_data').ob_contentType) {
                    
                    //Set Vars
                        var overlay = $('<div id="ob_overlay"></div>');
                        var container = $('<div id="ob_container"></div>');
                        var floater = $('<div id="ob_float"></div>');
                        var window = $('<div id="ob_window"></div>').click(function(e) { e.stopPropagation(); });
                        var close = $('<div title="close" class="ob_controls ob_cs" id="ob_close"></div>').click(function() {
                            oB.methods.destroy(oB.settings);
                        });
                        var title = $('<div id="ob_title"></div>');
                        var navRight = $('<a class="ob_nav ob_controls ob_cs" id="ob_right"><span class="ob_cs" id="ob_right-ico"></span></a>');
                        var navLeft = $('<a class="ob_nav ob_controls ob_cs" id="ob_left"><span class="ob_cs" id="ob_left-ico"></span></a>');
                        var content = $('<div id="ob_content"></div>').css({
                            "border-width": oB.settings.contentBorderWidth,
                            "min-height": oB.settings.contentMinHeight,
                            "min-width": oB.settings.contentMinWidth
                        });
                        var dotnav = $('<ul id="ob_dots"></ul>');
                        oB.playing = oB.settings.autoplay;
                        oB.progress = null;
                        oB.docHeight = $(document).height();
                        oB.docWidth = $(document).width();
                        if(oB.settings.orangeControls === true && !$().orangeControls) { 
							if(oB.settings.logging) console.log( 'OrangeBox: Connection with OrangeControls failed');
							oB.settings.orangeControls = false; 
						}
                        if(oB.settings.addThis === true && typeof addthis === 'undefined') { 
							if(oB.settings.logging) console.log( 'OrangeBox: Connection with addThis failed');
							oB.settings.addThis = false; 
						}
                        
                    //Setup Dots
                        oB.currentGallery.each(function(x){ 
                            if(oB.settings.showDots) dotnav.append('<li id="ob_dot' + x + '"></li>');
                        });
                        
                    //Set overlay CSS
                        overlay.css({
                            "opacity" : oB.settings.overlayOpacity,
                            "min-height": $(document).height(),
                            "min-width": $(document).width()
                            });
                        
                    //if IE 6					
                        if(typeof document.body.style.maxHeight === "undefined") $("body","html").css({height: "100%", width: "100%"});
						                        
                    //Click to Hide Modal
                        $("body").append(overlay.click(function() { oB.methods.destroy(oB.settings); }));
                        $("body").append(container.click(function() { oB.methods.destroy(oB.settings); }));
                        if(oB.settings.showClose) window.append(close);
                        window.append(content).append(title);
                        $("#ob_container").append(floater).append(window);
                        
                    //Show Overlay
                        overlay.show(oB.settings.fadeTime);
                        
                    //Listens for Escape
                        function handleEscape(e) {
                            if(oB.progress === null) {
                                if(e.keyCode === 27) oB.methods.destroy(oB.settings);
                                else if(e.keyCode === 37) {
                                    oB.methods.slideshowPause();
                                    oB.methods.navigate(-1);
                                }
                                else if(e.keyCode === 39) {
                                    oB.methods.slideshowPause();
                                    oB.methods.navigate(1);
                                }
                            }
                        }
                        if(oB.settings.keyboardNavigation) $(document).keydown(handleEscape);
                        
                    //Initiate Navigation
                        if(oB.currentGallery.length > 1) {
                            
                        //Initiate OrangeControls
                            if(oB.settings.orangeControls) $(document).orangeControls();
                            
                        //Initiate Nav Arrows
                            if(oB.settings.showNav) {
                                window.append(navRight).append(navLeft);
                                navLeft.click( function (e) {
                                    if(oB.progress === null) {
                                        oB.methods.slideshowPause();
                                        e.stopPropagation();
                                        oB.methods.navigate(-1);
                                    }
                                });
                                navRight.click(function (e) {
                                    if(oB.progress === null) {
                                        oB.methods.slideshowPause();
                                        e.stopPropagation();
                                        oB.methods.navigate(1);
                                    }
                                });
                            }
                            
                        //Initiate Nav Dots
                            if(oB.settings.showDots) {
                                window.append(dotnav);
                                dotnav.find("li").click(function() {
                                    if(!$(this).hasClass('current') && oB.progress === null) {
                                        oB.methods.slideshowPause();
                                        var x = $(this).attr('id').substr(6);
                                        dotnav.find("li").removeClass('current');
                                        $(this).addClass('current');
                                        oB.methods.navigate("", x);
                                    }
                                });
                            }
                        }
                        
                    //Fire in the Hole
                        oB.methods.showContent(obj, true);
                    }
                },
                setupData : function( o ) {
                    var u = o.attr('href');
                    if(u) {
                        var c = false;
                        var w = 0;
                        var h = 0;
						var m = 0;
                        var i = 0;
                        var t = "";
                        var g = false;
                        var rel = o.attr('rel');
                        if(typeof o.attr('title') !== "undefined") t = o.attr('title');
                        if(u.match(/height\=\d{1,}/)) {
                            var heightIndex = u.indexOf("height=") + 7;
                            var heightString = u.substr(heightIndex);
                            if(heightString.indexOf("&") > 0) heightString = heightString.substr(0,heightString.indexOf("&"));
                            h = heightString;
                        }
                        if(u.match(/width\=\d{1,}/)) {
                            var widthIndex = u.indexOf("width=") + 6;
                            var widthString = u.substr(widthIndex);
                            if(widthString.indexOf("&") > 0) widthString = widthString.substr(0,widthString.indexOf("&"));
                            w = widthString;
                        }
                        if(u.match(/(\?|\&)(iframe\=true)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) { 
							c = "iframe";
							m = [oB.settings.iframeHeight,oB.settings.iframeWidth];
						}
                        else if(u.match(/\.(?:jpg|jpeg|bmp|png|gif)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) { 
							c = "image";
							m = [oB.settings.maxImageHeight,oB.settings.maxImageWidth];
						}
                        else if(u.match(/\.(?:mov|mp4|m4v|f4v|ogg|flv|webm)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) { 
							c = "jw"; 
							m = [oB.settings.maxVideoHeight,oB.settings.maxVideoWidth];
						}
                        else if(u.match(/\.swf((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) { 
							c = "flash"; 
							m = [oB.settings.maxVideoHeight,oB.settings.maxVideoWidth];
						}
                        else if(u.match(/^http:\/\/api\.flickr\.com\/services\/feeds\/.{1,}\.gne\?id\=\d{1,}\@.{1,}\&lang\=.{1,}\&format\=rss\_200/)) { 
							c = "flickr"; 
							m = [oB.settings.maxImageHeight,oB.settings.maxImageWidth];
							u = u.replace('rss_200', 'json');
							u = u+"&jsoncallback=?";
							var objectclass;
							if(rel.indexOf("[") > 0) {
								g = rel.substring(rel.indexOf("[") + 1, rel.indexOf("]"));
								objectclass = 'ob_gallery-'+g;
								o.addClass(objectclass);
							}
							else{
								g = 'FlickrGallery';
								objectclass = 'ob_gallery-'+g;
								o.addClass(objectclass);
							}
							$.getJSON(u, function(data){
								$.each(data.items, function(index,item){
									var item_href = item.media.m.replace('_m.jpg', '.jpg');
									var objectSet = $('.'+objectclass);
									var lastObject = objectSet.last();
									
									if(index===0) { 
										i = objectSet.length - 1;
										o.data('ob_data', {
											ob_height: parseInt(h,10),
											ob_width: parseInt(w,10),
											ob_max: m,
											ob_gallery: g,
											ob_index: i,
											ob_contentType: c,
											ob_href: item_href,
											ob_title: item.title,
											ob_linkText: o.attr('data-ob_linkText'),
											ob_link: o.attr('data-ob_link'),
											ob_caption: o.attr('data-ob_caption'),
											ob_linkTarget: o.attr('data-ob_linkTarget'),
											ob_share: 'false',
											ob_delayTimer: o.attr('data-ob_delayTimer')
										});
									}
									else if(index<oB.settings.streamItems) {
										i = objectSet.length;
										var alink = $('<a class="'+objectclass+'" href="'+item_href+'" title="'+item.title+'" rel="lightbox['+g+']"></a>');
										alink.data('ob_data', {
											ob_height: parseInt(h,10),
											ob_width: parseInt(w,10),
											ob_max: m,
											ob_gallery: g,
											ob_index: i,
											ob_contentType: c,
											ob_href: item_href,
											ob_title: item.title,
											ob_linkText: o.attr('data-ob_linkText'),
											ob_link: o.attr('data-ob_link'),
											ob_caption: o.attr('data-ob_caption'),
											ob_linkTarget: o.attr('data-ob_linkTarget'),
											ob_share: 'false',
											ob_delayTimer: o.attr('data-ob_delayTimer')
										});
										$(alink).appendTo('body');
									}
								});
							});
						}
                        else if(u.match(/^http:\/\/\w{0,3}\.?youtube\.\w{2,3}\/watch\?v=[\w\-]{11}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) { 
							c = "jw"; 
							m = [oB.settings.maxVideoHeight,oB.settings.maxVideoWidth];
						}
                        else if(u.match(/^http:\/\/\w{0,3}\.?vimeo\.com\/\d{1,10}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
                            var iI = u.indexOf("vimeo.com/") + 10;
                            var iD;
                            if(u.indexOf("?") > iI) iD = u.substring(iI, u.indexOf("?"));
                            else iD = u.substring(iI);
                            c = "vimeo";
							m = [oB.settings.maxVideoHeight,oB.settings.maxVideoWidth];
/*                            var signature;
                            var expires;
                            var xml = $.ajax({
                                type: "GET",
                                url: "http://vimeo.com/moogaloop/load/clip:"+iD,
                                dataType: "json",
                                success: function(xml) {
                                    signature = $(xml).find('request_signature');
                                    expires = $(xml).find('request_signature_expires');
                                    c = "jw";
                                    u = 'http://www.vimeo.com/moogaloop/play/clip:'+iD+'/'+signature+'/'+expires+'/?q=sd';
                                }
                            });
*/                        }
                        else if(u.match(/^http:\/\/\w{0,3}\.?viddler\.com\/(?:simple|player)\/\w{1,10}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
                            c = "viddler";
							m = [oB.settings.maxVideoHeight,oB.settings.maxVideoWidth];
                        }
                        else if(u.match(/^#\w{1,}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) { 
							c = "inline"; 
							m = [oB.settings.inlineHeight,oB.settings.inlineWidth];
							if(!h) h = m[0];
							if(!w) w = m[1];
						}
                        else if(oB.settings.logging) console.log('OrangeBox: Unsupported Media: '+u);
                        if(rel && rel.indexOf("[") > 0 && c && c !== 'flickr') {
                            g = rel.substring(rel.indexOf("[") + 1, rel.indexOf("]"));
                            o.addClass('ob_gallery-'+g);
                            var objectSet = $('.ob_gallery-'+g);
                            var lastObject = objectSet.last();
                            i = objectSet.length -1;
                        } 
                        o.data('ob_data', {
                            ob_height: parseInt(h,10),
							ob_width: parseInt(w,10),
							ob_max: m,
                            ob_gallery: g,
                            ob_index: i,
                            ob_contentType: c,
                            ob_href: u,
                            ob_title: t,
                            ob_linkText: o.attr('data-ob_linkText'),
                            ob_link: o.attr('data-ob_link'),
                            ob_caption: o.attr('data-ob_caption'),
                            ob_linkTarget: o.attr('data-ob_linkTarget'),
                            ob_share: o.attr('data-ob_share'),
                            ob_delayTimer: o.attr('data-ob_delayTimer')
                        });
                    }
                    else if(oB.settings.logging) {
						console.log('OrangeBox: Object has no "href" attribute');
						return false;
					}
                },
                showContent : function ( obj, initial ) {
                    
                    var href = obj.data('ob_data').ob_href;
                    var title = obj.data('ob_data').ob_title;
                    var contentType = obj.data('ob_data').ob_contentType;
                    var content;
                    var currentIndex = obj.data('ob_data').ob_index;
                    var ob_caption = $('<div id="ob_caption"></div>').css({
                            "opacity" : 0.95
                        });
                    if(oB.settings.fadeCaption) {
                        ob_caption.hide();
                        $('#ob_content').hover(function(){
                            $('#ob_caption').stop().fadeTo(oB.settings.fadeTime, 0.95);
                        },function(){
                            $('#ob_caption').stop().fadeOut(oB.settings.fadeTime);
                        });
                    }
                    var isError = false;
                    $('#ob_overlay').css({ "height": oB.docHeight });
                    $('#ob_content').removeClass().addClass('content'+currentIndex);
                    
                //Start Preloader
                    oB.methods.showLoad();
					
				//Set Height and Width
					function getDim() {
						var content_height = parseInt(content.css('height').replace('px',''), 10);
						var content_width = parseInt(content.css('width').replace('px',''),10);
						var h = content.outerHeight(); 
						var w = content.outerWidth();
						if(!h && content_height) h = content_height;
						if(!w && content_width) w = content_width;
						if(content.attr('id') !== "ob_error" && h < oB.settings.contentMinHeight) h = oB.settings.contentMinHeight; 
						if(w < oB.settings.contentMinWidth) w = oB.settings.contentMinWidth; 
						return [h,w];
					}
                        
                //Set Modal Properties
                    function setModalProperties() {
                        var dim = getDim();
                        var p = $(window).scrollTop();
                        var target = 'target="_blank"';
                        if(p === 0) p = $(document).scrollTop();
                        if(p === 0) p = window.pageYOffset;
						if(content.attr('id') !== "ob_error") {
							if(obj.data('ob_data').ob_link){
								if(obj.data('ob_data').ob_linkTarget === "_self") target = 'target="_self"';
								if(obj.data('ob_data').ob_linkText)
									title = title+' <a href="'+obj.data('ob_data').ob_link+'" '+target+' >'+obj.data('ob_data').ob_linkText+'</a>';
								else
									title = title+' <a href="'+obj.data('ob_data').ob_link+'" '+target+' >'+obj.data('ob_data').ob_link+'</a>';
							}
							$('#ob_title').append('<h3>' + title + '</h3>');
							if(obj.data('ob_data').ob_caption) {
								ob_caption.append('<p>'+obj.data('ob_data').ob_caption+'</p>');
								$('#ob_content').append(ob_caption);
							}
						}
                        $("#ob_container").css({ "margin-top" : p });
                        $("#ob_window").css({ "min-height": dim[0] + (oB.settings.contentBorderWidth*2), "width": dim[1] + (oB.settings.contentBorderWidth*2) });
                        $('#ob_float').css({ "margin-bottom": -(dim[0] + (oB.settings.contentBorderWidth*2) + 44) / 2 });
                        $('#ob_content').css({ "min-height": dim[0], "width": dim[1] });
                    }
                    
                //Update Navigation
                    function setControls() {
                        if(oB.settings.showDots) {
                            $('#ob_dots').find('li').each(function(){
                                var i = 'ob_dot' + obj.data('ob_data').ob_index;
                                if($(this).attr('id') === i) $(this).addClass('current');
                                else $(this).removeClass('current');
                            });
                        }
                        clearTimeout(oB.controlTimer);
                        function showControls() {
                            if(oB.currentGallery.length > 1) {
                                if(oB.settings.orangeControls)
                                    $(document).orangeControls('toggle', {'time' : oB.settings.fadeTime, 'fade' : "in"});
                                if(oB.currentGallery[currentIndex + 1]) { 
                                    $('#ob_right').fadeIn(oB.settings.fadeTime);
                                    $('#ob_right-ico').fadeIn(oB.settings.fadeTime);
                                }
                                else $('#ob_right').hide();
                                if(oB.currentGallery[currentIndex - 1]) { 
                                    $('#ob_left').fadeIn(oB.settings.fadeTime); 
                                    $('#ob_left-ico').fadeIn(oB.settings.fadeTime);
                                }
                                else $('#ob_left').hide();
                            }
                            $('#ob_close').fadeIn(oB.settings.fadeTime);
                        }
                        if(oB.settings.fadeControls) {
                            if(!oB.currentGallery[currentIndex + 1] || !oB.currentGallery[currentIndex - 1] || initial) {
                                showControls();
                                oB.controlTimer = setTimeout(function() {
                                    $('.ob_controls').fadeOut(oB.settings.fadeTime);
                                    if(oB.settings.orangeControls)
                                        $(document).orangeControls('toggle', {'time' : oB.settings.fadeTime, 'fade' : "out"});
                                }, 1200);
                            }
                            $(document).mousemove(function(event) {
                                clearTimeout(oB.controlTimer);
                                oB.controlTimer = setTimeout(function() {
                                    showControls();
                                    if (!$(event.target).hasClass('ob_cs') && !$(event.target).hasClass('oc_class')) {
                                        oB.controlTimer = setTimeout(function() {
                                            $('.ob_controls').fadeOut(oB.settings.fadeTime);
                                            if(oB.settings.orangeControls)
                                                $(document).orangeControls('toggle', {'time' : oB.settings.fadeTime, 'fade' : "out"});
                                        }, 1200);
                                    }
                                },20);
                            });
                        }
                        else {
                            showControls();
                        }
                    }
                    
                //Build the Window
                    function buildit() {
						var loc = window.location;
						var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
						var windowURL =  loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length) - 1) + window.location.pathname;
						var href_encode = encodeURIComponent(href);
						if(windowURL.indexOf('?') > 0) windowURL = windowURL.substr(0,windowURL.indexOf('?'));
						var ob_link = windowURL + "?orangebox=" + href_encode;
						if(oB.settings.logging) console.log( 'OrangeBox: Browser Link: ' + ob_link );
                        oB.methods.showLoad("stop");
                        $('#ob_content').append(content);
                        if(oB.settings.addThis && contentType !== "iframe" && contentType !== "inline" && obj.data('ob_data').ob_share !== "false") {
                            $('#ob_share').empty().remove();
                            var addThis = $('<a id="ob_share" class="addthis_button_compact"></a>');
                            var shareClass = "ob_share-"+title;
                            addThis.addClass(shareClass);
                            $('#ob_window').append(addThis);
                            $('#ob_title').css('margin-right', 24);
                            addthis.button('.'+shareClass, { services_compact: 'twitter,facebook,digg,delicious,more', ui_offset_left: -244, ui_offset_top: 4 }, { url: ob_link, title: title });
                            $('#ob_share').html('').append('<span class="at300bs at15nc at15t_compact"></span>');
                            if(title === "") title = "share";
                        }
                        if(contentType === "jw") {
							var jw_width = content.css('width');
							var jw_height = content.css('height');
                            jwplayer("ob_video").setup({
                                flashplayer: "/orangebox/jw/player.swf",
                                autostart: true,
                                file: href,
                                events: {
                                    onComplete: function() {
                                        if(oB.playing) oB.methods.navigate(1);
                                    }
                                },
                                width: jw_width,
                                height: jw_height
                            });
                        }
                        $('#ob_window').fadeIn(oB.settings.fadeTime, function(){
                            if(initial) $(document).trigger('oB_init');
							if(oB.settings.logging && initial) console.log( 'OrangeBox: Initialized' );
                            $('#ob_overlay').css({ "height": $(document).height() });
                        });
                        setModalProperties();
                        setControls();
                        oB.progress = null;
                        if(oB.playing && contentType !== "jw") {
                            var delayTimer = oB.settings.slideshowTimer;
                            if(obj.data('ob_data').ob_delayTimer)
                                delayTimer = parseInt(obj.data('ob_data').ob_delayTimer, 10) + parseInt(oB.settings.slideshowTimer, 10);
                            oB.slideshowTimer = setTimeout(function(){
                                oB.methods.navigate(1);
                            },delayTimer);
                        }
                    }
                    
                //Error Content
                    function throwError() {
                        content = $('<div id="ob_error">' + oB.settings.notFound + '</div>');
                        oB.methods.showLoad("stop");
                        $('#ob_content').empty().append(content);
                        $('#ob_window').fadeIn(oB.settings.fadeTime, function(){
                            $('#ob_overlay').css({ "height": $(document).height() }); 
							if(oB.settings.logging) console.log( 'OrangeBox: Could not find file' );   
                        });
                        $('#ob_title').hide();
                        $('#ob_right').hide();
                        $('#ob_left').hide();
                        $('#ob_dots').hide();
						clearTimeout(oB.controlTimer);
						clearTimeout(oB.slideshowTimer);
						clearTimeout(oB.scrollTimer);
						$(document).unbind("keydown").unbind("mousemove");
                        isError = true;
                        setModalProperties();
                    }
                                        
                //iFrame Content
                    function showiFrame() {	
						var dim = oB.methods.getSize(obj,0,0,false);
                        var newhref = href.replace(/(\?|\&)iframe\=true/, '');
                        newhref = newhref.replace(/(\?|\&)width\=\d{1,}/, '');
                        newhref = newhref.replace(/(\?|\&)height\=\d{1,}/, '');
                        content = $('<iframe id="ob_iframe" frameborder="0" hspace="0" scrolling="auto" src="' + newhref + '"></iframe>').css({
                                "height": dim[0],
                                "width": dim[1]
                            });
                        buildit();
                    }
                    
                //Inline Content
                    function showInline() {
						var dim = oB.methods.getSize(obj,0,0,true);
						if(href.indexOf('?') > 0) href = href.substr(0,href.indexOf('?'));	
                        if($(href).length && $(href).html() !== ""){
                            content = $('<div id="ob_inline">' + $(href).html() + '</div>').css({
                                    "width": dim[1]
                                });
							if(dim[0] !== 0) content.css("height", dim[0]);
                            buildit();
                        }
                        else throwError();
                    }
                            
                //Video Content
                    function showVideo() {
                        var i;
						var dim = oB.methods.getSize(obj,0,0,false);
						var h = dim[0];
						var w = dim[1];
                        var a = 'height="100%" width="100%" type="text/html" frameborder="0" hspace="0" scrolling="auto"';
                        var iI;
                        
                    //JW
                        if(contentType === "jw") content = $('<div id="ob_video" height="' + h + '" width="' + w + '"></div>');
                        
                    //Vimeo	
                        else if(contentType === "vimeo") { 
                            iI = href.indexOf("vimeo.com/") + 10;
                            if(href.indexOf("?") > iI) i = href.substring(iI, href.indexOf("?"));
                            else i = href.substring(iI);
                            content = $('<iframe id="ob_video" '+a+' src="http://player.vimeo.com/video/'+i+'?title=0&byline=0&portrait=0&autoplay=1&wmode=transparent"></iframe>');
                        }
                        
                    //Viddler (player)
                        else if(contentType === "viddler") { 
                            if(href.indexOf("viddler.com/player/") > 0) iI = href.indexOf("viddler.com/player/") + 19;
                            else if(href.indexOf("viddler.com/simple/") > 0) iI = href.indexOf("viddler.com/simple/") + 19;
                            if(href.indexOf("?") > iI) i = href.substring(iI, href.indexOf("?"));
                            else i = href.substring(iI);
                            i = i.replace(/\//g,'');
                            content = $('<iframe id="ob_video" '+a+' src="http://cdn.static.viddler.com/flash/publisher.swf?key='+i+'&title=0&byline=0&portrait=0&autoplay=1&wmode=transparent"></iframe>');
                        }
                        
                    //Flash
                        else if(contentType === "flash") content = $('<div id="ob_video"><embed flashVars="playerVars=autoPlay=yes" src="' + href + '" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer" allowFullScreen="true" allowScriptAccess="always" width="' + w + '" height="' + h + '" type="application/x-shockwave-flash"></embed></div>');
						
                        content.css({ "width": w, "height": h });
                        buildit();
                    }
                    
                //Image Content
                    function showImage() {											
                        var img = new Image();
                        content = $(img);
                        content.load(function () {
							var oH = img.height;
							var oW = img.width;
							if(obj.data('ob_data').ob_height === 0) obj.data('ob_data').ob_height = oH;
							if(obj.data('ob_data').ob_width === 0) obj.data('ob_data').ob_width = oW;
							var dim = oB.methods.getSize(obj,0,0,false);
                            var h = dim[0];
                            var w = dim[1];
							var running = false;
							$('#ob_content').unbind('click').click(function(){
								var fullDim = oB.methods.getSize(false,oH,oW,true);
								var newDim = oB.methods.getSize(obj,0,0,false);
								if(!running && h < oH ) {
									if($(this).hasClass('expanded') || fullDim[0] < $('#ob_image').height()) {
										running = true;
										$("#ob_window").animate({ "min-height": newDim[0] + (oB.settings.contentBorderWidth*2), "width": newDim[1] + (oB.settings.contentBorderWidth*2) },400);
										$('#ob_float').animate({ "margin-bottom": - (newDim[0] + (oB.settings.contentBorderWidth*2) + 44) / 2 },400);
										$('#ob_content').animate({ "min-height": newDim[0], "width": newDim[1] },400);
										$('#ob_image').animate({ "height": newDim[0], "width": newDim[1] }, 400, function(){running = false;});
										$(this).removeClass('expanded');
									}
									else {
										running = true;
										$("#ob_window").animate({ "min-height": fullDim[0], "width": fullDim[1] },400);
										$('#ob_float').animate({ "margin-bottom": -(fullDim[0] + (oB.settings.contentBorderWidth*2) + 44) / 2 },400);
										$('#ob_content').animate({ "min-height": fullDim[0] - (oB.settings.contentBorderWidth*2), "width": fullDim[1] - (oB.settings.contentBorderWidth*2) },400);
										$('#ob_image').animate({ "height": fullDim[0] - (oB.settings.contentBorderWidth*2), "width": fullDim[1] - (oB.settings.contentBorderWidth*2) }, 400, function(){running = false;});
										$(this).addClass('expanded');
									}
								}
							});
							
                            if(h < oB.settings.contentMinHeight){
								var margin = (oB.settings.contentMinHeight / 2) - (h / 2);
                                content.css("margin-top", margin);
                            }
                            content.css({
                                "height": h,
                                "width": w
                            });
                            buildit();
                        })
                        .error(function () {
                            throwError();
                        })
                        .attr({ src: href, id: 'ob_image' });
                    }
                    
                    switch (contentType) {
                        case "iframe":
                            showiFrame();
                            break;
                        case "image":
                        case "flickr":
                            showImage();
                            break;
                        case "inline":
                            showInline();
                            break;
                        case "jw":
                        case "quicktime":
                        case "vimeo":
                        case "viddler":
                        case "flash":
                            showVideo();
                            break;
                        default:
                            if(oB.settings.logging) console.log('OrangeBox: Unsupported Media: '+href);
                    }
                },
                navigate : function(d,i,options ) {
                    if(options) $.extend(oB.settings,options);
                    if(!i) {
                        var c =  parseInt($('#ob_content').attr('class').substr(7), 10);
                        if(d === 1) i = c + 1;
                        else if(d === -1) i = c - 1;
                    }
                    if(oB.currentGallery[i]) {
                        oB.progress = true;
                        $(document).trigger('oB_navigate', [i]);
						if(oB.settings.logging) console.log( 'OrangeBox: Navigating to' +  [i] );
                        $('#ob_window').fadeOut(oB.settings.fadeTime, function () {
							if($('#ob_video').length > 0) {
								try{jwplayer("ob_video").remove();}
								catch(error){if(oB.settings.logging) console.log( 'OrangeBox: ' +  error );}
								$('#ob_video').empty().remove();
							}
							$('#ob_share').empty().remove();
                            $('#ob_title').empty().css('margin-right', 0);
                            $('#ob_content').removeClass('expanded').empty().css({
									"min-height": 0
								});
                            oB.delayTimer = $(oB.currentGallery[i]).data('ob_data').ob_delayTimer;
                            oB.methods.showContent($(oB.currentGallery[i]), false );
                        }).css({
							"min-height": 0
						});
                    }
                    else oB.progress = null;
                    if(!oB.currentGallery[i + 1]) oB.methods.slideshowPause();
                },
                slideshowPlay  : function() {
                    $(document).trigger('oB_play');
					if(oB.settings.logging) console.log( 'OrangeBox: Playing' );
                    var c =  parseInt($('#ob_content').attr('class').substr(7), 10);
                    oB.playing = true;
                    if(oB.currentGallery[c + 1]) oB.methods.navigate(1);
                    else oB.methods.navigate(0, 0);
                },
                slideshowPause  : function() {
                    if(oB.playing) {
                        $(document).trigger('oB_pause');
						if(oB.settings.logging) console.log( 'OrangeBox: Paused' );
                        oB.playing = false;
                        clearTimeout(oB.slideshowTimer);
                    }
                },
                showLoad  : function( x ) {
                    var loadTimer;
                    var ob_load = $('<div id="ob_load"></div>').hide();
                    if(x === "stop") {
                        clearTimeout(loadTimer);
                        $('#ob_load').remove();
                    }
                    else {
                        clearTimeout(loadTimer);
                        $("body").append(ob_load);
                        loadTimer=setTimeout(function() { $('#ob_load').fadeIn(); }, 600);
                    }
                },
                destroy : function( options, x ) {
                    $(document).trigger('oB_closing');
                    if(options) $.extend( oB.settings, options );
					if($('#ob_video').length > 0) {
						try{jwplayer("ob_video").remove();}
						catch(error){if(oB.settings.logging) console.log( 'OrangeBox: ' +  error );}
						$('#ob_video').empty().remove();
					}
                    oB.methods.showLoad("stop");
                    clearTimeout(oB.controlTimer);
                    clearTimeout(oB.slideshowTimer);
                    clearTimeout(oB.scrollTimer);
                    if(oB.settings.orangeControls) $(document).orangeControls('destroy', oB.settings.fadeTime);
                    $(document).unbind("keydown").unbind("mousemove");
                    $('#ob_overlay').fadeOut(oB.settings.fadeTime, function() { $(this).remove().empty(); });
                    $('#ob_container').fadeOut(oB.settings.fadeTime, function() {
                        $(this).remove().empty();
                        $(document).trigger('oB_closed');
						if(oB.settings.logging) console.log( 'OrangeBox: Closed' );
                        if(x && $.isFunction(x)) x();
                    });
                },
				getSize: function(obj,h,w,noMaxHeight){
					var mH = $(window).height() - 44;
					var mW = $(window).width() - 44;
					if(oB.settings.showNav) mW = mW - 110;
					var m;
					if(obj) {
						w = obj.data('ob_data').ob_width;
						h = obj.data('ob_data').ob_height;
						m = obj.data('ob_data').ob_max;
						if(m[0] === 0) mH = 0;
						else if(m[0] > 1 && m[0] < mH) mH = m[0];
						else if(m[0] > 0 && m[0] <= 1) mH = mH * m[0];
						if(m[1] > 1 && m[1] < mW) mW = m[1];
						else if(m[1] > 0 && m[1] <= 1) mW = mW * m[1];
						if(w === 0) w=mW;
						if(h === 0 && mH !== 0) h=mH;
					}

				//Scale Content to fit
					if(!noMaxHeight && mH && h > mH){
						w = w * mH / h;
						h = mH ;
					}
					if(w > mW){
						h = h * mW / w;
						w = mW;
					}
										
					return [parseInt(h,10),parseInt(w,10)];
				},
				getUrlVars: function(){
					var i;
					var vars = [], hash;
					var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
					for(i = 0; i < hashes.length; i++)
					{
						hash = hashes[i].split('=');
						vars.push(hash[0]);
						vars[hash[0]] = hash[1];
					}
					return vars;
				}
            }
        };
        
        $.fn.orangeBox = function( method ) {        
            if( method === "showContent" || method === "setupData" ) {
				if(oB.settings.logging) console.log( 'OrangeBox: ' +  method + ' cannot be called externally' );
                return false;
            }
            else if( oB.methods[method] ) {
                return oB.methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
            }
            else if( typeof method === 'object' || ! method ) {
                return oB.methods.init.apply( this, arguments );
            }
            else {
				if(oB.settings.logging) console.log( 'OrangeBox: Method ' +  method + ' does not exist in OrangeBox' );
                return false;
            }    
        
        };
    })(jQuery); 
}
jQuery(document).ready(function($) {
    if(typeof orangebox_vars !== "undefined") $('a[rel*=lightbox]').orangeBox(orangebox_vars);
    else $('a[rel*=lightbox]').orangeBox();
	var orangebox = oB.methods.getUrlVars()['orangebox'];
	if(typeof orangebox !== 'undefined'){ 
		if(orangebox.indexOf('#.') > 0) orangebox = orangebox.substr(0,orangebox.indexOf('#.'));
		orangebox = decodeURIComponent(orangebox);
	}
	var id = '#'+ orangebox;
	function checkURL() {
		if(id.match(/^#\w{1,}$/) && $(id).length > 0) oB.methods.create($(id));
		else {
			$('a[rel*=lightbox]').each(function(){
				var href = $(this).attr('href');
				var gallery = $(this).attr('rel');
				if(gallery.indexOf(orangebox) >= 0)	{
					oB.methods.create($(this));
					return false;
				}
				else if(href.indexOf(orangebox) >= 0) {
					oB.methods.create($(this));
					return false;
				}
			});
		}
	}
	if(oB.settings.addThis) { 
		$.getScript('http://s7.addthis.com/js/250/addthis_widget.js#pubid=ra-4dd42f2b5b9fc332', function(data, textStatus){
		   if(oB.settings.logging) console.log('OrangeBox: addThis loaded');
		   if(typeof orangebox !== 'undefined') checkURL();
		});
	}
	else if(typeof orangebox !== 'undefined') checkURL();
});