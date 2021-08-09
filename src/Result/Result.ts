import clone from "clone-deep";

import { unwrapFailed } from "../utils";
import { ResultVariants } from "../types";
import { None, Some, Option } from "../Option";

interface ResultMatch<T, E, Ok, Err> {
	ok?: (ok: T) => Ok;
	err?: (err: E) => Err;
}

/**
 * Error handling with the Result type.
 *
 * `Result<T, E>` is the type used for returning and propagating errors.
 * `Ok(T)`, representing success and containing a value, and `Err(E)`,
 * representing error and containing an error value.
 *
 * @category Result
 */
export class Result<T, E> {
	/** @ignore */
	private type: ResultVariants;
	/** @ignore */
	private error?: E;
	/** @ignore */
	private data?: T;

	/** @ignore */
	protected constructor(type: ResultVariants, content: T | E) {
		this.type = type;
		if (type === "ok") {
			this.data = content as T;
		} else {
			this.error = content as E;
		}
	}

	/**
	 * Returns a copy for `Ok` of the contained value using its own value.
	 * @ignore
	 */
	private cloneOk(): T {
		if (this.isOk()) return clone(this.data);

		throw Error("called `Result::cloneOk()` on a `Error` value");
	}

	/**
	 * Returns a copy for `Err` of the contained value using its own value.
	 * @ignore
	 */
	private cloneErr(): E {
		if (this.isErr()) return clone(this.error);

		throw Error("called `Result::cloneErr()` on a `Ok` value");
	}

	/**
	 * Pattern match to retrieve the value
	 *
	 * @template Ok - return type of the `Ok` branch
	 * @template Err - return type of the `Err` branch
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok("ok").match({
	 * 		ok: some => some.length,
	 * 		err: () => "error",
	 * })).toEqual(2);
	 *
	 * expect(Err("error").match({
	 * 		ok: _ => "ok",
	 * 		err: _ => "Something bad wrong",
	 * })).toEqual("Something bad wrong")
	 *
	 * expect(Err({ code: 404 }).match({  err: err => err.code })).toEqual(404);
	 * expect(Ok("nice").match({  err: _ => "not nice" })).toBeNull();
	 * ```
	 */
	public match<Ok, Err>({
		ok,
		err,
	}: ResultMatch<T, E, Ok, Err>): Ok | Err | null {
		if (this.isErr()) return err ? err(this.cloneErr()) : null;

		return ok ? ok(this.cloneOk()) : null;
	}

	/** Returns `true` if the result is `Ok`. */
	public isOk(): boolean {
		return this.type === "ok";
	}

	/** Returns `true` if the result is `Err`. */
	public isErr(): boolean {
		return this.type === "err";
	}

	/**
	 *
	 * Returns the contained `Ok` value, consuming the `self` value.
	 *
	 * ### Panics
	 * Panics if the value is an `Err`, with a panic message including the passed message, and the content of the `Err`.
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok("ok").expect("Testing expect")).toEqual("ok");
	 *
	 * try {
	 * 	Err("fail result").expect("Testing expect")
	 * } catch (e: unknown) {
	 * 	expect((e as Error).message).toEqual("Testing expect");
	 * }
	 * ```
	 */
	public expect(msg: string): T | never {
		if (this.isErr()) unwrapFailed(msg, this.cloneErr());

		return this.cloneOk();
	}

	/**
	 * Returns the contained Err value, consuming the self value.
	 *
	 * ### Panics
	 * Panics if the value is an Ok, with a panic message including the passed message, and the content of the Ok.
	 */
	public expectErr(msg: string): E | never {
		if (this.isOk()) unwrapFailed(msg, this.cloneOk());

		return this.cloneErr();
	}

	/**
	 * Converts from `Result<T, E>` to `Option<T>`.
	 *
	 * Converts `self` into an `Option<T>`, consuming `self`, and discarding the error, if any.
	 *
	 * ### Example
	 * ```ts
	 * const ok = Ok("ok");
	 * expect(ok.ok()).toEqual(Some("ok"));
	 *
	 * const err = Err("err");
	 * expect(err.ok()).toEqual(None());
	 * ```
	 */
	public ok(): Option<T> {
		if (this.isErr()) return None();

		return Some(this.data);
	}

	/**
	 * Converts from `Result<T, E>` to `Option<E>`.
	 * Converts `self` into an `Option<E>`, consuming `self`,
	 * and discarding the success value, if any.
	 *
	 * ### Example
	 * ```ts
	 * const ok = Ok("ok");
	 * expect(ok.err()).toEqual(None());
	 *
	 * const err = Err("err");
	 * expect(err.err()).toEqual(Some("err"));
	 * ```
	 */
	public err(): Option<E> {
		if (this.isOk()) return None();

		return Some(this.error);
	}

	/**
	 * Returns the contained `Ok` value, consuming the `self` value.
	 *
	 * Because this function may panic, its use is generally discouraged. Instead, prefer to use pattern matching and handle the `Err` case explicitly, or call `unwrap_or`, `unwrap_or_else`, or `unwrap_or_default`.
	 *
	 * ### Panics
	 * Panics if the value is an `Err`, with a panic message provided by the `Err`'s value.
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok(5).unwrap()).toEqual(5);
	 * expect(Ok([1, 3, 4]).unwrap()).toEqual([1, 3, 4]);
	 *
	 * expect(
	 * 	Err({
	 * 		msg: "Random text",
	 * 		code: 15,
	 * 	}).unwrap,
	 * ).toThrow(Error);
	 * ```
	 */
	public unwrap(): T | never {
		if (this.isErr()) {
			unwrapFailed("called `Result::unwrap()` on a `Error` value", this.error);
		}

		return this.data;
	}

	/**
	 * Returns the contained `Err` value, consuming the `self` value.
	 *
	 * ### Panics
	 * Panics if the value is an Ok, with a custom panic message provided by the Ok's value.
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok(5).unwrapErr).toThrow(Error);
	 *
	 * expect(
	 * 	Err({
	 * 		msg: "Random text",
	 * 		code: 15,
	 * 	}).unwrapErr(),
	 * ).toEqual({
	 * 	msg: "Random text",
	 * 	code: 15,
	 * });
	 * ```
	 */
	public unwrapErr(): E | never {
		if (this.isOk())
			unwrapFailed("called `Result::unwrap_err()` on an `Ok` value", this.data);

		return this.error;
	}

	/**
	 * Returns the contained `Ok` value or a provided default.
	 * 
	 * Arguments passed to `unwrap_or` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `unwrap_or_else`, which is lazily evaluated.
	 * 
	 * ### Example
	 * ```ts
	 * expect(
	 * 	Ok({
	 * 		test: true,
	 * 	}).unwrapOr({ test: false }),
	 * ).toEqual({
	 * 	test: true,
	 * });

	 * expect(Err(5).unwrapOr({ test: false })).toEqual({
	 * 	test: false,
	 * });
	 * ```
	 */
	public unwrapOr(defaultVal: T): T {
		if (this.isErr()) return defaultVal;

		return this.data;
	}

	/**
	 * Returns the contained `Ok` value or computes it from a closure.
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok("OK").unwrapOrElse(() => "OK")).toEqual("OK");
	 * expect(Err("Error").unwrapOrElse(() => "Else")).toEqual("Else");
	 * ```
	 */
	public unwrapOrElse<F extends () => T>(fn: F): T {
		if (this.isErr()) {
			return fn();
		}

		return this.data;
	}

	/**
	 * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
	 * leaving an `Err` value untouched.
	 * This function can be used to compose the results of two functions.
	 *
	 * ### Example
	 * ```ts
	 * const x: Result<number, string> = Err("5");
	 * expect(x.map((item) => item * 5)).toEqual(Err("5"));
	 *
	 * const y: Result<number, string> = Ok(5);
	 * expect(y.map((item) => item * 5)).toEqual(Ok(25));
	 * ```
	 */
	public map<U, F extends (data: T) => U>(fn: F): Result<U, E> {
		if (this.isErr()) return new Err(this.error);

		return new Ok(fn(this.data));
	}

	/**
	 * Applies a function to the contained value (if `Ok`), or returns the provided default (if `Err`).
	 *
	 * Arguments passed to `mapOr` are eagerly evaluated;
	 * if you are passing the result of a function call,
	 * it is recommended to use `map_or_else`, which is lazily evaluated.
	 *
	 * ### Example
	 * ```ts
	 * const x = new Ok("foo");
	 * expect(x.mapOr(42 as number, (v) => v.length)).toEqual(3);
	 *
	 * const y = new Err("bar");
	 * expect(y.mapOr(42 as number, (v) => v.length)).toEqual(42);
	 * ```
	 */
	public mapOr<U, F extends (data: T) => U>(defaultValue: U, fn: F): U {
		if (this.isErr()) return defaultValue;

		return fn(this.data);
	}

	/**
	 * Maps a `Result<T, E>` to `U` by applying a function to a contained `Ok` value, 
	 * or a fallback function to a contained `Err` value. 
	 * 
	 * This function can be used to unpack a successful result while handling an error.
	 * 
	 * ### Example
	 * ```ts
	 * const x: Result<string, string> = new Ok("fOo");
	 * expect(
	 * 	x.mapOrElse(
	 * 		(err) => err.toLowerCase(),
	 * 		(v) => v.toUpperCase(),
	 * 	),
	 * ).toEqual("FOO");

	 * const y: Result<string, string> = Err("BaR");
	 * expect(
	 * 	y.mapOrElse(
	 * 		(err) => err.toLowerCase(),
	 * 		(v) => v.toUpperCase(),
	 * 	),
	 * ).toEqual("bar");
	 * ```
	 */
	public mapOrElse<U>(defaultFn: (err: E) => U, fn: (data: T) => U): U {
		if (this.isErr()) return defaultFn(this.error);

		return fn(this.data);
	}

	/**
	 * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err`
	 * value, leaving an `Ok` value untouched.
	 *
	 * This function can be used to pass through a successful result while handling an error.
	 *
	 * ### Examples
	 * ```ts
	 * const stringify = (x: number) => `error code: ${x}`;
	 *
	 * const x: Result<number, number> = Ok(2);
	 * expect(x.mapErr(stringify)).toEqual(Ok(2));
	 *
	 * const y: Result<number, number> = Err(13);
	 * expect(y.mapErr(stringify)).toEqual(Err("error code: 13"));
	 * ```
	 */
	public mapErr<F>(fn: (err: E) => F): Result<T, F> {
		if (this.isOk()) return new Ok(this.data);

		return new Err(fn(this.error));
	}

	/**
	 * Calls op if the result is Ok, otherwise returns the Err value of self.
	 *
	 * This function can be used for control flow based on Result values.
	 *
	 * ### Example
	 * ```ts
	 * const ok = Ok(25);
	 * const sq = (x: number) => Ok(x * x);
	 *
	 * // 25 * 25 => 625 + 5 => 630
	 * const result = ok.andThen(sq).andThen((x) => Ok(x + 5));
	 * expect(result.unwrap()).toEqual(630);
	 * ```
	 */
	public andThen<U extends T, F extends (data: T) => Result<U, E>>(
		fn: F,
	): Result<U, E> {
		if (this.isErr()) return new Err(this.cloneErr());

		return fn(this.cloneOk());
	}

	/**
	 * Transposes a Result of an Option into an Option of a Result.
	 *
	 * `Ok(None)` will be mapped to None. `Ok(Some(_))` and `Err(_)` will be mapped to `Some(Ok(_))` and `Some(Err(_))`.
	 *
	 * ### Panics
	 * Panics if the value is an `Ok` where self is not an `Option`, with a panic message provided by the `Ok`'s value.
	 *
	 * ### Example
	 * ```ts
	 * const x: Result<Option<number>, string> = Ok(Some(5));
	 * const y: Option<Result<number, string>> = Some(Ok(5));
	 *
	 * expect(x.transpose()).toEqual(y);
	 * ```
	 */
	public transpose(): Option<Result<T, E>> {
		if (this.isErr()) return Some(new Err(this.cloneErr()));

		if (this.data instanceof Option) {
			if (this.data.isSome()) {
				const innerValue = this.data.unwrap();
				return Some(new Ok(innerValue));
			}

			return None();
		} else {
			unwrapFailed(
				"called `Result::transpose()` on an `Ok` value where `self` is not an `Option`",
				this.data,
			);
		}
	}

	/**
	 * Converts from `Result<Result<T, E>, E>` to `Result<T, E>`
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok(Ok(50)).flatten()).toEqual(Ok(50));
	 * expect(Ok(50).flatten().unwrap()).toEqual(50);
	 *
	 * expect(Ok(Err("Error")).flatten()).toEqual(Err("Error"));
	 * expect(Err("Error").flatten()).toEqual(Err("Error"));
	 * ```
	 */
	public flatten(): Result<T, E> {
		if (this.isErr()) return new Err(this.cloneErr());

		if (this.data instanceof Result) {
			return this.data;
		}

		return new Ok(this.cloneOk());
	}

	/**
	 * Returns a string representation of an object.
	 *
	 * @override
	 *
	 * ### Example
	 * ```ts
	 * expect(Err(5).toString()).toEqual(`Err(5)`);
	 * expect(Err(Err("Error")).toString()).toEqual(`Err(Err(Error))`);
	 *
	 * expect(Ok(5).toString()).toEqual("Ok(5)");
	 * expect(Ok(Ok(5)).toString()).toEqual("Ok(Ok(5))");
	 *
	 * // BUT
	 * expect(Err({ code: 15 }).toString()).toEqual("Err([object Object])");
	 * ```
	 */
	public toString() {
		return this.isOk()
			? `Ok(${this.data.toString()})`
			: `Err(${this.error.toString()})`;
	}
}

export class Err<E> extends Result<any, E> {
	constructor(error: E) {
		super("err", error);
	}
}

export class Ok<T> extends Result<T, any> {
	constructor(data: T) {
		super("ok", data);
	}
}
