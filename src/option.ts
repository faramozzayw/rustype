import clone from "clone-deep";

import { OptionType } from "./types";
import { Some, None } from "./optionValue";
import { identity } from "./convert";

export class Option<T> {
	private data: OptionType<T>;

	constructor(data: OptionType<T>) {
		this.data = data;
	}

	private clone() {
		return clone(this.data);
	}

	/** Returns `true` if the option is a `Some` value. */
	public isSome(): boolean {
		return Boolean(this.data);
	}

	/** Returns `true` if the option is a `None` value. */
	public isNone(): boolean {
		return !this.isSome();
	}

	/**
	 * Returns the contained Some value, consuming the self value.
	 *
	 * ### Throw an error
	 *
	 * Panics if the value is a `None` with a custom panic message provided by msg. [`Error`]
	 */
	public expect(msg: string): T | never {
		if (this.isNone()) {
			throw new Error(msg);
		}

		return this.clone();
	}

	/**
	 * Returns the contained `Some` value, consuming the self value.
	 *
	 * ### Throw an error
	 *
	 * Throw an error if the self value equals `None`. [`TypeError`]
	 */
	public unwrap(): T | never {
		if (this.isNone()) {
			throw TypeError("called `Option::unwrap()` on a `None` value");
		}

		return this.data;
	}

	/**
	 * Returns the contained `Some` value or a provided default.
	 *
	 * ### Example
	 * ```ts
	 * const some = Some("SOME");
	 * expect(some.unwrapOrElse(() => "NONE")).toEqual("SOME");
	 * ```
	 */
	public unwrapOr(defaultVal: T): T {
		if (this.isNone()) return defaultVal;

		return this.data;
	}

	/**
	 * Returns the contained `Some` value or computes it from a closure.
	 *
	 * ### Example
	 * ```ts
	 * const none = None();
	 * expect(none.unwrapOrElse(() => "NONE")).toEqual("NONE");
	 * ```
	 */
	public unwrapOrElse<F extends () => T>(fn: F): T {
		if (this.isNone()) {
			return fn();
		}

		return this.data;
	}

	/**
	 * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.
	 *
	 * ### Example
	 * ```ts
	 * const some = Some({ isSome: true });
	 *
	 * const mappedSome = some.map(item => ({
	 * 	data: !item.isSome
	 * }));
	 *
	 * expect(mappedSome.unwrap()).toEqual({
	 * 	data: false
	 * });
	 * ```
	 */
	public map<U, F extends (data: T) => U>(fn: F): Option<U> {
		if (this.isNone()) return None();

		return Some(fn(this.clone()));
	}

	/**
	 * Applies a function to the contained value (if any), or returns the provided default (if not).
	 * 
	 * ### Example
	 * ```ts
	 *	const defaultStatus: number = 500;

	 *	const some = Some({ status: 200 });
	 *	const mappedSome = some.mapOr(defaultStatus, (data) => data.status);
	 *	expect(mappedSome).toEqual(200);
	 * ```
	*/
	public mapOr<U, F extends (data: T) => U>(defaultVal: U, fn: F): U {
		if (this.isNone()) return defaultVal;

		return fn(this.clone());
	}

	/** Applies a function to the contained value (if any), or computes a default (if not). */
	public mapOrElse<U, D extends () => U, F extends (data: T) => U>(
		defaultFn: D,
		fn: F,
	): U {
		if (this.isNone()) return defaultFn();

		return fn(this.clone());
	}

	/**
	 * Returns None if the option is `None`, otherwise calls f with the wrapped value and returns the result.
	 *
	 * Some languages call this operation **flatmap**.
	 */
	public andThen<U extends T, F extends (data: T) => Option<U>>(
		fn: F,
	): Option<U> {
		if (this.isNone()) return None();

		return fn(this.clone());
	}

	/**>
	 * Returns `None` if the option is `None`, otherwise calls `predicate` with the wrapped value and returns:
	 * - [`Some(t)`] if `predicate` returns `true` (where `t` is the wrapped value), and
	 * - `None` if `predicate` returns `false`.
	 */
	public filter<P extends (data: T) => boolean>(predicate: P): Option<T> {
		if (this.isNone()) return None();

		const clone = this.clone();
		if (predicate(clone)) {
			return Some(clone);
		}

		return None();
	}

	/**
	 * Replaces the actual value in the option by the value given in parameter,
	 * returning the old value if present, leaving a `Some` in its place without
	 * deinitializing either one.
	 *
	 * ### Example
	 * ```ts
	 * const some = Some(50);
	 * expect(some.unwrap()).toEqual(50);
	 *
	 * const oldSome = some.replace(250);
	 * expect(oldSome.unwrap()).toEqual(50);
	 * expect(some.unwrap()).toEqual(250);
	 * ```
	 */
	public replace(value: T): Option<T> {
		const old = this.clone();
		this.data = value;
		return Some(old);
	}

	/**
	 *  Zips `self` with another `Option`.
	 *
	 * If `self` is `Some(s)` and other is `Some(o)`, this method returns `Some((s, o))`.
	 * Otherwise, `None` is returned.
	 *
	 * ### Example
	 * ```ts
	 * const x = Some(1);
	 * const y = Some("hi");
	 * const z = None();
	 *
	 * expect(x.zip(y)).toEqual(Some([1, "hi"]));
	 * expect(x.zip(z)).toEqual(None());
	 * ```
	 */
	public zip<U>(other: Option<U>): Option<[T, U]> {
		if (this.isNone() || other.isNone()) return None();

		return Some([this.unwrap(), other.unwrap()]);
	}

	/**
	 * Converts from Option<Option<T>> to Option<T>
	 *
	 * ### Example
	 * ```ts
	 * expect(Some(Some(Some(50))).flatten()).toEqual(Some(Some(50)));
	 * expect(Some(Some(50)).flatten()).toEqual(Some(50));
	 *
	 * expect(Some(50).flatten()).toEqual(Some(50));
	 * expect(Some(50).flatten().unwrap()).toEqual(50);
	 *
	 * expect(Some(None()).flatten()).toEqual(None());
	 * expect(None().flatten()).toEqual(None());
	 * ```
	 */
	public flatten(): Option<T> {
		if (this.isNone()) return None();

		if (this.data instanceof Option) {
			return this.data;
		}

		return Some(this.data);
	}

	/** Returns `None` if the option is `None`, otherwise returns `optb`. */
	private and<U>(optb: Option<U>): Option<U> {
		if (this.isNone()) return None();

		return optb;
	}
}
