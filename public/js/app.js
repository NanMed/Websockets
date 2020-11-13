var letra;

function makeToast() {
  $.toast({
    text: 'Esto es un toast',
    position: 'top-right'
  })
  // console.log("Make toast");
}

function makeToastMessage(message) {
  $.toast({
    text: message,
    position: 'top-right'
  });
}

window.socket = null;
function connectToSocketIo() {
  let server = window.location.protocol + "//" + window.location.host;
  window.socket = io.connect(server);
  // Recibe un mensaje de tipo toast
  window.socket.on('toast', function (data) {
    // Muestra el mensaje
    makeToastMessage(data.message);
  });
  window.socket.on('usuario', function (data) {
    // Muestra el mensaje
    const labelUsuario = document.getElementById("usuario");
        labelUsuario.innerHTML = data.usuario;
        
  });
  checkGame();
}

function checkGame(){
  //Con estas comentadas ya no crea un nuevo clienter al darle iniciar partida
  // let server = window.location.protocol + "//" + window.location.host;
  // window.socket = io.connect(server);
  window.socket.on('desabilitar', function (data) {
    // Muestra el mensaje
    console.log(data.status)
    if(data.status == true){
      document.getElementById("Onoff").disabled = true;
      const usuarioNuevo = document.getElementById("usuarioNuevo");
      usuarioNuevo.innerHTML = "Juego en progreso, espera un momento";
      document.getElementById("btB").disabled = true;
    }
        
  });
}

function emitRandomLetter(){
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  this.letra = alphabet[Math.floor(Math.random() * alphabet.length)]
  document.getElementById("letra").innerHTML = this.letra;
  console.log("Letra ", this.letra); 
  window.socket.emit('emitRandomLetter', letra);

  //Con estas comentadas ya no crea un nuevo clienter al darle iniciar partida
  // let server = window.location.protocol + "//" + window.location.host;
  // window.socket = io.connect(server);
  window.socket.on('letra', function (data) {
    // Muestra el mensaje
    const letra = document.getElementById("letra");
        letra.innerHTML = data.letra;
        
  });

}

function emitEventToSocketIo() {
  let nombre = $('#nombreInput').val();
  let color = $('#colorInput').val();
  let fruto = $('#frutoInput').val();

  // Envía un mensaje
  var data = { nombre: nombre, color: color, fruto: fruto, letra:this.letra};
  window.socket.emit('messageToServer', data);
  
}


$(function () {
  connectToSocketIo();
  checkGame();
});
