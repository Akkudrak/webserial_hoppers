import { Core, Devices } from './webserial-core.js';

export class Hopper extends Core {
  constructor(
    {
      filters = null,
      config_port = {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        bufferSize: 32768,
        flowControl: "none",
      },
      no_device = 1,
    } = {
      filters: null,
      config_port: {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
        bufferSize: 32768,
        flowControl: "none",
      },
      no_device: 1,
    }
  ) {
    super({ filters, config_port, no_device });
    this.__internal__.device.type = "hopper";
    Devices.registerType(this.__internal__.device.type);
    if (Devices.getByNumber(this.typeDevice, no_device)) {
      throw new Error(`Device ${this.typeDevice} ${no_device} already exists`);
    }
    this.__internal__.time.response_connection = 7e3;
    this.__internal__.time.response_general = 7e3;
    this.__internal__.serial.delay_first_connection = 500;

    this.__internal__.serial.response.replacer = ''; // /[\n\r]+/g  ->  default remove all \r\n () but we need to keep it if the limiter has \r or \n
    this.__internal__.serial.response.limiter = '\r\n';

    this.#touch();
    this.getResponseAsString();
    this.globalFlag = undefined;
    this.hopperLevels = [
                          {id:1, coinValue:1,coinName:"Hopper 1: 10 Peso",count:0,maxCapacity: 1000},
                          {id:2, coinValue:2,coinName:"Hopper 2: 5 Pesos",count:0,maxCapacity: 1000},
                          {id:3, coinValue:5,coinName:"Hopper 3: 2 Pesos",count:0,maxCapacity: 1000},
                          {id:4, coinValue:10,coinName:"Hopper 4: 1 Pesos",count:0,maxCapacity: 1000}];//1000 Capacidad prometida al cliente *o*
    this.totalBalance = 0;//Valor Obtenido desde el dispositivo, no calculado desde hopperLevels
    this.currentHopper = undefined;
    this.connected=false;
  } 

  #touch() {
    Devices.add(this);
  }


  //Respuesta del dispositivo serial
  serialMessage(codex) {
    const message = {
      code: [],
      name: "",
      description: "",
      request: "",
      no_code: 0,
      data:undefined
    };
    
    var error=false;
    console.log(this.asciiToHex(codex));
    switch(this.asciiToHex(codex)){
      case "ffffff":
        error=true;
        message.name = "SINTAX";
        message.description = "Error de Sintaxis";
        message.request = "sintax";
        message.no_code = 10;
        break;
      case "ffaaaa":
        error=false;
        message.name = "LOWLEVEL";
        message.description = "Bajo nivel de monedas en Hopper (99)";
        message.request = "lowlevel";
        message.no_code = 11;
        break;
      case "ffbbbb":
        error=false;
        message.name = "TIMEOUT_DISPENSE";
        message.description = "Error de dispensado, timeout";
        message.request = "timeout_dispense";
        message.no_code = 12;
        break;
      case "a00000000011f":
        error=false;
        this.connected=true;
        message.name = "CONNECTED";
        message.description = "Conectado";
        message.request = "connected";
        message.no_code = 13;
        break;
        
    }

    if(error&&!this.connected){
      this.dispatch("serial:error", message);
      return false;
    }


    console.log("response",(this.globalFlag));
    console.log("response",(this.asciiToHex(codex)));
    console.log("response 2", this.stringToArrayHex(codex));
    const data= codex;
    const action= data;
    message.code = action;

    if(!error){
      switch (this.globalFlag) {
        case "status":
          console.log("estatus");
          message.name = "STATUS";
          message.description = "hoppers status";
          message.request = "hoppers";
          message.no_code = 100;

          //estatus response:
          //response  ['a', '1', '0', 'ff', 'fb', 'ff', 'fc', 'ff', 'fa', '3', 'b3', 'a5', 'f']
          //where  [a,identifier,modo de trabajo,monedas hoipper 4 high, monedas hoipper 4 low, monedas hoipper 3 high, monedas hoipper 3 low, monedas hoipper 2 high, monedas hoipper 2 low, monedas hoipper 1 high, monedas hoipper 1 low, checksum,salto de linea]
          var hopperData=this.stringToArrayHex(codex)
          this.hopperLevels[0].count = toSignedInt16(hopperData[9], hopperData[10]);
          this.hopperLevels[1].count = toSignedInt16(hopperData[7], hopperData[8]);
          this.hopperLevels[2].count = toSignedInt16(hopperData[5], hopperData[6]);
          this.hopperLevels[3].count = toSignedInt16(hopperData[3], hopperData[4]);

          message.data=this.hopperLevels;
          break;
        
        case "readHopper":
          message.name = "READHOPPER";
          message.description = "Hopper "+this.currentHopper+" Level";
          message.request = "readhopper";
          message.no_code = 200;
          //response ['a', '1', '1', '0', '0', '0', '0', '0', '0', '3', 'b3', 'b8', 'f']
          //donde ['a', identifier, workmode, '0', '0', '0', '0', '0', '0', monedas hopper 1 high, monedas hopper 1 low, checksum, salto de linea]
          var hopperData=this.stringToArrayHex(codex)
          this.hopperLevels[(this.currentHopper-1)].count = toSignedInt16(hopperData[9], hopperData[10]);
          
          
          
          message.data=this.hopperLevels;
          message.hopperId=this.currentHopper;

          break;
        case "writeHopper":
          message.name = "WRITEHOPPER";
          message.description = "Hopper "+this.currentHopper+" Write";
          message.request = "writehopper";
          message.no_code = 201;
          //response ['a', 'f0', '1', '0', '0', '0', '0', '0', '0', '0', 'a', 'fb', 'f', 'ff', 'aa', 'aa']
          //donde ['a', identifier, workmode, '0', '0', '0', '0', '0', '0', monedas hopper 1 high, monedas hopper 1 low, checksum, salto de linea]
          var hopperData=this.stringToArrayHex(codex)
          this.hopperLevels[(this.currentHopper-1)].count = toSignedInt16(hopperData[9], hopperData[10]);
          
          message.data=this.hopperLevels;
          message.hopperId=this.currentHopper;

          break;

        case "dispenseHopper":
          message.name = "DISPENSEHOPPER";
          message.description = "Hopper "+this.currentHopper+" Dispense";
          message.request = "dispensehopper";
          message.no_code = 203;

          
          //response ['a', 'f0', '1', '0', '0', '0', '0', '0', '0', '0', 'a', 'fb', 'f', 'ff', 'aa', 'aa']
          //donde ['a', identifier, workmode, '0', '0', '0', '0', '0', '0', monedas hopper 1 high, monedas hopper 1 low, checksum, salto de linea]
          
          var hopperData=this.stringToArrayHex(codex)
          this.hopperLevels[(this.currentHopper-1)].count = toSignedInt16(hopperData[9], hopperData[10]);
          
          message.data=this.hopperLevels;
          message.hopperId=this.currentHopper;

          break;
        case "dispenseChange":
          message.name = "DISPENSECHANGE";
          message.description = "Change Dispensed";
          message.request = "dispensechange";
          message.no_code = 203;
          var hopperData=this.stringToArrayHex(codex)
          message.data=toSignedInt16(hopperData[9], hopperData[10]);
          break;

        case "consultaSaldo":
          message.name = "READBALANCE";
          message.description = "Read Balance";
          message.request = "readbalance";
          message.no_code = 300;

          //response ['a', '4', '1', '0', '0', '0', '0', '0', '0', '0', '4', '9', 'f']
          //donde ['a', indetifier, work mode, '0', '0', '0', '0', '0', '0', balance high, balance low, checksum, salto de linea]
          var balanceData=this.stringToArrayHex(codex)
          this.totalBalance = toSignedInt16(balanceData[9], balanceData[10]);

          message.data = this.totalBalance;
          break;
          
        case "clearBalance":
          message.name = "CLEARBALANCE";
          message.description = "Clear Balance";
          message.request = "clearbalance";
          message.no_code = 301;

          //response ['a', '4', '1', '0', '0', '0', '0', '0', '0', '0', '4', '9', 'f']
          //donde ['a', indetifier, work mode, '0', '0', '0', '0', '0', '0', balance high, balance low, checksum, salto de linea]
          var balanceData=this.stringToArrayHex(codex)
          this.totalBalance = toSignedInt16(balanceData[9], balanceData[10]);

          message.data = this.totalBalance;
          break;



        default:
          if(this.asciiToHex(codex)[0]=="a"&&this.asciiToHex(codex)[1]=="4"){
            message.name = "INSERTCOIN";
            message.description = "Insert Coin";
            message.request = "insertcoin";
            message.no_code = 400;
            var chunks=splitHexArrayEvery13Bytes(this.stringToArrayHex(codex));
            console.log("chunkes",chunks);
            message.coinValue=chunks.length;
            this.totalBalance = toSignedInt16(chunks[chunks.length-1][9], chunks[chunks.length-1][10]);
            message.data=this.totalBalance;
          }
          
          break;
      }
    }
    this.globalFlag = undefined;
    this.currentHopper = undefined;
    console.log(message);
    this.dispatch("serial:message", message);
    codex=undefined
    return message;
  }


  //Funciones de envio al dispositivo serial
  serialSetConnectionConstant() {
    this.globalFlag = "connect";
    return this.add0x(this.stringtoArray('0A00000000000000000000000F'));
  }
  async sendF00TestFuncion() {
    const arr = this.stringtoArray("0A00000000000000000000000F");
    await this.appendToQueue(arr, "F00_Test Funcion");
}

async sendStatus() {
    this.globalFlag = "status";
    const arr = this.stringtoArray("0A0A0B0C00000000000000210F");
    await this.appendToQueue(arr, "F01_Status Funcion");
}

async sendReadHopper(id) {
    this.globalFlag = "readHopper";
    this.currentHopper = id;
    let arr = this.stringtoArray("0A01010000000000000000020F");
    switch (id) {
      case 2:
        arr = this.stringtoArray("0A01020000000000000000030F");
        break;
      case 3:
        arr = this.stringtoArray("0A01030000000000000000040F");
        break;
      case 4:
        arr = this.stringtoArray("0A01040000000000000000050F");
        break;
    }
    
    await this.appendToQueue(arr, "Read Hopper");
}


async sendwriteHopper(id,quantity) {
  this.globalFlag = "writeHopper";
  this.currentHopper = id;
  var values=intToHighLow(quantity);
  var low = values[0];
  var high = values[1];
  var hexData=["F0","0"+id,"00","00","00","00","00","00"];
  hexData.push(low);
  hexData.push(high);

  var arr = ["0A"];
  arr = arr.concat(hexData, this.sumHex(hexData), "0F");
  console.log(arr);
  await this.appendToQueue(arr, "Write Hopper");
}


async sendDispenseHopper(id) {
  this.globalFlag = "dispenseHopper";
  this.currentHopper = id;
  var hexData=["02","0"+id,"00","00","00","00","00","00","00","00"];

  var arr = ["0A"];
  arr = arr.concat(hexData,this.sumHex(hexData), "0F");
  console.log(arr);
  await this.appendToQueue(arr, "Dispense Hopper");

}


async sendReadBalance() {
  this.globalFlag = "consultaSaldo";
  const arr = this.stringtoArray("0A04010000000000000000050F");
  await this.appendToQueue(arr, "F14_Consulta Saldo");
}

async sendClearBalance() {
  this.globalFlag = "clearBalance";
    const arr = this.stringtoArray("0A04020000000000000000060F");
    await this.appendToQueue(arr, "F14_Limpia Saldo");
}

async sendInvalid1() {
    const arr = this.stringtoArray("0A000F00");
    await this.appendToQueue(arr, "Invalid_1");
}

async sendDispenseChange(change) {
  this.globalFlag = "dispenseChange";
  var low = change.toString(16).padStart(2, '0');
  var high = (change >> 8).toString(16).padStart(2, '0');
  var hexData=["03","AA","00","00","00","00","00","00"];
  hexData.push(low);
  hexData.push(high);

  //var arr = this.stringtoArray("0A03AA0000000000000002AF0F");
  
  var arr = ["0A"];
  arr = arr.concat(hexData, this.sumHex(hexData), "0F");
  

  await this.appendToQueue(arr, "Cambio_001");
}

stringtoArray(str){
return str.match(/.{1,2}/g); // Divide el string en pares de 2 caracteres
//console.log(byteArray); // ["0A", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "0F"]
}

async sendCambio10() {
    const arr = this.stringtoArray("0A03AA0000000000000001AE0F");
    console.log(arr);
    await this.appendToQueue(arr, "Cambio_010");
}

async sendCambio028() {
    const arr = this.stringtoArray("0A03AA000000000000001CC90F");
    await this.appendToQueue(arr, "Cambio_028");
}

async sendCambio063() {
    const arr = this.stringtoArray("0A03AA000000000000003FEC0F");
    await this.appendToQueue(arr, "Cambio_063");
}

async sendCambio100() {
    const arr = this.stringtoArray("0A03AA0000000000000064110F");
    await this.appendToQueue(arr, "Cambio_100");
}

  async sendCustomCode({ code = "" } = { code: "" }) {
    if (typeof code !== "string") throw new Error("Invalid string");
    const arr = this.stringtoArray(code);
    await this.appendToQueue(arr, "custom");
  }
}


function toSignedInt16(highHex, lowHex) {
  const high = parseInt(highHex, 16);
  const low = parseInt(lowHex, 16);
  const combined = (high << 8) | low;
  // Convertir a entero con signo (16 bits)
  return (combined << 16) >> 16;
}

function intToHighLow(value) {
  if (value < -32768 || value > 32767) {
    throw new RangeError("Value out of 16-bit signed integer range");
  }

  // Convertir a representación de 16 bits sin signo
  const unsigned = value & 0xFFFF;
  const high = (unsigned >> 8) & 0xFF;
  const low = unsigned & 0xFF;

  // Retornar como strings hexadecimales con padding
  return [
    high.toString(16).padStart(2, '0'),
    low.toString(16).padStart(2, '0')
  ];
}

function splitHexStringEvery12Bytes(hexString) {
  const bytes = hexString.match(/.{1,2}/g); // divide en bytes (2 chars)
  const result = [];
  for (let i = 0; i < bytes.length; i += 12) {
    result.push(bytes.slice(i, i + 12));
  }
  return result;
}

function splitHexArrayEvery13Bytes(hexArray) {
    const result = [];
    for (let i = 0; i < hexArray.length; i += 13) {
      result.push(hexArray.slice(i, i + 13));
    }
    return result;
  }