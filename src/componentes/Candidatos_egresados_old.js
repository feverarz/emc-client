import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faCircle, faEdit } from '@fortawesome/free-regular-svg-icons';
import { faCheck,faTimes } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import { ValidationError } from 'yup';

export default function CandidatosEgresados({tipo_analisis}){

    const [alumnos,setAlumnos]=useState([]);
    const [alumnosCabecera,setAlumnosCabecera]=useState([]);
    const [buscandoAlumnos,setBuscandoAlumnos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');

    useEffect(()=>{
       
        setBuscandoAlumnos(true)

        const buscarCandidatos = async ()=>{
         
           try{
                const {data}= await Axios.get(`/api/alumnos/candidatosegresomp/${tipo_analisis}`)
        
                const lista_unica_alumnos = data.filter((item,index,vector)=>{
                    if(index==0){
                        return item
                    }else{
                        if (vector[index-1].id_alumno!=item.id_alumno){
                            return item
                        }
                    }
                })

                setAlumnosCabecera(lista_unica_alumnos)
                setAlumnos(data)
                setBuscandoAlumnos(false)
                hacerfocoEnPrimerInput("texto-busqueda")
            }catch(err){
                console.log(err)
                setBuscandoAlumnos(false)
                setHuboError(true)
            }
        }
        
        buscarCandidatos()
    },[])



    function seleccionarAlumno(e,item){
        //leccion(item.id_alumno,item.nombre,item.apellido,item.documento)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscandoAlumnos){
        return <Main center><div><Loading/><span className="cargando">Buscando posibles graduaciones...</span></div></Main>
    };

    return(
        <>  
           <Listado alumnosCabecera= {alumnosCabecera} alumnos={alumnos} textoBusqueda={textoBusqueda} seleccionarAlumno={seleccionarAlumno}/>
        </>
    )
}

function Listado({alumnos,alumnosCabecera}){

    return (
    <div>
        <span className="color-63 inline-block mb-2">{alumnosCabecera.length} alumnos encontrados</span>
        
                 <div>
                    <table id="graduaciones">
                        <tbody>
                        {alumnosCabecera.map((item,index)=>{
                            return <tr>
                                <td>{index+1}</td>
                                <td>
                                    <div className="flex f-col">
                                        <div className="text-larger flex items-center">
                                            <p className="bg-tomato text-white p-2"><span title={`ID ${item.id_alumno}`} className="fw-700 text-large">{`${item.alumno}`}</span>  <span className="ml-4" title="Instrumento principal">{item.instrumento}</span></p>
                                            <div className="ml-4">
                                                Nivel Instrumental: <span>{item.nivel_instrumental}</span>
                                            </div>
                                            <div className="ml-2">
                                                Concierto 1: {item.concierto_final_1 ? <FontAwesomeIcon icon={faCheck} className="color-green"/> : <FontAwesomeIcon icon={faTimes} className="color-red"/>}
                                            </div>
                                            <div className="ml-2">
                                                Concierto 2: {item.concierto_final_2 ? <FontAwesomeIcon icon={faCheck} className="color-green"/> : <FontAwesomeIcon icon={faTimes} className="color-red"/>}
                                            </div>
                                        </div>
                                        <div className="flex f-col ml-4">
                                            <AnalizarDatos materias={alumnos.filter(alumno=>alumno.id_alumno==item.id_alumno)}/>
                                        </div>
                                    </div>
                                    
                                </td>
                            </tr>})}
                        </tbody>
                    </table>
        </div>
    </div>
    )
}


function TodasMaterias({materias}){
    const materias_obligatorias = [45,41,92,46,42,223,10,6,2,11,7,3,8].sort((a,b)=>a-b)
    const materias_electivas = [4,5,12,13,198,51,54,137,43,140,131,138,61,62,53,19,20,185,163,186,189]
    
    const mat = materias.map(item=>{return {id:item.id_materia,nota:item.promedio, materia:item.descripcion}})
    
    const verificacion = materias_obligatorias.filter(item=>{
        if (!materias.find(valor=>valor.id_materia==item)){
            return item
        }
    })

    const no_obligatorias = materias.filter(item=>{
        if(!materias_obligatorias.find(valor=>valor==item.id_materia)){
            return item
        }
    })

    const electivas = materias.filter(item=>materias_electivas.find(val=>val==item.id_materia))

    const conciertos = materias[0].concierto_final_1 || materias[0].concierto_final_2
    const nivel = materias[0].id_nivel_instrumental == 7

    const instrumento_complementario = no_obligatorias.filter(item=>(item.id_materia==49 && !item.pianista && Number(noNull(item.promedio))>=60)||(item.id_materia==157 && item.pianista==1 && Number(noNull(item.promedio))>=60))

    const ensambles = no_obligatorias.filter(item=>(item.descripcion.toUpperCase().includes('ENSAMBLE') && analisisNotaEnsamble(item.promedio)))

       if(verificacion.length==0){
            return <div className="flex">
                <p title={JSON.stringify(no_obligatorias)}>Todas cursadas</p>
                <div className="w-200">
                    {materias_obligatorias.map(item=>{
                        const nota = materias.filter(valor=>valor.id_materia==item)
                        return <p className="ml-2">{nota[0].id_materia} - {nota[0].cod_materia} - <span className={nota[0].promedio==null ? 'bg-darkblue color-wheat' : Number(nota[0].promedio)<60 ? 'bg-red color-wheat' : 'bg-green' }>{nota[0].promedio==null ? 'TI' : Number(nota[0].promedio)<60 ? `MAL ${nota[0].promedio}` : nota[0].promedio }</span></p>
                    })}
                </div>
                <div className="w-400">
                    {no_obligatorias.map(val=>{
                        return <p className={ val.id_materia == 157 || val.id_materia==49 ? 'bg-lightskyblue': val.descripcion.toUpperCase().includes('ENSAMBLE') ? 'bg-salmon' : ''}>{val.id_materia} - {val.cod_materia} - {val.descripcion} - <span className={val.promedio==null ? 'bg-darkblue color-wheat' : Number(val.promedio)<60 ? 'bg-red color-wheat' : 'bg-green' }>{!val.promedio==null ? 'TI' : Number(val.promedio)<60 ? `MAL ${val.promedio}` : val.promedio}</span></p>
                    })
                    }
                </div>
                <div className="flex f-col">
                    <p className={instrumento_complementario.length > 1 ? 'bg-green mb-2' : 'bg-red mb-2'}>{instrumento_complementario.length > 1 ? 'OK INST complementario' : 'Falta INST complementario'}</p>
                    <p className={conciertos ? 'bg-green mb-2' : 'bg-red mb-2'}>{conciertos ? 'OK conciertos' : 'Falta al menos 1 concierto'}</p>
                    <p className={nivel ? 'bg-green mb-2' : 'bg-red mb-2'}>{nivel ? 'OK nivel' : 'El nivel no alcanza'}</p>
                    <p className={ensambles.length > 3 ? 'bg-green mb-2' : 'bg-red mb-2'}>{ensambles.length > 3 ? 'OK ensambles' : 'Faltan ensambles'}</p>
                    <p className={electivas.length > 3 ? 'bg-green mb-2' : 'bg-red mb-2'}>{electivas.length > 3 ? 'OK electivas' : 'Faltan electivas'}</p>
                    
                </div>
            </div>
           
        }else{
            return <div>
                {verificacion.map(item=><p className="bg-red color-white">{`Falta cursar o aprobar TI: ${item}`}</p>)}
            </div>
        }
        
}

function AnalizarDatos({materias}){
    const es_pianista = materias[0].es_pianista;
    const materias_obligatorias = [45,41,92,46,42,223,10,6,2,11,7,3,8].sort((a,b)=>a-b)
    const materias_electivas = [4,5,12,13,198,51,54,137,43,140,131,138,61,62,53,19,20,185,163,186,189]
    // según el instrumento principal es diferente la materia que se considera como instrumento complementario. Lo trato como un vector porque podría haber más de 1. En base a los vectores materias_electivas, materias_obligatorias, ensambles y materias_instrumentos_complementarios se define luego un vector de materias extras que no tienen efecto sobre la situación para graduarse o no
    const materias_instrumentos_complementarios = es_pianista ? [157] : [49]

    const obligatorias_cursadas = materias.filter(item=>{
        return materias_obligatorias.find(valor=>item.id_materia==valor)
    })

    const no_obligatorias_cursadas = materias.filter(item=>{
        if(!materias_obligatorias.find(valor=>valor==item.id_materia)){
            return item
        }
    })

    const ensambles_cursados = no_obligatorias_cursadas.filter(item=>(item.descripcion.toUpperCase().includes('ENSAMBLE')))
    
    const instrumentos_complementarios_cursados = no_obligatorias_cursadas.filter(item=>materias_instrumentos_complementarios.find(valor=>item.id_materia==valor))

    const electivas_cursadas = no_obligatorias_cursadas.filter(item=>materias_electivas.find(val=>val==item.id_materia) && !materias_instrumentos_complementarios.find(val=>val==item.id_materia) && !ensambles_cursados.find(val=>val.id_materia==item.id_materia))

    const extras_cursadas = no_obligatorias_cursadas.filter(item=>!materias_electivas.find(val=>val==item.id_materia) && !materias_instrumentos_complementarios.find(val=>val==item.id_materia) && !ensambles_cursados.find(val=>val.id_materia==item.id_materia))
    
    const concierto_1 = materias[0].concierto_final_1 
    const concierto_2 = materias[0].concierto_final_2

    const conciertos = concierto_1 || concierto_2
    const id_nivel_instrumental = materias[0].id_nivel_instrumental
    const nivel_instrumental = materias[0].nivel_instrumental

    const nivel = id_nivel_instrumental == 7

    const instrumento_complementario_cursados = instrumentos_complementarios_cursados.filter(item=>(item.id_materia==49 && !item.pianista && Number(noNull(item.promedio))>=60)||(item.id_materia==157 && item.pianista==1 && Number(noNull(item.promedio))>=60))

    // 1) Analizamos si cursó todas las materias básicas obligatorias no condicionales
    //    incluimos las que fueron reconocidas por test inicial
    const vector_analisis_obligatorias_cursadas = materias_obligatorias.filter(item=>{
        // por cada materia obligatoria verifico si se encuentra entre las materias cursadas por el alumno
        if (!materias.find(valor=>valor.id_materia==item)){
            return item
        }
    })

    const todas_obligatorias_cursadas = vector_analisis_obligatorias_cursadas.length == 0 ? true : false

    const cant_obligatorias_cursadas = obligatorias_cursadas.length
    const cant_ensambles_cursadas = ensambles_cursados.length
    const cant_instrumentos_cursadas = instrumentos_complementarios_cursados.length
    const cant_electivas_cursadas = electivas_cursadas.length
    const cant_extras_cursadas = extras_cursadas.length

        return <div>
            <div className="ml-auto mr-auto w-400">
                <table>
                    <tr>
                        <td>
                            Materias obligatorias
                        </td>
                        <td>
                            {todas_obligatorias_cursadas ? <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/> : <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/>}
                        </td>
                        <td className="text-xsmall">
                            <span>{todas_obligatorias_cursadas ? `` : `Faltan ${materias_obligatorias.length - obligatorias_cursadas.length}`}</span>
                            
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Instrumentos complementarios
                        </td>
                        <td>
                            {instrumento_complementario_cursados.length > 1 ? <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/> : <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/>}
                        </td>
                        <td>
                            {instrumento_complementario_cursados.length > 1 ? `` : `Falta ${2-instrumento_complementario_cursados.length}`}
                        </td>
                    </tr>
                    <tr>
                        <td>
                           Conciertos
                        </td>
                        <td>
                            {conciertos ? <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/> : <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/>}
                        </td>
                        <td>
                            {conciertos ? ``: `No realizó ningún concierto`}
                        </td>
                    </tr>
                    <tr>
                        <td>
                           Nivel Instrumental
                        </td>
                        <td>
                            {nivel ? <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/> : <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/>}
                        </td>
                        <td>
                            {nivel ? `` : `El nivel ${nivel_instrumental} no alcanza`}
                        </td>
                    </tr>
                    <tr>
                        <td>
                           Ensambles
                        </td>
                        <td>
                            {ensambles_cursados.length > 3 ? <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/> : <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/>}
                        </td>
                        <td>
                            {ensambles_cursados.length > 3 ? `` : `Falta ${4-ensambles_cursados.length}`}
                        </td>
                    </tr>
                    <tr>
                        <td>
                           Materias electivas
                        </td>
                        <td>
                            {electivas_cursadas.length > 3 ? <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/> : <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/>}
                        </td>
                        <td>
                            {electivas_cursadas.length > 3 ? `` : `Falta ${4-electivas_cursadas.length}`}
                        </td>
                    </tr>
                </table>
            </div>
            <div className="flex">
                <div className="mr-2">
                    <p className="sub-t-graduaciones">Obligatorias ({cant_obligatorias_cursadas})</p>
                     {imprimirCursadas(obligatorias_cursadas)}

                </div>
                <div>
                    <div className="w-400">
                        <p className="sub-t-graduaciones">Ensambles ({cant_ensambles_cursadas})</p>
                        {imprimirCursadas(ensambles_cursados)}
                    </div>
                    
                    <div className="w-400">
                        <p className="sub-t-graduaciones">Instrumentos complementarios ({cant_instrumentos_cursadas})</p>
                        {imprimirCursadas(instrumentos_complementarios_cursados)}
                    </div>

                    <div className="w-400">
                        <p className="sub-t-graduaciones" title={JSON.stringify(no_obligatorias_cursadas)}>Electivas ({cant_electivas_cursadas})</p>
                        {imprimirCursadas(electivas_cursadas)}
                    </div>

                    <div className="w-400">
                        <p className="sub-t-graduaciones">Extras ({cant_extras_cursadas})</p>
                        {imprimirCursadas(extras_cursadas)}
                    </div>

                </div>
            </div>
        </div>
           
}

function noNull(valor){
    if (!valor){
        return 0
    }else{
        return valor
    }
}

function analisisNotaEnsamble(valor){
    if (valor==null){ // si es null lo tiene aprobado por test de nivel
        return true
    }else if(Number(valor)<60){ //si es 0 todavía no está la nota, si es mayor a 0 y menor a 60 esta desaprobado
        return false
    }else{
        return true
    }
}

function imprimirCursadas(cursadas){
    return  <table>
         {cursadas.map(val=>{
            return <tr title={`${val.cuatrimestre} ${val.tipo_cursada}`}>
                     <td>
                         {val.id_materia} - {val.cod_materia} - {val.descripcion}
                     </td>
                     <td>
                         <span>{val.promedio==null ? 'TEST' : val.promedio}</span>
                     </td>
                     <td>
                         {val.promedio==null ? <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/> : Number(val.promedio)< 60 ? <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/> : <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/>}
                     </td>
                </tr>
        })}
    </table>  
       
    
}