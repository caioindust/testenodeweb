//var app = require('app');  // Module to control application life.
//var BrowserWindow = require('browser-window');  // Module to create native browser window.
var BrowserWindow = require('electron').BrowserWindow;
var app = require('electron').app;
var {Menu, Tray, ipcMain} = require('electron');

const path = require('path');
var fs = require('fs');

const iconPath = path.join(__dirname, 'Electron_0.36.4_Icon.png');
const pathFolderIcons = path.join(__dirname, 'trayicon');
const pathFolderBalloonIcons = path.join(__dirname, 'balloonicon');

app.setName('Notificador');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var appIcon = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform != 'darwin') {
		app.quit();
	}
});


var contextMenu = Menu.buildFromTemplate([

	//{ label: 'Show App', click:  function(){mainWindow.show();} },
	{
		label: 'Quit', click: function () {
			app.isQuiting = true;
			app.quit();

		}
	}
]);

app.on('minimize', function (event) {
	event.preventDefault();
	mainWindow.hide();
});

app.on('maximize', function (event) {
	event.preventDefault();
	mainWindow.show();
});

ipcMain.on('asynchronous-stateChanged', (event, arg) => {

	var statusIconPath = path.join(pathFolderIcons, 'status' + arg.newState + '.png');
	appIcon.setImage(statusIconPath);

	event.sender.send('asynchronous-stateChanged-reply', 'ok');
});

ipcMain.on('asynchronous-notify', (event, arg) => {

	if (!!arg.icon) {

		arg.icon = path.join(pathFolderBalloonIcons, arg.icon + '.png');

		if (!fs.existsSync(arg.icon)) {
			arg.icon = path.join(pathFolderBalloonIcons, 'green.png');
		}

	}else{
		arg.icon = path.join(pathFolderBalloonIcons, 'green.png');
	}

	appIcon.displayBalloon(arg);
	event.sender.send('asynchronous-notify-reply', 'OK');
});

ipcMain.on('asynchronous-message', (event, arg) => {
	console.log(arg);  // prints "ping"
	event.sender.send('asynchronous-reply', 'pong');
});

ipcMain.on('synchronous-message', (event, arg) => {
	console.log(arg);  // prints "ping"
	event.returnValue = 'pong';
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
	// Create the browser window.
	mainWindow = new BrowserWindow({ width: 100, height: 10, show: false });

	//mainWindow = new BrowserWindow({width: 100, height: 100}); 

	//mainWindow.setMenu(null);

    appIcon = new Tray(iconPath);
	appIcon.setToolTip('Notificador');
    appIcon.setContextMenu(contextMenu);

	// and load the index.html of the app.
	mainWindow.loadURL('file://' + __dirname + '/client.html');

	//mainWindow.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
});