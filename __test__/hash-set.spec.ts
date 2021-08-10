import { HashSet } from "../src";

describe("Option", () => {
	it("`isDisjoint` works correctly", () => {
		expect(
			new HashSet([2, 5, 1, 3]).isDisjoint(new HashSet([20])),
		).toBeTruthy();

		expect(new HashSet([2, 5, 1, 3]).isDisjoint(new HashSet([2]))).toBeFalsy();
	});

	describe("union", () => {
		it("works correctly without same values", () => {
			const diff = new HashSet([2, 5, 1, 3]).union(new HashSet([20]));
			expect(diff.toArray()).toEqual([2, 5, 1, 3, 20]);
		});

		it("works correctly with same values", () => {
			const diff = new HashSet([2, 5, 1, 3]).union(new HashSet([2, 20]));
			expect(diff.toArray()).toEqual([2, 5, 1, 3, 20]);
		});
	});

	describe("`difference` method", () => {
		it("works correctly with no diff", () => {
			const diff = new HashSet([2, 5, 1, 3]).difference(new HashSet([20]));
			expect(diff.toArray()).toEqual([2, 5, 1, 3]);
		});

		it("works correctly with no diff", () => {
			const diff = new HashSet([2, 5, 1, 3]).difference(new HashSet([2]));
			expect(diff.toArray()).toEqual([5, 1, 3]);
		});
	});

	describe("symmetricDifference", () => {
		it("works correctly with different values", () => {
			const diff = new HashSet([1, 2, 3, 5]).symmetricDifference(
				new HashSet([1, 2, 3, 4]),
			);

			expect(diff.toArray()).toEqual([5, 4]);
		});

		it("works correctly without different values", () => {
			const diff = new HashSet([1, 2, 3]).symmetricDifference(
				new HashSet([1, 2, 3]),
			);

			expect(diff.toArray()).toEqual([]);
		});
	});
});
