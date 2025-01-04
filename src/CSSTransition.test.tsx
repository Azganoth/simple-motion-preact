import { act, render, screen } from "@testing-library/preact";
import { CSSTransition, type CSSTransitionProps } from "./CSSTransition";

const child: CSSTransitionProps["children"] = (
  <div data-testid="child">TRANSITION</div>
);

describe("CSSTransition", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it("applies the correct classes during 'enter' transition", () => {
    const onEnter = jest.fn(() => {
      expect(screen.getByTestId("child")).toHaveClass("fade-enter-from", {
        exact: true,
      });
    });
    const onEntering = jest.fn(() => {
      expect(screen.getByTestId("child")).toHaveClass(
        "fade-enter-active fade-enter-to",
        { exact: true },
      );
    });
    const onEntered = jest.fn(() => {
      expect(screen.getByTestId("child")).toHaveClass("fade-enter-to", {
        exact: true,
      });
    });

    render(
      <CSSTransition
        name="fade"
        appear
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
      >
        {child}
      </CSSTransition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEntering).toHaveBeenCalledTimes(1);
    expect(onEntered).toHaveBeenCalledTimes(1);
  });

  it("applies the correct classes during 'exit' transition", () => {
    const onExit = jest.fn(() => {
      expect(screen.getByTestId("child")).toHaveClass("fade-leave-from", {
        exact: true,
      });
    });
    const onExiting = jest.fn(() => {
      expect(screen.getByTestId("child")).toHaveClass(
        "fade-leave-active fade-leave-to",
        { exact: true },
      );
    });
    const onExited = jest.fn(() => {
      expect(screen.getByTestId("child")).toHaveClass("fade-leave-to", {
        exact: true,
      });
    });

    const { rerender } = render(
      <CSSTransition
        name="fade"
        onExit={onExit}
        onExiting={onExiting}
        onExited={onExited}
      >
        {child}
      </CSSTransition>,
    );

    rerender(
      <CSSTransition
        name="fade"
        in={false}
        onExit={onExit}
        onExiting={onExiting}
        onExited={onExited}
      >
        {child}
      </CSSTransition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onExiting).toHaveBeenCalledTimes(1);
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it("applies the correct classes during 'enter' transition when 'appear' is disabled", () => {
    const onEnter = jest.fn();
    const onEntering = jest.fn();
    const onEntered = jest.fn(() => {
      expect(screen.getByTestId("child")).toHaveClass("fade-enter-to", {
        exact: true,
      });
    });

    render(
      <CSSTransition
        name="fade"
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
      >
        {child}
      </CSSTransition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(onEnter).not.toHaveBeenCalled();
    expect(onEntering).not.toHaveBeenCalled();
    expect(onEntered).toHaveBeenCalledTimes(1);
  });

  it("handles 'unmount' after exiting", () => {
    const { rerender } = render(
      <CSSTransition name="fade" unmount>
        {child}
      </CSSTransition>,
    );

    rerender(
      <CSSTransition name="fade" in={false} unmount>
        {child}
      </CSSTransition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("applies the custom classes during 'enter' transition", () => {
    const onEnter = jest.fn(() =>
      expect(screen.getByTestId("child")).toHaveClass("custom-enter-from", {
        exact: true,
      }),
    );
    const onEntering = jest.fn(() =>
      expect(screen.getByTestId("child")).toHaveClass(
        "custom-enter-active custom-enter-to",
        { exact: true },
      ),
    );
    const onEntered = jest.fn(() =>
      expect(screen.getByTestId("child")).toHaveClass("custom-enter-to", {
        exact: true,
      }),
    );

    render(
      <CSSTransition
        enterActiveClass="custom-enter-active"
        enterFromClass="custom-enter-from"
        enterToClass="custom-enter-to"
        appear
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
      >
        {child}
      </CSSTransition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEntering).toHaveBeenCalledTimes(1);
    expect(onEntered).toHaveBeenCalledTimes(1);
  });

  it("applies the custom classes during 'exit' transition", () => {
    const onExit = jest.fn(() =>
      expect(screen.getByTestId("child")).toHaveClass("custom-leave-from", {
        exact: true,
      }),
    );
    const onExiting = jest.fn(() =>
      expect(screen.getByTestId("child")).toHaveClass(
        "custom-leave-active custom-leave-to",
        { exact: true },
      ),
    );
    const onExited = jest.fn(() =>
      expect(screen.getByTestId("child")).toHaveClass("custom-leave-to", {
        exact: true,
      }),
    );

    const { rerender } = render(
      <CSSTransition
        leaveActiveClass="custom-leave-active"
        leaveFromClass="custom-leave-from"
        leaveToClass="custom-leave-to"
        onExit={onExit}
        onExiting={onExiting}
        onExited={onExited}
      >
        {child}
      </CSSTransition>,
    );

    rerender(
      <CSSTransition
        leaveActiveClass="custom-leave-active"
        leaveFromClass="custom-leave-from"
        leaveToClass="custom-leave-to"
        in={false}
        onExit={onExit}
        onExiting={onExiting}
        onExited={onExited}
      >
        {child}
      </CSSTransition>,
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onExiting).toHaveBeenCalledTimes(1);
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it("works without any transition classes", () => {
    render(<CSSTransition>{child}</CSSTransition>);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByTestId("child")).not.toHaveClass();
  });
});
