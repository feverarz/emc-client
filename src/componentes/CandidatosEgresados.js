import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faUserCircle, faListAlt } from '@fortawesome/free-regular-svg-icons';
import { faCheck,faTimes } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import { ValidationError } from 'yup';
import AbmAlumno from '../abms/abm-alumno';
import Modal from './Modal';
import useModal from '../hooks/useModal';
import HistorialAlumno from '../componentes/HistorialAlumno';
import ReactTooltip from 'react-tooltip';
import Draggable from 'react-draggable';
import AlumnoMateriasTest from './AlumnoMateriasTest';

export default function CandidatosEgresados({tipo_analisis,carrera}){

    const [alumnos,setAlumnos]=useState([]);
    const [buscandoAlumnos,setBuscandoAlumnos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const {toggle, isShowing } = useModal();

    useEffect(()=>{
       
        setBuscandoAlumnos(true)

        const buscarCandidatos = async ()=>{
         
           try{
                const {data}= await Axios.get(`/api/alumnos/candidatosegresomp_s/${tipo_analisis}/${carrera}`)
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
        return <Main center><div><Loading/><span className="cargando">{tipo_analisis=='pornivel' ? 'Buscando posibles graduaciones por nivel instrumental 5+' : 'Buscando posibles graduaciones por materias obligatorias cursadas...'}</span></div></Main>
    };

    if(!alumnos){
        return <p>No se encontraron alumnos</p>
    }

    if(alumnos.length==0){
        return <p>No se encontraron alumnos</p>
    }

    if(carrera==1){
        return(
            <ListadoMP tipo_analisis={tipo_analisis} alumnos={alumnos} seleccionarAlumno={seleccionarAlumno} isShowing={isShowing} toggle={toggle}/>
     )
    }else{
        return(
            <ListadoPM tipo_analisis={tipo_analisis} alumnos={alumnos} seleccionarAlumno={seleccionarAlumno} isShowing={isShowing} toggle={toggle}/>
     )
    }

}

function ListadoMP({alumnos,tipo_analisis,isShowing,toggle}){

    const[alumnoSeleccionado,setAlumnoSeleccionado]= useState(null)
    const[alumnoSeleccionadoFicha,setAlumnoSeleccionadoFicha]= useState(null)

    const puntaje_7 = alumnos.filter(item=>item.puntaje==7).length;
    const puntaje_6 = alumnos.filter(item=>item.puntaje==6).length;
    const puntaje_5 = alumnos.filter(item=>item.puntaje==5).length;
    const puntaje_4 = alumnos.filter(item=>item.puntaje==4).length;
    const puntaje_3 = alumnos.filter(item=>item.puntaje==3).length;
    const puntaje_2 = alumnos.filter(item=>item.puntaje==2).length;
    const puntaje_1 = alumnos.filter(item=>item.puntaje==1).length;

    return (
    <div>
        { isShowing && alumnoSeleccionadoFicha && <Draggable><Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
            <AbmAlumno id_alumno={alumnoSeleccionadoFicha} 
                       finalizarAltaOcopia={null}
                       esModal={true}
            />    
        </Modal></Draggable>}

        <p className="color-63 inline-block mb-4 mt-4 text-center text-large">{tipo_analisis=='pornivel' ? `${alumnos.length} alumnos encontrados que alcanzaron el nivel 5+` : `${alumnos.length} alumnos encontrados que cursaron todas las materias obligatorias` }</p>
        <table id="cand-grad-resumen" className="ml-auto mr-auto mb-2">
            <thead>
                <tr>
                    <td><span className="ml-2">Cantidad de alumnos</span></td>
                    <td><span className="ml-2">Puntaje para graduación</span></td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{puntaje_7}</td>
                    <td>7</td>
                </tr>
                <tr>
                    <td>{puntaje_6}</td>
                    <td>6</td>
                </tr>
                <tr>
                    <td>{puntaje_5}</td>
                    <td>5</td>
                </tr>
                <tr>
                    <td>{puntaje_4}</td>
                    <td>4</td>
                </tr>
                <tr>
                    <td>{puntaje_3}</td>
                    <td>3</td>
                </tr>
                <tr>
                    <td>{puntaje_2}</td>
                    <td>2</td>
                </tr>
                <tr>
                    <td>{puntaje_1}</td>
                    <td>1</td>
                </tr>
            </tbody>
        </table>

                 <div className="flex justify-center">
                    <table id="graduaciones">
                        <tbody>
                            {alumnos.sort((b,a)=>b.alumno.id_ult_cuatrimestre_cursado - a.alumno.id_ult_cuatrimestre_cursado).map((item,index)=>{
                                return <>
                                    <tr className="titulo-gr">
                                        <td>
                                        </td>
                                        <td>
                                            ID  {item.alumno.id}
                                        </td>
                                        <td>Obligatorias
                                        </td>
                                        <td>Electivas
                                        </td>
                                        <td>Ensambles
                                        </td>
                                        <td>Instrumentos
                                        </td>
                                        <td>Complementarios
                                        </td>                                        
                                        <td>Conciertos
                                        </td>
                                        <td>Nivel
                                        </td>
                                    </tr>
                                    <tr className="fw-700 text-larger">
                                    <td>
                                        {index +1}
                                    </td>
                                    <td>
                                        <p title={item.alumno.id}>{item.alumno.nombre}</p>
                                        <p className="fw-600 mt-2 mb-2 text-smaller">{item.alumno.instrumento} Nivel: {item.alumno.nivel_instrumental}</p>
                                        <FontAwesomeIcon title="Ver cursadas" onClick={()=>alumnoSeleccionado==item.alumno.id ? setAlumnoSeleccionado(null) : setAlumnoSeleccionado(item.alumno.id)} className="cursor-pointer text-larger inline-block-1" icon={faListAlt}/>
                                        <FontAwesomeIcon title="Abrir la ficha del alumno" onClick={()=>{setAlumnoSeleccionadoFicha(item.alumno.id);toggle()}} className="cursor-pointer text-larger inline-block-1 ml-2" icon={faUserCircle}/>
                                        <span className="ml-2" title="Puntaje para graduarse">{item.puntaje} {item.puntaje == 7 ? <FontAwesomeIcon icon={faCheck} className="color-green"/> : <FontAwesomeIcon title={7-item.puntaje > 1 ? `Faltan ${7-item.puntaje} condiciones para graduarse` : 'Falta 1 condición para graduarse'} icon={faTimes} className="color-red"/>}</span>
                                        <p className="fw-600 text-smaller"  title={'Último cuatrimestre cursado'}>{item.alumno.ultimo_cuatrimestre_cursado}</p>
                                        
                                    </td>
                                    <td data-tip='' data-place="top" data-for={`${item.alumno.id}-obligatorias`} title="Materias obligatorias">{item.status.obligatorias.status ? <FontAwesomeIcon title={`${item.cursadas.obligatorias.cursadas} cursadas ${item.cursadas.obligatorias.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon title={`${item.cursadas.obligatorias.cursadas} cursadas ${item.cursadas.obligatorias.aprobadas} aprobadas`} icon={faTimes} className="color-red"/><p>{item.status.obligatorias.mensaje}</p><p>Cursando:{item.status.obligatorias.cursando}</p></div>}
                                    <ReactTooltip  id={`${item.alumno.id}-obligatorias`} type="dark">
                                            {imprimirCursadas(item.cursadas.obligatorias.lista)}
                                    </ReactTooltip>
                                    {item.status.obligatorias.faltante && <div>{item.status.obligatorias.faltante.map(i=><p title={i.materia}>{i.cod_materia}</p>)}</div>}
                                    </td>
                                    <td  data-tip=''  data-place="top" data-for={`${item.alumno.id}-electivas`} title="Materias electivas">{item.status.electivas.status ? <FontAwesomeIcon title={`${item.cursadas.electivas.cursadas} cursadas ${item.cursadas.electivas.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon title={`${item.cursadas.electivas.cursadas} cursadas ${item.cursadas.electivas.aprobadas} aprobadas`} icon={faTimes} className="color-red"/><p>{item.status.electivas.mensaje}</p><p>Cursando:{item.status.electivas.cursando}</p><p>{item.status.electivas.posible_intercambio ? 'Intercambio' : ''}</p></div>}
                                    <ReactTooltip  id={`${item.alumno.id}-electivas`} type="dark">
                                            {imprimirCursadas(item.cursadas.electivas.lista)}
                                    </ReactTooltip>
                                    </td>
                                    <td data-tip=''  data-place="top" data-for={`${item.alumno.id}-ensambles`} title="Ensambles">{item.status.ensambles.status ? <FontAwesomeIcon title={`${item.cursadas.ensambles.cursadas} cursadas ${item.cursadas.ensambles.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : 
                                        <div><FontAwesomeIcon title={`${item.cursadas.ensambles.cursadas} cursadas ${item.cursadas.ensambles.aprobadas} aprobadas`} icon={faTimes} className="color-red"/>
                                        <p>{item.status.ensambles.mensaje}</p>
                                        <p>Cursando:{item.status.ensambles.cursando}</p>
                                        <p>{item.status.ensambles.posible_intercambio ? 'Intercambio' : ''}</p></div>}
                                        <ReactTooltip  id={`${item.alumno.id}-ensambles`} type="dark">
                                            {imprimirCursadas(item.cursadas.ensambles.lista)}
                                        </ReactTooltip>
                                    </td>
                                    
                                    <td data-tip='' data-place="top" data-for={`${item.alumno.id}-instrumentos`} title="Clases de instrumentos">{item.status.instrumentos.status ? <FontAwesomeIcon title={`${item.cursadas.instrumentos.cursadas} cursadas ${item.cursadas.instrumentos.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon title={`${item.cursadas.instrumentos.cursadas} cursadas ${item.cursadas.instrumentos.aprobadas} aprobadas`} icon={faTimes} className="color-red"/><p>{item.status.instrumentos.mensaje}</p><p>Cursando:{item.status.instrumentos.cursando}</p></div>}
                                        {item.status.instrumentos.cursando>0 && <p className="fw-600 text-xsmall">Cursando:{item.status.instrumentos.cursando}</p>}
                                        <ReactTooltip  id={`${item.alumno.id}-instrumentos`} type="dark">
                                            {imprimirCursadas(item.cursadas.instrumentos.lista)}
                                        </ReactTooltip>
                                    </td>
                                    <td data-tip=''   data-place="top" data-for={`${item.alumno.id}-instrumentos_complementarios`} title="Instrumentos complementarios">{item.status.instrumentos_complementarios.status ? <FontAwesomeIcon title={`${item.cursadas.instrumentos_complementarios.cursadas} cursadas ${item.cursadas.instrumentos_complementarios.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon title={`${item.cursadas.instrumentos_complementarios.cursadas} cursadas ${item.cursadas.instrumentos_complementarios.aprobadas} aprobadas`} icon={faTimes} className="color-red"/><p>{item.status.instrumentos_complementarios.mensaje}</p><p>Cursando:{item.status.instrumentos_complementarios.cursando}</p></div>}
                                    <ReactTooltip  id={`${item.alumno.id}-instrumentos_complementarios`} type="dark">
                                            {imprimirCursadas(item.cursadas.instrumentos_complementarios.lista)}
                                        </ReactTooltip>
                                    </td>
                                    
                                    <td title="Conciertos">{item.status.conciertos.status ? <FontAwesomeIcon title={item.alumno.cant_conciertos>1 ? `${item.alumno.cant_conciertos} conciertos realizados` : `${item.alumno.cant_conciertos} concierto realizado`} icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon icon={faTimes} className="color-red"/><p>{item.status.conciertos.mensaje}</p></div>}
                                        <div className="flex justify-center">
                                            {item.alumno.concierto_1 && <span title="Concierto 1 realizado" className="grad-conc">1</span>}
                                            {item.alumno.concierto_2 && <span title="Concierto 2 realizado" className="grad-conc">2</span>}
                                        </div>
                                    </td>
                                    <td title="Nivel instrumental">{item.status.nivel.status ? <FontAwesomeIcon icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon icon={faTimes} className="color-red"/><p>{item.status.nivel.mensaje}</p></div>}</td>
                                </tr>
                                {alumnoSeleccionado==item.alumno.id && <tr>
                                    <td colspan="11">
                                        <div className="flex justify-center text-large mt-2">
                                            <span className="bg-s-titulo-grad p-2">Detalle de las materias cursadas y aprobadas por test inicial</span>
                                            <FontAwesomeIcon title="Cerrar" icon={faWindowClose} className="cursor-pointer ml-2" onClick={()=>setAlumnoSeleccionado(null)}/>
                                        </div>
                                        <div className="flex f-col justify-center zoom-09">
                                            {true && <div>
                                                    <HistorialAlumno id_alumno={item.alumno.id} actual={0} verSoloResumen/>
                                            </div>}
                                            {false && <div className="">
                                                <DetalleMaterias materias={item}/>
                                            </div>}
                                            
                                        </div>
                                        <div className="flex justify-center text-large mt-2 mb-2">
                                            <span className="bg-s-titulo-grad p-2">Materias aprobadas por test inicial</span>
                                        </div>
                                        <div className="flex f-col justify-center items-center mb-4">
                                            <AlumnoMateriasTest id_alumno={item.alumno.id}/>
                                        </div>            

                                    </td>
                                </tr>}    
                                </>
                            })}
                        </tbody>
                    </table>
        </div>
    </div>
    )
}

function ListadoPM({alumnos,tipo_analisis,isShowing,toggle}){

    const[alumnoSeleccionado,setAlumnoSeleccionado]= useState(null)
    const[alumnoSeleccionadoFicha,setAlumnoSeleccionadoFicha]= useState(null)

    // la carrera PM tiene solo 5 requisitos
    const puntaje_5 = alumnos.filter(item=>item.puntaje==5).length;
    const puntaje_4 = alumnos.filter(item=>item.puntaje==4).length;
    const puntaje_3 = alumnos.filter(item=>item.puntaje==3).length;
    const puntaje_2 = alumnos.filter(item=>item.puntaje==2).length;
    const puntaje_1 = alumnos.filter(item=>item.puntaje==1).length;

    return (
    <div>
        { isShowing && alumnoSeleccionadoFicha && <Draggable><Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
            <AbmAlumno id_alumno={alumnoSeleccionadoFicha} 
                       finalizarAltaOcopia={null}
                       esModal={true}
            />    
        </Modal></Draggable>}

        <p className="color-63 inline-block mb-4 mt-4 text-center text-large">{tipo_analisis=='pornivel' ? `${alumnos.length} alumnos encontrados que alcanzaron el nivel 5+` : `${alumnos.length} alumnos encontrados que cursaron todas las materias obligatorias` }</p>
        <table id="cand-grad-resumen" className="ml-auto mr-auto mb-2">
            <thead>
                <tr>
                    <td><span className="ml-2">Cantidad de alumnos</span></td>
                    <td><span className="ml-2">Puntaje para graduación</span></td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{puntaje_5}</td>
                    <td>5</td>
                </tr>
                <tr>
                    <td>{puntaje_4}</td>
                    <td>4</td>
                </tr>
                <tr>
                    <td>{puntaje_3}</td>
                    <td>3</td>
                </tr>
                <tr>
                    <td>{puntaje_2}</td>
                    <td>2</td>
                </tr>
                <tr>
                    <td>{puntaje_1}</td>
                    <td>1</td>
                </tr>
            </tbody>
        </table>

                 <div className="flex justify-center">
                    <table id="graduaciones">
                        <tbody>
                            {alumnos.sort((b,a)=>b.alumno.id_ult_cuatrimestre_cursado - a.alumno.id_ult_cuatrimestre_cursado).map((item,index)=>{
                                return <>
                                    <tr className="titulo-gr">
                                        <td>
                                        </td>
                                        <td>
                                            ID  {item.alumno.id}
                                        </td>
                                        <td>Obligatorias
                                        </td>
                                        <td>Ensambles
                                        </td>
                                        <td>Instrumentos
                                        </td>
                                        <td>Complementarios
                                        </td>                                        
                                        <td>Nivel
                                        </td>
                                    </tr>
                                    <tr className="fw-700 text-larger">
                                    <td>
                                        {index +1}
                                    </td>
                                    <td>
                                        <p title={item.alumno.id}>{item.alumno.nombre}</p>
                                        <p className="fw-600 mt-2 mb-2 text-smaller">{item.alumno.instrumento} Nivel: {item.alumno.nivel_instrumental}</p>
                                        <FontAwesomeIcon title="Ver cursadas" onClick={()=>alumnoSeleccionado==item.alumno.id ? setAlumnoSeleccionado(null) : setAlumnoSeleccionado(item.alumno.id)} className="cursor-pointer text-larger inline-block-1" icon={faListAlt}/>
                                        <FontAwesomeIcon title="Abrir la ficha del alumno" onClick={()=>{setAlumnoSeleccionadoFicha(item.alumno.id);toggle()}} className="cursor-pointer text-larger inline-block-1 ml-2" icon={faUserCircle}/>
                                        <span className="ml-2" title="Puntaje para graduarse">{item.puntaje} {item.puntaje == 7 ? <FontAwesomeIcon icon={faCheck} className="color-green"/> : <FontAwesomeIcon title={7-item.puntaje > 1 ? `Faltan ${7-item.puntaje} condiciones para graduarse` : 'Falta 1 condición para graduarse'} icon={faTimes} className="color-red"/>}</span>
                                        <p className="fw-600 text-smaller"  title={'Último cuatrimestre cursado'}>{item.alumno.ultimo_cuatrimestre_cursado}</p>
                                        
                                    </td>
                                    <td data-tip='' data-place="top" data-for={`${item.alumno.id}-obligatorias`} title="Materias obligatorias">{item.status.obligatorias.status ? <FontAwesomeIcon title={`${item.cursadas.obligatorias.cursadas} cursadas ${item.cursadas.obligatorias.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon title={`${item.cursadas.obligatorias.cursadas} cursadas ${item.cursadas.obligatorias.aprobadas} aprobadas`} icon={faTimes} className="color-red"/><p>{item.status.obligatorias.mensaje}</p><p>Cursando:{item.status.obligatorias.cursando}</p></div>}
                                    <ReactTooltip  id={`${item.alumno.id}-obligatorias`} type="dark">
                                            {imprimirCursadas(item.cursadas.obligatorias.lista)}
                                    </ReactTooltip>
                                    {item.status.obligatorias.faltante && <div>{item.status.obligatorias.faltante.map(i=><p title={i.materia}>{i.cod_materia}</p>)}</div>}
                                    </td>
                                    <td data-tip=''  data-place="top" data-for={`${item.alumno.id}-ensambles`} title="Ensambles">{item.status.ensambles.status ? <FontAwesomeIcon title={`${item.cursadas.ensambles.cursadas} cursadas ${item.cursadas.ensambles.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : 
                                        <div><FontAwesomeIcon title={`${item.cursadas.ensambles.cursadas} cursadas ${item.cursadas.ensambles.aprobadas} aprobadas`} icon={faTimes} className="color-red"/>
                                        <p>{item.status.ensambles.mensaje}</p>
                                        <p>Cursando:{item.status.ensambles.cursando}</p>
                                        <p>{item.status.ensambles.posible_intercambio ? 'Intercambio' : ''}</p></div>}
                                        <ReactTooltip  id={`${item.alumno.id}-ensambles`} type="dark">
                                            {imprimirCursadas(item.cursadas.ensambles.lista)}
                                        </ReactTooltip>
                                    </td>
                                    
                                    <td data-tip='' data-place="top" data-for={`${item.alumno.id}-instrumentos`} title="Clases de instrumentos">{item.status.instrumentos.status ? <FontAwesomeIcon title={`${item.cursadas.instrumentos.cursadas} cursadas ${item.cursadas.instrumentos.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon title={`${item.cursadas.instrumentos.cursadas} cursadas ${item.cursadas.instrumentos.aprobadas} aprobadas`} icon={faTimes} className="color-red"/><p>{item.status.instrumentos.mensaje}</p><p>Cursando:{item.status.instrumentos.cursando}</p></div>}
                                        {item.status.instrumentos.cursando>0 && <p className="fw-600 text-xsmall">Cursando:{item.status.instrumentos.cursando}</p>}
                                        <ReactTooltip  id={`${item.alumno.id}-instrumentos`} type="dark">
                                            {imprimirCursadas(item.cursadas.instrumentos.lista)}
                                        </ReactTooltip>
                                    </td>
                                    <td data-tip=''   data-place="top" data-for={`${item.alumno.id}-instrumentos_complementarios`} title="Instrumentos complementarios">{item.status.instrumentos_complementarios.status ? <FontAwesomeIcon title={`${item.cursadas.instrumentos_complementarios.cursadas} cursadas ${item.cursadas.instrumentos_complementarios.aprobadas} aprobadas`} icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon title={`${item.cursadas.instrumentos_complementarios.cursadas} cursadas ${item.cursadas.instrumentos_complementarios.aprobadas} aprobadas`} icon={faTimes} className="color-red"/><p>{item.status.instrumentos_complementarios.mensaje}</p><p>Cursando:{item.status.instrumentos_complementarios.cursando}</p></div>}
                                    <ReactTooltip  id={`${item.alumno.id}-instrumentos_complementarios`} type="dark">
                                            {imprimirCursadas(item.cursadas.instrumentos_complementarios.lista)}
                                        </ReactTooltip>
                                    </td>
                                    
                                    <td title="Nivel instrumental">{item.status.nivel.status ? <FontAwesomeIcon icon={faCheck} className="color-green"/> : <div><FontAwesomeIcon icon={faTimes} className="color-red"/><p>{item.status.nivel.mensaje}</p></div>}</td>
                                </tr>
                                {alumnoSeleccionado==item.alumno.id && <tr>
                                    <td colspan="11">
                                        <div className="flex justify-center text-large mt-2">
                                            <span className="bg-s-titulo-grad p-2">Detalle de las materias cursadas y aprobadas por test inicial</span>
                                            <FontAwesomeIcon title="Cerrar" icon={faWindowClose} className="cursor-pointer ml-2" onClick={()=>setAlumnoSeleccionado(null)}/>
                                        </div>
                                        <div className="flex f-col justify-center zoom-09">
                                            {true && <div>
                                                    <HistorialAlumno id_alumno={item.alumno.id} actual={0} verSoloResumen/>
                                            </div>}
                                            {false && <div className="">
                                                <DetalleMaterias materias={item}/>
                                            </div>}
                                            
                                        </div>
                                        <div className="flex justify-center text-large mt-2 mb-2">
                                            <span className="bg-s-titulo-grad p-2">Materias aprobadas por test inicial</span>
                                        </div>
                                        <div className="flex f-col justify-center items-center mb-4">
                                            <AlumnoMateriasTest id_alumno={item.alumno.id}/>
                                        </div>            

                                    </td>
                                </tr>}    
                                </>
                            })}
                        </tbody>
                    </table>
        </div>
    </div>
    )
}

function DetalleSeleccionados({id}){
    const [mostrar,setMostrar]=useState(true)

    return <div className="resumen-recuperatorios">
    <div className="flex justify-content-space-between items-center">
    <AbmAlumno id_alumno={id} 
                       finalizarAltaOcopia={null}
                       esModal={false}
            />
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

function imprimirCursadas(cursadas){
    if (!cursadas) return null

    return  <table>
         {cursadas.map(val=>{
            return <tr title={`${val.cuatrimestre} ${val.tipo_cursada}`}>
                     <td>
                         {val.id_materia} - {val.cod_materia} - {val.descripcion} {`${val.reemplaza? `( x ${val.reemplaza})` : ''}`}
                     </td>
                     <td>
                         <span>{val.promedio==null ? 'TEST' : Number(val.promedio) <=100 ? val.promedio : interpretarPromedio(val.promedio)  }</span>
                     </td>
                     <td>
                         {val.promedio==null ? <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/> : Number(val.promedio)< 60 ? <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/> : val.promedio>100 ? <FontAwesomeIcon className="color-red ml-2" icon={faTimes}/> : <FontAwesomeIcon className="color-green ml-2" icon={faCheck}/>}
                     </td>
                </tr>
        })}
    </table>  
       
    
}

function DetalleMaterias({materias}){

return <div className="grilla-dm-graduacion">

        {/*<><div style={{gridArea:'obligatorias'}} className="w-400xx">
            <p className="sub-t-graduaciones">Obligatorias ({materias.cursadas.obligatorias.cursadas})</p>
            {imprimirCursadas(materias.cursadas.obligatorias.lista)}
        </div>

        <div style={{gridArea:'electivas'}} className="w-400xx">
            <p className="sub-t-graduaciones">Electivas ({materias.cursadas.electivas.cursadas})</p>
            {imprimirCursadas(materias.cursadas.electivas.lista)}
        </div>
        <div style={{gridArea:'ensambles'}} className="w-400xx">
            <p className="sub-t-graduaciones">Ensambles ({materias.cursadas.ensambles.cursadas})</p>
            {imprimirCursadas(materias.cursadas.ensambles.lista)}
        </div>
        
        <div style={{gridArea:'instrumentos'}} className="w-400xx">
            <p className="sub-t-graduaciones">Instrumento ({materias.cursadas.instrumentos.cursadas})</p>
            {imprimirCursadas(materias.cursadas.instrumentos.lista)}
        </div>

        <div style={{gridArea:'complementarias'}} className="w-400xx">
            <p className="sub-t-graduaciones">Instrumento complementario ({materias.cursadas.instrumentos_complementarios.cursadas})</p>
            {imprimirCursadas(materias.cursadas.instrumentos_complementarios.lista)}
        </div></>*/}
        <div style={{gridArea:'extras'}} className="w-400xx">
            <p className="sub-t-graduaciones">Extras ({materias.cursadas.extras.cursadas})</p>
            {imprimirCursadas(materias.cursadas.extras.lista)}
        </div>
</div>
}


function DetalleMaterias_old({materias}){

    return <div className="flex flex-wrap justify-center mb-4">
        <div className="mr-2">
            <p className="sub-t-graduaciones">Obligatorias ({materias.cursadas.obligatorias.cantidad})</p>
             {imprimirCursadas(materias.cursadas.obligatorias.lista)}
    
        </div>
            <div className="w-400x">
                <p className="sub-t-graduaciones">Ensambles ({materias.cursadas.ensambles.cantidad})</p>
                {imprimirCursadas(materias.cursadas.ensambles.lista)}
            </div>
            
            <div className="w-400x">
                <p className="sub-t-graduaciones">Instrumento ({materias.cursadas.instrumentos.cantidad})</p>
                {imprimirCursadas(materias.cursadas.instrumentos.lista)}
            </div>
    
            <div className="w-400x">
                <p className="sub-t-graduaciones">Instrumentos complementarios ({materias.cursadas.instrumentos_complementarios.cantidad})</p>
                {imprimirCursadas(materias.cursadas.instrumentos_complementarios.lista)}
            </div>
    
            <div className="w-400x">
                <p className="sub-t-graduaciones">Electivas ({materias.cursadas.electivas.cantidad})</p>
                {imprimirCursadas(materias.cursadas.electivas.lista)}
            </div>
    
            <div className="w-400x">
                <p className="sub-t-graduaciones">Extras ({materias.cursadas.extras.cantidad})</p>
                {imprimirCursadas(materias.cursadas.extras.lista)}
            </div>
    </div>
    }

function interpretarPromedio(promedio){
    switch(promedio){
        case 251: return 'AJ';
        case 252: return 'AI';
        case 253: return 'I';
        case 254: return 'AUS';
        case 255: return 'INC';
        default : return promedio
    }
}