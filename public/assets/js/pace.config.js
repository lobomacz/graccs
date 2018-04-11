paceOptions = {
    ajax: false, // disabled
    eventLag: false // disabled
};

/*Dear network connection, you have twenty seconds to give me my page content */
setTimeout(function () {
    if (!$("body").hasClass('pace-done')) {
        Pace.stop();
    }
}, 20000);