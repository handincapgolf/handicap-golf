import React, { memo } from 'react';
import { Eye } from 'lucide-react';

// ========== mp-lobby: Creator 大厅 / Joiner 等待 ==========
const MpLobbySection = memo(({
  activePlayers, playerHandicaps,
  mp, showToast,
  setCurrentSection,
  t
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-6">
              <div className="max-w-md mx-auto px-4 space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {mp.multiplayerRole === 'creator' ? t('mpWaitingPartner') : t('mpWaitingStart')}
                  </h2>
                </div>
                
                {/* Creator: Game Code + QR Code */}
                {mp.multiplayerRole === 'creator' && (
                <div className="bg-white rounded-xl p-6 shadow-md text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    {t('mpRoomCode')}
                  </p>
                  <div className="text-4xl font-mono font-bold tracking-[0.3em] text-amber-600 bg-amber-50 rounded-lg py-3">
                    {mp.gameCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(mp.gameCode);
                      showToast(t('mpCopied'), 'success');
                    }}
                    className="mt-3 text-sm text-blue-500 underline"
                  >
                    {t('mpCopyCode')}
                  </button>
                  
                  {/* QR Code */}
                  <div className="mt-3">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('https://handincap.golf?join=' + mp.gameCode)}`}
                      alt="QR Code"
                      className="mx-auto w-40 h-40 rounded-lg"
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('mpScanToJoin')}</p>
                  </div>
                </div>
                )}

                {/* Joiner/Viewer: Game Info */}
                {(mp.multiplayerRole === 'joiner' || mp.multiplayerRole === 'viewer') && mp.remoteGame && (
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('mpGameInfo')}
                  </h3>
                  {mp.remoteGame.course?.fullName && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-500">{t('mpCourse')}</span>
                      <span className="font-medium text-sm">{mp.remoteGame.course.fullName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-500">{t('mpMode')}</span>
                    <span className="font-medium text-sm">
                      {mp.remoteGame.gameMode === 'matchPlay' ? '🏆 Match Play' :
                       mp.remoteGame.gameMode === 'win123' ? '💵 Win123' :
                       mp.remoteGame.gameMode === 'skins' ? '💰 Skins' :
                       '♠ Baccarat'}
                    </span>
                  </div>
                  {mp.remoteGame.stake > 0 && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-500">{t('mpStake')}</span>
                      <span className="font-medium text-sm text-green-600">RM {mp.remoteGame.stake}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-500">{t('mpRoom')}</span>
                    <span className="font-mono text-sm text-amber-600">{mp.gameCode}</span>
                  </div>
                  {mp.remoteGame.holesList && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500">{t('mpHolesLabel')}</span>
                      <span className="font-medium text-sm">
                        {mp.remoteGame.holesList.length === 18 ? '18 Holes' :
                         mp.remoteGame.holesList[0] === 1 && mp.remoteGame.holesList.length === 9 ? 'Front 9' :
                         mp.remoteGame.holesList[0] === 10 && mp.remoteGame.holesList.length === 9 ? 'Back 9' :
                         `${mp.remoteGame.holesList.length} Holes (${mp.remoteGame.holesList[0]}-${mp.remoteGame.holesList[mp.remoteGame.holesList.length - 1]})`}
                      </span>
                    </div>
                  )}
                </div>
                )}

                {/* Player Claim Status */}
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('mpPlayerAssignment')}
                  </h3>
                  {activePlayers.map(player => (
                    <div key={player} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player}</span>
                        {playerHandicaps[player] > 0 && (
                          <span className="text-xs text-gray-400">HCP {playerHandicaps[player]}</span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        mp.claimed[player]
                          ? mp.getDeviceBgClass(mp.claimed[player])
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {mp.claimed[player]
                          ? (mp.claimed[player] === mp.deviceId
                              ? (mp.getDeviceLabel(mp.claimed[player]) + ' ' + t('mpMine'))
                              : (mp.getDeviceLabel(mp.claimed[player])))
                          : (t('mpUnclaimed'))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sync status indicator */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    mp.syncStatus === 'connected' ? 'bg-green-100 text-green-700' :
                    mp.syncStatus === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      mp.syncStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                      mp.syncStatus === 'error' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}></span>
                    {mp.syncStatus === 'connected' ? t('mpConnected') :
                     mp.syncStatus === 'error' ? t('mpError') :
                     t('mpConnecting')}
                  </div>
                </div>

                {/* Creator: Start Game button (only show when joiner has claimed players) */}
                {mp.multiplayerRole === 'creator' && mp.otherDeviceCount > 0 && (
                  <button
                    onClick={async () => {
                      const result = await mp.startMultiplayerGame();
                      if (result.ok) {
                        setCurrentSection('game');
                        mp.setMultiplayerSection(null);
                      }
                    }}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 text-lg"
                  >
                    {t('mpStartGame')}
                  </button>
                )}

                {/* Joiner/Viewer: Waiting message */}
                {(mp.multiplayerRole === 'joiner' || mp.multiplayerRole === 'viewer') && (
                  <div className="text-center">
                    {mp.multiplayerRole === 'viewer' && (
                      <div className="mb-2 inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        <Eye className="w-4 h-4" /> {t('mpViewerRole') || 'Viewer'}
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      ⏳ {t('mpWaitingCreator')}
                    </p>
                  </div>
                )}

                {/* Back button */}
                <button
                  onClick={() => {
                    const wasJoiner = mp.multiplayerRole === 'joiner' || mp.multiplayerRole === 'viewer';
                    mp.resetMultiplayer();
                    mp.setMultiplayerSection(null);
                    setCurrentSection(wasJoiner ? 'home' : 'players');
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
              </div>
            </div>
  );
});

// ========== mp-role: 角色选择 (Player / Viewer) ==========
const MpRoleSection = memo(({
  mp,
  setGameMode, setStake, setJumboMode, setPlayerHandicaps,
  setAdvanceMode, setAdvancePlayers, setPlayerNames,
  setSelectedCourse, setPars, setHoles,
  setTotalMoney, setMoneyDetails, setAllScores, setAllUps, setAllPutts,
  setAllWater, setAllOb, setTotalSpent,
  setCurrentHole, setScores, setUps, setPutts, setWater, setOb,
  setCompletedHoles, setGameComplete, setCurrentHoleSettlement,
  setCurrentSection,
  t
}) => {
  // Shared init logic for viewer
  const initGameStateFromRemote = (g) => {
    setGameMode(g.gameMode || 'matchPlay');
    setStake(String(g.stake || ''));
    setJumboMode(g.jumboMode || false);
    setPlayerHandicaps(g.handicaps || {});
    setAdvanceMode(g.advanceMode || 'off');
    setAdvancePlayers(g.advancePlayers || {});
    
    const names = [...(g.players || [])];
    while (names.length < (g.jumboMode ? 8 : 4)) names.push('');
    setPlayerNames(names);
    
    if (g.course && g.course.fullName) {
      setSelectedCourse(g.course);
      if (g.course.pars) {
        const newPars = {};
        g.course.pars.forEach((p, i) => { newPars[i + 1] = p; });
        setPars(newPars);
      }
    }

    const allP = g.players || [];
    const initMoney = {};
    const initDetails = {};
    const initAllScores = {};
    const initSpent = {};
    const initAllPutts = {};
    const initAllWater = {};
    const initAllOb = {};
    allP.forEach(player => {
      initMoney[player] = 0;
      initDetails[player] = { fromPool: 0, fromPlayers: {} };
      initAllScores[player] = {};
      initSpent[player] = 0;
      initAllPutts[player] = {};
      initAllWater[player] = {};
      initAllOb[player] = {};
      allP.forEach(other => {
        if (other !== player) initDetails[player].fromPlayers[other] = 0;
      });
    });
    setTotalMoney(initMoney);
    setMoneyDetails(initDetails);
    setAllScores(initAllScores);
    setAllUps({});
    setAllPutts(initAllPutts);
    setAllWater(initAllWater);
    setAllOb(initAllOb);
    setTotalSpent(initSpent);
    setCurrentHole(0);
    setScores({});
    setUps({});
    setPutts({});
    setWater({});
    setOb({});
    setCompletedHoles([]);
    setGameComplete(false);
    setCurrentHoleSettlement(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6">
              <div className="max-w-md mx-auto px-4 space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('mpRoleTitle') || 'Join Room'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('mpRoleDesc') || 'How would you like to join?'}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-mono">
                    🏠 {mp.gameCode}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Player Card */}
                  <button
                    onClick={() => setCurrentSection('mp-claim')}
                    className="bg-white rounded-xl p-5 shadow-md border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition text-left"
                  >
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-lg font-bold text-blue-700 mb-1">
                      {t('mpPlayerRole') || 'Player'}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {t('mpPlayerRoleDesc') || 'Claim players and input scores'}
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs text-blue-600 flex items-center gap-1">
                        ✏️ <span>{t('mpPlayerTagInput') || 'Input scores'}</span>
                      </div>
                      <div className="text-xs text-blue-600 flex items-center gap-1">
                        👤 <span>{t('mpPlayerTagClaim') || 'Claim players'}</span>
                      </div>
                    </div>
                  </button>

                  {/* Viewer Card */}
                  <button
                    onClick={async () => {
                      const g = mp.remoteGame;
                      initGameStateFromRemote(g);
                      if (g.holesList) {
                        setHoles(g.holesList);
                      }
                      await mp.joinAsViewer(mp.gameCode);
                      mp.setMultiplayerSection('lobby');
                      setCurrentSection('mp-lobby');
                    }}
                    className="bg-white rounded-xl p-5 shadow-md border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition text-left"
                  >
                    <div className="text-3xl mb-2">👁</div>
                    <div className="text-lg font-bold text-purple-700 mb-1">
                      {t('mpViewerRole') || 'Viewer'}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {t('mpViewerRoleDesc') || 'Watch the game live, read-only'}
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs text-purple-600 flex items-center gap-1">
                        👁 <span>{t('mpViewerTagLive') || 'Live scores'}</span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 line-through">
                        ✏️ <span>{t('mpViewerTagNoInput') || 'No input'}</span>
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => {
                    mp.resetMultiplayer();
                    mp.setMultiplayerSection(null);
                    setCurrentSection('home');
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
              </div>
            </div>
  );
});

// ========== mp-claim: Joiner 认领球员 ==========
const MpClaimSection = memo(({
  mp, showToast,
  setGameMode, setStake, setJumboMode, setPlayerHandicaps,
  setAdvanceMode, setAdvancePlayers, setPlayerNames,
  setSelectedCourse, setPars,
  setTotalMoney, setMoneyDetails, setAllScores, setAllUps, setAllPutts,
  setAllWater, setAllOb, setTotalSpent,
  setCurrentHole, setScores, setUps, setPutts, setWater, setOb,
  setCompletedHoles, setGameComplete, setCurrentHoleSettlement,
  setCurrentSection,
  t
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-6">
              <div className="max-w-md mx-auto px-4 space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('mpClaimTitle')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('mpClaimDesc')}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md space-y-2">
                  {(mp.remoteGame.players || []).map(player => (
                    <label key={player} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                      <input
                        type="checkbox"
                        checked={mp.claimChecked[player] || false}
                        onChange={(e) => mp.setClaimChecked(prev => ({ ...prev, [player]: e.target.checked }))}
                        className="w-5 h-5 rounded text-blue-600"
                      />
                      <span className="font-medium text-gray-900 text-lg">{player}</span>
                      {mp.claimed[player] && mp.claimed[player] !== mp.deviceId && (
                        <span className={`ml-auto text-xs ${mp.getDeviceBgClass(mp.claimed[player])} px-2 py-0.5 rounded`}>{mp.getDeviceLabel(mp.claimed[player])}</span>
                      )}
                    </label>
                  ))}
                </div>

                <button
                  onClick={async () => {
                    const selected = Object.entries(mp.claimChecked).filter(([,v]) => v).map(([k]) => k);
                    if (selected.length === 0) {
                      showToast(t('mpSelectOne'), 'error');
                      return;
                    }
                    // Apply remote game settings locally
                    const g = mp.remoteGame;
                    setGameMode(g.gameMode || 'matchPlay');
                    setStake(String(g.stake || ''));
                    setJumboMode(g.jumboMode || false);
                    setPlayerHandicaps(g.handicaps || {});
                    setAdvanceMode(g.advanceMode || 'off');
                    setAdvancePlayers(g.advancePlayers || {});
                    
                    // Set player names
                    const names = [...(g.players || [])];
                    while (names.length < (g.jumboMode ? 8 : 4)) names.push('');
                    setPlayerNames(names);
                    
                    // Apply course if available
                    if (g.course && g.course.fullName) {
                      setSelectedCourse(g.course);
                      if (g.course.pars) {
                        const newPars = {};
                        g.course.pars.forEach((p, i) => { newPars[i + 1] = p; });
                        setPars(newPars);
                      }
                    }

                    const result = await mp.claimPlayers(selected);
                    if (result.ok) {
                      // Initialize game state locally like startGame does
                      const allP = g.players || [];
                      const initMoney = {};
                      const initDetails = {};
                      const initAllScores = {};
                      const initSpent = {};
                      const initAllPutts = {};
                      const initAllWater = {};
                      const initAllOb = {};
                      allP.forEach(player => {
                        initMoney[player] = 0;
                        initDetails[player] = { fromPool: 0, fromPlayers: {} };
                        initAllScores[player] = {};
                        initSpent[player] = 0;
                        initAllPutts[player] = {};
                        initAllWater[player] = {};
                        initAllOb[player] = {};
                        allP.forEach(other => {
                          if (other !== player) initDetails[player].fromPlayers[other] = 0;
                        });
                      });
                      setTotalMoney(initMoney);
                      setMoneyDetails(initDetails);
                      setAllScores(initAllScores);
                      setAllUps({});
                      setAllPutts(initAllPutts);
                      setAllWater(initAllWater);
                      setAllOb(initAllOb);
                      setTotalSpent(initSpent);
                      setCurrentHole(0);
                      setScores({});
                      setUps({});
                      setPutts({});
                      setWater({});
                      setOb({});
                      setCompletedHoles([]);
                      setGameComplete(false);
                      setCurrentHoleSettlement(null);
                      
                      mp.setMultiplayerSection('lobby');
                      setCurrentSection('mp-lobby');
                    }
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700"
                >
                  {t('mpConfirmClaim')}
                </button>

                <button
                  onClick={() => {
                    mp.resetMultiplayer();
                    mp.setMultiplayerSection(null);
                    setCurrentSection('home');
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
              </div>
            </div>
  );
});

export { MpLobbySection, MpRoleSection, MpClaimSection };
