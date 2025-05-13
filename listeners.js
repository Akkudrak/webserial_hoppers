
    // Estado de la aplicación
    var state = {
      connected: false,
      showHopperStatus: false,
      hoppers: [
        { id: 1, coinValue: 1, coinName: "1 Peso", count: 100, maxCapacity: 200 },
        { id: 2, coinValue: 2, coinName: "2 Pesos", count: 75, maxCapacity: 200 },
        { id: 3, coinValue: 5, coinName: "5 Pesos", count: 50, maxCapacity: 200 },
        { id: 4, coinValue: 10, coinName: "10 Pesos", count: 25, maxCapacity: 200 }
      ]
    };
    
    // Referencias a elementos DOM
    const connectBtn = document.getElementById('connect-btn');
    const portSelect = document.getElementById('port-select');
    const connectionStatus = document.getElementById('connection-status');
    const messagesContainer = document.getElementById('messages-container');
    const noMessages = document.getElementById('no-messages');
    const clearMessagesBtn = document.getElementById('clear-messages-btn');
    const hopperStatus = document.getElementById('hopper-status');
    const hopperStatusContent = document.getElementById('hopper-status-content');
    const balanceContainer = document.getElementById('balance-container');
    const balanceAmount = document.getElementById('balance-amount');
    const balanceCoins = document.getElementById('balance-coins');
    const balanceTimestamp = document.getElementById('balance-timestamp');
    const balanceCollected = document.getElementById('balance-collected');
    const capacityPercentage = document.getElementById('capacity-percentage');
    const secondaryTimestamp = document.getElementById('secondary-timestamp');

    
    // Botones de comandos
    const readBalanceBtn = document.getElementById('read-balance-btn');
    const getStatusBtn = document.getElementById('get-status-btn');
    const clearBalanceBtn = document.getElementById('clear-balance-btn');
    const readHopperBtn = document.getElementById('read-hopper-btn');
    const writeHopperBtn = document.getElementById('write-hopper-btn');
    const dispenseHopperBtn = document.getElementById('dispense-coin-btn');
    const dispenseChangeBtn = document.getElementById('dispense-change-btn');
    
    // Selectores y campos de entrada
    const readHopperSelect = document.getElementById('read-hopper-select');
    const writeHopperSelect = document.getElementById('write-hopper-select');
    const writeHopperValue = document.getElementById('write-hopper-value');
    const dispenseHopperSelect = document.getElementById('dispense-hopper-select');
    const changeAmount = document.getElementById('change-amount');
    const addHopperSelect = document.getElementById('add-hopper-select');
    const addCoinsAmount = document.getElementById('add-coins-amount');
    
    // Pestañas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Funciones de utilidad
    function updateButtonsState() {
      const buttons = [
        readBalanceBtn, getStatusBtn, clearBalanceBtn, 
        readHopperBtn, writeHopperBtn, dispenseHopperBtn, 
        dispenseChangeBtn,
      ];
      
      buttons.forEach(btn => {
        btn.disabled = !state.connected;
      });
      
      if (state.connected) {
        connectBtn.textContent = 'Desconectar';
        connectBtn.classList.remove('bg-blue-600');
        connectBtn.classList.add('bg-red-600');
        connectionStatus.textContent = 'Conectado';
        connectionStatus.classList.remove('bg-red-100', 'text-red-800');
        connectionStatus.classList.add('bg-green-100', 'text-green-800');
      } else {
        connectBtn.textContent = 'Conectar';
        connectBtn.classList.remove('bg-red-600');
        connectBtn.classList.add('bg-blue-600');
        connectionStatus.textContent = 'Desconectado';
        connectionStatus.classList.remove('bg-green-100', 'text-green-800');
        connectionStatus.classList.add('bg-red-100', 'text-red-800');
      }
    }
    
      function addMessage(type, content) {
      if (noMessages.parentNode) {
        noMessages.parentNode.removeChild(noMessages);
      }
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `flex flex-col p-3 rounded-lg mb-4 fade-in ${
        type === 'sent' ? 'bg-gray-100 ml-8' : 'bg-blue-50 mr-8'
      }`;
      
      const header = document.createElement('div');
      header.className = 'flex justify-between items-center mb-1';
      
      const badge = document.createElement('span');
      badge.className = `px-2 py-0.5 text-xs rounded-full ${
        type === 'sent' ? 'bg-gray-200 text-gray-800' : 'bg-blue-200 text-blue-800'
      }`;
      badge.textContent = type === 'sent' ? 'Enviado' : 'Recibido';
      
      const timestamp = document.createElement('span');
      timestamp.className = 'text-xs text-gray-500';
      timestamp.textContent = new Date().toLocaleTimeString();
      
      header.appendChild(badge);
      header.appendChild(timestamp);
      
      const pre = document.createElement('pre');
      pre.className = 'text-sm whitespace-pre-wrap font-mono';
      pre.textContent = content;
      
      messageDiv.appendChild(header);
      messageDiv.appendChild(pre);
      
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function updateHopperAmountDisplay(data) {
      const totalBalance = data.reduce((sum, hopper) => sum + hopper.coinValue * hopper.count, 0);
      const totalCoins = data.reduce((sum, h) => sum + h.count, 0);
      
      balanceAmount.textContent = `$${totalBalance.toFixed(2)} pesos`;
      balanceCoins.textContent = `${totalCoins} monedas en total`;
      balanceTimestamp.textContent = `Actualizado: ${new Date().toLocaleTimeString()}`;
    
      balanceContainer.classList.remove('hidden');
    }

    function updateBalanceDisplay(value) {
      const totalBalance = value;
      const currentTime = new Date().toLocaleTimeString();
      
      // Actualizar segundo div
      balanceCollected.textContent = totalBalance;
      secondaryTimestamp.textContent = `Actualizado: ${currentTime}`;
      
      // Mostrar contenedor
      balanceContainer.classList.remove('hidden');
    }
    
    function updateHopperStatus(data=null) {
      if (data) {
        state.hoppers = data;
      }
      hopperStatusContent.innerHTML = '';
      
      // Crear elementos para cada hopper
      state.hoppers.forEach(hopper => {
        const hopperDiv = document.createElement('div');
        hopperDiv.className = 'space-y-2';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex justify-between';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'font-medium';
        nameDiv.textContent = `Hopper ${hopper.id} (${hopper.coinName})`;
        
        const countDiv = document.createElement('div');
        countDiv.className = 'text-sm text-gray-500';
        countDiv.textContent = `${hopper.count} / ${hopper.maxCapacity} monedas`;
        
        headerDiv.appendChild(nameDiv);
        headerDiv.appendChild(countDiv);
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'flex items-center gap-2';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'flex-1 bg-gray-200 rounded-full h-3';
        
        const progressValue = document.createElement('div');
        const percentage = (hopper.count<0 ? 0 : Math.round((hopper.count / hopper.maxCapacity) * 100));
        progressValue.className = (hopper.count<0 ? 'bg-red-600 h-3 rounded-full' : 'bg-blue-600 h-3 rounded-full');
        progressValue.style.width = `${percentage}%`;
        
        const percentageText = document.createElement('span');
        percentageText.className = 'text-xs font-medium';
        percentageText.textContent = `${percentage}%`;
        
        progressBar.appendChild(progressValue);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(percentageText);
        
        const valueDiv = document.createElement('div');
        valueDiv.className = 'text-sm text-gray-500';
        valueDiv.textContent = `Valor total: ${hopper.count * hopper.coinValue} pesos`;
        
        hopperDiv.appendChild(headerDiv);
        hopperDiv.appendChild(progressContainer);
        hopperDiv.appendChild(valueDiv);
        
        hopperStatusContent.appendChild(hopperDiv);
      });
      
      // Agregar resumen total
      const summaryDiv = document.createElement('div');
      summaryDiv.className = 'pt-2 border-t mt-4';
      
      const totalValueDiv = document.createElement('div');
      totalValueDiv.className = 'flex justify-between font-medium';
      
      const totalValueLabel = document.createElement('span');
      totalValueLabel.textContent = 'Saldo Total:';
      
      const totalValueAmount = document.createElement('span');
      const totalValue = state.hoppers.reduce((sum, h) => sum + (h.count * h.coinValue), 0);
      totalValueAmount.textContent = `${totalValue} pesos`;
      
      totalValueDiv.appendChild(totalValueLabel);
      totalValueDiv.appendChild(totalValueAmount);
      
      const totalCoinsDiv = document.createElement('div');
      totalCoinsDiv.className = 'flex justify-between text-sm text-gray-500';
      
      const totalCoinsLabel = document.createElement('span');
      totalCoinsLabel.textContent = 'Total Monedas:';
      
      const totalCoinsAmount = document.createElement('span');
      const totalCoins = state.hoppers.reduce((sum, h) => sum + h.count, 0);
      totalCoinsAmount.textContent = `${totalCoins} monedas`;
      
      totalCoinsDiv.appendChild(totalCoinsLabel);
      totalCoinsDiv.appendChild(totalCoinsAmount);
      
      summaryDiv.appendChild(totalValueDiv);
      summaryDiv.appendChild(totalCoinsDiv);
      
      hopperStatusContent.appendChild(summaryDiv);
    }

    function connectMessage(value){
        
        state.connected = value;
        console.log(state.connected)
        
        if (!state.connected) {
            // Ocultar el estado de los hoppers al desconectar
            state.showHopperStatus = false;
            hopperStatus.classList.add('hidden');
        }
        setTimeout(() => {
        updateButtonsState();
        },200);
    }
    
    
    

    
    clearMessagesBtn.addEventListener('click', function() {
      messagesContainer.innerHTML = '';
      messagesContainer.appendChild(noMessages);
    });
    
    // Comandos
    readBalanceBtn.addEventListener('click', function() {
      readBalance();
    });
    
    clearBalanceBtn.addEventListener('click', function() {
      addMessage('sent', 'Limpiando saldo');
      clearBalance();
    });

    dispenseHopperBtn.addEventListener('click', () => {
      const hopperId = dispenseHopperSelect.value;
      addMessage('sent', `Dispensando moneda de Hopper ${hopperId}`);
      dispenseHopper(hopperId);
  });
  
  getStatusBtn.addEventListener('click', () => {
    addMessage('sent', 'Solicitando estado de los hoppers');
    estatus();
  });
    
    readHopperBtn.addEventListener('click', function() {
      addMessage('sent', 'Leyendo Hopper ' + readHopperSelect.value);
      const hopperId = readHopperSelect.value;
      readHopper(`${hopperId}`);
    });
    
    writeHopperBtn.addEventListener('click', function() {
      addMessage('sent', 'Escribiendo en Hopper ' + writeHopperSelect.value);
      const hopperId = writeHopperSelect.value;
      const value = writeHopperValue.value;
      writeHopper(hopperId,value)
    });
    
    dispenseChangeBtn.addEventListener('click', function() {
      addMessage('sent', 'Dispensando cambio: $ '+changeAmount.value + ' pesos');
      const amount = changeAmount.value;
      dispenseChange(amount)
    });
    

    
    // Manejo de pestañas
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tab = this.dataset.tab;
        
        // Actualizar botones
        tabButtons.forEach(btn => {
          if (btn.dataset.tab === tab) {
            btn.classList.add('bg-gray-100', 'text-gray-800');
          } else {
            btn.classList.remove('bg-gray-100', 'text-gray-800');
          }
        });
        
        // Actualizar contenido
        tabContents.forEach(content => {
          if (content.id === `tab-${tab}`) {
            content.classList.remove('hidden');
          } else {
            content.classList.add('hidden');
          }
        });
      });
    });
    
    // Inicialización
    updateButtonsState();
  