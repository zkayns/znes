mappers[4]=class {
  constructor(nes, rom, header) {
    this.name="MMC3";
    this.version=1;
    this.nes=nes;
    this.rom=rom;
    this.h=header;
    this.reset=function(hard) {
      if (hard) {
        this.chrRam=new Uint8Array(0x2000);
        this.prgRam=new Uint8Array(0x2000);
        this.ppuRam=new Uint8Array(0x800);
        this.bankRegs=new Uint8Array(8);
      };
      this.mirroring=0;
      this.prgMode=1;
      this.chrMode=1;
      this.regSelect=0;
      this.reloadIrq=false;
      this.irqLatch=0;
      this.irqEnabled=false;
      this.irqCounter=0;
      this.lastRead=0;
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
  getRomAdr(adr) {
    return ((a=adr&0x1fff)=>{
      if(this.prgMode===1) {
        if(adr<0xa000) return (this.h.banks*2-2)*0x2000+a;
        if(adr<0xc000) return this.bankRegs[7]*0x2000+a;
        if(adr<0xe000) return this.bankRegs[6]*0x2000+a;
        return (this.h.banks*2-1)*0x2000+a;
      };
      if(adr<0xa000) return this.bankRegs[6]*0x2000+a;
      if(adr<0xc000) return this.bankRegs[7]*0x2000+a;
      if (adr<0xe000) return (this.h.banks*2-2)*0x2000+a;
      return (this.h.banks*2-1)*0x2000+a;
    })()&this.h.prgAnd;
  };
  getMirroringAdr(adr) {
    return this.mirroring?((adr&0x3ff)|((adr&0x800)>>1)):(adr&0x7ff);
  };
  getChrAdr(a) {
    if(this.chrMode===1) a^=0x1000;
    let q=(a<0x800?0:((a<0x1000)?1:((a<0x1400)?2:((a<0x1800)?3:((a<0x1c00)?4:5)))));
    let r=this.bankRegs[q];
    return (q<2?((r>>1)*2048+(a&2047)):(r*1024+(a&1023)))&this.h.chrAnd;
  };
  clockIrq() {
    if (!this.irqCounter||this.reloadIrq) {
      this.irqCounter=this.irqLatch;
      this.reloadIrq=false;
    } else {
      this.irqCounter--;
      this.irqCounter&=255;
    };
    if (!this.irqCounter&&this.irqEnabled) this.nes.mapperIrqWanted=true;
  };
  read(adr) {
    if(adr<0x6000) return 0; // not readable
    if(adr<0x8000) return this.prgRam[adr&0x1fff];
    return this.rom[this.h.base+this.getRomAdr(adr)];
  };
  peak(a) {
    return this.read(a);
  };
  write(adr, value) {
    if(adr<0x6000) return; // no mapper registers
    if(adr<0x8000) {
      this.prgRam[adr&0x1fff]=value;
      return;
    };
    switch(adr&0x6001) {
      case 0x0000:
        this.regSelect=value&0x7;
        this.prgMode=(value&0x40)>>6;
        this.chrMode=(value&0x80)>>7;
        break;
      case 0x0001:
        this.bankRegs[this.regSelect]=value;
        break;
      case 0x2000:
        this.mirroring=value&0x1;
        break;
      case 0x2001: break; // ram protection not implemented
      case 0x4000:
        this.irqLatch=value;
        break;
      case 0x4001:
        this.reloadIrq=true;
        break;
      case 0x6000:
        this.irqEnabled=false;
        this.nes.mapperIrqWanted=false;
        break;
      case 0x6001:
        this.irqEnabled=true;
        break;
    };
  };

  ppuPeak(adr) {
    if (adr<0x2000) {
      if (!this.h.chrBanks) return this.chrRam[this.getChrAdr(adr)];
      return this.rom[this.h.chrBase+this.getChrAdr(adr)];
    };
    return this.ppuRam[this.getMirroringAdr(adr)];
  };

  // ppu-read
  ppuRead(adr) {
    if(adr<8192) {
      if (!(this.lastRead&4096)&&(adr&4096)>0) this.clockIrq();
      this.lastRead=adr;
      if (!this.h.chrBanks) return this.chrRam[this.getChrAdr(adr)];
      return this.rom[this.h.chrBase+this.getChrAdr(adr)];
    };
    return this.ppuRam[this.getMirroringAdr(adr)];
  };

  // ppu-write
  ppuWrite(adr, value) {
    if (adr<8192) {
      if (!this.h.chrBanks) this.chrRam[this.getChrAdr(adr)]=value;
      return;
    };
    return this.ppuRam[this.getMirroringAdr(adr)]=value;
  };
};