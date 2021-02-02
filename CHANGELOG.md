## 0.3.0 (February 2, 2021)

Added a new type - `Vector`. `Vector` combines methods from [`Iterator`](https://doc.rust-lang.org/std/iter/trait.Iterator.html) and [`Vector`](https://doc.rust-lang.org/std/vec/struct.Vec.html). Also there are all methods from JS array.

### `Option`

- add new methods:
  - static `default`
  - static `fromArray`
  - readonly length
  - `isEmpty`
  - `first`
  - `isEmpty`
  - `first`
  - `splitFirst`
  - `last`
  - `splitLast`
  - `swap`
  - `splitAt`
  - `repeat`
  - `clear`
  - `rotateLeft`
  - `rotateRight`
  - `enumerate`
  - `partition`

## 0.2.0 (January 11, 2021)

### `Option`

- add new methods:
  - static `makeDefault`
  - `unsafe_insert`
  - `okOr`
  - `okOrElse`
  - `match`
  - override `toString`

### `Result`

- add new features:

  - static `makeDefault`
  - `expect`
  - `expectErr`
  - `match`
  - override `toString`

- update docs

## 0.1.0 (December 30, 2020)

Initial release
