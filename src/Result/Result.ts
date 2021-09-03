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
const id = <T>(x:T) => x
type EitherType<T,E> = <A>(ifErr: Fn<E,A>, ifOk: Fn<T,A>) => A
const toClone = <A,B>(f:Fn<A,B>) => (x:A): B => f(clone(x))

// Required to be comparable
export interface Sum<A,B>{
	either<C>(left:Fn<A,C>,right:Fn<B,C>): C
}
export class Left<A,B> implements Sum<A,B>{
	readonly left: A
	either<C>(left:Fn<A,C>, _:Fn<B,C>): C {
		return left(this.left)
	}
	constructor(x:A){ this.left = x }
}
export class Right<A,B> implements Sum<A,B>{
	readonly right : B
	either<C>(_:Fn<A,C>, right:Fn<B,C>): C {
		return right(this.right)
	}
	constructor(x:B){ this.right = x }
}

export class Result<T, E> implements Clone<Result<T, E>> {
	readonly val: Sum<E,T> // this value should be comparable
	either<C>(ifErr:Fn<E,C>, ifOk:Fn<T,C>): C {
		return this.val.either(ifErr,ifOk)
	}
	private constructor(val : Sum<E,T>) {
		this.val = val
	}
	public static mkOk = <T,E>(ok:T) => 
		new Result(new Right<E,T>(ok))
	public static mkErr = <T,E>(err:E) => 
		new Result(new Left<E,T>(err))

	isOk(): boolean {
		return this.either(_ => false, _ => true)
	}
	isErr(): boolean{
		return !this.isOk()
	}
	clone(): Result<T,E>{
		return this.either(
			err => {const errclone = err; return Err(errclone)},
			ok  => {const okclone  =  ok; return Ok(okclone)})
	}
	match<A>({ok,err}: ResultMatch<T,E,A>): A {
		return this.either(e => err(clone(e)), o => ok(clone(o)))
	}
	expect(msg: string): T | never {
		return this.either(err => unwrapFailed(msg, clone(err)), clone)
	}
	expectErr(msg: string): E | never {
		return this.either(clone, ok => unwrapFailed(msg, clone(ok)))
	}
	ok(): Option<T> {
		return this.either(_ => None(),Some)
	}
	err(): Option<E>{
		return this.either(Some,_ => None())
	}
	unwrap(): T | never {
		return this.either(
			err => unwrapFailed("called `Result.unwrap()` on a `Error` value", err),
			clone)
	}
	unwrapErr(): E | never { 
		return this.either(clone,
			err => unwrapFailed("called `Result.unwrap_err()` on an `Ok` value", err))
	}
	unwrapOr(ifErr: T): T {
		return this.either(_ => ifErr,clone)
	}

	unwrapOrElse(ifErr: Lazy<T>): T {
		return  this.either(_ => ifErr(),clone)
	}
	map<U>(f: Fn<T,U>): Result<U,E>{
		return this.andThen(x => Ok(f(clone(x))))
	}
	replace<U>(on: U): Result<U,E> {
		return this.map(_ => on)
	}
	mapOr<U>(ifErr: U, f: Fn<T,U>): U {
		return this.either(_ => ifErr, toClone(f))
	}
	mapOrElse<U>(ifErr: Fn<E,U>, ifOk: Fn<T,U>): U {
		return this.either(toClone(ifErr), toClone(ifOk))
	}
	mapErr<F>(f: Fn<E,F>): Result<T,F> {
		return this.either(
			err => Err(f(clone(err))),
			ok  => Ok(ok))
	}
	ap<U>(fn: Result<Fn<T,U>,E>): Result<U,E> {
		return this.andThen(x => fn.map(f => f(x)))
	}		
	map2<U,A>(another: Result<U,E>, f: Fn2<T,U,A>): Result<A,E> {
		return this.andThen(x => another.map(y => f(clone(x),clone(y))))
	}
	zip<U>(withVal: Result<U,E>): Result<[T, U],E> {
		return this.map2(withVal, (x,y) => [x,y])
	}
	andThen<U>(f: Fn<T,Result<U,E>>): Result<U, E> {
		return this.either(err => Err(err),ok => f(clone(ok)))
	}
	filter(predicate: Fn<T,boolean>, err: E): Result<T,E> {
		return this.andThen(x => predicate(x) ? Ok<T,E>(x) : Err<T,E>(err))
	}
	public static transpose = <T,E>(x: Result<Option<T>, E>): Option<Result<T, E>> =>
		x.either(
			(err: E) => Some(Err(err)), 
			(ok: Option<T>) => ok.mapOr(
				None(),
				(val:T) => Some(Ok(val))))

	public static flatten = <T,E>(x: Result<Result<T,E>,E>): Result<T,E> =>
		x.andThen(id)


	public static swap = <T,E>(x: Result<T,E>): Result<E,T> =>
		x.either(err => Ok<E,T>(err), ok => Err<E,T>(ok))

	toString (){
		return this.either(
			err =>`Err(${(err as unknown as object).toString()})`,
			ok => `Ok(${(ok as unknown as object).toString()})`)
	}
}

export const Ok = Result.mkOk
export const Err = Result.mkErr