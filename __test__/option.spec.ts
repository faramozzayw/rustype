import { Literal } from "@babel/types";
import { None, Some, Option, Ok, Err, Result, Lazy, Fn, Fn2 } from "./../src";

const id = <A>(x:A): A => x

describe("Option", () => {
	it("toString", () => {
		const prop = (x:any) =>
			expect(Some(x).toString()).toEqual(`Some(${x})`)
		expect(None().toString()).toEqual("None()")

		let inputs : any[] = [22,"cat",{dog:4},null,undefined]
		inputs.forEach(prop)
	});
	it("equality is working", () => {
		expect(None()).toEqual(None())
		expect(Some(44)).toEqual(Some(44))
		expect(None<number>()).toEqual(None<string>())
	})
	it("maybe", () => {
		let prop = <A,B>(x:A, f:Lazy<B>,g: Fn<A,B>) => {
			expect(Some(x).maybe(f,g)).toEqual(g(x))
			expect(None<A>().maybe(f,g)).toEqual(f())
		}
		prop(4,() => 20,x => x * 3)
		prop(undefined,() => "nah",x => `${x}`)
	});

	it("isSome", () => {
		let prop = <A>(x:A) => expect(Some(x).isSome()).toBeTruthy()
		expect(None().isSome()).toBeFalsy()

		let inputs : any[] = [22,"cat",{dog:4},null,undefined]
		inputs.forEach(prop)
	});

	it("isNone", () => {
		let prop = <A>(x:A) => expect(Some(x).isNone()).toBeFalsy()
		expect(None().isNone()).toBeTruthy()

		let inputs : any[] = [22,"cat",{dog:4},null,undefined]
		inputs.forEach(prop)
	});
	// Pattern-matching
	it("expect", () => {
		let prop = <A>(x:A ,msg: string) => {
			expect(Some(x).expect(msg)).toEqual(x)
			expect(() => None().expect(msg)).toThrowError(new Error(msg))
		}
		prop(44,"Charlie")
		prop(null,"Charlie")
		prop(undefined,"Charlie")
	});

	it("match", () => {
		let prop = <A,B>(x: Option<A>,f: Lazy<B>,g: Fn<A,B>) => 
			expect(x.maybe(f,g)).toEqual(x.maybe(f,g))
	});

	it("unwrap", () => {
		let prop = <A>(x:A) => {
			expect(Some(x).unwrap()).toEqual(x)
			expect(() => None().unwrap())
			.toThrowError(new Error("called `Option.unwrap()` on a `None` value"))
		}
	});
	it("unwrapOr", () => {
		let prop = <A>(x:A, alt: A) => {
			expect(Some(x).unwrapOr(alt)).toEqual(x)
			expect(None<A>().unwrapOr(alt)).toEqual(alt)
		}
	});

	it("unwrapOrElse", () => {
		let prop = <A>(x:A, alt: Lazy<A>) => {
			expect(Some(x).unwrapOrElse(alt)).toEqual(x)
			expect(None().unwrapOrElse(alt)).toEqual(alt())
		}
	});
	it("mapOr", () => {
		const prop = <A,B>(x:A, f: Fn<A,B>, alt: B) => {
			expect(Some(x).mapOr(alt,f)).toEqual(f(x))
			expect(None<A>().mapOr(alt,f)).toEqual(alt)
		}
	});
	it("mapOrElse", () => {
		const prop = <A,B>(x:A, f: Fn<A,B>, alt: Lazy<B>) => {
			expect(Some(x).mapOrElse(alt,f)).toEqual(f(x))
			expect(None<A>().mapOrElse(alt,f)).toEqual(alt())
		}
	});

	it("okOr", () => {
		const prop = <A,B>(x: A, alt: B) => {
			expect(Some(x).okOr(alt)).toEqual(Ok(x))
			expect(None().okOr(alt)).toEqual(Err(alt))
		}
	});

	it("okOrElse", () => {
		const prop = <A,B>(x: A, alt: Lazy<B>) => {
			expect(Some(x).okOrElse(alt)).toEqual(Ok(x))
			expect(None().okOrElse(alt)).toEqual(Err(alt()))
		}
	});
	it("transpose", () => {
		let props = <A,B>(x:A,y:B) => {
			expect(Option.transpose(Some(Ok(x)))).toEqual(Ok(Some(x)))
			expect(Option.transpose(Some(Err(y)))).toEqual(Err(y))
			expect(Option.transpose(None<Result<A,B>>())).toEqual(Ok(None()))
		}
		let isomorphicToResult = <A,E>(x: Result<Option<A>,E>) =>
			expect(Option.transpose(Result.transpose(x))).toEqual(x)
	});
	it("transpose: Option<Result<A,B>> isomorphic to Result<Option<A>,B>", () => {
		let props = <A,B>(x:A,y:B) => {
			expect(Option.transpose(Some(Ok(x)))).toEqual(Ok(Some(x)))
			expect(Option.transpose(Some(Err(y)))).toEqual(Err(y))
			expect(Option.transpose(None<Result<A,B>>())).toEqual(Ok(None()))
		}
		let isomorphicToResult = <A,E>(x: Result<Option<A>,E>) =>
			expect(Option.transpose(Result.transpose(x))).toEqual(x)
	});
	// Functor
	it("map: identity (functor)", () => {
		const identity = <A>(x: Option<A>) => 
			expect(x.map(id)).toEqual(x)
	})
	it("map: composition (functor)", () => {
		const composition = <A,B,C>
			(x: Option<A>
			,f: Fn<A,B>
			,g: Fn<B,C>) =>

			expect(x.map(f).map(g)).toEqual(x.map(y => g(f(y))))
	});
	it("replace", () => {
		let props = <A,B>(x:A,y:B) => {
			expect(Some(x).replace(y)).toEqual(Some(y))
			expect(None().replace(y)).toEqual(None())
		}
	});
	// Applicative
	it("ap: identity (applicative)", () => {
		const identity = <A>(x: Option<A>) => 
			expect(x.ap(Some(id))).toEqual(x)
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
	})
	it("ap: homomorphism (applicative)", () => {
		const homomorphism = <A,B>(f:Fn<A,B>,x:A) =>
			expect(Some(x).ap(Some(f))).toEqual(Some(f(x)))
	})
	it("ap: interchange (applicative)", () => {
		const interchange = <A,B>(u:Option<Fn<A,B>>,x:A) =>
			expect(Some(x).ap(u)).toEqual(u.ap(Some((f:Fn<A,B>) => f(x))))	
	})
	it("map2", () => {
		const prop = <A,B,C>(x: A, y: B, f: Fn2<A,B,C>) => {
			expect(Some(x).map2(Some(y),f)).toEqual(Some(f(x,y)))
			expect(None<A>().map2(Some(y),f)).toEqual(None())
			expect(Some(x).map2(None<B>(),f)).toEqual(None())
		}
	});
	it("zip", () => {
		const prop = <A,B>(x: Option<A>, y: Option<B>) => 
			expect(x.zip(y)).toEqual(x.map2(y,(a:A,b:B) => [a,b]))
	});
	// Monad
	it("andThen: right identity (monad)", () => {
		let right_identity = <A>(x:Option<A>) => 
			expect(x.andThen(Some)).toEqual(x)
	})
	it("andThen: left identity (monad)", () => {
		let left_identity = <A,B>(x: A, f: Fn<A,Option<B>>) => 
			expect(Some(x).andThen(f)).toEqual(f(x))
	})
	it("andThen: associativity (monad)", () => {
		let associativity = <A,B,C>
			(x: Option<A> 
			,f: Fn<A,Option<B>>
			,g: Fn<B,Option<C>>) => 

			expect(x.andThen(y => f(y).andThen(g)))
			.toEqual(x.andThen(f).andThen(g))	
	});
	it("filter", () => {
		const props = <A>(x:A, p: Fn<A,boolean>) => {
			expect(None<A>().filter(p))
			.toEqual(None())
			expect(Some(x).filter(p))
			.toEqual(p(x) ? Some(x) : None())
		}
	});
	it("flatten", () => {
		let props = <A>(x:A) => {
			expect(Option.flatten(Some(Some(x)))).toEqual(Some(x))
			expect(Option.flatten(Some(None()))).toEqual(None())
			expect(Option.flatten(None<Option<A>>())).toEqual(None())
		}
	});
});
