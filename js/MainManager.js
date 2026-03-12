let ramManagerKey="=";
let ramManagerInterval;
let ramManagerLast;
let ramLocks={};
let settings={
  invert: 0,
  noSharp: 0,
  audioOverlay: 1,
  audioOverlaySize: 1,
  audioOverlayMode: 1,
  controlOverlay: 0
};
if (localStorage.getItem("ramLocks")) ramLocks=JSON.parse(localStorage.getItem("ramLocks"));
if (localStorage.getItem("settings")) Object.assign(settings, JSON.parse(localStorage.getItem("settings")));
addEventListener("keydown", (e)=>{
  if (el("popupShade")) return;
  if (e.key==ramManagerKey) {
    if (el("manager")) destroyCurrentManager();
    else openRamManager();
  };
  if (document.activeElement.classList.contains("ramLockInput")&&e.key=="Enter") ramLocks[document.activeElement.getAttribute("l")]=parseInt(document.activeElement.value);
  if (document.activeElement.id=="newLockContent"&&e.key=="Enter") {
    ramLocks[el("newLockAddr").value]=parseInt(el("newLockContent").value);
    el("newLockAddr").remove();
    el("newLockContent").remove();
    el("cancelNewLock").remove();
  };
});
addEventListener("mousedown", (e)=>{
  if (document.querySelector(".removeRamLock:hover")) {
    let l=document.querySelector(".removeRamLock:hover").getAttribute("l");
    delete ramLocks[l];
  };
  if (document.querySelector("#newRamLock:hover")) {
    let el1=document.createElement("input");
    el1.type="number";
    el1.classList.add("smallInput");
    el1.value=0;
    el1.id="newLockAddr";
    let el2=document.createElement("input");
    el2.type="number";
    el2.classList.add("smallInput");
    el2.value=0;
    el2.id="newLockContent";
    let el3=document.createElement("button");
    el3.id="cancelNewLock";
    el3.innerHTML="X";
    document.querySelector("#newRamLock:hover").before(el1);
    el1.after(el2);
    el2.after(el3);
    document.querySelector("#newRamLock:hover").remove();
    el("clearRamLocks").disabled=true;
  };
  if (document.querySelector("#cancelNewLock:hover")) {
    el("newLockAddr").remove();
    el("newLockContent").remove();
    el("cancelNewLock").remove();
    el("clearRamLocks").disabled=false;
  };
  if (document.querySelector("#clearRamLocks:hover")) ramLocks={};
  if (document.querySelector(".colOpt:hover")) {
    let e=document.querySelector(".colOpt:hover");
    nes.ppu.writePalette(el("colorPreview").getAttribute("p"), parseInt(e.getAttribute("p")));
  };
  if (document.querySelector(".palColor:not(.colOpt):hover")) {
    makePopup((()=>{
      let e=document.querySelector(".palColor:not(.colOpt):hover");
      let r="";
      r+="<h3>Color Editor</h3>"+
        `<div id='colorPreview' p=${e.getAttribute("p")} style='background-color: ${e.style["background-color"]};'></div><br>`+
        `<div id='colorOptions'></div><br>`;
      return r;
    })(), {
      id: "colorEditor",
      height: "AUTO"
    });
    return;
  };
  if (document.querySelector("#exportPal:hover")) {
    let u=URL.createObjectURL(new Blob([btoa(JSON.stringify(nes.ppu.paletteRam))]));
    let e=document.createElement("a");
    e.href=u;
    e.download="palette.wnp";
    document.body.appendChild(e);
    e.click();
    URL.revokeObjectURL(u);
    e.remove();
  };
  if (document.querySelector("#importPal:hover")) {
    let i=document.createElement("input");
    i.type="file";
    i.addEventListener("change", (e)=>{
      if (e.target.files.length) {
        let f=e.target.files[0];
        let fr=new FileReader();
        fr.addEventListener("load", ()=>{
          let d=JSON.parse(atob(fr.result));
          for (let j in d) nes.ppu.writePalette(j, d[j]);
        });
        fr.readAsText(e.target.files[0]);
      };
      i.remove();
    });
    document.body.appendChild(i);
    i.click();
  };
});
function flip(w) {
  settings[w]^=1;
};
function palEdit(pal, w) {
  nes.ppu.writePalette(w, parseInt(prompt("Color IDX", nes.ppu.readPalette(w))));
};
function destroyRamManager() {
  destroyManagerCommon();
  clearInterval(ramManagerInterval);
};
function openRamManager() {
  destroyCurrentManager=destroyRamManager;
  curManager="MAIN";
  let manager=document.createElement("div");
  manager.id="manager";
  manager.innerHTML="<h2 id='managerTop'>Main Manager</h3>"+
    "<h4>Get/Set</h4>"+
    "<input class='smallInput' id='getRam' value=0>"+
    "<input class='smallInput' id='setRam' type='number' value=0>"+
    "<div id='managerResult'></div>"+
    "<h4>RAM Locks</h4><div id='ramLocks'></div>"+
    "<h4>Palettes</h4><h5>Current</h5><div id='curPal'></div>"+
    "<br><button id='exportPal'>Export Current</button> <button id='importPal'>Import</button><br>"+
    "<h4>Rendering Options</h4>"+
    `<input tooltip='<span>Inverts the color of the display.</span>' onchange='flip("invert");' type='checkbox' id='invert'${settings.invert?" checked":""}><label for='invert'>Invert Colors</label><br>`+
    `<input tooltip='<span>Disables sharpening of the display canvas.</span>' onchange='flip("noSharp");' type='checkbox' id='noSharp' ${settings.noSharp?" checked":""}><label for='noSharp'>Disable Sharpening</label><br>`+
    `<input tooltip='<span>Enables the Audio Overlay.</span>' onchange='flip("audioOverlay");' type='checkbox' id='audioOverlay'${settings.audioOverlay?" checked":""}><label for='audioOverlay'>Audio Overlay</label><br>`+
    `<input class='smallInput' type='number' value=${settings.audioOverlaySize} onchange='settings.audioOverlaySize=this.value;' id='audioOverlaySize'><label for='audioOverlaySize'>Audio Overlay Size</label><br>`+
    `<select onchange='settings.audioOverlayMode=parseFloat(this.value);' id='audioOverlayMode'><option value="0"${(settings.audioOverlayMode==0)?" selected":""}>Vertical</option><option value="1"${(settings.audioOverlayMode==1)?" selected":""}>Horizontal</option></select><label for='audioOverlayMode'>Audio Overlay Mode</label><br>`+
    `<input tooltip='<span>Enables the Control Overlay.</span>' onchange='flip("controlOverlay");' type='checkbox' id='controlOverlay'${settings.controlOverlay?" checked":""}><label for='controlOverlay'>Control Overlay</label>`+
    managerCommonString;
  ramManagerLast=Date.now();
  managerTimers["rePalette"]=0;
  ramManagerInterval=setInterval(()=>{
    if (!nes) return;
    if (curManager!="MAIN") return;
    let d=Date.now()-ramManagerLast;
    for (let i in managerTimers) managerTimers[i]+=d;
    let e=el("managerResult");
    el("curPal").innerHTML=(()=>{
      let r="";
      for (let i in nes.ppu.paletteRam) {
        let p=nes.ppu.readPalette(i);
        let pal=nes.ppu.nesPal;
        r+=`<div class='palColor' p=${i} style='background-color: rgb(${pal[p][0]}, ${pal[p][1]}, ${pal[p][2]});'></div>`;
      };
      return r;
    })();
    if (el("colorEditor")) {
      let p=nes.ppu.readPalette(el("colorPreview").getAttribute("p"));
      let pal=nes.ppu.nesPal;
      el("colorPreview").style["background-color"]=`rgb(${pal[p][0]}, ${pal[p][1]}, ${pal[p][2]})`;
      el("colorPreview").setAttribute("tooltip", `<span style='color: ${el("colorPreview").style["background-color"]};'>${pal[p][0]}, ${pal[p][1]}, ${pal[p][2]}</span>`);
      el("colorPreview").innerHTML=`<p style='text-align: center;'>${p}</p>`;
      if (managerTimers["rePalette"]>=500) {
        el("colorOptions").innerHTML=(()=>{
          let r="";
          for (let i in nes.ppu.nesPal) {
            let pal=nes.ppu.nesPal;
            let rgbStr=`${pal[i][0]}, ${pal[i][1]}, ${pal[i][2]}`;
            let colStr=`rgb(${rgbStr});`;
            r+=`<div class='palColor colOpt' tooltip='<span style="font-style: italic; color: ${colStr}">${rgbStr}</span>' p=${i} style='background-color: ${colStr}'><p>${i}</p></div>`;
          };
          return r;
        })();
        managerTimers["rePalette"]=0;
      };
    };
    e.innerHTML=nes.ram[parseInt(el("getRam").value, 16)];
    if (!document.activeElement.classList.contains("ramLockInput")&&!el("newLockAddr")) el("ramLocks").innerHTML=(()=>{
      let r="";
      for (let i in ramLocks) r+=`<div><label>${i}</label> <input class='smallInput ramLockInput' l='${i}' type='number' value=${ramLocks[i]}> <button l='${i}' class='removeRamLock'>X</button></div>`;
      return r+`<div><button id='newRamLock'>New</button> <button id='clearRamLocks'>Clear All</button></div>`;
    })();
    for (let i of ["invert", "noSharp"]) { // settings bound to canvas classes
      if (settings[i]) el("output").classList.add(i);
      else el("output").classList.remove(i);
    };
    localStorage.setItem("ramLocks", JSON.stringify(ramLocks));
    localStorage.setItem("settings", JSON.stringify(settings));
    ramManagerLast=Date.now();
  }, 16);
  document.body.appendChild(manager);
  el("setRam").addEventListener("keydown", (e)=>{
    if (e.key=="Enter") nes.ram[parseInt(el("getRam").value, 16)]=el("setRam").value;
  });
  addManagerDragLogic();
  el("closeManager").addEventListener("mousedown", destroyRamManager);
};