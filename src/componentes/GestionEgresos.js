import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faWindowClose,faCopy, faPlusSquare,faCircle, faHandPeace } from '@fortawesome/free-regular-svg-icons';
import { faInfoCircle, faUndo, faGraduationCap, faSearch, faSync, faCalculator, faEquals, faHashtag, faGreaterThanEqual,faMailBulk,faUserCheck, faUsers, faListOl, faEnvelopeOpen,faEnvelopeSquare, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {useState, useEffect} from 'react';
import Axios from 'axios';
import Swal from 'sweetalert2';
import {useAlumno} from '../Context/alumnoContext';
import Loading from '../componentes/Loading';

export default function GestionEgresos({id_alumno,finalizarCambioStatus,conciertos,setConciertos}){

    const [status, setStatus] = useState(null)
    const [huboError, setHuboError] = useState(false)
    const {usuario} = useAlumno();
    const [cambiandoEstado, setCambiandoEstado]=useState(false);
    const [contadorOperaciones,setContadorOperaciones] = useState(0);
    
    useEffect(()=>{
        
        const obtenerStatus = async()=>{
            try{
                const {data}= await Axios.get(`/api/alumnos/status/${id_alumno}`)

                setStatus(data)
            }catch(err){
                console.log(err)
                 const mensaje_html = `${err}`
                 Swal.fire({
                     html:mensaje_html,
                     icon: 'warning',
                     confirmButtonColor: '#3085d6',
                 })   
             
                 setHuboError(true)
            }


        }

        obtenerStatus()
    },[contadorOperaciones])

    const egresarAlumno = async ()=>{
        try{
    
            setCambiandoEstado(true)
    
            const resultado = await Axios.put(`/api/alumnos/egresar/${id_alumno}/${usuario.id_prof}`);
    
            Swal.fire({
                text:`Se egresó al alumno con éxito`,
                icon: 'warning',
                showConfirmButton: false,
                timer:1500
            })
            .then(()=>{
                setCambiandoEstado(false)
                finalizarCambioStatus();
                setContadorOperaciones(contadorOperaciones+1);
            })   
    
        }catch(err){
            let mensaje_html_error;
    
            console.log('err.response.status',err.response.status)
    
            if(err.response.data.message){
                mensaje_html_error = `<p>Se produjo un error al egresar al alumno</p><p>${err.response.data.message}</p>`
            }else if (err.response.data) {
                mensaje_html_error = `<p>Se produjo un error al egresar al alumno</p><p>${err.response.data}</p>`
            }else{
                mensaje_html_error = `<p>Se produjo un error al egresar al alumno</p><p>${err.response}</p>`
            }
    
            setCambiandoEstado(false)
    
            Swal.fire({
                html:mensaje_html_error,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })   
        }
    }
    
    const restaurarAlumno = async ()=>{
        try{
    
            setCambiandoEstado(true)
    
            const resultado = await Axios.put(`/api/alumnos/restaurar/${id_alumno}/${usuario.id_prof}`);
    
            Swal.fire({
                text:`Se restauró al como alumno regular con éxito`,
                icon: 'warning',
                showConfirmButton: false,
                timer:1500
            })
            .then(()=>{
                setCambiandoEstado(false);
                finalizarCambioStatus();
                setContadorOperaciones(contadorOperaciones+1);
            })   
    
        }catch(err){
            let mensaje_html_error;
    
            console.log('err.response.status',err.response.status)
    
            if(err.response.data.message){
                mensaje_html_error = `<p>Se produjo un error al restaurar al alumno</p><p>${err.response.data.message}</p>`
            }else if (err.response.data) {
                mensaje_html_error = `<p>Se produjo un error al restaurar al alumno</p><p>${err.response.data}</p>`
            }else{
                mensaje_html_error = `<p>Se produjo un error al restaurar al alumno</p><p>${err.response}</p>`
            }
    
            setCambiandoEstado(false)
            Swal.fire({
                html:mensaje_html_error,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })   
        
        }
    }
    const iniciarCambioTipo = (egresar)=>{

        let pregunta;
        let confirmacion;
    
        if (egresar){

            if(status.cursadas > 0){
                pregunta = `¿Confirma que desea egresar al alumno?`
                confirmacion = 'Si, egresar'
            }else{
                notificarNoPuedeEgresar()
                return
            }

        }else{
            pregunta = `¿Confirma que desea restaurar al alumno como alumno regular?`
            confirmacion = 'Si, restaurar'
        }
    
        Swal.fire({
            text:pregunta,
            showCancelButton:true,
            confirmButtonText:confirmacion,
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    if (egresar){
                        egresarAlumno();
                    }else{
                        restaurarAlumno();
                    }
                }else{
                    console.log("Operación de egreso o restauración cancelada")
                }
            }
        )
    
    }

    if (huboError){
        return <span>Se produjo un error al cargar el status del alumno</span>
    }

    if (!status) return null 

    if (cambiandoEstado){
        return <div><Loading/><span className="cargando">Cambiando el estado del alumno...</span></div>
    };

    return (
        <div className="flex">
            <div>
                <div className="flex f-row mt-2">
                    <span className="color-63">{status.Egresado ? 'Status actual: Egresado' : 'Status actual: Regular'}</span>
                    {
                    usuario.id_permiso!=3 ? 
                        null 
                    :
                        status.Egresado ? 
                            <span
                                className="cursor-pointer ml-4"
                                onClick={() => {iniciarCambioTipo(false)}}>
                                    <FontAwesomeIcon className="ic-abm" icon={faUndo}/>
                                <span title="Restaurar como alumno regular" className="texto-acciones-menu bu-accion-abm ml-2">Restaurar</span> 
                            </span>
                        :
                            <span
                                className="cursor-pointer ml-4"
                                onClick={() => {iniciarCambioTipo(true) }}>
                                    <FontAwesomeIcon className="ic-abm" icon={faGraduationCap}/>
                                <span title="Egresar al alumno" className="texto-acciones-menu bu-accion-abm ml-2">Egresar</span> 
                            </span>
                    }

                </div>
                <span className="color-63 text-small block">{status.fecha_alta ? `Fecha de alta: ${status.fecha_alta}` : 'Fecha de alta:?'}</span>
                {status.usuario && status.Egresado && <span className="color-63 text-small block">{`Egresado el ${status.fecha} ${status.hora} por ${status.usuario}`}</span>}
                {status.usuario && !status.Egresado && <span title="El alumno fue egresado pero luego restaurado como alumno regular" className="color-63 text-small block">{`Restaurado el ${status.fecha} ${status.hora} por ${status.usuario}`}</span>}
                {!status.usuario && status.Egresado && <span className="color-63 text-small block">{`Fecha y hora de egreso no registradas`}</span>}
            </div>  
            {/*<ConciertosFinales conciertos={conciertos} setConciertos={setConciertos}/>*/}
        </div>
    )

}

function notificarNoPuedeEgresar(){
    Swal.fire({
        text:`No se puede egresar.
        El alumno no ha cursado materias`,
        icon: 'warning',
        showConfirmButton: false,
        timer:1500
    })
    
}

function ConciertosFinales({conciertos,setConciertos}){
    return <div className="flex f-col justify-center items-center">

        <div className="flex items-center mb-2">
            <label className="text-small color-gray ml-2 mr-2" htmlFor="abm-activo">Concierto 1</label>
            <input  
                                checked={conciertos.concierto1} 
                                onChange={(e)=>setConciertos({...conciertos,concierto1:!conciertos.concierto1})} type="checkbox" 
                                title="El alumno aprobó el primer concierto final"/>
        </div>
        <div className="flex  items-center">
            <label className="text-small color-gray ml-2 mr-2" htmlFor="abm-activo">Concierto 2</label>
            <input 
                                checked={conciertos.concierto2} 
                                onChange={(e)=>setConciertos({...conciertos,concierto2:!conciertos.concierto2})} type="checkbox" 
                                title="El alumno aprobó el segundo concierto final"/>

        </div>
      
    </div>
}