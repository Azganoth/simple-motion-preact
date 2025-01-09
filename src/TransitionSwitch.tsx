import { cloneElement, type VNode } from "preact";
import { useEffect, useState } from "preact/hooks";
import { type TransitionProps } from "./Transition";

type TransitionChild = VNode<TransitionProps>;

export type TransitionSwitchProps = {
  children?: TransitionChild;
};

export const TransitionSwitch = ({ children }: TransitionSwitchProps) => {
  const [renderableChild, setRenderableChild] = useState(children);

  const switchChild = (prev: TransitionChild, next?: TransitionChild) =>
    cloneElement(prev, {
      in: false,
      onExited: (node) => {
        setRenderableChild(next);
        prev.props.onExited?.(node);
      },
    } satisfies Partial<TransitionProps>);

  useEffect(() => {
    setRenderableChild((prevChild) => {
      if (!children) {
        return prevChild && switchChild(prevChild);
      }
      if (prevChild && prevChild.key !== children.key) {
        return switchChild(prevChild, children);
      }

      return children;
    });
  }, [children]);

  return renderableChild;
};
