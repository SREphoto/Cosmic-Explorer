const fs = require('fs');
let code = fs.readFileSync('src/ui/DocsViewerModal.tsx', 'utf8');

if (!code.includes('import { audioEngine }')) {
  code = code.replace(
    "import { UserSavedData } from '../types/game';",
    "import { UserSavedData } from '../types/game';\nimport { audioEngine } from '../core/AudioEngine';"
  );
}

code = code.replace(
  "window.dispatchEvent(new CustomEvent('TEST_MUSIC_SAMPLE'));",
  "audioEngine.playLevelUpFanfare();"
);

code = code.replace(
  "window.dispatchEvent(new CustomEvent('TEST_SFX_SAMPLE'));",
  "audioEngine.playJump();"
);

fs.writeFileSync('src/ui/DocsViewerModal.tsx', code);
