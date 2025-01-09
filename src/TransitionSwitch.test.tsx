import { act, render, screen } from "@testing-library/preact";
import {
  Transition,
  TransitionPhase,
  type TransitionProps,
} from "./Transition";
import { TransitionSwitch } from "./TransitionSwitch";

const composeChild = (key?: any, props?: Omit<TransitionProps, "children">) => (
  <Transition key={key} {...props}>
    {(phase) => <div data-testid={`child-${key}`}>{phase}</div>}
  </Transition>
);

describe("TransitionSwitch", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it("renders initial child", () => {
    render(<TransitionSwitch>{composeChild("a")}</TransitionSwitch>);

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
  });

  it("switches to a new child", () => {
    const { rerender } = render(
      <TransitionSwitch>{composeChild("a")}</TransitionSwitch>,
    );

    rerender(<TransitionSwitch>{composeChild("b")}</TransitionSwitch>);
    rerender(<TransitionSwitch>{composeChild("b")}</TransitionSwitch>);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-a")).toBeNull();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();
  });

  it("switches to a new child from nothing", () => {
    const { rerender } = render(<TransitionSwitch />);

    expect(screen.queryByTestId(/child-/)).toBeNull();

    rerender(<TransitionSwitch>{composeChild("a")}</TransitionSwitch>);

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
  });

  it("calls 'onExited' of previous child when switching", () => {
    const onExited = jest.fn();
    const { rerender } = render(
      <TransitionSwitch>{composeChild("a", { onExited })}</TransitionSwitch>,
    );

    rerender(<TransitionSwitch>{composeChild("b")}</TransitionSwitch>);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-a")).toBeNull();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it("does not transition if child key is the same", () => {
    const onExited = jest.fn();
    const { rerender } = render(
      <TransitionSwitch>{composeChild("a", { onExited })}</TransitionSwitch>,
    );

    rerender(
      <TransitionSwitch>{composeChild("a", { onExited })}</TransitionSwitch>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
    expect(onExited).not.toHaveBeenCalled();
  });

  it("handles no children correctly", () => {
    const onExited = jest.fn();
    const { rerender } = render(
      <TransitionSwitch>{composeChild("a", { onExited })}</TransitionSwitch>,
    );

    rerender(<TransitionSwitch />);

    expect(screen.getByTestId("child-a")).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child-a")).toBeNull();
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it("respects child props", () => {
    const { rerender } = render(
      <TransitionSwitch>
        {composeChild("a", { duration: 500, appear: true, exit: false })}
      </TransitionSwitch>,
    );

    expect(screen.getByText(TransitionPhase.ENTERING)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText(TransitionPhase.ENTERING)).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByText(TransitionPhase.ENTERING)).toBeNull();
    expect(screen.getByText(TransitionPhase.ENTERED)).toBeInTheDocument();

    rerender(<TransitionSwitch />);

    expect(screen.queryByTestId("child-a")).toBeNull();
  });
});
