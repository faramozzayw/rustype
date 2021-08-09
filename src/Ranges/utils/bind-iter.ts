import { RangeBase } from "../range-base";

/** @hidden */
export function bindIter($Range: RangeBase) {
	return function* (): Generator<number, void, number> {
		const [start, end] = $Range.getBounds();

		for (let i = start; i < end; i++) {
			yield i;
		}
	};
}
