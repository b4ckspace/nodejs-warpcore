var  firmata  = require('firmata')
    ,config   = require('./config')
    ,common   = require('common')
    ,WarpCore = require('./warpcore')

var board = new firmata.Board('/dev/ttyACM0',function () {

    var wc = new WarpCore( board, '10.1.20.1' );

    var  speed_min  = 0.08
        ,speed_max  = 0.62
        ,pi_cur     = 0
        ,pi_2       = Math.PI*2;

    wc.on('update', function( val ) {
        pi_cur += common.map_range(val, 0.0, 1.0, speed_min, speed_max);
        pi_cur = pi_cur % pi_2;
    });

    wc.led_update( 5, function() {
        var tmp = Math.sin( pi_cur );
        return common.map_range( tmp, -1.0, 1.0, 0.0, 255.0 );
    });

    wc.led_update( 6, function() { 
        var tmp = Math.sin( pi_cur + Math.PI );
        return common.map_range( tmp, -1.0, 1.0, 0.0, 255.0 );
    });

});
