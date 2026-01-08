import { useEffect, useState } from "react";

type UseDebugProps = {
  excludedHosts?: string[];
};

export function useDebug({ excludedHosts }: UseDebugProps = {}) {
  const [isDebug, setIsDebug] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      const isHostExcluded = excludedHosts?.includes(window.location.hostname);
      const isDebugHash = window.location.hash === "#debug";

      setIsDebug(isDebugHash && !isHostExcluded);
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, [excludedHosts]);

  return isDebug;
}
