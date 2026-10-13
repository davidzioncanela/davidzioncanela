'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Copy, Crown, Play, Plus, Share2, LogIn, WifiOff } from 'lucide-react';
import { getSocket, netSession, SERVER_URL, shareLink } from '@/lib/net';
import { useTownStore } from '@/store/townStore';
import { CHARACTERS, CHARACTER_ORDER, PlayerSlot } from '@/lib/characters';
import { ROOM_ALPHABET, ROOM_CODE_LENGTH, type CharacterId, type RoomState } from '@/lib/protocol';

interface OnlineLobbyProps {
  initialCode?: string;
  onStart: (slots: PlayerSlot[]) => void;
  onBack: () => void;
}

// Sala online: cria ou entra com o código de 4 caracteres (ou link), cada um escolhe um personagem
export function OnlineLobby({ initialCode, onStart, onBack }: OnlineLobbyProps) {
  const [connected, setConnected] = useState(false);
  const [failed, setFailed] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [code, setCode] = useState(initialCode ?? '');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const socket = getSocket();
  // Quem já está na cidade entra com o mesmo nome e personagem
  const me = useTownStore((s) => s.me);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setFailed(false);
    };
    const onFail = () => setFailed(true);
    const onState = (r: RoomState) => setRoom(r);
    const onError = (msg: string) => setError(msg);
    const onStartGame = ({ slots }: { slots: { character: CharacterId; memberId: string }[] }) => {
      const me = socket.id;
      netSession.active = true;
      // O primeiro da sala é sempre o anfitrião (host)
      netSession.isHost = slots[0]?.memberId === me;
      onStart(slots.map((s) => ({ character: s.character, input: 'solo', remote: s.memberId !== me })));
    };
    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('connect_error', onFail);
    socket.on('room:state', onState);
    socket.on('room:error', onError);
    socket.on('game:start', onStartGame);
    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onFail);
      socket.off('room:state', onState);
      socket.off('room:error', onError);
      socket.off('game:start', onStartGame);
    };
  }, [socket, onStart]);

  // Entrou pelo link: já tenta entrar na sala
  useEffect(() => {
    if (connected && initialCode && !room) join(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, initialCode]);

  const create = () =>
    socket.emit('room:create', me, (res) => {
      if (res.ok) {
        setRoom(res.room);
        setError('');
      } else setError(res.error);
    });

  const join = (value: string) =>
    socket.emit('room:join', value, me, (res) => {
      if (res.ok) {
        setRoom(res.room);
        setError('');
      } else setError(res.error);
    });

  const leave = () => {
    socket.emit('room:leave');
    setRoom(null);
    onBack();
  };

  const link = room ? shareLink(room.code) : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Não deu para copiar. Copie o link manualmente.');
    }
  };
  const share = () => navigator.share?.({ title: 'Super Zion Brothers', text: `Entra na minha sala! Código ${room?.code}`, url: link }).catch(() => undefined);

  const mine = room?.members.find((m) => m.id === socket.id);
  const allPicked = !!room && room.members.every((m) => m.character);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-sky-900/40 p-4 backdrop-blur-sm">
      <h1 className="title-game mb-4 text-center text-4xl sm:text-6xl">Jogar online</h1>

      {failed && !connected ? (
        <div className="card-duo max-w-md p-6 text-center">
          <WifiOff className="mx-auto text-[#FF4B4B]" size={40} />
          <p className="mt-2 font-extrabold">Não foi possível conectar ao servidor.</p>
          <p className="mt-1 break-all text-xs font-bold text-gray-400">{SERVER_URL}</p>
          <button className="btn-duo btn-white mt-4" onClick={onBack}>
            <ArrowLeft size={18} /> Voltar
          </button>
        </div>
      ) : !room ? (
        <div className="card-duo w-full max-w-md p-6">
          <button className="btn-duo btn-green w-full" disabled={!connected} onClick={create}>
            <Plus size={20} /> Criar sala
          </button>
          <div className="my-4 text-center text-sm font-extrabold uppercase text-gray-400">ou entre com o código</div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .toUpperCase()
                    .split('')
                    .filter((c) => ROOM_ALPHABET.includes(c))
                    .join('')
                    .slice(0, ROOM_CODE_LENGTH)
                )
              }
              placeholder="K7QF"
              inputMode="text"
              autoCapitalize="characters"
              className="w-full rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-[#F7F7F7] px-4 text-center font-title text-3xl font-bold tracking-[0.4em] text-[#4B4B4B] outline-none focus:border-[#1CB0F6]"
            />
            <button className="btn-duo btn-blue" disabled={!connected || code.length !== ROOM_CODE_LENGTH} onClick={() => join(code)}>
              <LogIn size={20} />
            </button>
          </div>
          {!connected && <p className="mt-3 text-center text-sm font-bold text-gray-400">Conectando...</p>}
          {error && <p className="mt-3 text-center text-sm font-extrabold text-[#FF4B4B]">{error}</p>}
          <button className="btn-duo btn-white mt-4 w-full" onClick={onBack}>
            <ArrowLeft size={18} /> Voltar
          </button>
        </div>
      ) : (
        <div className="card-duo w-full max-w-2xl p-5">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Código da sala</div>
              <div className="font-title text-5xl font-bold tracking-[0.25em] text-[#1CB0F6]">{room.code}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn-duo btn-white !px-3" onClick={copy}>
                {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copiado' : 'Copiar link'}
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button className="btn-duo btn-blue !px-3" onClick={share}>
                  <Share2 size={18} />
                </button>
              )}
            </div>
          </div>
          <p className="mt-1 break-all text-center text-xs font-bold text-gray-400 sm:text-left">{link}</p>

          <div className="mt-4 text-sm font-extrabold uppercase text-gray-400">Jogadores ({room.members.length}/4)</div>
          <div className="mt-1 flex flex-wrap gap-2">
            {room.members.map((m, i) => (
              <div key={m.id} className="hud-pill text-sm">
                {m.host && <Crown size={14} className="text-[#FFC800]" />}
                {m.id === socket.id ? 'Você' : m.name ?? `Jogador ${i + 1}`}: {m.character ? CHARACTERS[m.character].name : '...'}
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm font-extrabold uppercase text-gray-400">Escolha seu personagem</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CHARACTER_ORDER.map((id) => {
              const owner = room.members.find((m) => m.character === id);
              const mine = owner?.id === socket.id;
              return (
                <button
                  key={id}
                  disabled={!!owner && !mine}
                  onClick={() => socket.emit('room:pick', id)}
                  className={`btn-duo !flex-col !gap-0 !px-2 !py-2 !normal-case ${mine ? 'btn-green' : 'btn-white'}`}
                >
                  <span className="font-title text-lg">{CHARACTERS[id].name}</span>
                  <span className="text-[10px] opacity-80">{CHARACTERS[id].age}</span>
                </button>
              );
            })}
          </div>

          {error && <p className="mt-3 text-center text-sm font-extrabold text-[#FF4B4B]">{error}</p>}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button className="btn-duo btn-white sm:w-auto" onClick={leave}>
              <ArrowLeft size={18} /> Sair
            </button>
            {mine?.host ? (
              <button className="btn-duo btn-green flex-1" disabled={!allPicked} onClick={() => socket.emit('room:start')}>
                <Play size={18} /> Começar ({room.members.length} {room.members.length === 1 ? 'jogador' : 'jogadores'})
              </button>
            ) : (
              <div className="flex-1 rounded-2xl bg-[#DDF4FF] px-4 py-3 text-center text-sm font-extrabold text-[#1899D6]">Esperando o anfitrião começar...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
