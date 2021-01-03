# Rustype 🦀

Type safe Option and Result from the Rust programming language.

## Install

Using npm

```sh
npm i @faramo.zayw/rustype
```

Using yarn

```sh
yarn add @faramo.zayw/rustype
```

## Usage
### `Option<T>`
```ts
import { Option } from "@faramo.zayw/rustype";

interface User {
	id: number;
	firstName: string;
	lastName: string;
	email?: string;
	phone?: string;
	age: number;
}

const defaultUser: User = { ... };
const fetchUser = (userID: number): Option<User> => { ... };

const myUser = fetchUser(1297)
	.map(({ firstName, lastName, ...props }) => ({
		username: `@${firstName}_${lastName}`,
		...props,
	}))
	.filter(({ age }) => age > 18)
	.unwrapOr({ ...defaultUser });
```

### `Result<T, E>`
```ts
import { Result, Err, Ok } from "@faramo.zayw/rustype";


const safeAdd = (a: number, b: number): Result<number, string> => {
	if(Number.isSafeInteger(a) || Number.isSafeInteger(b)) {

	}
	
	return Err("Some of args isn't safe integer"); 
}
```

### API Docs
[See full API Documentation here](https://rustype.vercel.app/)

### Alternatives?

- [monads](https://github.com/hqoss/monads) - «Type safe Option, Result, and Either types; inspired by Rust.»
- [rusted](https://github.com/pocka/rusted) - «[Rust](https://github.com/rust-lang/rust)'s syntax features for javascript.»
- [@pacote/option](https://www.npmjs.com/package/@pacote/option) - «[Option](https://doc.rust-lang.org/std/option/enum.Option.html) type inspired by Rust.»
- [ReScript](https://rescript-lang.org/ ) - «The JavaScript-like language you have been waiting for.»
