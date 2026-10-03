// ─────────────────────────────────────────────────────────────
// AI cliché detector. These patterns are NOT banned: a pattern is
// only flagged when the child's request does not call for it
// (`unlessRequested`). Add patterns here; keep them language-aware.
// ─────────────────────────────────────────────────────────────
export interface ClichePattern {
  id: string;
  pattern: RegExp;
  /** if the request matches this, the element is wanted, not a default */
  unlessRequested?: RegExp;
  layer: 'writer' | 'architect' | 'concept';
  note: string;
}

export const CLICHES: ClichePattern[] = [
  { id: 'from-that-day', pattern: /von diesem tag an|seit diesem tag|and from that day on|from that day forward|à partir de ce jour|depuis ce jour/i, layer: 'writer', note: 'formula ending "from that day on"' },
  { id: 'dream-ending', pattern: /(alles )?nur ein traum|all (just )?a dream|qu'?un rêve|n’était qu’un rêve/i, unlessRequested: /traum|dream|rêve/i, layer: 'architect', note: '"it was all a dream" ending' },
  { id: 'explicit-moral', pattern: /\b(lernte|hatte gelernt|verstand nun|wusste jetzt),? dass\b|\blearn(ed|t) that\b|\bthe lesson\b|\ba (appris|compris) que\b|\bla leçon\b/i, layer: 'writer', note: 'explicit moral sentence' },
  { id: 'magic-door', pattern: /(geheim|zauber|magisch|klein)\w*\s+tür|magic(al)? door|secret door|porte (magique|secrète)/i, unlessRequested: /tür|door|porte|portal/i, layer: 'concept', note: 'default magical door' },
  { id: 'glowing-object', pattern: /(leuchtend|glühend|schimmernd)\w*\s+(stein|kristall|kugel|ei)|glowing (stone|crystal|orb|egg)|(pierre|cristal|orbe) (lumineu|brillant)/i, unlessRequested: /stein|kristall|crystal|stone|pierre/i, layer: 'concept', note: 'mysterious glowing object' },
  { id: 'enchanted-forest', pattern: /zauberwald|verzauberte[nm]? wald|enchanted (forest|wood)|forêt enchantée/i, unlessRequested: /wald|forest|forêt/i, layer: 'concept', note: 'generic enchanted forest' },
  { id: 'chosen-one', pattern: /auserwählt|the chosen one|chosen child|l['’]élu/i, layer: 'concept', note: 'chosen child' },
  { id: 'wise-elder', pattern: /weise[rn]? (alte|eule|mann|frau)|wise old|vieux sage|vieille sage/i, unlessRequested: /eule|owl|hibou|opa|oma|grand/i, layer: 'architect', note: 'generic wise elder' },
  { id: 'souvenir-proof', pattern: /(lag|war) (noch )?(immer )?(eine?|ein) .{0,30}(auf dem (nachttisch|fensterbrett)|in (der|seiner|ihrer) (tasche|hand))|still (had|held) the .{0,30}(in (her|his|their) pocket|on the windowsill)|toujours (dans sa poche|sur le rebord)/i, layer: 'architect', note: 'souvenir proving it really happened' },
  { id: 'everyone-helps', pattern: /alle halfen (plötzlich|sofort) mit|suddenly everyone helped|tout le monde aida soudain/i, layer: 'architect', note: 'everyone suddenly helps' },
];

const GLOW = /leucht|glitzer|funkel|schimmer|strahlend|glüh|glow|sparkl|shimmer|gleam|twinkl|radian|scintill|lumineu|étincel|brillai/gi;

export function detectCliches(text: string, request: string): Array<{ id: string; layer: ClichePattern['layer']; note: string }> {
  const found: Array<{ id: string; layer: ClichePattern['layer']; note: string }> = [];
  for (const c of CLICHES) {
    if (c.pattern.test(text) && !(c.unlessRequested && c.unlessRequested.test(request))) found.push({ id: c.id, layer: c.layer, note: c.note });
  }
  const words = text.split(/\s+/).length;
  const glow = (text.match(GLOW) ?? []).length;
  if (glow / Math.max(1, words) > 0.012 && !/licht|light|lumière|leucht|glow/i.test(request))
    found.push({ id: 'glow-overload', layer: 'writer', note: `too much glowing/sparkling imagery (${glow}×)` });
  return found;
}
