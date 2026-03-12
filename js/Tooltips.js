let mouse={x: 0, y: 0};
let lastTipEl;
function updateTips() {
  let e=document.querySelector("[tooltip]:hover");
  if (lastTipEl==e) {
    let t=el("tooltip");
    if (!t) return;
    t.style["left"]=`${mouse.x+10+scrollX}px`;
    t.style["top"]=`${mouse.y+scrollY}px`;
    return;
  } else {
    let t=el("tooltip");
    if (t) {
      t.remove();
      lastTipEl="";
    };
  };
  if (e) {
    let t=document.createElement("div");
    t.style["pointer-events"]="none";
    t.style["background-color"]="#000000a0";
    t.style["backdrop-filter"]="blur(10px)";
    t.style["border-radius"]="8px";
    t.style["padding"]="4px 8px 4px 8px";
    t.style["position"]="absolute";
    t.style["z-index"]=10000000;
    t.id="tooltip";
    t.innerHTML=e.getAttribute("tooltip");
    document.body.appendChild(t);
    t.style["left"]=`${mouse.x+10+scrollX}px`;
    t.style["top"]=`${mouse.y+scrollY}px`;
    lastTipEl=e;
  };
};
addEventListener("mousemove", (e)=>{
  mouse={x: e.clientX, y: e.clientY};
  updateTips();
});
setInterval(updateTips, 1000/60);