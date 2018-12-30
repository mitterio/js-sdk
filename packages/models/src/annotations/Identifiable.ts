interface Identifiable<T extends Identifiable<T>> {
  identifier(): string
}

export default Identifiable
