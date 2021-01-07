import { None, Some, Vector } from "../src";

describe("Result", () => {
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
});
