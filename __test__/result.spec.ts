import { Err, Ok, Result, Some, None, Option, Lazy, Fn, Fn2  } from "./../src";

const id = <A>(x:A):A => x

describe("Result", () => {
	it("toString", () => {
		const prop = <A,E>(x:A,e:E) => {
			expect( Ok<A,E>(x).toString()).toEqual( `Ok(${x})`)
			expect(Err<A,E>(e).toString()).toEqual(`Err(${e})`)
		}
	});

	it("either", () => {
		let prop = <A,B,C>(x:A, y:B, f:Fn<B,C>,g: Fn<A,C>) => {
			expect( Ok<A,B>(x).either(f,g)).toEqual(g(x))
			expect(Err<A,B>(y).either(f,g)).toEqual(f(y))
		}
		prop(4,"Viper GTS",s => s + " OVA", h => (h * 3).toString())
		prop(undefined,133,() => "nah",x => `${x}`)
	});

	it("isOk", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok<A,E>(x).isOk()).toBeTruthy()
			expect(Err<A,E>(e).isOk()).toBeFalsy()
		}
		prop(undefined,33)
		prop("Volodya",463)
	});

	it("isErr", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok<A,E>(x).isErr()).toBeFalsy()
			expect(Err<A,E>(e).isErr()).toBeTruthy()
		}
		prop(undefined,33)
		prop("Volodya",463)
	});

	it("expect", () => {
		let prop = <A,E>(x:A,e:E ,msg: string) => {
			expect(Ok(x).expect(msg)).toEqual(x)
			expect(() => Err(e).expect(msg)).toThrow()
		}
		prop(44,34636,"Charlie")
		prop(null,"sdfs","Charlie")
		prop(undefined,235,"Charlie")
	});

	it("expectErr", () => {
		let prop = <A,E>(x:A,e:E ,msg: string) => {
			expect(Err(e).expectErr(msg)).toEqual(e)
			expect(() => Ok(x).expectErr(msg)).toThrow()
			
		}
		prop(44,34636,"Charlie")
		prop(null,"sdfs","Charlie")
		prop(undefined,235,"Charlie")
	});

	it("ok", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok<A,E>(x).ok()).toEqual(Some(x))
			expect(Err<A,E>(e).ok()).toEqual(None())
		}
		prop(22,"border")
	});

	it("err", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok<A,E>(x).err()).toEqual(None())
			expect(Err<A,E>(e).err()).toEqual(Some(e))
		}
		prop(22,"border")
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
	});

	it("unwrap", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(Ok(x).unwrap()).toEqual(x)
			expect(() => Err(e).unwrap()).toThrow() 
		}
	});
	it("unwrapErr", () => {
		let prop = <A,E>(x:A,e:E) => {
			expect(() => Ok(x).unwrapErr()).toThrow()
			expect(Err(e).unwrapErr()).toEqual(e)
		}
	});

	it("unwrapOr", () => {
		let prop = <A,E>(x:A, e:E, alt: A) => {
			expect(Ok(x).unwrapOr(alt)).toEqual(x)
			expect(Err(e).unwrapOr(alt)).toEqual(alt)
		}
		prop(666,"koza",97)
		prop(null,"koza",null)
		prop(undefined,"koza",undefined)
	});

	it("unwrapOrElse", () => {
		let prop = <A,E>(x:A, e:E, alt: Lazy<A>) => {
			expect(Ok(x).unwrapOrElse(alt)).toEqual(x)
			expect(Err(e).unwrapOrElse(alt)).toEqual(alt())
		}
		prop(666,"koza",() => 97)
		prop(null,"koza",() => null)
		prop(undefined,"koza",() => undefined)	
	});

	it("map", () => {
		const identity = <A,E>(x: Result<A,E>) => 
			expect(x.map(id)).toEqual(x)
		const composition = <A,E,B,C>
			(x: Result<A,E>
			,f: Fn<A,B>
			,g: Fn<B,C>) =>

			expect(x.map(f).map(g)).toEqual(x.map(y => g(f(y))))
		let args = [78,null,undefined]
		args.forEach(x => identity(Ok(x)))
		args.forEach(x => identity(Err(x)))

		composition(
			Ok<string,number>("wolf"),
			(x:string) => x.length, 
			(n:number) => n * 3)
		composition(
			Err<string,number>(999),
			(x:string) => x.length, 
			(n:number) => n * 3)
		composition(
			Err<string,undefined>(undefined),
			(x:string) => x.length, 
			(n:number) => n * 3)
	});

	it("mapOr", () => {
		const prop = <A,E,B>(x:A, e:E, f: Fn<A,B>, alt: B) => {
			expect(Ok<A,E>(x).mapOr(alt,f)).toEqual(f(x))
			expect(Err<A,E>(e).mapOr(alt,f)).toEqual(alt)
		}	
		prop(989,"Benjamin",(x:number) => x.toString(),"nope")
		prop(989,undefined,(x:number) => x.toString(),"nope")
		prop(undefined,undefined,_ => "braga","nope")
	});

	it("mapOrElse", () => {
		const prop = <A,E,B>(x:A, e:E, f: Fn<A,B>, alt: Lazy<B>) => {
			expect(Ok<A,E>(x).mapOrElse(alt,f)).toEqual(f(x))
			expect(Err<A,E>(e).mapOrElse(alt,f)).toEqual(alt())
		}	
		prop(989,"Benjamin",(x:number) => x.toString(),() => "nope")
		prop(989,undefined,(x:number) => x.toString(),() => "nope")
		prop(undefined,undefined,_ => "braga",() => "nope")

	});

	it("mapErr", () => {
		const identity = <A,E>(x: Result<A,E>) => 
			expect(x.mapErr(id)).toEqual(x)
		const composition = <A,E,B,C>
			(x: Result<A,E>
			,f: Fn<E,B>
			,g: Fn<B,C>) =>

			expect(x.mapErr(f).mapErr(g)).toEqual(x.mapErr(y => g(f(y))))	

		let args = [78,null,undefined]
		args.forEach(x => identity(Ok(x)))
		args.forEach(x => identity(Err(x)))

		let sn = (x:string) => x.length
		let nn = (n:number) => n * 3
		let nb = (n:number) => n * 3 > 8

		composition<number,string,number,boolean>(
			Ok<number,string>(666),sn,nb)
		composition<string,number,number,boolean>(
			Err<string,number>(999),nn,nb)
		composition<undefined,string,number,boolean>(
			Ok<undefined,string>(undefined),sn,nb)
		composition<undefined,string,number,boolean>(
			Err<undefined,string>("Alice"),sn,nb)
	});	
	it("ap", () => {
		type Compose<A,B,C> = (f:Fn<B,C>) => (g:Fn<A,B>) => (x:A) => C
		const compose = <A,B,C>
			(f:Fn<B,C>) => 
			(g:Fn<A,B>) => 
			(x:A) => f(g(x))
		const identity = <A,E>(x: Result<A,E>) => 
			expect(x.ap(Ok<Fn<A,A>,E>(id))).toEqual(x)
		const composition = <A,E,B,C>
			(u: Result<Fn<B,C>,E>
			,v: Result<Fn<A,B>,E>
			,w: Result<A,E>) => 
			expect(w.ap(v.ap(u.ap(Ok<Compose<A,B,C>,E>(compose)))))
			.toEqual(w.ap(v).ap(u))
		const homomorphism = <A,E,B>(f:Fn<A,B>,x:A) =>
			expect(Ok<A,E>(x).ap(Ok<Fn<A,B>,E>(f))).toEqual(Ok<B,E>(f(x)))
		const interchange = <A,E,B>(u:Result<Fn<A,B>,E>,x:A) =>
			expect(Ok<A,E>(x).ap(u)).toEqual(u.ap(Ok<Fn<Fn<A,B>,B>,E>(f => f(x))))

		const compositionVariants = <A,E,B,C>
			(uf: Fn<B,C>, vf: Fn<A,B>, wx: A, e: E) => {
				composition(Ok(uf),Ok(vf),Ok(wx))
				composition(Ok(uf),Ok(vf),Err(e))
				composition(Ok(uf),Err<Fn<A,B>,E>(e),Ok(wx))
				composition(Ok(uf),Err<Fn<A,B>,E>(e),Err(e))
				composition(Err<Fn<B,C>,E>(e),Ok(vf),Err(e))
				composition(Err<Fn<B,C>,E>(e),Ok(vf),Ok(wx))
				composition(Err<Fn<B,C>,E>(e),Err<Fn<A,B>,E>(e),Ok(wx))
				composition(Err<Fn<B,C>,E>(e),Err<Fn<A,B>,E>(e),Err(e))
			}

		let args = [78,null,undefined,"Bob"]
		args.forEach(x => identity(Ok(x)))
		args.forEach(x => identity(Err(x)))

		let sn = (x:string) => x.length
		let nn = (n:number) => n * 3
		let nb = (n:number) => n * 3 > 8

		compositionVariants(nb,sn,"73",[null,null])
		homomorphism(nb,435)
		interchange(Ok(sn),"abc")
		interchange(Err<Fn<string,boolean>,number>(666),"abc")
	});
	it("map2", () => {
		const prop = <A,E,B,C>(x: A, e: E, y: B, f: Fn2<A,B,C>) => {
			expect(Ok<A,E>(x).map2(Ok<B,E>(y),f)).toEqual(Ok<C,E>(f(x,y)))
			expect(Err<A,E>(e).map2(Ok<B,E>(y),f)).toEqual(Err<C,E>(e))
			expect(Ok<A,E>(x).map2(Err<B,E>(e),f)).toEqual(Err<C,E>(e))
		}
	});
	it("zip", () => {
		const prop = <A,E,B>(x: Result<A,E>, y: Result<B,E>) => 
			expect(x.zip(y)).toEqual(x.map2(y,(a,b) => [a,b]))
	});
	
	it("andThen", () => {
		let right_identity = <A,E>(x:Result<A,E>) => 
			expect(x.andThen(Ok)).toEqual(x)
		let left_identity = <A,E,B>(x: A, f: Fn<A,Result<B,E>>) => 
			expect(Ok<A,E>(x).andThen(f)).toEqual(f(x))	
		let associativity = <A,E,B,C>
			(x: Result<A,E>
			,f: Fn<A,Result<B,E>>
			,g: Fn<B,Result<C,E>>) => 

			expect(x.andThen(y => f(y).andThen(g)))
			.toEqual(x.andThen(f).andThen(g))
	});
	it("filter", () => {
		const props = <A,E>(x:A, e:E, e2:E, p: Fn<A,boolean>) => {
			expect(Err<A,E>(e).filter(p,e2))
			.toEqual(Err<A,E>(e))
			expect(Ok<A,E>(x).filter(p,e2))
			.toEqual(p(x) ? Ok<A,E>(x) : Err<A,E>(e2))
		}
	}); 
	it("replace", () => {
		let props = <A,E,B>(x:A, e:E, y:B) => {
			expect(Ok(x).replace(y)).toEqual(Ok(y))
			expect(Err(e).replace(y)).toEqual(Err(e))
		}
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
	});

	it("flatten", () => {
		let props = <A,E>(x:A,e:E) => {
			expect(Result.flatten(Ok<Result<A,E>,E>(Ok<A,E>(x)))).toEqual(Ok(x))
			expect(Result.flatten(Ok<Result<A,E>,E>(Err<A,E>(e)))).toEqual(Err(e))
			expect(Result.flatten(Err<Result<A,E>,E>(e))).toEqual(Err(e))
		}
	});
});
