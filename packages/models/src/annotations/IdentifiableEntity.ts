import Identifiable from './Identifiable'

interface IdentifiableEntity<T extends IdentifiableEntity<T>> extends Identifiable<T> {}

export default IdentifiableEntity
