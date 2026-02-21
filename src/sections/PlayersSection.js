import React, { memo } from 'react';
import { Users, Trophy, DollarSign, CircleDollarSign, BarChart3 } from 'lucide-react';

// SpadeIcon inline (tiny, no need for separate file)
const SpadeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C12 2 4 10 4 14c0 2.5 2 4 4 4 1.5 0 2.5-.5 3-1.5-.5 2-2 3.5-4 4.5h10c-2-1-3.5-2.5-4-4.5.5 1 1.5 1.5 3 1.5 2 0 4-1.5 4-4C20 10 12 2 12 2z"/>
  </svg>
);

const PlayersSection = memo(({
  playerNames, updatePlayerName,
  playerHandicaps, updatePlayerHandicap,
  jumboMode, toggleJumboMode,
  gameMode, setGameMode,
  showModeDesc, setShowModeDesc,
  stake, setStake, stakeInputRef,
  advanceMode, setAdvanceMode,
  advancePlayers, setAdvancePlayers,
  activePlayers,
  showHcpTooltip, setShowHcpTooltip,
  showAdvanceTooltip, setShowAdvanceTooltip,
  showMpTooltip, setShowMpTooltip,
  mp,
  startGame,
  setCurrentSection,
  t
}) => {
  return (
    <div className="space-y-4 py-3">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('playerTitle')}
                </h2>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('players')}
                  </h3>
                  <button
                    onClick={toggleJumboMode}
                    className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
                      jumboMode
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('mpJumbo')}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: jumboMode ? 8 : 4 }, (_, i) => i).map(i => (
                    <div key={i}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t(`player${i + 1}`)}:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t('enterName')}
                          value={playerNames[i]}
                          onChange={(e) => updatePlayerName(i, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                        <div className="flex items-center gap-1 relative">
                          {i === 0 ? (
                            <span className="text-xs text-gray-500 border-b border-dashed border-gray-400 cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setShowHcpTooltip(!showHcpTooltip); setShowAdvanceTooltip(false); setShowMpTooltip(false); }}
                            >HCP</span>
                          ) : (
                            <span className="text-xs text-gray-500">HCP</span>
                          )}
                          {i === 0 && showHcpTooltip && (
                            <div className="absolute right-0 top-0 mt-[-8px] translate-y-[-100%] z-50 w-56 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
                              <div>{t('hcpBubble')}</div>
                              <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                            </div>
                          )}
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            placeholder=""
                            value={(playerHandicaps[playerNames[i]] || 0) > 0 ? playerHandicaps[playerNames[i]] : ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              const num = val === '' ? 0 : Math.min(36, parseInt(val, 10));
                              if (playerNames[i]) {
                                updatePlayerHandicap(playerNames[i], num);
                              }
                            }}
                            className="w-12 px-2 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 text-sm text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      {t('gameMode')}:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setGameMode('matchPlay'); setShowModeDesc(showModeDesc && gameMode === 'matchPlay' ? false : true); }}
                        className={`px-3 rounded-lg font-medium text-sm transition flex flex-col items-center text-center gap-1 ${
                          gameMode === 'matchPlay'
                            ? `bg-blue-600 text-white ${showModeDesc ? 'py-3' : 'py-2'}`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 py-2'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span style={{ fontSize: '12px' }}>{t('matchPlay')}</span>
                        </div>
                        {gameMode === 'matchPlay' && showModeDesc && (
                          <div className="text-xs font-normal opacity-90 mt-1 leading-snug" style={{ fontSize: '10px' }}>
                            {t('matchPlayBubble')}
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => { setGameMode('win123'); setShowModeDesc(showModeDesc && gameMode === 'win123' ? false : true); }}
                        className={`px-3 rounded-lg font-medium text-sm transition flex flex-col items-center text-center gap-1 ${
                          gameMode === 'win123'
                            ? `bg-green-600 text-white ${showModeDesc ? 'py-3' : 'py-2'}`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 py-2'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span style={{ fontSize: '12px' }}>{t('win123')}</span>
                        </div>
                        {gameMode === 'win123' && showModeDesc && (
                          <div className="text-xs font-normal opacity-90 mt-1 leading-snug" style={{ fontSize: '10px' }}>
                            {t('win123Bubble')}
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => { setGameMode('skins'); setShowModeDesc(showModeDesc && gameMode === 'skins' ? false : true); }}
                        className={`px-3 rounded-lg font-medium text-sm transition flex flex-col items-center text-center gap-1 ${
                          gameMode === 'skins'
                            ? `bg-purple-600 text-white ${showModeDesc ? 'py-3' : 'py-2'}`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 py-2'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <CircleDollarSign className="w-4 h-4" />
                          <span style={{ fontSize: '12px' }}>{t('skins')}</span>
                        </div>
                        {gameMode === 'skins' && showModeDesc && (
                          <div className="text-xs font-normal opacity-90 mt-1 leading-snug" style={{ fontSize: '10px' }}>
                            {t('skinsBubble')}
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => { setGameMode('baccarat'); setShowModeDesc(showModeDesc && gameMode === 'baccarat' ? false : true); }}
                        className={`px-3 rounded-lg font-medium text-sm transition flex flex-col items-center text-center gap-1 ${
                          gameMode === 'baccarat'
                            ? `bg-amber-600 text-white ${showModeDesc ? 'py-3' : 'py-2'}`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 py-2'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <SpadeIcon className="w-4 h-4" />
                          <span style={{ fontSize: '12px' }}>{t('baccarat')}</span>
                        </div>
                        {gameMode === 'baccarat' && showModeDesc && (
                          <div className="text-xs font-normal opacity-90 mt-1 leading-snug" style={{ fontSize: '10px' }}>
                            {t('baccaratBubble')}
                          </div>
                        )}
                      </button>
                    </div>
					</div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      {t('stake')}:
                    </label>
                    <input
                      ref={stakeInputRef}
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder={t('enterStake')}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1 relative">
                      {t('advance')}:
                      <button
                        type="button"
                        onClick={() => { setShowAdvanceTooltip(!showAdvanceTooltip); setShowMpTooltip(false); }}
                        className="w-4 h-4 rounded-full bg-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-400 transition"
                      >
                        ?
                      </button>
                      {showAdvanceTooltip && (
                        <div className="absolute left-0 top-0 mt-[-8px] translate-y-[-100%] z-50 w-56 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
                          <div>{t('advanceBubble')}</div>
                          <div className="absolute bottom-[-4px] left-12 w-2 h-2 bg-gray-800 rotate-45"></div>
                        </div>
                      )}
                    </label>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => setAdvanceMode('off')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          advanceMode === 'off'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('off')}
                      </button>
                      <button
                        onClick={() => setAdvanceMode('on')}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          advanceMode === 'on'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('on')}
</button>
                    </div>
                  </div>
				  
				  {/* 多人同步开关 */}
                  <div className="flex items-center justify-between mt-3">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1 relative">
                      {t('mpSync')}:
                      <button
                        type="button"
                        onClick={() => { setShowMpTooltip(!showMpTooltip); setShowAdvanceTooltip(false); }}
                        className="w-4 h-4 rounded-full bg-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-400 transition"
                      >
                        ?
                      </button>
                      {showMpTooltip && (
                        <div className="absolute left-0 top-0 mt-[-8px] translate-y-[-100%] z-50 w-56 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
                          <div>{t('mpSyncBubble')}</div>
                          <div className="absolute bottom-[-4px] left-12 w-2 h-2 bg-gray-800 rotate-45"></div>
                        </div>
                      )}
                    </label>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => mp.setMultiplayerOn(false)}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          !mp.multiplayerOn
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('off')}
                      </button>
                      <button
                        onClick={() => mp.setMultiplayerOn(true)}
                        className={`px-3 py-1 font-medium text-sm transition ${
                          mp.multiplayerOn
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t('on')}
                      </button>
                    </div>
                  </div>

				  {/* Advance 玩家选择 */}
                  {advanceMode === 'on' && activePlayers.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {t('mpSelectAdvanced')}
                      </div>
                      <div className="space-y-2">
                        {activePlayers.map(player => (
                          <label key={player} className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition">
                            <input
                              type="checkbox"
                              checked={advancePlayers[player] || false}
                              onChange={(e) => {
                                setAdvancePlayers(prev => ({
                                  ...prev,
                                  [player]: e.target.checked
                                }));
                              }}
                              className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="font-medium text-gray-900">{player}</span>
                            {advancePlayers[player] && (
                              <span className="ml-auto text-xs text-green-600 font-medium">
                                {t('advancedTag')}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('advancedSelectDesc')}
                      </p>
                    </div>
                  )}
                </div>
              </div>


              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentSection('course')}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
                
                <button
                  onClick={startGame}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {mp.multiplayerOn ? t('mpCreateRoom') : t('start')}
                </button>
              </div>
              
              {/* 加入房间按钮已移至首页 */}
            </div>
  );
});

export default PlayersSection;