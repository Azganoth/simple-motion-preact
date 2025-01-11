import { act, render, screen } from "@testing-library/preact";
import {
  Transition,
  TransitionPhase,
  type TransitionProps,
} from "./Transition";

const child: TransitionProps["children"] = (phase) => (
  <div data-testid="child">{phase}</div>
);

describe("Transition", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it("renders each phase", () => {
    const { rerender } = render(<Transition>{child}</Transition>);

    expect(screen.getByText(TransitionPhase.ENTERED)).toBeInTheDocument;

    rerender(<Transition in={false}>{child}</Transition>);

    expect(screen.getByText(TransitionPhase.EXITING)).toBeInTheDocument;

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(TransitionPhase.EXITED)).toBeInTheDocument;

    rerender(<Transition in={true}>{child}</Transition>);

    expect(screen.getByText(TransitionPhase.ENTERING)).toBeInTheDocument;

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(TransitionPhase.ENTERED)).toBeInTheDocument;
  });

  it("triggers each lifecyles handler", () => {
    const onEnter = jest.fn();
    const onEntering = jest.fn();
    const onEntered = jest.fn();
    const onExit = jest.fn();
    const onExiting = jest.fn();
    const onExited = jest.fn();

    const { rerender } = render(
      <Transition
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
        onExit={onExit}
        onExiting={onExiting}
        onExited={onExited}
      >
        {child}
      </Transition>,
    );

    expect(onEntered).toHaveBeenCalledTimes(1);

    rerender(
      <Transition
        in={false}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
        onExit={onExit}
        onExiting={onExiting}
        onExited={onExited}
      >
        {child}
      </Transition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onExiting).toHaveBeenCalledTimes(1);
    expect(onExited).toHaveBeenCalledTimes(1);

    rerender(
      <Transition
        in={true}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
        onExit={onExit}
        onExiting={onExiting}
        onExited={onExited}
      >
        {child}
      </Transition>,
    );

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEntering).toHaveBeenCalledTimes(1);

    act(() => {
      jest.runAllTimers();
    });

    expect(onEntered).toHaveBeenCalledTimes(2);
  });

  it("transitions on mount with 'appear'", () => {
    const onExited = jest.fn();
    const onEnter = jest.fn();
    const onEntering = jest.fn();
    const onEntered = jest.fn();

    render(
      <Transition
        appear
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
        onExited={onExited}
      >
        {child}
      </Transition>,
    );

    expect(screen.getByText(TransitionPhase.ENTERING)).toBeInTheDocument;

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(TransitionPhase.ENTERED)).toBeInTheDocument;

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEntering).toHaveBeenCalledTimes(1);
    expect(onEntered).toHaveBeenCalledTimes(1);
    expect(onExited).not.toHaveBeenCalled();
  });

  it("transitions immediately when 'enter' and 'exit' are disabled", () => {
    const { rerender } = render(
      <Transition enter={false} exit={false}>
        {child}
      </Transition>,
    );

    expect(screen.getByText(TransitionPhase.ENTERED)).toBeInTheDocument();

    rerender(
      <Transition in={false} enter={false} exit={false}>
        {child}
      </Transition>,
    );

    expect(screen.getByText(TransitionPhase.EXITED)).toBeInTheDocument();
  });

  it("stays mounted after exit", () => {
    const { rerender } = render(<Transition>{child}</Transition>);

    rerender(<Transition in={false}>{child}</Transition>);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(TransitionPhase.EXITED)).toBeInTheDocument();
  });

  it("unmounts after exit when 'unmount' is enabled", () => {
    const { rerender } = render(<Transition unmount>{child}</Transition>);

    rerender(
      <Transition in={false} unmount>
        {child}
      </Transition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId(TransitionPhase.EXITED)).toBeNull();
  });

  it("respects custom duration", () => {
    const duration = 500;
    render(
      <Transition appear duration={duration}>
        {child}
      </Transition>,
    );

    act(() => {
      jest.advanceTimersByTime(duration / 2);
    });

    expect(screen.getByText(TransitionPhase.ENTERING)).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(TransitionPhase.ENTERED)).toBeInTheDocument();
  });

  it("does not trigger transitions when 'in' remains unchanged", () => {
    const onEntering = jest.fn();
    const onEntered = jest.fn();
    const { rerender } = render(
      <Transition in onEntering={onEntering} onEntered={onEntered}>
        {child}
      </Transition>,
    );

    rerender(
      <Transition in onEntering={onEntering}>
        {child}
      </Transition>,
    );

    expect(onEntering).not.toHaveBeenCalled();
    expect(onEntered).toHaveBeenCalledTimes(1);
  });

  it("handles quick state changes", () => {
    const onExited = jest.fn();
    const { rerender } = render(
      <Transition onExited={onExited}>{child}</Transition>,
    );

    rerender(
      <Transition in={false} onExited={onExited}>
        {child}
      </Transition>,
    );
    rerender(
      <Transition in={true} onExited={onExited}>
        {child}
      </Transition>,
    );

    expect(screen.getByText(TransitionPhase.ENTERING)).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(TransitionPhase.ENTERED)).toBeInTheDocument();
    expect(onExited).not.toHaveBeenCalled();
  });

  it("executes child ref callback", () => {
    const refCallback = jest.fn();
    render(
      <Transition>
        {(phase) => <div ref={refCallback}>{phase}</div>}
      </Transition>,
    );

    expect(refCallback).toHaveBeenCalledTimes(1);
  });

  it("passes 'isAppearing' to lifecycle handlers", () => {
    const onEnter = jest.fn();
    const onEntering = jest.fn();
    const onEntered = jest.fn();

    const { rerender } = render(
      <Transition
        appear
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
      >
        {child}
      </Transition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(onEnter).toHaveBeenCalledWith(expect.any(HTMLElement), true);
    expect(onEntering).toHaveBeenCalledWith(expect.any(HTMLElement), true);
    expect(onEntered).toHaveBeenCalledWith(expect.any(HTMLElement), true);

    rerender(
      <Transition
        in={false}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
      >
        {child}
      </Transition>,
    );
    rerender(
      <Transition
        in={true}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
      >
        {child}
      </Transition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(onEnter).toHaveBeenCalledWith(expect.any(HTMLElement), false);
    expect(onEntering).toHaveBeenCalledWith(expect.any(HTMLElement), false);
    expect(onEntered).toHaveBeenCalledWith(expect.any(HTMLElement), false);
  });
});
