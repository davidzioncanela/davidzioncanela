'use client';

import { useEffect } from 'react';
import { Crown, LogOut, Play, UserPlus, Users, X } from 'lucide-react';
import { getSocket, netSession } from '@/lib/net';
import { CHARACTERS, CHARACTER_ORDER, PlayerSlot } from '@/lib/characters';
import type { CharacterId, RoomState } from '@/lib/protocol';
import { usePartyStore } from '@/store/partyStore';
import { useTownStore } from '@/store/townStore';

// Liga a party ao servidor: estado da sala, convites recebidos e início da partida
function usePartyNet(onStart: (slots: PlayerSlot[]) => void) {
  useEffect(() => {
    const socket = getSocket();
    const party = usePartyStore.getState;
    const onState = (room: RoomState) => party().setRoom(room.members.some((m) => m.id === socket.id) ? room : null);
    const onInvite = party().addInvite;
    const onError = party().setError;
    const onGame = ({ slots }: { slots: { character: CharacterId; memberId: string }[] }) => {
      netSession.active = true;
      netSession.isHost = slots[0]?.memberId === socket.id;
      onStart(slots.map((s) => ({ character: s.character, input: 'solo', remote: s.memberId !== socket.id })));
    };
    socket.on('room:state', onState);
    socket.on('party:invited', onInvite);
    socket.on('room:error', onError);
    socket.on('game:start', onGame);
    return () => {
      socket.off('room:state', onState);
      socket.off('party:invited', onInvite);
      socket.off('room:error', onError);
      socket.off('game:start', onGame);
    };
  }, [onStart]);
}

export function PartyHUD({ onStart }: { onStart: (slots: PlayerSlot[]) => void }) {
  usePartyNet(onStart);
  return (
    <>
      <SelectedPerson />
      <Invites />
      <PartyPanel />
    </>
  );
}

// Tocou em alguém na cidade: cartão para convidar para a party
function SelectedPerson() {
  const selected = usePartyStore((s) => s.selected);
  const person = useTownStore((s) => (selected ? s.people[selected] : undefined));
  const me = useTownStore((s) => s.me);
  const room = usePartyStore((s) => s.room);
  if (!person || !me) return null;
  const inParty = room?.members.some((m) => m.id === person.id);

  const invite = () => {
    const socket = getSocket();
    const send = () => socket.emit('party:invite', person.id);
    if (room) send();
    else
      socket.emit('room:create', me, (res) => {
        if (!res.ok) return usePartyStore.getState().setError(res.error);
        usePartyStore.getState().setRoom(res.room);
        send();
      });
    usePartyStore.getState().select(null);
  };

  return (
    <div className="card-duo pointer-events-auto absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 px-4 py-3 shadow-xl">
      <div>
        <div className="font-title text-lg font-bold">{person.name}</div>
        <div className="text-xs font-bold text-gray-400">{CHARACTERS[person.character].name}</div>
      </div>
      {inParty ? (
        <span className="text-sm font-extrabold text-[#58CC02]">Já está na party</span>
      ) : (
        <button className="btn-duo btn-green !px-3 !py-2 text-sm" onClick={invite}>
          <UserPlus size={16} /> Convidar para a party
        </button>
      )}
      <button className="text-gray-400" onClick={() => usePartyStore.getState().select(null)} aria-label="Fechar">
        <X size={18} />
      </button>
    </div>
  );
}

// Convites recebidos
function Invites() {
  const invites = usePartyStore((s) => s.invites);
  const me = useTownStore((s) => s.me);
  if (!invites.length || !me) return null;
  const inv = invites[invites.length - 1];

  const accept = () => {
    getSocket().emit('room:join', inv.code, me, (res) => {
      if (!res.ok) return usePartyStore.getState().setError(res.error);
      usePartyStore.getState().setRoom(res.room);
    });
    usePartyStore.getState().dropInvite(inv.fromId);
  };

  return (
    <div className="card-duo pointer-events-auto absolute left-1/2 top-24 z-50 w-[min(92vw,380px)] -translate-x-1/2 p-4 text-center shadow-2xl">
      <Users className="mx-auto text-[#1CB0F6]" size={28} />
      <p className="mt-1 font-extrabold">
        <span className="text-[#1CB0F6]">{inv.fromName}</span> te convidou para a party!
      </p>
      <div className="mt-3 flex gap-2">
        <button className="btn-duo btn-white flex-1 !py-2" onClick={() => usePartyStore.getState().dropInvite(inv.fromId)}>
          Agora não
        </button>
        <button className="btn-duo btn-green flex-1 !py-2" onClick={accept}>
          Entrar
        </button>
      </div>
    </div>
  );
}

// Painel da party: integrantes, personagem de cada um e o botão de começar do líder
function PartyPanel() {
  const room = usePartyStore((s) => s.room);
  const error = usePartyStore((s) => s.error);
  const socket = getSocket();
  if (!room) return null;
  const mine = room.members.find((m) => m.id === socket.id);
  const allPicked = room.members.every((m) => m.character);
  const leave = () => {
    socket.emit('room:leave');
    usePartyStore.getState().setRoom(null);
  };

  return (
    <div className="card-duo pointer-events-auto absolute right-3 top-44 z-40 w-[min(92vw,280px)] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 font-title text-lg font-bold">
          <Users size={18} className="text-[#CE82FF]" /> Party ({room.members.length}/4)
        </span>
        <button onClick={leave} className="flex items-center gap-1 text-xs font-extrabold text-gray-400 hover:text-[#FF4B4B]">
          <LogOut size={14} /> Sair
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {room.members.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl bg-[#F7F7F7] px-2 py-1 text-sm font-extrabold">
            <span className="flex items-center gap-1">
              {m.host && <Crown size={14} className="text-[#FFC800]" />}
              {m.id === socket.id ? 'Você' : m.name ?? 'Jogador'}
            </span>
            <span className={m.character ? 'text-[#1899D6]' : 'text-[#FF4B4B]'}>{m.character ? CHARACTERS[m.character].name : 'escolhendo...'}</span>
          </div>
        ))}
      </div>
      {!mine?.character && (
        <div className="mt-2">
          <p className="text-xs font-extrabold text-[#FF4B4B]">Seu personagem já está na party: escolha outro.</p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {CHARACTER_ORDER.filter((id) => !room.members.some((m) => m.character === id)).map((id) => (
              <button key={id} className="btn-duo btn-white !px-2 !py-1 text-xs !normal-case" onClick={() => socket.emit('room:pick', id)}>
                {CHARACTERS[id].name}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs font-extrabold text-[#FF4B4B]">{error}</p>}
      {mine?.host ? (
        <button className="btn-duo btn-green mt-3 w-full !py-2" disabled={!allPicked} onClick={() => socket.emit('room:start')}>
          <Play size={16} /> Começar aventura
        </button>
      ) : (
        <div className="mt-3 rounded-2xl bg-[#DDF4FF] px-3 py-2 text-center text-xs font-extrabold text-[#1899D6]">Esperando o líder começar...</div>
      )}
      <p className="mt-2 text-center text-[10px] font-bold text-gray-400">Toque em alguém na cidade para convidar · código {room.code}</p>
    </div>
  );
}
