import { Err, Ok, Result, Some, None, Option } from "./../src";

describe("Result", () => {
	it("isOk", () => {
		const ok = new Ok("ok");
		expect(ok.isOk()).toBeTruthy();

		const err = new Err("err");
		expect(err.isOk()).toBeFalsy();
	});

	it("isOk", () => {
		const err = new Err("err");
		expect(err.isErr()).toBeTruthy();

		const ok = new Ok("ok");
		expect(ok.isErr()).toBeFalsy();
	});

	it("ok", () => {
		const ok = new Ok("ok");
		expect(ok.ok()).toEqual(Some("ok"));

		const err = new Err("err");
		expect(err.ok()).toEqual(None());
	});

	it("err", () => {
		const ok = new Ok("ok");
		expect(ok.err()).toEqual(None());

		const err = new Err("err");
		expect(err.err()).toEqual(Some("err"));
	});

	it("unwrap", () => {
		expect(new Ok(5).unwrap()).toEqual(5);
		expect(new Ok([1, 3, 4]).unwrap()).toEqual([1, 3, 4]);
		expect(
			new Ok({
				test: 4,
			}).unwrap(),
		).toEqual({
			test: 4,
		});

		expect(
			new Err({
				msg: "Random text",
				code: 15,
			}).unwrap,
		).toThrow(Error);
	});

	it("unwrapErr", () => {
		expect(new Ok(5).unwrapErr).toThrow(Error);

		expect(
			new Err({
				msg: "Random text",
				code: 15,
			}).unwrapErr(),
		).toEqual({
			msg: "Random text",
			code: 15,
		});
	});

	it("unwrapOr", () => {
		expect(
			new Ok({
				test: true,
			}).unwrapOr({ test: false }),
		).toEqual({
			test: true,
		});

		expect(new Err(5).unwrapOr({ test: false })).toEqual({
			test: false,
		});
	});

	it("unwrapOrElse", () => {
		expect(new Ok("OK").unwrapOrElse(() => "OK")).toEqual("OK");
		expect(new Err("Error").unwrapOrElse(() => "Else")).toEqual("Else");
	});

	it("map", () => {
		const x: Result<number, string> = new Err("5");
		expect(x.map((item) => item * 5)).toEqual(new Err("5"));

		const y: Result<number, string> = new Ok(5);
		expect(y.map((item) => item * 5)).toEqual(new Ok(25));
	});

	it("map", () => {
		const x: Result<number, string> = new Err("5");
		expect(x.map((item) => item * 5)).toEqual(new Err("5"));

		const y: Result<number, string> = new Ok(5);
		expect(y.map((item) => item * 5)).toEqual(new Ok(25));
	});

	it("mapOr", () => {
		const x = new Ok("foo");
		expect(x.mapOr(42 as number, (v) => v.length)).toEqual(3);

		const y = new Err("bar");
		expect(y.mapOr(42 as number, (v) => v.length)).toEqual(42);
	});

	it("mapOrElse", () => {
		const x: Result<string, string> = new Ok("fOo");
		expect(
			x.mapOrElse(
				(err) => err.toLowerCase(),
				(v) => v.toUpperCase(),
			),
		).toEqual("FOO");

		const y: Result<string, string> = new Err("BaR");
		expect(
			y.mapOrElse(
				(err) => err.toLowerCase(),
				(v) => v.toUpperCase(),
			),
		).toEqual("bar");
	});

	it("mapErr", () => {
		const stringify = (x: number) => `error code: ${x}`;

		const x: Result<number, number> = new Ok(2);
		expect(x.mapErr(stringify)).toEqual(new Ok(2));

		const y: Result<number, number> = new Err(13);
		expect(y.mapErr(stringify)).toEqual(new Err("error code: 13"));
	});

	it("andThen", () => {
		const ok = new Ok(25);
		const sq = (x: number) => new Ok(x * x);

		// 25 * 25 => 625 + 5 => 630
		const result = ok.andThen(sq).andThen((x) => new Ok(x + 5));
		expect(result.unwrap()).toEqual(630);
	});

	it("transpose", () => {
		const x: Result<Option<number>, string> = new Ok(Some(5));
		const y: Option<Result<number, string>> = Some(new Ok(5));

		expect(x.transpose()).toEqual(y);
	});

	it("flatten", () => {
		expect(new Ok(new Ok(50)).flatten()).toEqual(new Ok(50));
		expect(new Ok(50).flatten().unwrap()).toEqual(50);

		expect(new Ok(new Err("Error")).flatten()).toEqual(new Err("Error"));
		expect(new Err("Error").flatten()).toEqual(new Err("Error"));
	});
});
