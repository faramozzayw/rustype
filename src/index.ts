export * from "./HashSet";
export { Vector } from "./Vector";
export { Err, Ok, Result } from "./Result";
export { Some, None, Option } from "./Option";
export {
	RangeExpr,
	RangeFromExpr,
	RangeFullExpr,
	RangeInclusiveExpr,
	RangeToExpr,
	RangeToInclusiveExpr,
} from "./Ranges";

export type Lazy<A> = () => A 
export type Fn<A,B> = (_:A) => B
export type Fn2<A,B,C> = (x:A,y:B) => C