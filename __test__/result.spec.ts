import { Err, Ok, Result, Some, None, Option, Lazy, Fn, Fn2  } from "./../src";
import * as fc from 'fast-check';
import { Arbitrary, Shrinkable } from "fast-check";

fc.configureGlobal({numRuns : 500})

const randOption = <T>(x: Arbitrary<T>): Arbitrary<Option<T>> => 
	fc.boolean().chain(b => x.map(val => b ? Some<T>(val) : None<T>()))
const randResult = <T,E>(ok: Arbitrary<T>, err: Arbitrary<E>): Arbitrary<Result<T,E>> => 
	fc.boolean().chain(b => b
		?  ok.map(x =>  Ok(x)) 
		: err.map(x => Err(x)))
const anyFunc = <A>() => fc.func<A[],any>(fc.anything())

const lazy = <A>(x:A) => () => x
const id = <A>(x:A): A => x

describe("Result", () => {
	it("toString", () => {
		const prop = <A,E>(x:A,e:E) => {
			expect( Ok<A,E>(x).toString()).toEqual( `Ok(${x})`)
			expect(Err<A,E>(e).toString()).toEqual(`Err(${e})`)
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});
	it("isOk", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok<A,E>(x).isOk()).toBeTruthy()
			expect(Err<A,E>(e).isOk()).toBeFalsy()
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});
	it("isErr", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok<A,E>(x).isErr()).toBeFalsy()
			expect(Err<A,E>(e).isErr()).toBeTruthy()
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});
	// Pattern-matching
	it("expect", () => {
		let prop = <A,E>(x:A,e:E ,msg: string) => {
			expect(Ok(x).expect(msg)).toEqual(x)
			expect(() => Err(e).expect(msg)).toThrow()
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),fc.string(),prop))
	});

	it("expectErr", () => {
		let prop = <A,E>(x:A,e:E ,msg: string) => {
			expect(Err(e).expectErr(msg)).toEqual(e)
			expect(() => Ok(x).expectErr(msg)).toThrow()
			
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),fc.string(),prop))
	});

	it("ok", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok<A,E>(x).ok()).toEqual(Some(x))
			expect(Err<A,E>(e).ok()).toEqual(None())
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});

	it("err", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok<A,E>(x).err()).toEqual(None())
			expect(Err<A,E>(e).err()).toEqual(Some(e))
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});

	it("match", () => {
		let prop = <A,E,B>(x: Result<A,E>,f: Fn<E,B>,g: Fn<A,B>) => 
			expect(x.either(f,g)).toEqual(x.either(f,g))

			prop(Ok<number,string>(44),
				(x:string) => x + 'kek',
				(n:number) => (n * 3).toString())
			prop(Err<number,string>("vanya"),
				(x:string) => x + 'kek',
				(n:number) => (n * 3).toString())
		fc.assert(fc.property(
			randResult(fc.anything(),fc.anything()),
			anyFunc(),
			anyFunc(),
			prop))
	});

	it("unwrap", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok(x).unwrap()).toEqual(x)
			expect(() => Err(e).unwrap()).toThrow() 
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});
	it("unwrapErr", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(() => Ok(x).unwrapErr()).toThrow()
			expect(Err(e).unwrapErr()).toEqual(e)
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),prop))
	});

	it("unwrapOr", () => {
		let prop = <A,E>(x:A, e:E, alt: A) => {
			expect(Ok(x).unwrapOr(alt)).toEqual(x)
			expect(Err(e).unwrapOr(alt)).toEqual(alt)
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),fc.anything(),prop))
	});
	it("unwrapOrElse", () => {
		let prop = <A,E>(x:A, e:E, alt: Lazy<A>) => {
			expect(Ok(x).unwrapOrElse(alt)).toEqual(x)
			expect(Err(e).unwrapOrElse(alt)).toEqual(alt())
		}
		fc.assert(fc.property(
			fc.anything(),
			fc.anything(),
			fc.anything().map(lazy),
			prop))
	});
	it("mapOr", () => {
		const prop = <A,E,B>(x:A, e:E, f: Fn<A,B>, alt: B) => {
			expect(Ok<A,E>(x).mapOr(alt,f)).toEqual(f(x))
			expect(Err<A,E>(e).mapOr(alt,f)).toEqual(alt)
		}	
		fc.assert(fc.property(
			fc.anything(),
			fc.anything(),
			anyFunc(),
			fc.anything(),
			prop))
	});

	it("either", () => {
		let prop = <A,B,C>(x:A, y:B, f:Fn<B,C>,g: Fn<A,C>) => {
			expect( Ok<A,B>(x).either(f,g)).toEqual(g(x))
			expect(Err<A,B>(y).either(f,g)).toEqual(f(y))
		}
		fc.assert(fc.property(
			fc.anything(),
			fc.anything(),
			anyFunc(),
			anyFunc(),
			prop))
	});
	it("mapOrElse", () => {
		const sameAsEither = <A,E,B>(x:Result<A,E>, f: Fn<A,B>, alt: Fn<E,B>) => {
			expect(x.mapOrElse(alt,f)).toEqual(x.either(alt,f))
		}	
		fc.assert(fc.property(
			randResult(fc.anything(),fc.anything()),
			anyFunc(),
			anyFunc(),
			sameAsEither))
	});
	it("transpose", () => {
		let props = <A,E>(x:A,e:E) => {
			expect(Result.transpose(Ok<Option<A>,E>(Some(x)) ))
			.toEqual(Some(Ok(x)))
			expect(Result.transpose(Err<Option<A>,E>(e)))
			.toEqual(Some(Err(e)))
			expect(Result.transpose(Ok<Option<A>,E>(None())))
			.toEqual(None())
		}
		fc.assert(fc.property(
			fc.anything(),
			fc.anything(),
			props))
	});
	// Functor
	it("map: identity (functor)", () => {
		const identity = <A,E>(x: Result<A,E>) => 
			expect(x.map(id)).toEqual(x)
		fc.assert(fc.property(randResult(fc.anything(),fc.anything()),identity))
	})
	it("mapErr: identity (functor)", () => {
		const identity = <A,E>(x: Result<A,E>) => 
			expect(x.mapErr(id)).toEqual(x) 
		fc.assert(fc.property(randResult(fc.anything(),fc.anything()),identity))
	})
	it("map: composition (functor)", () => {
		const composition = <A,E,B,C>
			(x: Result<A,E>
			,f: Fn<A,B>
			,g: Fn<B,C>) =>

			expect(x.map(f).map(g)).toEqual(x.map(y => g(f(y))))
		fc.assert(fc.property(
			randResult(fc.anything(),fc.anything()),
			anyFunc(),
			anyFunc(),
			composition))
	});
	it("mapErr: composition (functor)", () => {
		const composition = <A,E,B,C>
			(x: Result<A,E>
			,f: Fn<E,B>
			,g: Fn<B,C>) =>

			expect(x.mapErr(f).mapErr(g)).toEqual(x.mapErr(y => g(f(y))))	
		fc.assert(fc.property(
			randResult(fc.anything(),fc.anything()),
			anyFunc(),
			anyFunc(),
			composition))
	});	
	it("replace", () => {
		let props = <A,E,B>(x:A, e:E, y:B) => {
			expect(Ok(x).replace(y)).toEqual(Ok(y))
			expect(Err(e).replace(y)).toEqual(Err(e))
		}
		fc.assert(fc.property(fc.anything(),fc.anything(),fc.anything(),props))
	});
	// Applicative functor
	it("ap: identity (applicative)", () => {
		const identity = <A,E>(x: Result<A,E>) => 
			expect(x.ap(Ok<Fn<A,A>,E>(id))).toEqual(x)
		fc.assert(fc.property(randResult(fc.anything(),fc.anything()),identity))
	})
	it("ap: composition (applicative)", () => {
		type Compose<A,B,C> = (f:Fn<B,C>) => (g:Fn<A,B>) => (x:A) => C
		const compose = <A,B,C>
			(f:Fn<B,C>) => 
			(g:Fn<A,B>) => 
			(x:A) => f(g(x))	
		const composition = <A,E,B,C>
			(u: Result<Fn<B,C>,E>
			,v: Result<Fn<A,B>,E>
			,w: Result<A,E>) => 

			expect(w.ap(v.ap(u.ap(Ok<Compose<A,B,C>,E>(compose)))))
			.toEqual(w.ap(v).ap(u))
		fc.assert(fc.property(
			randResult(anyFunc(),fc.anything()),
			randResult(anyFunc(),fc.anything()),
			randResult(fc.anything(),fc.anything()),
			composition))
	})
	it("ap: homomorphism (applicative)", () => {
		const homomorphism = <A,E,B>(f:Fn<A,B>,x:A) =>
			expect(Ok<A,E>(x).ap(Ok<Fn<A,B>,E>(f))).toEqual(Ok<B,E>(f(x)))

		fc.assert(fc.property(anyFunc(),fc.anything(),homomorphism))
	})
	it("ap: interchange (applicative)", () => {
		const interchange = <A,E,B>(u:Result<Fn<A,B>,E>,x:A) =>
			expect(Ok<A,E>(x).ap(u)).toEqual(u.ap(Ok<Fn<Fn<A,B>,B>,E>(f => f(x))))
		fc.assert(fc.property(randResult(anyFunc(),fc.anything()),fc.anything(),interchange))
	});
	it("map2", () => {
		const prop = <A,E,B,C>(x: A, e: E, y: B, f: Fn2<A,B,C>) => {
			expect(Ok<A,E>(x).map2(Ok<B,E>(y),f)).toEqual(Ok<C,E>(f(x,y)))
			expect(Err<A,E>(e).map2(Ok<B,E>(y),f)).toEqual(Err<C,E>(e))
			expect(Ok<A,E>(x).map2(Err<B,E>(e),f)).toEqual(Err<C,E>(e))
		}
		fc.assert(fc.property(
			fc.anything(), 
			fc.anything(), 
			fc.anything(), 
			fc.func(fc.anything()), 
			prop ))
	});
	it("zip", () => {
		const prop = <A,E,B>(x: Result<A,E>, y: Result<B,E>) => 
			expect(x.zip(y)).toEqual(x.map2(y,(a,b) => [a,b]))

		fc.assert(fc.property(
			randResult(fc.anything(),fc.anything()), 
			randResult(fc.anything(),fc.anything()), 
			prop ))
	});
	// Monad
	it("andThen: right identity (monad)", () => {
		let right_identity = <A,E>(x:Result<A,E>) => 
			expect(x.andThen(Ok)).toEqual(x)

		fc.assert(fc.property(randResult(fc.anything(),fc.anything()), right_identity))
	})
	it("andThen: left identity (monad)", () => {
		let left_identity = <A,E,B>(x: A, f: Fn<A,Result<B,E>>) => 
			expect(Ok<A,E>(x).andThen(f)).toEqual(f(x))	

		fc.assert(fc.property(
			fc.anything(),
			fc.func(randResult(fc.anything(),fc.anything())), 
			left_identity))
	})
	it("andThen: associativity (monad)", () => {
		let associativity = <A,E,B,C>
			(x: Result<A,E>
			,f: Fn<A,Result<B,E>>
			,g: Fn<B,Result<C,E>>) => 

			expect(x.andThen(y => f(y).andThen(g)))
			.toEqual(x.andThen(f).andThen(g))

		fc.assert(fc.property(
			randResult(fc.anything(),fc.anything()),
			fc.func(randResult(fc.anything(),fc.anything())), 
			fc.func(randResult(fc.anything(),fc.anything())),
			associativity))
	});
	it("filter", () => {
		const props = <A,E>(x:A, e:E, e2:E, p: Fn<A,boolean>) => {
			expect(Err<A,E>(e).filter(p,e2))
			.toEqual(Err<A,E>(e))
			expect(Ok<A,E>(x).filter(p,e2))
			.toEqual(p(x) ? Ok<A,E>(x) : Err<A,E>(e2))
		}
		fc.assert(fc.property(
			fc.anything(),
			fc.anything(),
			fc.anything(),
			fc.func(fc.boolean()),
			props))
	}); 
	it("flatten", () => {
		let props = <A,E>(x:A,e:E) => {
			expect(Result.flatten(Ok<Result<A,E>,E>(Ok<A,E>(x)))).toEqual(Ok(x))
			expect(Result.flatten(Ok<Result<A,E>,E>(Err<A,E>(e)))).toEqual(Err(e))
			expect(Result.flatten(Err<Result<A,E>,E>(e))).toEqual(Err(e))
		}
		fc.assert(fc.property(
			fc.anything(),
			fc.anything(),
			props))
	});
});
