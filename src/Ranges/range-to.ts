import { RangeBase } from "./range-base";

import type { Clone } from "../utils";

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
	public constructor(end: number) {
		super(-Infinity, end);
	}

	public toString() {
		return `..${this.end}`;
	}

	public clone() {
		return new RangeToExpr(this.end);
	}
}
