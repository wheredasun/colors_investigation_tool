var ColorPicker = {
    circles: [],
    deltas: [[0,0,0], [0,0,0]],
    init: function () {
        $('#color-picker')
            .colorpicker({
                color: '#c8a2ff',
                inline: true,
                container: true,
                // alpha: false,
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
                    // alpha: {
                    //     maxTop: 200
                    // }
                }
            })
            .on('changeColor', function (e) {
                ColorPicker.updateSliders(e.color);

            });

        ColorPicker.addHandlers();

        $('#color-picker').colorpicker('setValue', '#c8a2ff');

    },

    canvas: d3.select("#canvas").append("svg")
        .attr("width", 500)
        .attr("height", 210),

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
            .style("fill", function(d) { return d.color; });

    },

    addHandlers: function () {

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

        // deltas
        $("#dA-range, #dB-range, #dC-range").on('input change', function(){

            ColorPicker.deltas[0] = [$("#dA-range").val(), $("#dB-range").val(), $("#dC-range").val()];
            ColorPicker.updateDeltasInputs();
            ColorPicker.rerender();
        });

        $("#dA-number, #dB-number, #dC-number").on('input change', function(){

            ColorPicker.deltas[0] = [$("#dA-number").val(), $("#dB-number").val(), $("#dC-number").val()];
            ColorPicker.updateDeltasInputs();
            ColorPicker.rerender();
        });

        // deltas of deltas
        $("#ddA-range, #ddB-range, #ddC-range").on('input change', function(){

            ColorPicker.deltas[1] = [$("#ddA-range").val(), $("#ddB-range").val(), $("#ddC-range").val()];
            ColorPicker.updateDDeltasInputs();
            ColorPicker.rerender();
        });

        $("#ddA-number, #ddB-number, #ddC-number").on('input change', function(){

            ColorPicker.deltas[1] = [$("#ddA-number").val(), $("#ddB-number").val(), $("#ddC-number").val()];
            ColorPicker.updateDDeltasInputs();
            ColorPicker.rerender();
        });

        // number
        $("#colors-number").on('input', function(){
            ColorPicker.rerender();
        })
    },

    updateDeltasInputs: function () {
        $('#dA-range').val(ColorPicker.deltas[0][0]);
        $('#dB-range').val(ColorPicker.deltas[0][1]);
        $('#dC-range').val(ColorPicker.deltas[0][2]);

        $('#dA-number').val(ColorPicker.deltas[0][0]);
        $('#dB-number').val(ColorPicker.deltas[0][1]);
        $('#dC-number').val(ColorPicker.deltas[0][2]);
    },

    updateDDeltasInputs: function () {
        $('#ddA-range').val(ColorPicker.deltas[1][0]);
        $('#ddB-range').val(ColorPicker.deltas[1][1]);
        $('#ddC-range').val(ColorPicker.deltas[1][2]);

        $('#ddA-number').val(ColorPicker.deltas[1][0]);
        $('#ddB-number').val(ColorPicker.deltas[1][1]);
        $('#ddC-number').val(ColorPicker.deltas[1][2]);
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


        ColorPicker.rerender();

    },
    rerender: function() {

        var initColor = $('#color-picker').colorpicker().data('colorpicker').color;

        var ds = ColorPicker.deltas[0];
        var dA = ds[0];
        var dB = ds[1];
        var dC = ds[2];

        var dds = ColorPicker.deltas[1];
        var ddA = dds[0];
        var ddB = dds[1];
        var ddC = dds[2];

        ColorPicker.circles = [];
        for (var i = 0; i < parseInt($("#colors-number").val()); i++) {
            ColorPicker.circles.push({
                x: 30 + (45 * i),
                y: 30,
                r: 30,
                color: (function(i){
                    var color = ColorPicker.HSBtoHSV(initColor.value.h, initColor.value.s, initColor.value.b);
                    color.h = (color.h + dA * i + ddA * (i - 1)*i/2) % 360; // FIXME: only for H
                    color.s = color.s + dB * i + ddB * (i - 1)*i/2;
                    color.v = color.v + dC * i + ddC * (i - 1)*i/2;

                    return tinycolor(color).toRgbString();
                })(i)
            })
        }

        ColorPicker.renderColors();

        // TODO: fit canvas
    }


};

console.log("TADA!");