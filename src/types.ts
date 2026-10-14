// Format of the src/data/builds/<id>.json files. Documented in docs/data.md.

export type TierId = 'common' | 'uncommon' | 'legendary' | 'boss' | 'equipment' | 'lunar' | 'void';

/** 1 Essential · 2 High · 3 Medium · 4 Situational · 0 Avoid/careful (pt-BR labels in PRIO_LABEL) */
export type Prio = 0 | 1 | 2 | 3 | 4;

export interface BuildItem {
  /** icon slug in public/icons/<icon>.webp */
  icon: string;
  pt: string;
  /** exact English name, as in the game */
  en: string;
  prio: Prio;
  qty: string;
  effect: string;
  why: string;
}

export interface Section {
  id: TierId;
  name: string;
  color: string;
  intro: string;
  items: BuildItem[];
}

export interface Skill {
  slot: string;
  pt: string;
  en: string;
  /** pt-BR label shown to the reader; 'Recomendada' gets the accent highlight. */
  pick: 'Recomendada' | 'Variante' | 'Fixa' | 'Única opção' | string;
  spec: string;
  why: string;
}

/** One step of the pick order: take `n` copies of this item (exact English name, same rarity). */
export interface CommandStep {
  en: string;
  n: number;
  why: string;
}

export interface CommandTier {
  tier: TierId;
  steps: CommandStep[];
  /** what to do after the last step */
  then: string;
}

/** Pick order for the Artifact of Command (choosing the item from each essence). */
export interface CommandOrder {
  intro: string;
  tiers: CommandTier[];
}

export interface Build {
  id: string;
  name_pt: string;
  name_en: string;
  title: string;
  tagline: string;
  lede: string;
  loadout: { slot: string; skill: string }[];
  skills: Skill[];
  sections: Section[];
  synergy: { title: string; text: string }[];
  rotation: { step: string; text: string }[];
  essentials: { pt: string; en: string }[];
  situational_note: string;
  fallbacks: { pt: string; en: string; text: string }[];
  summary: string;
  checklist: { title: string; text: string }[];
  sources: { title: string; url: string }[];
  notes: string[];
  command?: CommandOrder;
}

/** Flattened item for the UI: includes the rarity and whether it is part of the core. */
export interface FlatItem extends BuildItem {
  tier: TierId;
  key: string;
  core: boolean;
}
