import type { Meta, StoryObj } from "@storybook/preact";
import { CSSTransition } from "./CSSTransition";
import { useAutoToggle } from "./test-utils/hooks";
import StoryWrapper from "./test-utils/StoryWrapper";
import {
  fadeEnteredStyle,
  fadeiInterStyle,
  transitioningStyle,
} from "./test-utils/styles";
import { Transition, TransitionPhase } from "./Transition";
import {
  TransitionSwitch,
  type TransitionSwitchProps,
} from "./TransitionSwitch";

/**
 * The `TransitionSwitch` component provides a mechanism for animating the transition between two child elements. When a new child is provided, the current child animates out before the new child animates in, ensuring smooth and sequential transitions.
 */
export default {
  component: TransitionSwitch,
  argTypes: {
    children: {
      description:
        "The child to be animated. The `key` property of the child must uniquely identify it to ensure proper transition behavior. If it is `undefined`, the current child will animate out and no new child will replace it.",
      type: { name: "other", value: "VNode" },
      control: { disable: true },
    },
  },
} satisfies Meta<TransitionSwitchProps>;

type Story = StoryObj<TransitionSwitchProps>;

export const Default = {
  args: {
    children: (
      <Transition key="1" duration={500}>
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
            <span class="transition-label">{phase}</span>
          </div>
        )}
      </Transition>
    ),
  },
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
} satisfies Story;

const FadeItem1 = (
  <CSSTransition key="1" name="transition--fade" appear duration={500}>
    <div class="transition-item transition-item--sunset">
      <span class="transition-label">Item 1</span>
    </div>
  </CSSTransition>
);

const FadeItem2 = (
  <CSSTransition key="2" name="transition--fade" appear duration={500}>
    <div class="transition-item transition-item--ocean">
      <span class="transition-label">Item 2</span>
    </div>
  </CSSTransition>
);

export const Fade = {
  ...Default,
  args: {
    ...Default.args,
    children: FadeItem1,
  },
  decorators: [
    ...Default.decorators,
    (Story, ctx) => {
      const showItem1 = useAutoToggle(3000);

      return (
        <Story
          args={{
            ...ctx.args,
            children: showItem1 ? FadeItem1 : FadeItem2,
          }}
        />
      );
    },
  ],
} satisfies Story;

const SlideItem1 = (
  <CSSTransition
    key="1"
    appear
    duration={500}
    activeClass="transitioning"
    enterFromClass="transition--slide-left"
    leaveToClass="transition--slide-right"
  >
    <div class="transition-item transition-item--twilight">
      <span class="transition-label">Item 1</span>
    </div>
  </CSSTransition>
);

const SlideItem2 = (
  <CSSTransition
    key="2"
    appear
    duration={500}
    activeClass="transitioning"
    enterFromClass="transition--slide-left"
    leaveToClass="transition--slide-right"
  >
    <div class="transition-item transition-item--ice">
      <span class="transition-label">Item 2</span>
    </div>
  </CSSTransition>
);

export const Slide = {
  ...Default,
  args: {
    ...Default.args,
    children: SlideItem1,
  },
  decorators: [
    ...Default.decorators,
    (Story, ctx) => {
      const showItem1 = useAutoToggle(3000);

      return (
        <Story
          args={{
            ...ctx.args,
            children: showItem1 ? SlideItem1 : SlideItem2,
          }}
        />
      );
    },
  ],
} satisfies Story;
