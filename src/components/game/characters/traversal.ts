import type { RapierRigidBody } from '@react-three/rapier';
import { bars, doors, pipes, ropes, waters } from '@/lib/traversal';
import { edgeDir, type PipeMaze } from '@/lib/pipeMaze';
import { sendEvent } from '@/lib/net';
import type { PlayerRuntime } from '@/lib/gameRuntime';
import { useGameStore } from '@/store/gameStore';

export type TraversalMode = 'normal' | 'bar' | 'rope' | 'pipe';

export interface TraversalState {
  mode: TraversalMode;
  barId: string | null;
  ropeId: string | null;
  ropeSeg: number;
  ropeClimb: number;
  pipeId: string | null;
  // No labirinto: parado num nó (edge = -1) ou andando numa ligação a partir de "from"
  pipeNode: number;
  pipeEdge: number;
  pipeFrom: number;
  pipeT: number;
  pipeV: number;
  // Evita agarrar de novo logo depois de soltar
  grabCooldown: number;
  breath: number;
  jumpEdge: boolean;
  upEdge: boolean;
}

export const newTraversalState = (): TraversalState => ({
  mode: 'normal',
  barId: null,
  ropeId: null,
  ropeSeg: 0,
  ropeClimb: 0,
  pipeId: null,
  pipeNode: 0,
  pipeEdge: -1,
  pipeFrom: 0,
  pipeT: 0,
  pipeV: 0,
  grabCooldown: 0,
  breath: 1,
  jumpEdge: false,
  upEdge: false,
});

export interface TraversalInput {
  dir: number;
  jump: boolean;
  jumpEdge: boolean;
  crouch: boolean;
  crouchEdge: boolean;
}

interface Ctx {
  body: RapierRigidBody;
  me: PlayerRuntime;
  t: TraversalState;
  input: TraversalInput;
  delta: number;
  grounded: boolean;
  height: number;
  onDrown: () => void;
}

const BAR_SPEED = 3;
const ROPE_PUSH = 0.9;
const CRAWL_SPEED = 4;
const LADDER_SPEED = 3.5;
// Diagonais molhadas: gravidade ao longo da rampa, força de quem empurra e pouco atrito
const SLOPE_GRAVITY = 14;
const SLOPE_PUSH = 11;
const SLOPE_DRAG = 0.6;
const BREATH_SECONDS = 10;

// Retorna a animação quando o modo especial controlou o personagem neste frame (ou null)
export function updateTraversal(ctx: Ctx): { anim: string; vx?: number; vy?: number } | null {
  const { body, t, input, delta, height } = ctx;
  t.grabCooldown = Math.max(0, t.grabCooldown - delta);
  const pos = body.translation();

  // ---------- Pendurado em barra/galho ----------
  if (t.mode === 'bar') {
    const bar = t.barId ? bars.get(t.barId) : null;
    if (!bar || input.crouchEdge || pos.x < bar.x1 - 0.2 || pos.x > bar.x2 + 0.2) return release(ctx, 0, 0);
    if (input.jumpEdge) return release(ctx, input.dir * 5, 9);
    body.setTranslation({ x: pos.x, y: bar.y - height - 0.1, z: 0 }, true);
    body.setLinvel({ x: input.dir * BAR_SPEED, y: 0, z: 0 }, true);
    return { anim: input.dir ? 'Walking_B' : 'Jump_Idle', vx: input.dir * BAR_SPEED, vy: 0 };
  }

  // ---------- Agarrado na corda ----------
  if (t.mode === 'rope') {
    const rope = t.ropeId ? ropes.get(t.ropeId) : null;
    const seg = rope?.segments[t.ropeSeg];
    if (!rope || !seg) return release(ctx, 0, 0);
    const sv = seg.linvel();
    if (input.jumpEdge) return release(ctx, sv.x * 1.2 + input.dir * 4, 10);
    if (input.crouchEdge) return release(ctx, sv.x, 0);
    // Empurrar a corda para balançar
    if (input.dir) seg.applyImpulse({ x: input.dir * ROPE_PUSH * delta * 10, y: 0, z: 0 }, true);
    // Subir/descer pela corda segurando ↑/↓ (com um pequeno intervalo entre segmentos)
    t.ropeClimb -= delta;
    const climb = input.jump ? -1 : input.crouch ? 1 : 0;
    if (climb && t.ropeClimb <= 0) {
      t.ropeSeg = Math.max(1, Math.min(rope.segments.length - 1, t.ropeSeg + climb));
      t.ropeClimb = 0.18;
    }
    const sp = rope.segments[t.ropeSeg].translation();
    body.setTranslation({ x: sp.x, y: sp.y - height * 0.75, z: 0 }, true);
    body.setLinvel({ x: sv.x, y: sv.y, z: 0 }, true);
    return { anim: 'Jump_Idle', vx: sv.x, vy: sv.y };
  }

  // ---------- Dentro do labirinto de canos ----------
  if (t.mode === 'pipe') {
    const maze = t.pipeId ? pipes.get(t.pipeId) : null;
    if (!maze) return exitPipe(ctx, pos.x, pos.y + 1);
    const inp = { x: input.dir, y: input.jump ? 1 : input.crouch ? -1 : 0 };
    const len = Math.hypot(inp.x, inp.y);

    if (t.pipeEdge === -1) {
      // Parado num nó: escolhe a ligação que mais aponta para onde o jogador quer ir
      if (len) {
        let best = -1;
        let bestDot = 0.5;
        for (const e of maze.links[t.pipeNode]) {
          const d = edgeDir(maze, e, t.pipeNode);
          const dot = (d.dx * inp.x + d.dy * inp.y) / len;
          if (dot > bestDot) {
            bestDot = dot;
            best = e;
          }
        }
        if (best >= 0) {
          t.pipeEdge = best;
          t.pipeFrom = t.pipeNode;
          t.pipeT = 0;
          t.pipeV = 0;
        }
      }
    }

    let anim = 'Sit_Floor_Pose';
    if (t.pipeEdge !== -1) {
      const e = maze.edges[t.pipeEdge];
      const d = edgeDir(maze, t.pipeEdge, t.pipeFrom);
      const along = d.dx * inp.x + d.dy * inp.y;
      if (e.kind === 'escada') {
        t.pipeV = Math.sign(d.dy) * inp.y * LADDER_SPEED;
        anim = t.pipeV ? 'Walking_B' : 'Jump_Idle';
      } else if (e.kind === 'reto') {
        const target = along * CRAWL_SPEED;
        t.pipeV += Math.sign(target - t.pipeV) * Math.min(Math.abs(target - t.pipeV), 30 * delta);
        anim = t.pipeV ? 'Walking_C' : 'Sit_Floor_Pose';
      } else {
        // Física escorregadia: desce sozinho com água; para subir tem que empurrar (e escorrega se soltar)
        const accel = along * SLOPE_PUSH - d.dy * SLOPE_GRAVITY - SLOPE_DRAG * t.pipeV;
        t.pipeV += accel * delta;
        anim = t.pipeV * d.dy < 0 ? 'Jump_Idle' : 'Running_A';
      }
      t.pipeT += t.pipeV * delta;
      if (t.pipeT >= e.length) {
        const result = arriveAt(ctx, maze, d.to, t.pipeV, { dx: d.dx, dy: d.dy });
        if (result) return result;
      } else if (t.pipeT <= 0) {
        const result = arriveAt(ctx, maze, t.pipeFrom, -t.pipeV, { dx: -d.dx, dy: -d.dy });
        if (result) return result;
      }
    }

    // Posição do personagem no labirinto
    let px: number;
    let py: number;
    if (t.pipeEdge === -1) {
      px = maze.nodes[t.pipeNode].x;
      py = maze.nodes[t.pipeNode].y;
    } else {
      const d = edgeDir(maze, t.pipeEdge, t.pipeFrom);
      const from = maze.nodes[t.pipeFrom];
      px = from.x + d.dx * t.pipeT;
      py = from.y + d.dy * t.pipeT;
      if (d.dx) ctx.me.facing = (d.dx * Math.sign(t.pipeV || 1) > 0 ? 1 : -1) as 1 | -1;
    }
    body.setTranslation({ x: px, y: py - 0.45, z: 0 }, true);
    return { anim, vx: 0, vy: 0 };
  }

  // ---------- Modo normal: procura algo para agarrar/entrar ----------
  const store = useGameStore.getState();

  // Portas: ↑ perto da porta leva para a porta de destino
  if (ctx.grounded && input.jumpEdge) {
    for (const door of doors.values()) {
      if (Math.abs(pos.x - door.x) < 0.8 && Math.abs(pos.y - door.y) < 0.8) {
        const target = doors.get(door.target);
        if (!target) continue;
        store.fade();
        body.setTranslation({ x: target.x, y: target.y + 0.3, z: 0 }, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        ctx.t.jumpEdge = false;
        return { anim: 'Interact', vx: 0, vy: 0 };
      }
    }
  }

  // Canos: agachar em cima de uma boca entra no labirinto
  if (ctx.grounded && input.crouchEdge) {
    for (const maze of pipes.values()) {
      for (const mouth of [maze.entrance, maze.exit]) {
        const n = maze.nodes[mouth];
        if (Math.abs(pos.x - n.x) < 0.8 && Math.abs(pos.y - n.y) < 1) {
          t.mode = 'pipe';
          t.pipeId = maze.id;
          t.pipeNode = mouth;
          t.pipeEdge = -1;
          t.pipeV = 0;
          body.setEnabled(false);
          visitNode(ctx, maze, mouth);
          return { anim: 'Sit_Floor_Pose', vx: 0, vy: 0 };
        }
      }
    }
  }

  if (!ctx.grounded && t.grabCooldown <= 0) {
    // Barras e galhos: as mãos (topo da cabeça) alcançam a barra
    const hands = pos.y + height;
    for (const bar of bars.values()) {
      if (pos.x >= bar.x1 - 0.1 && pos.x <= bar.x2 + 0.1 && hands > bar.y - 0.35 && hands < bar.y + 0.5) {
        t.mode = 'bar';
        t.barId = bar.id;
        body.setGravityScale(0, true);
        return { anim: 'Jump_Idle', vx: 0, vy: 0 };
      }
    }
    // Cordas: encostar num segmento agarra
    for (const rope of ropes.values()) {
      for (let i = 1; i < rope.segments.length; i++) {
        const sp = rope.segments[i].translation();
        if (Math.abs(sp.x - pos.x) < 0.55 && sp.y > pos.y + height * 0.3 && sp.y < pos.y + height * 1.2) {
          t.mode = 'rope';
          t.ropeId = rope.id;
          t.ropeSeg = i;
          body.setGravityScale(0, true);
          rope.segments[i].applyImpulse({ x: body.linvel().x * 0.3, y: 0, z: 0 }, true);
          return { anim: 'Jump_Idle', vx: 0, vy: 0 };
        }
      }
    }
  }

  // ---------- Natação ----------
  let inWater = false;
  for (const w of waters.values()) {
    if (pos.x > w.x1 && pos.x < w.x2 && pos.y < w.surface && pos.y + height > w.bottom) {
      inWater = true;
      const v = body.linvel();
      const headUnder = pos.y + height < w.surface;
      // Empuxo: afunda devagar; ↑ dá braçadas
      let vy = Math.max(v.y + 19 * delta, -2.5);
      if (input.jumpEdge) vy = 5.5;
      if (!headUnder && input.jump) vy = Math.max(vy, 9);
      const vx = input.dir * 3.5;
      body.setLinvel({ x: vx, y: vy, z: 0 }, true);
      // Fôlego: acaba embaixo d'água, volta na superfície
      t.breath = headUnder ? t.breath - delta / BREATH_SECONDS : Math.min(1, t.breath + delta / 2);
      if (t.breath <= 0) {
        t.breath = 1;
        ctx.onDrown();
      }
      store.setBreath(ctx.me.id, t.breath);
      return { anim: input.dir || input.jumpEdge ? 'Running_B' : 'Jump_Idle', vx, vy };
    }
  }
  if (!inWater && t.breath < 1) {
    t.breath = 1;
    store.setBreath(ctx.me.id, 1);
  }
  return null;
}

function release(ctx: Ctx, vx: number, vy: number) {
  const { body, t } = ctx;
  t.mode = 'normal';
  t.barId = null;
  t.ropeId = null;
  t.grabCooldown = 0.35;
  body.setGravityScale(1, true);
  body.setLinvel({ x: vx, y: vy, z: 0 }, true);
  return { anim: 'Jump_Idle', vx, vy };
}

// Chegou num nó: marca como descoberto, pega recompensas e decide se continua escorregando
function arriveAt(ctx: Ctx, maze: PipeMaze, node: number, speed: number, dir: { dx: number; dy: number }) {
  const { t } = ctx;
  visitNode(ctx, maze, node);
  const n = maze.nodes[node];
  if (n.mouth) return exitPipe(ctx, n.x, n.y + 0.4);
  t.pipeNode = node;
  t.pipeEdge = -1;
  t.pipeV = 0;
  // Embalo de escorregador: segue para a ligação que continua na mesma direção
  if (Math.abs(speed) > 2.5) {
    for (const e of maze.links[node]) {
      const d = edgeDir(maze, e, node);
      if (d.dx * dir.dx + d.dy * dir.dy > 0.7) {
        t.pipeEdge = e;
        t.pipeFrom = node;
        t.pipeT = 0;
        t.pipeV = Math.abs(speed) * 0.8;
        break;
      }
    }
  }
  return null;
}

// Cada ponto novo descoberto vale pontos; becos sem saída guardam recompensas
function visitNode(ctx: Ctx, maze: PipeMaze, node: number) {
  const store = useGameStore.getState();
  if (store.discover(maze.id, node)) store.addScore(10);
  const reward = maze.rewards.find((r) => r.node === node);
  if (!reward) return;
  const key = `maze:${maze.id}:${node}`;
  if (store.pickedUp.includes(key)) return;
  store.markPicked(key);
  if (reward.kind === 'moedas') for (let i = 0; i < 3; i++) store.addCoin();
  else if (reward.kind === 'bonus') store.addScore(300);
  else if (reward.powerUp) store.setPowerUp(ctx.me.id, reward.powerUp);
  sendEvent({ type: 'pickup', key, by: ctx.me.id, powerUp: reward.powerUp });
}

function exitPipe(ctx: Ctx, x: number, y: number) {
  const { body, t } = ctx;
  t.mode = 'normal';
  t.pipeId = null;
  body.setEnabled(true);
  body.setTranslation({ x, y, z: 0 }, true);
  body.setLinvel({ x: 0, y: 8, z: 0 }, true);
  return { anim: 'Jump_Idle', vx: 0, vy: 8 };
}
