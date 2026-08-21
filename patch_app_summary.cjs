const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { GameOverModal } from './ui/GameOverModal';",
  "import { GameOverModal } from './ui/GameOverModal';\nimport { PostRunSummaryModal } from './ui/PostRunSummaryModal';"
);

code = code.replace(
  "const [stats, setStats] = useState<PlayerStats>",
  "const [showPostRunSummary, setShowPostRunSummary] = useState(false);\n  const [stats, setStats] = useState<PlayerStats>"
);

code = code.replace(
  `    engine.onStateChange = (newMode) => {
      setGameMode(newMode);
      if (newMode === 'GAMEOVER') {
        setSavedData(StorageManager.loadData());
      }
    };`,
  `    engine.onStateChange = (newMode) => {
      setGameMode(newMode);
      if (newMode === 'GAMEOVER') {
        setSavedData(StorageManager.loadData());
        setShowPostRunSummary(true);
      }
    };`
);

code = code.replace(
  `        {/* 4. Game Over Screen Overlay */}
        {gameMode === 'GAMEOVER' && (
          <GameOverModal`,
  `        {/* Post Run Summary Screen Overlay */}
        {gameMode === 'GAMEOVER' && showPostRunSummary && (
          <PostRunSummaryModal 
             stats={stats} 
             onContinue={() => setShowPostRunSummary(false)} 
          />
        )}
        
        {/* 4. Game Over Screen Overlay */}
        {gameMode === 'GAMEOVER' && !showPostRunSummary && (
          <GameOverModal`
);

fs.writeFileSync('src/App.tsx', code);
