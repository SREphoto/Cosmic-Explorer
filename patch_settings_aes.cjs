const fs = require('fs');
let code = fs.readFileSync('src/ui/DocsViewerModal.tsx', 'utf8');

const aesToggle = `
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">Randomize Aesthetics</h4>
                <p className="text-xs text-slate-400 mt-1">Cycle through random color palettes and star-fields at the start of every run.</p>
              </div>
              <button 
                onClick={() => {
                  const updated = { ...savedData, randomizeAesthetics: !savedData.randomizeAesthetics };
                  // We need to dispatch a custom event or have an onSaveData prop, but we only have onClearData and onToggleAudio.
                  // Let's use window.dispatchEvent to notify App to update it.
                  window.dispatchEvent(new CustomEvent('TOGGLE_RANDOM_AESTHETICS', { detail: !savedData.randomizeAesthetics }));
                }}
                className={\`w-12 h-6 rounded-full transition-colors flex items-center px-1 \${savedData.randomizeAesthetics ? 'bg-sky-500' : 'bg-slate-700'}\`}
              >
                <div className={\`w-4 h-4 bg-white rounded-full transition-transform \${savedData.randomizeAesthetics ? 'translate-x-6' : 'translate-x-0'}\`} />
              </button>
            </div>
`;

code = code.replace(
  '<h3 className="text-lg font-bold text-white mb-2">Game Settings</h3>',
  '<h3 className="text-lg font-bold text-white mb-2">Game Settings</h3>\n' + aesToggle
);

fs.writeFileSync('src/ui/DocsViewerModal.tsx', code);
