function Apu(nes) {

  // memory handler
  this.nes=nes;

  // duty cycles
  this.dutyCycles=[
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1, 1, 1, 1]
  ];
  // legth counter load values
  this.lengthLoadValues=[
    10, 254, 20, 2,  40, 4,  80, 6,  160, 8,  60, 10, 14, 12, 26, 14,
    12, 16,  24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30
  ];
  // triangle steps
  this.triangleSteps=[
    15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5,  4,  3,  2,  1,  0,
    0,  1,  2,  3,  4,  5,  6, 7, 8, 9, 10, 11, 12, 13, 14, 15
  ];
  // noise timer values
  this.noiseLoadValues=[
    4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068
  ];
  // dmc timer value
  this.dmcLoadValues=[
    428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106, 84, 72, 54
  ];
  this.reset=function() {
    this.output=new Float64Array(29781);
    this.p1Timer=
      this.p2Timer=
      this.p1TimerValue=
      this.p2TimerValue=
      this.p1Duty=
      this.p2Duty=
      this.p1DutyIndex=
      this.p2DutyIndex=
      this.p1Decay=
      this.p2Decay=
      this.p1EnvelopeCounter=
      this.p2EnvelopeCounter=
      this.p1SweepShift=
      this.p2SweepShift=
      this.p1SweepTimer=
      this.p2SweepTimer=
      this.p1SweepTarget=
      this.p2SweepTarget=
      this.p1Counter=
      this.p2Counter=
      this.p1Volume=
      this.p2Volume=
      this.p1SweepPeriod=
      this.p2SweepPeriod=
      this.triTimer=
      this.triTimerValue=
      this.triStepIndex=
      this.triOutput=
      this.triCounter=
      this.triLinearCounter=
      this.triLinearReload=
      this.noiseOutput=
      this.noiseCounter=
      this.noiseVolume=
      this.noiseDecay=
      this.noiseTimer=
      this.noiseTimerValue=
      this.dmcTimer=
      this.dmcTimerValue=
      this.dmcOutput=
      this.dmcSample=
      this.dmcSampleLength=
      this.dmcBytesLeft=
      this.dmcShifter=
      this.noiseEnvelopeCounter=
      this.outputOffset=
      this.frameCounter=
      this.p1Output=
      this.p2Output=0;
    this.p1CounterHalt=
      this.p2CounterHalt=
      this.p1ConstantVolume=
      this.p2ConstantVolume=
      this.p1EnvelopeStart=
      this.p2EnvelopeStart=
      this.p1SweepEnabled=
      this.p2SweepEnabled=
      this.p1SweepNegate=
      this.p2SweepNegate=
      this.p1SweepReload=
      this.triCounterHalt=
      this.triReloadLinear=
      this.dmcInterrupt=
      this.dmcLoop=
      this.noiseConstantVolume=
      this.noiseEnvelopeStart=
      this.noiseCounterHalt=
      this.noiseTonal=
      this.interruptInhibit=
      this.step5Mode=
      this.enableNoise=
      this.enableTriangle=
      this.enablePulse2=
      this.enablePulse1=
      this.p2SweepReload=false;
    this.p1SweepMuting=
      this.dmcSilent=
      this.dmcSampleEmpty=
      this.p2SweepMuting=true;
    this.dmcSampleAddress=
      this.dmcAddress=0xc000;
    this.noiseShift=1;
    this.dmcBitsLeft=8;
  };
  this.reset();
  this.saveVars=Object.keys(this);
  this.cycle=function() {
    if(
      (this.frameCounter === 29830 && !this.step5Mode) ||
      this.frameCounter === 37282
    ) this.frameCounter=0;
    this.frameCounter++;
    this.handleFrameCounter();
    this.cycleTriangle();
    this.cyclePulse1();
    this.cyclePulse2();
    this.cycleNoise();
    this.cycleDmc();
    this.output[this.outputOffset++]=this.mix();
    if (this.outputOffset===29781) this.outputOffset--
  };
  this.cyclePulse1=function() {
    if (this.p1TimerValue) this.p1TimerValue--;
    else {
      this.p1TimerValue=this.p1Timer*2+1;
      this.p1DutyIndex++;
      this.p1DutyIndex&=7;
    };
    if (!this.dutyCycles[this.p1Duty][this.p1DutyIndex]||this.p1SweepMuting||!this.p1Counter) this.p1Output=0;
    else this.p1Output=this.p1ConstantVolume?this.p1Volume:this.p1Decay;
  };
  this.cyclePulse2=function() {
    if (this.p2TimerValue) this.p2TimerValue--;
    else {
      this.p2TimerValue=this.p2Timer*2+1;
      this.p2DutyIndex++;
      this.p2DutyIndex&=7;
    };
    if (!this.dutyCycles[this.p2Duty][this.p2DutyIndex]||this.p2SweepMuting||!this.p2Counter) this.p2Output=0;
    else this.p2Output=this.p2ConstantVolume?this.p2Volume:this.p2Decay;
  };
  this.cycleTriangle=function() {
    if(this.triTimerValue) this.triTimerValue--;
    else {
      this.triTimerValue=this.triTimer;
      if(this.triCounter&&this.triLinearCounter) {
        this.triOutput=this.triangleSteps[this.triStepIndex++];
        if(this.triTimer<2) this.triOutput=7.5;
        this.triStepIndex&=0x1f;
      };
    };
  };
  this.cycleNoise=function() {
    if(this.noiseTimerValue) this.noiseTimerValue--;
    else {
      this.noiseTimerValue=this.noiseTimer;
      let feedback=this.noiseShift&1;
      if (this.noiseTonal) feedback^=(this.noiseShift&64)>>6;
      else feedback^=(this.noiseShift&2)>>1;
      this.noiseShift>>=1;
      this.noiseShift|=feedback<<14;
    };
    if(!this.noiseCounter||(this.noiseShift&1)===1) this.noiseOutput=0;
    else this.noiseOutput=(this.noiseConstantVolume?this.noiseVolume:this.noiseDecay);
  };
  this.cycleDmc=function() {
    if(this.dmcTimerValue) this.dmcTimerValue--;
    else {
      this.dmcTimerValue=this.dmcTimer;
      if(!this.dmcSilent) {
        if(!(this.dmcShifter&1)) if(this.dmcOutput>=2) this.dmcOutput-=2;
        else if (this.dmcOutput<=125) this.dmcOutput+=2;
      }
      this.dmcShifter>>=1;
      this.dmcBitsLeft--;
      if(!this.dmcBitsLeft) {
        this.dmcBitsLeft=8;
        if (this.dmcSampleEmpty) this.dmcSilent=true;
        else {
          this.dmcSilent=false;
          this.dmcShifter=this.dmcSample;
          this.dmcSampleEmpty=true;
        };
      };
    };
    if(this.dmcBytesLeft&&this.dmcSampleEmpty) {
      this.dmcSampleEmpty=false;
      this.dmcSample=this.nes.read(this.dmcAddress);
      this.dmcAddress++;
      if(this.dmcAddress===0x10000) this.dmcAddress=0x8000;
      this.dmcBytesLeft--;
      if (this.dmcBytesLeft) {
        if (this.dmcLoop) {
          this.dmcBytesLeft=this.dmcSampleLength;
          this.dmcAddress=this.dmcSampleAddress;
          return;
        };
        this.nes.dmcIrqWanted||=this.dmcInterrupt;
      };
    };
  };
  this.updateSweepP1=function() {
    let change=this.p1Timer>>this.p1SweepShift;
    if (this.p1SweepNegate) change*=-1;
    this.p1SweepMuting=(this.p1SweepTarget=this.p1Timer+change)>0x7ff||this.p1Timer<8;
  };
  this.updateSweepP2=function() {
    let change=this.p2Timer>>this.p2SweepShift;
    if (this.p2SweepNegate) change*=-1;
    this.p2SweepMuting=(this.p2SweepTarget=this.p2Timer+change)>0x7ff||this.p2Timer<8;
  };
  this.clockQuarter=function() {
    if(this.triReloadLinear) this.triLinearCounter=this.triLinearReload;
    else if(this.triLinearCounter) this.triLinearCounter--;
    if(!this.triCounterHalt) this.triReloadLinear = false;
    this.clockQuarterEnvelope("p1");
    this.clockQuarterEnvelope("p2");
    this.clockQuarterEnvelope("noise");
  };
  this.clockQuarterEnvelope=function(w) {
    if(!this[`${w}EnvelopeStart`]) {
      if(this[`${w}EnvelopeCounter`]) return this[`${w}EnvelopeCounter`]--;
      this[`${w}EnvelopeCounter`]=this[`${w}Volume`];
      if(this[`${w}Decay`]) return this[`${w}Decay`]--;
      if (this[`${w}CounterHalt`]) this[`${w}Decay`]=15;
      return;
    };
    this[`${w}EnvelopeStart`]=false;
    this[`${w}Decay`]=15;
    this[`${w}EnvelopeCounter`]=this[`${w}Volume`];
  };
  this.clockHalfSweep=function(w) {
    if(!this[`p${w}SweepTimer`]&&this[`p${w}SweepEnabled`]&&!this[`p${w}SweepMuting`]&&this[`p${w}SweepShift`]) {
      this[`p${w}Timer`]=this[`p${w}SweepTarget`];
      this[`updateSweepP${w}`]();
    };
    if(!this[`p${w}SweepTimer`]||this[`p${w}SweepReload`]) {
      this[`p${w}SweepTimer`]=this[`p${w}SweepPeriod`];
      this[`p${w}SweepReload`]=false;
    } else this[`p${w}SweepTimer`]--;
  };
  this.clockHalf=function() {
    // decrement length counters
    if(!this.p1CounterHalt&&this.p1Counter) this.p1Counter--;
    if(!this.p2CounterHalt&&this.p2Counter) this.p2Counter--;
    if(!this.triCounterHalt&&this.triCounter) this.triCounter--;
    if(!this.noiseCounterHalt&&this.noiseCounter) this.noiseCounter--;
    // handle sweeps
    this.clockHalfSweep(1);
    this.clockHalfSweep(2);
  };
  this.mix=function() {
    // from https://wiki.nesdev.com/w/index.php/APU_Mixer
    return (0.00851*this.triOutput+0.00494*this.noiseOutput+0.00335*this.dmcOutput)+0.00752*(this.p1Output+this.p2Output);
  };
  this.handleFrameCounter=function() {
    switch (this.frameCounter) {
      case 7457:
      case 22371:
        this.clockQuarter();
        return;
      case 29829:
        if (this.step5Mode) return;
      case 14913:
      case 37281:
        this.clockQuarter();
        this.clockHalf();
        if (this.frameCounter==29829&&!this.interruptInhibit) this.nes.frameIrqWanted=true;
        return;
    };
  };
  this.getOutput=function() {
    return [this.outputOffset=0, this.output];
  };
  this.peak=function(adr) {
    if(adr===0x4015) return 0|(!!this.p1Counter+0)|(!!this.p2Counter*2)|(!!this.triCounter*4)|(!!this.noiseCounter*8)|(!!this.dmcBytesLeft*16)|(this.nes.frameIrqWanted*64)|(this.nes.dmcIrqWanted*128);
    return 0;
  };
  this.read=function(adr) {
    if(adr===0x4015) {
      let ret=this.peak(adr);
      this.nes.frameIrqWanted=false;
      return ret;
    };
    return 0;
  };
  this.write=function(adr, value) {
    switch(adr) {
      case 0x4000:
        this.p1Duty=(value&0xc0)>>6;
        this.p1Volume=value&0xf;
        this.p1CounterHalt=!!(value&0x20);
        this.p1ConstantVolume=!!(value&0x10);
        break;
      case 0x4001:
        this.p1SweepEnabled=!!(value&0x80);
        this.p1SweepPeriod=(value&0x70)>>4;
        this.p1SweepNegate=!!(value&0x08);
        this.p1SweepShift=value&7;
        this.p1SweepReload=true;
        this.updateSweepP1();
        break;
      case 0x4002:
        this.p1Timer&=0x700;
        this.p1Timer|=value;
        this.updateSweepP1();
        break;
      case 0x4003:
        this.p1Timer&=255;
        this.p1Timer|=(value&7)<<8;
        this.p1DutyIndex=0;
        if(this.enablePulse1) this.p1Counter=this.lengthLoadValues[(value&0xf8)>>3];
        this.p1EnvelopeStart=true;
        this.updateSweepP1();
        break;
      case 0x4004:
        this.p2Duty=(value&0xc0)>>6;
        this.p2Volume=value&0xf;
        this.p2CounterHalt=!!(value&0x20);
        this.p2ConstantVolume=!!(value&0x10);
        break;
      case 0x4005:
        this.p2SweepEnabled=!!(value&0x80);
        this.p2SweepPeriod=(value&0x70)>>4;
        this.p2SweepNegate=!!(value&0x08);
        this.p2SweepShift=value&0x7;
        this.p2SweepReload=true;
        this.updateSweepP2();
        break;
      case 0x4006:
        this.p2Timer&=0x700;
        this.p2Timer|=value;
        this.updateSweepP2();
        break;
      case 0x4007:
        this.p2Timer&=0xff;
        this.p2Timer|=(value&0x7)<<8;
        this.p2DutyIndex=0;
        if(this.enablePulse2) this.p2Counter=this.lengthLoadValues[(value&0xf8)>>3];
        this.p2EnvelopeStart=true;
        this.updateSweepP2();
        break;
      case 0x4008:
        this.triCounterHalt=!!(value&0x80);
        this.triLinearReload=value&0x7f;
        // looks like this is a mistake in the nesdev wiki?
        // http://forums.nesdev.com/viewtopic.php?f=3&t=13767#p163155
        // doesn't do this, neither does Mesen,
        // and doing it breaks Super Mario Bros. 2's triangle between notes
        // this.triReloadLinear = true;
        break;
      case 0x400a:
        this.triTimer&=0x700;
        this.triTimer|=value;
        break;
      case 0x400b:
        this.triTimer&=0xff;
        this.triTimer|=(value&0x7)<<8;
        if(this.enableTriangle) this.triCounter=this.lengthLoadValues[(value&0xf8)>>3];
        this.triReloadLinear=true;
        break;
      case 0x400c:
        this.noiseCounterHalt=!!(value & 0x20);
        this.noiseConstantVolume=!!(value&0x10);
        this.noiseVolume=value&0xf;
        break;
      case 0x400e:
        this.noiseTonal=!!(value & 0x80);
        this.noiseTimer=this.noiseLoadValues[value&0xf]-1;
        break;
      case 0x400f:
        if(this.enableNoise) this.noiseCounter=this.lengthLoadValues[(value&0xf8)>>3];
        this.noiseEnvelopeStart=true;
        break;
      case 0x4010:
        this.dmcLoop=!!(value&0x40);
        this.dmcTimer=this.dmcLoadValues[value&0xf]-1;
        this.nes.dmcIrqWanted*=!(this.dmcInterrupt=!!(value&0x80));
        break;
      case 0x4011:
        this.dmcOutput=value&0x7f;
        break;
      case 0x4012:
        this.dmcSampleAddress=0xc000|(value<<6);
        break;
      case 0x4013:
        this.dmcSampleLength=(value<<4)+1;
        break;
      case 0x4015:
        this.enableNoise=!!(value&0x08);
        this.enableTriangle=!!(value&0x04);
        this.enablePulse2=!!(value&0x02);
        this.enablePulse1=!!(value&0x01);
        this.p1Counter*=this.enablePulse1;
        this.p2Counter*=this.enablePulse2;
        this.triCounter*=this.enableTriangle;
        this.noiseCounter*=this.enableNoise;
        if(value&0x10) {
          if(!this.dmcBytesLeft) {
            this.dmcBytesLeft=this.dmcSampleLength;
            this.dmcAddress=this.dmcSampleAddress;
          };
        } else this.dmcBytesLeft=0;
        this.nes.dmcIrqWanted=false;
        break;
      case 0x4017:
        this.step5Mode=!!(value&0x80);
        this.interruptInhibit=!!(value & 0x40);
        this.nes.frameIrqWanted*=!this.interruptInhibit;
        this.frameCounter=0;
        if(this.step5Mode) {
          this.clockQuarter();
          this.clockHalf();
        };
        break;
    };
  };
};