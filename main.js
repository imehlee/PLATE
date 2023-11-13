var start = false;
var btn = document.querySelector(".modal-exit");
btn.addEventListener("click", function(){
  request.send();  
  request2.send();
  start = true;
});

var timer = null;
var touch = false;
var txPos = 0;
var tx = 0;
var ty = 0;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

window.addEventListener('resize', function(){
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

})

const moveHandler = (e) => {
  const cursorX = e.clientX || e.touches[0].clientX;
  const cursorY = e.clientY || e.touches[0].clientY;
  updatePanner(cursorX, cursorY);
}

const wetFadeIn = (e) => {
  wet2.gain.value = 0.01;
  wet2.gain.linearRampToValueAtTime(1.2, ctx.currentTime + 0.5);
}

const wetFadeOut = (e) => {
    //wet2.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    wet2.gain.value = 0.01;
}


//Initialize Audio
var ctx = new (window.AudioContext || window.webkitAudioContext)();
var mainVolume = ctx.createGain();
mainVolume.connect(ctx.destination);
panner = ctx.createPanner();
reverb = ctx.createConvolver();

//panner setting
panner.panningModel = "HRTF";
panner.positionX.value = 0;
panner.positionY.value = 0;
panner.positionZ.value = -2;
panner.distanceModel = "exponential";
panner.refDistance = 1;
panner.maxDistance = 10000;
panner.rolloffFactor = 1;
panner.coneInnerAngle = 360;
panner.coneOuterAngle = 0;
panner.coneOuterGain = 0;



//soundSource1(ambience)
var sound1 = {};
sound1.source = ctx.createBufferSource();
sound1.volume = ctx.createGain();

//ambience gain
sound1.volume.gain.value = 0.1;

sound1.source.connect(sound1.volume);
sound1.volume.connect(mainVolume);

sound1.source.loop = true;

var request = new XMLHttpRequest();
request.open("GET", "/sample/ambience.wav", true);
request.responseType = "arraybuffer";

request.onload = function(e) {

  ctx.decodeAudioData(this.response, function onSuccess(buffer) {
    sound1.buffer = buffer;
    sound1.source.start();
    sound1.source.buffer = sound1.buffer;
  });
};

//soundSource2(flute)
var sound2 = {};
sound2.source = ctx.createBufferSource();

// sound2 reverb
dry2 = ctx.createGain();
wet2 = ctx.createGain();

sound2.source.connect(panner);
panner.connect(dry2);
panner.connect(wet2);
dry2.connect(mainVolume);
wet2.connect(reverb);
reverb.connect(mainVolume);

sound2.source.loop = true;

var request2 = new XMLHttpRequest();
request2.open("GET", "/sample/vox.wav", true);
request2.responseType = "arraybuffer";
request2.onload = function(e) {

  ctx.decodeAudioData(this.response, function onSuccess(buffer) {
    sound2.buffer = buffer;

    sound2.source.buffer = sound2.buffer;
    sound2.source.start();  
  });
};


// Set Reverb
function setReverbImpulseResponse(url) {
  // Load impulse response asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    ctx.decodeAudioData(
      request.response,
      function (buffer) {
        reverb.buffer = buffer;
      },

      function (buffer) {
        console.log("Error decoding impulse response!");
      }
    );
  };

  request.send();
}

setReverbImpulseResponse(
 "/sample/echo-chamber.wav"
);

document.body.addEventListener('mousedown', function(e) {
  this.addEventListener('mousemove', moveHandler);
  wetFadeOut();
});

document.body.addEventListener('mouseup', function (e) {
  this.removeEventListener('mousemove', moveHandler);
  wetFadeIn();
});

function updatePanner(x, y) {
  var a = x / WIDTH;
  var b = y / HEIGHT;

  tx = 5.0 * (2.0 * a - 1.0);
  ty = -7.0 * (2.0 * b - 1.0);
  

  panner.positionX.value = tx;
  panner.positionY.value = ty;

  //console.log(tx, ty);

}

//Mobile Touch
document.body.addEventListener('touchstart', function(e) {
  addEventListener("touchmove", moveHandler);
  wetFadeOut();
})


document.body.addEventListener('touchend', function(e) {
  this.removeEventListener('touchmove', moveHandler);
  wetFadeIn();
});