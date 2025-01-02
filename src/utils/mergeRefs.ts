import type { Ref, RefCallback } from "preact";

const mergeRefs =
  <T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T> =>
  (instance) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref != null) {
        ref.current = instance;
      }
    });
  };

export default mergeRefs;
