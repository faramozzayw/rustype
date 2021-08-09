import { RangeBase } from "./range-base";

import type { Clone } from "../utils";

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
