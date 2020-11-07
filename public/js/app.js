function makeToast() {
  $.toast({
    text: 'Esto es un toast',
    position: 'top-right'
  })
  // console.log("Make toast");
}

function randomLetter(){
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  letra = alphabet[Math.floor(Math.random() * alphabet.length)]
  console.log("Letra ", letra); 
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

function emitEventToSocketIo() {
  // let text = $('#messageToServer').val();
  let nombre = $('#nombreInput').val();
  let color = $('#colorInput').val();
  let fruto = $('#frutoInput').val();
  // Envía un mensaje
  window.socket.emit('messageToServer', { nombre: nombre, color: color, fruto: fruto });
}

$(function () {
  connectToSocketIo();
});
