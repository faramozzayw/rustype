import { bindIter } from "./utils";
import { RangeBase } from "./range-base";

import type { Clone } from "../utils";

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
