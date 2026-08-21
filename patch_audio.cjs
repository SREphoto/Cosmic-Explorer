const fs = require('fs');
let code = fs.readFileSync('src/core/AudioEngine.ts', 'utf8');

// Add variables
code = code.replace('private soundEnabled: boolean = true;', 
`private soundEnabled: boolean = true;
  private masterOut: GainNode | null = null;
  public musicOut: GainNode | null = null;
  public sfxOut: GainNode | null = null;
  public ambientOut: GainNode | null = null;

  public setVolumes(master: number, music: number, sfx: number, ambient: number) {
    if (this.masterOut) this.masterOut.gain.setValueAtTime(master, this.ctx!.currentTime);
    if (this.musicOut) this.musicOut.gain.setValueAtTime(music, this.ctx!.currentTime);
    if (this.sfxOut) this.sfxOut.gain.setValueAtTime(sfx, this.ctx!.currentTime);
    if (this.ambientOut) this.ambientOut.gain.setValueAtTime(ambient, this.ctx!.currentTime);
  }`);

code = code.replace('this.ctx = new AudioCtx();', 
`this.ctx = new AudioCtx();
        this.masterOut = this.ctx.createGain();
        this.musicOut = this.ctx.createGain();
        this.sfxOut = this.ctx.createGain();
        this.ambientOut = this.ctx.createGain();
        this.musicOut.connect(this.masterOut);
        this.sfxOut.connect(this.masterOut);
        this.ambientOut.connect(this.masterOut);
        this.masterOut.connect(this.ctx.destination);`);

// For music routing
code = code.replace('this.musicGainNode.connect(this.sfxOut || this.ctx.destination);', 
                    'this.musicGainNode.connect(this.musicOut || this.ctx.destination);');

// For void alarm routing (ambient)
code = code.replace('this.voidAlarmGain.connect(this.sfxOut || this.ctx.destination);', 
                    'this.voidAlarmGain.connect(this.ambientOut || this.ctx.destination);');

fs.writeFileSync('src/core/AudioEngine.ts', code);
