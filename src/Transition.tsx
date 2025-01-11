import { cloneElement, type VNode } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import mergeRefs from "./utils/mergeRefs";
import reflow from "./utils/reflow";

const getDuration = (
  duration: TransitionProps["duration"] = 150,
  isAppearing: boolean,
): { enter: number; exit: number } => {
  if (typeof duration === "number") {
    return { enter: duration, exit: duration };
  }

  const { appear = 150, enter = 150, exit = 150 } = duration;
  return {
    enter: isAppearing ? appear : enter,
    exit,
  };
};

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
  duration?: number | { appear?: number; enter?: number; exit?: number };
  unmount?: boolean;
  onEnter?: (node?: HTMLElement, isAppearing?: boolean) => void;
  onEntering?: (node?: HTMLElement, isAppearing?: boolean) => void;
  onEntered?: (node?: HTMLElement, isAppearing?: boolean) => void;
  onExit?: (node?: HTMLElement) => void;
  onExiting?: (node?: HTMLElement) => void;
  onExited?: (node?: HTMLElement) => void;
};

// TODO: Add a function prop that manually triggers end phase
// TODO: Add support for state change via conditional render
export const Transition = ({
  children,
  in: inProp = true,
  appear = false,
  enter = true,
  exit = true,
  duration,
  unmount = false,
  ...eventHandlers
}: TransitionProps) => {
  const eventHandlersRef = useRef(eventHandlers);
  useLayoutEffect(() => {
    eventHandlersRef.current = eventHandlers;
  });

  const nodeRef = useRef<HTMLElement>();
  const isFirstMountRef = useRef(true);
  const isAppearingRef = useRef(appear);
  const durationRef = useRef(getDuration(duration, isAppearingRef.current));
  useLayoutEffect(() => {
    durationRef.current = getDuration(duration, isAppearingRef.current);
  }, [duration, isAppearingRef.current]);

  const [phase, setPhase] = useState(() =>
    inProp && !appear ? TransitionPhase.ENTERED : TransitionPhase.EXITED,
  );

  useEffect(() => {
    let timeoutId: number | undefined;
    const { onEnter, onEntering, onEntered, onExit, onExiting, onExited } =
      eventHandlersRef.current;
    switch (phase) {
      case TransitionPhase.ENTERING: {
        onEnter?.(nodeRef.current, isAppearingRef.current);
        reflow(nodeRef.current);
        onEntering?.(nodeRef.current, isAppearingRef.current);

        timeoutId = window.setTimeout(
          () => setPhase(TransitionPhase.ENTERED),
          durationRef.current.enter,
        );
        break;
      }
      case TransitionPhase.EXITING: {
        onExit?.(nodeRef.current);
        reflow(nodeRef.current);
        onExiting?.(nodeRef.current);

        timeoutId = window.setTimeout(
          () => setPhase(TransitionPhase.EXITED),
          durationRef.current.exit,
        );
        break;
      }
      case TransitionPhase.ENTERED: {
        onEntered?.(nodeRef.current, isAppearingRef.current);
        isAppearingRef.current = false;
        break;
      }
      case TransitionPhase.EXITED: {
        if (!isFirstMountRef.current) {
          onExited?.(nodeRef.current);
        }
        break;
      }
      default:
        break;
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

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

  useEffect(() => {
    isFirstMountRef.current = false;
  }, []);

  if (unmount && phase === TransitionPhase.EXITED) return null;

  const child = typeof children === "function" ? children(phase) : children;
  return cloneElement(child, {
    ref: mergeRefs(nodeRef, child.ref),
  });
};
