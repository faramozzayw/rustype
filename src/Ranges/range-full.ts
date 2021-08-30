import { RangeBase } from "./range-base";

import type { Clone } from "../utils";

/**
 * @class RangeFullExpr
 *
 * An unbounded range (`..`).
 *
 * `RangeFullExpr` is primarily used as a slicing index, its shorthand is `..`. It cannot serve as an Iterator because it doesn't have a starting point.
 */
export class RangeFullExpr extends RangeBase implements Clone<RangeFullExpr> {
	public constructor() {
		super(-Infinity, Infinity);
	}

	public toString() {
		return `..`;
	}

	public clone() {
		return new RangeFullExpr();
	}
}
