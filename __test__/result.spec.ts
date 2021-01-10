import { Err, Ok, Result, Some, None, Option } from "./../src";

describe("Result", () => {
	it("toString", () => {
		expect(Err(5).toString()).toEqual(`Err(5)`);
		expect(Err(Err("Error")).toString()).toEqual(`Err(Err(Error))`);

		expect(Ok(5).toString()).toEqual("Ok(5)");
		expect(Ok(Ok(5)).toString()).toEqual("Ok(Ok(5))");

		expect(Err({ code: 15 }).toString()).toEqual("Err([object Object])");
	});

	it("isOk", () => {
		const ok = Ok("ok");
		expect(ok.isOk()).toBeTruthy();

		const err = Err("err");
		expect(err.isOk()).toBeFalsy();
	});

	it("isOk", () => {
		const err = Err("err");
		expect(err.isErr()).toBeTruthy();

		const ok = Ok("ok");
		expect(ok.isErr()).toBeFalsy();
	});

	it("expect", () => {
		expect(Ok("ok").expect("Testing expect")).toEqual("ok");

		try {
			Err("fail result").expect("Testing expect");
		} catch (e: unknown) {
			expect((e as Error).message).toMatch(/Testing expect/gi);
		}
	});

	it("expectErr", () => {
		expect(Err("fail result").expectErr("Testing expect")).toEqual(
			"fail result",
		);

		try {
			Ok("ok result").expectErr("Testing expect");
		} catch (e: unknown) {
			expect((e as Error).message).toMatch(/Testing expect/gi);
		}
	});

	it("ok", () => {
		const ok = Ok("ok");
		expect(ok.ok()).toEqual(Some("ok"));

		const err = Err("err");
		expect(err.ok()).toEqual(None());
	});

	it("err", () => {
		const ok = Ok("ok");
		expect(ok.err()).toEqual(None());

		const err = Err("err");
		expect(err.err()).toEqual(Some("err"));
	});

	it("unwrap", () => {
		expect(Ok(5).unwrap()).toEqual(5);
		expect(Ok([1, 3, 4]).unwrap()).toEqual([1, 3, 4]);
		expect(
			Ok({
				test: 4,
			}).unwrap(),
		).toEqual({
			test: 4,
		});

		expect(
			Err({
				msg: "Random text",
				code: 15,
			}).unwrap,
		).toThrow(Error);
	});

	it("unwrapErr", () => {
		expect(Ok(5).unwrapErr).toThrow(Error);

		expect(
			Err({
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
			Ok({
				test: true,
			}).unwrapOr({ test: false }),
		).toEqual({
			test: true,
		});

		expect(Err(5).unwrapOr({ test: false })).toEqual({
			test: false,
		});
	});

	it("unwrapOrElse", () => {
		expect(Ok("OK").unwrapOrElse(() => "OK")).toEqual("OK");
		expect(Err("Error").unwrapOrElse(() => "Else")).toEqual("Else");
	});

	it("map", () => {
		const x: Result<number, string> = Err("5");
		expect(x.map((item) => item * 5)).toEqual(Err("5"));

		const y: Result<number, string> = Ok(5);
		expect(y.map((item) => item * 5)).toEqual(Ok(25));
	});

	it("map", () => {
		const x: Result<number, string> = Err("5");
		expect(x.map((item) => item * 5)).toEqual(Err("5"));

		const y: Result<number, string> = Ok(5);
		expect(y.map((item) => item * 5)).toEqual(Ok(25));
	});

	it("mapOr", () => {
		const x = Ok("foo");
		expect(x.mapOr(42 as number, (v) => v.length)).toEqual(3);

		const y = Err("bar");
		expect(y.mapOr(42 as number, (v) => v.length)).toEqual(42);
	});

	it("mapOrElse", () => {
		const x: Result<string, string> = Ok("fOo");
		expect(
			x.mapOrElse(
				(err) => err.toLowerCase(),
				(v) => v.toUpperCase(),
			),
		).toEqual("FOO");

		const y: Result<string, string> = Err("BaR");
		expect(
			y.mapOrElse(
				(err) => err.toLowerCase(),
				(v) => v.toUpperCase(),
			),
		).toEqual("bar");
	});

	it("mapErr", () => {
		const stringify = (x: number) => `error code: ${x}`;

		const x: Result<number, number> = Ok(2);
		expect(x.mapErr(stringify)).toEqual(Ok(2));

		const y: Result<number, number> = Err(13);
		expect(y.mapErr(stringify)).toEqual(Err("error code: 13"));
	});

	it("andThen", () => {
		const ok = Ok(25);
		const sq = (x: number) => Ok(x * x);

		// 25 * 25 => 625 + 5 => 630
		const result = ok.andThen(sq).andThen((x) => Ok(x + 5));
		expect(result.unwrap()).toEqual(630);
	});

	it("transpose", () => {
		const x: Result<Option<number>, string> = Ok(Some(5));
		const y: Option<Result<number, string>> = Some(Ok(5));

		expect(x.transpose()).toEqual(y);
	});

	it("flatten", () => {
		expect(Ok(Ok(50)).flatten()).toEqual(Ok(50));
		expect(Ok(50).flatten().unwrap()).toEqual(50);

		expect(Ok(Err("Error")).flatten()).toEqual(Err("Error"));
		expect(Err("Error").flatten()).toEqual(Err("Error"));
	});
});
