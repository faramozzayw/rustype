export type None = null | undefined;
export type OptionType<T> = T | None;

export type ResultVariants = "ok" | "err";

export type PrimitiveHint = "default" | "number" | "string";

export type Lazy<A> = () => A 
export type Fn<A,B> = (_:A) => B
export type Fn2<A,B,C> = (x:A,y:B) => C