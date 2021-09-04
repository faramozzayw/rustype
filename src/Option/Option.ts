import clone from "clone-deep";
import { Ok, Err, Result, Right, Left, Sum } from "../Result";
import { Clone } from "../utils";
import { Lazy, Fn, Fn2 } from "../";

export interface OptionMatch<T,A> {
	some: (some: T) => A;
	none: () => A;
}
const toClone = <A,B>(f:Fn<A,B>) => (x:A): B => f(clone(x))

export class Option<T> implements Clone<Option<T>> {
	readonly val: Sum<null,T> // this value should be comparable

	maybe<A>(ifNone: Lazy<A>, ifSome: Fn<T,A>): A {
		return this.val.either((_:null) => ifNone(),ifSome)
	}

	static mkSome = <T>(x:T) => 
		new Option<T>(new Right<null,T>(x))
	static mkNone = <T>() => 
		new Option<T>(new Left<null,T>(null))

	private constructor(sum: Sum<null,T>){
		this.val = sum
	}

	clone(): Option<T> {
		return this.maybe(
			() => None(),
			x  => Some(clone(x)))
	}
	match <A>({none,some}: OptionMatch<T,A>): A {
		return this.maybe(none,some)
	}
	isSome(): boolean {
		return this.maybe(() => false, _ => true)
	}
	isNone(): boolean {
		return !this.isSome()
	}
	expect(err: string): T | never {
		return this.maybe( () => {throw Error(err)}, clone)
	}
	unwrap(): T | never {
		return this.maybe
		( () => { throw TypeError("called `Option.unwrap()` on a `None` value") } 
		, clone)
	}
	unwrapOr(ifNone: T): T {
		return this.maybe(() => ifNone, clone)
	}
	unwrapOrElse(ifNone: Lazy<T>): T {
		return this.maybe(ifNone, clone)
	}
	// JUST TO BREAK TESTS!
	map<U>(f: Fn<T,U>): Option<U>{
		return this.andThen(x => Some(f(clone(x))))
		//	(typeof x == 'undefined') ? None() : Some(f(clone(x))))
	}
	mapOr<U>(ifNone: U, f: Fn<T,U>): U {
		return this.maybe(() => ifNone,toClone(f))
	}
	mapOrElse<U>(ifNone: Lazy<U>, f: Fn<T,U>): U {
		return this.maybe(ifNone,toClone(f))
	}
	okOr<E>(err: E): Result<T,E>{
		return this.maybe(() => Err(err), x => Ok(x))
	}
	okOrElse<E>(ifNone: Lazy<E>): Result<T,E> {
		return this.maybe(() => Err(ifNone()),x => Ok(clone(x)))
	}
	ap<U>(fn: Option<Fn<T,U>>): Option<U> {
		return this.andThen(x => fn.map(f => f(x)))	
	}	
	map2<U,A>(another: Option<U>, f: Fn2<T,U,A>): Option<A> {
		return this.andThen(x => another.map(y => f(clone(x),clone(y))))
	}
	zip<U>(withVal: Option<U>): Option<[T, U]> {
		return this.map2(withVal, (x,y) => [x,y])
	}
	andThen<U>(f: Fn<T,Option<U>>): Option<U>{
		return this.maybe(() => None(),(x:T): Option<U> => f(clone(x)))
	}
	static flatten = <T>(x:Option<Option<T>>) =>
		x.andThen((y:Option<T>) => y)
	filter(predicate: Fn<T,boolean>): Option<T> {
		return this.andThen(x => predicate(x) ? Some(x) : None())
	}
	replace<U>(on: U): Option<U>{
		return this.map(_ => on)
	}
	toString(): string {
		return this.maybe(
			() => 'None()',
			x => `Some(${x})`)
	}
	static transpose = <T,E>(x: Option<Result<T,E>>): Result<Option<T>,E> =>
		x.mapOrElse(
			() => Ok(None<T>()),
			r => r.mapOrElse(
				err => Err(err),
				ok => Ok(Some(ok))))
}

export const Some = Option.mkSome
export const None = Option.mkNone