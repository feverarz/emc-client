import React from 'react'
import {useEffect,useState} from 'react'
import Axios from 'axios'
import AbmAlumno from '../abms/abm-alumno'
import { ModalEliminarAlumno } from './ModalEliminarAlumno'
import { convertirCarrera } from '../Helpers/nuevoAlumno-helper'
import Loading from './Loading'

export function NuevosAlumnos({match}){
    const [listado,setListado]=useState(null)
    const [alumnoSeleccionado,setAlumnoSeleccionado]=useState(null)
    const [modalEliminarOpen, setModalEliminarOpen] = useState(false)
    const [createAlumnoModal, setCreateAlumnoModal] = useState(false)
    const [updateListado, setUpdateListado] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        buscarNuevosAlumnos(); 
    },[updateListado])

    async function buscarNuevosAlumnos(){
        setLoading(true)
        try{           
            const {data} = await Axios.get(`/api/tablasgenerales/nuevos-alumnos`)
            setListado(data);
            setLoading(false)
        }catch(err){
            setLoading(false)
            console.log(err);
        }
    }

    const crearNuevoAlumno = () => {
        setCreateAlumnoModal(true)
    }

    const eliminarInscripcion = () => {
        setModalEliminarOpen(true)
    }

    const handleCloseModalEliminar = () => {
        setModalEliminarOpen(false)
    }

    const confirmarEliminar = async (id) => {
        setLoading(true)
        try{           
            await Axios.patch(`/api/tablasgenerales/rechazar-inscripto/${id}`)
            setUpdateListado(!updateListado)
            setLoading(false)
        }catch(err){
            console.log(err);
            setLoading(false)
        }
        handleCloseModalEliminar()
    }

    if(!listado){
        return null
    }

    return (
        <div>
            {loading && <Loading></Loading>}
            {listado && listado.length <= 0  
                ? <span>No hay alumnos con inscripciones pendientes</span>
                :            <div>
                <table id="nuevos-alumnos" style={{width:'100%',marginRight:'auto',marginLeft:'auto', backgroundColor:'#fff'}}>
                    <thead>
                        <tr>
                            <th>Fecha solicitud</th>
                            <th>Código web</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Carrera/s</th>
                        </tr>
                    </thead>
                    <tbody>
                    {listado.map(item=>{
                        return <React.Fragment key={item.id_alta_web}>
                        <tr onClick={()=>{ 
                            setAlumnoSeleccionado(item)
                            console.log(item)
                        }}>
                            <td>{item.fecha_solicitud}</td>
                            <td>{item.cod_solicitud}</td>
                            <td>{item.nombre}</td>
                            <td>{item.apellido}</td>
                            <td>{convertirCarrera(item.carreras)}</td>
                        </tr>
                        {alumnoSeleccionado?.id_alta_web === item.id_alta_web && <tr>
                            <td colSpan="5">
                                <div style={{border:'solid 1px gray',padding:'5px',marginBottom:'25px', backgroundColor:'#fff'}} className='text-center'>
                                        <button className='bg-tomato text-white mt-25 mb-2' onClick={()=>setAlumnoSeleccionado(null)}>X</button>
                                        <h4>Solicitud: {alumnoSeleccionado.cod_solicitud}</h4>
                                        <h4>Fecha: {alumnoSeleccionado.fecha_solicitud}</h4>
                                        <h4>Carrera/s: {convertirCarrera(alumnoSeleccionado.carreras)}</h4>
                                        <table style={{width:'100%',marginRight:'auto',marginLeft:'auto'}}>
                                            <tbody>
                                                <tr>
                                                    <td>Nombre y apellido</td>
                                                    <td>{alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}</td>
                                                </tr>
                                                <tr>
                                                    <td>Fecha Nac.</td>
                                                    <td>{alumnoSeleccionado.fecha_nac}</td>
                                                </tr>
                                                <tr>
                                                    <td>{alumnoSeleccionado.tipoDocumento}</td>
                                                    <td>{alumnoSeleccionado.documento}</td>
                                                </tr>
                                                <tr>
                                                    <td>Domicilio</td>
                                                    <td>{alumnoSeleccionado.domicilio}</td>
                                                </tr>
                                                <tr>
                                                    <td>Localidad</td>
                                                    <td>{alumnoSeleccionado.localidad}</td>
                                                </tr>
                                                <tr>
                                                    <td>Código postal</td>
                                                    <td>{alumnoSeleccionado.codpostal}</td>
                                                </tr>
                                                <tr>
                                                    <td>Provincia</td>
                                                    <td>{alumnoSeleccionado.provincia} {alumnoSeleccionado.otraProvincia ? `(${alumnoSeleccionado.otraProvincia})` : '' }</td>
                                                </tr>
                                                <tr>
                                                    <td>Pais</td>
                                                    <td>{alumnoSeleccionado.pais} {alumnoSeleccionado.otroPais ? `(${alumnoSeleccionado.otroPais})` : '' }</td>
                                                </tr>
                                                <tr>
                                                    <td>Cuatrimestre</td>
                                                    <td>{alumnoSeleccionado.cuatrimestre}</td>
                                                </tr>
                                                <tr>
                                                    <td>Modalidad</td>
                                                    <td>{alumnoSeleccionado.modalidad}</td>
                                                </tr>
                                                <tr>
                                                    <td>Nivel</td>
                                                    <td>{alumnoSeleccionado.nivel}</td>
                                                </tr>
                                                <tr>
                                                    <td>Programa</td>
                                                    <td>{alumnoSeleccionado.programa}</td>
                                                </tr>
                                                <tr>
                                                    <td>Instrumento</td>
                                                    <td>{alumnoSeleccionado.instrumento}</td>
                                                </tr>

                                            </tbody>
                                        </table>
                                        <div>
                                            <button className='button_modal' onClick={crearNuevoAlumno}>Crear nuevo alumno</button>
                                            <button className='button_modal'  onClick={eliminarInscripcion}>Eliminar inscripcion</button>
                                        </div>
                                </div>
                            </td>
                        </tr>
                        }

                        </React.Fragment>
                    })}
                    </tbody>
                
                </table>
                    {modalEliminarOpen && <ModalEliminarAlumno confirmarEliminar={confirmarEliminar} handleClose={handleCloseModalEliminar} id={alumnoSeleccionado.id_insc_alumno}></ModalEliminarAlumno>}
                    {createAlumnoModal &&  
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#fff',
                        width: '80%',
                        height: '80%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2,
                        border: '1px solid #000'
                    }}>
                        <AbmAlumno id_alumno={null} finalizarAltaOcopia={null} esModal={true} datosInscripcion={alumnoSeleccionado}></AbmAlumno>
                    </div>
                    }
            </div>
            }
        </div>
    )
}

