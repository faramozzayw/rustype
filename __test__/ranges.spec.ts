import {
	RangeExpr,
	RangeFromExpr,
	RangeToExpr,
	RangeFullExpr,
	RangeInclusiveExpr,
	RangeToInclusiveExpr,
} from "../src/Ranges";

const array: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const str = "get correct slice";

describe("RangeExpr", () => {
	it("iterating over the range is correct", () => {
		let sum = 0;
		for (const i of new RangeExpr(0, 5)) {
			sum += i;
		}

		expect(sum).toEqual(10);
	});

	it("`clone` works correctly", () => {
		const range = new RangeExpr(2, 5);
		const clone = range.clone();

		expect(range.isEmpty()).toBeFalsy();
		expect(clone.isEmpty()).toBeFalsy();
	});

	it("get correct slice when using RangeExpr from array", () => {
		const args1 = new RangeExpr(5, 8).getBounds();

		expect(array.slice(...args1)).toEqual([5, 6, 7]);

		const args2 = new RangeExpr(5, 7).getBounds();

		expect(array.slice(...args2)).toEqual([5, 6]);
	});

	it("get correct slice when using RangeExpr from string", () => {
		const args = new RangeExpr(1, 8).getBounds();

		expect(str.slice(...args)).toEqual("et corr");
		expect(new RangeExpr(1, 8).extractSlice(str)).toEqual("et corr");
	});

	it("`isEmpty` works correctly", () => {
		expect(new RangeExpr(3, 3).isEmpty()).toBeTruthy();
		expect(new RangeExpr(1, 2).isEmpty()).toBeFalsy();
	});

	it("`isExhaustive` works correctly", () => {
		expect(new RangeExpr(0, 4).isExhaustive()).toBeTruthy();
	});

	it("`toString` works correctly", () => {
		expect(new RangeExpr(1, 2).toString()).toEqual("1..2");
	});

	it("`contains` works correctly", () => {
		expect(new RangeExpr(3, 5).contains(2)).toBeFalsy();
		expect(new RangeExpr(3, 5).contains(3)).toBeTruthy();
		expect(new RangeExpr(3, 5).contains(5)).toBeFalsy();
	});
});

describe("RangeFromExpr", () => {
	it("get correct slice when using RangeFromExpr from array", () => {
		const args = new RangeFromExpr(5).getBounds();

		expect(array.slice(...args)).toEqual([5, 6, 7, 8, 9, 10]);
	});

	it("get correct slice when using RangeFromExpr from string", () => {
		const args = new RangeFromExpr(1).getBounds();

		expect(str.slice(...args)).toEqual("et correct slice");
		expect(new RangeFromExpr(1).extractSlice(str)).toEqual("et correct slice");
	});

	it("`isEmpty` works correctly", () => {
		expect(new RangeFromExpr(5).isEmpty()).toBeFalsy();
		expect(new RangeFromExpr(Infinity).isEmpty()).toBeTruthy();
	});

	it("`isExhaustive` works correctly", () => {
		expect(new RangeFromExpr(4).isExhaustive()).toBeFalsy();
	});

	it("`toString` works correctly", () => {
		expect(new RangeFromExpr(5).toString()).toEqual("5..");
	});

	it("`contains` works correctly", () => {
		expect(new RangeFromExpr(15).contains(5)).toBeFalsy();
		expect(new RangeFromExpr(25).contains(100)).toBeTruthy();
	});
});

describe("RangeToExpr", () => {
	it("get correct slice when using RangeToExpr from array", () => {
		const args = new RangeToExpr(5).getBounds();

		expect(array.slice(...args)).toEqual([0, 1, 2, 3, 4]);
	});

	it("get correct slice when using RangeToExpr from string", () => {
		const args = new RangeToExpr(5).getBounds();

		expect(str.slice(...args)).toEqual("get c");
		expect(new RangeInclusiveExpr(0, 5).extractSlice(str)).toEqual("get co");
	});

	it("`isEmpty` works correctly", () => {
		expect(new RangeToExpr(5).isEmpty()).toBeFalsy();
		expect(new RangeToExpr(-Infinity).isEmpty()).toBeTruthy();
	});

	it("`isExhaustive` works correctly", () => {
		expect(new RangeToExpr(4).isExhaustive()).toBeFalsy();
	});

	it("`toString` works correctly", () => {
		expect(new RangeToExpr(5).toString()).toEqual("..5");
	});

	it("`contains` works correctly", () => {
		expect(new RangeToExpr(15).contains(5)).toBeTruthy();
		expect(new RangeToExpr(25).contains(100)).toBeFalsy();
	});
});

describe("RangeFullExpr", () => {
	it("get correct slice when using RangeFullExpr from array", () => {
		const args = new RangeFullExpr().getBounds();

		expect(array.slice(...args)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});

	it("get correct slice when using RangeFullExpr from string", () => {
		const args = new RangeFullExpr().getBounds();

		expect(str.slice(...args)).toEqual("get correct slice");
		expect(new RangeFullExpr().extractSlice(str)).toEqual("get correct slice");
	});

	it("`isEmpty` works correctly", () => {
		expect(new RangeFullExpr().isEmpty()).toBeFalsy();
	});

	it("`isExhaustive` works correctly", () => {
		expect(new RangeFullExpr().isExhaustive()).toBeFalsy();
	});

	it("`toString` works correctly", () => {
		expect(new RangeFullExpr().toString()).toEqual("..");
	});

	it("`contains` works correctly", () => {
		expect(new RangeFullExpr().contains(5)).toBeTruthy();
		expect(new RangeFullExpr().contains(Infinity)).toBeFalsy();
	});
});

describe("RangeInclusiveExpr", () => {
	it("get correct slice when using RangeInclusiveExpr from array", () => {
		const args = new RangeInclusiveExpr(0, 5).getBounds();

		expect(array.slice(...args)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it("get correct slice when using RangeInclusiveExpr from string", () => {
		const args = new RangeInclusiveExpr(0, 5).getBounds();

		expect(str.slice(...args)).toEqual("get co");
		expect(new RangeInclusiveExpr(0, 5).extractSlice(str)).toEqual("get co");
	});

	it("`isEmpty` works correctly", () => {
		expect(new RangeInclusiveExpr(1, 2).isEmpty()).toBeFalsy();
		expect(new RangeInclusiveExpr(2, 2).isEmpty()).toBeFalsy();
		expect(new RangeInclusiveExpr(3, 2).isEmpty()).toBeTruthy();
	});

	it("`isExhaustive` works correctly", () => {
		expect(new RangeInclusiveExpr(1, 5).isExhaustive()).toBeTruthy();
	});

	it("`toString` works correctly", () => {
		expect(new RangeInclusiveExpr(1, 5).toString()).toEqual("1..=5");
	});

	it("`contains` works correctly", () => {
		expect(new RangeInclusiveExpr(3, 5).contains(1)).toBeFalsy();
		expect(new RangeInclusiveExpr(3, 5).contains(5)).toBeTruthy();
		expect(new RangeInclusiveExpr(3, 5).contains(15)).toBeFalsy();
	});
});

describe("RangeToInclusiveExpr", () => {
	it("get correct slice when using RangeToInclusiveExpr from array", () => {
		const args = new RangeToInclusiveExpr(5).getBounds();

		expect(array.slice(...args)).toEqual([0, 1, 2, 3, 4, 5]);
		expect(new RangeToInclusiveExpr(5).extractSlice(array)).toEqual([
			0,
			1,
			2,
			3,
			4,
			5,
		]);
	});

	it("get correct slice when using RangeToInclusiveExpr from string", () => {
		const args = new RangeToInclusiveExpr(5).getBounds();

		expect(str.slice(...args)).toEqual("get co");
		expect(new RangeToInclusiveExpr(5).extractSlice(str)).toEqual("get co");
	});

	it("`isEmpty` works correctly", () => {
		expect(new RangeInclusiveExpr(2, 4).isEmpty()).toBeFalsy();
		expect(new RangeInclusiveExpr(5, 4).isEmpty()).toBeTruthy();
	});

	it("`isExhaustive` works correctly", () => {
		expect(new RangeToInclusiveExpr(5).isExhaustive()).toBeFalsy();
	});

	it("`toString` works correctly", () => {
		expect(new RangeToInclusiveExpr(5).toString()).toEqual("..=5");
	});

	it("`contains` works correctly", () => {
		expect(new RangeToInclusiveExpr(15).contains(5)).toBeTruthy();
		expect(new RangeToInclusiveExpr(15).contains(25)).toBeFalsy();
	});
});
