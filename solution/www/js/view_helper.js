function makeMapFullScreen() {
    if (windowHeaderHeight === undefined) {
        windowHeaderHeight = $("#mapHeader").height();
        windowFooterHeight = $("#mapFooter").height();
    }
    $("#mapContainer").height($(window).height() - windowHeaderHeight - windowFooterHeight);
};

function optionsPaneAnimate(optHeigth) {
    if (optionsHideChecker) {
        $(".footer").animate({
            height: '45px'
        }, "fast");
        optionsHideChecker = false;
    } else {
        $(".footer").animate({
            height: optHeigth
        }, "fast");
        optionsHideChecker = true;
    }
};

$("#tilesDownload").click(function () {
    optionsPaneAnimate(45);
    startDownloadingTiles();
});

$(".about").click(function () {
    optionsPaneAnimate(45);
    $.mobile.changePage("../pages/about.html");
});

function changePage(file) {
    optionsPaneAnimate(45);
    $.mobile.changePage("../pages/" + file + ".html");
}