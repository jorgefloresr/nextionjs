var screen = require('./client');

screen.connect();
screen.suscribeById("01",function(){
    console.log("boton 1 ok");
});

screen.suscribeById("03",function(){
    console.log("boton 2 ok");
});
