var screen = require('./client');
const { exec } = require('child_process');
var fs = require('fs');
var sleep = require('sleep');

console.log("waiting");
sleep.sleep(15);
console.log("ready");

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

var buttonPrev = {
    id: "04",
    name: "bprev",
    text: "<- prev"
}

var buttonNext = {
    id: "03",
    name: "bnext",
    text: "next ->"
}

var playlist = {
    playlist: [],
    index: 0,
    length: 0,
    playing: false
};

screen.connect();
screen.suscribeById(buttonRPi.id, function () {
    screen.write.setPage(2);
    playlist.playlist = createPlaylist("/home/pi/music/");
    playlist.index = 0;
    playlist.length = playlist.playlist.length;
    playNextSong();
});

screen.suscribeById(buttonAux.id, function () {
    if (buttonAux.text == "aux") {
        buttonAux.text = "playing";
        updateButtonText(buttonAux);
        execSysCommand("killall ffmpeg");
        sleep.sleep(1);
        execSysCommand("/home/pi/nextionjs/playFromMic.sh");
    } else {
        buttonAux.text = "aux";
        updateButtonText(buttonAux);
        execSysCommand("killall arecord");
    }
});

screen.suscribeById(buttonNext.id, function(){
    playlist.index = playlist.index + 1;
    if(playlist.index < playlist.length){
        playlist.playing = false;
        execSysCommand("killall ffmpeg");
        sleep.sleep(3);
        playNextSong();
    }
});

function playNextSong(){
    playlist.playing = true;
    console.log("playing "+playlist.playlist[playlist.index].name);
    screen.write.setText("g0", playlist.playlist[playlist.index].name);
    playMp3File(playlist.playlist[playlist.index].path, function(){
        if(!playlist.playing){
            return;
        }
        playlist.index = playlist.index + 1;
        if(playlist.index < playlist.length){
            playNextSong();
        }
    });
}

function playMp3File(pathFile, callback){
    console.log("playing mp3");
    execSysCommand("ffmpeg -i '"+pathFile+"' -f s16le -ar 22.05k -ac 1 - | sudo /home/pi/pifm/pifm - 108.0",function(stdout){
        console.log(stdout);
        callback();
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
                    tmpPlaylist.push({
                        "path": path + items[i],
                        "name": items[i]
                    });
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