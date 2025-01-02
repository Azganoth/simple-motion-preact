import mergeRefs from "./mergeRefs";

describe("mergeRefs", () => {
  it("calls function refs with the instance", () => {
    const ref1 = jest.fn();
    const ref2 = jest.fn();

    const mergedRef = mergeRefs(ref1, ref2);

    const instance = { value: "refValue" };
    mergedRef(instance);

    expect(ref1).toHaveBeenCalledWith(instance);
    expect(ref2).toHaveBeenCalledWith(instance);
  });

  it("sets current on object refs", () => {
    const ref1 = { current: null };
    const ref2 = { current: null };

    const mergedRef = mergeRefs<any>(ref1, ref2);

    const instance = { value: "refValue" };
    mergedRef(instance);

    expect(ref1.current).toBe(instance);
    expect(ref2.current).toBe(instance);
  });

  it("handles a mix of function and object refs", () => {
    const funcRef = jest.fn();
    const objRef = { current: null };

    const mergedRef = mergeRefs(funcRef, objRef);

    const instance = { value: "refValue" };
    mergedRef(instance);

    expect(funcRef).toHaveBeenCalledWith(instance);
    expect(objRef.current).toBe(instance);
  });

  it("handles null and undefined refs", () => {
    const ref = jest.fn();

    const mergedRef = mergeRefs(ref, null, undefined);

    const instance = { value: "refValue" };
    mergedRef(instance);

    expect(ref).toHaveBeenCalledWith(instance);
  });

  it("can be reused with different instances", () => {
    const funcRef = jest.fn();
    const objRef = { current: null };

    const mergedRef = mergeRefs(funcRef, objRef);

    const instance1 = { value: "refValue1" };
    mergedRef(instance1);
    expect(funcRef).toHaveBeenCalledWith(instance1);
    expect(objRef.current).toBe(instance1);

    const instance2 = { value: "refValue2" };
    mergedRef(instance2);
    expect(funcRef).toHaveBeenCalledWith(instance2);
    expect(objRef.current).toBe(instance2);
  });
});
