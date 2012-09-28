var  common     = require('common')
    ,snmp       = require('snmp-traffic')
    ,config     = require('./config')
    ,events     = require('events')
    ,util       = require('util')
    ,firmata    = require('firmata');

var WarpCore = function( firmata, snmp_host ) {
    
    events.EventEmitter.call(this);

    this.firmata     = firmata;
    this.kbps_last   = 0;
    this.kbps_smooth = 0;

    this.smooth      = new common.ExponentialSmoothing();
    this.snmp_client = new snmp.Client( snmp_host );
};

util.inherits(WarpCore, events.EventEmitter);


WarpCore.prototype.setup = function() {

    var self = this;

    this.snmp_client.on('update', function( kbps ) {
        console.log( "Polled SNMP", kbps );
        self.kbps_last = kbps;
    });

    setInterval( function() {
        self.smooth.add_value( self.kbps_last );
        console.log( self.smooth.get_value() );
    }, 500 );
  
    setInterval( function() {
        self.emit('update');    
    }, 60 );
};

WarpCore.prototype.add_led = function( pin, cb ) {
    
    var self = this;

    this.firmata.pinMode( pin, self.firmata.MODES.PWM );
    this.on('update', function() {
        var result = cb( self.kbps_smooth );
        self.firmata.analogWrite( pin, result );    
    });
};

var board = new firmata.Board('/dev/ttyACM0',function () {

    var wc = new WarpCore( this, config.snmp_host );

    wc.add_led( 5, function( kbps ) {
        console.log( kbps );
    });
});
