import type { CoverImage, CoverScene, CoverSubject, CreatureId, SettingId } from '../../types/story';
import { seededRandom } from '../../utils/id';

/**
 * Illustrated demo covers, painted as SVG on the device.
 * Each scene combines a world, the companion creature and the little light.
 * The child is deliberately never depicted (privacy, inclusion: every child
 * can imagine themselves). Titles are set by the <StoryCover> component.
 */
type Palette = CoverImage['palette'] & { sky: string; ground: string; accent: string };

const PALETTES: Record<SettingId, Palette> = {
  space: { deep: '#13213F', mid: '#2B5B83', glow: '#FFC56E', sky: '#1C3560', ground: '#CFC8D9', accent: '#F2A65A' },
  ocean: { deep: '#0C3A50', mid: '#2C8791', glow: '#FFD98A', sky: '#7CCBC2', ground: '#E9D3A6', accent: '#F28C7A' },
  forest: { deep: '#1D4436', mid: '#5F8E62', glow: '#FFC56E', sky: '#F3C690', ground: '#2E5B45', accent: '#E9925F' },
};

function paletteFor(scene: CoverScene): Palette {
  const p = { ...PALETTES[scene.setting] };
  if (scene.mood === 'bedtime' || scene.mood === 'calm') {
    p.sky = scene.setting === 'forest' ? '#C9A3A0' : p.deep;
    p.mid = shade(p.mid, -0.18);
  }
  if (scene.mood === 'funny') p.accent = '#F7B538';
  return p;
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + c * amount)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const light = (x: number, y: number, r: number, glow: string) => `
  <g>
    <circle cx="${x}" cy="${y}" r="${r * 3.2}" fill="url(#lightHalo)" />
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#lightCore)" />
    <circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.28}" fill="#FFF9EC" opacity="0.9" />
    <circle cx="${x}" cy="${y}" r="${r * 1.6}" fill="none" stroke="${glow}" stroke-opacity="0.25" stroke-width="1.5" />
  </g>`;

// ── creatures (drawn around 0,0, roughly 260 × 220, facing right) ─────────
function creature(id: CreatureId): string {
  if (id === 'dino') {
    return `
    <path d="M-55 18 Q-120 8 -165 -30 Q-140 30 -50 48 Z" fill="#6AAE7C"/>
    <ellipse cx="0" cy="20" rx="72" ry="52" fill="#7DBE8B"/>
    <ellipse cx="8" cy="36" rx="46" ry="30" fill="#CFE8B6"/>
    <path d="M-38 -24 l10 -22 l12 20 M-6 -32 l12 -22 l12 22 M26 -26 l12 -18 l8 22" fill="#5E9E70" stroke="#5E9E70" stroke-width="6" stroke-linejoin="round"/>
    <rect x="-44" y="52" width="26" height="38" rx="12" fill="#6AAE7C"/>
    <rect x="22" y="52" width="26" height="38" rx="12" fill="#6AAE7C"/>
    <ellipse cx="50" cy="-26" rx="24" ry="48" transform="rotate(28 50 -26)" fill="#7DBE8B"/>
    <ellipse cx="80" cy="-80" rx="42" ry="33" fill="#7DBE8B"/>
    <circle cx="-20" cy="8" r="7" fill="#5E9E70" opacity=".7"/><circle cx="-38" cy="24" r="5" fill="#5E9E70" opacity=".7"/>
    <circle cx="94" cy="-88" r="9" fill="#FFFFFF"/><circle cx="96" cy="-87" r="5" fill="#1B2638"/><circle cx="98" cy="-89" r="1.8" fill="#fff"/>
    <ellipse cx="96" cy="-64" rx="9" ry="5" fill="#F29C8A" opacity=".55"/>
    <path d="M104 -70 q10 6 18 -2" stroke="#3E6E50" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  if (id === 'dragon') {
    return `
    <path d="M-20 -10 Q-90 -110 -150 -70 Q-110 -60 -100 -20 Q-80 -50 -60 -10 Z" fill="#F6D3C2" opacity=".92"/>
    <path d="M-55 30 Q-130 40 -150 -10 l-16 -4 l8 18 l-10 10 l18 -2 Q-120 70 -50 52 Z" fill="#E07F66"/>
    <ellipse cx="0" cy="22" rx="66" ry="50" fill="#E8846B"/>
    <ellipse cx="10" cy="36" rx="40" ry="28" fill="#F6C59F"/>
    <rect x="-40" y="52" width="24" height="34" rx="11" fill="#D9735B"/>
    <rect x="20" y="52" width="24" height="34" rx="11" fill="#D9735B"/>
    <circle cx="64" cy="-40" r="44" fill="#E8846B"/>
    <path d="M44 -78 l-6 -26 l20 18 Z M74 -82 l4 -26 l12 22 Z" fill="#F7B538"/>
    <ellipse cx="96" cy="-30" rx="22" ry="16" fill="#F0977D"/>
    <circle cx="104" cy="-34" r="2.5" fill="#7A3B2E"/>
    <circle cx="74" cy="-50" r="9" fill="#fff"/><circle cx="76" cy="-49" r="5" fill="#1B2638"/><circle cx="78" cy="-51" r="1.8" fill="#fff"/>
    <ellipse cx="66" cy="-22" rx="9" ry="5" fill="#F7B538" opacity=".5"/>
    <circle cx="138" cy="-62" r="10" fill="none" stroke="#FFF4E6" stroke-width="4" opacity=".75"/>
    <circle cx="160" cy="-88" r="7" fill="none" stroke="#FFF4E6" stroke-width="3" opacity=".55"/>`;
  }
  return `
    <path d="M-30 60 Q-120 80 -150 30 Q-90 50 -40 34 Z" fill="#8E5E40"/>
    <ellipse cx="0" cy="20" rx="52" ry="72" fill="#A0704F"/>
    <ellipse cx="4" cy="34" rx="34" ry="50" fill="#E8C9A8"/>
    <ellipse cx="-26" cy="88" rx="20" ry="11" fill="#8E5E40"/><ellipse cx="30" cy="88" rx="20" ry="11" fill="#8E5E40"/>
    <circle cx="6" cy="-74" r="46" fill="#A0704F"/>
    <circle cx="-30" cy="-108" r="12" fill="#8E5E40"/><circle cx="42" cy="-108" r="12" fill="#8E5E40"/>
    <ellipse cx="10" cy="-56" rx="28" ry="20" fill="#E8C9A8"/>
    <ellipse cx="10" cy="-66" rx="9" ry="6" fill="#3B2A22"/>
    <circle cx="-12" cy="-84" r="8" fill="#fff"/><circle cx="-11" cy="-83" r="4.6" fill="#1B2638"/><circle cx="-9.5" cy="-85" r="1.6" fill="#fff"/>
    <circle cx="32" cy="-84" r="8" fill="#fff"/><circle cx="33" cy="-83" r="4.6" fill="#1B2638"/><circle cx="34.5" cy="-85" r="1.6" fill="#fff"/>
    <path d="M-14 -56 l-34 -6 M-14 -50 l-32 4 M34 -56 l34 -6 M34 -50 l32 4" stroke="#5B4033" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="-24" cy="10" rx="13" ry="9" fill="#8E5E40"/><ellipse cx="32" cy="10" rx="13" ry="9" fill="#8E5E40"/>`;
}

// ── worlds ─────────────────────────────────────────────────────────────────
function spaceWorld(p: Palette, rnd: () => number): string {
  const stars = Array.from({ length: 70 }, () => {
    const r = 0.6 + rnd() * 1.8;
    return `<circle cx="${(rnd() * 600).toFixed(1)}" cy="${(rnd() * 560).toFixed(1)}" r="${r.toFixed(2)}" fill="#FFF6E0" opacity="${(0.35 + rnd() * 0.65).toFixed(2)}"/>`;
  }).join('');
  const threads = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 13) * Math.PI * 2 + rnd() * 0.2;
    const len = 80 + rnd() * 50;
    const x = 300 + Math.cos(a) * len, y = 300 + Math.sin(a) * len * 0.9;
    return `<line x1="300" y1="300" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#FFE9C2" stroke-opacity=".55" stroke-width="1.6"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${p.glow}" opacity=".18"/>
      <rect x="${(x - 7).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="14" height="12" rx="4" fill="#FFF1D6"/>
      <rect x="${(x - 2.5).toFixed(1)}" y="${(y - 2).toFixed(1)}" width="5" height="5" rx="1" fill="${p.glow}"/>`;
  }).join('');
  return `
    <rect width="600" height="800" fill="url(#bg)"/>
    ${stars}
    <circle cx="488" cy="140" r="78" fill="${p.accent}"/>
    <path d="M410 130 Q488 160 566 150" stroke="#FCD9A8" stroke-width="10" fill="none" opacity=".55"/>
    <ellipse cx="488" cy="146" rx="132" ry="26" fill="none" stroke="#FFE3B8" stroke-width="5" opacity=".7" transform="rotate(-12 488 146)"/>
    ${threads}
    <circle cx="300" cy="300" r="34" fill="${p.glow}" opacity=".25"/>
    <circle cx="300" cy="300" r="20" fill="#FFF1D6"/>
    <g transform="translate(110 470) rotate(-18)">
      <ellipse cx="0" cy="0" rx="40" ry="30" fill="#E9EEF5"/>
      <ellipse cx="0" cy="-12" rx="22" ry="16" fill="#9FD3E6"/>
      <circle cx="-22" cy="8" r="4" fill="${p.accent}"/><circle cx="0" cy="12" r="4" fill="#7FB7E6"/><circle cx="22" cy="8" r="4" fill="${p.accent}"/>
      <path d="M-14 28 Q0 56 14 28 Z" fill="${p.glow}" opacity=".9"/>
    </g>
    <ellipse cx="300" cy="930" rx="560" ry="300" fill="${p.ground}"/>
    <ellipse cx="160" cy="690" rx="44" ry="12" fill="#B9B1C6"/><ellipse cx="470" cy="720" rx="56" ry="14" fill="#B9B1C6"/>
    <ellipse cx="380" cy="660" rx="22" ry="6" fill="#B9B1C6"/>`;
}

function oceanWorld(p: Palette, rnd: () => number): string {
  const rays = [70, 210, 360, 500].map((x) => `<polygon points="${x},0 ${x + 60},0 ${x - 40 + rnd() * 30},800 ${x - 120},800" fill="#FFFFFF" opacity=".07"/>`).join('');
  const bubbles = Array.from({ length: 26 }, () => {
    const r = 3 + rnd() * 9;
    return `<circle cx="${(rnd() * 600).toFixed(1)}" cy="${(rnd() * 600).toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="#E8FFFB" stroke-opacity="${(0.3 + rnd() * 0.5).toFixed(2)}" stroke-width="2"/>`;
  }).join('');
  const houses = [80, 180, 300, 420, 520].map((x, i) => {
    const h = 60 + rnd() * 70;
    const y = 590 - h;
    return `<path d="M${x - 46} 600 L${x - 46} ${y + 40} Q${x} ${y - 30} ${x + 46} ${y + 40} L${x + 46} 600 Z" fill="${i % 2 ? '#F1B8A4' : '#F6D8C0'}" opacity=".9"/>
      <circle cx="${x}" cy="${y + 50}" r="9" fill="${p.glow}"/>`;
  }).join('');
  const jellies = [130, 330, 470].map((x, i) => {
    const y = 200 + i * 70 + rnd() * 40;
    return `<g opacity=".95"><circle cx="${x}" cy="${y}" r="34" fill="${p.glow}" opacity=".18"/>
      <path d="M${x - 22} ${y} Q${x} ${y - 34} ${x + 22} ${y} Z" fill="#FFE8F0"/>
      <path d="M${x - 14} ${y} q4 16 0 30 M${x} ${y} q-4 18 0 34 M${x + 14} ${y} q4 16 0 30" stroke="#FFE8F0" stroke-width="2.5" fill="none"/></g>`;
  }).join('');
  const weeds = [40, 90, 520, 565].map((x) => `<path d="M${x} 800 Q${x - 30} 700 ${x + 6} 640 Q${x + 30} 590 ${x - 4} 540" stroke="#3E9A7E" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('');
  return `
    <rect width="600" height="800" fill="url(#bg)"/>
    ${rays}${bubbles}${jellies}${houses}${weeds}
    <ellipse cx="300" cy="900" rx="560" ry="260" fill="${p.ground}"/>
    <ellipse cx="140" cy="700" rx="30" ry="9" fill="#D9BE8C"/><ellipse cx="460" cy="730" rx="40" ry="10" fill="#D9BE8C"/>`;
}

function forestWorld(p: Palette, rnd: () => number): string {
  const trunks = [70, 250, 470].map((x) => `<rect x="${x - 26}" y="160" width="52" height="560" rx="20" fill="#5B4636"/>`).join('');
  const canopies = [70, 250, 470].map((x) =>
    [0, 1, 2].map((j) => `<circle cx="${x - 50 + j * 50 + rnd() * 20}" cy="${150 + rnd() * 40 - j * 10}" r="${70 + rnd() * 20}" fill="${j % 2 ? p.mid : shade(p.mid, -0.15)}"/>`).join(''),
  ).join('');
  const bridge = (x1: number, x2: number, y: number) => {
    const planks = Array.from({ length: 9 }, (_, i) => {
      const t = (i + 1) / 10;
      const x = x1 + (x2 - x1) * t;
      const yy = y + Math.sin(Math.PI * t) * 34;
      return `<rect x="${(x - 7).toFixed(1)}" y="${(yy - 3).toFixed(1)}" width="14" height="7" rx="2" fill="#C99A6B"/>`;
    }).join('');
    return `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 68} ${x2} ${y}" stroke="#E6C9A1" stroke-width="3" fill="none"/>${planks}`;
  };
  const shrooms = [130, 190, 400, 540].map((x) => {
    const y = 690 + rnd() * 30;
    return `<circle cx="${x}" cy="${y - 14}" r="22" fill="${p.glow}" opacity=".22"/>
      <rect x="${x - 4}" y="${y - 14}" width="8" height="18" rx="3" fill="#FFF1DA"/>
      <path d="M${x - 15} ${y - 12} Q${x} ${y - 34} ${x + 15} ${y - 12} Z" fill="${p.accent}"/>`;
  }).join('');
  const fireflies = Array.from({ length: 18 }, () => `<circle cx="${(rnd() * 600).toFixed(1)}" cy="${(260 + rnd() * 340).toFixed(1)}" r="${(1.5 + rnd() * 2).toFixed(1)}" fill="#FFE9A8" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`).join('');
  return `
    <rect width="600" height="800" fill="url(#bg)"/>
    <path d="M0 520 Q150 440 300 500 T600 470 V800 H0 Z" fill="${shade(p.mid, 0.12)}" opacity=".6"/>
    ${trunks}${canopies}
    ${bridge(96, 224, 330)}${bridge(276, 444, 380)}
    <rect x="236" y="300" width="30" height="24" rx="6" fill="#E9C99F"/><rect x="246" y="308" width="9" height="9" rx="2" fill="${p.glow}"/>
    ${fireflies}
    <path d="M0 640 Q300 600 600 650 V800 H0 Z" fill="${p.ground}"/>
    ${shrooms}`;
}


// ── Story Engine V2 subjects (dedicated compositions) ──────────────────────
const SUBJECT_PALETTES: Record<CoverSubject, CoverImage['palette']> = {
  digger: { deep: '#2F4B6E', mid: '#7FB3C8', glow: '#FFC56E' },
  park: { deep: '#22305C', mid: '#7E5C8A', glow: '#FFC56E' },
  cat: { deep: '#18223F', mid: '#3A4C7F', glow: '#FFD98A' },
  crocodile: { deep: '#2E5B5A', mid: '#8CC7B5', glow: '#FFC56E' },
  abstract: { deep: '#1D2B52', mid: '#4C5E94', glow: '#FFC56E' },
};

function subjectWorld(subject: CoverSubject, rnd: () => number): string {
  if (subject === 'abstract') {
    // neutral cover for live stories without an image provider: it claims nothing about the plot
    const stars = Array.from({ length: 50 }, () => `<circle cx="${(rnd() * 600).toFixed(0)}" cy="${(rnd() * 520).toFixed(0)}" r="${(0.7 + rnd() * 1.6).toFixed(1)}" fill="#FFF3DC" opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"/>`).join('');
    const shapes = Array.from({ length: 5 }, (_, i) => {
      const y = 430 + i * 70 + rnd() * 30;
      const shades = ['#2E3F70', '#27365F', '#212E52', '#1B2646', '#151E3A'];
      return `<path d="M0 ${y} C 150 ${y - 60 - rnd() * 60}, 330 ${y + 40 - rnd() * 60}, 600 ${y - 30 - rnd() * 50} V800 H0 Z" fill="${shades[i]}"/>`;
    }).join('');
    return `<rect width="600" height="800" fill="url(#bg)"/>${stars}${shapes}`;
  }
  if (subject === 'digger') {
    return `
    <rect width="600" height="800" fill="url(#bg)"/>
    <circle cx="470" cy="150" r="54" fill="#FFE2A0"/>
    <rect x="40" y="250" width="150" height="190" rx="8" fill="#E9D6C2"/><rect x="70" y="285" width="44" height="54" rx="6" fill="#FFF3D6" stroke="#B88A62" stroke-width="5"/>
    <path d="M0 560 Q300 520 600 560 V800 H0 Z" fill="#C9A47A"/>
    <path d="M330 600 Q420 520 520 600 Z" fill="#9B7650"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${20 + i * 66}" y="500" width="10" height="90" fill="#E7843C"/><rect x="${20 + i * 66}" y="520" width="66" height="8" fill="#F3F0E8"/>`).join('')}
    <g transform="translate(150 520)">
      <rect x="-20" y="80" width="250" height="60" rx="30" fill="#3B3F4A"/>
      ${[10, 60, 110, 160, 205].map((x) => `<circle cx="${x}" cy="110" r="16" fill="#6B7180"/>`).join('')}
      <rect x="10" y="10" width="190" height="78" rx="12" fill="#F6B92B"/>
      <rect x="40" y="-70" width="110" height="90" rx="12" fill="#F6B92B"/>
      <rect x="58" y="-56" width="74" height="56" rx="8" fill="#BFE6F2"/>
      <circle cx="96" cy="-24" r="14" fill="#E9C9A8"/><path d="M80 -32 Q96 -54 112 -32 Z" fill="#E86F2C"/>
      <g transform="rotate(-38 190 20)"><rect x="180" y="0" width="190" height="34" rx="14" fill="#F2A91F"/></g>
      <g transform="rotate(42 330 -100)"><rect x="320" y="-110" width="140" height="28" rx="12" fill="#F2A91F"/></g>
      <path d="M380 -10 l70 0 l-10 60 l-60 0 Z" fill="#B7791F"/>
      ${[390, 405, 420, 435].map((x) => `<path d="M${x} 50 l6 14 l6 -14 Z" fill="#8A5A17"/>`).join('')}
    </g>`;
  }
  if (subject === 'park') {
    const spokes = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const x = 420 + Math.cos(a) * 130, y = 330 + Math.sin(a) * 130;
      return `<line x1="420" y1="330" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#F3D9C6" stroke-width="3"/><rect x="${(x - 12).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="24" height="20" rx="6" fill="${i % 2 ? '#F28C7A' : '#7CCBC2'}"/>`;
    }).join('');
    const stars = Array.from({ length: 30 }, () => `<circle cx="${(rnd() * 600).toFixed(0)}" cy="${(rnd() * 260).toFixed(0)}" r="${(0.8 + rnd() * 1.4).toFixed(1)}" fill="#FFF3DC" opacity=".8"/>`).join('');
    return `
    <rect width="600" height="800" fill="url(#bg)"/>${stars}
    <circle cx="420" cy="330" r="130" fill="none" stroke="#F3D9C6" stroke-width="6"/>${spokes}
    <path d="M420 330 L360 560 M420 330 L480 560" stroke="#F3D9C6" stroke-width="8"/>
    <path d="M-20 300 C 80 120, 160 420, 260 240 S 380 360, 640 200" fill="none" stroke="#FFE3B8" stroke-width="7"/>
    <path d="M232 258 l20 -14 l4 16 Z M248 246 l20 -6 l-10 14 Z" fill="#FFFFFF"/>
    <path d="M60 640 L170 470 L280 640 Z" fill="#E86F5C"/><path d="M118 640 L170 470 L222 640 Z" fill="#F6E6D2"/>
    <circle cx="170" cy="462" r="9" fill="#FFC56E"/>
    <path d="M0 640 Q300 600 600 650 V800 H0 Z" fill="#1E2A4F"/>
    <g transform="translate(300 600)"><rect x="-34" y="-6" width="68" height="12" rx="4" fill="#1B2638"/><rect x="-22" y="-56" width="44" height="52" rx="4" fill="#1B2638"/><rect x="-22" y="-20" width="44" height="8" fill="#E86F5C"/></g>`;
  }
  if (subject === 'cat') {
    return `
    <rect width="600" height="800" fill="#2A2238"/>
    <rect x="90" y="110" width="420" height="440" rx="18" fill="url(#bg)" stroke="#6B5A4A" stroke-width="18"/>
    <line x1="300" y1="110" x2="300" y2="550" stroke="#6B5A4A" stroke-width="12"/><line x1="90" y1="330" x2="510" y2="330" stroke="#6B5A4A" stroke-width="12"/>
    <circle cx="420" cy="200" r="44" fill="#FFF1C9"/><circle cx="406" cy="190" r="8" fill="#EBD9A8"/>
    <path d="M110 520 L180 450 L250 520 Z" fill="#141A30"/><rect x="128" y="500" width="104" height="30" fill="#141A30"/>
    <rect x="60" y="550" width="480" height="40" rx="8" fill="#8A6E58"/>
    <g transform="translate(300 470)">
      <path d="M-40 80 Q-80 40 -60 -10 Q-70 -60 -40 -80 L-30 -110 L-10 -86 Q0 -90 10 -86 L30 -110 L40 -80 Q70 -60 60 -10 Q80 40 40 80 Z" fill="#8C8C96"/>
      <path d="M40 70 Q110 60 100 0" fill="none" stroke="#8C8C96" stroke-width="16" stroke-linecap="round"/>
      <path d="M-8 -60 Q0 -70 8 -60 L0 -50 Z" fill="#F4F1EC"/>
      <ellipse cx="-20" cy="-66" rx="7" ry="4" fill="#E8D27A"/><ellipse cx="20" cy="-66" rx="7" ry="4" fill="#E8D27A"/>
    </g>
    <g transform="translate(470 520)"><rect x="-46" y="-34" width="92" height="56" rx="12" fill="#3B4C7A"/><rect x="-36" y="-24" width="72" height="34" rx="6" fill="#15203A"/>
      <text x="0" y="0" text-anchor="middle" font-family="monospace" font-size="20" fill="#FFC56E">23:59</text></g>
    <path d="M0 590 H600 V800 H0 Z" fill="#3A2F45"/>`;
  }
  // crocodile
  return `
    <rect width="600" height="800" fill="url(#bg)"/>
    <rect x="300" y="170" width="260" height="380" rx="10" fill="#F2EDE6"/>
    ${[0, 1].map((r) => [0, 1].map((col) => `<rect x="${330 + col * 110}" y="${260 + r * 120}" width="80" height="80" rx="8" fill="#CFE8F0"/>`).join('')).join('')}
    <g transform="translate(430 205)"><path d="M-24 -18 Q0 -34 24 -18 Q30 10 16 30 Q10 14 0 14 Q-10 14 -16 30 Q-30 10 -24 -18 Z" fill="#FFFFFF" stroke="#7CCBC2" stroke-width="4"/></g>
    <path d="M0 600 H600 V800 H0 Z" fill="#7C8792"/><rect x="0" y="590" width="600" height="14" fill="#C9CED4"/>
    <g transform="translate(70 520)">
      <path d="M0 80 Q10 30 70 26 L120 0 Q190 -14 250 10 L300 30 Q340 40 345 80 Z" fill="#F4A6C1"/>
      <path d="M130 6 L180 0 Q215 2 240 22 L140 26 Z" fill="#CFE8F0"/>
      <circle cx="80" cy="84" r="26" fill="#2B2B33"/><circle cx="80" cy="84" r="10" fill="#C9CED4"/>
      <circle cx="270" cy="84" r="26" fill="#2B2B33"/><circle cx="270" cy="84" r="10" fill="#C9CED4"/>
      <g transform="translate(170 -6)">
        <path d="M0 0 Q20 -40 60 -36 L150 -26 Q160 -14 150 -6 L40 6 Z" fill="#5E9E70"/>
        <path d="M60 -10 L150 -16" stroke="#3E6E50" stroke-width="3"/>
        ${[70, 86, 102, 118, 134].map((x) => `<path d="M${x} -12 l5 8 l5 -8 Z" fill="#FFFFFF"/>`).join('')}
        <circle cx="40" cy="-30" r="8" fill="#FFFFFF"/><circle cx="42" cy="-30" r="4" fill="#1B2638"/>
        <path d="M8 -36 L60 -50 L70 -38 L14 -26 Z" fill="#B8865B"/><path d="M20 -44 h40 M24 -38 h36" stroke="#8A5E3B" stroke-width="2"/>
      </g>
    </g>`;
}

export function createIllustratedCover(scene: CoverScene): CoverImage {
  const p = paletteFor(scene);
  const rnd = seededRandom(scene.seed || 1);
  if (scene.subject) return subjectCover(scene.subject, rnd);
  const world = scene.setting === 'space' ? spaceWorld(p, rnd) : scene.setting === 'ocean' ? oceanWorld(p, rnd) : forestWorld(p, rnd);
  const creatureX = scene.setting === 'space' ? 290 : 300;
  const creatureY = scene.setting === 'forest' ? 640 : 660;
  const lightPos = scene.setting === 'space' ? [420, 548] : [420, 530];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${scene.setting === 'space' ? p.deep : p.sky}"/>
      <stop offset="0.7" stop-color="${scene.setting === 'space' ? p.sky : p.mid}"/>
      <stop offset="1" stop-color="${scene.setting === 'ocean' ? p.deep : p.mid}"/>
    </linearGradient>
    <radialGradient id="lightCore"><stop offset="0" stop-color="#FFFBEF"/><stop offset=".55" stop-color="${p.glow}"/><stop offset="1" stop-color="#F59E3D"/></radialGradient>
    <radialGradient id="lightHalo"><stop offset="0" stop-color="${p.glow}" stop-opacity=".55"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
  </defs>
  ${world}
  <ellipse cx="${creatureX}" cy="${creatureY + 92}" rx="110" ry="16" fill="#000" opacity=".12"/>
  <g transform="translate(${creatureX} ${creatureY}) scale(1.05)">${creature(scene.creature)}</g>
  ${light(lightPos[0], lightPos[1], 17, p.glow)}
</svg>`;

  return {
    kind: 'illustration',
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    palette: { deep: p.deep, mid: p.mid, glow: p.glow },
  };
}

function subjectCover(subject: CoverSubject, rnd: () => number): CoverImage {
  const pal = SUBJECT_PALETTES[subject];
  const sky: Record<CoverSubject, [string, string]> = {
    digger: ['#A9D8EA', '#F6DDBD'],
    park: ['#1E2A55', '#E9A27A'],
    cat: ['#1A2547', '#3E5288'],
    crocodile: ['#BFE6EE', '#F3E2C9'],
    abstract: ['#16224A', '#5E5A8E'],
  };
  const [top, bottom] = sky[subject];
  const lightAt: Record<CoverSubject, [number, number]> = { digger: [520, 420], park: [120, 200], cat: [200, 210], crocodile: [120, 200], abstract: [300, 330] };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
    <radialGradient id="lightCore"><stop offset="0" stop-color="#FFFBEF"/><stop offset=".55" stop-color="${pal.glow}"/><stop offset="1" stop-color="#F59E3D"/></radialGradient>
    <radialGradient id="lightHalo"><stop offset="0" stop-color="${pal.glow}" stop-opacity=".55"/><stop offset="1" stop-color="${pal.glow}" stop-opacity="0"/></radialGradient>
  </defs>
  ${subjectWorld(subject, rnd)}
  ${light(lightAt[subject][0], lightAt[subject][1], 14, pal.glow)}
</svg>`;
  return { kind: 'illustration', src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, palette: pal };
}
