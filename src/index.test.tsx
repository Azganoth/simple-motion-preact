import { render, screen } from "@testing-library/preact";
import type { FunctionComponent } from "preact";

test("test", () => {
  const C: FunctionComponent = () => <div data-testid="test"></div>;
  render(<C />);
  expect(screen.getByTestId("test")).toBeInTheDocument();
});
