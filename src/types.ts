// Formato dos arquivos em src/data/builds/<id>.json. Documentado em docs/data.md.

export type TierId = 'comum' | 'incomum' | 'lendario' | 'chefe' | 'equipamento' | 'lunar' | 'vazio';

/** 1 Essencial · 2 Alta · 3 Média · 4 Situacional · 0 Evitar/cuidado */
export type Prio = 0 | 1 | 2 | 3 | 4;

export interface BuildItem {
  /** slug do ícone em public/icons/<icon>.webp */
  icon: string;
  pt: string;
  /** nome exato em inglês, como no jogo */
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
  pick: 'Recomendada' | 'Variante' | 'Fixa' | 'Única opção' | string;
  spec: string;
  why: string;
}

/** Um passo da ordem de compra: pegue `n` cópias deste item (nome exato em inglês, da mesma raridade). */
export interface CommandStep {
  en: string;
  n: number;
  why: string;
}

export interface CommandTier {
  tier: TierId;
  steps: CommandStep[];
  /** o que fazer depois do último passo */
  then: string;
}

/** Ordem de compra para o Artefato da Autoridade (Artifact of Command) (escolher o item de cada essência). */
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

/** Item achatado para a UI: inclui a raridade e se faz parte do núcleo. */
export interface FlatItem extends BuildItem {
  tier: TierId;
  key: string;
  core: boolean;
}
