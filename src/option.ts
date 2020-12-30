import { OptionType } from "./types";
import { Some, None } from "./optionValue";

export class Option<T> {
	private data: OptionType<T>;

	constructor(data: OptionType<T>) {
		this.data = data;
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
	 * Returns the contained `Some` value, consuming the self value.
	 *
	 * ### Throw an error
	 *
	 * Throw an error (`TypeError`) if the self value equals `None`.
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

		return Some(fn({ ...this.data }));
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

		return fn({ ...this.data });
	}

	/** Applies a function to the contained value (if any), or computes a default (if not). */
	public mapOrElse<U, D extends () => U, F extends (data: T) => U>(
		defaultFn: D,
		fn: F,
	): U {
		if (this.isNone()) return defaultFn();

		return fn({ ...this.data });
	}
}
