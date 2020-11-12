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
}

function emitRandomLetter(){
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  this.letra = alphabet[Math.floor(Math.random() * alphabet.length)]
  document.getElementById("letra").innerHTML = this.letra;
  console.log("Letra ", this.letra); 
  window.socket.emit('emitRandomLetter', letra);
}

function emitEventToSocketIo() {
  // let text = $('#messageToServer').val();
  let nombre = $('#nombreInput').val();
  let color = $('#colorInput').val();
  let fruto = $('#frutoInput').val();

  // Envía un mensaje
  var data = { nombre: nombre, color: color, fruto: fruto, letra:this.letra};
  window.socket.emit('messageToServer', data);
  
}


$(function () {
  connectToSocketIo();
});
