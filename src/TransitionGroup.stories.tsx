import type { Meta, StoryObj } from "@storybook/preact";
import { useMemo } from "preact/hooks";
import { CSSTransition } from "./CSSTransition";
import { useMultiAutoToggle } from "./test-utils/hooks";
import StoryWrapper from "./test-utils/StoryWrapper";
import {
  fadeEnteredStyle,
  fadeiInterStyle,
  transitioningStyle,
} from "./test-utils/styles";
import { Transition, TransitionPhase } from "./Transition";
import { TransitionGroup, type TransitionGroupProps } from "./TransitionGroup";

/**
 * The `TransitionGroup` component enables animation of a group of elements as they are added, updated, or removed from the DOM. It works in conjunction with the `Transition` and `CSSTransition` component to provide lifecycle-based animations for dynamic child elements.
 */
export default {
  component: TransitionGroup,
  argTypes: {
    children: {
      description:
        "The child or array of children to be animated. Each child must have a unique `key` property for proper identification and management.",
      type: {
        name: "union",
        value: [
          { name: "other", value: "VNode" },
          { name: "array", value: { name: "other", value: "VNode" } },
        ],
      },
      control: { disable: true },
    },
    appear: {
      description:
        "If `true`, the first render for each new child will trigger the enter transition. This overrides the individual 'appear' property for every child.",
      type: "boolean",
    },
    enter: {
      description:
        "If `false`, disables the entering phase of the transition for every child. This overrides the individual 'enter' property for every child.",
      type: "boolean",
    },
    exit: {
      description:
        "If `false`, disables the exiting phase of the transition for every child. This overrides the individual 'exit' property for every child.",
      type: "boolean",
    },
  },
} satisfies Meta<TransitionGroupProps>;

type Story = StoryObj<TransitionGroupProps>;

export const Default = {
  args: {
    children: [
      <Transition key="1" in duration={500}>
        {(phase) => (
          <div
            class="transition-item transition-item--sunset"
            style={{
              ...transitioningStyle,
              ...(phase === TransitionPhase.ENTERED && fadeEnteredStyle),
              ...((phase === TransitionPhase.ENTERING ||
                phase === TransitionPhase.EXITING ||
                phase === TransitionPhase.EXITED) &&
                fadeiInterStyle),
            }}
          >
            <span class="transition-label">Item 1</span>
          </div>
        )}
      </Transition>,
      <CSSTransition key="2" in duration={500}>
        <div class="transition-item transition-item--ocean">
          <span class="transition-label">Item 2</span>
        </div>
      </CSSTransition>,
    ],
    appear: undefined,
    enter: undefined,
    exit: undefined,
  },
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
} satisfies Story;

export const Fade = {
  ...Default,
  args: {
    ...Default.args,
    children: ["1", "2", "3"].map((key) => (
      <CSSTransition key={key} name="transition--fade" in duration={500}>
        <div class="transition-item transition-item--twilight">
          <span class="transition-label">Item {key}</span>
        </div>
      </CSSTransition>
    )),
  },
  decorators: [
    ...Default.decorators,
    (Story, ctx) => {
      const toggles = useMultiAutoToggle(1500, 2250, 3750);

      const children = useMemo(() => {
        const argChildren = ctx.args.children;
        return argChildren
          ? (Array.isArray(argChildren) ? argChildren : [argChildren]).filter(
              (_, i) => toggles[i],
            )
          : [];
      }, [ctx.args.children, toggles]);

      return <Story args={{ ...ctx.args, children }} />;
    },
  ],
} satisfies Story;

export const Zoom = {
  ...Fade,
  args: {
    ...Fade.args,
    appear: true,
    children: ["1", "2", "3"].map((key) => (
      <CSSTransition
        key={key}
        activeClass="transitioning"
        enterFromClass="transition--zoom-in"
        leaveToClass="transition--zoom-out"
        in
        duration={500}
      >
        <div class="transition-item transition-item--earthy">
          <span class="transition-label">Item {key}</span>
        </div>
      </CSSTransition>
    )),
  },
} satisfies Story;

export const Slide = {
  ...Default,
  args: {
    ...Default.args,
    appear: true,
    children: ["1", "2", "3", "4", "5", "6"].map((key) => (
      <CSSTransition
        key={key}
        activeClass="transitioning"
        enterFromClass="transition--slide-right"
        leaveToClass="transition--slide-left"
        in
        duration={500}
      >
        <div class="transition-item transition-item--ice transition-item--small">
          <span class="transition-label">Item {key}</span>
        </div>
      </CSSTransition>
    )),
  },
  decorators: [
    ...Default.decorators,
    (Story, ctx) => {
      const toggles = useMultiAutoToggle(4000, 3750, 3000, 2750, 2125, 1500);

      const children = useMemo(() => {
        const argChildren = ctx.args.children;
        return argChildren
          ? (Array.isArray(argChildren) ? argChildren : [argChildren]).filter(
              (_, i) => toggles[i],
            )
          : [];
      }, [ctx.args.children, toggles]);

      return <Story args={{ ...ctx.args, children }} />;
    },
  ],
} satisfies Story;
