import { lazy, Suspense } from 'react';
import { useDebug } from '../hooks/useDebug';

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(d => ({
    default: d.ReactQueryDevtoolsProduction,
  }))
);

export function QueryDevtools() {
  const isDebug = useDebug();

  if (!isDebug) return null;

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtoolsProduction />
    </Suspense>
  );
}
