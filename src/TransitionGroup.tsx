import { cloneElement, type FunctionComponent, type VNode } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { type TransitionProps } from "./Transition";

type TransitionChild = VNode<TransitionProps>;
type TransitionChildren = TransitionChild | TransitionChild[];

export type TransitionGroupProps = {
  children?: TransitionChildren;
} & Pick<TransitionProps, "appear" | "enter" | "exit">;

// TODO: Ignore children without 'key', print warning in console
// TODO: Add support for 'in' prop from children
// TODO: Fix 'onExited' callback nested? calls
export const TransitionGroup: FunctionComponent<TransitionGroupProps> = ({
  children,
  appear,
  enter,
  exit,
}: TransitionGroupProps) => {
  const activeChildKeys = useRef(new Set<any>());
  const [renderableChildren, setRenderableChildren] = useState<
    TransitionChild[]
  >([]);

  const createRenderableChild = useCallback(
    (child: TransitionChild, isExiting?: boolean) => {
      activeChildKeys.current.add(child.key);
      return cloneElement(child, {
        in: isExiting ? false : child.props.in,
        appear: appear ?? child.props.appear,
        enter: enter ?? child.props.enter,
        exit: exit ?? child.props.exit,
        onExited: (node) => {
          child.props.onExited?.(node);
          if (activeChildKeys.current.has(child.key)) {
            activeChildKeys.current.delete(child.key);
            setRenderableChildren((prev) =>
              prev.filter((prevChild) => prevChild.key !== child.key),
            );
          }
        },
      } satisfies Partial<TransitionProps>);
    },
    [appear, enter, exit],
  );

  useEffect(() => {
    const currChildren = children
      ? (Array.isArray(children) ? children : [children]).filter(
          (child) => child.key != null,
        )
      : [];

    const currChildrenIndexes = new Map<any, number>();
    for (let i = 0; i < currChildren.length; i++) {
      currChildrenIndexes.set(currChildren[i].key, i);
    }

    setRenderableChildren((prevChildren) => {
      activeChildKeys.current = new Set();
      const nextChildren: TransitionChild[] = [];

      let lastCurrChildAdded = 0;
      for (const prevChild of prevChildren) {
        const prevKey = prevChild.key;
        const currIndex = currChildrenIndexes.get(prevKey);

        if (currIndex === undefined) {
          // Child removed, render it in exiting state
          nextChildren.push(createRenderableChild(prevChild, true));
        } else {
          // Child persisted, render it after new children
          for (let i = lastCurrChildAdded; i <= currIndex; i++) {
            nextChildren.push(createRenderableChild(currChildren[i]));
          }

          // Ensure that already added children won't be duplicated
          lastCurrChildAdded = Math.max(lastCurrChildAdded, currIndex + 1);
        }
      }

      // Child added, render it after all other children
      for (let i = lastCurrChildAdded; i < currChildren.length; i++) {
        nextChildren.push(createRenderableChild(currChildren[i]));
      }

      return nextChildren;
    });
  }, [children, createRenderableChild]);

  return renderableChildren;
};
