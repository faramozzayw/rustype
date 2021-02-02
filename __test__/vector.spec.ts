import { None, Some, Vector } from "../src";

describe("Result", () => {
	it("iterated correctly", () => {
		const iterator = new Vector(1, 3, 4, 6)[Symbol.iterator]();

		expect(iterator.next().value).toEqual(1);
		expect(iterator.next().value).toEqual(3);
		expect(iterator.next().value).toEqual(4);
		expect(iterator.next().value).toEqual(6);
	});

	it("first", () => {
		expect(Vector.default().first()).toEqual(None());

		expect(new Vector(1, 3, 4, 6).first()).toEqual(Some(1));
		expect(new Vector().first()).toEqual(None());
	});

	it("splitFirst", () => {
		expect(Vector.default().splitFirst()).toEqual(None());

		expect(new Vector(1, 3, 4, 6).splitFirst()).toEqual(Some([1, [3, 4, 6]]));
		expect(new Vector().splitFirst()).toEqual(None());
	});

	it("last", () => {
		expect(Vector.default().last()).toEqual(None());

		expect(new Vector(1, 3, 4, 6).last()).toEqual(Some(6));
		expect(new Vector().last()).toEqual(None());
	});

	it("splitLast", () => {
		expect(Vector.default().splitLast()).toEqual(None());

		expect(new Vector(1, 3, 4, 6).splitLast()).toEqual(Some([6, [1, 3, 4]]));
		expect(new Vector().splitLast()).toEqual(None());
	});

	it("swap", () => {
		expect(new Vector(1, 3, 4, 6).swap(0, 3)).toEqual(new Vector(6, 3, 4, 1));
		expect(new Vector(1, 3, 2, -15).swap(1, 0)).toEqual(
			new Vector(3, 1, 2, -15),
		);
	});

	it("splitAt", () => {
		{
			const [left, right] = new Vector(1, 2, 3, 4, 5, 6).splitAt(0);
			expect(left).toEqual(new Vector());
			expect(right).toEqual(new Vector(1, 2, 3, 4, 5, 6));
		}

		{
			const [left, right] = new Vector(1, 2, 3, 4, 5, 6).splitAt(2);
			expect(left).toEqual(new Vector(1, 2));
			expect(right).toEqual(new Vector(3, 4, 5, 6));
		}

		{
			const [left, right] = new Vector(1, 2, 3, 4, 5, 6).splitAt(6);
			expect(left).toEqual(new Vector(1, 2, 3, 4, 5, 6));
			expect(right).toEqual(new Vector());
		}
	});

	it("repeat", () => {
		const base = new Vector(1, 2);

		expect(base.repeat(3)).toEqual([1, 2, 1, 2, 1, 2]);
		expect(base.repeat(2)).toEqual([1, 2, 1, 2]);

		expect(Vector.default().repeat(2)).toEqual([]);
	});

	it("clear", () => {
		let base = new Vector(1, 3, 4, 5, 6, 723, 7);
		base.clear();
		expect(base).toEqual([]);
		expect(base.length).toEqual(0);
	});

	it("rotateLeft", () => {
		const v1 = new Vector("a", "b", "c", "d", "e", "f");
		v1.rotateLeft(2);
		expect(v1).toEqual(new Vector("c", "d", "e", "f", "a", "b"));

		// if mid > length
		const v2 = new Vector(1, 2, 3);
		v2.rotateLeft(3);
		expect(v2).toEqual(new Vector(1, 2, 3));

		// if mid == 0
		const v3 = new Vector(1, 2, 3);
		v3.rotateLeft(0);
		expect(v3).toEqual(new Vector(1, 2, 3));

		const v4 = new Vector(1, 2, 3);
		v4.rotateLeft(1);
		expect(v4).toEqual(new Vector(2, 3, 1));
	});

	it("rotateRight", () => {
		const v1 = new Vector("a", "b", "c", "d", "e", "f");
		v1.rotateRight(2);
		expect(v1).toEqual(new Vector("e", "f", "a", "b", "c", "d"));

		// if k > length
		const v2 = new Vector(1, 2, 3);
		v2.rotateRight(3);
		expect(v2).toEqual(new Vector(1, 2, 3));

		// if k == 0
		const v3 = new Vector(1, 2, 3);
		v3.rotateRight(0);
		expect(v3).toEqual(new Vector(1, 2, 3));

		const v4 = new Vector(1, 2, 3);
		v4.rotateRight(1);
		expect(v4).toEqual(new Vector(3, 1, 2));

		const v5 = new Vector(1, 2, 3);
		v5.rotateRight(2);
		expect(v5).toEqual(new Vector(2, 3, 1));
	});

	it("partition", () => {
		const vec = new Vector(1, 2, 3, 4, 5, 6, 7, 8);

		const [a, b] = vec.partition((item) => item % 2 === 0);
		expect(a).toEqual(new Vector(2, 4, 6, 8));
		expect(b).toEqual(new Vector(1, 3, 5, 7));
	});
});
