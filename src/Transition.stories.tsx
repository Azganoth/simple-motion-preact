import type { Meta, StoryObj } from "@storybook/preact";
import { fn } from "@storybook/test";
import {
  Transition,
  TransitionPhase,
  type TransitionProps,
} from "./Transition";
import StoryWrapper from "./test-utils/StoryWrapper";
import { useAutoToggle } from "./test-utils/hooks";
import {
  fadeEnteredStyle,
  fadeiInterStyle,
  transitioningStyle,
} from "./test-utils/styles";

/**
 * The `Transition` component streamlines animating an element's mounting and unmounting by introducing intermediate lifecycle phases: entering, entered, exiting, and exited. It provides a declarative way to manage animations, with hooks for precise control at each stage of the transition.
 *
 * The component supports the following phases:
 * - **entering**: The element begins transitioning in.
 * - **entered**: The element finishes transitioning in.
 * - **exiting**: The element begins transitioning out.
 * - **exited**: The element finishes transitioning out and unmounts if `unmount` is enabled.
 */
export default {
  component: Transition,
  argTypes: {
    children: {
      description:
        "The content to render, either as a node or a function that receives the current transition phase and returns a node.",
      type: {
        required: true,
        name: "union",
        value: [{ name: "other", value: "VNode" }, { name: "function" }],
      },
    },
    in: {
      description:
        "Controls whether the element is entering or exiting. A value of `true` triggers the entering phases, while `false` triggers the exiting phases.",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    appear: {
      description:
        "If `true`, the transition starts in the entering phase when the component is first rendered.",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    enter: {
      description: "If `false`, disables the entering phase of the transition.",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    exit: {
      description: "If `false`, disables the exiting phase of the transition.",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    duration: {
      description:
        "Specifies the duration (in milliseconds) for the entering and exiting phases. Can be set individually for appear, enter and exit transitions.",
      table: {
        defaultValue: { summary: "150" },
      },
      type: {
        name: "union",
        value: [
          { name: "number" },
          {
            name: "object",
            value: {
              appear: { name: "number" },
              enter: { name: "number" },
              exit: { name: "number" },
            },
          },
        ],
      },
    },
    unmount: {
      description:
        "If `true`, the component unmounts once the exited phase is reached.",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    onEnter: {
      description: "Called at the start of the entering phase.",
    },
    onEntering: {
      description:
        "Called after the `onEnter` callback and before the entering phase completes.",
    },
    onEntered: {
      description: "Called when the transition reaches the entered phase.",
    },
    onExit: {
      description: "Called at the start of the exiting phase.",
    },
    onExiting: {
      description:
        "Called after the `onExit` callback and before the exiting phase completes.",
    },
    onExited: {
      description: "Called when the transition reaches the exited phase.",
    },
  },
} satisfies Meta<TransitionProps>;

type Story = StoryObj<TransitionProps>;

export const Default = {
  args: {
    children: (phase) => (
      <div class="transition-item transition-item--sunset">
        <span class="transition-label">{phase}</span>
      </div>
    ),
    in: true,
    appear: false,
    enter: true,
    exit: true,
    duration: 150,
    unmount: false,
    onEnter: fn(),
    onEntering: fn(),
    onEntered: fn(),
    onExit: fn(),
    onExiting: fn(),
    onExited: fn(),
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
    children: (phase) => (
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
        <span class="transition-label">{phase}</span>
      </div>
    ),
    duration: 500,
  },
  decorators: [
    ...Default.decorators,
    (Story, ctx) => {
      const shouldEnter = useAutoToggle(3500);

      return Story({
        args: {
          ...ctx.args,
          in: shouldEnter,
        },
      });
    },
  ],
} satisfies Story;

export const NoTransitions = {
  ...Fade,
  args: {
    ...Fade.args,
    children: (phase) => (
      <div
        class="transition-item transition-item--sunset"
        style={{
          ...(phase === TransitionPhase.EXITED && fadeiInterStyle),
        }}
      >
        <span class="transition-label">{phase}</span>
      </div>
    ),
    enter: false,
    exit: false,
  },
} satisfies Story;
