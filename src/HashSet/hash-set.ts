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
	 */
	public isDisjoint(other: HashSet<T>): boolean {
		return !this.toArray().some((value) => other.has(value));
	}

	/**
	 * Visits the values representing the difference, i.e., the values that are in `this` but not in `other`.
	 */
	public difference(other: HashSet<T>): HashSet<T> {
		let diff = this.clone();

		other.forEach((value) => diff.delete(value));

		return diff;
	}

	public symmetricDifference(other: HashSet<T>): HashSet<T> {
		const diffSelf = this.difference(other);
		const diffOther = other.difference(this);

		return diffSelf.union(diffOther);
	}

	/**
	 * Visits the values representing the intersection, i.e., the values that are both in `this` and `other`.
	 */
	public intersection(other: HashSet<T>): HashSet<T> {
		let inters = new HashSet<T>();

		inters.forEach((value) => other.has(value) && inters.add(value));

		return inters;
	}

	/**
	 * Visits the values representing the union, i.e., all the values in `this` or `other`, without duplicates.
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
