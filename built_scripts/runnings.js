exports.header = {
    height: "1.5cm",
    contents: function () {
        return "<div style='float:right; font-family: Roboto,sans-serif; font-size: 24px; font-weight: 500;'><span style='color: #263238;'>Stereo</span><span style='color: #0277bd;'>tech</span></div>";
    }
};
exports.footer = {
    height: "1cm",
    contents: function (pageNum, numPages) {
        return "<h6 style='font-family: Roboto,sans-serif;'>Stereotech LLC. <span style='float:right'>" + pageNum + " / " + numPages + "</span></h6>";
    }
};
//# sourceMappingURL=runnings.js.map