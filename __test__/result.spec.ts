import { Err, None, Ok, Result, Some } from "./../src";

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
});
