mappers[1]=class {
  constructor(nes, rom, header) {
    this.name="MMC1";
    this.version=1;
    this.nes=nes;
    this.rom=rom;
    this.h=header;
    this.reset=function(hard) {
      if(hard) {
        this.chrRam=new Uint8Array(0x2000);
        this.prgRam=new Uint8Array(0x2000);
        this.ppuRam=new Uint8Array(0x800);
      }
      this.shiftReg=
        this.shiftCount=
        this.mirroring=
        this.chrBank0=
        this.chrBank1=
        this.prgBank=
        this.ramEnable=0;
      this.prgMode=3;
      this.chrMode=1;
    };
    this.reset(true);
    this.saveVars=Object.keys(this);
  };
  getBattery() {
    return Array.prototype.slice.call(this.prgRam);
  };
  setBattery(data) {
    if(data.length!==0x2000) return false;
    this.prgRam=new Uint8Array(data);
    return true;
  };
  getRomAdr(a) {
    return ((b, m, p, v, o)=>{
      o=b*v+p;
      if (a<0xc000) return m<3?p:o;
      if (m==2) return o;
      else if (m>1) return (this.h.banks-1)*v+p;
      else return v*2*(b>>1)+(a&32767);
    })(this.prgBank, this.prgMode, a&16383, 16384)&this.h.prgAnd;
  };
  getMirroringAdr(adr) {
    return [adr&0x3ff, 0x400+(adr&0x3ff), adr&0x7ff, (adr&0x3ff)|((adr*0x800)>>1)][this.mirroring];
  };
  getChrAdr(adr) {
    if (this.chrMode===1) return (this[`chrBank${(adr<0x1000)+0}`]*0x1000+(adr&0xfff))&this.h.chrAnd;
    else return ((this.chrBank0 >> 1)*0x2000+(adr&0x1fff))&this.h.chrAnd;
  };
  read(adr) {
    if (adr<0x8000) return (!(adr<0x6000)+0)*(this.prgRam[adr&0x1fff]*!this.ramEnable);
    return this.rom[this.h.base+this.getRomAdr(adr)];
  };
  peak(a) {
    return this.read(a);
  };
  write(adr, value) {
    if (this.ramEnable!==1&&adr>=0x6000) this.prgRam[adr&0x1fff]=value;
    return;
    if(value&0x80) {
      this.shiftCount=
        this.shiftReg=0;
    } else {
      this.shiftReg|=(value&0x1)<<this.shiftCount;
      this.shiftCount++;
      if (this.shiftCount===5) {
        let g=(adr&0x6000)>>13
        switch(g) {
          case 0:
            this.mirroring=this.shiftReg&0x3;
            this.prgMode=(this.shiftReg&0xc)>>2;
            this.chrMode=(this.shiftReg&0x10)>>4;
            break;
          case 1:
          case 2:
            this[`chrBank${g-1}`]=this.shiftReg;
            break;
          case 3:
            this.prgBank=this.shiftReg&15;
            this.ramEnable=(this.shiftReg&16)>>4;
            break;
        };
        this.shiftCount=
          this.shiftReg=0;
      };
    };
  };
  // ppu-read
  ppuRead(adr) {
    if(adr<0x2000) {
      if(!this.h.chrBanks) return this.chrRam[this.getChrAdr(adr)];
      return this.rom[this.h.chrBase+this.getChrAdr(adr)];
    } else return this.ppuRam[this.getMirroringAdr(adr)];
  };
  ppuPeak(a) {
    return this.ppuRead(a);
  };
  // ppu-write
  ppuWrite(adr, value) {
    if (adr<0x2000) if (!this.h.chrBanks) this.chrRam[this.getChrAdr(adr)]=value;
    else return this.ppuRam[this.getMirroringAdr(adr)]=value;
  };
};