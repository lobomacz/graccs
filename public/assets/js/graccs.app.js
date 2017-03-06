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

 

function drawGraphics(chartData) {
    var chart;
    var graph;

    if (window.AmCharts) {
        AmCharts.ready(function () {
            // SERIAL CHART
            chart = new AmCharts.AmSerialChart();

            chart.dataProvider = chartData;
            chart.marginLeft = 10;
            chart.categoryField = "year";
            chart.dataDateFormat = "YYYY";

            // listen for "dataUpdated" event (fired when chart is inited) and call zoomChart method when it happens
            // chart.addListener("dataUpdated", zoomChart);

            // AXES
            // category
            var categoryAxis = chart.categoryAxis;
            categoryAxis.parseDates = true; // as our data is date-based, we set parseDates to true
            categoryAxis.minPeriod = "YYYY"; // our data is yearly, so we set minPeriod to YYYY
            categoryAxis.dashLength = 3;
            categoryAxis.minorGridEnabled = true;
            categoryAxis.minorGridAlpha = 0.1;

            // value
            var valueAxis = new AmCharts.ValueAxis();
            valueAxis.axisAlpha = 0;
            valueAxis.inside = true;
            valueAxis.dashLength = 3;
            chart.addValueAxis(valueAxis);

            // GRAPH
            graph = new AmCharts.AmGraph();
            graph.type = "smoothedLine"; // this line makes the graph smoothed line.
            graph.lineColor = "#d1655d";
            graph.negativeLineColor = "#637bb6"; // this line makes the graph to change color when it drops below 0
            graph.bullet = "round";
            graph.bulletSize = 8;
            graph.bulletBorderColor = "#FFFFFF";
            graph.bulletBorderAlpha = 1;
            graph.bulletBorderThickness = 2;
            graph.lineThickness = 2;
            graph.valueField = "value";
            /* graph.balloonText = "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>";*/
            chart.addGraph(graph);

            // CURSOR
            /*  var chartCursor = new AmCharts.ChartCursor();
                chartCursor.cursorAlpha = 0;
                chartCursor.cursorPosition = "mouse";
                chartCursor.categoryBalloonDateFormat = "YYYY";
                chart.addChartCursor(chartCursor);*/

            // SCROLLBAR
            /*  var chartScrollbar = new AmCharts.ChartScrollbar();
                chart.addChartScrollbar(chartScrollbar);*/

            chart.creditsPosition = "bottom-right";

            // WRITE
            chart.write("chartdiv");
        });   
    }

    // this method is called when chart is first inited as we listen for "dataUpdated" event
    function zoomChart() {
        // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
        chart.zoomToDates(new Date(1972, 0), new Date(1984, 0));
    }
}   


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

    //drawGraphics();
});

