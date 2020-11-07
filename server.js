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

io.on('connection', (socket) => {
  let c = Math.random().toString(36).substring(7);
  // Recibe la conexión del cliente
  console.log('Client connected...', c);
  let i = 10;
  
  // Recibe un mensaje
  socket.on('messageToServer', (data) => {
    console.log(`messageReceivedFromClient ${c}: nombre ${data.nombre}, color ${data.color}, fruto ${data.fruto}`);
    // Emite un mensaje
    setInterval(() => {
        if(i > 0){
          socket.emit('toast', { message: `Quedan: ${i} segundos`});   
        } else {
          socket.emit('toast', { message: 'Se acabó el tiempo'});
        }
        i--;
    }, 3000);
  });
});

// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});
