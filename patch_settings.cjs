const fs = require('fs');
let code = fs.readFileSync('src/ui/DocsViewerModal.tsx', 'utf8');

const soundTestButtons = `
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('TEST_MUSIC_SAMPLE'));
                      }}
                      className="flex-1 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold rounded-lg border border-sky-500/30 transition text-xs"
                    >
                      Test Music
                    </button>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('TEST_SFX_SAMPLE'));
                      }}
                      className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-lg border border-amber-500/30 transition text-xs"
                    >
                      Test SFX
                    </button>
                  </div>`;

code = code.replace(
  `                      className="w-full accent-purple-500 bg-slate-800 rounded-full h-1.5 appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}`,
  `                      className="w-full accent-purple-500 bg-slate-800 rounded-full h-1.5 appearance-none cursor-pointer"
                    />
                  </div>
                  ${soundTestButtons}
                </div>
              )}`
);

fs.writeFileSync('src/ui/DocsViewerModal.tsx', code);
