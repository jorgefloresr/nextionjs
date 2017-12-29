/*


Nextion.js for Raspberry Pi / Node.js
Originally created by Grégory G.

Slightly modified to support serialport 6.x
*/

var SerialPort = require('serialport');

var port = new SerialPort('/dev/ttyAMA0', {
	baudRate: 9600
});

var listeners = {};

function init(){
	port.on('open', function() {
		console.log('Port ouvert sur /dev/ttyAMA0 @ 9600 bds');
		write.setPage(0);
	});

	port.on('data', function(byte){
		var data = byte.toString('hex').match(/.{1,2}/g);
		readUart(data);
	});

	suscribeById("01",function(){
		console.log("boton 1");
	});
	suscribeById("03",function(){
		console.log("Pedunculo");
	});
}

// write.uart("any command");
// write.setPage(0);
// write.setText("t0", "hey");
// write.setVis("t0", true);
// write.getPage(); return actual page on nextion (sendme command)

var write = {
	uart: function(cmd){
		writeUart(cmd);
	},
	setPage: function(num){
		writeUart('page '+num);
	},
	setText: function(cmp, txt){
		writeUart(cmp+'.txt="'+txt+'"');
	},
	setVis: function(cmp, value){
		var val = value ? "1":"0";
		writeUart('vis '+cmp+','+val);
	},
	setColor: function(cmp, bco){
		writeUart(cmp + ".bco=" + bco);
		writeUart("ref " + cmp);
	},
	getPage: function(){
		writeUart('sendme');
	}
};

function writeUart(cmd){
	port.write(hex(cmd));
}

function readUart(data){
	//console.log(data.join(" "));
	if(data[0] == 65){
		var id = data[2];
		if(listeners[id]){
			listeners[id].callback();
		}
	}
}

function suscribeById(id, callback){
	listeners[id] = {
		"callback": callback 
	}
}

function hex(str) {
	var arr = [];
	for (var i = 0, l = str.length; i < l; i ++) {
		var ascii = str.charCodeAt(i);
		arr.push(ascii);
	}
	arr.push(255);
	arr.push(255);
	arr.push(255);
	return new Buffer(arr);
}

init();
