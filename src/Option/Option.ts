import clone from "clone-deep";
import { Ok, Err, Result } from "../Result";
import { Clone } from "../utils";

interface OptionMatch<T,A> {
	some: (some: T) => A;
	none: () => A;
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
export type Lazy<A> = () => A 
export type Fn<A,B> = (_:A) => B


const toClone = <A,B>(f:Fn<A,B>) => (x:A): B => f(clone(x))

export class Option<T> implements Clone<Option<T>> {
	private maybe: <A>(ifNone: Lazy<A>, ifSome: Fn<T,A>) => A

	static mkSome = <T>(x:T) => 
		new Option<T>(<A>(_: Lazy<A>, some: Fn<T,A>): A => some(x))
	static mkNone = <T>() => 
		new Option<T>(<A>(none: Lazy<A>, _: Fn<T,A>): A => none())
	private constructor(maybe: <A>(ifNone: Lazy<A>, ifSome: Fn<T,A>) => A){
		this.maybe = maybe
	}

	clone = (): Option<T> => 
		this.maybe(
			() => None(),
			x  => Some(clone(x)))
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
	match = <A>({none,some}: OptionMatch<T,A>): A =>
		this.maybe(none,some)

	/** Returns `true` if the option is a `Some` value. */
	isSome = (): boolean => this.maybe(() => false, _ => true)
	/** Returns `true` if the option is a `None` value. */
	isNone = (): boolean => !this.isSome()
	/**
	 * Returns the contained Some value, consuming the self value.
	 *
	 * ### Panics
	 *
	 * Panics if the value is a `None` with a custom panic message provided by msg. [`Error`]
	 */
	expect = (err: string): T | never => 
		this.maybe( () => {throw Error(err)}, clone)
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
	unwrap = (): T | never => this.maybe
		( () => { throw TypeError("called `Option.unwrap()` on a `None` value") } 
		, clone)
	/**
	 * Returns the contained `Some` value or a provided default.
	 *
	 * ### Example
	 * ```ts
	 * const some = Some("SOME");
	 * expect(some.unwrapOrElse(() => "NONE")).toEqual("SOME");
	 * ```
	 */
	unwrapOr = (ifNone: T): T => 
		this.maybe(() => ifNone, clone)
	/**
	 * Returns the contained `Some` value or computes it from a closure.
	 *
	 * ### Example
	 * ```ts
	 * expect(None().unwrapOrElse(() => "NONE")).toEqual("NONE");
	 * ```
	 */
	unwrapOrElse = (ifNone: Lazy<T>): T =>
		this.maybe(ifNone, clone)
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
	map = <U>(f: Fn<T,U>): Option<U> =>
		this.andThen(x => Some(f(clone(x))))
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
	mapOr = <U>(ifNone: U, f: Fn<T,U>): U =>
		this.maybe(() => ifNone,toClone(f))
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
	mapOrElse = <U>(ifNone: Lazy<U>, f: Fn<T,U>): U =>
		this.maybe(ifNone,toClone(f))
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
	okOr = <E>(err: E): Result<T,E> =>
		this.maybe(() => Err(err),Ok)
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
	okOrElse = <E>(ifNone: Lazy<E>): Result<T,E> =>
		this.maybe(() => Err(ifNone()),x => Ok(clone(x)))
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
	andThen = <U>(f: Fn<T,Option<U>>): Option<U> =>
		this.maybe(None,(x:T): Option<U> => f(clone(x)))
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
	filter = (predicate: Fn<T,boolean>): Option<T> =>
		this.andThen(x => predicate(x) ? Some(x) : None())
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
	replace = (on: T): Option<T> => this.map(_ => on)
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
	zip = <U>(withVal: Option<U>): Option<[T, U]> =>
		this.andThen(x => withVal.map(y => [clone(x),clone(y)]))
	/**
	 * Returns a string representation of an object.
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
	toString = (): string => 
		this.maybe(
			() => 'None()',
			x => `Some(${(x as unknown as object).toString()})`)
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
 export const transpose = 
	<T,E>(x: Option<Result<T,E>>): Result<Option<T>,E> =>
	
	x.mapOrElse(
		() => Ok(None<T>()),
		r => r.mapOrElse(
			err => Err(err),
			ok => Ok(Some(ok))))
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
export const flatten = <T>(x:Option<Option<T>>) => 
	x.andThen((y:Option<T>) => y)

export const Some = Option.mkSome
export const None = Option.mkNone