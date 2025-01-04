import { cloneElement, h, type VNode } from "preact";
import {
  Transition,
  TransitionPhase,
  type TransitionProps,
} from "./Transition";

const createClassUpdater =
  (action: "add" | "remove") => (node: HTMLElement, classes?: string) => {
    const classNames = classes?.split(" ").filter(Boolean);
    if (classNames && classNames.length > 0) {
      node.classList[action](...classNames);
    }
  };

const addClasses = createClassUpdater("add");
const delClasses = createClassUpdater("remove");

export type CSSTransitionProps = Omit<TransitionProps, "children"> & {
  children: VNode<any>;
  name?: string;
} & CSSTransitionClasses;

export type CSSTransitionClasses = {
  activeClass?: string;
  fromClass?: string;
  toClass?: string;
  enterFromClass?: string;
  enterActiveClass?: string;
  enterToClass?: string;
  leaveFromClass?: string;
  leaveActiveClass?: string;
  leaveToClass?: string;
};

// TODO: Add support for function children
// TODO: Add custom classes for `appear`
export const CSSTransition = ({
  children,
  name,
  activeClass,
  fromClass,
  toClass,
  enterFromClass = fromClass,
  enterActiveClass = activeClass,
  enterToClass = toClass,
  leaveFromClass = toClass,
  leaveActiveClass = activeClass,
  leaveToClass = fromClass,
  onEnter,
  onEntering,
  onEntered,
  onExit,
  onExiting,
  onExited,
  ...rest
}: CSSTransitionProps) => {
  const classes: Record<
    | "enterFrom"
    | "enterActive"
    | "enterTo"
    | "leaveFrom"
    | "leaveActive"
    | "leaveTo",
    string | undefined
  > = name
    ? {
        enterFrom: `${name}-enter-from`,
        enterActive: `${name}-enter-active`,
        enterTo: `${name}-enter-to`,
        leaveFrom: `${name}-leave-from`,
        leaveActive: `${name}-leave-active`,
        leaveTo: `${name}-leave-to`,
      }
    : {
        enterFrom: enterFromClass,
        enterActive: enterActiveClass,
        enterTo: enterToClass,
        leaveFrom: leaveFromClass,
        leaveActive: leaveActiveClass,
        leaveTo: leaveToClass,
      };

  const phaseClassMap = {
    [TransitionPhase.ENTERING]: classes.enterFrom,
    [TransitionPhase.EXITING]: classes.leaveFrom,
    [TransitionPhase.ENTERED]: classes.enterTo,
    [TransitionPhase.EXITED]: classes.leaveTo,
  };

  return h(Transition, {
    ...rest,
    onEnter: (node) => {
      if (node) {
        delClasses(node, classes.leaveTo);
        addClasses(node, classes.enterFrom);
      }
      onEnter?.(node);
    },
    onEntering: (node) => {
      if (node) {
        addClasses(node, classes.enterActive);
        delClasses(node, classes.enterFrom);
        addClasses(node, classes.enterTo);
      }
      onEntering?.(node);
    },
    onEntered: (node) => {
      if (node) {
        delClasses(node, classes.enterActive);
      }
      onEntered?.(node);
    },
    onExit: (node) => {
      if (node) {
        delClasses(node, classes.enterTo);
        addClasses(node, classes.leaveFrom);
      }
      onExit?.(node);
    },
    onExiting: (node) => {
      if (node) {
        addClasses(node, classes.leaveActive);
        delClasses(node, classes.leaveFrom);
        addClasses(node, classes.leaveTo);
      }
      onExiting?.(node);
    },
    onExited: (node) => {
      if (node) {
        delClasses(node, classes.leaveActive);
      }
      onExited?.(node);
    },
    children: (phase) =>
      cloneElement(children, {
        class: children.props.class
          ? `${children.props.class} ${phaseClassMap[phase]}`
          : phaseClassMap[phase],
      }),
  });
};
