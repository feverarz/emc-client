import React from 'react'
import AbmCurso from '../abms/abm-curso'
import {useEffect,useState} from 'react'
import Axios from 'axios'
import Main from './Main'

export function NuevosAlumnos({match}){
    const [listado,setListado]=useState(null)
    const [alumnoSeleccionado,setAlumnoSeleccionado]=useState(null)

    useEffect(()=>{
        buscarNuevosAlumnos(); 
    },[])

    async function buscarNuevosAlumnos(){
        try{           
            const {data} = await Axios.get(`/api/tablasgenerales/nuevos-alumnos`)
            setListado(data);
        }catch(err){
            console.log(err);
        }
    }

    if(!listado){
        return null
    }

    return (
        <Main>
            <div>
                <table id="nuevos-alumnos">
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
                        return <><tr onClick={()=>setAlumnoSeleccionado(item)}>
                            <td>{item.fecha_solicitud}</td>
                            <td>{item.cod_solicitud}</td>
                            <td>{item.nombre}</td>
                            <td>{item.apellido}</td>
                            <td>{convertirCarrera(item.carreras)}</td>
                        </tr>
                        {alumnoSeleccionado?.id_alta_web == item.id_alta_web && <tr>
                            <td colSpan="5">
                                <div style={{border:'solid 1px gray',padding:'5px',marginBottom:'25px'}} className='text-center'>
                                        <button className='bg-tomato text-white mt-25 mb-2' onClick={()=>setAlumnoSeleccionado(null)}>X</button>
                                        <h4>Solicitud: {alumnoSeleccionado.cod_solicitud}</h4>
                                        <h4>Fecha: {alumnoSeleccionado.fecha_solicitud}</h4>
                                        <h4>Carrera/s: {convertirCarrera(alumnoSeleccionado.carreras)}</h4>
                                        <table style={{width:'400px',marginRight:'auto',marginLeft:'auto'}}>
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
                                </div>
                            </td>
                        </tr>}
                        </>
                    })}
                    </tbody>
                </table>
                
            </div>
        </Main>
    )
}

const convertirCarrera = (carrera)=>{

    if(carrera==1){
        return 'MUS-P'
    }else if(carrera==2){
        return 'PROD-M'
    }else if(carrera.includes(',')){
        const carrerasarray = carrera.split(',').map(item=>{
                    if(item==1){
                        return 'MUS-P'
                    }else if (item==2){
                        return 'PROD-M'
                    }else{
                        return 'NN'
                    }
                }).reduce((ac,item)=>{
                    return `${ac} ${item}`
                },'')
                return carrerasarray
    }else{
        return 'NN'
    }
}