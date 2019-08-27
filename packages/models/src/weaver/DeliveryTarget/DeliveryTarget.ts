import {StandardDeliveryTargetType} from "./StandardDeliveryTargetType";
import {Identifier} from "../../annotations/Identifier";

export class DeliveryTarget {
    constructor(public deliveryTargetId: string,
                public targetType: StandardDeliveryTargetType,
                public mechanismSpecification: string,
                public validity?: number
                ) {}
}

export type WiredDeliveryTarget = DeliveryTarget & Identifier
