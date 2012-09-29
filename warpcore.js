var  common     = require('common')
    ,snmp       = require('snmp-traffic')
    ,events     = require('events')
    ,util       = require('util')
    ,firmata    = require('firmata');

var WarpCore = function( firmata, snmp_host, kbps_min, kbps_max ) {
    
    events.EventEmitter.call(this);

    this.firmata     = firmata;
    
    this.kbps_last   = 0;
    this.kbps_smooth = 0;

    this.kbps_min    = kbps_min || 100.0;
    this.kbps_max    = kbps_max || 10000.0;

    this.cur_smooth  = 0;

    this.enabled     = false;
    this.update_interval = false;

    this.smooth      = new common.ExponentialSmoothing();
    this.snmp_client = new snmp.Client( snmp_host );

    this.setup();
};

util.inherits(WarpCore, events.EventEmitter);


WarpCore.prototype.setup = function() {

    var self = this;

    this.snmp_client.on('update', function( kbps ) {
        self.kbps_last = kbps;
    });

    // Smooth kbps values
    setInterval( function() {
        self.smooth.add_value( self.kbps_last );
        self.kbps_smooth = self.smooth.get_value();
    
        var clamp = common.clamp( self.kbps_smooth, self.kbps_min, self.kbps_max );
        self.cur_smooth = common.map_range( clamp, self.kbps_min, self.kbps_max, 0.0, 1.0 );

    }, 500 );

    this.enable();
};

WarpCore.prototype.enable = function() {
 
    var self = this;
    this.enabled = true;
    this.emit('enable');

    this.update_interval = setInterval( function() {
        self.emit('update', self.cur_smooth );    
        self.emit('led-update', self.cur_smooth );
    }, 60 );

};

WarpCore.prototype.disable = function() {

    this.enabled = false;

    clearInterval( this.update_interval );
    this.emit('disable');
};

WarpCore.prototype.led_update = function( pin, cb ) {

    var self = this;

    this.firmata.pinMode( pin, this.firmata.MODES.PWM );
    this.on('led-update', function( val ) {
        var tmp = cb(pin, val);
        self.firmata.analogWrite( pin, tmp );    
    });

    this.on('disable', function() {
        self.firmata.analogWrite( pin, 0.0 ); 
    });
};

module.exports = WarpCore;
