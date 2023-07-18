import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faAngleDoubleRight, faAngleDoubleLeft,faPlusCircle, faMobile, faEnvelopeOpenText, faEdit } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare, faMinusSquare, faUser,faWindowClose  } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import FichaCurso from './FichaCurso';
import {useAlumno} from '../Context/alumnoContext';
import AbmAlumno from '../abms/abm-alumno';
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import ImpresionesAlumno from './Impresiones-alumno'
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';

export default function DatosAlumno({id,editarFicha,setEditarFicha}){

const [historial,setHistorial]=useState([])
const [instrumentos,setInstrumentos]=useState([])
const [materiasAprobadasTest,setMateriasAprobadasTest]=useState([])
const [datosDelAlumno,setDatosDelAlumno]=useState([])
const [cargandoDatos,setCargandoDatos]=useState(true)
const [mostrarHistorial, setMostrarHistorial] = useState(false);
const [ampliarCursadas,setAmpliarCursadas] = useState(false);
const [mostrarLateralmente,setMostrarLateralmente] = useState(false);
const {cuatrimestreActivo,reinicializarAlumno,mostrarBusquedaAlumnos} = useAlumno();
const [contadorOperaciones,setContadorOperaciones]=useState(0);
const [mostrarJsonAlumnos,setMostrarJsonAlumnos]=useState(false);
const {toggle, isShowing } = useModal();

useEffect(()=>{
    const buscarDatosAlumno = async ()=>{
        // a promise.all le paso un array de promesas
        try{
            const vectorRetorno = await Promise.all([Axios.get(`/api/alumnos/historial/${id}/1`),
            Axios.get(`/api/alumnos/instrumentos/${id}`),
            Axios.get(`/api/alumnos/${id}`),
            Axios.get(`/api/alumnos/materiastest/${id}`)])
            setCargandoDatos(false)
            // promise.all me devuelve un array con el resultado de las promesas en el mismo orden                                            
            setHistorial(vectorRetorno[0].data);
            setInstrumentos(vectorRetorno[1].data);
            setDatosDelAlumno(...vectorRetorno[2].data); // copio directamente el objeto
            setMateriasAprobadasTest(vectorRetorno[3].data); // copio directamente el objeto

        }catch(err){

            console.log(err)
            const mensaje_html = `<p>La busqueda del alumno falló</p><p>${err}</p>`

            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
              })
        }

    }

    buscarDatosAlumno()
},[id,contadorOperaciones])

/*
useEffect(()=>{
    console.log(historial)
    console.log(instrumentos)
    console.log(datosDelAlumno)
},[historial,instrumentos,datosDelAlumno,materiasAprobadasTest])
*/

const handleSubmit=(e)=>{
    e.preventDefault()
}


const finalizarModificacionFichaAlumno = (actualizar)=>{
   // setEditarFicha(false)
        setContadorOperaciones(contadorOperaciones+1)
        toggle()
}

    if (cargandoDatos){
        return <Loading><span className="cargando">Cargando datos...</span></Loading>
    }

    return (
        <div className={mostrarBusquedaAlumnos ? "pr-2 esp-lateral datos-alumno" : "hidden"}>

        { isShowing && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#1d2c38'}}>
            <AbmAlumno id_alumno={id} 
                       finalizarAltaOcopia={finalizarModificacionFichaAlumno}
                       esModal={true}
            />    
        </Modal>}

            {/*<button title={mostrarLateralmente ? 'Visualizar los datos del alumno horizontalmente en el centro':'Visualizar los datos del alumno verticalmente a la derecha'} className="boton-lateral" onClick={()=>mostrarLateralmente ? setMostrarLateralmente(false) : setMostrarLateralmente(true)}>
                <FontAwesomeIcon icon={mostrarLateralmente ? faAngleDoubleLeft : faAngleDoubleRight}/>
    </button>*/}
            { mostrarJsonAlumnos && <div style={{width: "100%"}}><p>{JSON.stringify(datosDelAlumno, null, "\t")}</p></div>}

            <div className= {mostrarLateralmente ? "flex f-col da-lateral" : "flex f-col"} > 
                <div className={ampliarCursadas ? "max-w-sm rounded overflow-hidden mb-2 ml-4" : "max-w-sm rounded overflow-hidden mb-2 ml-4"}>
                    
                <div className="">
            <div className="flex f-row jcc-ais mt-2">
                <FontAwesomeIcon onClick={()=>setMostrarJsonAlumnos(!mostrarJsonAlumnos)} icon={faUser}/>
                <div className="flex f-col">
                    <div className="inline-block ml-2 mb-2">{datosDelAlumno.apellido},{datosDelAlumno.nombre} (#{datosDelAlumno.id_alumno})
                        { !editarFicha && <span title="Editar la ficha del alumno" onClick={()=>toggle()} className="cursor-pointer texto-acciones-menu text-center ml-2 mt-2 mb-2" >
                            <FontAwesomeIcon className="cursor-pointer" icon={faEdit}/> Ficha
                        </span>}
                    </div>
                </div>

                <button className="botonAbm" onClick={reinicializarAlumno}><FontAwesomeIcon 
                    icon={faWindowClose}/>
                </button>
            </div>                        
        </div>

                    <div className="px-6 py-4 titulosAlumno">
                        <div className="mt-2 mb-2 sub-titulo-cab-modal text-small">Cursadas actuales ({historial.length})</div>
                        <p className="text-gray-700 text-base">
                            
                        </p>
                    </div>  
                    {!ampliarCursadas && <div className="px-6 py-4 flex flex-wrap">
                        {historial.map(
                            item=><span title={crearTitulo(item)} key={item.nro_curso} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
                            {item.mensaje}        
                        </span>
                        )}
                         {!ampliarCursadas && historial.length > 0 && <button title="Ver el detalle de las cursadas actuales" onClick={()=>{setAmpliarCursadas(true)}}>
                            <FontAwesomeIcon className="ic-abm" icon={faPlusCircle}/> <span className="texto-acciones-menu cabecera">{ ampliarCursadas ? 'Reducir':'Ampliar'}</span>
                        </button>
                     }   
                    </div>}
                    
                    { ampliarCursadas && <div className="px-6 py-4">
                        {historial.map(
                            item=><div key={item.nro_curso} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
                            <span className="listaCursadasAmpliada w-35 fw-bold text-small mt-2">{item.mensaje}</span> 
                            <span className="listaCursadasAmpliada fw-bold w-80 text-xxsmall">{item.descripcion}</span> 
                            <span className="listaCursadasAmpliada w-80 text-xxsmall">{item.profesor} </span> 
                            <span className="listaCursadasAmpliada w-80 text-xxsmall">{item.DiaHora} </span>       
                            <span className="listaCursadasAmpliada w-80 text-xxsmall">Aula: {item.Aula} </span>       
                        </div>
                        )}
                         <button title="Cerrar el detalle de cursadas actuales" onClick={()=>{setAmpliarCursadas(false)}}>
                             <FontAwesomeIcon icon={faMinusSquare}/> <span className="texto-acciones-menu cabecera">{ ampliarCursadas ? 'Reducir':'Ampliar'}</span>
                        </button>  
                      {/*  <button onClick={()=>{setMostrarHistorial(true); toggle()}}>
                             <FontAwesomeIcon icon={faSearchPlus}/>
                        </button> */}                     
                    </div>}
                   
  
                </div>
                <div className="max-w-sm rounded overflow-hidden mb-2 ml-4">
                    <div className="px-6 py-4 titulosAlumno">
                        <div className="mt-2 mb-2 sub-titulo-cab-modal text-small">Instrumentos ({tieneInstrumentos(instrumentos).cantidad}) <span className="text-small" title="Niveles ensamble e instrumental">(Ne - Ni)</span></div>
                        <p className="text-gray-700 text-base">
                            
                        </p>
                    </div>  
                    <div className="px-6 py-4">
                    {tieneInstrumentos(instrumentos).ok > 0 && <div className="flex f-col">
                        {instrumentos.map(
                            item=><div className="flex flex-wrap" key={item.id_instrumento}>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
                                {item.instrumentos} (<span title="Nivel ensamble">{item.nivel_e}</span> - <span title="Nivel instrumental">{item.nivel_i} </span>)       
                            </span>
                            </div>
                        )}
                        </div>}
                    </div>
                </div>
                <div className="max-w-sm rounded overflow-hidden mb-2 ml-4">
                    <div className="px-6 py-4 titulosAlumno">
                        <div className="mt-2 mb-2 sub-titulo-cab-modal text-small">Contacto</div>
                        <p className="text-gray-700 text-base">
                        </p>
                    </div>  
                    <div className="px-6 py-4 flex f-col">
                        <span title="Teléfono" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                <FontAwesomeIcon icon={faPhone}></FontAwesomeIcon>  {datosDelAlumno.telefono}     
                         </span>
                        <span title="Teléfono alternativo" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                {datosDelAlumno.Telef_Alternativo}       
                         </span>                        
                        <span title="Teléfono laboral" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                {datosDelAlumno.Telef_Laboral}     
                        </span>    
                        <span title="Celular" className="whitespace-no-wrap inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2    ">
                                <FontAwesomeIcon icon={faMobile}></FontAwesomeIcon>{datosDelAlumno.Celular}     
                        </span>    
                        <div className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
                                <FontAwesomeIcon icon={faEnvelopeOpenText}></FontAwesomeIcon>
                                <a onClick={(e)=>e.preventDefault()} className="mr-2 ml-2 text-white inline-block-1" href={crearMailToIndividual(datosDelAlumno.email)} title="E-mail principal">{datosDelAlumno.email}</a> 
                                <a onClick={(e)=>e.preventDefault()} className="mr-2 ml-2 text-white inline-block-1" href={crearMailToIndividual(datosDelAlumno.Email_Secundario)} title="E-mail secundario">{datosDelAlumno.Email_Secundario}</a>      
                        </div>                           
                     </div>
                </div>          
                <div className="mw-200 rounded overflow-hidden mb-2 ml-4">
                    <div className="px-6 py-4 titulosAlumno">
                        <div className="mt-2 mb-2 sub-titulo-cab-modal text-small">Observaciones</div>
                        <p className="text-gray-700 text-base">
                            
                        </p>
                    </div>  
                    <div className="px-6 py-4 ">
                      <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
                            {datosDelAlumno.obs_finanzas}        
                      </span>
                 
                        
                    </div>
                </div>                        
            </div>
            {<ImpresionesAlumno datosDelAlumno={datosDelAlumno} 
                                   mostrarLateralmente={true}
                                   alumno={{instrumentos:instrumentos,historial:historial,materiasAprobadasTest:materiasAprobadasTest}}
            /> }
                        {/*<div>{JSON.stringify(datosDelAlumno)}</div>*/ } 
                        {editarFicha && <AbmAlumno id_alumno = {id} 
                                        finalizarAltaOcopia={finalizarModificacionFichaAlumno}
                                        esModal={false}/>}                    
        </div>
        

    )
}

function crearTitulo(cursadas){
    return `${cursadas.descripcion}
${cursadas.DiaHora}
${cursadas.profesor}
Aula: ${cursadas.Aula}
Fecha de inscripción: ${cursadas.columna.trim()}\n`
}

function crearMailToIndividual(email){
    return email!=null && email!='' ? `mailto: ${email}` : ``
}

function tieneInstrumentos(instrumentos){
    // el vector de instrumentos siempre trae al menos 1 registro porque incluye
    // datos personales del alumno.
    // Si no tiene instrumentos trae solo los datos personales

    const vector = instrumentos.filter(item=>item.id_instrumento>-1)

    if (vector.length>0){
        return {ok:true,cantidad:vector.length}
    }else{
        return {ok:false,cantidad:vector.length}
    }
}