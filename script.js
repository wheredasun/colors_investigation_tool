// Math
function factorial(n) {
    var result = 1;
    for (var i = 2; i <= n; i++) {
        result = result * i;
    }
    return result;
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

var ColorPicker = {
    circles: [],
    deltas: [],
    space: require('color-space'),
    init: function () {
        $('#color-picker')
            .colorpicker({
                color: '#c8a2ff',
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
            .on('changeColor', function (e) {
                ColorPicker.updateSliders(e.color);

            });

        ColorPicker.addDeltas();

        ColorPicker.addHandlers();

        $('#color-picker').colorpicker('setValue', '#c8a2ff');

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
            .style("fill", function(d) { return "rgb(" + ColorPicker.map(Math.round, ColorPicker.HSVtoRGB(
                d.color.h,
                d.color.s,
                d.color.v
            )) + ")"; });



        // refactor to d3

        $('#color-picker .dot').remove();
        $('#color-picker .line').remove();

        for (var i = 1; i < ColorPicker.circles.length; i++) {
            var previousColor = ColorPicker.circles[i-1].color;
            var color = ColorPicker.circles[i].color;

            if (color.h !== previousColor.h) {
                var $line = $("<span class='line'></span>");
                $('#color-picker .colorpicker-hue').append($line);
                $line.css('top', (200 - color.h / 360 * 200) + "px");
            }

            if (color.v !== previousColor.v || color.s !== previousColor.s) {
                var $dot = $("<span class='dot'><b></b></span>");
                $('#color-picker .colorpicker-saturation').append($dot);
                $dot.css({
                    'top': (200 - color.v / 100 * 200) + "px",
                    'left': (color.s / 100 * 200) + "px"
                });
            }
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
            var color = ColorPicker.space.hsv.rgb(ColorPicker.space.lchab.hsv([
                (parseInt($("#lchab-l-number").val())),
                (parseInt($("#lchab-c-number").val())),
                (parseInt($("#lchab-h-number").val()))
            ]));
            $('#color-picker').colorpicker('setValue',
                [
                    "rgb(",
                    Math.round(color[0]),
                    ",",
                    Math.round(color[1]),
                    ",",
                    Math.round(color[2]),
                    ")"
                ].join(''))
        });
        $("#lchab-l-range, #lchab-c-range, #lchab-h-range").on('input change', function(){
            var color = ColorPicker.space.hsv.rgb(ColorPicker.space.lchab.hsv([
                (parseInt($("#lchab-l-range").val())),
                (parseInt($("#lchab-c-range").val())),
                (parseInt($("#lchab-h-range").val()))
            ]));
            $('#color-picker').colorpicker('setValue',
                [
                    "rgb(",
                    Math.round(color[0]),
                    ",",
                    Math.round(color[1]),
                    ",",
                    Math.round(color[2]),
                    ")"
                ].join(''))
        });


        // // deltas
        // $("#dA-range, #dB-range, #dC-range").on('input change', function(){
        //
        //     ColorPicker.deltas[0] = [$("#dA-range").val(), $("#dB-range").val(), $("#dC-range").val()];
        //     ColorPicker.updateDeltasInputs();
        //     ColorPicker.rerender();
        // });
        //
        // $("#dA-number, #dB-number, #dC-number").on('input change', function(){
        //
        //     ColorPicker.deltas[0] = [$("#dA-number").val(), $("#dB-number").val(), $("#dC-number").val()];
        //     ColorPicker.updateDeltasInputs();
        //     ColorPicker.rerender();
        // });

        // number of colors
        $("#colors-number").on('input', function(){
            ColorPicker.rerender();
        });
    },

    // updateDeltasInputs: function () {
    //     $('#dA-range').val(ColorPicker.deltas[0][0]);
    //     $('#dB-range').val(ColorPicker.deltas[0][1]);
    //     $('#dC-range').val(ColorPicker.deltas[0][2]);
    //
    //     $('#dA-number').val(ColorPicker.deltas[0][0]);
    //     $('#dB-number').val(ColorPicker.deltas[0][1]);
    //     $('#dC-number').val(ColorPicker.deltas[0][2]);
    // },

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

    updateSliders: function (color) {
        // HSV
        var hsv = ColorPicker.HSBtoHSV(color.value.h, color.value.s, color.value.b);

        $("#h-number").val(hsv.h);
        $("#s-number").val(hsv.s);
        $("#v-number").val(hsv.v);

        $("#h-range").val(hsv.h);
        $("#s-range").val(hsv.s);
        $("#v-range").val(hsv.v);

        // RGB
        var rgb = color.toRGB();

        $("#r-number").val(rgb.r);
        $("#g-number").val(rgb.g);
        $("#b-number").val(rgb.b);

        $("#r-range").val(rgb.r);
        $("#g-range").val(rgb.g);
        $("#b-range").val(rgb.b);

        // LCH
        var lch = ColorPicker.space.hsv.lchab(ColorPicker.space.rgb.hsv([rgb.r, rgb.g, rgb.b]));
        // > ColorPicker.space.lchab.rgb(ColorPicker.space.rgb.lchab([10,10,10]))
        // (3) [17.97040266381234, 6.587820188987336, 14.176387850654045]
        // > ColorPicker.space.lchab.hsv(ColorPicker.space.hsv.rgb((ColorPicker.space.rgb.hsv(ColorPicker.space.hsv.lchab([10,10,10])))))
        // (3) [9.91023551682196, 9.971386816411227, 9.999113388843941]

        $("#lchab-l-number").val(Math.round(Math.round(lch[0])));
        $("#lchab-c-number").val(Math.round(Math.round(lch[1])));
        $("#lchab-h-number").val(Math.round(Math.round(lch[2])));

        $("#lchab-l-range").val(Math.round(Math.round(lch[0])));
        $("#lchab-c-range").val(Math.round(Math.round(lch[1])));
        $("#lchab-h-range").val(Math.round(Math.round(lch[2])));

        ColorPicker.rerender();

    },
    rerender: function() {

        var initColor = $('#color-picker').colorpicker().data('colorpicker').color;

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

                    var color = ColorPicker.HSBtoHSV(initColor.value.h, initColor.value.s, initColor.value.b);

                    var h = (color.h + corrections[0]) % 360; // FIXME: only for H
                    if (h < 0) h = 360 + h;

                    var s = color.s + corrections[1];
                    if (s < 0) s = 0;
                    if (s > 100) s = 100;

                    var v = color.v + corrections[2];
                    if (v < 0) v = 0;
                    if (v > 100) v = 100;

                    return {
                        h: h,
                        s: s,
                        v: v
                    };
                })(i)
            })
        }

        ColorPicker.renderColors();

        // TODO: fit canvas
    }


};

console.log("TADA!");