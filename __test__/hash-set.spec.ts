import { HashSet } from "../src";

describe("Option", () => {
	it("`isDisjoint` works correctly", () => {
		expect(
			new HashSet([2, 5, 1, 3]).isDisjoint(new HashSet([20])),
		).toBeTruthy();

		expect(new HashSet([2, 5, 1, 3]).isDisjoint(new HashSet([2]))).toBeFalsy();
	});

	describe("isSuperset", () => {
		it("works correct when set a empty", () => {
			const isSuperset = new HashSet([]).isSuperset(new HashSet([]));

			expect(isSuperset).toBeTruthy();
		});

		it("works correct with empty set", () => {
			const isSuperset = new HashSet([1, 2, 3, 4]).isSuperset(new HashSet([]));

			expect(isSuperset).toBeTruthy();
		});

		it("works correct when is superset", () => {
			const isSuperset = new HashSet([1, 2, 3, 4]).isSuperset(
				new HashSet([2, 3]),
			);

			expect(isSuperset).toBeTruthy();
		});

		it("works correct when is NOT superset", () => {
			const isSuperset = new HashSet([1, 2, 3, 4]).isSuperset(
				new HashSet([15]),
			);

			expect(isSuperset).toBeFalsy();
		});
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

	describe("intersection", () => {
		it("works correctly without same values", () => {
			const intersection = new HashSet([1, 2, 3]).intersection(
				new HashSet([4, 5]),
			);
			expect(intersection.toArray()).toEqual([]);
		});

		it("works correctly with same values", () => {
			const intersection = new HashSet([1, 2, 3]).intersection(
				new HashSet([4, 2, 3, 4]),
			);
			expect(intersection.toArray()).toEqual([2, 3]);
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

	describe("drain", () => {
		it("works correctly with empty set", () => {
			const emptySet = new HashSet();

			expect(emptySet.drain()).toEqual([]);
			expect(emptySet.isEmpty()).toBeTruthy();
		});

		it("works correctly with a set that has values", () => {
			const set = new HashSet([1, 2, 3, 4]);

			expect(set.drain()).toEqual([1, 2, 3, 4]);
			expect(set.isEmpty()).toBeTruthy();
		});
	});

	describe("drainFilter", () => {
		it("works correctly with empty set", () => {
			const emptySet = new HashSet();

			expect(emptySet.drainFilter((v) => v !== null)).toEqual([]);
			expect(emptySet.isEmpty()).toBeTruthy();
		});

		it("works correctly with a set that has values", () => {
			const set = new HashSet([1, 2, 3, 4]);

			expect(set.drainFilter((v) => v % 2 === 0)).toEqual([2, 4]);
			expect(set.isEmpty()).toBeTruthy();
		});
	});

	describe("retain", () => {
		it("works correctly with empty set", () => {
			const emptySet = new HashSet();

			emptySet.retain((v) => v !== null);

			expect(emptySet.toArray()).toEqual([]);
			expect(emptySet.isEmpty()).toBeTruthy();
		});

		it("works correctly with a set that has values", () => {
			const set = new HashSet([1, 2, 3, 4]);

			set.retain((v) => v % 2 === 0);

			expect(set.toArray()).toEqual([2, 4]);
			expect(set.isEmpty()).toBeFalsy();
		});
	});
});
