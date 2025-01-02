import { cloneElement, type VNode } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import mergeRefs from "./utils/mergeRefs";
import reflow from "./utils/reflow";

export enum TransitionPhase {
  ENTERING = "entering",
  ENTERED = "entered",
  EXITING = "exiting",
  EXITED = "exited",
}

export type TransitionProps = {
  children: ((phase: TransitionPhase) => VNode<any>) | VNode<any>;
  in?: boolean;
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
  duration?: number;
  unmount?: boolean;
  onEnter?: (node?: HTMLElement) => void;
  onEntering?: (node?: HTMLElement) => void;
  onEntered?: (node?: HTMLElement) => void;
  onExit?: (node?: HTMLElement) => void;
  onExiting?: (node?: HTMLElement) => void;
  onExited?: (node?: HTMLElement) => void;
};

// TODO: Add `isAppearing` parameter to each enter handler
// TODO: Add support for individual duration (appear, enter, exit)
// TODO: Add a function prop that manually triggers end phase
// TODO: Add support for state change via conditional render
export const Transition = ({
  children,
  in: inProp = true,
  appear = false,
  enter = true,
  exit = true,
  duration = 150,
  unmount = false,
  ...eventHandlers
}: TransitionProps) => {
  const eventHandlersRef = useRef(eventHandlers);
  useLayoutEffect(() => {
    eventHandlersRef.current = eventHandlers;
  });

  const nodeRef = useRef<HTMLElement>();

  const [phase, setPhase] = useState(() =>
    inProp && !appear ? TransitionPhase.ENTERED : TransitionPhase.EXITED,
  );

  useEffect(() => {
    let timeoutId: number | undefined;
    const { onEnter, onEntering, onEntered, onExit, onExiting, onExited } =
      eventHandlersRef.current;
    switch (phase) {
      case TransitionPhase.ENTERING: {
        onEnter?.(nodeRef.current);
        reflow(nodeRef.current);
        onEntering?.(nodeRef.current);

        timeoutId = window.setTimeout(
          () => setPhase(TransitionPhase.ENTERED),
          duration,
        );
        break;
      }
      case TransitionPhase.EXITING: {
        onExit?.(nodeRef.current);
        reflow(nodeRef.current);
        onExiting?.(nodeRef.current);

        timeoutId = window.setTimeout(
          () => setPhase(TransitionPhase.EXITED),
          duration,
        );
        break;
      }
      case TransitionPhase.ENTERED: {
        onEntered?.(nodeRef.current);
        break;
      }
      case TransitionPhase.EXITED: {
        onExited?.(nodeRef.current);
        break;
      }
      default:
        break;
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase, duration]);

  useLayoutEffect(() => {
    setPhase((prevPhase) => {
      if (inProp) {
        if (
          prevPhase !== TransitionPhase.ENTERING &&
          prevPhase !== TransitionPhase.ENTERED
        ) {
          return enter ? TransitionPhase.ENTERING : TransitionPhase.ENTERED;
        }
      } else {
        if (
          prevPhase !== TransitionPhase.EXITING &&
          prevPhase !== TransitionPhase.EXITED
        ) {
          return exit ? TransitionPhase.EXITING : TransitionPhase.EXITED;
        }
      }

      return prevPhase;
    });
  }, [inProp, enter, exit]);

  if (unmount && phase === TransitionPhase.EXITED) return null;

  const child = typeof children === "function" ? children(phase) : children;
  return cloneElement(child, {
    ref: mergeRefs(nodeRef, child.ref),
  });
};
