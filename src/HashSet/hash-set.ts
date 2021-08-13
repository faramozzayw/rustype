import { None, Option, Some } from "../Option";
import { Clone } from "../utils";
import { Vector } from "../Vector";

/**
 * @class ASet
 *
 * @template T
 *
 *
 * @see JS Set https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 * @see Rust HashSet https://doc.rust-lang.org/std/collections/struct.HashSet.html
 *
 * @category ASet
 */
export class HashSet<T> extends Set<T> implements Clone<HashSet<T>> {
	public static get [Symbol.species]() {
		return Set;
	}

	public constructor(values?: Iterable<T>) {
		super(values);
	}

	public clone(): HashSet<T> {
		return new HashSet(this);
	}

	public toArray(): T[] {
		return [...this];
	}

	public toVec(): Vector<T> {
		return Vector.fromArray(this.toArray());
	}

	/**
	 * Returns `true` if the set is a superset of another, i.e., `this` contains at least all the values in `other`.
	 *
	 * ### Example
	 * ```ts
	 * const isSuperset = new HashSet([1, 2, 3, 4]).isSuperset(new HashSet([15]));
	 * expect(isSuperset).toBeFalsy();
	 *
	 * const isSuperset = new HashSet([1, 2, 3, 4]).isSuperset(new HashSet([2, 3]));
	 * expect(isSuperset).toBeTruthy();
	 *
	 * const isSuperset = new HashSet([1, 2, 3, 4]).isSuperset(new HashSet([]));
	 * expect(isSuperset).toBeTruthy();
	 * ```
	 *
	 * ### Q/A
	 * - Is the empty set a superset of itself?
	 * **Yes. A ⊆ B ⟺ B ⊇ A so .... ∅ ⊆ ∅ ⟺ ∅ ⊇ ∅**
	 * @see [More about it](https://math.stackexchange.com/questions/334666/is-the-empty-set-a-subset-of-itself)
	 */
	public isSuperset(other: HashSet<T>): boolean {
		return other.isSubset(this);
	}

	/**
	 * Returns `true` if the set is a subset of another, i.e., `other` contains at least all the values in `this`.
	 */
	public isSubset(other: HashSet<T>): boolean {
		if (this.size <= other.size) {
			return this.toArray().every((value) => other.has(value));
		}

		return false;
	}

	/**
	 * Returns `true` if `this` has no elements in common with `other`. This is equivalent to checking for an empty intersection.
	 *
	 * ### Example
	 *
	 * ```ts
	 * expect(new HashSet([2, 5, 1, 3]).isDisjoint(new HashSet([20]))).toBeTruthy();
	 * expect(new HashSet([2, 5, 1, 3]).isDisjoint(new HashSet([2]))).toBeFalsy();
	 * ```
	 */
	public isDisjoint(other: HashSet<T>): boolean {
		return !this.toArray().some((value) => other.has(value));
	}

	/**
	 * Visits the values representing the difference, i.e., the values that are in `this` but not in `other`.
	 *
	 * ### Example
	 *
	 * ```ts
	 * const diff = new HashSet([2, 5, 1, 3]).difference(new HashSet([2]));
	 * expect(diff.toArray()).toEqual([5, 1, 3]);
	 *
	 * const diff = new HashSet([2, 5, 1, 3]).difference(new HashSet([20]));
	 * expect(diff.toArray()).toEqual([2, 5, 1, 3]);
	 * ```
	 */
	public difference(other: HashSet<T>): HashSet<T> {
		let diff = this.clone();

		other.forEach((value) => diff.delete(value));

		return diff;
	}

	/**
	 * Visits the values representing the symmetric difference, i.e., the values that are in `this` or in `other` but not in both.
	 *
	 * ### Example
	 *
	 * ```ts
	 * const diff = new HashSet([1, 2, 3]).symmetricDifference(new HashSet([1, 2, 3]));
	 * expect(diff.toArray()).toEqual([]);
	 *
	 * const diff = new HashSet([1, 2, 3, 5]).symmetricDifference(new HashSet([1, 2, 3, 4]));
	 * expect(diff.toArray()).toEqual([5, 4]);
	 * ```
	 */
	public symmetricDifference(other: HashSet<T>): HashSet<T> {
		const diffSelf = this.difference(other);
		const diffOther = other.difference(this);

		return diffSelf.union(diffOther);
	}

	/**
	 * Visits the values representing the intersection, i.e., the values that are both in `this` and `other`.
	 *
	 * ### Example
	 *
	 * ```ts
	 * const intersection = new HashSet([1, 2, 3]).intersection(new HashSet([4, 5]));
	 * expect(intersection.toArray()).toEqual([]);
	 *
	 * const intersection = new HashSet([1, 2, 3]).intersection(new HashSet([4, 2, 3, 4]));
	 * expect(intersection.toArray()).toEqual([2, 3]);
	 * ```
	 */
	public intersection(other: HashSet<T>): HashSet<T> {
		let inters = new HashSet<T>();

		other.forEach((value) => this.has(value) && inters.add(value));

		return inters;
	}

	/**
	 * Visits the values representing the union, i.e., all the values in `this` or `other`, without duplicates.
	 *
	 * ### Example
	 *
	 * ```ts
	 * const diff = new HashSet([2, 5, 1, 3]).union(new HashSet([20]));
	 * expect(diff.toArray()).toEqual([2, 5, 1, 3, 20]);
	 *
	 * const diff = new HashSet([2, 5, 1, 3]).union(new HashSet([2, 20]));
	 * expect(diff.toArray()).toEqual([2, 5, 1, 3, 20]);
	 * ```
	 */
	public union(other: HashSet<T>): HashSet<T> {
		return new HashSet<T>(this.toArray().concat(other.toArray()));
	}

	/**
	 * Clears the set, returning all elements in an `Iterable`.
	 */
	public drain(): Array<T> {
		const elements = [...this];

		this.clear();

		return elements;
	}

	public drainFilter<F extends (value: T, index: number) => boolean>(
		fn: F,
	): Array<T> {
		return this.drain().filter(fn);
	}

	public isEmpty(): boolean {
		return this.size === 0;
	}
}
