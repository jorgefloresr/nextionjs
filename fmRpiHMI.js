var screen = require('./client');
const { exec } = require('child_process');
var fs = require('fs');

var buttonRPi = {
    id: "01",
    name: "b0",
    text: "RPi"
}

var buttonAux = {
    id: "03",
    name: "b1",
    text: "aux"
}

screen.connect();
screen.suscribeById(buttonRPi.id, function () {
    readDir("~/music");
});

screen.suscribeById(buttonAux.id, function () {
    if (buttonAux.text == "aux") {
        buttonAux.text = "playing";
        updateButtonText(buttonAux);
        execSysCommand("./playFromMic.sh");
    }else{
        buttonAux.text = "aux";
        updateButtonText(buttonAux);
        execSysCommand("killall arecord");
    }
});

function readDir(path){
    fs.readdir(path, function(err, items) {
        console.log(JSON.stringify(items));
    
        // for (var i=0; i<items.length; i++) {
        //     console.log(items[i]);
        // }
    });
}

function updateButtonText(button){
    screen.write.setText(button.name, button.text);
}

function execSysCommand(command, callback) {
    exec(command, (err, stdout, stderr) => {
        if (err) {
            return;
        }
        if (callback) {
            callback(stdout);
        }
    });
}