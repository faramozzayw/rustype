import { RangeBase } from "./range-base";

import type { Clone } from "../utils";

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
	public constructor(start: number) {
		super(start, Infinity);
	}

	public toString() {
		return `${this.start}..`;
	}

	public clone() {
		return new RangeFromExpr(this.start);
	}
}
