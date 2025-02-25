import PropTypes from 'prop-types'
import React from 'react'

const ArrowUpwardIcon = ({ style = { width: 18, height: 18 } }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={style}>
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"
            fill="black"
        />
    </svg>
)

ArrowUpwardIcon.propTypes = {
    style: PropTypes.object,
}

export default ArrowUpwardIcon