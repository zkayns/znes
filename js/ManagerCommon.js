let draggingManager=false;
let managerListenersAdded=false;
let curManager="";
let destroyCurrentManager=()=>{};
let managerCommonString=`<p id='closeManager'>X</p>`;
let relative;
let managerTimers={};
addEventListener("mouseup", (e)=>{
  draggingManager=false;
});
addEventListener("mousemove", (e)=>{
  if (draggingManager) {
    let manager=el("manager");
    manager.style["left"]=`${e.clientX-relative.x}px`;
    manager.style["top"]=`${e.clientY-relative.y}px`;
  };
});
function destroyManagerCommon() {
  curManager="";
  destroyCurrentManager=()=>{};
  el("manager").remove();
  draggingManager=false;
};
function addManagerDragLogic() {
  el("managerTop").addEventListener("mousedown", (e)=>{
    e.preventDefault();
    draggingManager=true;
    relative={
      x: e.clientX-el("manager").getBoundingClientRect().left, 
      y: e.clientY-el("manager").getBoundingClientRect().top
    };
  });
};