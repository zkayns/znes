let nes=new Nes();
let audioHandler=new AudioHandler();
let paused=false;
let loaded=false;
let pausedInBg=false;
let loopId=0;
let loadedName="";
let c=el("output");
c.width=256;
c.height=240;
let ctx=c.getContext("2d");
let imgData=ctx.createImageData(256, 240);
zip.workerScriptsPath="lib/";
zip.useWebWorkers=false;
let dc=el("doutput");
dc.width=512;
dc.height=480;
let dctx=dc.getContext("2d");
let db=new Debugger(nes, dctx);
el("rom").onchange=e=>{
  audioHandler.resume();
  let freader=new FileReader();
  freader.onload=()=>{
    let buf=freader.result;
    if (/.*\.(?:zip|ZIP)/g.test(e.target.files[0].name)) {
      // use zip.js to read the zip
      let blob=new Blob([buf]);
      zip.createReader(new zip.BlobReader(blob), reader=>{
        reader.getEntries(entries=>{
          if (!entries.length) return log("Zip file was empty");
          if (!entries.some(i=>{
            let name=i.filename;
            if (!/.*\.(?:nes|NES)/g.test(name)) return;
            log(`Loaded "${name}" from zip`);
            i.getData(new zip.BlobWriter(), blob=>{
              let breader=new FileReader();
              breader.onload=()=>{
                loadRom(new Uint8Array(breader.result), name);
                reader.close();
              };
              breader.readAsArrayBuffer(blob);
            });
            return true;
          })) log("No .nes file found in zip");
        });
      }, err=>{
        log(`Failed to read zip: ${err}`);
      });
    } else loadRom(new Uint8Array(buf), structuredClone(e.target.value.split("\\")).pop());
  };
  freader.readAsArrayBuffer(e.target.files[0]);
};
el("pause").onclick=e=>{
  if(paused&&loaded) {
    loopId=requestAnimationFrame(update);
    audioHandler.start();
    paused=false;
    el("pause").innerText="Pause";
  } else {
    cancelAnimationFrame(loopId);
    audioHandler.stop();
    paused=true;
    el("pause").innerText="Unpause";
  };
};
el("reset").onclick=e=>nes.reset(false);
el("hardreset").onclick=e=>nes.reset(true);
el("runframe").onclick=e=>{if (loaded) runFrame()};
document.onvisibilitychange=e=>{
  if(document.hidden) {
    pausedInBg=false;
    if(!paused&&loaded) {
      el("pause").click();
      pausedInBg=true;
    };
  } else {
    if(pausedInBg&&loaded) {
      el("pause").click();
      pausedInBg=false;
    };
  };
};
window.onpagehide=saveBatteryForRom;
function loadRom(rom, name) {
  saveBatteryForRom();
  if (nes.loadRom(rom)) {
    // load the roms battery data
    let data=localStorage.getItem(`${name}_battery`);
    if (data) {
      let obj=JSON.parse(data);
      nes.setBattery(obj);
      log("Loaded battery");
    };
    nes.reset(true);
    if (!loaded&&!paused) {
      loopId=requestAnimationFrame(update);
      audioHandler.start();
    };
    loaded=true;
    loadedName=name;
  };
};
function saveBatteryForRom() {
  // save the loadedName's battery data
  if (loaded) {
    let data=nes.getBattery();
    if (data) {
      try {
        localStorage.setItem(`${loadedName}_battery`, JSON.stringify(data));
        log("Saved battery");
      } catch(e) {
        log(`Failed to save battery: ${e}`);
      };
    };
  };
};
function update() {
  runFrame();
  loopId=requestAnimationFrame(update);
};
function runFrame() {
  nes.runFrame();
  nes.getSamples(audioHandler.sampleBuffer, audioHandler.samplesPerFrame);
  audioHandler.nextBuffer();
  nes.getPixels(imgData.data);
  ctx.putImageData(imgData, 0, 0);
  drawOverlays();
};
function log(text) {
  el("log").innerHTML+=`${text}<br>`;
  el("log").scrollTop=el("log").scrollHeight;
};
function el(i) {
  return document.getElementById(i);
};
window.onkeydown=e=>{
  if (document.activeElement.tagName=="INPUT"||el("popupShade")) return;
  if (controls.p1.includes(e.key.toLowerCase())) {
    nes.setButtonPressed(1, controls.p1.indexOf(e.key.toLowerCase()));
    e.preventDefault();
  };
  if (controls.p2.includes(e.key.toLowerCase())) {
    nes.setButtonPressed(2, controls.p2.indexOf(e.key.toLowerCase()));
    e.preventDefault();
  };
};
window.onkeyup=e=>{
  if (document.activeElement.tagName=="INPUT"||el("popupShade")) return;
  if (controls.p1.includes(e.key.toLowerCase())) {
    nes.setButtonReleased(1, controls.p1.indexOf(e.key.toLowerCase()));
    e.preventDefault();
  };
  if (controls.p2.includes(e.key.toLowerCase())) {
    nes.setButtonReleased(2, controls.p2.indexOf(e.key.toLowerCase()));
    e.preventDefault();
  };
  if (e.key.toLowerCase()==="m"&&loaded) {
    let saveState=nes.getState();
    try {
      localStorage.setItem(`${loadedName}_savestate`, JSON.stringify(saveState));
      log("Saved state");
    } catch(e) {
      log(`Failed to save state: ${e}`);
    };
  };
  if (e.key.toLowerCase()==="n"&&loaded) {
    let data=localStorage.getItem(`${loadedName}_savestate`);
    if (data) {
      if (nes.setState(JSON.parse(data))) log("Loaded state");
      else log("Failed to load state");
    } else log("No state saved yet");
  };
};
el("bpatterns").onclick=()=>{
  if (!loaded) return;
  db.setView(0);
};
el("bnametables").onclick=()=>{
  if (!loaded) return;
  db.setView(1);
};
el("bram").onclick=()=>{
  if (!loaded) return;
  db.setView(2);
};
el("bdis").onclick=()=>{
  if (!loaded) return;
  db.setView(3);
};
el("dtextoutput").onwheel=e=>{
  if (!loaded) return;
  db.changeScrollPos(Math.floor(e.deltaY * 0.3));
  e.preventDefault();
};
el("stepinstr").onclick=()=>{
  if (!loaded) return;
  db.runInstruction();
  draw();
};
el("runframe").onclick=()=>{
  if (!loaded) return;
  runFrame();
  db.updateDebugView();
};
el("bpadd").onclick=()=>{
  if (!loaded) return;
  let adr=parseInt(el("bpaddress").value, 16);
  if (isNaN(adr)||adr<0||adr>=0x10000) {
    log("Invalid address for breakpoint");
    return;
  };
  let type=+el("bptype").value;
  db.addBreakpoint(adr, type);
};