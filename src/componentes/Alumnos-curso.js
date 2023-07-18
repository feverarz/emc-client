import React, {useState, useEffect, useRef} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone,faMobile,faEnvelopeOpenText,faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faWindowClose, faUser, faPlusSquare, faEdit, faEyeSlash, faFileCode, faMinusSquare } from '@fortawesome/free-regular-svg-icons';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {scrollTop, hacerScroll,scrollBottom} from '../Helpers/utilidades-globales';
import {v4 as uuid} from 'uuid'
import Calificaciones from '../componentes/Calificaciones';
import {useRecuperatorios} from '../Context/recuperatoriosContext';

export default function AlumnosCurso({nro_curso,notas,paraRecuperatorios}){

    const [alumnos,setAlumnos]=useState([]);
    const [calificaciones,setCalificaciones]=useState([]);
    const [buscandoAlumnos,setBuscandoAlumnos]=useState(false)
    const [buscandoCalificaciones,setBuscandoCalificaciones]=useState(false)
    const [errorCalificaciones,setErrorCalificaciones]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [orden,setOrden]=useState(1)
    const [ampliar,setAmpliar]=useState(false)
    const {recuperatorios,actualizarRecuperatorios} = useRecuperatorios();

    useEffect(()=>{
       
        setBuscandoAlumnos(true)

        let mounted = true;

        const buscarAlumnos = async ()=>{

           try{
                const {data}= await Axios.get(`/api/cursos/alumnos/${nro_curso}`)
        
                const data_mas_selector = data.map((item)=>{
                    return{...item,seleccion:false}
                })

                setAlumnos(data_mas_selector)

                setBuscandoAlumnos(false)
            }catch(err){
                console.log(err.response.data)
                setBuscandoAlumnos(false)
                setHuboError(true)
            }
        }
        
        if (mounted){
            buscarAlumnos()
        }


        return () => mounted = false;
    },[])

    useEffect(()=>{

        // cuando termino de buscar los alumnos y actualizar el
        // vector de alumnos analizo si algún alumno de este curso
        // estaba marcado para inscribirse en un recuperatorio
        if(!buscandoAlumnos && paraRecuperatorios){
            // busco en el vector recuperatorios del contexto si figura
            // el número de este curso
            const copia_recuperatorios = recuperatorios.filter(item=>item.nro_curso==nro_curso)

            if (copia_recuperatorios.length==0){return} // si no encontró el curso salgo

            // si encontró el curso en el vector de recuperatorios me fijo
            // si algún alumno está marcado para ser inscripto
            // el vector recuperatorio tiene elementos tipo objetos {curso:55, alumnos:[1,2,3]}
            const alumnos_actualizados = alumnos.map(item=>{
                if(copia_recuperatorios[0].alumnos.some(alumno=>alumno==item.id_alumno))
                { // si el alumno que estoy leyendo está en en el vector de recuperatorios
                  // lo marco como seleccionado  
                    return {...item,seleccion:true}
                }else{
                    // si no está retorno el item sin modificarlo
                    return item
                }
            })
            setAlumnos(alumnos_actualizados)
        }
    },[buscandoAlumnos])

    useEffect(()=>{

        if (alumnos.length>0 && notas){
            buscarCalificaciones();
        }
    
    },[alumnos]) // cada vez que se recargue la lista de alumnos por ejemplo por una inscripción
                 // o una anulación vemos si un alumno esta seleccionado y verificamos si esta inscripto
    
    const buscarCalificaciones = async ()=>{
    
        setBuscandoCalificaciones(true)
        setErrorCalificaciones(false)
    
        try{
            const {data} = await Axios.get(`/api/cursos/curso/calificaciones/${nro_curso}`)
            setCalificaciones(data);
            setBuscandoCalificaciones(false)
        }catch(err){
            setBuscandoCalificaciones(false)
            setErrorCalificaciones(true)
            console.log(err)
        }
    }

    const cambiarCheck =(e)=>{

        const aux3 = alumnos.map(item=>{
            if (item.id_alumno!=e.target.value){
                return item
            }else{
                return {...item,seleccion:!item.seleccion}
            }
        })
    
        if(paraRecuperatorios){
            const alumnos_seleccionados = aux3.filter(item=>item.seleccion==true).map(item=>item.id_alumno)
            const json_alumnos_curso = {alumnos:alumnos_seleccionados,nro_curso:nro_curso}
            actualizarRecuperatorios(json_alumnos_curso)
        }

        setAlumnos(aux3)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar el historial del profesor</span></Main>
    }

    if (buscandoAlumnos){
        return <Main center><div><Loading blanco={true}/><span className="cargando">Buscando alumnos...</span></div></Main>
    };

    if(paraRecuperatorios){
        return(
            <>  
            <ListadoRecuperatorio cambiarCheck={cambiarCheck} alumnos={alumnos} notas={notas} calificaciones={calificaciones}/>
            </>
        )
    }else{
        return(
            <>  
            <Listado alumnos={alumnos} notas={notas} calificaciones={calificaciones}/>
            </>
        )
    }

}

function Listado({alumnos,notas,calificaciones}){

    
    const [mostrarInfo, setMostrarInfo]= useState(false)

    const switchMostrarInfo = ()=>{
        if (mostrarInfo){
            setMostrarInfo(false)
        }else{
            setMostrarInfo(true)
        }
    }

    return (
    alumnos.filter(item=>item.id_alumno>0).length>0 ? 
    <div className="p-4"> 
        <div className="flex f-row relative items-center">
            <span className="sub-titulo-cab-modal">Alumnos inscriptos</span>
            <span title={mostrarInfo ? 'Ocultar la información de contacto de los alumnos' : 'Visualizar la información de contacto de los alumnos' } onClick={switchMostrarInfo} className="cursor-pointer mr-2 ml-2 text-small" >
                    <FontAwesomeIcon className="cursor-pointer" icon={faInfoCircle}/> {mostrarInfo ? 'Ocultar info' : 'Ver info' } 
            </span> 
        </div>  
        
        {alumnos.filter(item=>item.id_alumno>0).map((item,index)=>
        <div className="flex f-col" key={`curso-al${item.id_alumno}`}>
        <p>{item.comienzo!='' ? `${item.comienzo} hs` : index+1} - {item.nombre} {notas ? <span>{item.instrumentos} </span> : null}</p>

                { mostrarInfo && item.id_alumno >0 &&  
                    <div className="relative"><Info celular={item.celular}
                                                    email={item.email}
                                                    telefono={item.telefono}
                                                    Telef_Alternativo={item.Telef_Alternativo}
                                                    Telef_Laboral={item.Telef_Laboral} />
                    </div>}
                    {notas && calificaciones.length > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(notas=>notas.id_alumno === item.id_alumno)} editar={true}/> }                            
        </div>
        
        )}
    </div>
    :
    <div className="p-4"> 
        <p>No se encontraron alumnos</p>
    </div>
    )
}

function ListadoRecuperatorio({cambiarCheck,alumnos,notas,calificaciones}){

    
    const [mostrarInfo, setMostrarInfo]= useState(false)

    const switchMostrarInfo = ()=>{
        if (mostrarInfo){
            setMostrarInfo(false)
        }else{
            setMostrarInfo(true)
        }
    }

    return (
    alumnos.filter(item=>item.id_alumno>0).length>0 ? 
    <div className="p-4 al-gen-rec"> 
        {/*<div className="flex f-row relative items-center">
            <span className="sub-titulo-cab-modal">Alumnos inscriptos</span>
            <span title={mostrarInfo ? 'Ocultar la información de contacto de los alumnos' : 'Visualizar la información de contacto de los alumnos' } onClick={switchMostrarInfo} className="cursor-pointer mr-2 ml-2 text-small" >
                    <FontAwesomeIcon className="cursor-pointer" icon={faInfoCircle}/> {mostrarInfo ? 'Ocultar info' : 'Ver info' } 
            </span> 
        </div>*/}  
        
        {alumnos.filter(item=>item.id_alumno>0).map((item,index)=>
        <div className="flex items-center" key={`curso-al${item.id_alumno}`}>
            <input value={item.id_alumno} 
                                checked={item.seleccion} 
                                onChange={(e)=>cambiarCheck(e)} type="checkbox" 
                                title="Marque o desmarque éste alumno para incluirlo en el recuperatorio"/>

        <p className="ml-2">{item.nombre} {notas ? <span>{item.instrumentos} </span> : null}</p>

                { mostrarInfo && item.id_alumno >0 &&  
                    <div className="relative"><Info celular={item.celular}
                                                    email={item.email}
                                                    telefono={item.telefono}
                                                    Telef_Alternativo={item.Telef_Alternativo}
                                                    Telef_Laboral={item.Telef_Laboral} />
                    </div>}
                    {notas && calificaciones.length > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(notas=>notas.id_alumno === item.id_alumno)} editar={true}/> }                            
        </div>
        
        )}
    </div>
    :
    <div className="p-4"> 
        <p>No se encontraron alumnos</p>
    </div>
    )
}


function crearMailToIndividual(email){
    return email!=null && email!='' ? `mailto: ${email}` : ``
}

function Info({email,celular,telefono,Telef_Alternativo,Telef_Laboral,Email_Secundario}){
    return (                
    <div className="max-w-sm rounded overflow-hidden ml-4">
            <div className="px-6 py-4 mb-2">
                      <span title="Teléfono" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                <FontAwesomeIcon icon={faPhone}></FontAwesomeIcon>  {telefono}     
                         </span>
                        <span title="Teléfono alternativo" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                {Telef_Alternativo}       
                         </span>                        
                        <span title="Teléfono laboral" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                {Telef_Laboral}     
                        </span>    
                        <span title="Celular" className="whitespace-no-wrap inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2    ">
                                <FontAwesomeIcon icon={faMobile}></FontAwesomeIcon>{celular}     
                        </span>    
                                                    
                        <div className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2    ">
                                <FontAwesomeIcon icon={faEnvelopeOpenText}></FontAwesomeIcon>
                                <a onClick={(e)=>e.preventDefault()} className="mr-2 ml-2 texto-acciones-menu" href={crearMailToIndividual(email)} title="E-mail principal">{email}</a> 
                                <a onClick={(e)=>e.preventDefault()} className="mr-2 ml-2 texto-acciones-menu" href={crearMailToIndividual(Email_Secundario)} title="E-mail secundario">{Email_Secundario}</a>      
                        </div>     
                </div>
  </div>
    )       
}
