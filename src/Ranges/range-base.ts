/**
 * @class RangeBase
 *
 * The range `start..end` contains all values with `start <= x < end`. It is empty if `start >= end`.
 */
export class RangeBase {
	#start: number;
	#end: number;
	#inclusive: boolean;

	/**
	 * @param start The lower bound of the range (inclusive).
	 * @param end The upper bound of the range (inclusive, if the param `inclusive` is `true`, otherwise - exclusive).
	 * @param inclusive Determines whether the end will be included in the range, default to `false`
	 *
	 * @throws Will throw `RangeError` if one of the bounds is NaN.
	 */
	constructor(start: number, end: number, inclusive: boolean = false) {
		if (Number.isNaN(start) || Number.isNaN(end)) {
			throw new RangeError(`"NaN" does not include in range of correct values`);
		}

		this.#start = Math.round(start);
		this.#end = Math.round(inclusive ? end + 1 : end);
		this.#inclusive = inclusive;
	}

	get start() {
		return this.#start;
	}

	get end() {
		return this.#inclusive ? this.#end - 1 : this.#end;
	}

	/**
	 * @todo
	static fromString (rangeString: string, $Range = this): unknown {
		const regExp = /(\d+)?\.\.(=?)(\d+)?/;
		const [_, rawStart, rawInclusive, rawEnd] = rangeString
			.match(regExp)
			.map((item) => (typeof item === "undefined" ? "" : item));

		const start = isEmptyString(rawStart) ? -Infinity : Number(rawStart);
		const end = isEmptyString(rawEnd) ? Infinity : Number(rawEnd);

		const inclusive = rawInclusive === "=";

		return new $Range(start, end, inclusive);
	};*/

	/**
	 * Returns the bounds of a Range
	 */
	getBounds(): [start: number, end: number] {
		return [this.#start, this.#end];
	}

	/**
	 * Returns `true` if the `Range` includes the end.
	 */
	isInclusive(): boolean {
		return this.#inclusive;
	}

	/**
	 * Returns `true` if the `Range` is exhaustive.
	 */
	isExhaustive(): boolean {
		if (Number.isFinite(this.#start) && Number.isFinite(this.#end)) {
			return true;
		}

		return false;
	}

	/**
	 * Returns `true` if `item` is contained in the range.
	 *
	 * @param item The searched value
	 *
	 * @throws Will throw `RangeError` if one of the bounds is NaN.
	 */
	contains(item: number): boolean | never {
		if (Number.isNaN(item)) {
			throw new RangeError(`"NaN" does not include in range of correct values`);
		}

		if (this.#inclusive) {
			return this.#start <= item && item <= this.#end;
		} else {
			return this.#start <= item && item < this.#end;
		}
	}

	/**
	 * Returns `true` if the range contains no items.
	 */
	isEmpty(): boolean {
		return !(this.#start < this.#end);
	}
}
