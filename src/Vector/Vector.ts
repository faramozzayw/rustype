import { Panic } from "../panic";
import { range } from "../utils";
import { None, Option, Some } from "../Option";

export type Enumerate<T> = [number, T];

/**
 * @class Vector
 *
 * `Vector` combines methods from `Iterator` and `Vector`.
 * Also there are all methods from JS array.
 *
 * @template T - type of `Vector` elements
 *
 * @see Iterator https://doc.rust-lang.org/std/iter/trait.Iterator.html
 * @see Vector https://doc.rust-lang.org/std/vec/struct.Vec.html
 * @see Array https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 *
 * @category Vector
 */
export class Vector<T> extends Array<T> {
	static get [Symbol.species]() {
		return Array;
	}

	public static default() {
		return new Vector();
	}

	get length(): number {
		return this.length;
	}

	public static fromArray<AT>(array: AT[]): Vector<AT> {
		return new Vector(...array);
	}

	/** Returns true if the vector contains no elements. */
	public isEmpty(): boolean {
		return this.length === 0;
	}

	/** @ignore */
	private checkIndex(index: number): boolean {
		if (!Number.isSafeInteger(index) || index < 0 || index > this.length) {
			return false;
		}

		return true;
	}

	/**
	 * Returns the first element of the slice, or `None` if it is empty.
	 *
	 * ### Example
	 * ```ts
	 * expect(Vector.default().first()).toEqual(None())
	 *
	 * expect(new Vector(1, 3, 4, 6).first()).toEqual(Some(1))
	 * expect(new Vector().first()).toEqual(None());
	 * ```
	 */
	public first(): Option<T> {
		const value = this[0];
		return typeof value === "undefined" ? None() : Some(value);
	}

	/**
	 * Returns the first and all the rest of the elements of the slice, or `None` if it is empty.
	 *
	 * ### Example
	 * ```ts
	 * expect(new Vector(1, 3, 4, 6).splitFirst()).toEqual(Some([1, [3, 4, 6]]))
	 * expect(new Vector().splitFirst()).toEqual(None());
	 * ```
	 */
	public splitFirst(): Option<[T, Vector<T>]> {
		if (this.isEmpty()) return None();

		const [first, ...others] = this;

		return Some([first, Vector.fromArray(others)]);
	}

	/**
	 * Returns the last element of the slice, or `None` if it is empty.
	 * 
	 * ### Example
	 * ```ts
	 * expect(Vector.default().first()).toEqual(None())

	 * expect(new Vector(1, 3, 4, 6).first()).toEqual(Some(6))
	 * expect(new Vector().first()).toEqual(None());
	 * ```
	 */
	public last(): Option<T> {
		const value = this[this.length - 1];
		return typeof value === "undefined" ? None() : Some(value);
	}

	/**
	 * Returns the last and all the rest of the elements of the slice, or `None` if it is empty.
	 *
	 * ### Example
	 * ```ts
	 * expect(new Vector(1, 3, 4, 6).splitLast()).toEqual(Some([6, [1, 3, 4]]))
	 * expect(new Vector().splitLast()).toEqual(None());
	 * ```
	 */
	public splitLast(): Option<[T, Vector<T>]> {
		if (this.isEmpty()) return None();

		const lastIndex = this.length - 1;
		const last = this[lastIndex];
		const others = this.filter((_, index) => lastIndex !== index);

		return Some([last, Vector.fromArray(others)]);
	}

	/**
	 * Swaps two elements in the slice.
	 *
	 * ### Arguments
	 * @param a - The index of the first element
	 * @param b - The index of the second element
	 *
	 * ### Panics
	 * Panics if `a` or `b` are out of bounds.
	 *
	 *
	 * ### Example
	 * ```ts
	 * expect(new Vector(1, 3, 4, 6).swap(0, 3)).toEqual(new Vector(6, 3, 4, 1));
	 * expect(new Vector(1, 3, 2, -15).swap(1, 0)).toEqual(new Vector(3, 1, 2, -15));
	 * ```
	 */
	public swap(a: number, b: number): Vector<T> | never {
		if (this.checkIndex(a) && this.checkIndex(b)) {
			[this[a], this[b]] = [this[b], this[a]];
		} else {
			throw new RangeError("`a` or `b` are out of bounds.");
		}

		return this;
	}

	/**
	 * Divides one slice into two at an index.
	 *
	 * The first will contain all indices from `[0, mid)` (excluding the index `mid` itself) and the second
	 * will contain all indices from `[mid, len)` (excluding the index `len` itself).
	 *
	 * ### Panics
	 * Panics if mid > len.
	 */
	public splitAt(mid: number): [Vector<T>, Vector<T>] | never {
		if (mid > this.length) {
			throw new Panic("mid > len");
		}

		let left: Vector<T> = new Vector();
		let right: Vector<T> = new Vector();

		this.forEach((item, index) => {
			const predicate = index < mid;
			(predicate ? left : right).push(item);
		});

		return [left, right];
	}

	/**
	 * Creates a vector by repeating a slice `n` times.
	 *
	 * ### Example
	 * ```ts
	 * const base = new Vector(1, 2);
	 *
	 * expect(base.repeat(3)).toEqual([1, 2, 1, 2, 1, 2]);
	 * expect(base.repeat(2)).toEqual([1, 2, 1, 2]);
	 *
	 * expect(Vector.default().repeat(2)).toEqual([]);
	 * ```
	 */
	public repeat(n: number): Vector<T> {
		let result: T[] = [];

		for (const it of range(0, n)) {
			result = result.concat(...this);
		}

		return Vector.fromArray(result);
	}

	/**
	 * Clears the vector, removing all values.
	 *
	 * Note that this method has no effect on the allocated capacity of the vector.
	 *
	 * ### Example
	 * ```ts
	 * let base = new Vector(1, 3, 4, 5, 6, 723, 7);
	 * base.clear()
	 * expect(base).toEqual([]);
	 * expect(base.length).toEqual(0)
	 * ```
	 */
	public clear(): void {
		while (this.pop()) {}
	}

	/**
	 * Rotates the vector in-place such that the first `mid` elements of the slice move to the end while the last `this.lenght - mid` elements move to the front. 
	 * 
	 * After calling `rotateLeft`, the element previously at index `mid` will become the first element in the slice.
	 * 
	 * @throws `RangeError`, if `mid` is an unsafe integer or less than 0
	 * 
	 * ### Example
	 * ```ts
	 * const v1 = new Vector("a", "b", "c", "d", "e", "f");
	 * v1.rotateLeft(2);
	 * expect(v1).toEqual(new Vector("c", "d", "e", "f", "a", "b"));
	 * 
	 * // if mid > length
	 * const v2 = new Vector(1, 2, 3);
	 * v2.rotateLeft(3);
	 * expect(v2).toEqual(new Vector(1, 2, 3));
	 * 
	 * // if mid == 0
	 * const v3 = new Vector(1, 2, 3);
	 * v3.rotateLeft(0);
	 * expect(v3).toEqual(new Vector(1, 2, 3));

	 * const v4 = new Vector(1, 2, 3);
	 * v4.rotateLeft(1);
	 * expect(v4).toEqual(new Vector(2, 3, 1));
	 * ```
	 */
	public rotateLeft(mid: number): Vector<T> | never {
		if (!Number.isSafeInteger(mid) || mid < 0 || mid > this.length) {
			throw new RangeError(`"mid" out of range`);
		}

		const k = this.length - mid;

		for (let i = 0; i < k; i++) {
			this.swap(i, mid + i);
		}

		return this;
	}

	/**
	 * Rotates the vector in-place such that the first `this.length - k` elements of the slice move to the end while the last `k` elements move to the front.
	 *
	 * After calling `rotateRight`, the element previously at index `this.length - k `will become the first element in the slice.
	 *
	 * @throws `RangeError`, if `k` is an unsafe integer or less than 0
	 *
	 * ### Example
	 * ```ts
	 * const v1 = new Vector("a", "b", "c", "d", "e", "f");
	 * v1.rotateRight(2);
	 * expect(v1).toEqual(new Vector("e", "f", "a", "b", "c", "d"));
	 *
	 * // if k > length
	 * const v2 = new Vector(1, 2, 3);
	 * v2.rotateRight(3);
	 * expect(v2).toEqual(new Vector(1, 2, 3));
	 *
	 * // if k == 0
	 * const v3 = new Vector(1, 2, 3);
	 * v3.rotateRight(0);
	 * expect(v3).toEqual(new Vector(1, 2, 3));
	 *
	 * const v4 = new Vector(1, 2, 3);
	 * v4.rotateRight(1);
	 * expect(v4).toEqual(new Vector(3, 1, 2));
	 *
	 * const v5 = new Vector(1, 2, 3);
	 * v5.rotateRight(2);
	 * expect(v5).toEqual(new Vector(2, 3, 1));
	 * ```
	 */
	public rotateRight(k: number): Vector<T> | never {
		if (!Number.isSafeInteger(k) || k < 0 || k > this.length) {
			throw new RangeError(`"mid" out of range`);
		}

		const t = this.length - k;

		for (let i = 0; i < k; i++) {
			this.swap(i, t + i);
		}

		for (let i = k; i < t; i++) {
			this.swap(i, i + k);
		}

		return this;
	}

	/** @experimental */
	public *enumerate(): Generator<Enumerate<T>, unknown, unknown> {
		let arr: Enumerate<T>[] = [];

		let index = 0;
		for (const item of this) {
			yield [index, item];
		}

		return arr;
	}

	/**
	 * The predicate passed to `partition()` can return `true`, or `false`.
	 * `partition()` returns a pair, all of the elements for which it returned `true`,
	 * and all of the elements for which it returned `false`.
	 *
	 * ### Example
	 * ```ts
	 * const vec = new Vector(1, 2, 3, 4, 5, 6, 7, 8);
	 *
	 * const [a, b] = vec.partition((item) => item % 2 === 0);
	 * expect(a).toEqual(new Vector(2, 4, 6, 8));
	 * expect(b).toEqual(new Vector(1, 3, 5, 7));
	 * ```
	 */
	public partition<F extends (item: T) => boolean>(
		predicate: F,
	): [Vector<T>, Vector<T>] {
		let [a, b] = [new Vector<T>(), new Vector<T>()];

		for (const item of this) {
			if (predicate(item)) {
				a.push(item);
			} else {
				b.push(item);
			}
		}

		return [a, b];
	}
}
