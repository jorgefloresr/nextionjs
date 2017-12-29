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
    createPlaylist("/home/pi/music/");
});

screen.suscribeById(buttonAux.id, function () {
    if (buttonAux.text == "aux") {
        buttonAux.text = "playing";
        updateButtonText(buttonAux);
        execSysCommand("./playFromMic.sh");
    } else {
        buttonAux.text = "aux";
        updateButtonText(buttonAux);
        execSysCommand("killall arecord");
    }
});

function findMp3FilesInDir(path) {
    var tmpPlaylist = [];
    if (fs.lstatSync(path).isDirectory()) {
        fs.readdir(path, function (err, items) {
            console.log(path);
            for (var i = 0; i < items.length; i++) {
                if (fs.lstatSync(path + items[i]).isDirectory()) {
                    tmpPlaylist = tmpPlaylist.concat(readDir(path + items[i] + "/"));
                } else {
                    if(items[i].endsWith(".mp3")){
                        tmpPlaylist.push(path+items[i]);
                    }
                    //console.log(items[i]);
                }
            }
        });
    }
    return tmpPlaylist;
}

function createPlaylist(path){
    var playList = findMp3FilesInDir(path);
    console.log(playList.join("\n"));
}

function updateButtonText(button) {
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