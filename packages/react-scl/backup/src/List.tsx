import React from 'react'
import ListInterface from './ListInterface'


class List extends React.Component implements ListInterface {

  constructor(props: any) {
    super(props)
  }

  getInt() {
    return 123
    console.log('hello')
  }
}
