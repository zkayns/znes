mappers[3]=class {
  constructor(nes, rom, header) {
    this.name="CNROM";
    this.version=1;
    this.nes=nes;
    this.rom=rom;
    this.h=header;
    this.reset=function(hard) {
      if (hard) {
        this.chrRam=new Uint8Array(0x2000);
        this.ppuRam=new Uint8Array(0x800);
      };
      this.chrBank=0;
    };
    this.reset(true);
    this.saveVars=[
      "name", "chrRam", "ppuRam", "chrBank"
    ];
    this.getBattery=()=>[];
    this.setBattery=()=>true;
  };
  getRomAdr(adr) {
    if(this.banks===2) return adr&0x7fff;
    return adr&0x3fff;
  };
  getMirroringAdr(adr) {
    if (this.h.verticalMirroring) return adr&0x7ff;
    return (adr&0x3ff)|((adr&0x800)>>1);
  };
  getChrAdr(adr) {
    return (this.chrBank*0x2000+(adr&0x1fff))&this.h.chrAnd;
  };
  peak(adr) {
    return this.read(adr);
  };
  read(adr) {
    if(adr<0x8000) return 0; // not readable
    return this.rom[this.h.base+this.getRomAdr(adr)];
  };
  write(adr, value) {
    if(adr<0x8000) return; // no mapper registers or prg ram
    this.chrBank=value;
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
    if(adr<0x2000) {
      if(!this.h.chrBanks) this.chrRam[this.getChrAdr(adr)]=value;
      return;
    };
    return this.ppuRam[this.getMirroringAdr(adr)]=value;
  };
}
