var initGridHover = function () {
        $(".grid-content").mouseenter(function () {
            var target = $(this).data("color-target");
            $(target).addClass('grid-hover');
        }).mouseleave(function () {
            var target = $(this).data("color-target");
            $(target).removeClass('grid-hover');
        });
    },

    initToggles = function () {
        $('[data-action="toggle"]').on('click', function () {
            var $self = $(this),
                target = $self.data('target'),
                toggle = $self.data('toggle');
            $(target).toggleClass(toggle);
        });
    },

    initPushAction = function () {
        $('.push-action').on('click', function () {
            var $target = $('body'),
                toggle = 'push';
            $target.addClass(toggle);
            setTimeout(function () {
                $target.addClass('pushed');
            }, 1500);
        });
    },

    initTooltips = function () {
        $("a[title]").tooltip();
    },

    tipToggle = function (message) {
        var $target = $('.rating-tip');
        $target.text($target.data(message));
        $target.show();
        setTimeout(function () {
            $target.hide();
        }, 2500);
    },

    focusSearch = function () {
        $('body').delegate('.search-toggle', 'click', function () {
            $('.search-field').focus();
        });
    },

    initRating = function () {
        var $target = $('#rating');
		
        if ($target && $target.length != 0) {
            var instance = $target.barrating({
                    theme: 'css-stars',
                    initialRating: $target.data('rating'),
                    onSelect: function (value, text, event) {

                        //If the value was set via click then POST the Value
                        if (typeof(event) !== 'undefined') {
                            $.ajax({
                                type: "POST",
                                url: "/post-rating",
                                data: { id: $target.data('post-id'), rating: $target.find(':selected').val() },
                                success: function (data) {
                                    //tipToggle('success');
									$('.rating-container').attr('title', data.new_rating);
                                    $target.barrating('set', parseInt(data.new_rating));
                                    $target.barrating('readonly', true);
									
									console.log(data.new_rating);
                                },
                                error: function (data) {
                                    //tipToggle('error');
                                }
                            });
                        }
                    }
                }
            );
        }
    },
	
	initIndicatorRating = function () {
		var $target = $('#indicator_rating');

		if ($target && $target.length != 0) {
			var instance = $target.barrating({
					theme: 'css-stars',
					initialRating: $target.data('rating'),
					onSelect: function (value, text, event) {

						//If the value was set via click then POST the Value
						if (typeof(event) !== 'undefined') {
							$.ajax({
								type: "POST",
								url: "/indicator-rating",
								data: { id: $target.data('indicator-id'), rating: $target.find(':selected').val() },
								success: function (data) {
									//tipToggle('success');
									$('.rating-container').attr('title', data.new_rating);
									$target.barrating('set', parseInt(data.new_rating));
									$target.barrating('readonly', true);

									console.log(data.new_rating);
								},
								error: function (data) {
									//tipToggle('error');
								}
							});
						}
					}
				}
			);
		}
	},

    initReadOnlyRating = function () {
        var $target = $('.rating');
        if ($target && $target.length != 0) {
            $target.barrating({
                theme: 'css-stars',
                initialRating: $target.data('rating'),
                readonly: true
            });
        }
    },

    initAutoPush = function () {
        var anchor = $(location).attr('href'),
            section = anchor.indexOf('#') != -1 ? anchor.slice(anchor.indexOf('#') + 1) : '',
            $target = $('body');
		
        if (section && section === 'indicador') {
            Pace.once('done', function () {
                $target.addClass('push');
                setTimeout(function () {
                    $target.addClass('pushed');
                }, 1500);
            });
        }
    },

    initScrollMonitor = function () {
        var $target = $('body');
        Pace.once('done', function () {
            $(window).one('touchend', function () {
                $target.addClass('push');
                setTimeout(function () {
                    $target.addClass('pushed');
                }, 1500);
            });
        });
    };  


$(function () {
    initAutoPush();
    initPushAction();
    initToggles();
    initScrollMonitor();
    initGridHover();
    initReadOnlyRating();
    initTooltips();
    initRating();
	initIndicatorRating();
    focusSearch();

    $('.grid-one').find('li:first-child').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});

	$('.grid-two').find('li:first-child').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});
	
	$('.grid-two').find('li:nth-child(3)').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});

	$('.grid-three').find('li:first-child').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});

	$('.grid-three').find('li:nth-child(2)').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});
	
	$('.grid-three').find('li:nth-child(3)').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});

	$('.grid-three').find('li:nth-child(4)').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});
	
	$('.grid-three').find('li:nth-child(5)').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});

	$('.grid-three').find('li:nth-child(6)').click(function(e) {
		var url = $(this).data('url');
		window.location.replace(url);
	});
});

