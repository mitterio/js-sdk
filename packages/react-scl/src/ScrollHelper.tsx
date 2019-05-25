import React from 'react'

type ScrollHelperProps = {
  unreadCount:  number
  onScrollHelperClick : () => void
}
class ScrollHelper extends React.Component<ScrollHelperProps> {
  constructor(props: ScrollHelperProps) {
    super(props)
  }

  render() {
    return (
      <div
        onClick={this.props.onScrollHelperClick}
        style={{
          position: 'absolute',
          borderRadius: '50%',
          height: '25px',
          width: '25px',
          bottom:'10%',
          left: '90%',
          backgroundColor: '#bbb',
          display:'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span>&#709;</span>
        <span>{this.props.unreadCount}</span>
      </div>
    )
  }
}

export default ScrollHelper
