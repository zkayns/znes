class AudioHandler {
  constructor() {
    let Ac=window.AudioContext||window.webkitAudioContext;
    this.hasAudio=!!Ac;
    this.sampleBuffer=new Float64Array(735);
    this.samplesPerFrame=735;
    if(!Ac) log("<span style='color: red;'>Audio disabled: no Web Audio API support</span>");
    else {
      this.actx=new Ac();
      let samples=
        this.samplesPerFrame=
        this.actx.sampleRate/60;
      this.sampleBuffer=new Float64Array(samples);
      log(`Audio initialized, sample rate: ${samples*60}`);
      this.inputBuffer=new Float64Array(4096);
      this.inputBufferPos=0;
      this.inputReadPos=0;
    };
  };
  resume() {
    if (this.hasAudio) this.actx.resume();
  };
  start() {
    if (!this.hasAudio) return;
    this.dummyNode=this.actx.createBufferSource();
    this.dummyNode.buffer=this.actx.createBuffer(1, 44100, 44100);
    this.dummyNode.loop=true;
    this.scriptNode=this.actx.createScriptProcessor(2048, 1, 1);
    let that=this;
    this.scriptNode.onaudioprocess=(e)=>that.process(e);
    this.dummyNode.connect(this.scriptNode);
    this.scriptNode.connect(this.actx.destination);
    this.dummyNode.start();
  };
  stop() {
    if (!this.hasAudio) return;
    this?.dummyNode?.stop?.();
    this?.dummyNode?.disconnect?.();
    delete this.dummyNode;
    this?.scriptNode?.disconnect?.();
    delete this.scriptNode;
    this.inputBufferPos=
      this.inputReadPos=0;
  };
  process(e) {
    if (this.inputReadPos+2048>this.inputBufferPos) this.inputReadPos=this.inputBufferPos-2048;
    if (this.inputReadPos+4096<this.inputBufferPos) this.inputReadPos+=2048;
    let output=e.outputBuffer.getChannelData(0);
    for (let i=0; i<2048; i++) output[i]=this.inputBuffer[(this.inputReadPos++)&0xfff];
  };
  nextBuffer() {
    if (this.hasAudio) for (let i=0; i<this.samplesPerFrame; i++) this.inputBuffer[(this.inputBufferPos++)&0xfff]=this.sampleBuffer[i];
  };
};