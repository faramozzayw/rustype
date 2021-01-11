import { Ok as __Ok, Err as __Err } from "./Result";

/** @category Result */
export const Ok = <T>(ok: T) => new __Ok(ok);

/** @category Result */
export const Err = <E>(err: E) => new __Err(err);
