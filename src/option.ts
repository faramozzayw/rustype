import { OptionType } from "./types";
export { Some, None } from "./optionValue";

export class Option<T> {
	private data: OptionType<T>;

	constructor(data: OptionType<T>) {
		this.data = data;
	}

	/** Returns `true` if the option is a `Some` value. */
	public isSome(): boolean {
		return Boolean(this.data);
	}

	/** Returns `true` if the option is a `None` value. */
	public isNone(): boolean {
		return !this.isSome();
	}

	/**
	 * Returns the contained `Some` value, consuming the self value.
	 *
	 * ### **Throw an error**
	 *
	 * Throw an error (`TypeError`) if the self value equals `None`.
	 */
	public unwrap(): T | never {
		if (this.isNone()) {
			throw TypeError("called `Option::unwrap()` on a `None` value");
		}

		return this.data;
	}

	/** Returns the contained `Some` value or a provided default. */
	public unwrapOr(defaultVal: T): T {
		if (this.isNone()) return defaultVal;

		return this.data;
	}

	/** Returns the contained `Some` value or computes it from a closure. */
	public unwrapOrElse(fn: () => T): T {
		if (this.isNone()) {
			return fn();
		}

		return this.data;
	}
}
