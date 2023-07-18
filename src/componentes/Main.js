import React from 'react'

export default function Main({children, center, eliminarClases,ajustarPadding, extraclases}){
    let classes = `Main ${center ? 'Main--center' : ''}`

    if (extraclases){
        classes = `${classes} ${extraclases}`
    }
        return (
            <main style={ajustarPadding ? {paddingLeft:'3rem',paddingRight:'3rem'} : null} className={ eliminarClases ? '' : classes}>
                {children}
            </main>
        )
}