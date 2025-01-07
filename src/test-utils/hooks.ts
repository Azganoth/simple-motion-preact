/* istanbul ignore file */
import { useEffect, useMemo, useState } from "preact/hooks";

export const useAutoToggle = (interval: number, initial = true) => {
  const [state, setState] = useState(initial);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setState((prevState) => !prevState);
    }, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  return state;
};

export const useMultiAutoToggle = (...intervals: number[]) => {
  const toggles = intervals.map((interval) => useAutoToggle(interval));
  return useMemo(() => toggles, [...toggles]);
};
