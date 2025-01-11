import type { Meta, StoryObj } from "@storybook/preact";
import { fn } from "@storybook/test";
import { CSSTransition, type CSSTransitionProps } from "./CSSTransition";
import { useAutoToggle } from "./test-utils/hooks";
import StoryWrapper from "./test-utils/StoryWrapper";
import TransitionStories from "./Transition.stories";

const getArgsTypes = () => {
  const { children: _, ...argTypes } = TransitionStories.argTypes;
  return argTypes;
};

/**
 * The `CSSTransition` component builds on the `Transition` component to provide an easy and flexible way to animate elements using CSS classes. It simplifies the process of applying and managing CSS transitions during an element's lifecycle phases (entering, entered, exiting, and exited).
 */
export default {
  component: CSSTransition,
  argTypes: {
    children: {
      description: "The content to be transitioned. Must be a `VNode`.",
      type: { required: true, name: "other", value: "VNode" },
      control: { disable: true },
    },
    name: {
      description:
        'The base name used to generate CSS class names for the transition. For example, a value of "fade" will generate "fade-enter-from", "fade-enter-active", "fade-enter-to", "fade-leave-from", "fade-leave-active" and "fade-leave-to".',
      type: { name: "string" },
    },
    fromClass: {
      description:
        "Class applied at the start of enter transition and at the end of exit transition.",
      type: { name: "string" },
    },
    toClass: {
      description:
        "Class class applied at the end of enter transition and at the start of exit transition.",
      type: { name: "string" },
    },
    activeClass: {
      description:
        "Class applied during the active phase of both enter and exit transitions.",
      type: { name: "string" },
    },
    enterFromClass: {
      description: "Class applied before the start of the enter transition.",
      type: { name: "string" },
    },
    enterToClass: {
      description: "Class applied at the start of the enter transition.",
      type: { name: "string" },
    },
    enterActiveClass: {
      description: "Class applied during the enter transition.",
      type: { name: "string" },
    },
    leaveFromClass: {
      description: "Class applied before the start of the exit transition.",
      type: { name: "string" },
    },
    leaveToClass: {
      description: "Class applied at the start of the exit transition.",
      type: { name: "string" },
    },
    leaveActiveClass: {
      description: "Class applied during the exit transition.",
      type: { name: "string" },
    },
    ...getArgsTypes(),
  },
} satisfies Meta<CSSTransitionProps>;

type Story = StoryObj<CSSTransitionProps>;

export const Default = {
  args: {
    children: (
      <div class="transition-item transition-item--ocean">
        <span class="transition-label">Transition</span>
      </div>
    ),
    name: undefined,
    fromClass: undefined,
    toClass: undefined,
    activeClass: undefined,
    enterFromClass: undefined,
    enterToClass: undefined,
    enterActiveClass: undefined,
    leaveFromClass: undefined,
    leaveToClass: undefined,
    leaveActiveClass: undefined,
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
    name: "transition--fade",
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

export const SlideUp = {
  ...Fade,
  args: {
    ...Default.args,
    activeClass: "transitioning",
    enterFromClass: "transition--slide-down-from",
    enterToClass: "transition--slide-down-to",
    leaveFromClass: "transition--slide-up-to",
    leaveToClass: "transition--slide-up-from",
    duration: 500,
  },
} satisfies Story;

export const SlideUpDown = {
  ...Fade,
  args: {
    ...Default.args,
    activeClass: "transitioning",
    fromClass: "transition--slide-down-from",
    toClass: "transition--slide-down-to",
    duration: 500,
  },
} satisfies Story;

export const ZoomInOut = {
  ...Fade,
  args: {
    ...Default.args,
    activeClass: "transitioning",
    enterFromClass: "transition--zoom-in",
    leaveToClass: "transition--zoom-out",
    duration: 500,
  },
} satisfies Story;
