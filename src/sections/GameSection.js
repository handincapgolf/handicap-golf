import React from 'react';
import { TrendingUp, BarChart3, Eye } from 'lucide-react';
import ViewerGameScreen from '../ViewerGameScreen';
import AdvancedPlayerCard from '../components/AdvancedPlayerCard';
import { getBaccaratCardClass, getBaccaratUpBtnClass, getBaccaratUpLabel, BaccaratMatchupGrid } from '../gameModes/BaccaratComponents';

const GameSection = ({
  activePlayers,
  allScores,
  allPutts,
  allUps,
  scores,
  putts,
  water,
  ob,
  ups,
  upOrder,
  pars,
  holes,
  currentHole,
  completedHoles,
  gameMode,
  stake,
  prizePool,
  advanceMode,
  advancePlayers,
  selectedCourse,
  totalMoney,
  moneyDetails,
  totalSpent,
  currentHoleSettlement,
  gameComplete,
  voiceEnabled,
  setVoiceEnabled,
  mp,
  getHandicapForHole,
  getScoreLabel,
  changeOn,
  changePutts,
  changeWater,
  changeOb,
  resetWater,
  resetOb,
  toggleUp,
  toggleBaccaratUp,
  nextHole,
  showConfirm,
  showToast,
  setCurrentSection,
  setGameComplete,
  triggerConfetti,
  endGameEarlyMP,
  t,
  lang,
}) => {
  if (mp.isViewer) {
    return (
      <ViewerGameScreen
        activePlayers={activePlayers}
        allScores={allScores}
        allPutts={allPutts}
        allUps={allUps}
        scores={scores}
        putts={putts}
        pars={pars}
        holes={holes}
        currentHole={currentHole}
        completedHoles={completedHoles}
        gameMode={gameMode}
        stake={stake}
        selectedCourse={selectedCourse}
        totalMoney={totalMoney}
        currentHoleSettlement={currentHoleSettlement}
        getHandicapForHole={getHandicapForHole}
        mp={mp}
        t={t}
        setCurrentSection={setCurrentSection}
      />
    );
  }

  return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }} className="bg-gradient-to-b from-green-600 to-green-800 text-white">
          <div className="bg-green-800 bg-opacity-50 text-center pt-6 pb-3 relative">
            <h1 className="text-2xl font-bold mb-2">
  {t('hole')} {holes[currentHole]}
  <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded text-lg">
    PAR {pars[holes[currentHole]] || 4}
  </span>
  {selectedCourse?.index && (
    <span className="ml-2 px-2 py-0.5 bg-amber-400 text-amber-900 rounded text-sm font-bold">
      IDX {selectedCourse.index[holes[currentHole] - 1] || '-'}
    </span>
  )}
</h1>
            {Number(stake) > 0 && (
              <div className="text-base">
                {t('stake')}: ${Number(stake)} 
                {(gameMode === 'skins' || gameMode === 'win123') && (
                  <span className="ml-4">
                    {gameMode === 'win123' ? t('penaltyPot') : t('poolBalance')}: ${gameMode === 'skins' ? prizePool + (Number(stake) || 0) * activePlayers.length : prizePool}
                  </span>
                )}
                {advanceMode === 'on' && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-600 rounded text-xs">Adv</span>
                )}
              </div>
            )}
            
            {selectedCourse && (
              selectedCourse.blueTees || 
              selectedCourse.whiteTees || 
              selectedCourse.redTees
            ) && (
              <div className="mt-2 px-4">
                <div className="grid gap-1.5" style={{
                  gridTemplateColumns: `repeat(${
                    [selectedCourse.blueTees, selectedCourse.whiteTees, selectedCourse.redTees]
                      .filter(Boolean).length
                  }, 1fr)`
                }}>
                  {selectedCourse.blueTees && (
                    <div className="bg-blue-500 bg-opacity-90 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-700 rounded-full"></span>
                        <span className="text-xs font-semibold text-white">Blue</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourse.blueTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse.whiteTees && (
                    <div className="bg-gray-200 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span className="text-xs font-semibold text-gray-700">White</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {selectedCourse.whiteTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                  
                  {selectedCourse.redTees && (
                    <div className="bg-red-500 bg-opacity-90 rounded-md py-1 px-1.5 text-center shadow-sm">
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        <span className="inline-block w-1.5 h-1.5 bg-red-700 rounded-full"></span>
                        <span className="text-xs font-semibold text-white">Red</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourse.redTees[holes[currentHole] - 1]}m
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 语音开关按钮 */}
            <button
              onClick={() => {
                const newVal = !voiceEnabled;
                setVoiceEnabled(newVal);
                localStorage.setItem('handincap_voice', newVal.toString());
                if (newVal && 'speechSynthesis' in window) {
                  const u = new SpeechSynthesisUtterance('');
                  u.volume = 0;
                  speechSynthesis.speak(u);
                }
              }}
              className="absolute top-4 left-4 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-lg transition"
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>

            {!gameComplete && !mp.isViewer && (
              <button
                onClick={() => {
                  const message = t('endGameConfirm');
                  showConfirm(message, () => {
                    setGameComplete(true);
					showToast(t('gameOver'));
					setCurrentSection('scorecard');
					triggerConfetti();
					if (endGameEarlyMP) endGameEarlyMP();
                  }, false);
                }}
                className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition"
              >
                {t('endGame')}
              </button>
            )}
          </div>

          <div className="bg-white text-gray-900 p-3"> 
		  <div className="grid gap-3">
              {(() => {
                const myPlayers = mp.multiplayerOn ? mp.getMyPlayers(activePlayers) : activePlayers;
                const otherPlayers = mp.multiplayerOn ? mp.getOtherPlayers(activePlayers) : [];
                const otherConfirmed = mp.multiplayerOn && mp.isOthersConfirmed();
                
                const renderPlayer = (player, isOther) => {
                const holeNum = holes[currentHole];
                const par = pars[holeNum] || 4;
                const playerScore = scores[player] || par;
                const playerPutts = putts[player] || 0;
                const playerWater = water[player] || 0;
                const playerOb = ob[player] || 0;
                const playerUp = ups[player] || false;
                const playerHandicapValue = getHandicapForHole(player, holeNum, par);
                const netScore = playerScore - playerHandicapValue;
                const scoreLabel = getScoreLabel(netScore, par);
                const isAdvancePlayer = advanceMode === 'on' && advancePlayers[player];
                const isMyPlayer = !isOther;
                const hideBtns = mp.isViewer || (isOther && otherConfirmed);
                
                if (isAdvancePlayer) {
                  return (
                    <div key={player} className={isOther ? 'mp-locked-card' : ''} style={isOther ? { pointerEvents: 'none' } : {}}>
                    <AdvancedPlayerCard
  key={player}
  player={player}
  playerOn={playerScore}
  playerPutts={playerPutts}
  playerWater={playerWater}
  playerOb={playerOb}
  playerUp={gameMode === 'baccarat' ? upOrder.includes(player) : playerUp}
  par={par}
  showUp={(gameMode === 'win123' || gameMode === 'baccarat') && Number(stake) > 0}
  onChangeOn={(delta) => changeOn(player, delta)}
  onChangePutts={(delta) => changePutts(player, delta)}
  onChangeWater={() => changeWater(player)}
  onChangeOb={() => changeOb(player)}
  onResetWater={() => resetWater(player)}
  onResetOb={() => resetOb(player)}
  onToggleUp={() => gameMode === 'baccarat' ? toggleBaccaratUp(player) : toggleUp(player)}
  getScoreLabel={getScoreLabel}
  gameMode={gameMode}
  upOrder={upOrder}
/>
                  </div>
                  );
} else {
  const stroke = playerScore + playerPutts;
  const strokeLabel = getScoreLabel(stroke, par);
  
  return (
    <div key={player} className={isOther ? 'mp-locked-card' : ''} style={isOther ? { pointerEvents: 'none' } : {}}>
    <div className={`rounded-lg px-3 py-2.5 shadow-sm transition-all ${
      gameMode === 'baccarat' 
        ? getBaccaratCardClass(player, upOrder)
        : (playerUp ? 'card-up-active' : 'bg-gray-50 border border-gray-200')
    }`}>
      <div className="flex items-center">
        
        {/* 左侧：UP按钮 + 玩家名 */}
        <div className="w-14 flex-shrink-0 flex flex-col items-start">
          {gameMode === 'win123' && Number(stake) > 0 && (
            <button 
              onClick={() => toggleUp(player)}
              className={`w-9 h-9 rounded-lg font-bold text-[10px] btn-press flex flex-col items-center justify-center mb-1 transition ${
                playerUp 
                  ? 'bg-yellow-400 text-yellow-900 shadow' 
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">UP</span>
            </button>
          )}
          {gameMode === 'baccarat' && Number(stake) > 0 && (
            <button 
              onClick={() => toggleBaccaratUp(player)}
              className={`w-9 h-9 rounded-lg font-bold text-[10px] btn-press flex flex-col items-center justify-center mb-1 transition ${getBaccaratUpBtnClass(player, upOrder)}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">{getBaccaratUpLabel(player, upOrder)}</span>
            </button>
          )}
          <div className="font-bold text-lg text-gray-900">{player}</div>
        </div>

        {/* 中间：Stroke 显示 */}
        <div className="flex-1 flex justify-center">
          <div className="stroke-display relative">
  <div className={`stroke-number ${strokeLabel.numClass}`}>
    {stroke}
  </div>
  <div className={`stroke-label ${strokeLabel.class}`}>
    {strokeLabel.text}
  </div>
  {getHandicapForHole(player, holes[currentHole]) > 0 && (
    <div className="absolute -top-1 -right-3 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
      -{getHandicapForHole(player, holes[currentHole])}
    </div>
  )}
</div>
        </div>

        {/* 右侧：On + Putts 控制器 */}
        <div className="flex flex-col gap-2 ml-2">
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-gray-500 w-10 mr-1">On</span>
            <button
              onClick={() => changeOn(player, -1)}
              disabled={playerScore <= 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold transition ${
                playerScore > 1 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'
              }`}
              style={hideBtns ? { visibility: 'hidden' } : {}}
            >
              −
            </button>
            <span className="text-[32px] font-extrabold w-11 text-center text-gray-900">{playerScore}</span>
            <button
              onClick={() => changeOn(player, 1)}
              className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold"
              style={hideBtns ? { visibility: 'hidden' } : {}}
            >
              +
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-[11px] font-bold text-gray-500 w-10 mr-1">Putts</span>
            <button
              onClick={() => changePutts(player, -1)}
              disabled={playerPutts <= 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold transition ${
                playerPutts > 0 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400'
              }`}
              style={hideBtns ? { visibility: 'hidden' } : {}}
            >
              −
            </button>
            <span className="text-[32px] font-extrabold w-11 text-center text-blue-700">{playerPutts}</span>
            <button
              onClick={() => changePutts(player, 1)}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md btn-press text-xl font-bold"
              style={hideBtns ? { visibility: 'hidden' } : {}}
            >
              +
            </button>
          </div>
        </div>
        
      </div>
    </div>
    </div>
  );
}
                };
                
                return (
                  <>
                    {myPlayers.map(p => renderPlayer(p, false))}
                    {otherPlayers.length > 0 && (() => {
                      // Group other players by device for display
                      const otherDeviceIds = [...new Set(otherPlayers.map(p => mp.claimed[p]).filter(Boolean))];
                      const allOtherConfirmed = otherDeviceIds.every(devId => mp.confirmed[devId]);
                      return (
                      <div className={allOtherConfirmed ? 'rounded-xl border-2 border-green-400 p-1.5' : ''} 
                           style={allOtherConfirmed ? { background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' } : {}}>
                        {allOtherConfirmed && (
                          <div className="text-xs font-semibold text-green-700 flex items-center gap-1 px-2 py-1">
                            ✅ All Confirmed ✓
                          </div>
                        )}
                        {!allOtherConfirmed && otherDeviceIds.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 flex-wrap">
                            {otherDeviceIds.map(devId => (
                              <span key={devId} className={`text-xs px-1.5 py-0.5 rounded-full ${mp.confirmed[devId] ? mp.getDeviceBgClass(devId) : 'bg-gray-200 text-gray-500'}`}>
                                {mp.getDeviceLabel(devId)} {mp.confirmed[devId] ? '✓' : '...'}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="grid gap-2">
                          {otherPlayers.map(p => renderPlayer(p, true))}
                        </div>
                      </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          </div>

          {/* 方案C: 合并 Hole Settlement + Live Standings */}
{Number(stake) > 0 && (gameMode === 'matchPlay' || gameMode === 'win123' || gameMode === 'skins' || gameMode === 'baccarat') && (
  <div className="bg-orange-50 text-gray-900 p-3">
    <h3 className="text-center font-semibold mb-2 text-sm">{t('holeSettlement')}</h3>
    <div className={`grid gap-2 ${
      activePlayers.length <= 2 ? 'grid-cols-2' :
      activePlayers.length === 3 ? 'grid-cols-3' :
      'grid-cols-2'
    }`}>
      {activePlayers.map(player => {
        const holeAmt = currentHoleSettlement?.[player]?.money || 0;
        const totalAmt = totalMoney[player] || 0;
        return (
          <div key={player} className="bg-white p-2 rounded-md text-center">
            <div className="text-xs font-medium truncate">{player}</div>
            <div className={`text-sm font-bold ${
              holeAmt > 0 ? 'text-green-600' : 
              holeAmt < 0 ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {holeAmt === 0 ? '$0' : holeAmt > 0 ? `+$${holeAmt.toFixed(1)}` : `-$${Math.abs(holeAmt).toFixed(1)}`}
            </div>
            <div className={`text-xs mt-1 ${
              totalAmt > 0 ? 'text-green-500' : 
              totalAmt < 0 ? 'text-red-400' : 
              'text-gray-400'
            }`}>
              Total: {totalAmt === 0 ? '$0' : totalAmt > 0 ? `+$${totalAmt.toFixed(1)}` : `-$${Math.abs(totalAmt).toFixed(1)}`}
            </div>
          </div>
        );
      })}
    </div>
    
    {/* 百家乐对战明细 */}
    {gameMode === 'baccarat' && currentHoleSettlement?.matchupDetails && (
      <BaccaratMatchupGrid matchupDetails={currentHoleSettlement.matchupDetails} lang={lang} upOrder={upOrder} />
    )}
  </div>
)}

          <div className="bg-white p-3">
            {/* Viewer 提醒卡 */}
            {mp.isViewer && (
              <div className="mb-3 border-2 border-dashed border-purple-300 rounded-lg p-3 bg-purple-50">
                <div className="flex items-start gap-2">
                  <Eye className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-purple-700">
                      {t('mpViewerReminder') || 'You are viewing this game'}
                    </div>
                    <div className="text-xs text-purple-500 mt-0.5">
                      {t('mpViewerReminderDesc') || 'Scores update in real-time. You cannot input or modify scores.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 多人同步状态栏 */}
            {mp.multiplayerOn && (
              <div className="mb-2 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${mp.syncStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="text-gray-600">📡 {mp.gameCode}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {mp.getActiveDeviceIds().map(devId => (
                    <span key={devId} className={`px-2 py-0.5 rounded-full ${mp.confirmed[devId] ? mp.getDeviceBgClass(devId) : 'bg-gray-200 text-gray-500'}`}>
                      {mp.getDeviceLabel(devId)} {mp.confirmed[devId] ? '✓' : '...'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              {/* Viewer Mode: Exit + Live status */}
              {mp.isViewer ? (
                <>
                  <button
                    onClick={() => {
                      mp.resetMultiplayer();
                      mp.setMultiplayerSection(null);
                      setCurrentSection('home');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    {t('exit') || 'Exit'}
                  </button>
                  <div className="flex items-center gap-1.5 px-3 bg-green-50 rounded-lg text-xs text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live syncing
                  </div>
                  <button
                    onClick={() => setCurrentSection('scorecard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </>
              ) : (
              <>
              {/* 多人模式：Confirm 按钮 */}
              {mp.multiplayerOn && !mp.isMyConfirmed() ? (
                <button
                  onClick={async () => {
                    const holeNum = holes[currentHole];
                    const par = pars[holeNum] || 4;
                    const myPlayers = mp.getMyPlayers(activePlayers);
                    const myScores = {}; const myPutts = {}; const myUps = {}; const myWater = {}; const myOb = {};
                    myPlayers.forEach(p => {
                      myScores[p] = scores[p] || par;
                      myPutts[p] = putts[p] || 0;
                      myUps[p] = ups[p] || false;
                      myWater[p] = water[p] || 0;
                      myOb[p] = ob[p] || 0;
                    });
                    await mp.confirmMyScores(holeNum, myScores, myPutts, myUps, upOrder, myWater, myOb, totalMoney, moneyDetails, totalSpent);
                    // 解锁 speechSynthesis（用户手势内调用一次，后续 effect 就能自动播报）
                    if (voiceEnabled && 'speechSynthesis' in window) {
                      const unlock = new SpeechSynthesisUtterance('');
                      unlock.volume = 0;
                      speechSynthesis.speak(unlock);
                    }
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-semibold transition animate-pulse"
                >
                  {t('mpConfirmSubmit')}
                </button>
              ) : mp.multiplayerOn && mp.isMyConfirmed() && !mp.isAllConfirmed() ? (
                <button
                  onClick={async () => {
                    const holeNum = holes[currentHole];
                    await mp.unconfirmMyScores(holeNum);
                    showToast(t('retracted'), 'success');
                  }}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  ✏️ {t('undoEdit')} ({(() => { const s = mp.getConfirmedSummary(); return `${s.confirmed}/${s.total}`; })()})
                </button>
              ) : mp.multiplayerOn && mp.isAllConfirmed() && mp.multiplayerRole === 'creator' ? (
                <button
                  onClick={() => nextHole()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  {currentHole === holes.length - 1 
                    ? (t('mpConfirmFinish'))
                    : (t('mpConfirmNext'))}
                </button>
              ) : mp.multiplayerOn && mp.isAllConfirmed() && mp.multiplayerRole !== 'creator' ? (
                <button
                  disabled
                  className="flex-1 bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                >
                  ⏳ {t('waitingProceed')}
                </button>
              ) : (
                <button
                  onClick={nextHole}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  {currentHole === holes.length - 1 ? t('finishRound') : t('nextHole')}
                </button>
              )}
              <button
                onClick={() => setCurrentSection('scorecard')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              </>
              )}
            </div>
          </div>
        </div>
  );
};

export default GameSection;