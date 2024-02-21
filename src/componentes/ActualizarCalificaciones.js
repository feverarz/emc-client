import React, {useState, useEffect,useCallback,useRef} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faSave, faClock, faCircle as circle2 } from '@fortawesome/free-regular-svg-icons';
import { faPlusCircle, faPencilAlt, faCircle } from '@fortawesome/free-solid-svg-icons';
import Loading from './Loading';
import AbmAula from '../abms/Abm-aula'
import { v4 as uuidv4 } from 'uuid';
import {hacerfocoEnPrimerInput,scrollTop} from '../Helpers/utilidades-globales';
import Swal from 'sweetalert2';
import {useAlumno} from '../Context/alumnoContext'
import GrillaCalificaciones from './GrillaCalificaciones'

const regex_solo_numeros = /^[0-9\b]+$/;

export default function ActualizarCalificaciones({nro_curso,visualizacion,id_alumno,curso}){

    const [calificaciones,setCalificaciones]=useState([]);
    const [encabezado,setEncabezado]=useState([]);
    const [notas,setNotas]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [grabando,setGrabando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [observaciones,setObservaciones] = useState("")
    const [observacionesCalOriginal,setObservacionesCalOriginal]=useState('')
    const [cantidadModificacionesObs,setCantidadModificacionesObs] = useState(0)
    const [cambioGuardado,setCambioGuardado] = useState(true)
    const [filasobs,setFilasObs]=useState(1)
    const {usuario,CabeceraCurso} = useAlumno()
    const [comentario,setComentario] = useState('')
    const [regimen,setRegimen] = useState([]);
    const [alumnoRecibido,setAlumnoRecibido] = useState('');
    const [titulo,setTitulo] = useState('');
    const cursoRef = useRef(null)

    useEffect(()=>{

        setBuscando(true)
        buscarRegimenDelCurso()
        buscarCalificaciones()
        .then((data)=>{
            setTimeout(() => {
                setObservacionesCalOriginal(data.observaciones_cal)
                setObservaciones(data.observaciones_cal)
                setTitulo(data.Materia)
                setCambioGuardado(true)
            }, 500);
        })

    },[])

    useEffect(()=>{
        let lineas = observaciones.split('\n').length
        let ancho = Number(observaciones.length)/100 
        let total = lineas;

        if (ancho>1){
            total = lineas + ancho
        }

        setFilasObs(total)

    },[observaciones])

    useEffect(()=>{
        if(alumnoRecibido){
            añadirAlumno()
        }
    },[alumnoRecibido])

    const buscarCalificaciones = async ()=>{
        try{   
            const {data} = await Axios.get(`/api/cursos/curso/${nro_curso}`)
            setObservaciones(data.observaciones_cal)
            
            cursoRef.current = data // almaceno en cursoRef los datos del curso, para tocar lo mínimo este componente, ya estaba trayendo el curso pero solo usaba las observaciones, ahora es necesario tambien usar otros atributos del curso pero creo que es más limpio crear un ref aparte y tener los datos en un objeto nuevo.

            setBuscando(false)
            return data
        }catch(err){
            setBuscando(false)
            console.log(err)
        }
    }

    async function buscarRegimenDelCurso(){
        try{           
            const {data} = await Axios.get(`/api/cursos/regimen/${nro_curso}`)
            setRegimen(data);
//             setRegimen(transformarObjetoEnVector(data));
        }catch(err){
            console.log(err);
        }
    }  

  /*  const recibirObservacion = useCallback((observacionAlumno)=>{
        console.log(observacionAlumno)
        setComentario(observacionAlumno)
    },[comentario])*/

    /*
    
    const recibirObservacion= useCallback((alumno)=>{

        if (visualizacion){
            return
        }

        setAlumnoRecibido(alumno)
        const verificar = observaciones.search(alumno);
        const longitud = alumno.length;
        const elemento = document.getElementById('obs-cal')

        if (verificar>-1){

            Swal.fire({
                text:`El alumno ya figura en las observaciones`,
                icon: 'warning',
                showConfirmButton: false,
                timer:1500
            }).then(
                ()=>{
                    setTimeout(() => {
                        elemento.focus()
                        elemento.selectionStart = Number(verificar);
                        elemento.selectionEnd = Number(verificar) + Number(longitud);
                    },300);
                }
            )
           return
        }

        const longitudTotal = observaciones.length;
        let copiaObservaciones = observaciones;

        if (longitudTotal>0){
            copiaObservaciones = `${copiaObservaciones}\n${alumno} `
        }else{
            copiaObservaciones = `${alumno} `
        }

        setObservaciones(copiaObservaciones)

        elemento.focus()
        
        setTimeout(() => {
                elemento.selectionStart = elemento.selectionEnd = Number(longitudTotal) + Number(longitud) + 2;
        },10);


    //},[observaciones]) // si la dependencia del usecallback la defino con observaciones va a crear una nueva instancia de la función cada vez que cambia este hook
                         // no sirve porque lo que quiero es que memorice la función y cree una instancia a menos que cambie algo que considere que requiera una nueva instancia
                         // esto es para que no se renderice el hijo GrillaCalificaciones cada vez que se hace un cambio en las observaciones
                         // porque al revisar el componente con el profiler veo que se renderiza GrillaCal.. cada vez que agrego una observación
                         // y es por la prop recibirObservacion tenemos que evitar que esta función se pase N veces 
                         // para eso usamos el useCallback pero la dependencia observaciones no sirve hay que buscar otra
                         // Pero el problema es más complejo aún ya que la instancia de la función incluye
                         // las observaciones originales, que si esta cambia no se estaría pasando al hijo
                         // como hay una relación entre hijo y padre con la funcionalidad de concatenar alumnos
                         // a las observaciones existentes, el estado de observaciones queda desactualizado porque queda
                         // con las observaciones que tenía al momento de pasar la instancia de la función
                         // por el efecto closure, si no actualizamos éstas se rompe la funcionalidad de agregar al final
                         // con salto de línea el nuevo alumno.
    },[grabando,alumnoRecibido])
    
    
    
    */

    const añadirAlumno = ()=>{

        const verificar = observaciones.search(alumnoRecibido);
        const longitud = alumnoRecibido.length;
        const elemento = document.getElementById('obs-cal')

        if (verificar>-1){

            Swal.fire({
                text:`El alumno ya figura en las observaciones`,
                icon: 'warning',
                showConfirmButton: false,
                timer:1500
            }).then(
                ()=>{
                    setTimeout(() => {
                        elemento.focus()
                        elemento.selectionStart = Number(verificar);
                        elemento.selectionEnd = Number(verificar) + Number(longitud);
                    },300);
                }
            )
           return
        }

        const longitudTotal = observaciones.length;
        let copiaObservaciones = observaciones;

        if (longitudTotal>0){
            copiaObservaciones = `${copiaObservaciones}\n${alumnoRecibido} `
        }else{
            copiaObservaciones = `${alumnoRecibido} `
        }

        setObservaciones(copiaObservaciones)

        elemento.focus()
        
        setTimeout(() => {
                elemento.selectionStart = elemento.selectionEnd = Number(longitudTotal) + Number(longitud) + 2;
        },10);
    }

    const recibirObservacion= useCallback((alumno)=>{

        if (visualizacion){
            return
        }

        setAlumnoRecibido(alumno)
       


    //},[observaciones]) // si la dependencia del usecallback la defino con observaciones va a crear una nueva instancia de la función cada vez que cambia este hook
                         // no sirve porque lo que quiero es que memorice la función y cree una instancia a menos que cambie algo que considere que requiera una nueva instancia
                         // esto es para que no se renderice el hijo GrillaCalificaciones cada vez que se hace un cambio en las observaciones
                         // porque al revisar el componente con el profiler veo que se renderiza GrillaCal.. cada vez que agrego una observación
                         // y es por la prop recibirObservacion tenemos que evitar que esta función se pase N veces 
                         // para eso usamos el useCallback pero la dependencia observaciones no sirve hay que buscar otra
                         // Pero el problema es más complejo aún ya que la instancia de la función incluye
                         // las observaciones originales, que si esta cambia no se estaría pasando al hijo
                         // como hay una relación entre hijo y padre con la funcionalidad de concatenar alumnos
                         // a las observaciones existentes, el estado de observaciones queda desactualizado porque queda
                         // con las observaciones que tenía al momento de pasar la instancia de la función
                         // por el efecto closure, si no actualizamos éstas se rompe la funcionalidad de agregar al final
                         // con salto de línea el nuevo alumno.
                         //Para resolver el problema separamos la funcion recibirObservaciones
                         // de la lógica de actualización de las observaciones
                         // encerramos ésta lógica en una nueva función añadirAlumno
                         // agregamos un estado alumnoRecibido y actualizamos observaciones
                         // con un useEffect dependiente de alumnoRecibido de esta manera tenemos el estado de observaciones 
                         // actualizado al momento de ejecutar la lógica de añadirAlumno y ya no depende de la instancia de la función  recibirObservaciones
                         // al mismo tiempo sigue funcionando la funcionalidad de mandar alumnos del hijo al padre
                         // y se pasa una sola vez la función recibirObservación por el useCallback para evitar la renderización
    },[])

    const grabarObservaciones = async(observaciones)=>{

        if (visualizacion){
            return
        }

        const objetoAgrabar = {observaciones:observaciones}
        setCambioGuardado(false)
        setGrabando(true)
        try{
            const resultado = await Axios.put(`/api/cursos/calificaciones/observaciones/${nro_curso}`,objetoAgrabar)
            buscarCalificaciones()
            .then((data)=>{
                setTimeout(() => {
                    setObservacionesCalOriginal(data.observaciones_cal)
                    //setObservaciones(data.observaciones_cal) // ya lo modifiqué en buscarCalificaciones
                    setCantidadModificacionesObs(cantidadModificacionesObs+1)
                    setCambioGuardado(true)
                    setGrabando(false)
                }, 500);
            })
        }catch(err){
            Swal.fire({
                html:'<p>Hubo un error al grabar las observaciones</p>',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })
            setGrabando(false)
            setHuboError(true)
            console.log(err)
        }
    }    

    const handleChangeObservaciones = (e)=>{
        setObservaciones(e.target.value)
    }

    const huboCambios = ()=>{
        return observacionesCalOriginal!=observaciones
    }


    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando observaciones...</span></div></Main>
    };

    if (grabando){
        return <Main center><div><Loading/><span className="cargando">Grabando observaciones...</span></div></Main>
    };    

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando calificaciones...</span></div></Main>
    };

     
    return <div>

            <p className="cabecera mb-4">Grilla de calificaciones {titulo.toUpperCase()} <small>{visualizacion ? '(Visualización)' : '(Edición)'}</small></p>

            {curso && CabeceraCurso({Materia:curso.descripcion,cod_materia:curso.mensaje,inscriptos:curso.inscriptos,Disponibilidad:curso.disponibilidad,cuatrimestre:curso.periodo, cursoNoVigente:!curso.cuatrimestre_activo,grupal:curso.grupal,DiaHora:curso.DiaHora,Profesor:curso.profesor, mesa_examen:curso.campo_auxiliar, aula:curso.Aula,virtual:curso.virtual})}
    
            {huboCambios() && !visualizacion && <div className="mt-4 mb-4 text-small">
                <span onClick={()=>grabarObservaciones(observaciones)} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera blink" >
                    <FontAwesomeIcon className="color-tomato" icon={faSave}/> Grabar observaciones
                </span> 
                <span onClick={()=>{setObservaciones(observacionesCalOriginal)}} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
                    <FontAwesomeIcon className="color-tomato" icon={faWindowClose}/> Cancelar observación
                </span>  
            </div>}

        {cantidadModificacionesObs > 0 && !huboCambios() && <span className="text-xsmall text-right block">Observaciones guardadas</span>}
        
        <textarea disabled = {visualizacion} id="obs-cal" placeholder="Observaciones" title="Observaciones" className="bg-wheat width-100x100" type="text" value={observaciones} rows={filasobs} maxLength="1000" cols="100" onChange={(e)=>handleChangeObservaciones(e)}/> 
        <div className="flex f-reverse">
        </div>
        <GrillaCalificaciones nro_curso={nro_curso} 
                                usuario = {usuario}
                                recibirObservacion={recibirObservacion}
                                visualizacion = {visualizacion} 
                                regimen = {regimen}
                                curso = {cursoRef.current}
                                id_alumno = {id_alumno}/>{/*id_alumno solo se envia cuando se desea actualizar las notas de 1 solo alumno desde su ficha desde historial */}

    </div>
}


