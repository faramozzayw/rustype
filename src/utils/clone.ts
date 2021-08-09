export interface Clone<T> {
	/**
	 * The `T::clone()` method returns a RangeBase object with boundary points identical to the cloned RangeBase.
	 *
	 * The returned clone is copied by **value, not reference,** so a change in either RangeBase does not affect the other.
	 */
	clone: () => T;
}
