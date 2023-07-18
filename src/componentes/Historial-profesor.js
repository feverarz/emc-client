import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faPlusSquare, faEdit, faEyeSlash, faFileCode, faMinusSquare } from '@fortawesome/free-regular-svg-icons';
import { faEye, faPlusCircle, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {imprimir as imprimirHistorial} from '../impresiones/historial';
import {scrollTop, hacerScroll,scrollBottom} from '../Helpers/utilidades-globales';
import {v4 as uuid} from 'uuid'
import GrillaCalificaciones from './GrillaCalificaciones';
import ActualizarCalificaciones from './ActualizarCalificaciones';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import TipoImpresion from '../componentes/TipoImpresion';

export default function Busqueda({profesor,id_prof,menuProfesor,usuario,iniciarVisualizarCurso}){

    const [historialAlumno,setHistorialAlumno]=useState([]);
    const [buscandoHistorial,setBuscandoHistorial]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const [periodos,setPeriodos]=useState([])
    const [orden,setOrden]=useState(1)
    const [ampliar,setAmpliar]=useState(false)
    const [ordenLista,setOrdenLista]=useState('id_cuatrimestre')
    const [nuevoCampo,setNuevoCampo]=useState(true)
    const [contadorOrden,setContadorOrden]=useState(0)
    const [cursoSeleccionadoProfesor,setCursoSeleccionadoProfesor]=useState(null)
    const {toggle, isShowing } = useModal();
    const [preguntasPDF,setPreguntasPDF] = useState(false)
    const [nombrePDF,setNombrePDF] = useState("")
    const [descargar,setDescargar] = useState(true)

    useEffect(()=>{
       
        setBuscandoHistorial(true)

        let mounted = true;

        const buscarHistorialProfesor = async ()=>{

           try{
                const {data}= await Axios.get(`/api/usuarios/profesores/historial/${id_prof}/0`)
                const historialOrdenado = data.sort((a,b)=>b.id_cuatrimestre-a.id_cuatrimestre)
                setHistorialAlumno(data)
                setBuscandoHistorial(false)

                return data
            }catch(err){
                console.log(err.response.data)
                setBuscandoHistorial(false)
                setHuboError(true)
            }
        }
        
        if (mounted){
            buscarHistorialProfesor()
            .then(historial=>{
                crearVectorDePeriodos(historial)
            })
        }


        return () => mounted = false;
    },[])

    useEffect(()=>{
        resetLista()
    },[contadorOrden])


const iniciarImprimirPDF = ()=>{
    if (preguntasPDF){
        setPreguntasPDF(false)
    }else{
        setPreguntasPDF(true)
    }
}

const cerrarPreguntasPDF = ()=>{
    setPreguntasPDF(false)
}

const resetLista=()=>{

    const filtrarVectorCursosOriginal = [...historialAlumno] // para que ordene y renderice inmediatamente hay que copiar el vector original con el operador spread y luego moficiar el estado del vector, si se ordena directamente sobre el original y no se vuelve a llamar a setHistorialAlumno no se renderizaría aunque se haya ordenado
        .sort((a,b)=>{return comparacion(a,b)})
        setHistorialAlumno(filtrarVectorCursosOriginal)

}

const finalizarCalificaciones = ()=>{
    setCursoSeleccionadoProfesor(null)
}

const comparacion = (a,b)=>{

    switch (ordenLista){
        case null : return 0 

        case 'mesa_examen':
            if(nuevoCampo==true){
                return a[ordenLista].toString().localeCompare(b[ordenLista].toString())
            }else{
                if (contadorOrden%2==0){
                    return b[ordenLista].toString().localeCompare(a[ordenLista].toString())
                }else{
                    return a[ordenLista].toString().localeCompare(b[ordenLista].toString())
                }
            }
        case 'PromedioEstimativo':
        case 'CantidadInscriptos':
        case 'id_cuatrimestre':
    
            if(nuevoCampo==true){
                return a[ordenLista] - b[ordenLista]
            }else{
                if (contadorOrden%2==0){
                    return b[ordenLista] - a[ordenLista]
                }else{
                    return a[ordenLista] - b[ordenLista]
                }
            }
            case 'f_solicitud':
    
                const dia_a = Number(a[ordenLista].substring(0,2));
                const mes_a  = Number(a[ordenLista].substring(3,5));
                const anio_a = Number(a[ordenLista].substring(6,10));
    
                const fa = new Date(anio_a,mes_a,dia_a);
    
                const dia_b = Number(b[ordenLista].substring(0,2));
                const mes_b  = Number(b[ordenLista].substring(3,5));
                const anio_b = Number(b[ordenLista].substring(6,10));
    
                const fb = new Date(anio_b,mes_b,dia_b);
    
                if(nuevoCampo==true){
                    return fa-fb
                }else{
                    if (contadorOrden%2==0){
                        return fb-fa
                    }else{
                        return fa-fb
                    }
                }        
        default : 
            if(nuevoCampo==true){
                return a[ordenLista].localeCompare(b[ordenLista])
            }else{
                if (contadorOrden%2==0){
                    return b[ordenLista].localeCompare(a[ordenLista])
                }else{
                    return a[ordenLista].localeCompare(b[ordenLista])
                }
            }
    }
    
}

    const funcionOrden = (nombre_campo)=>{

        if (ordenLista==nombre_campo){
            setNuevoCampo(false)
        }else{
            setNuevoCampo(true)
        }
    
        setOrdenLista(nombre_campo)
        setContadorOrden(contadorOrden+1)
   
    }

    const crearVectorDePeriodos = (historial)=>{
        const periodos = historial.map(item=>{return {id:item.id_cuatrimestre,nombre:item.Cuatrimestre, anio:item.anio}}).sort((a,b)=>b.id-a.id).filter((item,index,vector)=>{
            return index>0 ? item.id!=vector[index-1].id : item
        })
        setPeriodos(periodos)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar el historial del profesor</span></Main>
    }

    if (buscandoHistorial){
        return <Main center><div><Loading blanco={false}/><span className="cargando text-white">Buscando historial del profesor...</span></div></Main>
    };

    return(
        <Main center>  
            { isShowing && cursoSeleccionadoProfesor && 
            <Modal hide={toggle} titulo={''} isShowing={isShowing} estilo={{width:'900px'}} estiloWrapper={{background:'#000000bf'}}>
                            
                <ActualizarCalificaciones nro_curso={cursoSeleccionadoProfesor} usuario={usuario} finalizarCalificaciones={finalizarCalificaciones} visualizacion={true}/>

            </Modal>
            }  
            <div  className="flex f-col justify-center items-center">
                {/*<div className="f-cabecera w-80pc mt-4">
                    Historial de cursos
                </div>*/}
           
                {!menuProfesor && <Listado historial={historialAlumno} 
                        periodos={periodos} 
                        orden={orden} 
                        funcionOrden = {funcionOrden}
                        setorden={setOrden}
                        ampliar={ampliar}
                        setAmpliar={setAmpliar}
                        ejecutarImprimirHistorial={ejecutarImprimirHistorial}
                        profesor={profesor}
                        iniciarImprimirPDF = {iniciarImprimirPDF}
                        preguntasPDF = {preguntasPDF}
                        cerrarPreguntasPDF = {cerrarPreguntasPDF}
                        historialAlumno = {historialAlumno}
                        descargar = {descargar}
                        setDescargar = {setDescargar}
                        iniciarVisualizarCurso = {iniciarVisualizarCurso}
                        />}
                {menuProfesor && <ListadoProfesor historial={historialAlumno} 
                        periodos={periodos} 
                        orden={ordenLista} 
                        funcionOrden = {funcionOrden}
                        setorden={setOrdenLista}
                        ampliar={ampliar}
                        setAmpliar={setAmpliar}
                        usuario = {usuario}
                        toggle = {toggle}
                        setCursoSeleccionadoProfesor = {setCursoSeleccionadoProfesor}
                        ejecutarImprimirHistorial={ejecutarImprimirHistorial}
                        profesor={profesor}
                        />}                        
            </div>
        </Main>
    )
}

const ejecutarImprimirHistorial = (profesor,historialAlumno)=>{
        imprimirHistorial(profesor,historialAlumno)
    }

function Listado({historial, 
                    periodos, 
                    orden, 
                    setorden, 
                    ampliar,
                    setAmpliar,
                    ejecutarImprimirHistorial, 
                    profesor,
                    menuProfesor,
                    iniciarImprimirPDF,
                    preguntasPDF,
                    cerrarPreguntasPDF,
                    historialAlumno,
                    descargar,
                    setDescargar,
                    iniciarVisualizarCurso
                }){
    let tipo = 1;

    const materias = historial.map(item=>{return {id:item.id_materia,nombre:item.cod_materia,descripcion:item.Materia}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
        return index>0 ? item.id!=vector[index-1].id : item
    }).sort((a,b)=>a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0 )

    const prueba = (tipo)=>{
        tipo = tipo
    }

    const resumen = crearResumen(materias,periodos,historial)

    const switchOrden = ()=>{
        if (orden===1){
            setorden(2)
            scrollTop();
        }else{
            setorden(1)
            scrollTop();
        }
    }

    const switchAmpliar=()=>{

        const existe_modal = document.getElementById("titulo-modal")

        if (ampliar){
            setAmpliar(false)
            setTimeout(() => {
              //  hacerScroll("titulo-modal");
              hacerScroll("histo-al");
              window.scrollBy({
                top: -100,
                behaviour: 'smooth'
              })
            }, 200);
        }else{
            setAmpliar(true)
            setTimeout(() => {
                hacerScroll("histo-al");
               // if(existe_modal){
                    window.scrollBy({
                        top: 500,
                        behaviour: 'smooth'
                      })
                //}

            }, 200);
            
        }
        

    }

    return (
    <div> 
       {/*<button title={ orden===1 ? 'Ordenar por materia' : 'Ordenar por cuatrimestre'}>
            <FontAwesomeIcon className={ orden===1 ? 'dispo-0' : ''} icon={faEyeSlash} onClick={switchOrden}/>
        </button>*/}
        { historial.length > 0 && 
        <div> 
            <div className="flex f-row justify-center">
                <p className="color-63 mb-2">{resumen}</p>

                <div className="relative">
                    <span className="text-small text-white ml-4 mb-2 cursor-pointer" title="Imprimir el historial de cursos del profesor" onClick={iniciarImprimirPDF} onClickOld={()=>{ejecutarImprimirHistorial(profesor,historial)}}>
                        <FontAwesomeIcon className="ic-abm" icon={faFilePdf} /> <span className="texto-acciones-menu">Imprimir</span>
                    </span>
                    {preguntasPDF && <TipoImpresion cerrarPreguntasPDF={cerrarPreguntasPDF} 
                                                                    ejecutarImprimirPDF = {()=>imprimirHistorial(profesor,historial,descargar)}
                                                                    modificarDescargar = {setDescargar}
                                                                    descargar = {descargar}
                                                                    />}  
                </div>
              
            </div>
           
            {/*<span onClick={switchOrden} className="orden_historial cursor-pointer"><FontAwesomeIcon className="ic-abm" icon={faEye} />{orden===1 ? ' Ver por materia' : ' Ver por cuatrimestre '}</span>*/}
            
            <button title={ampliar ? 'Reducir' : 'Ampliar'} onClick={switchAmpliar}>
                    <FontAwesomeIcon className="ic-abm" icon={ampliar ? faMinusSquare : faPlusCircle}/> 
                    <span className="texto-acciones-menu bu-accion-abm">{ ampliar ? 'Reducir':'Ampliar'}</span>
            </button>

            {/*<button title={ampliar ? 'Reducir' : 'Ampliar'} onClick={switchAmpliar}>
                <FontAwesomeIcon className={ ampliar ? '' : ''} icon={ampliar ? faMinusSquare : faPlusCircle}/> <span className="texto-acciones-menu cabecera">{ ampliar ? 'Reducir':'Ampliar'}</span>
            </button>
            */}
        </div>
        }
        { orden===1 && ampliar && <div>
            {periodos.map(periodo=><div key={`per-${periodo.id}`}><p className="text-xxsmall font-w-500 color-63 border-bottom-solid-light mt-2 mb-2">
                                    {periodo.nombre}</p>
{/*                    {historial.filter(item=>item.id_cuatrimestre==periodo.id).map(item=><p key={`hs-${item.nro_curso}`} title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.mensaje}</p>)}*/}
                    {historial.filter(item=>item.id_cuatrimestre==periodo.id)
                    .sort((a,b)=> a.nro_curso < b.nro_curso ? -1 : a.nro_curso > b.nro_curso ? 1 : 0)
                    .map((item,index)=>
                        {
                        return <div key={uuid()}><FormatoPeriodoAmpliado item={item} index={index} menuProfesor={menuProfesor} iniciarVisualizarCurso={iniciarVisualizarCurso}/></div>
                        })}
            </div>)}
        </div>}
        { orden===2 && ampliar && <div>
            {materias.map(materia=><div key={`mat-${materia.id}`}><p title={materia.descripcion} className="font-w-500 color-63 border-bottom-solid-light mt-2 mb-2">{materia.nombre} {materia.descripcion}</p>
{/*                    {historial.filter(item=>item.id_materia==materia.id).map(item=><p key={`hs-${item.nro_curso}`} title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.periodo}</p>)} */}
        {historial.filter(item=>item.id_materia==materia.id)
        .sort((a,b)=> a.nro_curso < b.nro_curso ? -1 : a.nro_curso > b.nro_curso ? 1 : 0)
        .map((item,index)=> 
                {
                    return <div key={uuid()}>
                           <FormatoMateriaAmpliado item={item} index={index}/> 
                    </div>
                           

            })}
            </div>)}
        </div>}

    </div>
    )
}

function ListadoProfesor({historial, 
                  periodos, 
                  orden, 
                  toggle,
                  usuario,
                  setCursoSeleccionadoProfesor,
                funcionOrden}){

    const materias = historial.map(item=>{return {id:item.id_materia,nombre:item.cod_materia,descripcion:item.Materia}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
        return index>0 ? item.id!=vector[index-1].id : item
    }).sort((a,b)=>a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0 )


    const resumen = crearResumen(materias,periodos,historial)

    return (
    <div> 
        { historial.length > 0 && 
        <div> 
            <div className="flex f-row justify-center f-cabecera">
                <p className="text-white mb-2 mt-2">{resumen}</p>
            </div>
        </div>
        }
        <table className="table mt-2 mb-8">
                <thead className="bg-blue-500 text-white">
                    <tr className="titulo-lista">
                            <th className={orden=='id_cuatrimestre' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('id_cuatrimestre')}>Período</th>
                            <th className={orden=='Materia' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('Materia')}>Materia</th>
                            <th></th>
                            <th className={orden=='mesa_examen' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('mesa_examen')}>R/ME</th>
                            <th>Día/Hora</th>
                            <th className={orden=='CantidadInscriptos' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('CantidadInscriptos')}>Alumnos</th>
                            <th className={orden=='PromedioEstimativo' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('PromedioEstimativo')}>Promedio</th>
                    </tr>
                </thead>
                <tbody>
                {historial
                .map(item=>
                    <tr className="bg-blueTabla">
                        <td className="filas-lista-principal">
                            {item.Cuatrimestre}
                        </td>
                        <td className="filas-lista-principal">
                            {usuario.id_permiso == 0 && <button onClick={()=>{setCursoSeleccionadoProfesor(item.nro_curso);toggle()}}>
                                {item.Materia}
                            </button>}
                        </td>
                        <td className="filas-lista-principal">
                            {item.cod_materia}
                        </td> 
                        <td className="filas-lista-principal">
                            {item.mesa_examen ? 'ME' : 'R'}
                        </td>                                               
                        <td className="filas-lista-principal">
                            {item.DiaHora}
                        </td>
                        <td className="filas-lista-principal">
                            {item.CantidadInscriptos}
                        </td>
                        <td className="filas-lista-principal">
                            {item.PromedioEstimativo.toFixed(2)}
                        </td>                           
                    </tr>
                )}
                </tbody>
        </table>
    </div>
    )
}

function detallePeriodo(periodo,historial){
    return historial.reduce((ac,item)=>{
        if (item.id_cuatrimestre===periodo.id){
            return ac + 1
        }else{
            return ac
        }
    },0)
}

function FormatoMateriaAmpliado({item,index}){
    return(
    <div className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
        <span className="listaCursadasAmpliada w-150">{item.Cuatrimestre} </span> 
        <span className="listaCursadasAmpliada w-150">{`Alumnos: ${item.CantidadInscriptos} Prom: ${item.PromedioEstimativo.toFixed(2)}`} </span>       
        <span className="listaCursadasAmpliada w-100">{`Curso #${item.nro_curso}`} </span> 
    </div>
    )
}

function FormatoMateriaSimple({item,index}){
    return(
        <p title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.Cuatrimestre}</p>
    )
}

function crearResumen(materias,periodos,historial){

    const cant_materias = materias.length;
    const cant_periodos = periodos.length;

    if (cant_materias===0 || cant_periodos===0){
        return ''
    }

    const periodos_ordenados_anio = periodos.sort((a,b)=>{
        return a.anio > b.anio ? -1 : a.anio < b.anio ? 1 : 0 
    })

    const anio_desde = periodos_ordenados_anio[cant_periodos-1].anio;
    const anio_hasta = periodos_ordenados_anio[0].anio;
   
    const cursos = historial.reduce((acumulador,item)=>{
        return acumulador + 1
    },0)

    const alumnos = historial.reduce((acumulador,item)=>{
        return acumulador + item.CantidadInscriptos
    },0)   
    
    return `${cant_materias} materias, ${cursos} cursos, ${alumnos} alumnos e/ ${anio_desde} y ${anio_hasta}`
}

function FormatoPeriodoAmpliado({item,index,menuProfesor,iniciarVisualizarCurso}){
    return(
    <div onClick={()=>iniciarVisualizarCurso(item.nro_curso)}
    className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 cursor-pointer">
        <span className="listaCursadasAmpliada w-30">{index+1}</span>
        <span className="listaCursadasAmpliada w-60 fw-600">{item.cod_materia} </span> 
        <span className={`listaCursadasAmpliada ${menuProfesor ? 'w-200':'w-150'}`}>{item.Materia}</span> 
        {<span className="listaCursadasAmpliada w-200">{`${item.DiaHora}`} </span>}       
        {<span className="listaCursadasAmpliada w-100">{`${item.mesa_examen ? 'Recuperatorio' : 'Regular'}`} </span>}       
        {/*<span className="listaCursadasAmpliada w-150">{`Alumnos: ${item.CantidadInscriptos} Prom: ${item.PromedioEstimativo.toFixed(2)}`} </span>*/}       

    </div>
    )
}

function FormatoPeriodoSimple({item,index}){
    return(
        <p title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.Materia}</p>
    )
}
