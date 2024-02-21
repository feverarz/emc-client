import React from 'react'

export const ModalEliminarAlumno = ({confirmarEliminar, handleClose, id}) => {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
        }}>
            <div style={{ 
                width: '300px',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
            }}>
                <p>¿Esta seguro de querer eliminar esta inscripción?</p>
                <div style={{display:'flex', justifyContent:'space-around', paddingTop:'10px'}}>
                    <button className='button_modal' style={{backgroundColor:'tomato', color:'#fff'}} onClick={() => confirmarEliminar(id)}>Si</button>
                    <button className='button_modal'  onClick={() => handleClose()}>No</button>
                </div>
            </div>
        </div>
    )
}