import {
  MessagingPipelineDriver,
  PipelineSink,
  PipelineDriverInitialization,
  Mitter
} from '@mitter-io/core'

import firebase from 'react-native-firebase'
import { DeliveryEndpoint,FcmDeliveryEndpoint } from '@mitter-io/models'
import { noOp } from '../utils'

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

  async getDeliveryEndpoint(): Promise<DeliveryEndpoint> {
    return firebase.messaging().getToken()
      .then(fcmToken => {
        console.info('fcm token: ss', fcmToken)
        return new FcmDeliveryEndpoint(fcmToken)
      })
  }

  endpointRegistered(pipelineSink: PipelineSink, deliveryEndpoint: DeliveryEndpoint): void {
    console.info('registering listener',registerFirebaseListener)
    registerFirebaseListener(pipelineSink, deliveryEndpoint)
  }

  halt() {
    noOp()
  }
}

function registerFirebaseListener(pipelineSink: PipelineSink, _deliveryEndpoint: DeliveryEndpoint): void {
  console.log('registering firebase listener')
  firebase.messaging().onMessage((message) => {
    try {
      console.info('message recevied', message)
      const payload = JSON.parse(message._data.data)
      pipelineSink.received(payload)
    } catch (e) {
      console.warn(e)
    }
  })
}
