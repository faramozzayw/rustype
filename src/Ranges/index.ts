/** @hidden */
function bindIter($Range: RangeBase) {
	return function* (): Generator<number, void, number> {
		const [start, end] = $Range.getBounds();

		for (let i = start; i < end; i++) {
			yield i;
		}
	};
}

export interface Clone<T> {
	/**
	 * The `T::clone()` method returns a RangeBase object with boundary points identical to the cloned RangeBase.
	 *
	 * The returned clone is copied by **value, not reference,** so a change in either RangeBase does not affect the other.
	 */
	clone: () => T;
}

/**
 * @class RangeBase
 *
 * The range `start..end` contains all values with `start <= x < end`. It is empty if `start >= end`.
 */
class RangeBase {
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

/**
 * @class RangeExpr
 *
 * A (half-open) range bounded inclusively below and exclusively above (`start..end`).
 *
 * The range `start..end` contains all values with `start <= x < end`. It is empty if `start >= end`.
 */
export class RangeExpr extends RangeBase implements Clone<RangeExpr> {
	/**
	 * @param start The lower bound of the range (inclusive).
	 * @param end The upper bound of the range (exclusive).
	 *
	 * @throws Will throw `RangeError` if one of the bounds is `NaN` or `+-Infinity`.
	 */
	constructor(start: number, end: number) {
		super(start, end);

		if (!Number.isFinite(start) || !Number.isFinite(end)) {
			throw new RangeError(
				`"+-Infinity" does not include in range of correct values`,
			);
		}
	}

	toString() {
		return `${this.start}..${this.end}`;
	}

	clone() {
		return new RangeExpr(this.start, this.end);
	}

	[Symbol.iterator] = bindIter(this);
}

/**
 * @class RangeFromExpr
 *
 * A range only bounded inclusively below (`start..`).
 *
 * The `RangeFromExpr` `start..` contains all values with `x >= start`.
 */
export class RangeFromExpr extends RangeBase implements Clone<RangeFromExpr> {
	/**
	 * @param start The lower bound of the range (inclusive).
	 *
	 * @throws Will throw `RangeError` if one of the bounds is `NaN`.
	 */
	constructor(start: number) {
		super(start, Infinity);
	}

	toString() {
		return `${this.start}..`;
	}

	clone() {
		return new RangeFromExpr(this.start);
	}
}

/**
 * A range only bounded exclusively above (`..end`).
 *
 * The `RangeToExpr` `..end` contains all values with `x < end`. It cannot serve as an Iterator because it doesn't have a starting point.
 */
export class RangeToExpr extends RangeBase implements Clone<RangeToExpr> {
	/**
	 * @param start The lower bound of the range (inclusive).
	 * @param end The upper bound of the range (exclusive).
	 *
	 * @throws Will throw `RangeError` if one of the bounds is `NaN`.
	 */
	constructor(end: number) {
		super(-Infinity, end);
	}

	toString() {
		return `..${this.end}`;
	}

	clone() {
		return new RangeToExpr(this.end);
	}
}

/**
 * @class
 *
 * A range bounded inclusively below and above (`start..=end`).
 *
 * The `RangeInclusiveExpr` `start..=end` contains all values with `x >= start` and `x <= end`. It is empty unless `start <= end`.
 */
export class RangeInclusiveExpr
	extends RangeBase
	implements Clone<RangeInclusiveExpr> {
	/**
	 * @param start The lower bound of the range (inclusive).
	 * @param end The upper bound of the range (inclusive).
	 *
	 * @throws Will throw `RangeError` if one of the bounds is `NaN` or `+-Infinity`.
	 */
	constructor(start: number, end: number) {
		super(start, end, true);

		if (!Number.isFinite(start) || !Number.isFinite(end)) {
			throw new RangeError(
				`"+-Infinity" does not include in range of correct values`,
			);
		}
	}

	toString() {
		return `${this.start}..=${this.end}`;
	}

	clone() {
		return new RangeInclusiveExpr(this.start, this.end);
	}

	[Symbol.iterator] = bindIter(this);
}

/**
 * @class
 *
 * A range only bounded inclusively above (..=end).
 *
 * The `RangeToInclusiveExpr` `..=end` contains all values with `x <= end`. It cannot serve as an Iterator because it doesn't have a starting point.
 */
export class RangeToInclusiveExpr
	extends RangeBase
	implements Clone<RangeToInclusiveExpr> {
	/**
	 * @param end The upper bound of the range (inclusive).
	 *
	 * @throws Will throw `RangeError` if one of the bounds is `NaN`.
	 */
	constructor(end: number) {
		super(-Infinity, end, true);
	}

	toString() {
		return `..=${this.end}`;
	}

	clone() {
		return new RangeToInclusiveExpr(this.end);
	}
}

/**
 * @class RangeFullExpr
 *
 * An unbounded range (`..`).
 *
 * `RangeFullExpr` is primarily used as a slicing index, its shorthand is `..`. It cannot serve as an Iterator because it doesn't have a starting point.
 */
export class RangeFullExpr extends RangeBase implements Clone<RangeFullExpr> {
	constructor() {
		super(-Infinity, Infinity);
	}

	toString() {
		return `..`;
	}

	clone() {
		return new RangeFullExpr();
	}
}
