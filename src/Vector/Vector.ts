import { Options } from "prettier";
import { None, Option, Some } from "../Option";
import { Panic } from "../panic";
import { range } from "../utils";

export class Vector<T> extends Array<T> {
	static get [Symbol.species]() {
		return Array;
	}

	public static default() {
		return new Vector();
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
			throw new Panic("`a` or `b` are out of bounds.");
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
}
