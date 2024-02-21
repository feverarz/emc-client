import React from "react"
import Loading from './Loading'
import {
    faTrash,
    faDownload
  } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useComprobante } from "../hooks/useComprobantes"

export const ComprobantesDePago = () => {

    const { comprobantes, eliminarArchivo, descargarArchivo, loading } = useComprobante()

    return (
        <>
        {loading && <Loading></Loading>}
        {comprobantes 
            ? <table style={{width:'100%'}}>
                <thead style={{width:'100%',marginRight:'auto',marginLeft:'auto', backgroundColor:'#fff'}}> 
                    <tr>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    
                        {comprobantes &&
                            comprobantes.map((comprobante) => {
                                return (
                                    <tr key={comprobante.identificador}>
                                        <td>{ comprobante.nombre }</td>
                                        <td>{ comprobante.documento }</td>
                                        <td>{ comprobante.fecha }</td>
                                        <td style={{ display:'flex',
                                                    justifyContent:'space-evenly',
                                                    alignItems:'center'
                                                }}>
                                            <div style={{
                                                    paddingLeft: '3px', 
                                                    paddingRight: '3px', 
                                                    color: 'tomato', 
                                                    fontSize: 'large', 
                                                    cursor:'pointer'
                                                }}
                                                onClick={() => eliminarArchivo(comprobante.identificador)}
                                                >
                                                <FontAwesomeIcon icon={faTrash}/>
                                            </div>
                                            <div style={{
                                                    paddingLeft: '3px', 
                                                    paddingRight: '3px', 
                                                    color: 'tomato', 
                                                    fontSize: 'large', 
                                                    cursor:'pointer'
                                                }}
                                                onClick={() => descargarArchivo(comprobante.identificador)}
                                                >
                                                <FontAwesomeIcon icon={faDownload} />
                                            </div>
                                        </td>
                                    </tr>

                                )
                            })
                        }
                </tbody>
            </table>  
            : <p>no hay comprobantes</p>
        }
        </>
    )
}