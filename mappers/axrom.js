mappers[7]=class {
  constructor(nes, rom, header) {
    this.name="AxROM";
    this.version=1;
    this.nes=nes;
    this.rom=rom;
    this.h=header;
    this.reset=function(hard) {
      if (hard) {
        this.chrRam=new Uint8Array(0x2000);
        this.ppuRam=new Uint8Array(0x800);
      };
      this.prgBank=
        this.mirroring=0;
    };
    this.reset(true);
    this.saveVars=Object.keys(this);
    this.getBattery=()=>[];
    this.setBattery=()=>true;
    this.getChrAdr=(a)=>a;
  };
  getRomAdr(adr) {
    return (this.prgBank*0x8000+(adr&0x7fff))&this.h.prgAnd;
  };
  getMirroringAdr(adr) {
    if(!this.mirroring) return adr & 0x3ff;
    return 0x400+(adr&0x3ff);
  };
  peak(adr) {
    return this.read(adr);
  };
  read(adr) {
    if (adr<0x8000) return 0; // not readable
    return this.rom[this.h.base+this.getRomAdr(adr)];
  };
  write(adr, value) {
    if (adr<0x8000) return; // no mapper registers or rpg-ram
    this.prgBank=value&15;
    this.mirroring=(value&16)>>4;
  };
  ppuPeak(adr) {
    return this.ppuRead(adr);
  };
  // ppu-read
  ppuRead(adr) {
    if(adr<0x2000) {
      if(!this.h.chrBanks) return this.chrRam[this.getChrAdr(adr)];
      return this.rom[this.h.chrBase+this.getChrAdr(adr)];
    };
    return this.ppuRam[this.getMirroringAdr(adr)];
  };
  // ppu-write
  ppuWrite(adr, value) {
    if (adr<0x2000) {
      if(!this.h.chrBanks) this.chrRam[this.getChrAdr(adr)]=value;
      return;
    };
    return this.ppuRam[this.getMirroringAdr(adr)]=value;
  };
};