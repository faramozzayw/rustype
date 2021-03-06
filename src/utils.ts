export function* range(from = 0, to = 0, inclusive = false) {
	const maxValue = inclusive ? to + 1 : to;

	for (let i = from; i < maxValue; i++) {
		yield i;
	}
}
/** @ignore */
export function unwrapFailed<T>(msg: string, data: T): never {
	throw new Error(`${msg}: ${JSON.stringify(data)}`);
}
