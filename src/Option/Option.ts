import clone from "clone-deep";

import { OptionType } from "../types";
import { Some, None } from "./values";

import { Ok, Err, Result } from "../Result";
import { unwrapFailed } from "../utils/unwrap-failed";
import { Clone } from "../utils";

interface OptionMatch<T, ReturnSome, ReturnNone> {
	some?: (some: T) => ReturnSome;
	none?: () => ReturnNone;
}

/**
 * Type `Option` represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.
 * `Option` types are very common in Rust code, as they have a number of uses:
 *
 * - Initial values
 * - Return value for otherwise reporting simple errors, where `None` is returned on error
 * - Optional struct fields
 * - Optional function arguments
 * - Nullable values
 * - Swapping things out of difficult situations
 *
 * @category Option
 */
export class Option<T> implements Clone<Option<T>> {
	/** @ignore */
	private data: OptionType<T>;

	/** @ignore */
	constructor(data: OptionType<T>) {
		this.data = data;
	}

	public clone() {
		return new Option<T>(clone(this.data));
	}

	private cloneInnerValue(): T {
		return clone<T>(this.data as T);
	}

	/**
	 * Returns the "default value" for a Option<T> => `None`.
	 */
	public static makeDefault() {
		return None();
	}

	/**
	 * Pattern match to retrieve the value
	 *
	 * @template Some - return type of the `Some` branch
	 * @template None - return type of the `None` branch
	 *
	 * ### Example
	 * ```ts
	 * expect(Some("ok").match({
	 * 		some: some => some.length,
	 * 		none: () => "error",
	 * })).toEqual(2);
	 *
	 * expect(None().match({
	 * 		some: _ => "some",
	 * 		none: () => "Something bad wrong",
	 * })).toEqual("Something bad wrong")
	 *
	 * expect(None().match({
	 * 		some: _ => 200,
	 * 		none: () => 404,
	 * })).toEqual(404)
	 * ```
	 */
	public match<Some, None>({
		some,
		none,
	}: OptionMatch<T, Some, None>): Some | None | null {
		if (this.isNone()) return none ? none() : null;

		return some ? some(this.cloneInnerValue()) : null;
	}

	/** Returns `true` if the option is a `Some` value. */
	public isSome(): boolean {
		if (typeof this.data === "undefined" || this.data === null) {
			return false;
		}

		return true;
	}

	/** Returns `true` if the option is a `None` value. */
	public isNone(): boolean {
		return !this.isSome();
	}

	/**
	 * Returns the contained Some value, consuming the self value.
	 *
	 * ### Panics
	 *
	 * Panics if the value is a `None` with a custom panic message provided by msg. [`Error`]
	 */
	public expect(msg: string): T | never {
		if (this.isNone()) {
			throw new Error(msg);
		}

		return this.cloneInnerValue();
	}

	/**
	 * Inserts value into the option
	 *
	 * If the option already contains a value, the old value is dropped.
	 *
	 * @unsafe
	 *
	 * ### Example
	 * ```ts
	 * expect(None().unsafe_insert(5)).toEqual(Some(5));
	 * expect(Some(0).unsafe_insert(65)).toEqual(Some(65));
	 * ```
	 */
	public unsafe_insert(val: T): Option<T> {
		this.data = val;

		return this;
	}

	/**
	 * Returns the contained `Some` value, consuming the self value.
	 *
	 * ### Panics
	 *
	 * Panics if the self value equals `None`. [`TypeError`]
	 *
	 * ### Example
	 * ```ts
	 * expect(Some(5).unwrap()).toEqual(5);
	 * expect(Some([1, 3, 4]).unwrap()).toEqual([1, 3, 4]);
	 * expect(None().unwrap).toThrow(TypeError);
	 * ```
	 */
	public unwrap(): T | never {
		if (this.isNone()) {
			throw TypeError("called `Option::unwrap()` on a `None` value");
		}

		return this.data as T;
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

		return this.data as T;
	}

	/**
	 * Returns the contained `Some` value or computes it from a closure.
	 *
	 * ### Example
	 * ```ts
	 * expect(None().unwrapOrElse(() => "NONE")).toEqual("NONE");
	 * ```
	 */
	public unwrapOrElse<F extends () => T>(fn: F): T {
		if (this.isNone()) {
			return fn();
		}

		return this.data as T;
	}

	/**
	 * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.
	 *
	 * ### Example
	 * ```ts
	 * const mappedSome = Some({ isSome: true }).map(item => ({ data: !item.isSome }));
	 *
	 * expect(mappedSome.unwrap()).toEqual({ data: false });
	 * ```
	 */
	public map<U, F extends (data: T) => U>(fn: F): Option<U> {
		if (this.isNone()) return None<U>();

		return Some(fn(this.cloneInnerValue()));
	}

	/**
	 * Applies a function to the contained value (if any), or returns the provided
	 * default (if not).
	 *
	 * ### Example
	 * ```ts
	 * const defaultStatus: number = 500;
	 *
	 * const some = Some({ status: 200 });
	 * const mappedSome = some.mapOr(defaultStatus, (data) => data.status);
	 * expect(mappedSome).toEqual(200);
	 * ```
	 */
	public mapOr<U, F extends (data: T) => U>(defaultVal: U, fn: F): U {
		if (this.isNone()) return defaultVal;

		return fn(this.cloneInnerValue());
	}

	/**
	 * Applies a function to the contained value (if any), or computes a default (if not).
	 *
	 * ### Example
	 * ```ts
	 * const defaultStatus: number = 500;
	 *
	 * const some = Some({ status: 200 });
	 * const mappedSome = some.mapOrElse(() => defaultStatus, (data) => data.status);
	 * expect(mappedSome).toEqual(200);
	 *
	 * const none = None();
	 * const mappedNone = none.mapOrElse(() => defaultStatus, (data) => data.status);
	 * expect(mappedNone).toEqual(500);
	 * ```
	 */
	public mapOrElse<U, D extends () => U, F extends (data: T) => U>(
		defaultFn: D,
		fn: F,
	): U {
		if (this.isNone()) return defaultFn();

		return fn(this.cloneInnerValue());
	}

	/**
	 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
	 *
	 * Arguments passed to `okOr` are eagerly evaluated; if you are passing the result of a function
	 * call, it is recommended to use `okOrElse`, which is lazily evaluated.
	 *
	 * ### Example
	 * ```ts
	 * expect(Some(5).okOr("Failed")).toEqual(Ok(5));
	 * expect(None().okOr("Failed")).toEqual(Err("Failed"));
	 * ```
	 */
	public okOr<E>(err: E): Result<T, E> {
		if (this.isSome()) {
			return Ok(this.cloneInnerValue());
		}

		return Err(err);
	}

	/**
	 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
	 *
	 * ### Example
	 * ```ts
	 * const failFn = () => "Failed";
	 *
	 * expect(Some(5).okOrElse(failFn)).toEqual(Ok(5));
	 * expect(None().okOrElse(failFn)).toEqual(Err("Failed"));
	 * ```
	 */
	public okOrElse<E, F extends () => E>(fn: F) {
		if (this.isNone()) {
			return Err(fn());
		}

		return Ok(this.cloneInnerValue());
	}

	/**
	 * Returns None if the option is `None`, otherwise calls f with the wrapped
	 * value and returns the result.
	 *
	 * Some languages call this operation **flatmap**.
	 *
	 * ### Example
	 * ```ts
	 * const some = Some(25); const sq = (x: number) => Some(x * x);
	 *
	 * // 25 * 25 => 625 + 5 => 630
	 * const result = some.andThen(sq).andThen((x) => Some(x + 5));
	 * expect(result.unwrap()).toEqual(630);
	 * ```
	 */
	public andThen<U extends T, F extends (data: T) => Option<U>>(
		fn: F,
	): Option<U> {
		if (this.isNone()) return None();

		return fn(this.cloneInnerValue());
	}

	/**
	 * > Returns `None` if the option is `None`, otherwise calls `predicate` with
	 * the wrapped value and returns: - [`Some(t)`] if `predicate` returns `true`
	 * (where `t` is the wrapped value), and - `None` if `predicate` returns `false`.
	 *
	 * ### Example
	 * ```ts
	 * const result = Some({ status: 200 })
	 *     .filter((item) => item.status === 200)
	 *     .map((_) => "Ok")
	 *     .unwrapOr("Error");
	 *
	 * expect(result).toEqual("Ok");
	 *
	 * expect(Some(200).filter((item) => item === 200).unwrapOr(500)).toEqual(200);
	 * ```
	 */
	public filter<P extends (data: T) => boolean>(predicate: P): Option<T> {
		if (this.isNone()) return None();

		const clone = this.cloneInnerValue();
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
	 * expect(Some(50).unwrap()).toEqual(50);
	 *
	 * const oldSome = some.replace(250); expect(oldSome.unwrap()).toEqual(50);
	 * expect(some.unwrap()).toEqual(250);
	 * ```
	 */
	public replace(value: T): Option<T> {
		const old = this.cloneInnerValue();
		this.data = value;
		return Some(old);
	}

	/**
	 * Zips `self` with another `Option`.
	 *
	 * If `self` is `Some(s)` and other is `Some(o)`, this method returns `Some((s,
	 * o))`. Otherwise, `None` is returned.
	 *
	 * ### Example
	 * ```ts
	 * const x = Some(1);
	 * const y = Some("hi");
	 * const z = None();
	 *
	 * expect(x.zip(y)).toEqual(Some([1, "hi"])); expect(x.zip(z)).toEqual(None());
	 * ```
	 */
	public zip<U>(other: Option<U>): Option<[T, U]> {
		if (this.isNone() || other.isNone()) return None();

		return Some([this.unwrap(), other.unwrap()]);
	}

	/**
	 * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
	 *
	 * `None` will be mapped to `Ok(None)`. `Some(Ok(_))` and `Some(Err(_))` will
	 * be mapped to `Ok(Some(_))` and `Err(_)`.
	 *
	 * ### Panics Panics if the value is an `Some` where self is not an `Result`,
	 * with a panic message provided by the `Some`'s value.
	 *
	 * ### Example
	 * ```ts
	 * const x: Result<Option<number>, string> = Ok(Some(5));
	 * const y: Option<Result<number, string>> = Some(Ok(5));
	 *
	 * expect(x).toEqual(y.transpose());
	 * ```
	 */
	public transpose<E extends unknown>(): Result<Option<T>, E> {
		if (this.isNone()) return Ok(None());

		if (this.data instanceof Result) {
			if (this.data.isOk()) {
				const innerValue = this.data.unwrap();
				return Ok(Some(innerValue));
			}

			const innerError = this.data.unwrap();
			return Err<E>(innerError);
		} else {
			unwrapFailed(
				"called `Option::transpose()` on an `Some` value where `self` is not an `Result`",
				this.data,
			);
		}
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

	/**
	 * Returns a string representation of an object.
	 *
	 * @override
	 *
	 * ### Example
	 * ```ts
	 * expect(None().toString()).toEqual("None");
	 *
	 * expect(Some(5).toString()).toEqual("Some(5)");
	 * expect(Some(Some(5)).toString()).toEqual("Some(Some(5))");
	 *
	 * // BUT
	 * expect(Some({ code: 15 }).toString()).toEqual("Some([object Object])");
	 * ```
	 */
	public toString() {
		if (this.isNone()) return "None";

		return `Some(${((this.data as unknown) as object).toString()})`;
	}

	/** Returns `None` if the option is `None`, otherwise returns `optb`. */
	private and<U>(optb: Option<U>): Option<U> {
		if (this.isNone()) return None();

		return optb;
	}
}
