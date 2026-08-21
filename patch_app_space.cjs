const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const handleKeyDown = (e: KeyboardEvent) => {",
  `const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const currentMode = engineRef.current?.state;
        if (currentMode === 'GAMEOVER' || currentMode === 'PAUSED') {
          handleStartGame();
          return;
        }
      }`
);

fs.writeFileSync('src/App.tsx', code);
