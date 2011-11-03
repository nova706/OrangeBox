/*
 * version: 3.0.0
 * package: OrangeBox
 * author: David Paul Hamilton - http://orangebox.davidpaulhamilton.net
 * copyright: Copyright (c) 2011 David Hamilton / DavidPaulHamilton.net All rights reserved.
 * license: GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */
if (typeof oB !== 'undefined') {
	console.log('OrangeBox: Variable "oB", used by OrangeBox, is already defined');
} else {
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
				autoplay: false,
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
				init: function (o) {
					if (!$('#ob_content').length) {
						if (o) {
							$.extend(oB.settings, o);
						}
						return this.each(function () {
							oB.methods.setupData($(this));
							$(this).click(function (e) {
								e.preventDefault();
								oB.methods.create($(this));
							});
						});
					}
					return false;
				},
				setupData: function (o) {
					var u = o.attr('href');
					if (u) {
						var c = false;
						var s = [0, 0];
						var h = 0;
						var m = 0;
						var i = 0;
						var t = "";
						var g = false;
						var rel = o.attr('rel');
						if (typeof o.attr('title') !== "undefined") {
							t = o.attr('title');
						}
						if (u.match(/height\=\d{1,}/)) {
							var heightString = u.match(/height\=\d{1,}/)[0];
							s[0] = parseInt(heightString.match(/\d{1,}/)[0], 10);
						}
						if (u.match(/width\=\d{1,}/)) {
							var widthString = u.match(/width\=\d{1,}/)[0];
							s[1] = parseInt(widthString.match(/\d{1,}/)[0], 10);
						}
						if (u.match(/(\?|\&)(iframe\=true)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "iframe";
							m = [oB.settings.iframeHeight, oB.settings.iframeWidth];
						} else if (u.match(/\.(?:jpg|jpeg|bmp|png|gif)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "image";
							m = [oB.settings.maxImageHeight, oB.settings.maxImageWidth];
						} else if (u.match(/\.pdf((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "pdf";
							u = encodeURIComponent(u);
							u = "http://docs.google.com/viewer?url=" + u + "&embedded=true&iframe=true";
							m = [oB.settings.iframeHeight, oB.settings.iframeWidth];
						} else if (u.match(/\.(?:mov|mp4|m4v|f4v|ogg|flv|webm)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "jw";
							m = [oB.settings.maxVideoHeight, oB.settings.maxVideoWidth];
						} else if (u.match(/\.swf((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "flash";
							m = [oB.settings.maxVideoHeight, oB.settings.maxVideoWidth];
						} else if (u.match(/^http:\/\/api\.flickr\.com\/services\/feeds\/.{1,}\.gne\?id\=\d{1,}\@.{1,}\&lang\=.{1,}\&format\=rss\_200/)) {
							c = "flickr";
							m = [oB.settings.maxImageHeight, oB.settings.maxImageWidth];
							u = u.replace('rss_200', 'json');
							u = u + "&jsoncallback=?";
							if (rel.indexOf("[") > 0) {
								g = rel.substring(rel.indexOf("[") + 1, rel.indexOf("]")).replace(/ /g, "_");
								o.addClass('ob_gallery-' + g);
							} else {
								g = 'flickr' + newDate.getTime();
								o.addClass('ob_gallery-' + g);
							}
							$.getJSON(u, function (data) {
								$.each(data.items, function (index, item) {
									var item_href = item.media.m.replace('_m.jpg', '.jpg');
									var objectSet = $('.' + 'ob_gallery-' + g);
									var obj;
									function addData(obj) {
										obj.data('ob_data', {
											ob_size: s,
											ob_max: m,
											ob_gallery: g,
											ob_index: i,
											ob_contentType: c,
											ob_href: item_href,
											ob_title: item.title,
											ob_linkText: o.attr('data-ob_linkText'),
											ob_link: o.attr('data-ob_link'),
											ob_linkTarget: o.attr('data-ob_linkTarget'),
											ob_share: 'false',
											ob_delayTimer: o.attr('data-ob_delayTimer')
										});
									}
									if (index === 0) {
										i = objectSet.length - 1;
										addData(o);
									} else if (index < oB.settings.streamItems) {
										i = objectSet.length;
										obj = $('<a class="ob_gallery-' + g + '" href="' + item_href + '" title="' + item.title + '" rel="lightbox[' + g + ']"></a>');
										addData(obj);
										$(obj).appendTo('body');
									} else {
										return false;
									}
								});
							});
						} else if (u.match(/^https:\/\/picasaweb\.google\.com\/data\/feed\/base\//)) {
							c = "picasa";
							u = u.replace('/base/', '/api/');
							u = u.replace('alt=rss', 'alt=json-in-script');
							u = u + '&max-results=' + oB.settings.streamItems + '&callback=?';
							m = [oB.settings.maxImageHeight, oB.settings.maxImageWidth];
							if (rel.indexOf("[") > 0) {
								g = rel.substring(rel.indexOf("[") + 1, rel.indexOf("]")).replace(/ /g, "_");
								o.addClass('ob_gallery-' + g);
							} else {
								g = 'picasa' + newDate.getTime();
								o.addClass('ob_gallery-' + g);
							}
							$.ajax({
								url: u,
								dataType: 'json',
								success: function (data) {
									$.each(data.feed.entry, function (index, item) {
										var objectSet = $('.' + 'ob_gallery-' + g);
										var obj;
										function addData(obj) {
											obj.data('ob_data', {
												ob_size: [parseInt(item.gphoto$height.$t, 10), parseInt(item.gphoto$width.$t, 10)],
												ob_max: m,
												ob_gallery: g,
												ob_index: i,
												ob_contentType: c,
												ob_href: item.content.src,
												ob_title: item.title.$t,
												ob_linkText: o.attr('data-ob_linkText'),
												ob_link: o.attr('data-ob_link'),
												ob_caption: item.summary.$t,
												ob_linkTarget: o.attr('data-ob_linkTarget'),
												ob_share: 'false',
												ob_delayTimer: o.attr('data-ob_delayTimer')
											});
										}
										if (index === 0) {
											i = objectSet.length - 1;
											addData(o);
										} else if (index < oB.settings.streamItems) {
											i = objectSet.length;
											obj = $('<a class="ob_gallery-' + g + '" href="' + item.content.src + '" title="' + item.title.$t + '" rel="lightbox[' + g + ']"></a>');
											addData(obj);
											$(obj).appendTo('body');
										} else {
											return false;
										}
									});
								}
							});
						} else if (u.match(/^http:\/\/\w{0,3}\.?youtube\.\w{2,3}\/watch\?v=[\w\-]{11}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "jw";
							m = [oB.settings.maxVideoHeight, oB.settings.maxVideoWidth];
						} else if (u.match(/^http:\/\/\w{0,3}\.?vimeo\.com\/\d{1,10}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							var iI = u.indexOf("vimeo.com/") + 10;
							var iD;
							if (u.indexOf("?") > iI) {
								iD = u.substring(iI, u.indexOf("?"));
							} else {
								iD = u.substring(iI);
							}
							c = "vimeo";
							m = [oB.settings.maxVideoHeight, oB.settings.maxVideoWidth];
						} else if (u.match(/^http:\/\/\w{0,3}\.?viddler\.com\/(?:simple|player)\/\w{1,10}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "viddler";
							m = [oB.settings.maxVideoHeight, oB.settings.maxVideoWidth];
						} else if (u.match(/^#\w{1,}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "inline";
							m = [oB.settings.inlineHeight, oB.settings.inlineWidth];
							if (s[0] === 0) {
								s[0] = m[0];
							}
							if (s[1] === 0) {
								s[1] = m[1];
							}
						} else if (oB.settings.logging) {
							console.log('OrangeBox: Unsupported Media: ' + u);
						}
						if (rel && rel.indexOf("[") > 0 && c && c !== 'flickr') {
							g = rel.substring(rel.indexOf("[") + 1, rel.indexOf("]")).replace(/ /g, "_");
							o.addClass('ob_gallery-' + g);
							var objectSet = $('.ob_gallery-' + g);
							i = objectSet.length - 1;
						}
						o.data('ob_data', {
							ob_size: s,
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
					} else if (oB.settings.logging) {
						console.log('OrangeBox: Object has no "href" attribute');
						return false;
					}
				},
				create: function (obj, o) {
					if (o) {
						$.extend(oB.settings, o);
					}
					if (!obj) {
						obj = $(this);
						oB.methods.setupData(obj);
					}
					if (obj.data('ob_data').ob_contentType) {

					//Set Vars
						oB.playing = oB.settings.autoplay;
						oB.progress = null;
						oB.docHeight = $(document).height();
						oB.docWidth = $(document).width();
						oB.currentGallery = $('.ob_gallery-' + obj.data('ob_data').ob_gallery);
						var overlay = $('<div id="ob_overlay"></div>').css({
							"opacity": oB.settings.overlayOpacity,
							"height": oB.docHeight,
							"min-height": oB.docHeight,
							"min-width": oB.docWidth
						});
						var container = $('<div id="ob_container"></div>');
						var ob_content = $('<div id="ob_content"></div>').click(function (e) {
							e.stopPropagation();
						}).css("border-width", oB.settings.contentBorderWidth);

					//Check for addThis
						if (oB.settings.addThis === true && typeof addthis === 'undefined') {
							if (oB.settings.logging) {
								console.log('OrangeBox: Connection with addThis failed');
							}
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
						$("body").append(overlay.show(oB.settings.fadeTime).click(function () {
							oB.methods.destroy(oB.settings);
						})).append(container.click(function () {
							oB.methods.destroy(oB.settings);
						}));
						$("#ob_container").append('<div id="ob_float"></div>').append(ob_content);

					//Listens for Escape
						function handleEscape(e) {
							if (e.keyCode === 27 && oB.progress === null) {
								oB.methods.destroy(oB.settings);
							} else if (e.keyCode === 37 && oB.progress === null) {
								oB.methods.slideshowPause();
								oB.methods.navigate(-1);
							} else if (e.keyCode === 39 && oB.progress === null) {
								oB.methods.slideshowPause();
								oB.methods.navigate(1);
							}
						}
						if (oB.settings.keyboardNavigation) {
							$(document).keydown(handleEscape);
						}

					//Fire in the Hole
						oB.methods.showContent(obj, true);
					}
				},
				showContent: function (obj, initial) {
					var href = obj.data('ob_data').ob_href;
					var title = obj.data('ob_data').ob_title;
					var contentType = obj.data('ob_data').ob_contentType;
					var content;
					var currentIndex = obj.data('ob_data').ob_index;
					var ob_caption = $('<div id="ob_caption"></div>').css("opacity", 0.95).click(function (e) { e.stopPropagation(); });
					var loc = window.location;
					var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
					var windowURL = loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length) - 1) + window.location.pathname;
					if (windowURL.indexOf('?') > 0) {
						windowURL = windowURL.substr(0, windowURL.indexOf('?'));
					}
					var href_encode = encodeURIComponent(href);
					var navRight = $('<a class="ob_nav" id="ob_right"><span class="ob_controls" id="ob_right-ico"></span></a>').click(function (e) {
						if (oB.progress === null) {
							oB.methods.slideshowPause();
							e.stopPropagation();
							oB.methods.navigate(1);
						}
					});
					var navLeft = $('<a class="ob_nav" id="ob_left"><span class="ob_controls" id="ob_left-ico"></span></a>').click(function (e) {
						if (oB.progress === null) {
							oB.methods.slideshowPause();
							e.stopPropagation();
							oB.methods.navigate(-1);
						}
					});
					var dotnav = $('<ul id="ob_dots"></ul>').click(function (e) { e.stopPropagation(); });
					var ob_link = windowURL + "?orangebox=" + href_encode;
					$('#ob_content').removeClass().addClass('content' + currentIndex);
				
				//Setup Dot Nav	
					if (oB.settings.showDots) {
						oB.currentGallery.each(function (x) {
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
							oB.methods.destroy(oB.settings);
						}));
					}
					
				//Start Preloader
					oB.methods.showLoad();

				//Set Height and Width
					function getDim() {
						var css_size = [parseInt(content.css('height').replace('px', ''), 10), parseInt(content.css('width').replace('px', ''), 10), parseInt(content.css('padding-left').replace('px', ''), 10) * 2];
						var size = [content.outerHeight(), content.outerWidth()];
						if (css_size[0] === 0 && contentType === "inline") {
							var copied_elem = $(href).clone().attr("id", false).css({visibility: "hidden", display: "block", position: "absolute", "line-height": "1.625em", width: css_size[1] - css_size[2]});
							$("body").append(copied_elem);
							size[0] = copied_elem.height() + css_size[2];
							copied_elem.remove();
						}
						if (!size[0] && css_size[0]) {
							size[0] = css_size[0];
						}
						if (!size[1] && css_size[1]) {
							size[1] = css_size[1];
						}
						if (content.attr('id') !== "ob_error" && size[0] < oB.settings.contentMinHeight) {
							size[0] = oB.settings.contentMinHeight;
						}
						if (size[1] < oB.settings.contentMinWidth) {
							size[1] = oB.settings.contentMinWidth;
						}
						return size;
					}

				//Set Window Margin
					function setWindowMargin(cH, w) {
						var copied_elem = $('<div>' + title + '</div>').css({visibility: "hidden", display: "block", position:"absolute", width: w - 40, "line-height": "1.625em"});
						$("body").append(copied_elem);
						var h = copied_elem.height();
						copied_elem.remove();
						$('#ob_content').css('margin-top', h + 44);
						$('#ob_title').css('bottom', cH);
					}

				//Set Modal Properties
					function setModalProperties() {
						var p = $(window).scrollTop();
						var dim = getDim();
						if (p === 0) {
							p = $(document).scrollTop();
						}
						if (p === 0) {
							p = window.pageYOffset;
						}
						if (content.attr('id') !== "ob_error") {
							$('#ob_content').append('<div id="ob_title"></div>');
							if (obj.data('ob_data').ob_link) {
								var target = 'target="_blank"';
								if (obj.data('ob_data').ob_linkTarget === "_self") {
									target = 'target="_self"';
								}
								if (obj.data('ob_data').ob_linkText) {
									title = title + ' <a href="' + obj.data('ob_data').ob_link + '" ' + target + ' >' + obj.data('ob_data').ob_linkText + '</a>';
								} else {
									title = title + ' <a href="' + obj.data('ob_data').ob_link + '" ' + target + ' >' + obj.data('ob_data').ob_link + '</a>';
								}
							}
							$('#ob_title').append(title).click(function (e) { e.stopPropagation(); });
							if (oB.settings.addThis && contentType !== "iframe" && contentType !== "inline" && obj.data('ob_data').ob_share !== "false") {
								$('#ob_share').empty().remove();
								var addThis = $('<a id="ob_share" class="addthis_button_compact"></a>');
								var shareHTML = $('<span class="at300bs at15nc at15t_compact"></span>').css('display', 'inline-block');
								addThis.addClass("ob_share-" + title.replace(/ /g, "_"));
								if (title === "") {
									title = "share";
								}
								$('#ob_title').append(addThis);
								addthis.button('.ob_share-' + title.replace(/ /g, "_"), {
									services_compact: 'twitter,facebook,digg,delicious,more',
									ui_offset_left: -244,
									ui_offset_top: 4
								}, {
									url: ob_link,
									title: title
								});
								$('#ob_share').html('').append(shareHTML);
							}
							setWindowMargin(dim[0] + (oB.settings.contentBorderWidth * 2), dim[1]);
							if (obj.data('ob_data').ob_caption) {
								ob_caption.append('<p>' + obj.data('ob_data').ob_caption + '</p>');
								$('#ob_content').append(ob_caption);
							}
						}
						$("#ob_container").css({
							"margin-top": p
						});
						$('#ob_float').css({
							"margin-bottom": -(dim[0] + (oB.settings.contentBorderWidth * 2) + 44) / 2
						});
						$('#ob_content').css({
							"min-height": dim[0],
							"width": dim[1]
						});
					}

				//Update Navigation
					function setControls() {
						if (oB.settings.showDots) {
							$('#ob_dots').find('li').each(function () {
								var i = 'ob_dot' + obj.data('ob_data').ob_index;
								if ($(this).attr('id') === i) {
									$(this).addClass('current');
								} else {
									$(this).removeClass('current');
								}
							});
						}
						if (oB.settings.showNav) {
							if (oB.currentGallery[currentIndex + 1]) {
								$('#ob_content').append(navRight);
							}
							if (oB.currentGallery[currentIndex - 1]) {
								$('#ob_content').append(navLeft);
							}
						}
						clearTimeout(oB.controlTimer);
						if (oB.settings.fadeControls) {
							if (!oB.currentGallery[currentIndex + 1] || !oB.currentGallery[currentIndex - 1] || initial) {
								$('.ob_controls').fadeIn(oB.settings.fadeTime);
							}
							oB.controlTimer = setTimeout(function () {
								$('.ob_controls').fadeOut(oB.settings.fadeTime);
							}, 1200);
							$(document).mousemove(function (event) {
								clearTimeout(oB.controlTimer);
								oB.controlTimer = setTimeout(function () {
									$('.ob_controls').fadeIn(oB.settings.fadeTime);
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
					
				//Fade the Window In
					function fadeit() {
						oB.methods.showLoad("stop");
						$('#ob_content').fadeIn(oB.settings.fadeTime, function () {
							if (initial && oB.settings.logging === "debug") {
								console.log('OrangeBox: Initialized: ID:' + currentIndex + ' href:"' + href + '" link:"' + ob_link + '"');
								$(document).trigger('oB_init');
							} else if (oB.settings.logging === "debug") {
								console.log('OrangeBox: ID:' + currentIndex + ' href:"' + href + '" link:"' + ob_link + '"');
							}
							$('#ob_overlay').css("height", $(document).height());
							oB.progress = null;
						});
					}
					
				//Build the Window
					function buildit() {
						$('#ob_content').append(content.addClass('ob_contents'));
						if (oB.settings.fadeCaption) {
							ob_caption.hide();
							$('#ob_content').hover(function () {
								$('#ob_caption').stop().fadeTo(oB.settings.fadeTime, 0.95);
							}, function () {
								$('#ob_caption').stop().fadeOut(oB.settings.fadeTime);
							});
						}
						if (contentType === "jw") {
							jwplayer("ob_video").setup({
								flashplayer: "/orangebox/jw/player.swf",
								autostart: true,
								file: href,
								events: {
									onComplete: function () {
										if (oB.playing) {
											oB.methods.navigate(1);
										}
									},
									onReady: fadeit()
								},
								width: content.css('width'),
								height: content.css('height')
							});
							$('#ob_content').addClass('jw_player');
						} else {
							fadeit();
						}
						setModalProperties();
						setControls();
						if (oB.playing && contentType !== "jw") {
							var delayTimer = oB.settings.slideshowTimer;
							if (obj.data('ob_data').ob_delayTimer) {
								delayTimer = parseInt(obj.data('ob_data').ob_delayTimer, 10) + parseInt(oB.settings.slideshowTimer, 10);
							}
							oB.slideshowTimer = setTimeout(function () {
								oB.methods.navigate(1);
							}, delayTimer);
						}
						
					}

				//Error Content
					function throwError() {
						content = $('<div id="ob_error">' + oB.settings.notFound + '</div>');
						oB.methods.showLoad("stop");
						$('#ob_content').append(content);
						$('#ob_content').fadeIn(oB.settings.fadeTime, function () {
							$('#ob_overlay').css({
								"height": $(document).height()
							});
							if (oB.settings.logging) {
								console.log('OrangeBox: Could not find file');
							}
						});
						clearTimeout(oB.controlTimer);
						clearTimeout(oB.slideshowTimer);
						clearTimeout(oB.scrollTimer);
						$(document).unbind("keydown").unbind("mousemove");
						setModalProperties();
					}

				//iFrame Content
					function showiFrame() {
						var dim = oB.methods.getSize(obj, [0, 0], false);
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
						var dim = oB.methods.getSize(obj, [0, 0], true);
						if (href.indexOf('?') > 0) {
							href = href.substr(0, href.indexOf('?'));
						}
						if ($(href).length && $(href).html() !== "") {
							content = $('<div id="ob_inline">' + $(href).html() + '</div>').css({
								"width": dim[1]
							});
							if (dim[0] !== 0) {
								content.css("height", dim[0]);
							}
							buildit();
						} else {
							throwError();
						}
					}

				//Video Content
					function showVideo() {
						var i;
						var dim = oB.methods.getSize(obj, [0, 0], false);
						var a = 'height="100%" width="100%" type="text/html" frameborder="0" hspace="0" scrolling="auto"';
						var iI;

					//JW
						if (contentType === "jw") {
							content = $('<div id="ob_video" height="' + dim[0] + '" width="' + dim[1] + '"></div>');
						}

					//Vimeo	
						else if (contentType === "vimeo") {
							iI = href.indexOf("vimeo.com/") + 10;
							if (href.indexOf("?") > iI) {
								i = href.substring(iI, href.indexOf("?"));
							} else {
								i = href.substring(iI);
							}
							content = $('<iframe id="ob_video" ' + a + ' src="http://player.vimeo.com/video/' + i + '?title=0&byline=0&portrait=0&autoplay=1&wmode=transparent"></iframe>');
						}

					//Viddler (player)
						else if (contentType === "viddler") {
							if (href.indexOf("viddler.com/player/") > 0) {
								iI = href.indexOf("viddler.com/player/") + 19;
							} else if (href.indexOf("viddler.com/simple/") > 0) {
								iI = href.indexOf("viddler.com/simple/") + 19;
							}
							if (href.indexOf("?") > iI) {
								i = href.substring(iI, href.indexOf("?"));
							} else {
								i = href.substring(iI);
							}
							i = i.replace(/\//g, '');
							content = $('<iframe id="ob_video" ' + a + ' src="http://cdn.static.viddler.com/flash/publisher.swf?key=' + i + '&title=0&byline=0&portrait=0&autoplay=1&wmode=transparent"></iframe>');
						}

					//Flash
						else if (contentType === "flash") {
							content = $('<div id="ob_video"><embed flashVars="playerVars=autoPlay=yes" src="' + href + '" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer" allowFullScreen="true" allowScriptAccess="always" width="' + dim[1] + '" height="' + dim[0] + '" type="application/x-shockwave-flash"></embed></div>');
						}
						content.css({
							"width": dim[1],
							"height": dim[0],
							"background-color": "#000000"
						});
						buildit();
					}

				//Image Content
					function showImage() {
						var img = new Image();
						content = $(img);
						content.load(function () {
							var oSize = [img.height, img.width];
							var sSize = [obj.data('ob_data').ob_size[0], obj.data('ob_data').ob_size[1]];
							if (sSize[0] > 0 && sSize[1] === 0) {
								sSize[1] = oSize[1] / oSize[0] * sSize[0];
							} else if (sSize[1] > 0 && sSize[0] === 0) {
								sSize[0] = oSize[0] / oSize[1] * sSize[1];
							} else if (sSize[0] === 0 && sSize[1] === 0) {
								sSize[0] = oSize[0];
								sSize[1] = oSize[1];
							}
							obj.data('ob_data').ob_size[0] = sSize[0];
							obj.data('ob_data').ob_size[1] = sSize[1];
							var dim = oB.methods.getSize(obj, [0, 0], false);
							var running = false;
							$('#ob_content').unbind('click').click(function (e) {
								e.stopPropagation();
								var fullDim = oB.methods.getSize(false, [oSize[0], oSize[1]], true);
								var newDim = oB.methods.getSize(obj, [0, 0], false);
								var setDim;
								var p = $(window).scrollTop();
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
									setWindowMargin(setDim[0] + (oB.settings.contentBorderWidth * 2), setDim[1]);
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
							if (dim[0] < oB.settings.contentMinHeight) {
								var margin = (oB.settings.contentMinHeight / 2) - (dim[0] / 2);
								content.css("margin-top", margin);
							}
							content.css({
								"height": dim[0],
								"width": dim[1]
							});
							buildit();
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
					case "jw":
					case "quicktime":
					case "vimeo":
					case "viddler":
					case "flash":
						showVideo();
						break;
					default:
						if (oB.settings.logging) {
							console.log('OrangeBox: Unsupported Media: ' + href);
						}
					}
				},
				navigate: function (d, i, o) {
					if (o) {
						$.extend(oB.settings, o);
					}
					if (!i) {
						if (d === 1) {
							i = parseInt($('#ob_content').attr('class').substr(7), 10) + 1;
						} else if (d === -1) {
							i = parseInt($('#ob_content').attr('class').substr(7), 10) - 1;
						}
					}
					if (oB.currentGallery[i]) {
						oB.progress = true;
						$(document).trigger('oB_navigate', [i]);
						$('#ob_content').fadeOut(oB.settings.fadeTime, function () {
							if ($('#ob_content').hasClass('jw_player')) {
								try {
									jwplayer("ob_video").remove();
								} catch (error) {
									if (oB.settings.logging) {
										console.log('OrangeBox: ' + error);
									}
								}
							}
							$(this).removeClass('expanded').css({
								"min-height": ''
							}).empty();
							oB.delayTimer = $(oB.currentGallery[i]).data('ob_data').ob_delayTimer;
							oB.methods.showContent($(oB.currentGallery[i]));
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
					var loadTimer, ob_load = $('<div id="ob_load"></div>').hide();
					if (x === "stop") {
						clearTimeout(loadTimer);
						$('#ob_load').remove();
					} else {
						clearTimeout(loadTimer);
						$("body").append(ob_load);
						loadTimer = setTimeout(function () {
							$('#ob_load').fadeIn();
						}, 600);
					}
				},
				destroy: function (o, x) {
					$(document).trigger('oB_closing');
					if (o) {
						$.extend(oB.settings, o);
					}
					oB.methods.showLoad("stop");
					clearTimeout(oB.controlTimer);
					clearTimeout(oB.slideshowTimer);
					clearTimeout(oB.scrollTimer);
					if (oB.settings.orangeControls) {
						$(document).orangeControls('destroy', oB.settings.fadeTime);
					}
					$(document).unbind("keydown").unbind("mousemove");
					$('#ob_overlay').fadeOut(oB.settings.fadeTime, function () {
						$(this).remove().empty();
					});
					$('#ob_container').fadeOut(oB.settings.fadeTime, function () {
						if ($('#ob_content').hasClass('jw_player')) {
							try {
								jwplayer("ob_video").remove();
							} catch (error) {
								if (oB.settings.logging) {
									console.log('OrangeBox: ' + error);
								}
							}
						}
						$(this).remove().empty();
						$(document).trigger('oB_closed');
						if (x && $.isFunction(x)) {
							x();
						}
					});
				},
				getSize: function (obj, s, noMaxHeight) {
					var mSize = [$(window).height() - 44, $(window).width() - 44];
					if (oB.docWidth > $(window).width()) {
						mSize[1] = oB.docWidth - 44;
					}
					if (oB.settings.showNav) {
						mSize[1] = mSize[1] - 120;
					}
					if (obj) {
						s[0] = obj.data('ob_data').ob_size[0];
						s[1] = obj.data('ob_data').ob_size[1];
						var m = obj.data('ob_data').ob_max;
						if (m[0] === 0) {
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
					return s;
				},
				getUrlVars: function () {
					var i, vars = [], hash, hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
					for (i = 0; i < hashes.length; i++) {
						hash = hashes[i].split('=');
						vars.push(hash[0]);
						vars[hash[0]] = hash[1];
					}
					return vars;
				}
			}
		};

		$.fn.orangeBox = function (method) {
			if (method === "showContent" || method === "setupData" || method === "getSize" || method === "getUrlVars") {
				if (oB.settings.logging) {
					console.log('OrangeBox: ' + method + ' cannot be called externally');
				}
				return false;
			} else if (oB.methods[method]) {
				return oB.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method === 'object' || !method) {
				return oB.methods.init.apply(this, arguments);
			} else {
				if (oB.settings.logging) {
					console.log('OrangeBox: Method ' + method + ' does not exist in OrangeBox');
				}
				return false;
			}
		};
	})(jQuery);
}
jQuery(document).ready(function ($) {
	if (typeof orangebox_vars !== "undefined") {
		$('a[rel*=lightbox]').orangeBox(orangebox_vars);
	} else {
		$('a[rel*=lightbox]').orangeBox();
	}
	var orangebox = oB.methods.getUrlVars()['orangebox'];
	if (typeof orangebox !== 'undefined') {
		if (orangebox.indexOf('#.') > 0) {
			orangebox = orangebox.substr(0, orangebox.indexOf('#.'));
		}
		orangebox = decodeURIComponent(orangebox);
	}
	function checkURL() {
		if (orangebox.match(/^\w{1,}$/) && $('#' + orangebox).length > 0) {
			oB.methods.create($('#' + orangebox));
		} else {
			$('a[rel*=lightbox]').each(function () {
				if ($(this).attr('rel').indexOf(orangebox) >= 0) {
					oB.methods.create($(this));
					return false;
				} else if ($(this).attr('href').indexOf(orangebox) >= 0) {
					oB.methods.create($(this));
					return false;
				}
			});
		}
	}
	if (oB.settings.addThis) {
		$.getScript('http://s7.addthis.com/js/250/addthis_widget.js#pubid=ra-4dd42f2b5b9fc332', function () {
			if (typeof orangebox !== 'undefined') {
				checkURL();
			}
		});
	} else if (typeof orangebox !== 'undefined') {
		checkURL();
	}
	if (oB.settings.orangeControls === true && !$().orangeControls) {
		if (oB.settings.logging) {
			console.log('OrangeBox: Connection with OrangeControls failed');
		}
		oB.settings.orangeControls = false;
	}
});