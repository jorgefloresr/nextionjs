var screen = require('./client');
const { exec } = require('child_process');

screen.connect();
screen.suscribeById("01",function(){
    console.log("boton 1 ok");
});

screen.suscribeById("03",function(){
    console.log("boton 2 ok");
});

exec('./playFromMic.sh', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
