import React from 'react';
import { RoundReportShareModal } from '../RoundReport';
import { Toast, EditToast } from '../components/Toasts';
import { EditLogDialog } from '../components/EditLogDialog';
import { ConfirmDialog, PuttsWarningDialog } from '../components/ConfirmDialogs';
import { HoleScoreConfirmDialog, HoleSelectDialog, EditHoleDialog } from '../components/HoleDialogs';
import { PersonalReportCard, PersonalFullDetailModal } from '../components/PersonalReport';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

const GlobalDialogs = ({
  activePlayers,
  completedHoles,
  allScores,
  allPutts,
  allWater,
  allOb,
  allUps,
  pars,
  gameMode,
  getMedal,
  // Personal report
  reportPlayer,
  setReportPlayer,
  showFullDetail,
  setShowFullDetail,
  // Round report
  showRoundReport,
  roundReportLinkOnly,
  setShowRoundReport,
  roundReportData,
  lang,
  showToast,
  // Toast
  toast,
  setToast,
  // Edit toast
  editToastData,
  setEditToastData,
  setEditLogDialog,
  // Edit log dialog
  editLogDialog,
  editLog,
  // Confirm dialog
  confirmDialog,
  setConfirmDialog,
  // Hole confirm dialog
  holeConfirmDialog,
  setHoleConfirmDialog,
  pendingRankings,
  setPendingRankings,
  holes,
  currentHole,
  scores,
  putts,
  getHandicapForHole,
  stake,
  prizePool,
  // Hole select dialog
  holeSelectDialog,
  setHoleSelectDialog,
  setEditHoleDialog,
  mp,
  // Edit hole dialog
  editHoleDialog,
  allUpOrders,
  handleEditHoleSave,
  // Putts warning
  puttsWarningDialog,
  setPuttsWarningDialog,
  handlePuttsWarningConfirm,
  // General
  t,
}) => {
  // Calculate player rank for personal report
  const getPlayerRank = (player) => {
    if (!completedHoles.length) return 0;
    const totals = activePlayers.map(p => ({
      player: p,
      total: completedHoles.reduce((sum, h) => sum + (allScores[p]?.[h] || 0) + (allPutts[p]?.[h] || 0), 0)
    }));
    totals.sort((a, b) => a.total - b.total);
    const idx = totals.findIndex(t => t.player === player);
    return idx + 1;
  };

  return (
    <>
      {/* Round Report 分享弹窗 */}
      <RoundReportShareModal
        isOpen={showRoundReport}
        onClose={() => setShowRoundReport(false)}
        reportData={roundReportData}
        lang={lang}
        showToast={showToast}
        linkOnly={roundReportLinkOnly}
        editLog={editLog}
        t={t}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {editToastData && (
        <EditToast
          log={editToastData}
          onClose={() => setEditToastData(null)}
          onViewDetail={(hole) => setEditLogDialog({ isOpen: true, hole })}
          t={t}
        />
      )}

      <EditLogDialog
        isOpen={editLogDialog.isOpen}
        onClose={() => setEditLogDialog({ isOpen: false, hole: null })}
        logs={editLog}
        filterHole={editLogDialog.hole}
        t={t}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, message: '', action: null, showScreenshotHint: false })}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
        }}
        message={confirmDialog.message}
        t={t}
        showScreenshotHint={confirmDialog.showScreenshotHint}
      />

      <HoleScoreConfirmDialog
        isOpen={holeConfirmDialog.isOpen}
        onClose={() => {
          setHoleConfirmDialog({ isOpen: false, action: null });
          setPendingRankings(null);
        }}
        onConfirm={() => {
          if (holeConfirmDialog.action) holeConfirmDialog.action();
        }}
        hole={holes[currentHole]}
        players={activePlayers}
        scores={scores}
        putts={putts}
        rankings={pendingRankings}
        gameMode={gameMode}
        getHandicapForHole={getHandicapForHole}
        pars={pars}
        t={t}
        stake={stake}
        prizePool={prizePool}
        activePlayers={activePlayers}
      />

      <HoleSelectDialog
        isOpen={holeSelectDialog}
        onClose={() => setHoleSelectDialog(false)}
        completedHoles={completedHoles}
        onSelect={(hole) => {
          if (mp.multiplayerOn) mp.stopPolling();
          setEditHoleDialog({ isOpen: true, hole });
        }}
        t={t}
        pars={pars}
      />

      <EditHoleDialog
        isOpen={editHoleDialog.isOpen}
        onClose={() => {
          setEditHoleDialog({ isOpen: false, hole: null });
          if (mp.multiplayerOn && mp.gameCode) mp.startPolling(mp.gameCode);
        }}
        hole={editHoleDialog.hole}
        players={mp.multiplayerOn ? mp.getMyPlayers(activePlayers) : activePlayers}
        allScores={allScores}
        allUps={allUps}
        allUpOrders={allUpOrders}
        allPutts={allPutts}
        pars={pars}
        onSave={handleEditHoleSave}
        t={t}
        gameMode={gameMode}
      />

      <PuttsWarningDialog
        isOpen={puttsWarningDialog.isOpen}
        onClose={() => setPuttsWarningDialog({ isOpen: false, players: [] })}
        onConfirm={handlePuttsWarningConfirm}
        players={puttsWarningDialog.players}
        scores={scores}
        pars={pars}
        holes={holes}
        currentHole={currentHole}
        t={t}
        lang={lang}
      />

      {reportPlayer && !showFullDetail && (
        <PersonalReportCard
          player={reportPlayer}
          rank={getPlayerRank(reportPlayer)}
          onClose={() => setReportPlayer(null)}
          onViewFull={() => setShowFullDetail(true)}
          allScores={allScores}
          allPutts={allPutts}
          allUps={allUps}
          pars={pars}
          completedHoles={completedHoles}
          gameMode={gameMode}
          t={t}
          getMedal={getMedal}
        />
      )}

      {reportPlayer && showFullDetail && (
        <PersonalFullDetailModal
          player={reportPlayer}
          rank={getPlayerRank(reportPlayer)}
          onClose={() => { setReportPlayer(null); setShowFullDetail(false); }}
          onBack={() => setShowFullDetail(false)}
          allScores={allScores}
          allPutts={allPutts}
          allUps={allUps}
          pars={pars}
          completedHoles={completedHoles}
          gameMode={gameMode}
          t={t}
          getMedal={getMedal}
        />
      )}

      <PWAInstallPrompt lang={lang} />
    </>
  );
};

export default GlobalDialogs;
