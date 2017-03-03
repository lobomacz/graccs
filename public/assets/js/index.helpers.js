var viewportWidth = $('body').width(),
    viewportHeight = $('body').height(),


    smartGridHeight = function () {
        var $target = $('.grid-wrapper'),
            viewportHeight = $('body').height(),
            discount = 350;
        $target.css('height', viewportHeight - discount);
    },

    initScreenObserver = function () {
        if (viewportWidth >= 768 && viewportHeight > 768) {
            $(window).smartresize(function () {
                smartGridHeight();
            });
        }

    },

    gridClassify = function () {

        var hash = {
            0: 'grid-empty',
            2: 'grid-one',
            4: 'grid-two',
            6: 'grid-three'
        };

        var $target = $('.grid');
        $target.addClass(hash[$target.find('> li').length]);


    };


$(function () {

    new WOW().init();
    gridClassify();
    initScreenObserver();
    smartGridHeight();


});