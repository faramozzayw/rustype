import clone from "clone-deep";

import type { Option, OptionMatch } from "./interface";

import { Ok, Err, Result } from "../Result";
import { unwrapFailed } from "../utils/unwrap-failed";
import { Clone } from "../utils";

export const optionVariant = {
	Some: Symbol(":some"),
	None: Symbol(":none"),
};

/**
 * @category Option
 */
export function Some<T>(some: T) {
	if (typeof some === "undefined" || some === null) {
		throw new TypeError("Error.");
	}

	return new _Some(some);
}

/**
 * @category Option
 */
export function None<T>(): Option<T> {
	return new _None<T>();
}

class _Some<T> implements Option<T> {
	private data: T;

	/** @ignore */
	constructor(data: T) {
		this.data = data;
	}

	public isSome(): boolean {
		return true;
	}

	public isNone(): boolean {
		return false;
	}

	public match<Some, None>({ some }: OptionMatch<T, Some, None>): Some | None {
		return some(this.data);
	}

	public expect(_: string): T | never {
		return this.data;
	}

	public unwrap(): T | never {
		return this.data;
	}

	public unwrapOr(_: T): T {
		return this.data;
	}

	public unwrapOrElse<F extends () => T>(_: F): T {
		return this.data;
	}

	public map<U>(fn: (data: T) => U): Option<U> {
		return Some(fn(this.data));
	}

	public mapOr<U>(_: U, fn: (data: T) => U): U {
		return fn(this.data);
	}

	public mapOrElse<U>(_: () => U, fn: (data: T) => U): U {
		return fn(this.data);
	}

	public okOr<E>(_: E): Result<T, E> {
		return Ok(this.data);
	}

	public okOrElse<E>(_: () => E): Result<T, E> {
		return Ok(this.data);
	}

	public andThen<U extends T>(fn: (data: T) => Option<U>): Option<U> {
		return fn(this.data);
	}

	public filter<P>(predicate: (data: T) => boolean): Option<T> {
		const clone = this.data;
		if (predicate(clone)) {
			return Some(clone);
		}

		return None();
	}

	public zip<U>(other: Option<U>): Option<[T, U]> {
		if (other.isNone()) return None();

		return Some([this.unwrap(), other.unwrap()]);
	}

	public flatten(): Option<T> {
		if (this.data instanceof _None || this.data instanceof _Some) {
			return this.data;
		}

		return Some(this.data);
	}

	public replace(value: T): Option<T> {
		const old = this.data;
		this.data = value;
		return Some(old);
	}

	public transpose<E extends unknown>(): Result<Option<T>, E> {
		if (this.data instanceof Result) {
			if (this.data.isOk()) {
				const innerValue = this.data.unwrap();
				return Ok(Some(innerValue));
			}

			const innerError = this.data.unwrap();
			return Err<E>(innerError);
		} else {
			unwrapFailed(
				"called `Option::transpose()` on an `Some` value where `self` is not an `Result`",
				this.data,
			);
		}
	}

	public and<U>(optb: Option<U>): Option<U> {
		return optb;
	}

	public toString(): string {
		return `Some(${(this.data as Object).toString()})`;
	}
}

class _None<T> implements Option<T> {
	/**
	 * Returns the "default value" for a Option<T> => `None`.
	 */
	public static makeDefault() {
		return None();
	}

	public match<Some, None>({ none }: OptionMatch<T, Some, None>): Some | None {
		return none();
	}

	public isSome(): boolean {
		return false;
	}

	public isNone(): boolean {
		return true;
	}

	public expect(msg: string): T | never {
		throw new Error(msg);
	}

	public unwrap(): T | never {
		throw TypeError("called `Option::unwrap()` on a `None` value");
	}

	public unwrapOr(defaultVal: T): T {
		return defaultVal;
	}

	public unwrapOrElse(fn: () => T): T {
		return fn();
	}

	public map<U>(_: (data: T) => U): Option<U> {
		return None<U>();
	}

	public mapOr<U>(defaultVal: U, _: (data: T) => U): U {
		return defaultVal;
	}

	public mapOrElse<U>(defaultFn: () => U, _: (data: T) => U): U {
		return defaultFn();
	}

	public okOr<E>(err: E): Result<T, E> {
		return Err(err);
	}

	public okOrElse<E>(fn: () => E): Result<T, E> {
		return Err(fn());
	}

	public andThen<U extends T>(_: (data: T) => Option<U>): Option<U> {
		return None();
	}

	public filter(_: (data: T) => boolean): Option<T> {
		return None();
	}

	public replace(_: T): Option<T> {
		return None();
	}

	public zip<U>(_: Option<U>): Option<[T, U]> {
		return None();
	}

	public transpose<E extends unknown>(): Result<Option<T>, E> {
		return Ok(None());
	}

	public flatten(): Option<T> {
		return None();
	}

	public and<U>(_: Option<U>): Option<U> {
		return None();
	}

	public toString(): string {
		return "None";
	}
}
