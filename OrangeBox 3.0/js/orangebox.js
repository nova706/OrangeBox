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
	function onYouTubePlayerAPIReady() {
		oB.APIready = true;
	}
	(function ($) {
		oB = {
			gallery: [],
			APIready: false,
			ytScript: false,
			quicktime: true,
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
				contentMinSize: [100, 200],
				iframeSize: [0.75, 0.75],
				inlineSize: [0, 0.5],
				maxImageSize: [0.75, 0.75],
				maxVideoSize: [390, 640],
				fadeTime: 200,
				slideshowTimer: 3000,
				streamItems: 10,
				logging: false,
				checkAlias: true
			},
			methods: {
				init: function (o) {
					if (!$('#ob_content').length) {
						if (o) {
							$.extend(oB.settings, o);
						}
						oB.windowURL = window.location.href;
						if (oB.windowURL.match(/(\&|\?)orangebox\=/)) {
							oB.windowURL = oB.windowURL.substr(0, oB.windowURL.search(/(\&|\?)orangebox\=/));
						}
						if (oB.ourl = oB.methods.getUrlVars()['orangebox']) {
							if (oB.ourl.match(/\#\.\w{1,}\.facebook/)) {
								oB.ourl = oB.ourl.substr(0, oB.ourl.search(/\#\.\w{1,}\.facebook/));
							}
							oB.ourl = decodeURIComponent(oB.ourl);
						}
						function checkURL() {
							if (oB.ourl.match(/^\w{1,}$/) && $('#' + oB.ourl).length > 0) {
								oB.methods.create($('#' + oB.ourl));
							} else {
								$('a[rel*=lightbox]').each(function () {
									if ($(this).attr('rel').indexOf(oB.ourl) !== -1 || $(this).attr('href').indexOf(oB.ourl) !== -1) {
										oB.methods.create($(this));
										return false;
									}
								});
							}
						}
						if (oB.settings.addThis) {
							$.getScript('http://s7.addthis.com/js/250/addthis_widget.js#pubid=ra-4dd42f2b5b9fc332', function () {
								if (oB.ourl) {
									checkURL();
								}
							});
						} else if (oB.ourl) {
							checkURL();
						}
						try {
							document.createEvent("TouchEvent");
							oB.touch = true;
							oB.methods.logit('Touch device detected', true);
						} catch (e) {
							oB.touch = false;
							oB.methods.logit('Touch device not detected', true);
						}
						if (typeof QT_WriteOBJECT === "undefined") {
							oB.quicktime = false;
						} else {
							oB.quicktime = false;
							if (navigator.plugins) {
								var i;
								for (i=0; i < navigator.plugins.length; i++ ) {
									if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) { 
										oB.quicktime = true;
									}
								}
							}
							if ((navigator.appVersion.indexOf("Mac") > 0) && (navigator.appName.substring(0,9) === "Microsoft") && (parseInt(navigator.appVersion) < 5) ) {
								oB.quicktime = true;
							}
						}
						if (oB.quicktime === false) {
							oB.methods.logit('Quicktime not loaded');
						}
						if (oB.settings.orangeControls === true && !$().orangeControls) {
							oB.methods.logit('Connection with OrangeControls failed');
							oB.settings.orangeControls = false;
						}
						oB.browser = $.browser;
						return this.each(function () {
							oB.methods.setupData($(this));
						});
					}
					return false;
				},
				setupData: function (o) {
					var u = o.attr('href'), c = false, s = [0, 0], m = 0, i = 0, t = "", g = false, rel = o.attr('rel'), id, alias = false, unique = true;
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
						return false;
					} else if (u) {
						if (typeof o.attr('title') !== "undefined") {
							t = o.attr('title');
						}
						if (u.match(/height\=\d{1,}/)) {
							s[0] = parseInt(u.match(/height\=\d{1,}/)[0].match(/\d{1,}/)[0], 10);
						}
						if (u.match(/width\=\d{1,}/)) {
							s[1] = parseInt(u.match(/width\=\d{1,}/)[0].match(/\d{1,}/)[0], 10);
						}
						if (u.match(/(\?|\&)(iframe\=true)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "iframe";
							m = oB.settings.iframeSize;
						} else if (u.match(/\.(?:jpg|jpeg|bmp|png|gif)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "image";
							m = oB.settings.maxImageSize;
						} else if (u.match(/\.pdf((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "pdf";
							u = "http://docs.google.com/viewer?url=" + encodeURIComponent(u) + "&embedded=true&iframe=true";
							m = oB.settings.iframeSize;
						} else if (u.match(/\.(?:mov|mp4|m4v|3gpp|3gpp2|avi|dv|m4a|m4b|m4p|mp3|caf|aiff|au|sd2|wav|snd|amr)((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/) && oB.quicktime) {
							c = "quicktime";
							m = oB.settings.maxVideoSize;
						} else if (u.match(/\.swf((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "flash";
							m = oB.settings.maxVideoSize;
						} else if (u.match(/^http:\/\/api\.flickr\.com\/services\/feeds\/.{1,}\.gne\?id\=\d{1,}\@.{1,}\&lang\=.{1,}\&format\=rss\_200/)) {
							c = "flickr";
							u = u.replace('rss_200', 'json') + "&jsoncallback=?";
							if (!rel.match(/\[/)) {
								g = 'flickr' + newDate.getTime();
							}
							$.getJSON(u, function (data) {
								$.each(data.items, function (index, item) {
									var item_href = item.media.m.replace('_m.jpg', '.jpg');
									if (index === 0) {
										o.attr({
											href: item_href,
											"data-ob_share": "false",
											title: item.title
										});
										oB.methods.setupData(o);
									} else if (index < oB.settings.streamItems) {
										oB.methods.setupData($('<a href="' + item_href + '" data-ob_linkText="' + o.attr('data-ob_linkText') + '" data-ob_link="' + o.attr('data-ob_link') + '" data-ob_linkTarget="' + o.attr('data-ob_linkTarget') + '" data-ob_delayTimer="' + o.attr('data-ob_delayTimer') + '" data-ob_share="false" title="' + item.title + '" rel="lightbox[' + g + ']"></a>'));
									} else {
										return false;
									}
								});
							});
						} else if (u.match(/^https:\/\/picasaweb\.google\.com\/data\/feed\/base\//)) {
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
										var picasaSrc;
										if (item.content) {
											picasaSrc = item.content.src;
										} else if (item.media$group.media$content[0]) {
											picasaSrc = item.media$group.media$content[0].url;
										} else {
											return false;
										}
										if (index === 0) {
											o.attr({
												href: picasaSrc,
												"data-ob_share": "false",
												"data-ob_caption": item.summary.$t,
												title: item.title.$t
											});
											oB.methods.setupData(o);
										} else if (index < oB.settings.streamItems) {
											oB.methods.setupData($('<a href="' + picasaSrc + '" data-ob_caption="' + item.summary.$t + '" data-ob_linkText="' + o.attr('data-ob_linkText') + '" data-ob_link="' + o.attr('data-ob_link') + '" data-ob_linkTarget="' + o.attr('data-ob_linkTarget') + '" data-ob_delayTimer="' + o.attr('data-ob_delayTimer') + '" data-ob_share="false" title="' + item.title.$t + '" rel="lightbox[' + g + ']"></a>'));
										} else {
											return false;
										}
									});
								}
							});
						} else if (u.match(/^http:\/\/\w{0,3}\.?youtube\.\w{2,3}\/watch\?v=[\w\-]{11}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							id = u.match(/\?v=\w{1,}/)[0].substring(3);
							c = "youtube";
							m = oB.settings.maxVideoSize;
							if (!oB.ytScript) {
								$.getScript('http://www.youtube.com/player_api');
								oB.ytScript = true;
							}
						} else if (u.match(/^http:\/\/\w{0,3}\.?vimeo\.com\/\d{1,10}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							id = u.match(/vimeo\.com\/\d{1,}/)[0].substring(10);
							c = "vimeo";
							m = oB.settings.maxVideoSize;
						} else if (u.match(/^http:\/\/\w{0,3}\.?viddler\.com\/(?:simple|player)\/\w{1,10}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							id = u.match(/viddler\.com\/(player|simple)\/\w{1,}/)[0].substring(19);
							c = "viddler";
							m = oB.settings.maxVideoSize;
						} else if (u.match(/^#\w{1,}((\?|\&)(width\=\d+(\&height\=\d+)?|height\=\d+(\&width\=\d+)?))?$/)) {
							c = "inline";
							m = oB.settings.inlineSize;
							if (s[0] === 0) {
								s[0] = m[0];
							}
							if (s[1] === 0) {
								s[1] = m[1];
							}
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
								"max": m,
								gallery: g,
								index: i,
								contentType: c,
								href: u,
								title: t,
								linkText: o.attr('data-ob_linkText'),
								"link": o.attr('data-ob_link'),
								caption: o.attr('data-ob_caption'),
								linkTarget: o.attr('data-ob_linkTarget'),
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
						return false;
					}
				},
				create: function (obj, o) {
					if (!$('#ob_content').length) {
						if (o) {
							$.extend(oB.settings, o);
						}
						if (!obj) {
							if (this instanceof jQuery) {
								obj = this;
							} else {
								obj = $(this);
							}
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
									return;
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
						ob_caption = $('<div id="ob_caption"></div>').css("opacity", 0.95).click(function (e) {
							e.stopPropagation();
						}),
						href_encode = encodeURIComponent(href),
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
					if(oB.windowURL.match(/\?/)) {
						ob_link = oB.windowURL + "&orangebox=" + href_encode;
					} else {
						ob_link = oB.windowURL + "?orangebox=" + href_encode;
					}
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

				//Set Height and Width
					function getDim() {
						var size = [content.outerHeight(), content.outerWidth()];
						if (obj.data('oB').css) {
							size = obj.data('oB').css;
						}
						if (content.css('padding-left')) {
							obj.data('oB').css[2] = parseInt(content.css('padding-left').replace('px', ''), 10) * 2;
							size[1] += obj.data('oB').css[2];
						}
						if (obj.data('oB').css[0] === 0 && contentType === "inline") {
							var copied_elem = $(href).clone().attr("id", false).css({visibility: "hidden", display: "block", position: "absolute", "line-height": "1.625em", width: obj.data('oB').css[1] - obj.data('oB').css[2]});
							$("body").append(copied_elem);
							size[0] = copied_elem.height() + obj.data('oB').css[2];
							copied_elem.remove();
						} else if (contentType === "inline") {
							size[0] += obj.data('oB').css[2];
						}
						if (!size[0] && obj.data('oB').css[0]) {
							size[0] = obj.data('oB').css[0];
						}
						if (!size[1] && obj.data('oB').css[1]) {
							size[1] = obj.data('oB').css[1];
						}
						if (content.attr('id') !== "ob_error" && size[0] < oB.settings.contentMinSize[0]) {
							size[0] = oB.settings.contentMinSize[0];
						}
						if (size[1] < oB.settings.contentMinSize[1]) {
							size[1] = oB.settings.contentMinSize[1];
						}
						return [Math.round(size[0]), Math.round(size[1])];
					}

				//Set Window Margin
					function setWindowMargin(cH, w) {
						var copied_elem = $('<div>' + title + '</div>').css({visibility: "hidden", display: "block", position: "absolute", width: w - 40, "line-height": $('#ob_title').css('font-size')});
						$("body").append(copied_elem);
						$('#ob_content').css('margin-top', copied_elem.height() + 44);
						$('#ob_title').css('bottom', cH);
						copied_elem.remove();
					}

				//Set Modal Properties
					function setModalProperties() {
						var p = $(window).scrollTop(),
							dim = getDim(),
							target = 'target="_blank"',
							addThis = $('<a id="ob_share" class="addthis_button_compact"></a>'),
							shareHTML = $('<span class="at300bs at15nc at15t_compact"></span>').css('display', 'inline-block');
						if (p === 0) {
							p = $(document).scrollTop();
						}
						if (p === 0) {
							p = window.pageYOffset;
						}
						if (content.attr('id') !== "ob_error") {
							$('#ob_content').append('<div id="ob_title"></div>');
							if (obj.data('oB').link && obj.data('oB').link !== "" && obj.data('oB').link !== "undefined") {
								if (obj.data('oB').linkTarget === "_self") {
									target = 'target="_self"';
								}
								if (obj.data('oB').linkText && obj.data('oB').linkText !== "undefined") {
									title = title + ' <a href="' + obj.data('oB').link + '" ' + target + ' >' + obj.data('oB').linkText + '</a>';
								} else {
									title = title + ' <a href="' + obj.data('oB').link + '" ' + target + ' >' + obj.data('oB').link + '</a>';
								}
							}
							$('#ob_title').append(title).click(function (e) { e.stopPropagation(); });
							if (oB.settings.addThis && contentType !== "iframe" && contentType !== "inline" && obj.data('oB').share !== "false") {
								$('#ob_share').empty().remove();
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
							if (obj.data('oB').caption) {
								ob_caption.append('<p>' + obj.data('oB').caption + '</p>');
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
							if (!oB.currentGallery[oB.currentIndex + 1] || !oB.currentGallery[oB.currentIndex - 1] || initial) {
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
						oB.methods.showLoad(1);
						$('#ob_content').fadeIn(oB.settings.fadeTime, function () {
							if (initial) {
								oB.methods.logit('Initialized: ID:' + oB.currentIndex + ' href:"' + href + '" link:"' + ob_link + '"', true);
								$(document).trigger('oB_init');
							} else {
								oB.methods.logit('ID:' + oB.currentIndex + ' href:"' + href + '" link:"' + ob_link + '"', true);
							}
							$('#ob_overlay').css("height", $(document).height());
							oB.progress = null;
						});
						if (contentType === "quicktime" && oB.playing) {
							var videoobj = $('#qt1').get(0);
							if (!videoobj) {
								videoobj = $('#qt_embed1').get(0);
							}
							if (videoobj) {
								if ( document.addEventListener ) {
									videoobj.addEventListener('qt_ended', function () { oB.methods.navigate(1); }, false);
								} else {
									videoobj.attachEvent('onqt_ended', function () { oB.methods.navigate(1); });
								}
							}
						}
					}

				//Build the Window
					function buildit() {
						var delayTimer = oB.settings.slideshowTimer;
						$('#ob_content').append(content.addClass('ob_contents'));
						if (oB.settings.fadeCaption && !oB.touch) {
							ob_caption.hide();
							$('#ob_content').hover(function () {
								$('#ob_caption').stop().fadeTo(oB.settings.fadeTime, 0.95);
							}, function () {
								$('#ob_caption').stop().fadeOut(oB.settings.fadeTime);
							});
						}
						if (contentType === "youtube" && oB.APIready) {
							function onPlayerStateChange(event) {
								if (event.data === YT.PlayerState.ENDED) {
									if (oB.playing) {
										oB.methods.navigate(1);
									}
								}
							}
							oB.player = new YT.Player('ob_video', {
								height: content.css('height'),
								width: content.css('width'),
								videoId: obj.data('oB').id,
								events: {
									'onStateChange': onPlayerStateChange
								},
								playerVars: {
									'autoplay': 1,
									'autohide': 1
								}
							});
							fadeit();
						} else {
							fadeit();
						}
						setModalProperties();
						setControls();
						if (oB.playing && contentType !== "youtube" && contentType !== "quicktime") {
							if (obj.data('oB').delayTimer) {
								delayTimer = parseInt(obj.data('oB').delayTimer, 10) + parseInt(oB.settings.slideshowTimer, 10);
							}
							oB.slideshowTimer = setTimeout(function () {
								oB.methods.navigate(1);
							}, delayTimer);
						}
					}

				//Error Content
					function throwError() {
						content = $('<div id="ob_error">' + oB.settings.notFound + '</div>');
						oB.methods.showLoad(1);
						$('#ob_content').append(content).css('width', 250).fadeIn(oB.settings.fadeTime, function () {
							$('#ob_overlay').css("height", $(document).height());
							oB.methods.logit('Could not find file');
						});
						clearTimeout(oB.controlTimer);
						clearTimeout(oB.slideshowTimer);
						clearTimeout(oB.scrollTimer);
						$(document).unbind("keydown").unbind("mousemove");
						setModalProperties();
					}

				//iFrame Content
					function showiFrame() {
						var dim = oB.methods.getSize(obj, [0, 0], false),
							newhref = href.replace(/(\?|\&)iframe\=true/, '');
						newhref = newhref.replace(/(\?|\&)width\=\d{1,}/, '');
						newhref = newhref.replace(/(\?|\&)height\=\d{1,}/, '');
						obj.data('oB').css = [dim[0], dim[1]];
						content = $('<iframe id="ob_iframe" frameborder="0" hspace="0" scrolling="auto" src="' + newhref + '"></iframe>').css({
							"height": dim[0],
							"width": dim[1]
						});
						buildit();
					}

				//Inline Content
					function showInline() {
						var dim = oB.methods.getSize(obj, [0, 0], true);
						if (href.match(/\?/)) {
							href = href.substr(0, href.indexOf("?"));
						}
						if ($(href).length && $(href).html() !== "") {
							obj.data('oB').css = dim;
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
						var dim = oB.methods.getSize(obj, [0, 0], false);
						switch (contentType) {
						case "quicktime":
							if (href.match(/\?/)) {
								href = href.substr(0, href.indexOf("?")) + '?width=' + dim[1] + '&height=' + dim[0];
							}
							content = $(QT_WriteOBJECT(href , dim[1], dim[0], '', 'AUTOPLAY', 'True', 'SCALE', 'Aspect', 'EnableJavaScript', 'True', 'postdomevents', 'True', 'emb#NAME' , 'qt1' , 'obj#id' , 'qt1', 'emb#id', 'qt_embed1'));
							break;
						case "youtube":
							content = $('<div id="ob_video" height="' + dim[0] + '" width="' + dim[1] + '"></div>').css("background-color", "#000000");
							break;
						case "vimeo":
							content = $('<iframe id="ob_video" height="100%" width="100%" type="text/html" frameborder="0" hspace="0" scrolling="auto" src="http://player.vimeo.com/video/' + obj.data('oB').id + '?title=0&byline=0&portrait=0&autoplay=1&wmode=transparent"></iframe>').css("background-color", "#000000");
							break;
						case "viddler":
							content = $('<iframe id="ob_video" height="100%" width="100%" type="text/html" frameborder="0" hspace="0" scrolling="auto" src="http://cdn.static.viddler.com/flash/publisher.swf?key=' + obj.data('oB').id + '&title=0&byline=0&portrait=0&autoplay=1&wmode=transparent"></iframe>').css("background-color", "#000000");
							break;
						case "flash":
							content = $('<div id="ob_video"><embed flashVars="playerVars=autoPlay=yes" src="' + href + '" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer" allowFullScreen="true" allowScriptAccess="always" width="' + dim[1] + '" height="' + dim[0] + '" type="application/x-shockwave-flash"></embed></div>');
							break;
						}
						obj.data('oB').css = [dim[0], dim[1]];
						content.css({
							"height": dim[0],
							"width": dim[1]
						});
						buildit();
					}

				//Image Content
					function showImage() {
						var img = new Image();
						content = $(img);
						content.load(function () {
							var oSize = [img.height, img.width],
								sSize = [0, 0],
								running = false;
							if (obj.data('oB').size) {
								sSize = [obj.data('oB').size[0], obj.data('oB').size[1]];
							}
							if (sSize[0] > 0 && sSize[1] === 0) {
								sSize[1] = oSize[1] / oSize[0] * sSize[0];
							} else if (sSize[1] > 0 && sSize[0] === 0) {
								sSize[0] = oSize[0] / oSize[1] * sSize[1];
							} else if (sSize[0] === 0 && sSize[1] === 0) {
								sSize = [oSize[0], oSize[1]];
							}
							obj.data('oB').size = sSize;
							var dim = oB.methods.getSize(obj, [0, 0], false),
								margin = (oB.settings.contentMinSize[0] / 2) - (dim[0] / 2);
							obj.data('oB').css = dim;
							$('#ob_content').unbind('click').click(function (e) {
								e.stopPropagation();
								var fullDim = oB.methods.getSize(false, [oSize[0], oSize[1]], true),
									newDim = oB.methods.getSize(obj, [0, 0], false),
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
							if (dim[0] < oB.settings.contentMinSize[0]) {
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
					case "quicktime":
					case "youtube":
					case "vimeo":
					case "viddler":
					case "flash":
						showVideo();
						break;
					default:
						oB.methods.logit('Unsupported Media: ' + href);
						return false;
					}
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
						if (oB.player && oB.player.destroy()) {
							oB.player.destroy();
						}
						$('#ob_content').fadeOut(oB.settings.fadeTime, function () {
							if ($('#ob_content').hasClass('jw_player')) {
								try {
									jwplayer("ob_video").remove();
								} catch (error) {
									oB.methods.logit(error);
								}
							}
							if (document.qt1 && document.qt1.Stop) {
								document.qt1.Stop();
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
						if (oB.player && oB.player.destroy()) {
							oB.player.destroy();
						}
						clearTimeout(oB.controlTimer);
						clearTimeout(oB.slideshowTimer);
						clearTimeout(oB.scrollTimer);
						if (oB.settings.orangeControls) {
							$(document).orangeControls('destroy', oB.settings.fadeTime);
						}
						$(document).unbind("keydown").unbind("mousemove");
						$('#ob_container').stop().fadeOut(oB.settings.fadeTime, function () {
							if ($('#ob_content').hasClass('jw_player')) {
								try {
									jwplayer("ob_video").remove();
								} catch (error) {
									oB.methods.logit(error);
								}
							}
							$(this).remove().empty();
							$(document).trigger('oB_closed');
							if (x && $.isFunction(x)) {
								x();
							}
						});
						$('#ob_overlay').fadeOut(oB.settings.fadeTime, function () {
							$(this).remove().empty();
							if($('#ob_container').length > 0) {
								$('#ob_container').remove();
							}
						});
					}
				},
				getSize: function (obj, s, noMaxHeight) {
					var mSize = [$(window).height() - 44, $(window).width() - 44];
					if (oB.docWidth > $(window).width()) {
						mSize[1] = oB.docWidth - 44;
					}
					if (oB.settings.showNav) {
						mSize[1] -= 120;
					}
					if (obj) {
						s = obj.data('oB').size, m = obj.data('oB').max;
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
				return false;
			} else if (oB.methods[method]) {
				return oB.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method === 'object' || !method) {
				return oB.methods.init.apply(this, arguments);
			} else {
				oB.methods.logit(method + ' does not exist in OrangeBox');
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
	$(document).trigger('oB_ready');
});