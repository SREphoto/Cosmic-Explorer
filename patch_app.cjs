const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add volume handlers
code = code.replace(
  'const handleToggleAudio = () => {',
  `const handleVolumeChange = (type: 'music' | 'sfx' | 'ambient', value: number) => {
    const updates: any = {};
    if (type === 'music') updates.musicVolume = value;
    if (type === 'sfx') updates.soundVolume = value;
    if (type === 'ambient') updates.ambientVolume = value;
    const updated = StorageManager.saveData(updates);
    setSavedData(updated);
    audioEngine.setVolumes(1.0, updated.musicVolume ?? 1.0, updated.soundVolume ?? 1.0, updated.ambientVolume ?? 1.0);
  };

  const handleToggleAudio = () => {`
);

// Call volume init inside useEffect for engine mount
code = code.replace(
  'audioEngine.setSoundEnabled(data.soundEnabled);',
  `audioEngine.setSoundEnabled(data.soundEnabled);
      audioEngine.setVolumes(1.0, data.musicVolume ?? 1.0, data.soundVolume ?? 1.0, data.ambientVolume ?? 1.0);`
);

// Space to restart
// We have an effect for 'r' key: `if (e.key.toLowerCase() === 'r') { ... }`
// We'll replace that.
code = code.replace(
  "if (e.key.toLowerCase() === 'r') {",
  `if (e.code === 'Space') {
        if (gameMode === 'GAMEOVER' || gameMode === 'PAUSED') {
          handleLaunch();
        }
      }
      if (e.key.toLowerCase() === 'r') {`
);

// Also pass handlers to DocsViewerModal
code = code.replace(
  'onToggleAudio={handleToggleAudio}',
  `onToggleAudio={handleToggleAudio}
            onVolumeChange={handleVolumeChange}`
);

fs.writeFileSync('src/App.tsx', code);
