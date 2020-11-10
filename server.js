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
  let i = 10;
  
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
    var letra = data1.letra;

    var storeTimeInterval = setInterval(() => {
        if(i > 0){
          socket.emit('toast', { message: `Quedan: ${i} segundos`});   
        } else {
          socket.emit('toast', { message: 'Se acabó el tiempo'});
          clearInterval(storeTimeInterval);
        }
        i--;
    }, 1000);

    winner(answers,letra);

  });

  
});

function winner(answers, letra){
  var scores = [];
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
  console.log(`El ganador es ${answers[arr[0]].id} con ${arr[1]} puntos`)
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
      arr.push(id, maxScore);
    }
  }
  return arr;
}

// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});
