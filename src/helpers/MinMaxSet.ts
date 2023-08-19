export class MinMaxSet<T> extends Set {
  add (value: any) {
    super.add(value)

    const min = Math.min.apply(this, [...this])
    const max = Math.max.apply(this, [...this])

    this.clear()
    super.add(min)
    super.add(max)

    return this
  }
}