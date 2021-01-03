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
```ts
interface User {
	id: number;
	firstName: string;
	lastName: string;
	email?: string;
	phone?: string;
	age?: number;
}
const fetchUser = (userID: number): User | null => {
	return {} as User;
};

Some(fetchUser(124125412))
	.map(({ firstName, lastName, ...props }) => ({
		username: `@${firstName}_${lastName}`,
		...props,
	}))
```

### Alternatives?
- [monads](https://github.com/hqoss/monads) - "Type safe Option, Result, and Either types; inspired by Rust."
- [rusted](https://github.com/pocka/rusted) - "[Rust](https://github.com/rust-lang/rust)'s syntax features for javascript."
- [@pacote/option](https://www.npmjs.com/package/@pacote/option) - "[Option](https://doc.rust-lang.org/std/option/enum.Option.html) type inspired by Rust."
