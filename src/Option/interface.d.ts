import { Some, None } from "./values";

import { Result } from "../Result";

interface OptionMatch<T, ReturnSome, ReturnNone> {
	some: (some: T) => ReturnSome;
	none: () => ReturnNone;
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
export interface Option<T> {
	// kind: symbol;

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
	match<Some, None>({ some, none }: OptionMatch<T, Some, None>): Some | None;

	/** Returns `true` if the option is a `Some` value. */
	isSome(): boolean;

	/** Returns `true` if the option is a `None` value. */
	isNone(): boolean;

	/**
	 * Returns the contained Some value, consuming the self value.
	 *
	 * @throws
	 *
	 * Will throw if the value is a `None` with a custom panic message provided by msg. [`Error`]
	 */
	expect(msg: string): T | never;

	/**
	 * Returns the contained `Some` value, consuming the self value.
	 *
	 * @throws {TypeError} Will throw if the self value equals `None`.
	 *
	 * ### Example
	 * ```ts
	 * expect(Some(5).unwrap()).toEqual(5);
	 * expect(Some([1, 3, 4]).unwrap()).toEqual([1, 3, 4]);
	 * expect(None().unwrap).toThrow(TypeError);
	 * ```
	 */
	unwrap(): T | never;

	/**
	 * Returns the contained `Some` value or computes it from a closure.
	 *
	 * ### Example
	 * ```ts
	 * expect(none.unwrapOr({ test: false })).toEqual({ test: false });
	 * ```
	 */
	unwrapOr(defaultVal: T): T;

	/**
	 * Returns the contained `Some` value or a provided default.
	 *
	 * ### Example
	 * ```ts
	 * const some = Some("SOME");
	 * expect(some.unwrapOrElse(() => "NONE")).toEqual("SOME");
	 * ```
	 */
	unwrapOrElse<F extends () => T>(fn: F): T;

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
	map<U>(fn: (data: T) => U): Option<U>;

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
	mapOr<U>(defaultVal: U, fn: (data: T) => U): U;

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
	mapOrElse<U>(defaultFn: () => U, fn: (data: T) => U): U;

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
	okOr<E>(err: E): Result<T, E>;

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
	okOrElse<E>(fn: () => E): Result<T, E>;

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
	andThen<U extends T>(fn: (data: T) => Option<U>): Option<U>;

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
	filter(predicate: (data: T) => boolean): Option<T>;

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
	replace(value: T): Option<T>;

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
	zip<U>(other: Option<U>): Option<[T, U]>;

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
	transpose<E extends unknown>(): Result<Option<T>, E>;

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
	flatten(): Option<T>;

	/** Returns `None` if the option is `None`, otherwise returns `optb`. */
	and<U>(optb: Option<U>): Option<U>;

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
	toString(): string;
}
