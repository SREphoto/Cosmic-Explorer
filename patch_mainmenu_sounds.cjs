const fs = require('fs');
let code = fs.readFileSync('src/ui/MainMenu.tsx', 'utf8');

code = code.replace(
  'onClick={onOpenWardrobe}',
  'onClick={() => { audioEngine.playMenuClick(); onOpenWardrobe(); }}'
);
code = code.replace(
  'onClick={onOpenUpgrades}',
  'onClick={() => { audioEngine.playMenuClick(); onOpenUpgrades(); }}'
);
code = code.replace(
  'onClick={onOpenAchievements}',
  'onClick={() => { audioEngine.playMenuClick(); onOpenAchievements(); }}'
);
code = code.replace(
  'onClick={onOpenQuests}',
  'onClick={() => { audioEngine.playMenuClick(); onOpenQuests(); }}'
);

fs.writeFileSync('src/ui/MainMenu.tsx', code);
