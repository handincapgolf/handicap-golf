// useMultiplayerSync.js — HandinCap Multi-Device Multiplayer Sync Hook
// Supports N devices: 1 Creator + multiple Joiners
// Uses Cloudflare Workers + KV (polling every 3 seconds)
//
// === ARCHITECTURE CHANGE ===
// OLD: 2 roles only — "creator" / "joiner"
//   claimed:   { "Alice": "creator", "Bob": "joiner" }
//   confirmed: { creator: true, joiner: false }
//
// NEW: N devices — each identified by deviceId
//   devices:   { "dev_abc": { role:"creator", label:"🅰️", color:"green", name:"Host" },
//                "dev_def": { role:"joiner",  label:"🅱️", color:"blue",  name:"Buggy 2" },
//                "dev_ghi": { role:"joiner",  label:"🅲",  color:"purple", name:"Buggy 3" } }
//   claimed:   { "Alice": "dev_abc", "Bob": "dev_def", "Charlie": "dev_ghi" }
//   confirmed: { "dev_abc": true, "dev_def": false, "dev_ghi": true }
// ===========================

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = '/api';

// Device labels and colors for up to 8 devices
const DEVICE_STYLES = [
  { label: '🅰️', color: 'green',  bgClass: 'bg-green-100 text-green-700',  dotClass: 'bg-green-500' },
  { label: '🅱️', color: 'blue',   bgClass: 'bg-blue-100 text-blue-700',    dotClass: 'bg-blue-500' },
  { label: 'Ⓒ',  color: 'purple', bgClass: 'bg-purple-100 text-purple-700', dotClass: 'bg-purple-500' },
  { label: 'Ⓓ',  color: 'orange', bgClass: 'bg-orange-100 text-orange-700', dotClass: 'bg-orange-500' },
  { label: 'Ⓔ',  color: 'pink',   bgClass: 'bg-pink-100 text-pink-700',    dotClass: 'bg-pink-500' },
  { label: 'Ⓕ',  color: 'teal',   bgClass: 'bg-teal-100 text-teal-700',    dotClass: 'bg-teal-500' },
  { label: 'Ⓖ',  color: 'amber',  bgClass: 'bg-amber-100 text-amber-700',  dotClass: 'bg-amber-500' },
  { label: 'Ⓗ',  color: 'rose',   bgClass: 'bg-rose-100 text-rose-700',    dotClass: 'bg-rose-500' },
];

// Generate unique device ID (persisted in localStorage)
function getDeviceId() {
  let id = localStorage.getItem('handincap_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now();
    localStorage.setItem('handincap_device_id', id);
  }
  return id;
}

async function apiCall(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  };
  if (body) opts.body = JSON.stringify(body);
  const cacheBust = method === 'GET' ? `${path}${path.includes('?') ? '&' : '?'}_t=${Date.now()}` : path;
  const res = await fetch(`${API_BASE}${cacheBust}`, opts);
  return res.json();
}

export function useMultiplayerSync() {
  // Restore from localStorage on init
  const saved = useRef((() => {
    try { return JSON.parse(localStorage.getItem('handincap_mp') || 'null'); } catch { return null; }
  })());

  const [multiplayerOn, setMultiplayerOn] = useState(saved.current?.on || false);
  const [multiplayerRole, setMultiplayerRole] = useState(saved.current?.role || null); // "creator" | "joiner" | "viewer"
  const [gameCode, setGameCode] = useState(saved.current?.code || '');
  const [joinerCode, setJoinerCode] = useState('');
  const [remoteGame, setRemoteGame] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncFlash, setSyncFlash] = useState(null);

  // === MULTI-DEVICE STATE ===
  // confirmed: { "dev_abc": true, "dev_def": false, ... } — per-device
  const [confirmed, setConfirmed] = useState(saved.current?.confirmed || {});
  // claimed: { "PlayerName": "dev_abc", ... } — player → deviceId
  const [claimed, setClaimed] = useState(saved.current?.claimed || {});
  // devices: { "dev_abc": { role, label, color, bgClass, dotClass, index }, ... }
  const [devices, setDevices] = useState(saved.current?.devices || {});

  const [claimChecked, setClaimChecked] = useState({});
  const [multiplayerSection, setMultiplayerSection] = useState(saved.current?.section || null);

  const pollRef = useRef(null);
  const deviceId = useRef(getDeviceId());

  // === DEVICE HELPERS ===

  // Get style for a device by its index in the devices map
  const getDeviceStyle = useCallback((devId) => {
    const dev = devices[devId];
    if (!dev) return DEVICE_STYLES[0];
    return DEVICE_STYLES[dev.index] || DEVICE_STYLES[0];
  }, [devices]);

  // Get my device style
  const getMyStyle = useCallback(() => {
    return getDeviceStyle(deviceId.current);
  }, [getDeviceStyle]);

  // Get label emoji for a device
  const getDeviceLabel = useCallback((devId) => {
    return getDeviceStyle(devId).label;
  }, [getDeviceStyle]);

  // Get bgClass for a device (for badges)
  const getDeviceBgClass = useCallback((devId) => {
    return getDeviceStyle(devId).bgClass;
  }, [getDeviceStyle]);

  // Update devices map from remote game
  const syncDevicesFromRemote = useCallback((game) => {
    if (game.devices) {
      setDevices(game.devices);
    }
    if (game.claimed) {
      setClaimed(game.claimed);
    }
  }, []);

  // Start polling for game state
  const startPolling = useCallback((code) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const result = await apiCall(`/game/${code}`);
        if (result.ok && result.game) {
          setRemoteGame(result.game);
          setSyncStatus('connected');
          syncDevicesFromRemote(result.game);
        }
      } catch (err) {
        setSyncStatus('error');
      }
    }, 3000);
  }, [syncDevicesFromRemote]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Save multiplayer state to localStorage
  useEffect(() => {
    if (multiplayerOn && gameCode) {
      localStorage.setItem('handincap_mp', JSON.stringify({
        on: multiplayerOn,
        role: multiplayerRole,
        code: gameCode,
        claimed,
        devices,
        confirmed,
        section: multiplayerSection,
      }));
    }
  }, [multiplayerOn, multiplayerRole, gameCode, claimed, devices, confirmed, multiplayerSection]);

  // Auto-reconnect on mount if saved state exists
  useEffect(() => {
    if (saved.current?.on && saved.current?.code && !pollRef.current) {
      startPolling(saved.current.code);
    }
  }, [startPolling]);

  // === GAME ACTIONS ===

  // Creator: Create game room
  const createGame = useCallback(async (gameSetup) => {
    try {
      setSyncStatus('syncing');
      const result = await apiCall('/game/create', 'POST', {
        ...gameSetup,
        deviceId: deviceId.current,
      });
      if (result.ok) {
        setGameCode(result.code);
        setMultiplayerRole('creator');
        setRemoteGame(result.game);
        syncDevicesFromRemote(result.game);
        setSyncStatus('connected');
        startPolling(result.code);
        setMultiplayerSection('lobby');
        return result;
      } else {
        setSyncStatus('error');
        return result;
      }
    } catch (err) {
      setSyncStatus('error');
      return { ok: false, error: err.message };
    }
  }, [startPolling, syncDevicesFromRemote]);

  // Joiner: Join game
  const joinGame = useCallback(async (code) => {
    try {
      setSyncStatus('syncing');
      const result = await apiCall(`/game/${code}`);
      if (result.ok) {
        setGameCode(code);
        setMultiplayerRole('joiner');
        setMultiplayerOn(true);
        setRemoteGame(result.game);
        syncDevicesFromRemote(result.game);

        // Register this joiner device — Worker assigns index/label
        const joinResult = await apiCall(`/game/${code}/join`, 'PUT', {
          deviceId: deviceId.current,
        });
        if (joinResult.ok && joinResult.game) {
          setRemoteGame(joinResult.game);
          syncDevicesFromRemote(joinResult.game);
        }

        setSyncStatus('connected');
        startPolling(code);
        setMultiplayerSection('joinerClaim');
        return result;
      } else {
        setSyncStatus('error');
        return result;
      }
    } catch (err) {
      setSyncStatus('error');
      return { ok: false, error: err.message };
    }
  }, [startPolling, syncDevicesFromRemote]);

  // Viewer: Join game as read-only viewer (no claim, no input)
  const joinAsViewer = useCallback(async (code) => {
    try {
      setSyncStatus('syncing');
      const result = await apiCall(`/game/${code}`);
      if (result.ok) {
        setGameCode(code);
        setMultiplayerRole('viewer');
        setMultiplayerOn(true);
        setRemoteGame(result.game);
        syncDevicesFromRemote(result.game);
        setSyncStatus('connected');
        startPolling(code);
        // Viewer skips claim, goes directly to lobby or game
        setMultiplayerSection('lobby');
        return result;
      } else {
        setSyncStatus('error');
        return result;
      }
    } catch (err) {
      setSyncStatus('error');
      return { ok: false, error: err.message };
    }
  }, [startPolling, syncDevicesFromRemote]);

  // Joiner: Claim players (sends deviceId so Worker maps player→deviceId)
  const claimPlayers = useCallback(async (playerNames) => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/claim`, 'PUT', {
      players: playerNames,
      deviceId: deviceId.current,
    });
    if (result.ok) {
      syncDevicesFromRemote(result.game);
      setRemoteGame(result.game);
      setMultiplayerSection('lobby');
    }
    return result;
  }, [gameCode, syncDevicesFromRemote]);

  // Creator: Start the game
  const startMultiplayerGame = useCallback(async () => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/start`, 'PUT', {});
    if (result.ok) {
      setRemoteGame(result.game);
      // Reset confirmed for ALL devices
      const resetConfirmed = {};
      Object.keys(result.game.devices || devices).forEach(devId => {
        resetConfirmed[devId] = false;
      });
      setConfirmed(resetConfirmed);
    }
    return result;
  }, [gameCode, devices]);

  // Submit scores for current hole
  const submitScores = useCallback(async (hole, data) => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/score`, 'PUT', {
      hole,
      deviceId: deviceId.current, // ← use deviceId instead of role
      ...data,
    });
    if (result.ok) {
      setRemoteGame(result.game);
    }
    return result;
  }, [gameCode]);

  // Confirm my scores for this hole
  const confirmMyScores = useCallback(async (hole, scores, putts, ups, upOrder, water, ob, totalMoney, moneyDetails, totalSpent) => {
    const data = {
      scores, putts, ups, upOrder, water, ob,
      confirmed: true,
    };
    // Only creator pushes totalMoney
    if (multiplayerRole === 'creator') {
      data.totalMoney = totalMoney || {};
      data.moneyDetails = moneyDetails || {};
      data.totalSpent = totalSpent || {};
    }
    return submitScores(hole, data);
  }, [submitScores, multiplayerRole]);

  // Unconfirm (retract) my scores
  const unconfirmMyScores = useCallback(async (hole) => {
    return submitScores(hole, { confirmed: false });
  }, [submitScores]);

  // Sync next hole
  const syncNextHole = useCallback(async (nextHole, nextHoleNum, gameState) => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/next`, 'PUT', {
      nextHole,
      nextHoleNum,
      ...gameState,
    });
    if (result.ok) {
      setRemoteGame(result.game);
      // Reset confirmed for ALL devices
      const resetConfirmed = {};
      Object.keys(result.game.devices || devices).forEach(devId => {
        resetConfirmed[devId] = false;
      });
      setConfirmed(resetConfirmed);
    }
    return result;
  }, [gameCode, devices]);

  // Sync edit
  const syncEdit = useCallback(async (gameState) => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/edit`, 'PUT', gameState);
    if (result.ok) {
      setRemoteGame(result.game);
    }
    return result;
  }, [gameCode]);

  // === PLAYER HELPERS (deviceId-based) ===

  // Get players assigned to MY device (viewer has none)
  const getMyPlayers = useCallback((allPlayers) => {
    if (!multiplayerOn) return allPlayers;
    if (multiplayerRole === 'viewer') return [];
    return allPlayers.filter(p => claimed[p] === deviceId.current);
  }, [multiplayerOn, multiplayerRole, claimed]);

  // Get players assigned to OTHER devices (viewer sees all as "other")
  const getOtherPlayers = useCallback((allPlayers) => {
    if (!multiplayerOn) return [];
    if (multiplayerRole === 'viewer') return allPlayers;
    return allPlayers.filter(p => claimed[p] && claimed[p] !== deviceId.current);
  }, [multiplayerOn, multiplayerRole, claimed]);

  // Get players assigned to a specific device
  const getPlayersForDevice = useCallback((devId, allPlayers) => {
    return allPlayers.filter(p => claimed[p] === devId);
  }, [claimed]);

  // === CONFIRMED HELPERS (multi-device) ===

  // Get list of all deviceIds that have claimed players (active devices)
  const getActiveDeviceIds = useCallback(() => {
    const activeDevs = new Set(Object.values(claimed).filter(Boolean));
    return [...activeDevs];
  }, [claimed]);

  // Check if ALL active devices have confirmed
  const isAllConfirmed = useCallback(() => {
    const activeDevs = getActiveDeviceIds();
    if (activeDevs.length === 0) return false;
    return activeDevs.every(devId => confirmed[devId]);
  }, [confirmed, getActiveDeviceIds]);

  // Check if MY device has confirmed
  const isMyConfirmed = useCallback(() => {
    return confirmed[deviceId.current] || false;
  }, [confirmed]);

  // Check if all OTHER devices (not mine) have confirmed
  const isOthersConfirmed = useCallback(() => {
    const activeDevs = getActiveDeviceIds().filter(d => d !== deviceId.current);
    if (activeDevs.length === 0) return true;
    return activeDevs.every(devId => confirmed[devId]);
  }, [confirmed, getActiveDeviceIds]);

  // Get list of devices that haven't confirmed yet
  const getUnconfirmedDevices = useCallback(() => {
    return getActiveDeviceIds().filter(devId => !confirmed[devId]);
  }, [confirmed, getActiveDeviceIds]);

  // Get confirmed status summary: "2/4 confirmed"
  const getConfirmedSummary = useCallback(() => {
    const activeDevs = getActiveDeviceIds();
    const confirmedCount = activeDevs.filter(devId => confirmed[devId]).length;
    return { confirmed: confirmedCount, total: activeDevs.length };
  }, [confirmed, getActiveDeviceIds]);

  // Get scores from remote for other players' current hole
  const getRemoteHoleData = useCallback((holeNum) => {
    if (!remoteGame?.holes?.[holeNum]) return null;
    return remoteGame.holes[holeNum];
  }, [remoteGame]);

  // === BACKWARD COMPAT: confirmed per-device from hole data ===
  // The Worker stores confirmed as { "dev_abc": true, "dev_def": false }
  // This replaces the old setConfirmedFromHole({ creator, joiner })
  const setConfirmedFromHole = useCallback((holeConfirmed) => {
    if (!holeConfirmed) return;
    setConfirmed(prev => ({ ...prev, ...holeConfirmed }));
  }, []);

  // Reset confirmed for all devices
  const resetAllConfirmed = useCallback(() => {
    const reset = {};
    getActiveDeviceIds().forEach(devId => { reset[devId] = false; });
    setConfirmed(reset);
  }, [getActiveDeviceIds]);

  // Reset multiplayer state
  const resetMultiplayer = useCallback(() => {
    stopPolling();
    setMultiplayerOn(false);
    setMultiplayerRole(null);
    setGameCode('');
    setJoinerCode('');
    setRemoteGame(null);
    setSyncStatus('idle');
    setSyncFlash(null);
    setConfirmed({});
    setClaimed({});
    setDevices({});
    setClaimChecked({});
    setMultiplayerSection(null);
    localStorage.removeItem('handincap_mp');
  }, [stopPolling]);

  // Count of non-creator devices that have claimed players
  const otherDeviceCount = getActiveDeviceIds().filter(d => d !== deviceId.current).length;

  // === BACKWARD COMPAT SHIMS ===
  // These allow gradual migration — you can remove them once IntegratedGolfGame.js is fully updated

  // OLD: mp.confirmed.creator / mp.confirmed.joiner → NEW: mp.confirmed["dev_xxx"]
  // OLD: mp.joinerCount → NEW: mp.otherDeviceCount
  const joinerCount = otherDeviceCount; // backward compat alias

  // OLD: mp.isBothConfirmed() → NEW: mp.isAllConfirmed()
  const isBothConfirmed = isAllConfirmed; // backward compat alias

  // OLD: mp.isOtherConfirmed() → NEW: mp.isOthersConfirmed()
  const isOtherConfirmed = isOthersConfirmed; // backward compat alias

  // Viewer helper
  const isViewer = multiplayerRole === 'viewer';

  return {
    // State
    multiplayerOn, setMultiplayerOn,
    multiplayerRole,
    isViewer,
    gameCode,
    joinerCode, setJoinerCode,
    remoteGame,
    syncStatus,
    syncFlash,
    confirmed,
    claimed,
    devices,
    claimChecked, setClaimChecked,
    multiplayerSection, setMultiplayerSection,
    otherDeviceCount,
    joinerCount, // backward compat
    deviceId: deviceId.current,

    // Actions
    createGame,
    joinGame,
    joinAsViewer,
    claimPlayers,
    startMultiplayerGame,
    submitScores,
    confirmMyScores,
    unconfirmMyScores,
    syncNextHole,
    syncEdit,
    resetMultiplayer,
    startPolling,
    stopPolling,

    // Player helpers
    getMyPlayers,
    getOtherPlayers,
    getPlayersForDevice,

    // Confirmed helpers
    isAllConfirmed,
    isBothConfirmed,   // backward compat alias
    isMyConfirmed,
    isOthersConfirmed,
    isOtherConfirmed,  // backward compat alias
    getUnconfirmedDevices,
    getConfirmedSummary,
    getRemoteHoleData,
    setConfirmedFromHole,
    resetAllConfirmed,

    // Device style helpers
    getDeviceStyle,
    getMyStyle,
    getDeviceLabel,
    getDeviceBgClass,
    getActiveDeviceIds,
    getPlayersForDevice,

    // Constants
    DEVICE_STYLES,
  };
}