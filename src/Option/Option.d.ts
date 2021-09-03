import clone from "clone-deep";
import { Ok, Err, Result, Right, Left, Sum } from "../Result";
import { Clone } from "../utils";
import { Lazy, Fn, Fn2 } from "../types";

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
declare const toClone: <A,B>(f:Fn<A,B>) => (x:A) => B

export class Option<T> implements Clone<Option<T>> {
	readonly val: Sum<null,T> // this value should be comparable
	maybe<A>(ifNone: Lazy<A>, ifSome: Fn<T,A>): A

	static mkSome: <T>(x:T) => Option<T>
	static mkNone: <T>() => Option<T>

	private constructor(sum: Sum<null,T>)

	clone(): Option<T>
	/**
	 * Pattern match to retrieve the value
	 *
	 * Properties:
	 * ```
	 * x.match({some: f, none: g}) = x.maybe(f,g)
	 * ``` 
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
	match <A>({none,some}: OptionMatch<T,A>): A

	/** Returns `true` if the option is a `Some` value. */
	isSome(): boolean
	/** Returns `true` if the option is a `None` value. */
	isNone(): boolean
	/**
	 * Returns the contained Some value, consuming the self value.
	 *
	 * Properties:
	 * ```
	 * Some(x).expect(s) = x
	 * ``` 
	 * 
	 * ### Panics
	 *
	 * Panics if the value is a `None` with a custom panic message provided by msg. [`Error`]
	 */
	expect(err: string): T | never
	/**
	 * Returns the contained `Some` value, consuming the self value.
	 * 
	 * Properties:
	 * ```
	 * Some(x).unwrap() = x
	 * ``` 
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
	unwrap(): T | never
	/**
	 * Returns the contained `Some` value or a provided default.
	 *
	 * Properties:
	 * ```
	 * Some(x).unwrapOr(y) = x
	 * None().unwrapOr(y) = y
	 * ``` 
	 * 
	 * ### Example
	 * ```ts
	 * const some = Some("SOME");
	 * expect(some.unwrapOrElse(() => "NONE")).toEqual("SOME");
	 * ```
	 */
	unwrapOr(ifNone: T): T
	/**
	 * Returns the contained `Some` value or computes it from a closure.
	 *
	 * Properties:
	 * ```
	 * Some(x).unwrapOrElse(f) = x
	 * None().unwrapOrElse(f) = f()
	 * ``` 
	 * 
	 * ### Example
	 * ```ts
	 * expect(None().unwrapOrElse(() => "NONE")).toEqual("NONE");
	 * ```
	 */
	unwrapOrElse(ifNone: Lazy<T>): T
	/**
	 * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.
	 * 
	 * Relation to `Option.andThen`: `x.map(f) = x.andThen(y => Some(f(y)))`
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
	 * const mappedSome = Some({ isSome: true }).map(item => ({ data: !item.isSome }));
	 *
	 * expect(mappedSome.unwrap()).toEqual({ data: false });
	 * ```
	 */
	map<U>(f: Fn<T,U>): Option<U>
	/**
	 * Applies a function to the contained value (if any), or returns the provided
	 * default (if not).
	 * 
	 * Properties: 
	 * ```
	 * Some(x).mapOr(y) = x
	 * None().mapOr(y) = y
	 * ```
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
	mapOr<U>(ifNone: U, f: Fn<T,U>): U
	/**
	 * Applies a function to the contained value (if any), or computes a default (if not).
	 *
	 * Properties: 
	 * ```
	 * Some(x).mapOrElse(f) = x
	 * None().mapOrElse(f) = f()
	 * ```
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
	mapOrElse<U>(ifNone: Lazy<U>, f: Fn<T,U>): U
	/**
	 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
	 *
	 * Arguments passed to `okOr` are eagerly evaluated; if you are passing the result of a function
	 * call, it is recommended to use `okOrElse`, which is lazily evaluated.
	 *
	 * Properties: 
	 * ```
	 * Some(x).okOr(y) = Ok(x)
	 * None().okOr(y) = Err(y)
	 * ```
	 * 
	 * ### Example
	 * ```ts
	 * expect(Some(5).okOr("Failed")).toEqual(Ok(5));
	 * expect(None().okOr("Failed")).toEqual(Err("Failed"));
	 * ```
	 */
	okOr<E>(err: E): Result<T,E>
	/**
	 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.
	 *
	 * Properties: 
	 * ```
	 * Some(x).okOrElse(f) = Ok(x)
	 * None().okOrElse(f) = Err(f())
	 * ```
	 * 
	 * ### Example
	 * ```ts
	 * const failFn = () => "Failed";
	 *
	 * expect(Some(5).okOrElse(failFn)).toEqual(Ok(5));
	 * expect(None().okOrElse(failFn)).toEqual(Err("Failed"));
	 * ```
	 */
	okOrElse<E>(ifNone: Lazy<E>): Result<T,E>
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
	ap<U>(fn: Option<Fn<T,U>>): Option<U>
	/**
	 * Lifts the function of two arguments into an Option.
	 *
	 * Properties: 
	 * ```
	 * Some(x).map2(Some(y),f) = Some(f(x,y))
	 * _.map2(_,f) = None()
	 * ```
	 */
	map2<U,A>(another: Option<U>, f: Fn2<T,U,A>): Option<A>
	/**
	 * Zips `self` with another `Option`.
	 *
	 * If `self` is `Some(s)` and other is `Some(o)`, this method returns `Some((s,
	 * o))`. Otherwise, `None` is returned.
	 *
	 * Properties: 
	 * ```
	 * Some(x).zip(Some(y) = Some([x,y])
	 * _.zip(_)  = None()
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
	zip<U>(withVal: Option<U>): Option<[T, U]>
	/**
	 * If the value is present, calls `f` on it and returns the result, otherwise returns `None`.
	 *
	 * Also known in another languages as  **flatMap** because: `x.andThen(f) = Option.flatten(x.map(f))`
	 *
	 * Properties: 
	 * ```
	 * // right identity 
	 * x.andThen(Some) = x
	 * // left identity
	 * Some(x).andThen(f) = f(x) 
	 * // associativity
	 * x.andThen(y => f(y).andThen(g)) = x.andThen(f).andThen(g)
	 * ```
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
	andThen<U>(f: Fn<T,Option<U>>): Option<U>
	/**
	 * Converts from Option<Option<T>> to Option<T>
	 *
	 * Properties: 
	 * ```
	 * Option.flatten(Some(Some(x))) = Some(x)
	 * Option.flatten(_) = None()
	 * ```
	
	 * ### Example
	 * ```ts
	 * expect(Option.flatten(Some(Some(Some(50))))).toEqual(Some(Some(50)));
	 * expect(Option.flatten(Some(Some(50)))).toEqual(Some(50));
	 *
	 * expect(Some(50).flatten()).toEqual(Some(50));
	 * expect(Some(50).flatten().unwrap()).toEqual(50);
	 *
	 * expect(Option.flatten(Some(None()))).toEqual(None());
	 * expect(Option.flatten(None())).toEqual(None());
	 * ```
	 */
	static flatten<T>(x:Option<Option<T>>): Option<T>
	/**
	 * > Returns `None` if the option is `None`, otherwise calls `predicate` with
	 * the wrapped value and returns: - [`Some(t)`] if `predicate` returns `true`
	 * (where `t` is the wrapped value), and - `None` if `predicate` returns `false`.
	 *
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
	filter(predicate: Fn<T,boolean>): Option<T>
	/**
	 * Replaces the actual value in the option, if present, by the value given in parameter.
	 * 
	 * Properties: 
	 * ```
	 * Some(x).replace(y) = Some(y)
	 * None().replace(y) = None()
	 * ```
	 * 
	 * ### Example
	 * ```ts
	 * expect(Some(50).replace("Bob")).toEqual(Some("Bob"));
	 * expect(None().replace("Bob")).toEqual(None());
	 * ```
	 */
	replace<U>(on: U): Option<U>
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
	toString(): string
	/**
	 * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
	 *
	 * Properties: 
	 * ```
	 * Option.transpose(Some(Ok(x)))  = Ok(Some(x)) 
	 * Option.transpose(Some(Err(x))) = Err(x) 
	 * Option.transpose(None()) 	  = Ok(None()) 
	 * ```
	 * 
	 * ### Example
	 * ```ts
	 * const x: Result<Option<number>, string> = Ok(Some(5));
	 * const y: Option<Result<number, string>> = Some(Ok(5));
	 *
	 * expect(x).toEqual(Option.transpose(y));
	 * ```
	 */
	static transpose<T,E>(x: Option<Result<T,E>>): Result<Option<T>,E>
}

export const Some: <T>(x:T) => Option<T>
export const None: <T>() => Option<T>