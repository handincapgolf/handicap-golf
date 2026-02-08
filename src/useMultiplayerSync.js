// useMultiplayerSync.js — HandinCap Multiplayer Sync Hook
// Uses Cloudflare Workers + KV (polling every 3 seconds)

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = '/api';

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
  const [multiplayerRole, setMultiplayerRole] = useState(saved.current?.role || null);
  const [gameCode, setGameCode] = useState(saved.current?.code || '');
  const [joinerCode, setJoinerCode] = useState('');
  const [remoteGame, setRemoteGame] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncFlash, setSyncFlash] = useState(null);
  const [confirmed, setConfirmed] = useState({ creator: false, joiner: false });
  const [claimed, setClaimed] = useState(saved.current?.claimed || {});
  const [claimChecked, setClaimChecked] = useState({});
  const [multiplayerSection, setMultiplayerSection] = useState(saved.current?.section || null);
  
  const pollRef = useRef(null);
  const deviceId = useRef(getDeviceId());

  // Start polling for game state
  const startPolling = useCallback((code) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const result = await apiCall(`/game/${code}`);
        if (result.ok && result.game) {
          setRemoteGame(result.game);
          setSyncStatus('connected');
          
          // Note: confirmed state is managed by main component's merge effect
          // which reads from LOCAL current hole, not latest hole
          
          // Update claimed state
          if (result.game.claimed) {
            setClaimed(result.game.claimed);
          }
        }
      } catch (err) {
        setSyncStatus('error');
      }
    }, 3000);
  }, []);

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
        section: multiplayerSection,
      }));
    }
  }, [multiplayerOn, multiplayerRole, gameCode, claimed, multiplayerSection]);

  // Auto-reconnect on mount if saved state exists
  useEffect(() => {
    if (saved.current?.on && saved.current?.code && !pollRef.current) {
      startPolling(saved.current.code);
    }
  }, [startPolling]);

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
        setClaimed(result.game.claimed || {});
        setRemoteGame(result.game);
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
  }, [startPolling]);

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
        setClaimed(result.game.claimed || {});
        
        // Register joiner device
        await apiCall(`/game/${code}/join`, 'PUT', { deviceId: deviceId.current });
        
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
  }, [startPolling]);

  // Joiner: Claim players
  const claimPlayers = useCallback(async (playerNames) => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/claim`, 'PUT', { players: playerNames });
    if (result.ok) {
      setClaimed(result.game.claimed || {});
      setRemoteGame(result.game);
      setMultiplayerSection('lobby');
    }
    return result;
  }, [gameCode]);

  // Creator: Start the game
  const startMultiplayerGame = useCallback(async () => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/start`, 'PUT', {});
    if (result.ok) {
      setRemoteGame(result.game);
      setConfirmed({ creator: false, joiner: false });
    }
    return result;
  }, [gameCode]);

  // Submit scores for current hole
  const submitScores = useCallback(async (hole, data) => {
    if (!gameCode || !multiplayerRole) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/score`, 'PUT', {
      hole,
      role: multiplayerRole,
      ...data,
    });
    if (result.ok) {
      setRemoteGame(result.game);
    }
    return result;
  }, [gameCode, multiplayerRole]);

  // Confirm my scores for this hole
  const confirmMyScores = useCallback(async (hole, scores, putts, ups, upOrder, water, ob, totalMoney, moneyDetails, totalSpent) => {
    return submitScores(hole, {
      scores, putts, ups, upOrder, water, ob,
      confirmed: true,
      totalMoney: totalMoney || {},
      moneyDetails: moneyDetails || {},
      totalSpent: totalSpent || {},
    });
  }, [submitScores]);

  // Move to next hole
  const syncNextHole = useCallback(async (nextHole, nextHoleNum, gameState) => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/next`, 'PUT', {
      nextHole,
      nextHoleNum,
      ...gameState,
    });
    if (result.ok) {
      setRemoteGame(result.game);
      setConfirmed({ creator: false, joiner: false });
    }
    return result;
  }, [gameCode]);

  // Sync edit
  const syncEdit = useCallback(async (gameState) => {
    if (!gameCode) return { ok: false };
    const result = await apiCall(`/game/${gameCode}/edit`, 'PUT', gameState);
    if (result.ok) {
      setRemoteGame(result.game);
    }
    return result;
  }, [gameCode]);

  // Get players assigned to my role
  const getMyPlayers = useCallback((allPlayers) => {
    if (!multiplayerOn || !multiplayerRole) return allPlayers;
    return allPlayers.filter(p => claimed[p] === multiplayerRole);
  }, [multiplayerOn, multiplayerRole, claimed]);

  // Get players assigned to other role
  const getOtherPlayers = useCallback((allPlayers) => {
    if (!multiplayerOn || !multiplayerRole) return [];
    const otherRole = multiplayerRole === 'creator' ? 'joiner' : 'creator';
    return allPlayers.filter(p => claimed[p] === otherRole);
  }, [multiplayerOn, multiplayerRole, claimed]);

  // Check if other side has confirmed
  const isOtherConfirmed = useCallback(() => {
    const otherRole = multiplayerRole === 'creator' ? 'joiner' : 'creator';
    return confirmed[otherRole] || false;
  }, [multiplayerRole, confirmed]);

  const isBothConfirmed = useCallback(() => {
    return confirmed.creator && confirmed.joiner;
  }, [confirmed]);

  const isMyConfirmed = useCallback(() => {
    return confirmed[multiplayerRole] || false;
  }, [multiplayerRole, confirmed]);

  // Get scores from remote for other players' current hole
  const getRemoteHoleData = useCallback((holeNum) => {
    if (!remoteGame?.holes?.[holeNum]) return null;
    return remoteGame.holes[holeNum];
  }, [remoteGame]);

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
    setConfirmed({ creator: false, joiner: false });
    setClaimed({});
    setClaimChecked({});
    setMultiplayerSection(null);
    localStorage.removeItem('handincap_mp');
  }, [stopPolling]);

  // Check if joiner has claimed any players
  const joinerCount = Object.values(claimed).filter(v => v === 'joiner').length;

  return {
    // State
    multiplayerOn, setMultiplayerOn,
    multiplayerRole,
    gameCode,
    joinerCode, setJoinerCode,
    remoteGame,
    syncStatus,
    syncFlash,
    confirmed,
    claimed,
    claimChecked, setClaimChecked,
    multiplayerSection, setMultiplayerSection,
    joinerCount,
    deviceId: deviceId.current,
    
    // Actions
    createGame,
    joinGame,
    claimPlayers,
    startMultiplayerGame,
    submitScores,
    confirmMyScores,
    syncNextHole,
    syncEdit,
    resetMultiplayer,
    startPolling,
    stopPolling,
    
    // Helpers
    getMyPlayers,
    getOtherPlayers,
    isOtherConfirmed,
    isBothConfirmed,
    isMyConfirmed,
    getRemoteHoleData,
    setConfirmedFromHole: setConfirmed,
  };
}