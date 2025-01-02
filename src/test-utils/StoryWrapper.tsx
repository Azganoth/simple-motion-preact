/* istanbul ignore file */
import type { FunctionComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

const StoryWrapper: FunctionComponent = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;

        setDimensions((prevDimensions) => ({
          width: Math.max(prevDimensions.width, width),
          height: Math.max(prevDimensions.height, height),
        }));
      }
    });

    resizeObserver.observe(wrapper);
    return () => resizeObserver.disconnect();
  }, [wrapperRef.current]);

  return (
    <div
      ref={wrapperRef}
      class="story-wrapper"
      style={{
        minWidth: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
      }}
    >
      {children}
    </div>
  );
};

export default StoryWrapper;
