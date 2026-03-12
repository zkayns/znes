let controls={
  p1: ["z", "a", "shift", "enter", "arrowup", "arrowdown", "arrowleft", "arrowright"],
  p2: ["g", "t", "o", "p", "i", "k", "j", "l"]
};
let controlManagerKey="`";
let pollingControl=false;
let pollElement;
addEventListener("keydown", (e)=>{
  if (el("popupShade")) return;
  if (e.key==controlManagerKey) {
    if (el("manager")) destroyCurrentManager();
    else openControlManager();
  };
});
if (localStorage.getItem("controls")) controls=JSON.parse(localStorage.getItem("controls"));
addEventListener("mousedown", (e)=>{
  if (document.querySelector(".controlCell:hover")) {
    pollElement=document.querySelector(".controlCell:hover");
    pollElement.style["color"]="#f00";
    pollElement.style["font-weight"]="bold";
    pollingControl=true;
  };
});
addEventListener("keyup", (e)=>{
  if (pollingControl) {
    pollElement.innerHTML=e.key.toLowerCase();
    pollElement.style["color"]="#fff";
    pollElement.style["font-weight"]="normal";
    pollingControl=false;
  };
});
function destroyControlManager() {
  controls.p1=new Array();
  controls.p2=new Array();
  [...document.querySelectorAll(".controlCell")].forEach(c=>{
    controls[`p${c.getAttribute("p")}`][c.getAttribute("c")]=c.innerHTML;
  });
  localStorage.setItem("controls", JSON.stringify(controls));
  destroyManagerCommon();
};
function makeControlCell(w, p) {
  return `<div class='controlCell' c='${w}' p='${p}'>${controls[`p${p}`][w]}</div>`;
};
function makeControlTable(o, p) {
  let r="<table class='managerTable'>";
  for (let i in o) {
    r+=`<tr><td>${Object.keys(nes.INPUT)[i]}</td><td>${makeControlCell(i, p)}</td></tr>`;
  };
  return `${r}</table>`;
};
function openControlManager() {
  destroyCurrentManager=destroyControlManager;
  curManager="CONTROL";
  let manager=document.createElement("div");
  manager.id="manager";
  manager.innerHTML="<h2 id='managerTop'>Control Manager</h3><h4>Player 1</h4>"+
    makeControlTable(controls.p1, 1)+
    "<h4>Player 2</h4>"+
    makeControlTable(controls.p2, 2)+
    managerCommonString;
  document.body.appendChild(manager);
  addManagerDragLogic();
  el("closeManager").addEventListener("mousedown", destroyControlManager);
};