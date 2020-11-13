// Imports
const express = require('express');
const webRoutes = require('./routes/web');

// Session imports
let cookieParser = require('cookie-parser');
let session = require('express-session');
let flash = require('express-flash');
let passport = require('passport');

// Express app creation
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Configurations
const appConfig = require('./configs/app');

// View engine configs
const exphbs = require('express-handlebars');
const hbshelpers = require("handlebars-helpers");
const multihelpers = hbshelpers();
const extNameHbs = 'hbs';
const hbs = exphbs.create({
  extname: extNameHbs,
  helpers: multihelpers
});

var ganador = 0;
var puntos = 0;
var letraGlobal;
var bastaIsclicked = false;
var scores = [];
var gameIsOn = false;

app.engine(extNameHbs, hbs.engine);
app.set('view engine', extNameHbs);

// Session configurations
let sessionStore = new session.MemoryStore;
app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: appConfig.secret
}));
app.use(flash());

// Passport configurations
require('./configs/passport');
app.use(passport.initialize());
app.use(passport.session());

// Receive parameters from the Form requests
app.use(express.urlencoded({ extended: true }));

// Route for static files
app.use('/', express.static(__dirname + '/public'));

// Routes
app.use('/', webRoutes);

var answers = [];

io.on('connection', (socket) => {
  let c = Math.random().toString(36).substring(7);
  // Recibe la conexión del cliente
  console.log('Client connected...', c);
  socket.emit('usuario', {usuario:c});
  
  if(gameIsOn == true){
    console.log("Hay un juego en curso")
    socket.emit('desabilitar', {status: true});
  } else {
    console.log("Ya te puedes unir a la partida")
    socket.emit('desabilitar', {status: false});
  }
  let i = 10;

  // Recibe la letra
  socket.on('emitRandomLetter', (data) => {
    gameIsOn = true;
    scores = [];
    bastaIsclicked = false;
    console.log(`messageReceivedFromClient letra ${data}`);
    letraGlobal = data
    io.sockets.emit('letra', {letra: data})
    // Emite un mensaje
    io.sockets.emit('toast', { message: `Letra ${data}`});
    socket.broadcast.emit('toast', { message: `Letra ${data}`});
  });
  
  // Recibe un mensaje
  socket.on('messageToServer', (data) => {
    console.log(`messageReceivedFromClient ${c}: nombre ${data.nombre}, color ${data.color}, fruto ${data.fruto}, letra ${data.letra}`);
    // Emite un mensaje
    data1 = {
      id : c,
      nombre : data.nombre,
      color : data.color,
      fruto: data.fruto,
      letra : data.letra
    }

    answers.push(data1);
    // var letra = data1.letra;

    if(!bastaIsclicked){
      bastaIsclicked = true;
      var storeTimeInterval = setInterval(() => {
        if(i > 0){
          socket.broadcast.emit('toast', { message: `Quedan: ${i} segundos`});
          socket.emit('toast', { message: `Quedan: ${i} segundos`});   
        } else {
          socket.broadcast.emit('toast', { message: 'Se acabó el tiempo'});
          socket.emit('toast', { message: 'Se acabó el tiempo'});
          gameIsOn = false
          clearInterval(storeTimeInterval);
          // socket.broadcast.emit('toast', { message: `El ganador es ${ganador} con ${puntos} puntos`});
          // socket.emit('toast', { message: `El ganador es ${ganador} con ${puntos} puntos`});
        }
        i--;

      }, 1000);
    }
    winner(answers,letraGlobal);
    
  });

  
});

function winner(answers, letra){
  scores = [];
  var names = [];
  var colors = [];
  var fruits = [];
  // console.log("Letra partida", answers[0].letra + "letra " + letra)

  for(var i in answers){
    var item = answers[i];
    scores.push(0);
    names.push(item.nombre);
    colors.push(item.color);
    fruits.push(item.fruto);
  }

  for(var i in names){
    if(names[i].startsWith(letra.toString())){
      if(isRepeated(names[i],names) == false){
        scores[i] = scores[i] + 100; 
      }else{
        scores[i] = scores[i] + 50;
      }
    }else{
      console.log(`El nombre no empieza con la letra ${letra}. Tienes 0 puntos`);
    }
  }

  for(var i in colors){
    if(colors[i].startsWith(letra.toString())){ 
      if(isRepeated(colors[i],colors) == false){
        scores[i] = scores[i] + 100; 
      }else{
        scores[i] = scores[i] + 50;
      }
    }else{
      console.log(`El color no empieza con la letra ${letra}. Tienes 0 puntos`);
    }
  }

  for(var i in fruits){
    if(fruits[i].startsWith(letra.toString())){ 
      if(isRepeated(fruits[i],fruits) == false){
        scores[i] = scores[i] + 100; 
      }else{
        scores[i] = scores[i] + 50;
      }
    }else{
      console.log(`El fruto no empieza con la letra ${letra}. Tienes 0 puntos`);
    }
  }

  var arr = obtainMaxScore(scores);
  ganador = answers[arr[0]].id
  puntos = arr[1]
  console.log(`El ganador es ${ganador} con ${puntos} puntos`) 
  gameIsOn = false;
}

function isRepeated(color, colors){
  let sortedColors = colors.slice().sort();
  var flag = true;
  for (let i = 0; i < sortedColors.length; i++) {
    if (color === sortedColors[i]) {
      flag = true;
    }else{
      flag =  false;
    }
  }

  return flag;
}

function obtainMaxScore(scores){
  console.log("El scores es", scores);
  var arr = [];
  var maxScore = 0;
  var id;
  for (i=0; i<=scores.length;i++){
    if (scores[i]>=maxScore) {
      maxScore=scores[i];
      id = i;
      arr[0] = id;
      arr[1] = maxScore
    }
  }
  return arr;
}

// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});
