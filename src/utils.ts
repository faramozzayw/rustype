/** @ignore */
export function unwrapFailed<T>(msg: string, data: T): never {
	throw new Error(`${msg}: ${JSON.stringify(data)}`);
}
