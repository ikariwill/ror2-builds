import { useBuildState, useMedia } from './useBuildState.ts';
import { Desktop } from './views/Desktop.tsx';
import { Mobile } from './views/Mobile.tsx';

/** Abaixo de 760px a página vira o layout de celular (abas embaixo + folha de detalhe). */
export default function App() {
  const state = useBuildState();
  const mobile = useMedia('(max-width: 760px)');
  return mobile ? <Mobile {...state} /> : <Desktop {...state} />;
}
