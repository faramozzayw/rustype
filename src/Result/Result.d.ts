import clone from "clone-deep";

import { Clone, unwrapFailed } from "../utils";
import { None, Some, Option } from "../Option";
import { Lazy, Fn, Fn2 } from "../types";

interface ResultMatch<T,E,A> {
	ok: (ok: T) => A;
	err: (err: E) => A;
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
declare const id: <T>(x:T) => T
type EitherType<T,E> = <A>(ifErr: Fn<E,A>, ifOk: Fn<T,A>) => A
declare const toClone: <A,B>(f:Fn<A,B>) => (x:A) => B

// Required to be comparable
export interface Sum<A,B>{
	either<C>(left:Fn<A,C>,right:Fn<B,C>): C
}
export class Left<A,B> implements Sum<A,B>{
	readonly left: A
	either<C>(left:Fn<A,C>, _:Fn<B,C>): C
	constructor(x:A)
}
export class Right<A,B> implements Sum<A,B>{
	readonly right : B
	either<C>(_:Fn<A,C>, right:Fn<B,C>): C
	constructor(x:B)
}

export class Result<T, E> implements Clone<Result<T, E>> {
	readonly val: Sum<E,T> // this value should be comparable
	either<C>(ifErr:Fn<E,C>, ifOk:Fn<T,C>): C
	private constructor(val : Sum<E,T>)
	public static mkOk<T,E>(ok:T) : Result<T,E>
	public static mkErr<T,E>(err:E) : Result<T,E>

	/** Returns `true` if the result is `Ok`. */
	isOk(): boolean
	/** Returns `true` if the result is `Err`. */
	isErr(): boolean
	clone(): Result<T,E>
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
	match<A>({ok,err}: ResultMatch<T,E,A>): A
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
	expect(msg: string): T | never
	/**
	 * Returns the contained Err value, consuming the self value.
	 *
	 * ### Panics
	 * Panics if the value is an Ok, with a panic message including the passed message, and the content of the Ok.
	 */
	expectErr(msg: string): E | never
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
	ok(): Option<T>
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
	err(): Option<E>
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
	unwrap(): T | never
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
	unwrapErr(): E | never
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
	unwrapOr(ifErr: T): T
	/**
	 * Returns the contained `Ok` value or computes it from a closure.
	 *
	 * ### Example
	 * ```ts
	 * expect(Ok("OK").unwrapOrElse(() => "OK")).toEqual("OK");
	 * expect(Err("Error").unwrapOrElse(() => "Else")).toEqual("Else");
	 * ```
	 */
	unwrapOrElse(ifErr: Lazy<T>): T
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
	map<U>(f: Fn<T,U>): Result<U,E>
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
	replace<U>(on: U): Result<U,E>
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
	mapOr<U>(ifErr: U, f: Fn<T,U>): U
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
	mapOrElse<U>(ifErr: Fn<E,U>, ifOk: Fn<T,U>): U
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
	mapErr<F>(f: Fn<E,F>): Result<T,F>
	/**
	 * Lifts the function application to a Option.
	 *
	 * Properties: 
	 * ```
	 * // identity
	 * x.ap(Some(id)) = x
	 * // composition
	 * w.ap(v.ap(u.ap(Some(f => g => x => g(f(x)))))) = w.ap(v).ap(u) 
	 * // homomorphism
	 * Some(x).ap(Some(f)) = Some(f(x))
	 * // interchange
	 * Some(x).ap(u) = u.ap(Some(f => f(x)))
	 * ```
	 */
	ap<U>(fn: Result<Fn<T,U>,E>): Result<U,E>
	/**
	 * Lifts the function of two arguments into an Option.
	 *
	 * Properties: 
	 * ```
	 * Some(x).map2(Some(y),f) = Some(f(x,y))
	 * _.map2(_,f) = None()
	 * ```
	 */
	map2<U,A>(another: Result<U,E>, f: Fn2<T,U,A>): Result<A,E>
	/**
	 * Zips Ok values of two Results
	 *
	 * Properties: 
	 * ```
	 * Ok(x).zip(Ok(y) = Ok([x,y])
	 * Err(e).zip(_) = Err(e)
	 * Ok(x).zip(Err(e)) = Err(e)
	 * ```
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
	zip<U>(withVal: Result<U,E>): Result<[T, U],E>
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
	andThen<U>(f: Fn<T,Result<U,E>>): Result<U, E>
	/**
	 * Properties: 
	 * ```
	 * p(x) /\ Ok(x).filter(p) = x 	
	 * _.filter(p) = None()
	 * ```
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
	filter(predicate: Fn<T,boolean>, err: E): Result<T,E>
	/**
	 * Transposes a Result of an Option into an Option of a Result.
	 * The only way to transform Result<Option<T>,E> to Option<Result<T,E>> without losing any information.
	 *
	 * `Ok(None)` will be mapped to None. `Ok(Some(_))` and `Err(_)` will be mapped to `Some(Ok(_))` and `Some(Err(_))`.
	 * 
	 * Properties:
	 * ```
	 * // isomorphism between Result<Option<A>,E> and Option<Result<A,E>>:
	 * Option.transpose(Result.transpose(x)) = x
	 * Result.transpose(Option.transpose(x)) = x
	 * 
	 * // other props:
	 * Result.transpose(Ok(Some(x))) = Some(Ok(x))
	 * Result.transpose(Err(e)) = Some(Ok(e))
	 * Result.transpose(Ok(None())) = None()
	 * ```
	 * 
	 * ### Example
	 * ```ts
	 * const x: Result<Option<number>, string> = Ok(Some(5));
	 * const y: Option<Result<number, string>> = Some(Ok(5));
	 *
	 * expect(Result.transpose(x)).toEqual(y);
	 * ```
	 */
	public static transpose<T,E>(x: Result<Option<T>, E>): Option<Result<T, E>>
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
	public static flatten<T,E>(x: Result<Result<T,E>,E>): Result<T,E>

	/**
	 * Swaps Err and Ok.
	 * 
	 * Properties:
	 * ```
	 * Result.swap(Ok(x)) = Err(x)
	 * Result.swap(Err(x)) = Ok(x)
	 * ```
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
	public static swap<T,E>(x: Result<T,E>): Result<E,T>
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
	public toString(): string
}

export const  Ok: <T,E>(ok: T) => Result<T,E>
export const Err: <T,E>(err:E) => Result<T,E>