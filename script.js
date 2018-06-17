// Math
function factorial(n) {
    var result = 1;
    for (var i = 2; i <= n; i++) {
        result = result * i;
    }
    return result;
}

function roundHalf(num) {
    return Math.round(num*2)/2;
}

// △
// △△
function triforce(d, i) {
    var n = i - d;

    if (n < 0) return 0;

    var num = n;
    var denom = factorial(d+1);

    for (var k = 1; k <= d; k++) {
        num *= (n + k);
    }

    return num/denom;
}
// isn't it just a binomial coefficient?


// Utils
function map(fn, list) {
    var i = 0,
        result = [];
    for (i = 0; i < list.length; i++) {
        result.push(fn(list[i]));
    }
    return result;
}


var ColorSpace = require('color-space');

function PreciseColor(color, model) {
    this.spaces = {
        rgb: [],
        hsv: [],
        lch: [],
        hsl: []
    };

    this.authenticModel = model;

    this.str = function (model) {
        if (model === 'hsl') {
            return model + "(" + this.spaces[model][0] + "," +
                this.spaces[model][1] + "%," +
                this.spaces[model][2] + "%)";
        }
        return model + "(" + map(Math.round, this.spaces[model]) + ")";
    };
    this.getColor = function (model) {
        return this.spaces[model];
    };
    this.setColor = function (color, model) {
        this.authenticModel = model;
        switch (model) {
            case 'rgb':
                this.spaces.rgb = color;
                this.spaces.hsv = ColorSpace.rgb.hsv(color);
                this.spaces.lch = ColorSpace.rgb.lchab(color);
                this.spaces.hsl = ColorSpace.rgb.hsl(color);
                break;
            case 'hsv':
                this.spaces.hsv = color;
                this.spaces.rgb = ColorSpace.hsv.rgb(color);
                this.spaces.lch = ColorSpace.hsv.lchab(color);
                this.spaces.hsl = ColorSpace.hsv.hsl(color);
                break;
            case 'lch':
                this.spaces.lch = color;
                this.spaces.rgb = ColorSpace.lchab.rgb(color);
                this.spaces.hsv = ColorSpace.lchab.hsv(color);
                this.spaces.hsl = ColorSpace.lchab.hsl(color);
                break;
            case 'hsl':
                this.spaces.hsl = color;
                this.spaces.rgb = ColorSpace.hsl.rgb(color);
                this.spaces.hsv = ColorSpace.hsl.hsv(color);
                this.spaces.lch = ColorSpace.hsl.lchab(color);
                break;
            default:
                throw new Error('model ' + model + ' is not defined');
        }
    };

    this.setColor(color, model);
}

var ColorPicker = {
    circles: [],
    deltas: [],
    space: ColorSpace,
    settings: {
        colorfulCircles: $("#colorful-circles").is(':checked')
    },
    color: new PreciseColor([264.52, 36.47, 100], 'hsv'),
    init: function () {

        var handler = function(e, color) {
            if (color) {
                ColorPicker.color.setColor(color, 'lch');
                $("#color-picker").colorpicker('setValue', ColorPicker.color.str('hsl'), false);
            } else {
                var color = e.color.value;

                ColorPicker.color.setColor([
                    color.h * 360,
                    color.s * 100,
                    color.b * 100
                ], 'hsv');

                $("#lch-picker").lchPicker('setValue', ColorPicker.color.getColor('lch'), false);
            }
            ColorPicker.updateSliders();
        };

        // color picker path
        $('#color-picker').colorpicker.constructor.prototype.setValue = function (val, triggerEvent) {

            triggerEvent = (typeof triggerEvent !== 'undefined') ? triggerEvent : true;

            this.color = this.createColor(val);
            this.update(true);

            if (triggerEvent) {
                this.element.trigger({
                    type: 'changeColor',
                    color: this.color,
                    value: val
                });
            }
        };

        // $(document).on('changeColor', handler);

        $("#lch-picker").lchPicker({
            color: ColorPicker.color.getColor('lch')
        }).on('changeColor', handler);


        $('#color-picker')
            .colorpicker({
                color: ColorPicker.color.str('hsl'),
                inline: true,
                container: true,
                format: 'rgb',
                customClass: 'colorpicker-2x',
                sliders: {
                    saturation: {
                        maxLeft: 200,
                        maxTop: 200
                    },
                    hue: {
                        maxTop: 200
                    }
                }
            })
        .on('changeColor', handler);

        ColorPicker.addDeltas();

        ColorPicker.addHandlers();

        $('#color-picker').colorpicker('setValue', ColorPicker.color.str('hsl'));

    },

    canvas: d3.select("#canvas").append("svg")
        .attr("width", 500)
        .attr("height", 210),

    HSVtoRGB: function (h, s, v) {
      return ColorPicker.space.hsv.rgb([h, s, v]);
    },

    map: function (fn, list) {
        var i = 0,
            result = [];
        for (i = 0; i < list.length; i++) {
            result.push(fn(list[i]));
        }
        return result;
    },

    renderColors: function() {

        var circles = ColorPicker.canvas.selectAll("circle")
            .data(ColorPicker.circles);

        circles.exit().remove();

        circles.enter()
            .append("circle");

        var circleAttributes = circles
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .attr("r", function (d) { return d.r; })
            .style("fill", function(d) { return d.color.str('rgb'); });


        // colorful circles - main circle
        ColorPicker._coloriseCircles( $(".colorpicker-saturation").find("i"), ColorPicker.color);
        ColorPicker._coloriseCircles( $(".lc-inner").find("i"), ColorPicker.color);

        // refactor to d3
        $('#color-picker .dot').remove();
        $('#color-picker .line').remove();

        $('#lch-picker .dot').remove();
        $('#lch-picker .line').remove();

        for (var i = 1; i < ColorPicker.circles.length; i++) {
            var previousColor = ColorPicker.circles[i-1].color;
            var color = ColorPicker.circles[i].color;

            //< this part is for lch
            var lchColor = color.getColor('lch');

            var hScale = d3.scale.linear()
                .domain([0, 360])
                .range([0, 200]);

            var lcScale = d3.scale.linear()
                .domain([0, 100])
                .range([0, 200]);
            //> this part was for lch

            if (color.getColor('hsv')[0] !== previousColor.getColor('hsv')[0]) {
                var $line = $("<span class='line'></span>");
                $('#color-picker .colorpicker-hue').append($line);
                $line.css('top', (200 - color.getColor('hsv')[0] / 360 * 200) + "px");

                var $line = $("<span class='line'></span>");
                $('#lch-picker .h').append($line);
                $line.css('top', hScale(lchColor[2]) + "px");
            }

            if (color.getColor('hsv')[1] !== previousColor.getColor('hsv')[1] ||
                color.getColor('hsv')[2] !== previousColor.getColor('hsv')[2]) {

                var $dot = $("<span class='dot'><b></b></span>");
                $('#color-picker .colorpicker-saturation').append($dot);
                $dot.css({
                    'top': (200 - color.getColor('hsv')[2] / 100 * 200) + "px",
                    'left': (color.getColor('hsv')[1] / 100 * 200) + "px"
                });

                ColorPicker._coloriseCircles($dot, color);

                var $dot = $("<span class='dot'><b></b></span>");
                $('#lch-picker .lc-inner').append($dot);
                $dot.css({
                    'top': lcScale(lchColor[1]) + "px",
                    'left': lcScale(lchColor[0]) + "px"
                });

                ColorPicker._coloriseCircles($dot, color);
            }
        }

        // render export canvases
        var canvas1x = document.getElementById("export-1x");
        var ctx1x = canvas1x.getContext("2d");
        ctx1x.clearRect(0, 0, canvas1x.width, canvas1x.height);

        var canvas2x = document.getElementById("export-2x");
        var ctx2x = canvas2x.getContext("2d");
        ctx2x.clearRect(0, 0, canvas2x.width, canvas2x.height);

        for (var i = 0; i < ColorPicker.circles.length; i++) {
            var d =  ColorPicker.circles[i];
            var color = d.color.str('rgb');

            ctx1x.fillStyle = color;
            ctx1x.fillRect(i, 6, 1, 1);

            ctx2x.fillStyle = color;
            ctx2x.fillRect(i * 2, 5, 2, 2);

        }

    },

    _coloriseCircles: function ($el, color) {
        if (ColorPicker.settings.colorfulCircles) {
            $el.find('b').css({
                'border-color': (new PreciseColor([
                    color.getColor('hsv')[0],
                    100,
                    100
                ], 'hsv')).str('hsl')
            });
        } else {
            $el.find('b').css('border-color', '#fff');
        }
    },

    addDeltas: function () {
        var deltaId = ColorPicker.deltas.length;

        var $separator = $(templates['separator']());
        var $deltas = $(templates['deltas']({id: deltaId}));

        $deltas.insertAfter( $("#deltas").find(".separator:last") );
        $separator.insertAfter( $deltas );

        ColorPicker.deltas.push([0,0,0]);

        // deltas
        $deltas.find(".reset").click(function() {
            ColorPicker.deltas[deltaId] = [
                0,
                0,
                0
            ];
            ColorPicker.updateDDeltasInputs(deltaId);
            ColorPicker.rerender();
        });

        $deltas.find(".range-reset").each(function(i, el){
            $(el).click(function(){
                ColorPicker.deltas[deltaId][i] = 0;
                ColorPicker.updateDDeltasInputs(deltaId);
                ColorPicker.rerender();
            });
        });

        $deltas.find(".dA-range, .dB-range, .dC-range").on('input change', function(){

            ColorPicker.deltas[deltaId] = [
                $deltas.find(".dA-range").val(),
                $deltas.find(".dB-range").val(),
                $deltas.find(".dC-range").val()
            ];
            ColorPicker.updateDDeltasInputs(deltaId);
            ColorPicker.rerender();
        });

        $deltas.find(".dA-number, .dB-number, .dC-number").on('input change', function(){

            ColorPicker.deltas[deltaId] = [
                $deltas.find(".dA-number").val(),
                $deltas.find(".dB-number").val(),
                $deltas.find(".dC-number").val()
            ];
            ColorPicker.updateDDeltasInputs(deltaId);
            ColorPicker.rerender();
        });

        // buttons
        ColorPicker.updateDButtons();
    },

    addHandlers: function () {
        $("#colorful-circles").change(function() {
            if (this.checked) {
                ColorPicker.settings.colorfulCircles = true;
            } else {
                ColorPicker.settings.colorfulCircles = false;
            }
            ColorPicker.rerender();
        });

        // Add and remove deltas
        $("#remove-deltas").click(function(){
            ColorPicker.deltas.pop();
            var deltaId = ColorPicker.deltas.length;

            $('#deltas-'+deltaId).remove();
            $(".separator:last").remove();

            ColorPicker.updateDButtons();
            ColorPicker.rerender();
        });

        $("#add-deltas").click(ColorPicker.addDeltas);

        // HSV
        $("#h-number, #s-number, #v-number").on('input', function(){
            $('#color-picker').colorpicker('setValue', ColorPicker.HSVtoHSB(
                    $("#h-number").val(),
                    $("#s-number").val(),
                    $("#v-number").val())
                );
        });

        $("#h-range, #s-range, #v-range").on('input change', function(){
            $('#color-picker').colorpicker('setValue', ColorPicker.HSVtoHSB(
                $("#h-range").val(),
                $("#s-range").val(),
                $("#v-range").val())
            );
        });

        // RGB
        $("#r-number, #g-number, #b-number").on('input', function(){
            $('#color-picker').colorpicker('setValue',
                [
                    "rgb(",
                    $("#r-number").val(),
                    ",",
                    $("#g-number").val(),
                    ",",
                    $("#b-number").val(),
                    ")"
                ].join(''))
        });
        $("#r-range, #g-range, #b-range").on('input change', function(){
            $('#color-picker').colorpicker('setValue',
                [
                    "rgb(",
                    $("#r-range").val(),
                    ",",
                    $("#g-range").val(),
                    ",",
                    $("#b-range").val(),
                    ")"
                ].join(''))
        });

        // LCH
        $("#lchab-l-number, #lchab-c-number, #lchab-h-number").on('input', function(){
            $("#lch-picker").lchPicker('setValue', [
                parseInt($("#lchab-l-number").val()),
                    parseInt($("#lchab-c-number").val()),
                    parseInt($("#lchab-h-number").val())
            ]);

            // var color = ColorPicker.space.lchab.hsv([
            //     parseInt($("#lchab-l-number").val()),
            //     parseInt($("#lchab-c-number").val()),
            //     parseInt($("#lchab-h-number").val())
            // ]);
            // console.log(color);
            // $('#color-picker').colorpicker('setValue',
            //         "rgb(" + color + ")");
            // $('#color-picker').colorpicker('setValue', {
            //     h: color[0] / 360, s: color[1] / 100, b: color[2] / 100
            // });
        });
        $("#lchab-l-range, #lchab-c-range, #lchab-h-range").on('input change', function(){
            $("#lch-picker").lchPicker('setValue', [
                parseInt($("#lchab-l-range").val()),
                parseInt($("#lchab-c-range").val()),
                parseInt($("#lchab-h-range").val())
            ]);
            // $('#color-picker').colorpicker('setValue',
            //         "rgb(" + color + ")");

            // $('#color-picker').colorpicker('setValue', {
            //     h: color[0] / 360, s: color[1] / 100, b: color[2] / 100
            // });

        });

        // number of colors
        $("#colors-number").on('input', function(){
            ColorPicker.rerender();
        });

        // color space selector
        $('#color-space').on('change', function(){
            ColorPicker.rerender();
        });

    },

    updateDDeltasInputs: function (deltaId) {
        $('#deltas-'+deltaId).find('.dA-range').val(ColorPicker.deltas[deltaId][0]);
        $('#deltas-'+deltaId).find('.dB-range').val(ColorPicker.deltas[deltaId][1]);
        $('#deltas-'+deltaId).find('.dC-range').val(ColorPicker.deltas[deltaId][2]);

        $('#deltas-'+deltaId).find('.dA-number').val(ColorPicker.deltas[deltaId][0]);
        $('#deltas-'+deltaId).find('.dB-number').val(ColorPicker.deltas[deltaId][1]);
        $('#deltas-'+deltaId).find('.dC-number').val(ColorPicker.deltas[deltaId][2]);
    },

    updateDButtons: function() {
        if (ColorPicker.deltas.length > 1) {
            $("#remove-deltas").show();
        } else {
            $("#remove-deltas").hide();
        }
    },

    HSVtoHSB: function (h, s, v) {
        var hueScale = d3.scale.linear()
            .domain([0, 360])
            .range([0, 1]);

        var saturationScale = d3.scale.linear()
            .domain([0, 100])
            .range([0, 1]);

        var valueScale = d3.scale.linear()
            .domain([0, 100])
            .range([0, 1]);

        return {
            h: hueScale(h),
            s: saturationScale(s),
            b: valueScale(v)
        }
    },

    HSBtoHSV: function(h, s, b) {
        var hueScale = d3.scale.quantize()
            .domain([0, 1])
            .range(d3.range(0, 361, 1));

        var saturationScale = d3.scale.quantize()
            .domain([0, 1])
            .range(d3.range(0, 100.5, 0.5));

        var brightnessScale = d3.scale.quantize()
            .domain([0, 1])
            .range(d3.range(0, 100.5, 0.5));

        return {
            h: hueScale(h),
            s: saturationScale(s),
            v: brightnessScale(b)
        }
    },

    updateSliders: function () {
        // HSV
        var hsv = ColorPicker.color.getColor('hsv');

        $("#h-number").val(hsv[0]);
        $("#s-number").val(hsv[1]);
        $("#v-number").val(hsv[2]);

        $("#h-range").val(hsv[0]);
        $("#s-range").val(hsv[1]);
        $("#v-range").val(hsv[2]);

        // RGB
        var rgb = ColorPicker.color.getColor('rgb');

        $("#r-number").val(rgb[0]);
        $("#g-number").val(rgb[1]);
        $("#b-number").val(rgb[2]);

        $("#r-range").val(rgb[0]);
        $("#g-range").val(rgb[1]);
        $("#b-range").val(rgb[2]);

        // LCH
        var lch = ColorPicker.color.getColor('lch');

        $("#lchab-l-number").val(lch[0]);
        $("#lchab-c-number").val(lch[1]);
        $("#lchab-h-number").val(lch[2]);

        $("#lchab-l-range").val(lch[0]);
        $("#lchab-c-range").val(lch[1]);
        $("#lchab-h-range").val(lch[2]);

        ColorPicker.rerender();

    },
    rerender: function() {

        // var initColor = $('#color-picker').colorpicker().data('colorpicker').color;

        var colorSpace = $('#color-space').val();

        ColorPicker.circles = [];
        for (var i = 0; i < parseInt($("#colors-number").val()); i++) {
            ColorPicker.circles.push({
                x: 30 + (45 * i),
                y: 30,
                r: 30,
                color: (function(i){

                    // calculate correction term from deltas
                    var corrections = [0, 0, 0];
                    for (var n = 0; n < 3; n++) {
                        for (var d = 0; d < ColorPicker.deltas.length; d++) {
                            corrections[n] += triforce(d, i) * ColorPicker.deltas[d][n];
                        }
                    }

                    switch (colorSpace) {
                        case "HSV":
                            var color = ColorPicker.color.getColor('hsv');

                            var h = (color[0] + corrections[0]) % 360; // only for H
                            if (h < 0) h = 360 + h;

                            var s = color[1] + corrections[1];
                            if (s < 0) s = 0;
                            if (s > 100) s = 100;

                            var v = color[2] + corrections[2];
                            if (v < 0) v = 0;
                            if (v > 100) v = 100;

                            return new PreciseColor([h, s, v], 'hsv');

                        case "RGB":
                            var color = ColorPicker.color.getColor('rgb');

                            var r = color[0] + corrections[0];
                            if (r < 0) r = 0;
                            if (r > 255) r = 255;

                            var g = color[1] + corrections[1];
                            if (g < 0) g = 0;
                            if (g > 255) g = 255;

                            var b = color[2] + corrections[2];
                            if (b < 0) b = 0;
                            if (b > 255) b = 255;

                            return new PreciseColor([r, g, b], 'rgb');

                        case "LCH":
                            var lch = ColorPicker.color.getColor('lch');

                            var l = lch[0] + corrections[0];
                            if (l < 0) l = 0;
                            if (l > 100) l = 100;

                            var c = lch[1] + corrections[1];
                            if (c < 0) c = 0;
                            if (c > 100) c = 100;

                            var h = (lch[2] + corrections[2]) % 360; // only for H
                            if (h < 0) h = 360 + h;

                            return new PreciseColor([l, c, h], 'lch');
                    }

                })(i)
            })
        }

        ColorPicker.renderColors();

        // TODO: fit canvas
    }


};

console.log("TADA!");