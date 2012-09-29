# warpcore

## description

the "warpcore" is a lighting installation inside our server rack. The fadeing speed of the LEDs vary depending on the incoming WAN-Traffic.

More information is available here: http://www.hackerspace-bamberg.de/Warpcore (german)

## internal

this library reads the snmp values of our netgear router with openwrt backfire firmware, and calculates a value between 0.0 to 1.0 depending on the current bandwidth and the min/max values set.

the node-firmata module is used to set the PWM values

## usage


<code>
    var board = new firmata.Board('/dev/ttyACM0',function () {

        console.log( "Connected!");

        var wc = new WarpCore( board, config.snmp_host );

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
</code>

The update-event is fired before the led_update callbacks. the update and led_update callback is fired every 60ms to provide a smooth fading.
