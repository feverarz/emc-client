import React, {useState, useEffect,useRef} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare,faSave, faClock, faCircle as circle2 } from '@fortawesome/free-regular-svg-icons';
import { faPencilAlt, faSortAlphaDown } from '@fortawesome/free-solid-svg-icons';
import Loading from './Loading';
import AbmAula from '../abms/Abm-aula'
import { v4 as uuidv4 } from 'uuid';
import {hacerfocoEnPrimerInput,scrollTop} from '../Helpers/utilidades-globales';
import Swal from 'sweetalert2';
import ObservacionesCalificaciones from './ActualizarCalificaciones'
import {useAlumno} from '../Context/alumnoContext';
//import {useCalificaciones } from '../Context/calificacionesContext'; // importo proveedor de contexto y luego envuelvo a la aplicación en el mismo
import Inputs_notas from './Inputs_notas';
import {useNotas} from '../Context/notasContext';

const regex_solo_numeros = /^[0-9\b]+$/;

function GrillaCalificaciones({nro_curso,
                                usuario,
                                finalizarCalificaciones,
                                visualizacion,
                                recibirObservacion,
                                regimen,
                                id_alumno,
                                curso}){ // id_alumno solo viene si deseamos modificar 1 nota de 1 alumno desde el historial del alumno desde su ficha


    const [calificaciones,setCalificaciones]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [grabar, setGrabar]=useState(0)
    const [idModificado,setIdModificado]=useState(null)
    const [encabezado,setEncabezado]=useState([]);
    const [observacionesCal,setObservacionesCal]=useState('')
    const [titulos,setTitulos] = useState([])
    const {agregarAlumnoObservacion} = useAlumno()
    const [vectorColumnasInstanciasFinales,setVectorColumnasInstanciasFinales]=useState([]) // para poder encontrar las columnas que sean de examen o proyecto finales. Antes no se necesitaba esta relación pero Luciano pidio esto en el bug 146 y hubo que adaptar el proceso, para calcular la nota final hay que hacer validaciones con las columnas que sean de caracter final
    const encabezadoRef = useRef(null) 

// ATENCION: Quise buscar un mecanismo para que se reinicie el estado de
// notas modificadas del contexto para que vuelva a falso cada vez que se cargue
// el componente de calificaciones (porque si era true porque hubo modificaciones de notas pero al final no se grabó entonces queda siempre en true)
// El problema es que si uso el contexto useNotas en GrillaCalificaciones
// cada vez que se modifique el contexto vuelve a renderizar todos los hijos
// por eso descarto esta solución y comento las siguientes líneas
// Tengo que implementar otra forma de reinicializar el estado de las modificaciones a false

//    const {reiniciarModificacionNotas} = useNotas()

    /*useEffect(()=>{
        reiniciarModificacionNotas()
    },[])*/

    useEffect(()=>{
       
        setBuscando(true)

        const buscarCalificaciones = async ()=>{

           try{
                const {data}= await Axios.get(`/api/cursos/curso/calificaciones/${nro_curso}`)
                
                setCalificaciones(data)
                setTitulos(obtenerTitulos(data[0]))
                setEncabezado(transformarObjetoEnVector(data[0]))
                encabezadoRef.current = data[0] // almaceno en encabezadoRef los datos del encabezado completo, para tocar lo mínimo este componente, ya estaba trayendo el encabezado pero y lo estaba usando para generar ciertos objetos, no quiero ensuciar el componente y tocar el estado inecesariamento por eso  creo que es más limpio crear un ref aparte y tener los datos en un objeto nuevo. Cuando el curso tiene un encabezado con un número de tratamiento específico necesito tener todo el detalle del encabezado para acceder a la información tomar decisiones
                setVectorColumnasInstanciasFinales(encontrarInstanciasFinales(data[0]))
                setBuscando(false)
            }catch(err){
                setBuscando(false)
                setHuboError(true)
            }
        }
        
        buscarCalificaciones()
      
    },[contadorOperaciones])
    
    const buscarEncabezado = async ()=>{

        try{
             const {data}= await Axios.get(`/api/cursos/curso/calificaciones/${nro_curso}`)
             
             setCalificaciones(data)
             setTitulos(obtenerTitulos(data[0]))
             setEncabezado(transformarObjetoEnVector(data[0]))
             encabezadoRef.current = data[0] // almaceno en encabezadoRef los datos del encabezado completo, para tocar lo mínimo este componente, ya estaba trayendo el encabezado pero y lo estaba usando para generar ciertos objetos, no quiero ensuciar el componente y tocar el estado inecesariamento por eso  creo que es más limpio crear un ref aparte y tener los datos en un objeto nuevo. Cuando el curso tiene un encabezado con un número de tratamiento específico necesito tener todo el detalle del encabezado para acceder a la información tomar decisiones
             setVectorColumnasInstanciasFinales(encontrarInstanciasFinales(data[0]))
             setBuscando(false)
         }catch(err){
             setBuscando(false)
             setHuboError(true)
         }
     }

    const comentarAlumno=(alumno)=>{

        if (visualizacion){
            return
        }

        //agregarAlumnoObservacion(alumno)
/*
        const verificar = observacionesCal.search(alumno);
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

        const longitudTotal = observacionesCal.length;
        let copiaObservaciones = observacionesCal;

        if (longitudTotal>0){
            copiaObservaciones = `${copiaObservaciones}\n${alumno} `
        }else{
            copiaObservaciones = `${alumno} `
        }

        setObservacionesCal(copiaObservaciones)

        elemento.focus()
        
        setTimeout(() => {
                elemento.selectionStart = elemento.selectionEnd = Number(longitudTotal) + Number(longitud) + 2;
        },10);

*/
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando calificaciones...</span></div></Main>
    };

    return(
            <Main center> 

                {/*<ObservacionesCalificaciones nro_curso={nro_curso} /> */}
                <Listado calificaciones={calificaciones}
                    vectorColumnasInstanciasFinales = {vectorColumnasInstanciasFinales}
                    encabezado = {encabezado}
                    encabezadoCompleto = {encabezadoRef.current}
                    usuario = {usuario}
                    titulos = {titulos}
                    finalizarCalificaciones = {finalizarCalificaciones}
                    comentarAlumno = {recibirObservacion}
                    nro_curso = {nro_curso}
                    visualizacion = {visualizacion}
                    regimen = {regimen}
                    curso = {curso}
                    id_alumno = {id_alumno} // id_alumno solo viene si deseo modificar la nota desde el historial desde la ficha del alumno
                /> 
            </Main>
    )
}

function Listado({calificaciones,
                    vectorColumnasInstanciasFinales,
                    encabezado,
                    encabezadoCompleto,
                    usuario,
                    nro_curso,
                    finalizarCalificaciones,
                    titulos,
                    visualizacion,
                    curso,
                    comentarAlumno,regimen,id_alumno}){
// id_alumno viene solo cuando deseo actualizar las calificaciones de 1 alumno desde su historial desde su ficha
    const es_individual = calificaciones.find(item=>item.horario!='')

    return (
    <div className="flex justify-center mt-4"><p className='absolute top-0 left-0 text-xsmall fw-700'>...{curso?.encabezado}/{curso?.nro_curso}</p>
        <table id="cali">
                <tbody>
                    <td style={{border:'none'}}><GrabarNotas/></td>
                {calificaciones
                    .filter((item,index)=>index>0 && (id_alumno ? item.id_alumno== id_alumno : true))
                    .sort((a,b)=>es_individual ? a.horario.localeCompare(b.horario) : a.nombre.localeCompare(b.nombre))
                    .map((notas,index)=><tr key={uuidv4()}>
                        <td>
                        <div className="flex f-row">
                            {!visualizacion && <div className="flex f-row items-center">
                                <span className="text-smaller mr-2">{notas.horario}</span><FontAwesomeIcon className="cursor-pointer text-small mr-2" title="Escribir un comentario sobre el alumno" onClick={()=>comentarAlumno(notas.nombre)} icon={faPencilAlt}/>
                            </div>}
                            {/*<Inputs encabezado = {encabezado} 
                                        subirNotasAvector= {recibirNotasIndividualesAvector}
                                        vectorColumnasInstanciasFinales = {vectorColumnasInstanciasFinales}
                                        columnas = {notas} 
                                        ultimaFila = {calificaciones.length-2}
                                        titulos = {titulos}
                                        fila={index} 
                                        finalizarCalificaciones = {finalizarCalificaciones}
                                        usuario = {usuario}
                                        visualizacion = {visualizacion}
                                        nro_curso = {nro_curso}
                                        regimen={regimen}/>*/}
                                    <Inputs_notas encabezado = {encabezado} 
                                        encabezadoCompleto = {encabezadoCompleto}
                                        vectorColumnasInstanciasFinales = {vectorColumnasInstanciasFinales}
                                        columnas = {notas} 
                                        ultimaFila = {calificaciones.length-2}
                                        titulos = {titulos}
                                        fila={index} 
                                        finalizarCalificaciones = {finalizarCalificaciones}
                                        usuario = {usuario}
                                        visualizacion = {visualizacion}
                                        nro_curso = {nro_curso}
                                        regimen={regimen}
                                        curso = {curso}
                                        id_alumno = {id_alumno}/>                                        
                        </div>
                         </td>                                                                                                                                                                    
                    </tr>)
                }
                </tbody>
        </table>
       
    </div>
    )
}

function transformarObjetoEnVector(objeto){
    const objetoComoVector = Object.entries(objeto)
    const vectorFiltrado = objetoComoVector.filter(item=>item[1]!=null).map(item=>item[0])

    return vectorFiltrado
}

function obtenerTitulos(objeto){
    const objetoComoVector = Object.entries(objeto)
    const vectorFiltrado = objetoComoVector.filter(item=>item[1]!=null).map(item=>item[1])

    return vectorFiltrado
}

function hacerFoco(id){
    let idInterval =setInterval(() => {
        const element = document.getElementById(id);
    
        if (element){
            element.focus();
            clearInterval(idInterval)
        }
    }, 10);
}

function encontrarInstanciasFinales(columnasTitulos){
    // en el filter buscamos los criterios para dejar solo las columnas asociadas a examenes o proyectos finales pero excluyendo al promedio que cuyo título ahora se llama "Nota Final"

    return Object.entries(columnasTitulos).filter((item,index)=>item[1]!=null && item[1].toUpperCase().includes('FINAL') && item[0]!='promedio').map(item=>item[0])
}

function GrabarNotas(){
    const {actualizarNota,hayNotasModificadas,reiniciarModificacionNotas} = useNotas()
    
    useEffect(()=>{
        // cada vez que se carga este componente vuelvo a false el estado de notas modificadas
        // para asegurarnos que inicialmente sea falso aunque antes haya sido true pero luego no se grabó
        reiniciarModificacionNotas()
    },[])

    return hayNotasModificadas ? 
            <button title="Grabar los cambios" className="color-red" onClick={()=>{iniciarGrabar(actualizarNota)}}><span className="color-red blink fw-100">Grabe los cambios ...</span><FontAwesomeIcon icon={faSave} title="Grabar los cambios"/></button>
            : null
}

const iniciarGrabar = (actualizarNota)=>{
    let texto;
    let textoConfirmacion;

    texto = `¿Confirma los cambios?`
    textoConfirmacion = 'Si, grabar los cambios'


    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                actualizarNota();

            }else{
                console.log("Se canceló la modificación de los datos de acceso")
            }
        }
    )
}


  export default React.memo(GrillaCalificaciones)