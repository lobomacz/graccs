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
	
	test = function () {
		/*var html = "Otro <p>Some HTML";
		var div = document.createElement("div");
		div.innerHTML = html;
		var text = div.textContent || div.innerText || "";
		alert(text);*/

		$('li.grid-content > .set-top > p').each(function (i, element) {
			var $element = $(element);
			var html = $element.html();
			var href = $element.find('a:last-child').attr('href');
			$element.remove('a:last-child');
			
			var div = document.createElement("div");
			div.innerHTML = html;
			var text = (div.textContent || div.innerText || "").trim();
			text = text + '<a class="read-more" href="'+ href +'">Leer más</a>';
			
			$element.empty();
			$element.html(text);
		});

		$('li.grid-content > .set-bottom > p').each(function (i, element) {
			var $element = $(element);
			var html = $element.html();
			var href = $element.find('a:last-child').attr('href');

			var div = document.createElement("div");
			div.innerHTML = html;
			var text = (div.textContent || div.innerText || "").trim();
			
			if (text.endsWith('Leer más')) {
				text = text.substring(0, text.length - 8) + '<a class="read-more" href="'+ href +'">Leer más</a>';
			}

			$element.empty();
			$element.html(text);
		});
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
