(function ( $ ) {

    function guessColor(color) {
        if (typeof color === 'string' || color instanceof String) {
            // try to use string to construct converter
            var index = color.indexOf("(");
            if (index != -1) {
                var converter = color.substring(0, index);
                var values = color.substring(index + 1, color.indexOf(")")).split(',');

                color = ColorPicker.space[converter].lchab(values);
            } else {
                $.error("Can't guess init color for jQuery.lchPicker");
            }
        } else if (color instanceof Array && color.length === 3) {
            // assume it is lch
            // do nothing
        } else {
            $.error("Can't guess init color for jQuery.lchPicker");
        }

        return color;
    }

    var t = null;

    var methods = {
        _setColor: function(c) {
            var color = ColorPicker.space.lchab.hsl([
                c[0],
                c[1],
                c[2]
            ]);

            var hScale = d3.scale.linear()
                .domain([0, 360])
                .range([0, 200]);

            var lcScale = d3.scale.linear()
                .domain([0, 100])
                .range([0, 200]);

            this.find(".color-inner").css({
                backgroundColor: "hsl(" + color[0] + "," + color[1] + "%," + color[2] + "%)"
            });

            this.find(".lc-inner > i").css({
                top: lcScale(c[1]),
                left: lcScale(c[0])
            });

            this.find(".h > i").css({
                top: hScale(c[2]),
            });

            this.data('color', c);
        },

        _setLC: function(x, y) {
            var lcScale = d3.scale.linear()
                .domain([0, 200])
                .range([0, 100]);

            var c = this.data('color');
            c[0] = lcScale(x);
            c[1] = lcScale(y);

            this.lchPicker('_setColor', c);
        },
        _setH: function(h) {
            var hScale = d3.scale.linear()
                .domain([0, 200])
                .range([0, 360]);

            var c = this.data('color');
            c[2] = hScale(h);

            this.lchPicker('setValue', c);
        },

        getValue: function() {
            return this.data('color');
        },

        setValue: function(color) {
            // clearTimeout(t);

            var c = guessColor(color);

            var $el = this;

            var lcSelector = $el.find('.lcSelector')[0];

            var x = 0;
            var y = 0;
            var color = null;
            var h = c[2];
            var that = this;

            that.lchPicker('_setColor', c);

            // t = setTimeout(function() {

                var lcSelectorContext = lcSelector.getContext('2d');
                lcSelectorContext.clearRect(0, 0, lcSelector.width, lcSelector.height);

                for (y = 0; y < 100; y += 0.5) {
                    for (x = 0; x < 100; x += 0.5) {
                        color = ColorPicker.space.lchab.hsl([
                            x,
                            y,
                            h
                        ]);
                        lcSelectorContext.fillStyle = ["hsl(", color[0], ",", color[1], "%,", color[2], "%)"].join('');
                        lcSelectorContext.fillRect(x * 2, y * 2, 1, 1);
                    }
                }
            // }, 1);

        },
        init: function(options) {
            var $el = this;
            var settings = $.extend({}, options);

            var c = guessColor(settings.color || [0, 0, 0]);

            var picker = `
                <div class="lchPicker-component dropdown-menu">
                    <div class="lc">
                        <div class="lc-inner">
                            <i><b></b></i>
                        </div>
                    </div>
                    <div class="h">
                        <i></i>
                    </div>
                    <div class="color"></div>
                </div>
                `;
            var $picker = $(picker);


            var hSelector = document.createElement('canvas');
            hSelector.className = 'hSelector';
            hSelector.width = "30";
            hSelector.height = "200";

            var hSelectorContext = hSelector.getContext('2d');

            var hScale = d3.scale.linear()
                .domain([0, 360])
                .range([0, 200]);

            for (var i = 0; i < 360; i += 0.2) {
                var color = ColorPicker.space.lchab.hsl([
                    50,
                    100,
                    i
                ]);
                // console.log(color);
                hSelectorContext.fillStyle = "hsl(" + color[0] + "," + color[1] + "%," + color[2] + "%)";
                hSelectorContext.fillRect(0, hScale(i), hSelector.width, 1);
            }


            var lcSelector = document.createElement('canvas');
            lcSelector.className = 'lcSelector';
            lcSelector.width = "200";
            lcSelector.height = "200";

            var $hSelector = $(hSelector);
            var $lcSelector = $(lcSelector);

            // var $palette = $("<div />");

            var $color = $("<div class='color-inner'></div>");
            // $color.css({
            //    backgroundColor: '#ffcccc'
            // });


            $picker.find(".lc").append($lcSelector);
            $picker.find(".h").append($hSelector);
            $picker.find(".color").append($color);

            $el.append($picker);

            $el.lchPicker('setValue', c);

            // set handlers
            var $h = $el.find(".h");

            $h.on("mousedown touchstart", function () {
                $(document).on('mousemove touchmove', function(e) {
                    $el.lchPicker('_setH', e.pageY - $h.offset().top);
                });

                $(document).on('mouseup touchend', function(e) {
                    $el.lchPicker('_setH', e.pageY - $h.offset().top);
                    $(document).off("mousemove touchmove mouseup touchend");
                });
            });


            var $lc = $el.find(".lc-inner");

            $lc.on("mousedown touchstart", function () {
                $(document).on('mousemove touchmove', function(e) {
                    var x = e.pageX - $lc.offset().left;
                    var y = e.pageY - $lc.offset().top;

                    if (x > 0 && x < 200 && y > 0 && y < 200) {
                        // $el.lchPicker('_setLC', e.pageX - $lc.offset().left, e.pageY - $lc.offset().top);
                    } else if (x > 0 && x < 200) {
                        if (y >= 200 ) { y = 200; }
                        else if (y <= 0) { y = 0; }
                    } else if (y > 0 && y < 200) {
                        if (x >= 200 ) { x = 200; }
                        else if (x <= 0) { x = 0; }
                    } else {
                        return;
                    }

                    $el.lchPicker('_setLC', x, y);
                });

                $(document).on('mouseup touchend', function(e) {
                    var x = e.pageX - $lc.offset().left;
                    var y = e.pageY - $lc.offset().top;

                    if (x > 0 && x < 200 && y > 0 && y < 200) {
                        $el.lchPicker('_setLC', e.pageX - $lc.offset().left, e.pageY - $lc.offset().top);
                    } else if (x > 0 && x < 200) {
                        $el.lchPicker('_setLC', e.pageX - $lc.offset().left, null);
                    } else if (y > 0 && y < 200) {
                        $el.lchPicker('_setLC', null, e.pageY - $lc.offset().top);
                    }

                    $(document).off("mousemove touchmove mouseup touchend");
                });
            });

            // $(document).on("mouseup touchend", function () {
            //     $(document).off("mousemove touchmove mouseup touchend");
                // $(document).off("mousemove touchmove mouseup touchend");
            // });

            return $el;
        }
    };

    $.fn.lchPicker = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.lchPicker' );
        }

    };

}( jQuery ));
