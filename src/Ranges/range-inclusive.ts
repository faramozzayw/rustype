import { bindIter } from "./utils";
import { RangeBase } from "./range-base";

import type { Clone } from "../utils";
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
	public constructor(start: number, end: number) {
		super(start, end, true);

		if (!Number.isFinite(start) || !Number.isFinite(end)) {
			throw new RangeError(
				`"+-Infinity" does not include in range of correct values`,
			);
		}
	}

	public toString() {
		return `${this.start}..=${this.end}`;
	}

	public clone() {
		return new RangeInclusiveExpr(this.start, this.end);
	}

	[Symbol.iterator] = bindIter(this);
}
