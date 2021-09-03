import clone from "clone-deep";

import { Clone, unwrapFailed } from "../utils";
import { None, Some, Option } from "../Option";

interface ResultMatch<T,E,A> {
	ok: (ok: T) => A;
	err: (err: E) => A;
}
export type Lazy<A> = () => A 
export type Fn<A,B> = (_:A) => B
/**
 * Error handling with the Result type.
 *
 * `Result<T, E>` is the type used for returning and propagating errors.
 * `Ok(T)`, representing success and containing a value, and `Err(E)`,
 * representing error and containing an error value.
 *
 * @category Result
 */
const id = <T>(x:T) => x
type EitherType<T,E> = <A>(ifErr: Fn<E,A>, ifOk: Fn<T,A>) => A
const toClone = <A,B>(f:Fn<A,B>) => (x:A): B => f(clone(x))

export class Result<T, E> implements Clone<Result<T, E>> {

	private either: EitherType<T,E>

	private constructor(either: EitherType<T,E>) {
		this.either = either
	}
	public static mkOk = <T,E>(ok:T) => 
		new Result(<A>(_: Fn<E,A>, ifOk: Fn<T,A>): A => ifOk(ok))
	public static mkErr = <T,E>(err:E) => 
		new Result(<A>(ifErr: Fn<E,A>,_: Fn<T,A>): A => ifErr(err))

	/** Returns `true` if the result is `Ok`. */
	public isOk = (): boolean => this.either(_ => false, _ => true)

	/** Returns `true` if the result is `Err`. */
	public isErr = (): boolean => !this.isOk
	public clone = (): Result<T,E> =>
		this.either(
			err => {const errclone = err; return Err(errclone)},
			ok  => {const okclone  =  ok; return Ok(okclone)})
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
	public match = <A>({ok,err}: ResultMatch<T,E,A>): A => 
		this.either(e => err(clone(e)), o => ok(clone(o)))	
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
	public expect = (msg: string): T | never =>
		this.either(err => unwrapFailed(msg, clone(err)), clone)
	/**
	 * Returns the contained Err value, consuming the self value.
	 *
	 * ### Panics
	 * Panics if the value is an Ok, with a panic message including the passed message, and the content of the Ok.
	 */
	public expectErr = (msg: string): E | never =>
		this.either(clone, ok => unwrapFailed(msg, clone(ok)))
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
	public ok = (): Option<T> => this.either(_ => None(),Some)
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
	public err = (): Option<E> => this.either(Some,_ => None())
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
	public unwrap = (): T | never =>
		this.either(
			err => unwrapFailed("called `Result.unwrap()` on a `Error` value", err),
			clone)
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
	public unwrapErr = (): E | never =>
		this.either(clone,
			err => unwrapFailed("called `Result.unwrap_err()` on an `Ok` value", err))
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
	public unwrapOr = (ifErr: T): T => this.either(_ => ifErr,clone)
	/**
	 * Returns the contained `Ok` value or computes it from a closure.
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok("OK").unwrapOrElse(() => "OK")).toEqual("OK");
	 * expect(Err("Error").unwrapOrElse(() => "Else")).toEqual("Else");
	 * ```
	 */
	public unwrapOrElse = (ifErr: Lazy<T>): T => 
		this.either(_ => ifErr(),clone)
	/**
	 * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
	 * leaving an `Err` value untouched.
	 * This function may be used to safely apply function to a result of computation that may fail.
	 *
	 * Properties: 
	 * ```
	 * // identity 
	 * x.map(y => y) = x
	 * // composition
	 * x.map(f).map(g) = x.map(y => g(f(y)))
	 * ```	
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
	public map = <U>(f: Fn<T,U>): Result<U,E> => 
		this.andThen(x => Ok(f(clone(x))))
	/**
	 * Replaces the Ok value, if present, by the value given in parameter.
	 * 
	 * ### Example
	 * ```ts
	 * expect(Ok(50).replace("Bob").unwrap())
	 * .toEqual("Bob");
	 * 
	 * expect(Err("Charlie").replace("Bob").unwrapErr())
	 * .toEqual("Charlie");
	 * ```
	 */
	public replace = <U>(on: U): Result<U,E> => this.map(_ => on)
	/**
	 * Applies a function to the contained value (if `Ok`), or returns the provided default (if `Err`).
	 *
	 * Arguments passed to `mapOr` are eagerly evaluated;
	 * if you are passing the result of a function call,
	 * it is recommended to use `map_or_else`, which is lazily evaluated.
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok("foo").mapOr(42, v => v.length)).toEqual(3);
	 * 
	 * expect(Err("bar").mapOr(42, v => v.length)).toEqual(42);
	 * ```
	 */
	public mapOr = <U>(ifErr: U, f: Fn<T,U>): U =>
		this.either(_ => ifErr, toClone(f))
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
	public mapOrElse = <U>(ifErr: Fn<E,U>, ifOk: Fn<T,U>): U =>
		this.either(toClone(ifErr), toClone(ifOk))
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
	public mapErr = <F>(f: Fn<E,F>): Result<T,F> =>
		this.either(
			err => Err(f(clone(err))),
			ok  => Ok(ok))
	/**
	 * Calls `f` if the result is Ok, otherwise returns the Err value of self.
	 *
	 * This function may be used to compose computatuions, that may fail on each step.
	 * 
	 * `andThen`, `Ok`, and `Err` allow to build a control flow based on Result values.
	 *
	 * Also known in another languages as  **flatMap** because: `x.andThen(f) = Result.flatten(x.map(f))`
	 *
	 * Properties: 
	 * ```
	 * // right identity 
	 * x.andThen(Ok) = x
	 * // left identity
	 * Ok(x).andThen(f) = f(x) 
	 * // associativity
	 * x.andThen(y => f(y).andThen(g)) = x.andThen(f).andThen(g)
	 * ```
	 * 
	 * ### Example
	 * ```ts
	 * const val = 25
	 * const square = (x: number) => x * x
	 * const add5 = (x: number) => x + 5
	 * 
	 * // 25 * 25 => 625 + 5 => 630
	 * const result = Ok(val)
	 * 	.andThen(x => Ok(square(x)))
	 * 	.andThen(x => Ok(add5(x)))
	 * expect(result.unwrap()).toEqual(add5(square(val)))
	 * ```
	 */
	public andThen = <U>(f: Fn<T,Result<U,E>>): Result<U, E> =>
		this.either(err => Err(err),ok => f(clone(ok)))
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
	 * expect(Result.transpose(x)).toEqual(y);
	 * ```
	 */
	public static transpose = <T,E>(x: Result<Option<T>, E>): Option<Result<T, E>> =>
		x.either(
			(err: E) => Some(Err(err)), 
			(ok: Option<T>) => ok.mapOr(
				None(),
				(val:T) => Some(Ok(val))))
	/**
	 * Converts from `Result<Result<T, E>, E>` to `Result<T, E>`
	 *
	 * ### Example
	 * ```ts
	 * expect(Result.flatten(Ok(Ok(50))).toEqual(Ok(50));
	 * expect(Result.flatten(Ok(50)).unwrap()).toEqual(50);
	 *
	 * expect(Result.flatten(Ok(Err("Error")))).toEqual(Err("Error"));
	 * expect(Result.flatten(Err("Error"))).toEqual(Err("Error"));
	 * ```
	 */
	public static flatten = <T,E>(x: Result<Result<T,E>,E>): Result<T,E> =>
		x.andThen(id)
	/**
	 * Returns a string representation of an object.
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
	public toString = () =>
		this.either(
			err =>`Err(${(err as unknown as object).toString()})`,
			ok => `Ok(${(ok as unknown as object).toString()})`)
}

export const Ok = Result.mkOk
export const Err = Result.mkErr