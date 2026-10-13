'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Crosshair, MessageCircle, Send, Swords, Users, WifiOff, X } from 'lucide-react';
import { CHARACTERS, CHARACTER_ORDER } from '@/lib/characters';
import { CHAT_MAX_LENGTH, type CharacterId } from '@/lib/protocol';
import { getSocket } from '@/lib/net';
import { useTownStore } from '@/store/townStore';
import { useTownNet } from './TownNet';
import { PartyHUD } from './PartyHUD';
import type { PlayerSlot } from '@/lib/characters';

const STORAGE_KEY = 'szb:town-me';

interface TownHUDProps {
  onAdventure: () => void;
  onRecenter: () => void;
  onPartyStart: (slots: PlayerSlot[]) => void;
}

// Interface da cidade: entrada (nome + personagem), chat, pessoas online e botão de aventura
export function TownHUD({ onAdventure, onRecenter, onPartyStart }: TownHUDProps) {
  const me = useTownStore((s) => s.me);
  const setMe = useTownStore((s) => s.setMe);
  useTownNet();

  // Lembra o nome e o personagem neste aparelho
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMe(JSON.parse(saved));
    } catch {
      // sem armazenamento: pede de novo
    }
  }, [setMe]);

  if (!me) return <JoinTown onJoin={(m) => (setMe(m), saveMe(m))} />;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 p-3 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <h1 className="title-game text-3xl sm:text-4xl">Super Zion Brothers</h1>
          <OnlinePill />
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button className="btn-duo btn-green" onClick={onAdventure}>
            <Swords size={20} /> Aventura
          </button>
          <button className="btn-duo btn-white !px-3 !py-2 text-xs" onClick={onRecenter}>
            <Crosshair size={16} /> Centralizar
          </button>
          <button className="btn-duo btn-white !px-3 !py-2 text-xs" onClick={() => setMe(null)}>
            Trocar personagem
          </button>
        </div>
      </div>
      <ChatPanel />
      <PartyHUD onStart={onPartyStart} />
      <p className="pointer-events-none absolute bottom-3 right-3 hidden max-w-[260px] text-right text-xs font-bold text-white drop-shadow sm:block">
        Toque no chão para andar · arraste para girar · roda/pinça para zoom · botão direito ou 2 dedos para mover a câmera
      </p>
    </div>
  );
}

function saveMe(m: { name: string; character: CharacterId }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    // ignora
  }
}

function OnlinePill() {
  const connected = useTownStore((s) => s.connected);
  const count = useTownStore((s) => Object.keys(s.people).length);
  return (
    <div className="hud-pill w-fit text-sm">
      {connected ? (
        <>
          <Users size={16} className="text-[#58CC02]" /> {Math.max(1, count)} na cidade
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-[#FF4B4B]" /> Offline
        </>
      )}
    </div>
  );
}

function ChatPanel() {
  const messages = useTownStore((s) => s.messages);
  const connected = useTownStore((s) => s.connected);
  const [open, setOpen] = useState(true);
  const [text, setText] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const myId = getSocket().id;

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  // Em telas pequenas o chat começa fechado
  useEffect(() => {
    if (window.innerWidth < 640) setOpen(false);
  }, []);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || !connected) return;
    getSocket().emit('chat:send', clean);
    setText('');
  };

  if (!open)
    return (
      <button className="btn-duo btn-blue pointer-events-auto absolute bottom-4 left-4 !rounded-full !p-3" onClick={() => setOpen(true)}>
        <MessageCircle size={22} />
        {messages.length > 0 && <span className="text-xs">{messages.length}</span>}
      </button>
    );

  return (
    <div className="card-duo pointer-events-auto absolute bottom-3 left-3 flex w-[min(92vw,360px)] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b-2 border-[#E5E5E5] px-3 py-2">
        <span className="flex items-center gap-2 font-title text-lg">
          <MessageCircle size={18} className="text-[#1CB0F6]" /> Chat da cidade
        </span>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Fechar chat">
          <X size={18} />
        </button>
      </div>
      <div ref={list} className="flex max-h-48 flex-col gap-1.5 overflow-y-auto px-3 py-2 text-sm sm:max-h-64">
        {messages.length === 0 && <p className="py-4 text-center text-xs font-bold text-gray-400">Diga oi para quem está na cidade!</p>}
        {messages.map((m) => (
          <div key={m.id} className={m.from === myId ? 'self-end text-right' : ''}>
            <span className="text-xs font-extrabold" style={{ color: m.from === myId ? '#58A700' : '#1899D6' }}>
              {m.name}
            </span>
            <div className={`rounded-2xl px-3 py-1 font-semibold ${m.from === myId ? 'bg-[#D7FFB8] text-[#2B5900]' : 'bg-[#F0F9FF] text-[#4B4B4B]'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t-2 border-[#E5E5E5] p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, CHAT_MAX_LENGTH))}
          placeholder={connected ? 'Escreva uma mensagem...' : 'Sem conexão com o servidor'}
          disabled={!connected}
          className="min-w-0 flex-1 rounded-xl border-2 border-[#E5E5E5] bg-[#F7F7F7] px-3 py-2 text-sm font-semibold outline-none focus:border-[#1CB0F6]"
        />
        <button type="submit" className="btn-duo btn-blue !px-3 !py-2" disabled={!connected || !text.trim()} aria-label="Enviar">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function JoinTown({ onJoin }: { onJoin: (me: { name: string; character: CharacterId }) => void }) {
  const [name, setName] = useState('');
  const [character, setCharacter] = useState<CharacterId | null>(null);
  const ready = name.trim().length >= 2 && character;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-sky-900/30 p-4 backdrop-blur-sm">
      <div className="card-duo w-full max-w-xl p-6">
        <h1 className="title-game text-center text-4xl sm:text-5xl">Super Zion Brothers</h1>
        <p className="mt-2 text-center font-extrabold text-gray-500">Bem-vindo à cidade! Como você se chama?</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder="Seu nome"
          className="mt-4 w-full rounded-2xl border-2 border-b-4 border-[#E5E5E5] bg-[#F7F7F7] px-4 py-3 text-center text-xl font-extrabold outline-none focus:border-[#1CB0F6]"
        />
        <p className="mt-4 text-center text-sm font-extrabold uppercase text-gray-400">Escolha seu personagem</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHARACTER_ORDER.map((id) => (
            <button key={id} onClick={() => setCharacter(id)} className={`btn-duo !flex-col !gap-0 !px-2 !py-2 !normal-case ${character === id ? 'btn-green' : 'btn-white'}`}>
              <span className="font-title text-lg">{CHARACTERS[id].name}</span>
              <span className="text-[10px] opacity-80">{CHARACTERS[id].age}</span>
            </button>
          ))}
        </div>
        <button className="btn-duo btn-green mt-5 w-full" disabled={!ready} onClick={() => ready && onJoin({ name: name.trim(), character })}>
          Entrar na cidade
        </button>
      </div>
    </div>
  );
}
