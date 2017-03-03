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


    newsGridClassify = function () {

        var hash = {
            0: 'grid-news-empty',
            1: 'grid-news-one',
            2: 'grid-news-two',
            3: 'grid-news-three',
            4: 'grid-news-four',
            5: 'grid-news-five'
        };

        var $target = $('.grid-news');
        $target.addClass(hash[$target.find('> li.grid-news-cover').length]);


    };

$(function () {
    newsGridClassify();
    initScreenObserver();
    smartGridHeight();

});