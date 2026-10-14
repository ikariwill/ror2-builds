import { useBuildState, useMedia } from './useBuildState.ts';
import { Desktop } from './views/Desktop.tsx';
import { Mobile } from './views/Mobile.tsx';

/** Below 760px the page switches to the mobile layout (bottom tabs + detail sheet). */
export default function App() {
  const state = useBuildState();
  const mobile = useMedia('(max-width: 760px)');
  return mobile ? <Mobile {...state} /> : <Desktop {...state} />;
}
