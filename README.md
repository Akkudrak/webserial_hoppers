# Probador de Puerto Serial para Controladora de Hoppers de Monedas

Este proyecto proporciona una interfaz web para probar y controlar una tarjeta controladora de hoppers de monedas de 1, 2, 5 y 10 pesos con validador de monedas a través de un puerto serial.

## Funcionalidades

* **Conexión/Desconexión Serial:** Permite establecer y cerrar la conexión con el dispositivo a través del puerto serial.
* **Lectura de Saldos:** Recupera el conteo de monedas en cada hopper.
* **Estado de Hoppers:** Obtiene el estado detallado de cada hopper (cantidad de monedas, capacidad).
* **Dispensar Monedas:** Permite dispensar una cantidad específica de monedas desde un hopper seleccionado.
* **Dispensar Cambio:** Calcula y dispensa el cambio utilizando los hoppers disponibles.
* **Recarga de Hoppers:** Permite agregar o ajustar la cantidad de monedas en cada hopper.
* **Registro de Mensajes:** Muestra los mensajes enviados y recibidos a través del puerto serial para depuración y seguimiento.
* **Interfaz de Usuario Intuitiva:** Diseño claro y fácil de usar con Tailwind CSS.

## Tecnologías Utilizadas

* **HTML:** Estructura de la página web.
* **JavaScript:** Lógica de la aplicación y comunicación serial.
* **Tailwind CSS:** Framework de CSS para el diseño de la interfaz de usuario.
* **Web Serial API:** Para la comunicación con el puerto serial.

## Estructura del Proyecto

* `index.html`:  Página principal con la interfaz de usuario.
* `hopper.js`:  Clase `Hopper` que encapsula la lógica de comunicación con el dispositivo y el manejo de comandos.
* `serialConnection.js`:  Configura la conexión serial y maneja los eventos de mensajes.
* `listeners.js`:  Maneja los eventos de la interfaz de usuario y actualiza el estado de la aplicación.
* `webserial-core.js`:  Librería auxiliar para la comunicación serial.

## Requisitos

* Navegador web compatible con la Web Serial API (Chrome, Edge).
* Tarjeta controladora de hoppers de monedas conectada al ordenador a través de un puerto serial.

## Instalación y Uso

1.  Clonar el repositorio.
2.  Abrir `index.html` en un navegador web compatible.
3.  Seleccionar el puerto serial y conectar con el dispositivo.
4.  Utilizar los controles de la interfaz para interactuar con la controladora de hoppers.

##  Notas Adicionales

* Asegúrese de que el puerto serial esté configurado correctamente (baud rate, parity, etc.) según las especificaciones de la tarjeta controladora.
* Este proyecto está diseñado para facilitar las pruebas y el desarrollo con controladoras de hoppers de monedas.  Puede ser necesario adaptarlo o extenderlo para su uso en producción.

## Capturas de Pantalla
_(Aquí podrías incluir capturas de pantalla de la interfaz de usuario)_

## Desarrollador

_(Tu nombre o el nombre del equipo de desarrollo)_