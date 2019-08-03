var client;
var startedTime;
var intervalId;
var video = document.getElementById('video');
var testTimeout;
var actions = toyconfig.actions;

var videoSource = document.getElementById('videoSource');
videoSource.setAttribute('src', videoSrc);

video.load();

video.onended = function () {
  stop();
};

video.ontimeupdate = function () {
  if(!video.paused){
  checkVibration(video.currentTime);
  console.log(video.currentTime);
  }
};

video.onpause = function () {
  stopAllToys();
};

$("#sctnCalibration").hide();
$("#sctnToys").hide();
$("#sctnPodcast").hide();

$("#btnTestStop").hide();
$("#btnTestReady").hide();


function launchTest() {
  $("#btnTestStart").hide();
  $("#btnTestStop").show();
  client._devices.forEach(async function (d) {
    Slide(d, 0.4);
    testTimeout = setTimeout(() => stopTest(), 2500);
  });
}

function stopTest() {
  $("#btnTestStart").show();
  $("#btnTestStop").hide();
  $("#btnTestReady").show();
  if (testTimeout) {
    clearTimeout(testTimeout);
  }
  client._devices.forEach(async function (d) {
    Slide(d, 0.0);
  });
}

function ready() {
  $("#sctnCalibration").hide();
  $("#sctnPodcast").show();
}

function checkVibration(currentTimeInSeconds) {
    var currentTimeInMilliseconds = currentTimeInSeconds*1000;
    var progression = actions.filter((i) => i.at <= currentTimeInMilliseconds);
    if (progression && progression.length > 0) {
      progression = progression[progression.length - 1];
      let vibration = progression.pos/100;
      client._devices.forEach(async function (d) {
        console.log("time:"+currentTimeInMilliseconds+", slide:"+progression.pos);
        Slide(d, vibration);
      });
    
  }
}

function Slide(device, power) {
  client.SendDeviceMessage(device, device.SendVibrateCmd(power));
}

function stopAllToys() {
  client._devices.forEach(async function (d) {
    Slide(d, 0.0);
  });
}

function generateDeviceLi(device) {
  let li = document.createElement("li");
  li.appendChild(document.createTextNode(device.Name));
  return li;
}

let connectToys = async (connectAddress) => {
  if (connectAddress == 'debug') {
    ButtplugDevTools.CreateLoggerPanel(Buttplug.ButtplugLogger.Logger);
    client = await ButtplugDevTools.CreateDevToolsClient(Buttplug.ButtplugLogger.Logger);
    ButtplugDevTools.CreateDeviceManagerPanel(client.Connector.Server);
  }
  else {
    client = new Buttplug.ButtplugClient("Tutorial Client");
  }
  let ul = $('#yourdevices');
  ul.empty();

  client.addListener('deviceadded', async (device) => {
    $("#button-enterRoom").prop("disabled", false);
    li = generateDeviceLi(device);

    ul.append(li);
    await client.StopScanning();
    $("#sctnSync").hide();
    $("#sctnToys").show();
    $("#sctnCalibration").show();
  });

  try {
    if (connectAddress !== undefined && connectAddress !== 'debug') {
      const connector = new Buttplug.ButtplugBrowserWebsocketClientConnector("wss://localhost:12345/buttplug");
      await client.Connect(connector);
    }
    else if (connectAddress == 'debug') {

    }
    else {
      const connector = new Buttplug.ButtplugEmbeddedClientConnector();
      await client.Connect(connector);
    }
  } catch (e) {
    console.log(e);
    return;
  }

  await client.StartScanning();


}