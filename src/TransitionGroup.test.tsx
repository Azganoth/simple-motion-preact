import { act, render, screen } from "@testing-library/preact";
import { CSSTransition, type CSSTransitionProps } from "./CSSTransition";
import {
  Transition,
  TransitionPhase,
  type TransitionProps,
} from "./Transition";
import { TransitionGroup } from "./TransitionGroup";

const composeChild = (key?: any, props?: Omit<TransitionProps, "children">) => (
  <Transition key={key} {...props}>
    {(phase) => <div data-testid={`child-${key}`}>{phase}</div>}
  </Transition>
);

const composeCSSChild = (
  key?: any,
  props?: Omit<CSSTransitionProps, "children">,
) => (
  <CSSTransition key={key} {...props}>
    <div data-testid={`child-${key}`}>Item {key}</div>
  </CSSTransition>
);

describe("TransitionGroup", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it("renders initial children", () => {
    render(<TransitionGroup>{composeChild("a")}</TransitionGroup>);

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
  });

  it("renders with mixed children", () => {
    render(
      <TransitionGroup>
        {composeChild("a")}
        {composeCSSChild("b")}
        {composeChild("c")}
        {composeCSSChild("d")}
      </TransitionGroup>,
    );

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();
    expect(screen.getByTestId("child-c")).toBeInTheDocument();
    expect(screen.getByTestId("child-d")).toBeInTheDocument();
  });

  it("adds children with transitions", () => {
    const { rerender } = render(
      <TransitionGroup>{composeChild("a")}</TransitionGroup>,
    );

    rerender(
      <TransitionGroup>
        {composeChild("a")}
        {composeChild("b")}
      </TransitionGroup>,
    );

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();
  });

  it("removes children with transitions", () => {
    const { rerender } = render(
      <TransitionGroup>
        {composeChild("a")}
        {composeChild("b")}
      </TransitionGroup>,
    );

    rerender(<TransitionGroup>{composeChild("a")}</TransitionGroup>);

    expect(screen.getByTestId("child-b")).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-b")).toBeNull();
  });

  it("handles no children", () => {
    const { rerender } = render(
      <TransitionGroup>{composeChild("a")}</TransitionGroup>,
    );

    rerender(<TransitionGroup />);

    expect(screen.getByTestId("child-a")).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-a")).toBeNull();
  });

  it("supports children props", () => {
    const { rerender } = render(
      <TransitionGroup>
        {composeChild("a", { appear: true, exit: false })}
        {composeChild("b", { appear: true, enter: false })}
      </TransitionGroup>,
    );

    expect(screen.getByTestId("child-a")).toHaveTextContent(
      TransitionPhase.ENTERING,
    );
    expect(screen.getByTestId("child-b")).toHaveTextContent(
      TransitionPhase.ENTERED,
    );

    rerender(<TransitionGroup />);

    expect(screen.queryByTestId("child-a")).toBeNull();
    expect(screen.getByTestId("child-b")).toHaveTextContent(
      TransitionPhase.EXITING,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-b")).toBeNull();
  });

  it("supports children lifecycle callbacks", () => {
    const onEntered = jest.fn();
    const onExited = jest.fn();
    const { rerender } = render(
      <TransitionGroup>
        {composeChild("a", { onEntered })}
        {composeChild("b", { onExited })}
      </TransitionGroup>,
    );

    rerender(<TransitionGroup>{composeChild("a")}</TransitionGroup>);

    act(() => {
      jest.runAllTimers();
    });

    expect(onEntered).toHaveBeenCalledTimes(1);
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it("overrides children props", () => {
    const { rerender } = render(
      <TransitionGroup appear enter exit>
        {composeChild("a", { appear: false, enter: false, exit: false })}
      </TransitionGroup>,
    );

    expect(screen.getByTestId("child-a")).toHaveTextContent(
      TransitionPhase.ENTERING,
    );

    rerender(<TransitionGroup />);

    expect(screen.getByTestId("child-a")).toHaveTextContent(
      TransitionPhase.EXITING,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-a")).toBeNull();
  });

  it("ignores children without keys", () => {
    render(<TransitionGroup>{composeChild()}</TransitionGroup>);

    expect(screen.queryByTestId(/^child-/)).toBeNull();
  });

  it("handles reordering of children", () => {
    const { rerender } = render(
      <TransitionGroup>
        {composeChild("a")}
        {composeChild("b")}
      </TransitionGroup>,
    );

    rerender(
      <TransitionGroup>
        {composeChild("b")}
        {composeChild("a")}
      </TransitionGroup>,
    );

    // Ensure only one of each exists
    expect(screen.getByTestId("child-a")).toBeInTheDocument();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();

    // Ensure order is updated
    const children = screen.getAllByTestId(/^child-/);
    expect(children[0]).toHaveAttribute("data-testid", "child-b");
    expect(children[1]).toHaveAttribute("data-testid", "child-a");
  });

  it("handles multiple transitions simultaneously", () => {
    const { rerender } = render(
      <TransitionGroup>
        {composeChild("a")}
        {composeChild("b")}
      </TransitionGroup>,
    );

    rerender(
      <TransitionGroup>
        {composeChild("b")}
        {composeChild("c")}
      </TransitionGroup>,
    );

    expect(screen.getByTestId("child-b")).toBeInTheDocument();
    expect(screen.getByTestId("child-c")).toBeInTheDocument();
    expect(screen.getByTestId("child-a")).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-a")).toBeNull();
  });

  it("remains stable with quick add/remove cycles", () => {
    const { rerender } = render(
      <TransitionGroup>{composeChild("a")}</TransitionGroup>,
    );

    rerender(<TransitionGroup>{composeChild("b")}</TransitionGroup>);
    rerender(<TransitionGroup>{composeChild("a")}</TransitionGroup>);
    rerender(
      <TransitionGroup>
        {composeChild("a")}
        {composeChild("b")}
        {composeChild("c")}
      </TransitionGroup>,
    );
    rerender(<TransitionGroup>{composeChild("a")}</TransitionGroup>);

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();
    expect(screen.getByTestId("child-c")).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-b")).toBeNull();
    expect(screen.queryByTestId("child-c")).toBeNull();
  });
});
