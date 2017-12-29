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
    var playlist = createPlaylist("/home/pi/music/");
    playMp3File(playlist[0]);
    console.log("after play mp3");
    // for(var index in playlist){
        
    // }
});

screen.suscribeById(buttonAux.id, function () {
    if (buttonAux.text == "aux") {
        buttonAux.text = "playing";
        updateButtonText(buttonAux);
        execSysCommand("killall ffmpeg");
        execSysCommand("./playFromMic.sh");
    } else {
        buttonAux.text = "aux";
        updateButtonText(buttonAux);
        execSysCommand("killall arecord");
    }
});

function playMp3File(pathFile){
    console.log("playing mp3");
    execSysCommand("ffmpeg -i '"+pathFile+"' -f s16le -ar 22.05k -ac 1 - | sudo /home/pi/pifm/pifm - 108.0",function(stdout){
        console.log(stdout);
    });
}

function findMp3FilesInDir(path) {
    var tmpPlaylist = [];
    if (fs.lstatSync(path).isDirectory()) {
        console.log(path + " is a directory");
        var items = fs.readdirSync(path);
        console.log(items.length + " files inside");
        for (var i = 0; i < items.length; i++) {
            if (fs.lstatSync(path + items[i]).isDirectory()) {
                tmpPlaylist = tmpPlaylist.concat(findMp3FilesInDir(path + items[i] + "/"));
            } else {
                if (items[i].endsWith("mp3")) {
                    tmpPlaylist.push(path + items[i]);
                }
            }
        }
    }
    console.log("returning playlist size: " + tmpPlaylist.length + " from " + path);
    return tmpPlaylist;
}

function createPlaylist(path) {
    var playList = findMp3FilesInDir(path);
    console.log("final playlist size: " + playList.length);
    //console.log(playList.join("\n"));
    return playList;
}

function updateButtonText(button) {
    screen.write.setText(button.name, button.text);
}

function execSysCommand(command, callback) {
    console.log("executing "+command);
    exec(command, (err, stdout, stderr) => {
        if (err) {
            return;
        }
        if (callback) {
            callback(stdout);
        }
    });
}