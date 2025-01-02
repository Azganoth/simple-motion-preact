/* istanbul ignore file */
import { useEffect, useState } from "preact/hooks";

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
