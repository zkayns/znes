let popupCommonString=`<style>
#closePopup {
  position: absolute;
  right: 10px;
  top: 0px;
  cursor: pointer;
  user-select: none;
}
</style><p id='closePopup'>X</p>`;
function makePopup(content, config={}) {
  let p=document.createElement("div");
  config.width??=440;
  config.height??=320;
  config.bg??="#000000e0";
  config.id??="";
  p.id=config.id;
  p.classList.add("popup");
  p.style["width"]=config.width!="AUTO"?`${config.width}px`:"";
  p.style["height"]=config.height!="AUTO"?`${config.height}px`:"";
  p.style["background-color"]=config.bg;
  p.style["z-index"]=999999;
  p.style["position"]="absolute";
  p.style["border-radius"]="8px";
  p.innerHTML=content+popupCommonString;
  document.body.appendChild(p);
  let o=document.createElement("div");
  o.id="popupShade";
  o.style["background-color"]="#00000080";
  o.style["width"]="100%";
  o.style["height"]="100%";
  o.style["position"]="absolute";
  o.style["left"]="0px";
  o.style["top"]="0px";
  o.style["z-index"]=999998;
  p.after(o);
  correctPos();
};
function closePopup() {
  for (let i of document.querySelectorAll(".popup")) i.remove();
  el("popupShade").remove();
  document.body.style["overflow"]="scroll";
};
function correctPos() {
  if (document.querySelector(".popup")) {
    let p=document.querySelector(".popup");
    p.style["left"]=`${innerWidth/2+scrollX-p.getBoundingClientRect().width/2}px`;
    p.style["top"]=`${innerHeight/2+scrollY-p.getBoundingClientRect().height/2}px`;
    document.querySelector("#popupShade").style["top"]=`${scrollY}px`;
    document.body.style["overflow"]="hidden";
  };
};
addEventListener("mousedown", (e)=>{
  if (document.querySelector("#closePopup:hover")||document.querySelector("#popupShade:hover")) closePopup();
});
addEventListener("scroll", correctPos);
setInterval(correctPos, 120 );