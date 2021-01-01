import { ResultVariants } from "./types";
import { None, Some } from "./optionValue";
import { Option } from "./option";

export class Result<T, E> {
	private type: ResultVariants;
	private error?: E;
	private data?: T;

	protected constructor(type: ResultVariants, content: T | E) {
		this.type = type;
		if (type === "ok") {
			this.data = content as T;
		} else {
			this.error = content as E;
		}
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
	 * Converts from `Result<T, E>` to `Option<T>`.
	 *
	 * Converts `self` into an `Option<T>`, consuming `self`, and discarding the error, if any.
	 *
	 * ### Example
	 * ```ts
	 * const ok = new Ok("ok");
	 * expect(ok.ok()).toEqual(Some("ok"));
	 *
	 * const err = new Err("err");
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
	 * const ok = new Ok("ok");
	 * expect(ok.err()).toEqual(None());
	 *
	 * const err = new Err("err");
	 * expect(err.err()).toEqual(Some("err"));
	 * ```
	 */
	public err(): Option<E> {
		if (this.isOk()) return None();

		return Some(this.error);
	}

	/**
	 * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
	 * leaving an `Err` value untouched.
	 * This function can be used to compose the results of two functions.
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

	 * const y: Result<string, string> = new Err("BaR");
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
	 * const x: Result<number, number> = new Ok(2);
	 * expect(x.mapErr(stringify)).toEqual(new Ok(2));
	 *
	 * const y: Result<number, number> = new Err(13);
	 * expect(y.mapErr(stringify)).toEqual(new Err("error code: 13"));
	 * ```
	 */
	public mapErr<F>(fn: (err: E) => F): Result<T, F> {
		if (this.isOk()) return new Ok(this.data);

		return new Err(fn(this.error));
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
