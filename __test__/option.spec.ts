import { Literal } from "@babel/types";
import * as fc from 'fast-check';
import { Arbitrary, Shrinkable } from "fast-check";
import { None, Some, Option, Ok, Err, Result, Lazy, Fn, Fn2 } from "./../src";

const id = <A>(x:A): A => x
fc.configureGlobal({numRuns : 500})
const randOption = <T>(x: Arbitrary<T>): Arbitrary<Option<T>> => 
	fc.boolean().chain(b => x.map(val => b ? Some<T>(val) : None<T>()))

const randResult = <T,E>(ok: Arbitrary<T>, err: Arbitrary<E>): Arbitrary<Result<T,E>> => 
	fc.boolean().chain(b => b
		?  ok.map(x =>  Ok(x)) 
		: err.map(x => Err(x)))

const lazy = <A>(x:A) => () => x

describe("Option", () => {
	it("toString", () => {
		const prop = (x:any) =>
			expect(Some(x).toString()).toEqual(`Some(${x})`)
		expect(None().toString()).toEqual("None()")

		fc.assert(fc.property(fc.anything(),prop))
	});
	it("equality is working", () => {
		expect(None()).toEqual(None())
		expect(Some(44)).toEqual(Some(44))
		expect(None<number>()).toEqual(None<string>())
	})
	it("isSome", () => {
		let prop = <A>(x:A) => expect(Some(x).isSome()).toBeTruthy()
		expect(None().isSome()).toBeFalsy()

		fc.assert(fc.property(fc.anything(),prop))
	});

	it("isNone", () => {
		let prop = <A>(x:A) => expect(Some(x).isNone()).toBeFalsy()
		expect(None().isNone()).toBeTruthy()

		fc.assert(fc.property(fc.anything(),prop))
	});
	// Pattern-matching
	it("expect", () => {
		let prop = <A>(x:A ,msg: string) => {
			expect(Some(x).expect(msg)).toEqual(x)
			expect(() => None().expect(msg)).toThrowError(new Error(msg))
		}
		fc.assert(fc.property(fc.anything(),fc.string(),prop))
	});

	it("match", () => {
		let prop = <A,B>(x: Option<A>,f: Lazy<B>,g: Fn<A,B>) => 
			expect(x.match({none:f,some:g})).toEqual(x.maybe(f,g))

		fc.assert(fc.property(
			randOption(fc.integer()),
			fc.boolean().map(lazy),
			fc.func<number[],boolean>(fc.boolean()),
			prop))

		fc.assert(fc.property(
			randOption(fc.anything()),
			fc.boolean().map(lazy),
			fc.func<any[],any>(fc.anything()),
			prop))
	});

	it("unwrap", () => {
		let prop = <A>(x:A) => {
			expect(Some(x).unwrap()).toEqual(x)
			expect(() => None().unwrap())
			.toThrowError(new Error("called `Option.unwrap()` on a `None` value"))
		}
		fc.assert(fc.property(fc.anything(),prop))
	});
	it("unwrapOr", () => {
		let prop = <A>(x:A, alt: A) => {
			expect(Some(x).unwrapOr(alt)).toEqual(x)
			expect(None<A>().unwrapOr(alt)).toEqual(alt)
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});

	it("unwrapOrElse", () => {
		let prop = <A>(x:A, alt: Lazy<A>) => {
			expect(Some(x).unwrapOrElse(alt)).toEqual(x)
			expect(None().unwrapOrElse(alt)).toEqual(alt())
		}
		fc.assert(fc.property(fc.anything(),fc.anything().map(x => () => x),prop))
	});
	it("mapOr", () => {
		const prop = <A,B>(x:A, f: Fn<A,B>, alt: B) => {
			expect(Some(x).mapOr(alt,f)).toEqual(f(x))
			expect(None<A>().mapOr(alt,f)).toEqual(alt)
		}
		fc.assert(fc.property(fc.anything(),fc.func<any[],any>(fc.anything()),fc.anything(),prop))
	});
	it("maybe", () => {
		let prop = <A,B>(x:A, f:Lazy<B>, g: Fn<A,B>) => {
			expect(Some(x).maybe(f,g)).toEqual(g(x))
			expect(None<A>().maybe(f,g)).toEqual(f())
		}
		fc.assert(fc.property(
			fc.anything(),
			fc.anything().map(lazy),
			fc.func<any[],any>(fc.anything()),
			prop))
	});
	it("mapOrElse", () => {
		const equalToMaybe = <A,B>(x: Option<A>, alt: Lazy<B>, f: Fn<A,B>) =>
			expect(x.mapOrElse(alt,f)).toEqual(x.maybe(alt,f))

		fc.assert(fc.property(
			randOption(fc.anything()),
			fc.anything().map(lazy),
			fc.func<any[],any>(fc.anything()),
			equalToMaybe))
	});

	it("okOr", () => {
		const prop = <A,B>(x: A, alt: B) => {
			expect(Some(x).okOr(alt)).toEqual(Ok(x))
			expect(None().okOr(alt)).toEqual(Err(alt))
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});

	it("okOrElse", () => {
		const prop = <A,B>(x: A, alt: Lazy<B>) => {
			expect(Some(x).okOrElse(alt)).toEqual(Ok(x))
			expect(None().okOrElse(alt)).toEqual(Err(alt()))
		}
		fc.assert(fc.property(fc.anything(),fc.anything().map(lazy),prop))
	});
	it("transpose", () => {
		let prop = <A,B>(x:A,y:B) => {
			expect(Option.transpose(Some(Ok(x)))).toEqual(Ok(Some(x)))
			expect(Option.transpose(Some(Err(y)))).toEqual(Err(y))
			expect(Option.transpose(None<Result<A,B>>())).toEqual(Ok(None()))
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});
	it("transpose: Option<Result<A,B>> isomorphic to Result<Option<A>,B>", () => {
		let isomorphicToResult = <A,E>(x: Result<Option<A>,E>) =>
			expect(Option.transpose(Result.transpose(x))).toEqual(x)
		fc.assert(fc.property(
			randResult(randOption(fc.anything()),fc.anything()),
			isomorphicToResult))
	});
	// Functor
	it("map: identity (functor)", () => {
		const identity = <A>(x: Option<A>) => 
			expect(x.map(id)).toEqual(x)
		fc.assert(fc.property(randOption(fc.anything()),identity))
	})
	it("map: composition (functor)", () => {
		const composition = <A,B,C>
			(x: Option<A>
			,f: Fn<A,B>
			,g: Fn<B,C>) =>

			expect(x.map(f).map(g)).toEqual(x.map(y => g(f(y))))
		fc.assert(fc.property(
			randOption(fc.anything()),
			fc.func<any[],any>(fc.anything()),
			fc.func<any[],any>(fc.anything()),
			composition))
	});
	it("replace", () => {
		let props = <A,B>(x:A,y:B) => {
			expect(Some(x).replace(y)).toEqual(Some(y))
			expect(None().replace(y)).toEqual(None())
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),props))
	});
	// Applicative
	it("ap: identity (applicative)", () => {
		const identity = <A>(x: Option<A>) => 
			expect(x.ap(Some(id))).toEqual(x)
		fc.assert(fc.property(randOption(fc.anything()),identity))
	})
	it("ap: composition (applicative)", () => {
		type Compose<A,B,C> = (f:Fn<B,C>) => (g:Fn<A,B>) => (x:A) => C
		const compose = <A,B,C>
			(f:Fn<B,C>) => 
			(g:Fn<A,B>) => 
			(x:A) => f(g(x))
		const composition = <A,B,C>
			(u: Option<Fn<B,C>>
			,v: Option<Fn<A,B>>
			,w: Option<A>) => 
			expect(w.ap(v.ap(u.ap(Some<Compose<A,B,C>>(compose)))))
			.toEqual(w.ap(v).ap(u))

		fc.assert(fc.property(
			randOption(fc.func(fc.anything())),
			randOption(fc.func(fc.anything())),
			randOption(fc.anything()),
			composition))
	})
	it("ap: homomorphism (applicative)", () => {
		const homomorphism = <A,B>(f:Fn<A,B>,x:A) =>
			expect(Some(x).ap(Some(f))).toEqual(Some(f(x)))

		fc.assert(fc.property(fc.func(fc.anything()),fc.anything(),homomorphism))
	})
	it("ap: interchange (applicative)", () => {
		const interchange = <A,B>(u:Option<Fn<A,B>>,x:A) =>
			expect(Some(x).ap(u)).toEqual(u.ap(Some((f:Fn<A,B>) => f(x))))	

		fc.assert(fc.property(
			randOption(fc.func(fc.anything())),
			fc.anything(),
			interchange))
	})
	it("map2", () => {
		const prop = <A,B,C>(x: A, y: B, f: Fn2<A,B,C>) => {
			expect(Some(x).map2(Some(y),f)).toEqual(Some(f(x,y)))
			expect(None<A>().map2(Some(y),f)).toEqual(None())
			expect(Some(x).map2(None<B>(),f)).toEqual(None())
		}
		fc.assert(fc.property(
			fc.anything(),
			fc.anything(),
			fc.func(fc.anything()),
			prop))
	});
	it("zip", () => {
		const prop = <A,B>(x: Option<A>, y: Option<B>) => 
			expect(x.zip(y)).toEqual(x.map2(y,(a:A,b:B) => [a,b]))

		fc.assert(fc.property(
			randOption(fc.anything()),
			randOption(fc.anything()), 
			prop))
	});
	// Monad
	it("andThen: right identity (monad)", () => {
		let right_identity = <A>(x:Option<A>) => 
			expect(x.andThen(Some)).toEqual(x)
		fc.assert(fc.property(randOption(fc.anything()),right_identity))
	})
	it("andThen: left identity (monad)", () => {
		let left_identity = <A,B>(x: A, f: Fn<A,Option<B>>) => 
			expect(Some(x).andThen(f)).toEqual(f(x))

		fc.assert(fc.property(
			fc.anything(),
			fc.func(randOption(fc.anything())),
			left_identity))
	})
	it("andThen: associativity (monad)", () => {
		let associativity = <A,B,C>
			(x: Option<A> 
			,f: Fn<A,Option<B>>
			,g: Fn<B,Option<C>>) => 

			expect(x.andThen(y => f(y).andThen(g)))
			.toEqual(x.andThen(f).andThen(g))	

		fc.assert(fc.property(
			randOption(fc.anything()),
			fc.func(randOption(fc.anything())),
			fc.func(randOption(fc.anything())),
			associativity))
	});
	it("filter", () => {
		const props = <A>(x:A, p: Fn<A,boolean>) => {
			expect(None<A>().filter(p))
			.toEqual(None())
			expect(Some(x).filter(p))
			.toEqual(p(x) ? Some(x) : None())
		}
		fc.assert(fc.property(
			fc.anything(),
			fc.func(fc.boolean()),
			props))
	});
	it("flatten", () => {
		let props = <A>(x:A) => {
			expect(Option.flatten(Some(Some(x)))).toEqual(Some(x))
			expect(Option.flatten(Some(None()))).toEqual(None())
			expect(Option.flatten(None<Option<A>>())).toEqual(None())
		}
		fc.assert(fc.property(fc.anything(),props))
	});
});
