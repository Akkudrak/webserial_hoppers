import { Hopper } from './hopper.js';

const hopper = new Hopper();

hopper.on('serial:message', (message) => {
  let response = "";
  console.log(message.detail.data);
  switch(message.detail.name){
    case "CONNECTED":
      addMessage("received","Connected");
      connectMessage(true);
      break;
    case "STATUS":
      state.showHopperStatus = true;
      hopperStatus.classList.remove('hidden');
      updateHopperStatus(message.detail.data);
      updateHopperAmountDisplay(message.detail.data);
      
      console.log(message.detail.data);
      var totalBalance = message.detail.data.reduce((sum, hopper) => sum + hopper.coinValue * hopper.count, 0);
      response =
        `Balance: $${totalBalance.toFixed(2)} pesos\n\nDetalle de hoppers:\n` +
        message.detail.data
          .map(
            (h) =>
              `Hopper ${h.id} (${h.coinName}): ${h.count} monedas (${((h.count / h.maxCapacity) * 100).toFixed(1)}%)`,
          )
          .join("\n");
      break;

    case "READHOPPER":
      state.showHopperStatus = true;
      hopperStatus.classList.remove('hidden');
      updateHopperStatus(message.detail.data);
      console.log(message.detail);
      var index=message.detail.hopperId;
      var totalBalance = message.detail.data[(index-1)].coinValue * message.detail.data[(index-1)].count;
      response =
        `Balance Hopper ${index}: $${totalBalance.toFixed(2)} pesos\n\Hopper ${message.detail.data[(index-1)].id} (${message.detail.data[(index-1)].coinName}): ${message.detail.data[(index-1)].count} monedas (${((message.detail.data[(index-1)].count / message.detail.data[(index-1)].maxCapacity) * 100).toFixed(1)}%)\n`
      break;
    
    case "WRITEHOPPER":
      state.showHopperStatus = true;
      hopperStatus.classList.remove('hidden');
      updateHopperStatus(message.detail.data);
      console.log(message.detail);
      var index=message.detail.hopperId;
      var totalBalance = message.detail.data[(index-1)].coinValue * message.detail.data[(index-1)].count;
      response =
        `Balance Hopper ${index}: $${totalBalance.toFixed(2)} pesos\n\Hopper ${message.detail.data[(index-1)].id} (${message.detail.data[(index-1)].coinName}): ${message.detail.data[(index-1)].count} monedas (${((message.detail.data[(index-1)].count / message.detail.data[(index-1)].maxCapacity) * 100).toFixed(1)}%)\n`
      break;
    case "DISPENSEHOPPER":
      state.showHopperStatus = true;
      hopperStatus.classList.remove('hidden');
      updateHopperStatus(message.detail.data);
      console.log(message.detail);
      var index=message.detail.hopperId;
      var totalBalance = message.detail.data[(index-1)].coinValue * message.detail.data[(index-1)].count;
      response =
        `Dispensada 1 Moneda de Hopper ${index} \nBalance Hopper ${index}: $${totalBalance.toFixed(2)} pesos\n\Hopper ${message.detail.data[(index-1)].id} (${message.detail.data[(index-1)].coinName}): ${message.detail.data[(index-1)].count} monedas (${((message.detail.data[(index-1)].count / message.detail.data[(index-1)].maxCapacity) * 100).toFixed(1)}%)\n`
      break;
    
      case "DISPENSECHANGE":
        response = "Cambio Entregado: $ "+ parseFloat(message.detail.data).toFixed() + " pesos";
      break;
    

      case "READBALANCE":
        updateBalanceDisplay(parseFloat(message.detail.data).toFixed() + " pesos");
        response = "Saldo (Ingresado en Validador): $ "+ parseFloat(message.detail.data).toFixed() + " pesos";
        break;

      case "INSERTCOIN":
        updateBalanceDisplay(parseFloat(message.detail.data).toFixed() + " pesos");
        response = "Moneda Ingresada: "+message.detail.coinValue+" | Saldo (Ingresado en Validador): $ "+ parseFloat(message.detail.data).toFixed() + " pesos";
        break;
        
      case "LOWLEVEL":
        response = "Bajo Nivel de Monedas";
        break;

      case "TIMEOUT_DISPENSE":
        response = "Dispensado Timeout";
        break;
      case "SINTAX":
        response = "Error de Comunicación";
        break;
      
      case "CLEARBALANCE":
        updateBalanceDisplay(parseFloat(message.detail.data).toFixed() + " pesos");
        response = "Saldo Reestablecido: $ "+ parseFloat(message.detail.data).toFixed() + " pesos";
        break;
  }
  if(response){
    addMessage('received', response);
  }
  
});

hopper.on('serial:timeout', (data) => {
  console.log('serial:timeout', data.detail);
});

// if you need to debug the data sent
// hopper.on('serial:sent', data => {
//     console.log('serial:sent',data.detail);
// });

hopper.on('serial:error', (message) => {
  addMessage('received', message.detail.description);
  connectMessage(false);
});

// eslint-disable-next-line no-unused-vars
hopper.on('serial:disconnected', (event) => {
  addMessage("received","Disconnected");
  connectMessage(false);
});

// eslint-disable-next-line no-unused-vars
hopper.on('serial:connecting', (event) => {
  addMessage("sent","Connecting")
});

// eslint-disable-next-line no-unused-vars
hopper.on('serial:connected', (event) => {
  console.log(event.target.connected);
});

// eslint-disable-next-line no-unused-vars
hopper.on('serial:need-permission', (event) => {
  addMessage("received","Need Permisions");
  connectMessage(false);
});

// eslint-disable-next-line no-unused-vars
hopper.on('serial:soft-reload', (event) => {
  // reset your variables
});

// eslint-disable-next-line no-unused-vars
hopper.on('serial:unsupported', (event) => {
  document.getElementById('unsupported').classList.remove('hidden');
});

function tryConnect() {
  hopper
    .connect()
    .then(() => {})
    .catch(console.error);
}

function payment(amount) {
  hopper
    .doPayment(amount)
    .then((response) => {
      console.log('payment', response);
    })
    .catch(console.error);
}

function change(amount) {
  hopper
    .sendCambio10()
    .then((response) => {
      console.log('cambio', response);
    })
    .catch(console.error);
}

function estatus() {
  hopper
    .sendStatus()
    .then((response) => {
      console.log('estatus', response);
    })
    .catch(console.error);
}

function readBalance() {
  hopper
    .sendReadBalance()
    .then((response) => {
      console.log('readBalance', response);
    })
    .catch(console.error);
}


function clearBalance(){
  hopper
    .sendClearBalance()
    .then((response) => {
      console.log('clearBalance', response);
    })
    .catch(console.error);
}

function readHopper(id){
  hopper
    .sendReadHopper(id)
    .then((response) => {
      console.log('readHopper', response);
    })
    .catch(console.error);
  
}

function writeHopper(id,quantity){
  hopper
    .sendwriteHopper(id,quantity)
    .then((response) => {
      console.log('writeHopper', response);
    })
    .catch(console.error);
}

function dispenseChange(amount){
  hopper
    .sendDispenseChange(amount)
    .then((response) => {
      console.log('writeHopper', response);
    })
    .catch(console.error);
}

function dispenseHopper(id){
  hopper
    .sendDispenseHopper(id)
    .then((response) => {
      console.log('dispenseHopperUnique', response);
    })
    .catch(console.error);
}

window.estatus=estatus;
window.readBalance=readBalance;
window.clearBalance=clearBalance;
window.readHopper=readHopper;
window.writeHopper=writeHopper;
window.dispenseChange=dispenseChange;
window.dispenseHopper=dispenseHopper;

tryConnect();
document.getElementById('connect-btn').addEventListener('click', tryConnect);


  





