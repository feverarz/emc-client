import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faMinusSquare } from '@fortawesome/free-regular-svg-icons';
import { faPlusSquare, faPlusCircle,faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {scrollTop, hacerScroll,scrollBottom} from '../Helpers/utilidades-globales';
import {v4 as uuid} from 'uuid'
import CalificacionesAlumno from '../componentes/CalificacionesAlumno';
import {useAlumno} from '../Context/alumnoContext';
import MiHistorial from '../componentes/MiHistorial';
import {imprimir} from '../impresiones/notas';
import {imprimir as imprimirCursadasActuales} from '../impresiones/cursadas-actuales-alumno';
import RenderNota from '../componentes/RenderNota';

export default function HistorialAlumno({id_alumno,actual,cambiarAmpliado,iniciarVisualizarCurso,idRefrescar, verSoloResumen}){

    const [historialAlumno,setHistorialAlumno]=useState([]);
    const [buscandoHistorial,setBuscandoHistorial]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const [periodos,setPeriodos]=useState([])
    const [orden,setOrden]=useState(1)
    const [ampliar,setAmpliar]=useState(false)
    const [historialMateria,setHistorialMateria]=useState(false)
    const [contadorOrden,setContadorOrden]=useState(0)
    const [ordenLista,setOrdenLista]=useState('periodo')
    const [nuevoCampo,setNuevoCampo]=useState(true)
    const [cursoSeleccionado,setCursoSeleccionado]=useState(null)
    const {usuario} = useAlumno();
    const [historialAlumnoFiltros,setHistorialAlumnoFiltros]=useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992 ? true : false)
    const [cursosActuales,setCursosActuales] = useState([])

    useEffect(()=>{
        console.log(window.innerWidth)
    },[window.innerWidth])

    useEffect(()=>{
       
        setBuscandoHistorial(true)

        let mounted = true;

        const buscarHistorialAlumno = async ()=>{

           try{

                const url = usuario.id_permiso==100 ? `/api/alumnos/historialvistaalumno/${id_alumno}/${actual}/0` : `/api/alumnos/historial/${id_alumno}/${actual}/0`
                const {data}= await Axios.get(url)
        
                const historial_cursos = usuario.id_permiso==100 ? data.map(item=>item.curso) : data

                setHistorialAlumno(data)
                setHistorialAlumnoFiltros(data)
                setBuscandoHistorial(false)
                    
                if(usuario.id_permiso==100){
                    return historial_cursos
                }else{
                    return data
                }
                


            }catch(err){
                console.log(err.response.data)
                setBuscandoHistorial(false)
                setHuboError(true)
            }
        }

        const buscarCursadasActuales = async ()=>{

            try{
 
                 const url = `/api/alumnos/historial/${id_alumno}/1/1`
                 const {data}= await Axios.get(url)
 
                 setCursosActuales(data)
                 setBuscandoHistorial(false)
                     
             }catch(err){
                 console.log(err.response.data)
                 setBuscandoHistorial(false)
                 setHuboError(true)
             }
         }
        
        if (mounted){
            buscarHistorialAlumno()
            .then(historial=>{
                crearVectorDePeriodos(historial)
                buscarCursadasActuales()
            })
        }

        window.addEventListener("resize", handleResize)

        return () => mounted = false;
    },[idRefrescar])

    useEffect(()=>{
        if(cambiarAmpliado){ // depende de donde se llame no se pasa esta funcion
            cambiarAmpliado(ampliar) // le aviso al componente padre si estamos mostrando un historial ampliado o reducido
        }
    },[ampliar])

    useEffect(()=>{
        resetLista()
    },[contadorOrden])

    const resetLista=()=>{

        const filtrarVectorCursosOriginal = [...historialAlumno] // para que ordene y renderice inmediatamente hay que copiar el vector original con el operador spread y luego moficiar el estado del vector, si se ordena directamente sobre el original y no se vuelve a llamar a setHistorialAlumno no se renderizaría aunque se haya ordenado
            .sort((a,b)=>{return comparacion(a,b)})
            setHistorialAlumno(filtrarVectorCursosOriginal)
    
    }

    const handleResize = () => {
        if (window.innerWidth < 992) {
            setIsMobile(true)
        } else {
            setIsMobile(false)
        }
      }

    const comparacion = (a,b)=>{

        switch (ordenLista){
            case null : return 0 
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

const finalizarCalificaciones = ()=>{
    setCursoSeleccionado(null)
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

const filtrarProfesor = (profe)=>{
    setHistorialAlumnoFiltros(historialAlumno.filter(item=>item.curso.profesor==profe || profe==-1))
}

const filtrarMateria = (materia)=>{
    setHistorialAlumnoFiltros(historialAlumno.filter(item=>item.curso.descripcion==materia || materia==-1))
}

const filtrarPeriodo = (periodo)=>{
    setHistorialAlumnoFiltros(historialAlumno.filter(item=>item.curso.periodo==periodo || periodo==-1))
}

    const crearVectorDePeriodos = (historial)=>{

        const periodos = historial.map(item=>{return {id:item.id_cuatrimestre,nombre:item.periodo, anio:item.anio}}).sort((a,b)=>b.id-a.id).filter((item,index,vector)=>{
            return index>0 ? item.id!=vector[index-1].id : item
        })

        setPeriodos(periodos)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar el historial del alumno</span></Main>
    }

    if (buscandoHistorial){
        return <Main center><div><Loading/><span className="cargando">Buscando historial del alumno...</span></div></Main>
    };

    if (usuario.id_permiso==100){
        return(
            <Main center>
                <div className="flex f-col justify-center"> 

                    <div className="flex f-col justify-center" style={usuario.id_permiso == 100 ? {  backgroundImage: "url(" + "http://www.escuelademusica.org/wp-content/themes/emc/img/imagen_header_20.jpg" + ")",backgroundRepeat:"no-repeat",backgroundSize:"cover", height:"200px"} : null}> 
                        <p className="mm-cursadas">Mis materias cursadas</p> 
                        <MiHistorial  historial={historialAlumno.map(item=>item.curso)} setProfe={filtrarProfesor} setMateria={filtrarMateria} setPeriodo={filtrarPeriodo}/>
                    </div>
                   { <ListadoAlumno historial={historialAlumnoFiltros} 
                            historialOriginal = {historialAlumno}
                            periodos={periodos} 
                            orden={orden} 
                            setorden={setOrden}
                            usuario = {usuario}
                            ampliar={ampliar}
                            setAmpliar={setAmpliar}
                            cursoSeleccionado={cursoSeleccionado}
                            setCursoSeleccionado = {setCursoSeleccionado}
                            funcionOrden = {funcionOrden}
                            historialMateria = {historialMateria}
                            setHistorialMateria = {setHistorialMateria}
                            id_alumno = {id_alumno}
                            isMobile = {isMobile}
                            cursosActuales = {cursosActuales}
                            noHayFiltrosActivos = {historialAlumno.length==historialAlumnoFiltros.length}
                            />}
                </div>
            </Main>
           
        )
    }
    
       return(
        <Main center>
            <div className="flex justify-center">  
                <Listado historial={historialAlumno} 
                        periodos={periodos} 
                        orden={orden} 
                        setorden={setOrden}
                        usuario = {usuario}
                        ampliar={ampliar}
                        setAmpliar={setAmpliar}
                        setCursoSeleccionado = {setCursoSeleccionado}
                        funcionOrden = {funcionOrden}
                        historialMateria = {historialMateria}
                        setHistorialMateria = {setHistorialMateria}
                        id_alumno = {id_alumno}
                        usuario = {usuario}
                        iniciarVisualizarCurso = {iniciarVisualizarCurso}
                        verSoloResumen = {verSoloResumen}
                        />
            </div>
        </Main>
       
    )
}

function Listado({historial, periodos, orden, usuario, ampliar,setAmpliar,historialMateria,setHistorialMateria,id_alumno,iniciarVisualizarCurso,verSoloResumen}){
    let tipo = 1;

    const materias = historial.map(item=>{return {id:item.id_materia,nombre:item.mensaje,descripcion:item.descripcion}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
        return index>0 ? item.id!=vector[index-1].id : item
    }).sort((a,b)=>a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0 )

    const resumen = crearResumen(materias,periodos,usuario)

    const switchHistorialMateria = ()=>{
       setHistorialMateria(!historialMateria)
    }

    const switchAmpliar=()=>{

        const existe_modal = document.getElementById("titulo-modal")

        if (ampliar){
            setAmpliar(false)
            setTimeout(() => {
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
                    window.scrollBy({
                        top: 500,
                        behaviour: 'smooth'
                      })

            }, 200);
            
        }
        
    }

    if (verSoloResumen && historial.length > 0){
        return <ResumenMateriasEspecialGraduados historial={historial} id_alumno ={id_alumno}/>
    }

    return (
    <div> 
        { historial.length > 0 && 
        <>
            <div>
                <div className="flex f-row">
                    <p className="text-small color-63 mb-2">{resumen}</p>
                    { !historialMateria && <span title="Cerrar resumen de materias" onClick={switchHistorialMateria} className="cursor-pointer ml-4 text-xsmall"><FontAwesomeIcon className="color-tomato" icon={faInfoCircle}/> Ver el resumen de las materias cursadas</span> }               
                </div>
                { historialMateria && <div className="border-solid-gray">
                    <span title="Cerrar historial de materias" onClick={switchHistorialMateria} className="cursor-pointer crono-close"><FontAwesomeIcon icon={faWindowClose}/></span>           
                    <ResumenMaterias historial={historial} id_alumno ={id_alumno} iniciarVisualizarCurso={iniciarVisualizarCurso}/>
                 </div>}
                <button title={ampliar ? 'Reducir' : 'Ampliar'} onClick={switchAmpliar}>
                    <FontAwesomeIcon className="ic-abm" icon={ampliar ? faMinusSquare : faPlusCircle}/> 
                    <span className="texto-acciones-menu bu-accion-abm">{ ampliar ? 'Reducir':'Ampliar'}</span>
                </button>
            </div>

        </>
        }
        { orden===1 && <div className="flex flex-wrap text-xxsmall">
            {periodos.map(periodo=><div className="p-2" key={`per-${periodo.id}`}><p className="font-w-500 color-63 border-bottom-solid-light mt-2 mb-2">{ampliar ? periodo.nombre : null}</p>
                    {historial.filter(item=>item.id_cuatrimestre==periodo.id)
                    .sort((a,b)=> a.nro_curso < b.nro_curso ? -1 : a.nro_curso > b.nro_curso ? 1 : 0)
                    .map(item=>
                        {
                            if (ampliar){
                                return (<div className='flex f-col' key={uuid()}><FormatoPeriodoAmpliado item={item} iniciarVisualizarCurso={iniciarVisualizarCurso}/></div>)
                            }else{
                                return null
                            }

                        })}
            </div>)}
        </div>}
    </div>
    )
}

function ListadoAlumno({historial, 
    historialOriginal,
    periodos, 
    usuario,
    cursoSeleccionado,
    noHayFiltrosActivos,
    isMobile,
  cursosActuales}){

const [verCalificacion,setVerCalificacion] = useState(false)

const historialOriginal_extraigo_cursos = historialOriginal.map(item=>item.curso)

const materias = historialOriginal_extraigo_cursos.map(item=>{return {id:item.id_materia,nombre:item.mensaje,descripcion:item.descripcion}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
    return index>0 ? item.id!=vector[index-1].id : item
}).sort((a,b)=>a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0 )

const resumen = crearResumen(materias,periodos,usuario)

return (
<div className="ff-montserrat"> 
{ cursosActuales.length > 0 && noHayFiltrosActivos && 
    <CursadasActuales isMobile={isMobile} cursadas={cursosActuales} imprimir={imprimirCursadasActuales}/>
}

{ historial.length > 0 && 
<div> 
    <div className="flex f-col items-center p-4">
        {/*<p className="text-large mb-4">Mis cursadas</p>*/}
        <p className="text-small mb-2 bold color-gray">{resumen}</p>
        <button className="border-solid-gray" onClick={()=>imprimir(historial)}>Imprimir en PDF</button>
    </div>
</div>
}
<table className="table flex justify-center mt-2 mb-8 vista-alumno">
  <tbody>
  {historial
  .map((item, index, array)=>
      <tr className="bg-blueTabla">
          <td className="filas-lista-principal2">
              <div className="flex f-row list-al-din">
                <div className=" w-100pc">
                    {escribirPeriodo(item.curso, index, array) && !isMobile && <p className="text-center text-large p-4 fw-700">{item.curso.periodo}</p>}
                    <p className="none-din-2 text-small">{item.curso.periodo}</p>
                    <div className="flex justify-content-space-between">
                        {usuario.id_permiso == 100 && <div className="color-tomato cursor-pointer p-2 bold inline-block-1 relative text-large">
                                    {item.curso.descripcion}
                                    {cursoSeleccionado == item.curso.nro_curso && <span title="Cerrar las notas" onClick={console.log(1)} className="cursor-pointer ml-4 color-tomato"><FontAwesomeIcon icon={faWindowClose}/></span>}           
                                </div>}
                    </div>
                    <div className="text-small">                
                        <p title="Modalidad de cursada" className="ml-2 inline-block-1">({item.curso.tipo})</p>
                        <p title="Profesor" className="ml-2 inline-block-1">{item.curso.profesor}</p>
                        <p className="ml-2 inline-block-1">{item.curso.DiaHora}</p>
                    </div>
                    <p className='ml-2 mt-2'>{`${item.curso.virtual ? 'Cursada virtual' : 'Cursada presencial'}`}</p>
                    <div className="flex justify-center p-2">
                              <NotasVistaAlumno notas={item.notas} encabezado={item.encabezado}/>
                    </div>
                    
                </div>
              </div>
              <div>
              {/*cursoSeleccionado == item.curso.nro_curso && <CalificacionesAlumno nro_curso={item.curso.nro_curso} id_alumno={usuario.id_alumno} layoutGrande={true} />*/}
              </div>  
          </td>
      </tr>
  )}
  </tbody>
</table>
</div>
)
}

function ListadoAlumno_bis({historial, 
    historialOriginal,
    periodos, 
    orden, 
    usuario,
    cursoSeleccionado,
    setCursoSeleccionado,
    isMobile,
  funcionOrden}){

const [verCalificacion,setVerCalificacion] = useState(false)

const materias = historialOriginal.map(item=>{return {id:item.id_materia,nombre:item.mensaje,descripcion:item.descripcion}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
    return index>0 ? item.id!=vector[index-1].id : item
}).sort((a,b)=>a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0 )

const resumen = crearResumen(materias,periodos,usuario)

return (
<div className="ff-montserrat"> 
{ historial.length > 0 && 
<div> 
    <div className="flex f-row justify-center p-4">
        {/*<p className="text-large mb-4">Mis cursadas</p>*/}
        <p className="text-small mb-2 bold color-gray">{resumen}</p>
    </div>
</div>
}
<table className="table flex justify-center mt-2 mb-8">
  <tbody>
  {historial
  .map((item, index, array)=>
      <tr className="bg-blueTabla">
          <td className="filas-lista-principal2">
              <div className="flex f-row list-al-din">
                <div className=" w-100pc">
                    {escribirPeriodo(item.curso, index, array) && !isMobile && <p className="text-center text-large p-4">{item.curso.periodo}</p>}
                    <p className="none-din-2 text-small">{item.periodo}</p>
                    <div className="flex justify-content-space-between">
                        {usuario.id_permiso == 100 && <div className="color-tomato cursor-pointer ml-4 bold inline-block-1 relative text-large" onClick={()=>{cursoSeleccionado != item.curso.nro_curso ? setCursoSeleccionado(item.curso.nro_curso) : setCursoSeleccionado(null)}}>
                                    {item.curso.descripcion}
                                    {cursoSeleccionado == item.curso.nro_curso && <span title="Cerrar las notas" onClick={console.log(1)} className="cursor-pointer ml-4 color-tomato"><FontAwesomeIcon icon={faWindowClose}/></span>}           
                                </div>}
                        <div className="nota-al-din">
                            <p className="none-din-1">Nota Final</p>
                            {usuario.id_permiso == 100 && 
                                <div className="c-prome ml-2" title='Nota final'>
                                        <span className="c-promi cursor-pointer" onClick={()=>setCursoSeleccionado(item.curso.nro_curso)}>{item.curso.promedio}</span>
                                        <p className="none-din-2">Nota Final</p>
                                        <span className='fw-600'>{revisarNota(item)}</span>
                                </div>}
                            {cursoSeleccionado != item.curso.nro_curso && <span title="Ver todas las notas" className="cursor-pointer ml-2" onClick={()=>setCursoSeleccionado(item.curso.nro_curso)}><FontAwesomeIcon icon={faPlusSquare}/></span>}
                            {cursoSeleccionado == item.curso.nro_curso && <span  className="text-xsmall cursor-pointer ml-2 bold color-tomato" onClick={()=>setCursoSeleccionado(null)}>Ocultar Notas</span>}
                        </div>
                    </div>
                    <div className="text-xsmall">                
                        <p title="Modalidad de cursada" className="ml-2 inline-block-1">({item.curso.tipo})</p>
                        <p title="Profesor" className="ml-2 inline-block-1">{item.curso.profesor}</p>
                        <p className="ml-2 inline-block-1">{item.curso.DiaHora}</p>
                    </div>
                </div>
              </div>
              <div>
              {cursoSeleccionado == item.curso.nro_curso && <CalificacionesAlumno nro_curso={item.curso.nro_curso} id_alumno={usuario.id_alumno} layoutGrande={true} />}
              
              </div>  
          </td>
      </tr>
  )}
  </tbody>
</table>
</div>
)
}
function crearResumen(materias,periodos,usuario){

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
   
    if(cant_materias>1){
        return `${usuario.id_permiso==100 ? 'Cursaste' : 'Ha cursado'} ${cant_materias} materias e/ ${anio_desde} y ${anio_hasta}`
    }else {
        return `${usuario.id_permiso==100 ? 'Cursaste' : 'Ha cursado'} ${cant_materias} materia en ${anio_desde}`
    }
}

function FormatoPeriodoAmpliado({item, iniciarVisualizarCurso}){
    return(<>
    <div  onClick={()=>iniciarVisualizarCurso(item)} className={`block ${item.campo_auxiliar ? 'bg-ligthgray mt-2' : ''} flex relative rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 cursor-pointer`}>
        <div title={`Fecha y hora de inscripción ${item.tipo}`} className="text-xsmall absolute f-insc"><p>{item.columna} {item.campo_auxiliar? '( ME )' : ''} (Curso {item.nro_curso})</p></div>
        <span title={item.descripcion} className="listaCursadasAmpliada w-50 fw-600">{item.mensaje}</span>
        <span className="listaCursadasAmpliada w-200">{item.descripcion} </span> 
        <span className="listaCursadasAmpliada w-150">{item.profesor} </span> 
        <div className="listaCursadasAmpliada w-150"><span>{`${item.DiaHora}`} </span><p>{`${item.Aula}`} </p></div> 
        <span className="listaCursadasAmpliada w-70">{`${item.tipo}`} </span>  
        {/*<div class="c-prome ml-2" title="Nota final"> 
            <span class="c-promi">{item.promedio}</span><span>{revisarNota(item)}</span>
        </div>*/}     
        <RenderNota notas={item}/>
    </div>
    </>
    )
}

function ResumenMaterias({historial,id_alumno,iniciarVisualizarCurso}){
    return <div>
        <p className="text-center p-2">Resumen de materias cursadas</p>
        <MateriasCursadas historial = {historial} id_alumno={id_alumno} iniciarVisualizarCurso={iniciarVisualizarCurso}/>
    </div>
}

function ResumenMateriasEspecialGraduados({historial,id_alumno,iniciarVisualizarCurso}){
    return <div className="divwrap-1">
        <MateriasCursadas historial = {historial} id_alumno={id_alumno} iniciarVisualizarCurso={iniciarVisualizarCurso}/>
    </div>
}

function MateriasCursadas({historial,id_alumno,iniciarVisualizarCurso}){
    const [materiaSeleccionada,setMateriaSeleccionada]= useState(null)

    const resumen = historial.sort((a,b)=>a.descripcion.localeCompare(b.descripcion)).filter((item,index,vector)=>((index > 0 && item.mensaje!=vector[index - 1].mensaje) || index == 0))

    const switchMateriaSeleccionada = (id_materia)=>{
        if(!materiaSeleccionada || materiaSeleccionada!=id_materia){
            setMateriaSeleccionada(id_materia)
        }else{
            setMateriaSeleccionada(null)
        }
    }

    return resumen.map(cursadas=><div className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 cursor-pointer">
        <div className={ materiaSeleccionada == cursadas.id_materia ? "cursor-pointer bg-activah":"cursor-pointer"} 
            onClick={()=>switchMateriaSeleccionada(cursadas.id_materia)}>
            <span title={cursadas.descripcion} className="listaCursadasAmpliada w-50 fw-600 cursor-pointer">{cursadas.mensaje}</span> 
            <span className="listaCursadasAmpliada w-200 cursor-pointer">{cursadas.descripcion} </span> 
            <span title={`Cantidad de veces que el alumno cursó la materia ${cursadas.descripcion}`} className="listaCursadasAmpliada">{historial.filter(item=>item.mensaje==cursadas.mensaje).length} </span> 
            {materiaSeleccionada == cursadas.id_materia && <button onClick={()=>switchMateriaSeleccionada(cursadas.id_materia)}> <FontAwesomeIcon icon={faTimes} /></button>}
        </div>
               {materiaSeleccionada == cursadas.id_materia && 
            <Historial1Materia id_materia={cursadas.id_materia} id_alumno={id_alumno} iniciarVisualizarCurso={iniciarVisualizarCurso}/>
        }
    </div>)
}

function Historial1Materia({id_materia,id_alumno,iniciarVisualizarCurso}){

    const [historial,setHistorial] = useState([])

    useEffect(()=>{

        const buscarHistorialAlumnoMateria = async ()=>{
            try{
                const {data} = await Axios.get(`/api/alumnos/historialm/${id_alumno}/${id_materia}`)
                setHistorial(data)
            }catch(err){
                console.log(err)
                
            }
        }

        buscarHistorialAlumnoMateria()
    },[])

    if (historial.length==0){
        return <p className="color-tomato blink">Buscando historial...</p>
    }

    return <div>
            {historial.map(item=>
                <div onClick={iniciarVisualizarCurso ? ()=>iniciarVisualizarCurso(item.nro_curso): null} className="block bg-gray-200 rounded-full p-2 border-bottom-solid py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
                    <p className="listaCursadasAmpliada fw-600">{item.nombre}</p> 
                     <br/>
                    <span className="listaCursadasAmpliada w-150">{item.profesor} </span>
                    <span className="listaCursadasAmpliada w-100" title={`Tipo de cursada: ${item.tipo}`}>{item.tipo} </span> 
                    {/*<div className="c-prome ml-2" title='Nota final'><span className="c-promi">{item.promedio}</span><span>{revisarNota(item)}</span></div>*/}
                    <RenderNota notas={item}/>
                    <CalificacionesAlumno nro_curso={item.nro_curso} id_alumno={id_alumno} LayoutGrande={false}/>
                </div>
            )}
    </div>
    

}

function escribirPeriodo(item, index, array){
    if (index==0){
        return true
    }else{
        if( array[index-1].curso.periodo!=item.periodo){
            return true
        }else{
            return false
        }
    }
}

function esmovil(){
    console.log('window.innerWidth',window.innerWidth)
    if(window.innerWidth>992){
        return false
    }else{
        return true
    }
}

function NotasVistaAlumno({notas,encabezado}){

    const encabezados_como_vector = Object.entries(encabezado);
    const claseNota = `ml-2 mr-2 p-2 text-center`;

    return <div className="sizered text-xsmall mt-2">
        {encabezados_como_vector
        .filter((item,index)=>index>0 && item[1]!=null && !item[0].includes('rec') && item[1]!='Condicional' && item[1]!='Promedio' && item[1]!='Concepto' && !esRecuperatorioSinNota(item[0],notas[item[0]]))
        .map((item,index)=>
                <div className="flex f-col border-radius-7 border-solid-gray">
                    <p className={item[1]=='Nota final' ? "bg-tomato p-2" : "bg-azul-tema p-2"}>{item[1]}</p>
                    <p className={item[1]=='Nota final' ? `${claseNota} bold text-large` : `${claseNota} text-larger` }>{notas[item[0]]}{notas[`${item[0]}_rec`] && !esRecuperatorioSinNota('rec',notas[`${item[0]}_rec`]) && <span className="block fw-600" title={`Recuperatorio de ${item[1]}`}>(Rec: {notas[`${item[0]}_rec`]})</span>}</p>
                </div>)}
    </div>
}

function CursadasActuales({cursadas, imprimir,isMobile}){

    const iniciarImpresion = ()=>{
        imprimir(cursadas,false)
    }
  

    return <div className='flex f-col items-center mt-4 border-'>
    <p className="text-small mb-2 bold color-gray">Cursadas actuales</p>
    <button className="border-solid-gray mb-4" onClick={iniciarImpresion}>Imprimir en PDF</button>

        
        {!isMobile && cursadas.map(cursadas=>
        <div className="flex">
            <div className={`flex f-row rounded-full' block border-top-dotted bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2`}>
                <span title={cursadas.descripcion} className="listaCursadasAmpliada w-50 fw-600">{cursadas.mensaje}</span> 
                <span className="listaCursadasAmpliada w-200">{cursadas.descripcion} </span> 
                <span className="listaCursadasAmpliada w-150">{cursadas.profesor} </span> 
                <div className="listaCursadasAmpliada w-150"><span>{`${cursadas.DiaHora}`} </span><p>{`${cursadas.Aula}`} </p></div> 
                <div class="c-prome ml-2" title="Nota final"><span class="c-promi">{`${cursadas.promedio}`}</span></div>
            </div>
        </div>)}

        {isMobile && cursadas.map(cursadas=>
        <div className="flex">
            <div className={`flex f-col block border-top-dotted bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 m-2 mt-2 mb-2`}>
                <div>
                    <span title={cursadas.descripcion} className="listaCursadasAmpliada w-50 fw-600">{cursadas.mensaje}</span> 
                    <span className="listaCursadasAmpliada w-200 fw-600">{cursadas.descripcion} </span> 
                </div>
                <p>{cursadas.profesor} </p> 
                <div className="mt-2"><span>{`${cursadas.DiaHora}`} </span><span className={cursadas.virtual ? 'a-virtual' : 'a-presc'}>{`${cursadas.Aula}`} </span></div> 
            </div>
        </div>)}
    </div>
}

const revisarNota = (cursadas)=>{

    const algun_recuperatorio = cursadas.columna_1_rec || cursadas.columna_2_rec
                   || cursadas.columna_3_rec || cursadas.columna_4_rec
                   || cursadas.columna_5_rec || cursadas.columna_6_rec
                   || cursadas.columna_7_rec || cursadas.columna_8_rec

    if(algun_recuperatorio){
        return 'REC'
    }else{
        return null
    }
}

const esRecuperatorioSinNota = (nombre,nota)=>{
    console.log('que llega',nombre,nota)
    if(nombre.includes('rec')){
        if(nota!=undefined){
            return (Number(nota)==0 || isNaN(nota))
        }else{
            return true
        }
    }else{
        return false
    }
}

const definirTitle = (nombre,calificaciones)=>{
    if(nombre.includes('_rec')){
        const col_recuperada = nombre.slice(0,9)
        return  `Recuperatorio de ${calificaciones[col_recuperada]}`
    }else{
        return ''
    }
}