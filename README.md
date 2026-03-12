# znes

AccuracyCoin comparison with the original as of Mar 12, 2026:
<img width="256" height="240" alt="image (2)" src="https://github.com/user-attachments/assets/01fe8011-eeb6-424f-9f80-8f281dbbe68a" />
<img width="256" height="240" alt="image (3)" src="https://github.com/user-attachments/assets/e12f365b-35d8-410d-9687-fc0e70b99e6f" />

## Description

A continuation of angelo-wf's NesJS project, written for the browser in JavaScript.

The CPU has almost all instructions emulated, but it is not cycle-accurate (and doesn't emulate the 'unstable' undocumented instructions).
The PPU has full background and sprite rendering, but it is also not cycle-accurate. The APU emulates all 5 channels, but it is again not fully accurate.
There are also some other inaccuracies (with OAM-DMA and such).
Most games however seem to run fine (except the known broken games listed below).

Standard controllers 1 and 2 are emulated.

Supports mapper 0 (NROM), 1 (MMC1), 2 (UxROM), 3 (CNROM), 4 (MMC3) and 7 (AxROM). The MMC3's IRQ emulation is not really accurate though.

There is support for both save states and battery saves.

## Known broken games

These are games that are known to crash/freeze. Games with only (minor) graphical problems are not listed.
Almost all of those cases (and most of these cases as well) come down to the emulator not being cycle accurate.

- Battletoads
  - Freezes when starting stage 2
- Battletoads and Double Dragon
  - Freezes semi-randomly during stage 1
- Adventure of Lolo 3 (USA)
  - Freezes when entering level 1
- Adventure of Lolo 2 (USA) / Adventure of Lolo (J)
  - Freezes after HAI / copyright-screen
- MS. Pac-Man (Tengen)
  - Freezes on boot (grey screen)
- Bill & Ted's Excellent Adventure
  - Freezes on boot (grey screen)
- Huge Insect
  - Freezes on boot (grey screen)
- Vegas Dream
  - Freezes on boot (screen filled with single repeating tile)
- GI Joe - A Real American Hero
  - Freezes on boot (grey screen)
- GI Joe - The Atlantic Factor
  - Freezes on boot (black screen)

## Credits

Thanks to the resources at [the nesdev wiki](http://wiki.nesdev.com/w/index.php/Nesdev_Wiki) and [the nesdev forums](https://forums.nesdev.com) for the test roms, documentation and some code snippets used for this.

Uses the [zip.js](https://gildas-lormeau.github.io/zip.js/) library for zipped rom loading support.

Licensed under the MIT License. See `LICENSE.txt` for details.
