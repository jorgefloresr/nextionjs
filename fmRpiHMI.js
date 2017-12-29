var screen = require('./client');
const { exec } = require('child_process');

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
    console.log(buttonRPi.text + " pressed");
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

function updateButtonText(button){
    screen.write.setText(button.name, button.text);
}

function execSysCommand(command, callback) {
    exec(command, (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command
            return;
        }

        // the *entire* stdout and stderr (buffered)
        if (callback) {
            callback(stdout);
        }
        //console.log(`stdout: ${stdout}`);
        //console.log(`stderr: ${stderr}`);
    });
}