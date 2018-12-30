import { EntityProfileAttribute } from '@mitter-io/models'
import { CONTENT_ENCODING_IDENTITY, CONTENT_TYPE_TEXT } from '../../constants'

export default abstract class ProfileBaseBuilder<T> {
    public baseEntityProfile: EntityProfileAttribute

    protected constructor() {
        this.baseEntityProfile = {
            key: '',
            contentType: CONTENT_TYPE_TEXT,
            contentEncoding: CONTENT_ENCODING_IDENTITY,
            value: ''
        }
    }

    addAttribute(key: string, value: string): EntityProfileAttribute {
        return Object.assign({}, this.baseEntityProfile, {
            key: key,
            value: value
        })
    }

    build<T>(attributes: { [P in keyof T]?: EntityProfileAttribute }): EntityProfileAttribute[] {
        return Object.values(attributes)
    }
}
