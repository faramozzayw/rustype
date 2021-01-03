import { Option } from "./Option";
import { OptionType } from "./../types";

export function Some<T>(some: OptionType<T>) {
	if (typeof some === "undefined" || some === null) {
		throw new TypeError("Error.");
	}

	return new Option(some);
}

export function None() {
	return new Option(null);
}
