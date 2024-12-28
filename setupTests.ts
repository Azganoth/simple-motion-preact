import "@testing-library/jest-dom";
import { h } from "preact";

// Fixes "ReferenceError: h is not defined"
globalThis.h = h;
