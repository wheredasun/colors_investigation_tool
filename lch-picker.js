(function ( $ ) {
    $.fn.lchPicker = function(options) {

        var $el = this;
        var settings = $.extend({}, options );

        $el.addClass('lchPicker-component');

        var hueSelector = document.createElement('canvas');
        hueSelector.width = "30";
        hueSelector.height = "360";

        var hueSelectorContext = hueSelector.getContext('2d');

        for (var i = 0; i < 360; i += 1) {
            var color = ColorPicker.space.lchab.hsl([
                50,
                100,
                i // scale to H range
            ]);

            // console.log(color);
            hueSelectorContext.fillStyle = "hsl(" + color[0] + "," + color[1] + "%," + color[2] + "%)";

            hueSelectorContext.fillRect(0, i, hueSelector.height, 1);

        }



        var $hueSelector = $(hueSelector);


        // var $palette = $("<div />");

        return $el.append($hueSelector);
    };

}( jQuery ));
