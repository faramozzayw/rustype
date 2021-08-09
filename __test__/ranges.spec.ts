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

describe("ranges", () => {
	it("iterating over the range is correct", () => {
		let sum = 0;
		for (const i of new RangeExpr(0, 5)) {
			sum += i;
		}

		expect(sum).toEqual(10);
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
	});

	it("get correct slice when using RangeFromExpr from array", () => {
		const args = new RangeFromExpr(5).getBounds();

		expect(array.slice(...args)).toEqual([5, 6, 7, 8, 9, 10]);
	});

	it("get correct slice when using RangeFromExpr from string", () => {
		const args = new RangeFromExpr(1).getBounds();

		expect(str.slice(...args)).toEqual("et correct slice");
	});

	it("get correct slice when using RangeToExpr from array", () => {
		const args = new RangeToExpr(5).getBounds();

		expect(array.slice(...args)).toEqual([0, 1, 2, 3, 4]);
	});

	it("get correct slice when using RangeToExpr from string", () => {
		const args = new RangeToExpr(5).getBounds();

		expect(str.slice(...args)).toEqual("get c");
	});

	it("get correct slice when using RangeFullExpr from array", () => {
		const args = new RangeFullExpr().getBounds();

		expect(array.slice(...args)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});

	it("get correct slice when using RangeFullExpr from string", () => {
		const args = new RangeFullExpr().getBounds();

		expect(str.slice(...args)).toEqual("get correct slice");
	});

	it("get correct slice when using RangeInclusiveExpr from array", () => {
		const args = new RangeInclusiveExpr(0, 5).getBounds();

		expect(array.slice(...args)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it("get correct slice when using RangeInclusiveExpr from string", () => {
		const args = new RangeInclusiveExpr(0, 5).getBounds();

		expect(str.slice(...args)).toEqual("get co");
	});

	it("get correct slice when using RangeToInclusiveExpr from array", () => {
		const args = new RangeToInclusiveExpr(5).getBounds();

		expect(array.slice(...args)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it("get correct slice when using RangeToInclusiveExpr from string", () => {
		const args = new RangeToInclusiveExpr(5).getBounds();

		expect(str.slice(...args)).toEqual("get co");
	});

	it("`isEmpty` works correctly", () => {
		expect(new RangeExpr(3, 3).isEmpty()).toBeTruthy();
		expect(new RangeExpr(1, 2).isEmpty()).toBeFalsy();

		expect(new RangeFromExpr(5).isEmpty()).toBeFalsy();
		expect(new RangeFromExpr(Infinity).isEmpty()).toBeTruthy();

		expect(new RangeToExpr(5).isEmpty()).toBeFalsy();
		expect(new RangeToExpr(-Infinity).isEmpty()).toBeTruthy();

		expect(new RangeFullExpr().isEmpty()).toBeFalsy();

		expect(new RangeInclusiveExpr(1, 2).isEmpty()).toBeFalsy();
		expect(new RangeInclusiveExpr(2, 2).isEmpty()).toBeFalsy();
		expect(new RangeInclusiveExpr(3, 2).isEmpty()).toBeTruthy();

		expect(new RangeToInclusiveExpr(5).isEmpty()).toBeFalsy();
		expect(new RangeToInclusiveExpr(-Infinity).isEmpty()).toBeTruthy();

		expect(new RangeInclusiveExpr(2, 4).isEmpty()).toBeFalsy();
		expect(new RangeInclusiveExpr(5, 4).isEmpty()).toBeTruthy();
	});

	it("`toString` works correctly", () => {
		expect(new RangeExpr(1, 2).toString()).toEqual("1..2");

		expect(new RangeFromExpr(5).toString()).toEqual("5..");
		expect(new RangeToExpr(5).toString()).toEqual("..5");
		expect(new RangeToInclusiveExpr(5).toString()).toEqual("..=5");
		expect(new RangeFullExpr().toString()).toEqual("..");
	});

	/*
		it("`fromString` works correctly", () => {
		expect(RangeExpr.fromString("1..2")).toEqual(new RangeExpr(1, 2));
		expect(RangeExpr.fromString("10..200")).toEqual(new RangeExpr(10, 200));
		expect(RangeExpr.fromString("1..20")).toEqual(new RangeExpr(1, 20));
		expect(RangeInclusiveExpr.fromString("1..=2")).toEqual(
			new RangeInclusiveExpr(1, 2),
		);

		expect(RangeFromExpr.fromString("5..")).toEqual(new RangeFromExpr(5));
		expect(RangeToExpr.fromString("..5")).toEqual(new RangeToExpr(5));

		expect(RangeFromExpr.fromString("5..")).toEqual(new RangeFromExpr(5));
		expect(RangeFromExpr.fromString("5..").toString()).toEqual("5..");

		expect(RangeToInclusiveExpr.fromString("..=5")).toEqual(
			new RangeToInclusiveExpr(5),
		);
		expect(RangeToInclusiveExpr.fromString("..=5").toString()).toEqual("..=5");

		expect(RangeFullExpr.fromString("..")).toEqual(new RangeFullExpr());
		expect(RangeFullExpr.fromString("..").toString()).toEqual("..");
	});
	*/

	it("`contains` works correctly", () => {
		expect(new RangeExpr(3, 5).contains(2)).toBeFalsy();
		expect(new RangeExpr(3, 5).contains(3)).toBeTruthy();
		expect(new RangeExpr(3, 5).contains(5)).toBeFalsy();

		expect(new RangeInclusiveExpr(3, 5).contains(5)).toBeTruthy();
		expect(new RangeInclusiveExpr(3, 5).contains(5)).toBeTruthy();
	});

	it("`clone` works correctly", () => {
		const range = new RangeExpr(2, 5);
		const clone = range.clone();

		expect(range.isEmpty()).toBeFalsy();
		expect(clone.isEmpty()).toBeFalsy();
	});

	it("`isExhaustive` works correctly", () => {
		expect(new RangeExpr(0, 4).isExhaustive()).toBeTruthy();
		expect(new RangeToInclusiveExpr(5).isExhaustive()).toBeFalsy();
		expect(new RangeFullExpr().isExhaustive()).toBeFalsy();

		expect(new RangeExpr(0, 4).isExhaustive()).toBeTruthy();
		expect(new RangeInclusiveExpr(1, 5).isExhaustive()).toBeTruthy();
	});
});
