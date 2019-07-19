import {
  MessagingPipelineDriver,
  PipelineSink,
  PipelineDriverInitialization,
  Mitter
} from '@mitter-io/core'

import firebase from 'react-native-firebase'
import {
  DeliveryEndpoint,
  FcmDeliveryEndpoint,
  DeliveryTarget,
  StandardDeliveryTargetType
} from '@mitter-io/models'
import { noOp } from '../utils'
import uuid from 'react-native-uuid'

// tslint:disable-next-line:variable-name
export const FcmDriverSpecName = 'io.mitter.drivers.fcm'

export default class MitterFcmPipelineDriver implements MessagingPipelineDriver {
  private static DriverSpec = {
    name: FcmDriverSpecName
  }

  initialize(mitterContext: Mitter): PipelineDriverInitialization {
    return {
      pipelineDriverSpec: MitterFcmPipelineDriver.DriverSpec,
      initialized: firebase.messaging().requestPermission()
    }
  }

  async getDeliveryTarget(): Promise<DeliveryTarget> {
    return firebase
      .messaging()
      .getToken()
      .then(fcmToken => {
        // return new FcmDeliveryEndpoint(fcmToken)
        return new DeliveryTarget(uuid.v4(), StandardDeliveryTargetType.Fcm, fcmToken)
      })
  }

  deliveryTargetRegistered(pipelineSink: PipelineSink, deliveryTarget: DeliveryTarget): void {
    registerFirebaseListener(pipelineSink, deliveryTarget)
  }

  halt() {
    noOp()
  }
}

function registerFirebaseListener(
  pipelineSink: PipelineSink,
  _deliveryTarget: DeliveryTarget
): void {
  console.log('registering firebase listener')
  firebase.messaging().onMessage(message => {
    try {
      console.info('message recevied', message)
      const payload = JSON.parse(message._data.data)
      pipelineSink.received(payload)
    } catch (e) {
      console.warn(e)
    }
  })
  firebase.notifications().onNotification(notification => {
    // Process your notification as required
    console.log('notificiation resceived', notification)
  })
}
