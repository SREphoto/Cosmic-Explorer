const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const handleToggleAudio = () => {',
  `const handleToggleRandomAesthetics = (e: any) => {
    const updated = StorageManager.saveData({ randomizeAesthetics: e.detail });
    setSavedData(updated);
    if (engineRef.current) {
      engineRef.current.savedData = updated;
    }
  };

  useEffect(() => {
    window.addEventListener('TOGGLE_RANDOM_AESTHETICS', handleToggleRandomAesthetics as any);
    return () => window.removeEventListener('TOGGLE_RANDOM_AESTHETICS', handleToggleRandomAesthetics as any);
  }, []);

  const handleToggleAudio = () => {`
);

fs.writeFileSync('src/App.tsx', code);
