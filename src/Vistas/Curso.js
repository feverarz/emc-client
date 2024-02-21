import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import AbmCurso from '../abms/abm-curso';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link,useParams } from 'react-router-dom';
import Loading from '../componentes/Loading';
import { v4 as uuidv4 } from 'uuid';
import {useAlumno} from '../Context/alumnoContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Ensambles from '../componentes/Ensambles';

import Swal from 'sweetalert2';import {faPlusSquare, faWindowClose, faCheckCircle, faTrashAlt, faFilePdf, faEdit, faEye } from '@fortawesome/free-regular-svg-icons';
import { faEraser,faSync,faBan,faStopwatch,faRoute,faSortAlphaDown,faSortNumericDown, faBackspace, faHandPaper, faPencilRuler, faExclamation, faInfoCircle, faEnvelopeOpenText, faMobile, faPhone,faMailBulk, faOtter } from '@fortawesome/free-solid-svg-icons';
import {imprimir} from '../impresiones/registro';
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import { Route } from 'react-router-dom'
import Calificaciones from '../componentes/Calificaciones';
import ListaCursosCriterios from '../componentes/ListaCursosCriterios';
import TipoImpresion from '../componentes/TipoImpresion';
import AbmAlumno from '../abms/abm-alumno';
import ActualizarCalificaciones from '../componentes/ActualizarCalificaciones'
import ListaCursosCambioAlumno from '../componentes/ListaCursosCambioAlumno';
import GestionRecuperatorios from '../componentes/GestionRecuperatorios';

const descripcionTipoCursadas = [0,"Regular","Recursada","Recuperatorio","Libre","Invitado"]

export default function Curso({match,location, id_curso,llamadoPorCambioCurso,cambiarCurso}){

    //const nro_curso = match.params.id; // al ser pasado por params llega como string el id de curso
    const params = useParams();
    const nro_curso = id_curso ? id_curso : params.id; // a la vista de curso puedo llegar desde el listado de cursos o desde otro lugar del sistema pero solo para visualizar
    const soloVisualizar = id_curso ? true : false; // si a esta vista llegamos desde un link de una ruta contiene el nro_curso como parámetro entonces se pueden hacer todas las operaciones previstas, si se llega a esta vista enviando el id_curso como prop significa que lo llamo como modal para visualizar solamente y desactivamos algunas funciones
    const [alumnos,setAlumnos] = useState([])
    const {toggle, isShowing } = useModal();
    const [cargandoAlumnos,setCargandoAlumnos] = useState(false);
    const [inscribiendo,setInscribiendo] = useState(false);
    const [preguntarTipoInscripcion,setPreguntarTipoInscripcion]= useState(false)
    const {alumno, cambiarAlumno,cambiarMensaje, cuatrimestreActivo,habilitarBusquedaAlumnos,refrescarAlumno} = useAlumno();
    const [tipoCursada,setTipoCursada]= useState(1); // regular por default
    const [alertas,setAlertas]= useState([]);
    const [yaInscripto,setYaInscripto]= useState(false);
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [contadorModificacionesFicha,setContadorModificacionesFicha]=useState(0);
    const [horarioSeleccionado,setHorarioSeleccionado]=useState(null);
    const [horarios,setHorarios] = useState([]);
    const [cursoActualizado,setCursoActualizado]=useState(null);
    const [abrirfichaConDelay, setAbrirfichaConDelay]=useState(false);
    const [listaEmails, setListaEmails]=useState([]);
    const [mostrarInfo, setMostrarInfo]=useState(false);
    const [hayUnError, setHayUnError]=useState(false);
    const [mostrarJsonAlumnos, setMostrarJsonAlumnos]=useState(false);
    const [cursoNoVigente,setCursoNoVigente]=useState(false);
    const [calificaciones,setCalificaciones] = useState([]);
    const [buscandoCalificaciones,setBuscandoCalificaciones]=useState(false);
    const [errorCalificaciones, setErrorCalificaciones] = useState(false);
    const [abrirCalificaciones, setAbrirCalificaciones] = useState(false);
    const [abrirGestionRecuperatorios, setAbrirGestionRecuperatorios] = useState(false);
    const [abrirAbmCurso, setAbrirAbmCurso] = useState(false);
    const [mostrarAlumnosBorrados, setMostrarAlumnosBorrados] = useState(false);
    const [mostrarEnsambles, setMostrarEnsambles] = useState(false);
    const [hayAlumnos, setHayAlumnos] = useState(false);
    const [mostrar, setMostrar] = useState(false);
    const [historialMateria, setHistorialMateria] = useState([]);
    const [preguntasPDF,setPreguntasPDF] = useState(false)
    const [nombrePDF,setNombrePDF] = useState("")
    const [descargar,setDescargar] = useState(true)
    const [idAlumnoVisualizacion,setIdAlumnoVisualizacion] = useState(null)
    const [alumnoCambioCurso,setAlumnoCambioCurso] = useState(null)
    const [ordenAlfabetico,setOrdenAlfabetico] = useState(false)
    const [alumnosBorrados, setAlumnosBorrados] = useState([]);
    // para activar el modal llamar a la función toggle en con alguna condicion o un evento...

    useEffect(()=>{
        habilitarBusquedaAlumnos()
        setHayUnError(false)
        buscarDatosDelCurso()
        // actualizo los datos del curso al entrar para no tener la info
                               // de la vista de cursos sino la real de la base de datos
                               // ya que puede haber habido algún cambio en el curso por otro usuario
                               // entre el momento en que se leyò la lista de cursos y el momento en 
                               // que entro al mismo
        // al principio solo usaba la info que venía desde el location.state (cursos) el
        // objeto cursoActualizado lo agregué más tarde así que algunos datos los tomo del
        // objeto cursoActualizado y otros de location.state... Debería tomar todo del primero para que sea màs limpio y màs claro
        setTimeout(()=>setAbrirfichaConDelay(true),200) 
        // uso el flag abrirfichaConDelay para asegurarme que el componente abm-curso
        // se renderice después de renderizar el componente padre
        // ya que el componente hijo (abm-curso) usa useEffect y useState y eso genera
        // un warning 
    },[contadorModificacionesFicha,nro_curso,contadorOperaciones])

    useEffect(()=>{

    setCargandoAlumnos(true)

    buscarAlumnos()
        .then(data=>{
            setAlumnos(data);
            buscarAlumnosBorrados()
            setCargandoAlumnos(false);
            setHorarios(data.map(item=>({comienzo:item.comienzo,id_alumno:item.id_alumno})))
            armarListaEmails(data,setListaEmails)
            verificarSiHayAlumnos(data,setHayAlumnos)
        })
        .catch(err=>{
            console.log(err);
            setCargandoAlumnos(false);
    
            const mensaje_html = `Se produjo un error al buscar los alumnos, encabezados o las calificaciones. ${err}`
            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',  
            })   
        });
    },[contadorOperaciones,contadorModificacionesFicha,nro_curso]) // para que se busquen los alumnos cada vez que se hizo una operació nueva
                                // y al cargar el componente, cada vez que se hace un alta o baja
                                // se incrementa el valor del contadorOperaciones y por cada cambio
                                // se dispara este effect. Es mejor usar un número que se incrementa
                                // a usar un booleano que habría que validar que el efecto se
                                // dispare en el true pero no en el false.
    useEffect(()=>{

        verificarYtratarAlumno() ;

    },[alumno.id, contadorOperaciones,cursoActualizado])

    useEffect(()=>{
        refrescarLista()
    },[refrescarAlumno])

useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        if (abrirCalificaciones){
            setAbrirCalificaciones(false)
            finalizarCalificaciones()
        }
     
        if(abrirAbmCurso){
            setAbrirAbmCurso(false)
        }

        if(idAlumnoVisualizacion){
            setIdAlumnoVisualizacion(null)
            if (mostrarAlumnosBorrados){
                toggle() // desde el componente AlumnosBorrados se puede llamar a la ficha del alumno y al cerrar esta se cerraría el modal de alumnos borrados
            }
        }

        if(alumnoCambioCurso){
            setAlumnoCambioCurso(null)
        }

        if(mostrarAlumnosBorrados){
            if (!idAlumnoVisualizacion){
                setMostrarAlumnosBorrados(false) // desde el componente AlumnosBorrados se puede llamar a la ficha del alumno y al cerrar esta se cerraría el modal de alumnos borrados
            }
        }

        if(mostrarEnsambles){
            setMostrarEnsambles(false)
        }

        if(abrirGestionRecuperatorios){
            setAbrirGestionRecuperatorios(false)
        }
    }
},[isShowing])

useEffect(()=>{

    if(alumnos.length>0){
        buscarCalificaciones();
    }

    if(alumno.id){
        hacerVerificacionesDelAlumnoSeleccionado();
    }
},[alumnos]) // cada vez que se recargue la lista de alumnos por ejemplo por una inscripción
             // o una anulación vemos si un alumno esta seleccionado y verificamos si esta inscripto

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

const verificarYtratarAlumno = ()=>{
    if (alumno.id){

        buscarAlertasAlumnoMateria();
        buscarHistorialAlumnoMateria();
        hacerVerificacionesDelAlumnoSeleccionado();

    }else{

        setAlertas([])
    }
    setPreguntarTipoInscripcion(false)
}   

const iniciarCambioCurso = (alumno)=>{

    if(!alumnoTieneCalificacionesCargadas(alumno.id_alumno,calificaciones)){
        setAlumnoCambioCurso(alumno)
        toggle()
    }else{
        alert('No es posible cambiar de curso porque el alumno fue calificado')
    }
 }

const buscarAlertasAlumnoMateria = async ()=>{
    try{
        const alertas = await Axios.get(`/api/alumnos/alertas/${alumno.id}/${cursoActualizado.id_materia}`)
        setAlertas(alertas.data)
    }catch(err){
        console.log(err)
    }
}

const buscarHistorialAlumnoMateria = async ()=>{
    try{
        const historial = await Axios.get(`/api/alumnos/historialm/${alumno.id}/${cursoActualizado.id_materia}`)
        setHistorialMateria(historial.data)
    }catch(err){
        console.log(err)
    }
}

const finalizarCalificaciones=()=>{
    buscarAlumnos()
        .then(data=>setAlumnos(data))
        .catch(err=>console.log(err))
}   

const explicarError = (mensaje)=>{
    Swal.fire({
        html:`<p>${mensaje}</p>`,
        icon: 'warning',
        showConfirmButton: true
        //timer:4000
    })
}

const iniciarVisualizarAlumno = (id)=>{
    setIdAlumnoVisualizacion(id)
    toggle()
}

const gestionarDescanso =(esDescanso,hora)=>{
    Swal.fire({
        text:`${esDescanso ? '¿Desactiva':'¿Activa'} el descanso para el horario ${hora} hs.?`,
        showCancelButton:true,
        confirButtonText:'Si, eliminar',
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                if(esDescanso){
                    borrarDescanso(hora)
                }else{
                    grabarDescanso(hora)
                }
            }else{
                console.log("Gestión del descanso cancelada")
            }
        }
    )
}

const grabarObservaciones = async(observaciones)=>{

    const objetoAgrabar = {observaciones:observaciones}

    try{
        const resultado = Axios.put(`/api/cursos/calificaciones/observaciones/${nro_curso}`,objetoAgrabar)
        Swal.fire({
            html:'<p>Se grabaron las observaciones exitosamente</p>',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })
        .then(()=>{
            contadorModificacionesFicha(contadorModificacionesFicha+1)
        })   
    }catch(err){
        Swal.fire({
            html:'<p>Hubo un error al grabar las observaciones</p>',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })
        console.log(err)
    }
}


async function buscarAlumnos(){

    try{           
        const {data} = await Axios.get(`/api/cursos/alumnos/${nro_curso}`)

        
        return data 

    }catch(err){
       
        return err
    }
}

const switchMostrar=()=>{
    if (mostrar){
        setMostrar(false)
    }else{
        setMostrar(true)
    }
}

const refrescarLista = ()=>{
    setContadorOperaciones(Math.random())
}

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

function finalizarAltaOcopia (){

    setContadorModificacionesFicha(contadorModificacionesFicha+1); // para que traiga los cursos de nuevo

    toggle() // para que cierre el modal
}

const editarCurso = ()=>{
    setAbrirAbmCurso(true)
    toggle()
}

const verAlumnosBorrados = ()=>{
    setMostrarAlumnosBorrados(true)
    toggle()
}

const verEnsambles = ()=>{
    setMostrarEnsambles(true)
    toggle()
}

const iniciarCalificaciones = ()=>{
    setAbrirCalificaciones(true)
    toggle()
}

const iniciarGestionRecuperatorios = ()=>{
    setAbrirGestionRecuperatorios(true)
    toggle()
}

const hacerVerificacionesDelAlumnoSeleccionado = ()=>{

        const alumnoEstaInscripto = verSiYaInscripto(alumno.id,alumnos)
        if (alumnoEstaInscripto){
            //cambiarColorAlAlumnoInscripto(alumno.id)
            setYaInscripto(true)
        }else{
            setYaInscripto(false)
        }

}

function finalizarModificacionFichaCurso(){
    setContadorModificacionesFicha(contadorModificacionesFicha+1)
    //scrollTop()
}

async function buscarDatosDelCurso(){
   // setCargandoAlumnos(true)
    try{           
        const {data} = await Axios.get(`/api/cursos/curso/${nro_curso}`)
        setCursoActualizado(data);
        if (data.id_cuatrimestre!=cuatrimestreActivo.id_cuatrimestre){
            setCursoNoVigente(true)
        }
        if (data.mesa_examen){
            setTipoCursada(3)
        }
    }catch(err){
        console.log(err);
    }
}

async function buscarAlumnosBorrados(){
    // setCargandoAlumnos(true)
     try{           
         const {data} = await Axios.get(`/api/cursos/alumnosborrados/${nro_curso}`)
         setAlumnosBorrados(data);
     }catch(err){
         console.log(err);
     }
 }

const inscribirAlumno = async (novalidarcupo)=>{

    try{

        const objetoInscripcion = {
            id:Number(nro_curso), // como el n de curso se pasa por params llega como string
            id_alumno : Number(alumno.id),
            id_tipo_cursada : Number(tipoCursada),
//            tipo:location.state.grupal === 1 ? 'GRUPAL' : 'INDIVIDUAL',
//            hora_individual:location.state.grupal === 1 ? '' : horarioSeleccionado
            tipo:cursoActualizado.grupal === 1 ? 'GRUPAL' : 'INDIVIDUAL',
            hora_individual:cursoActualizado.grupal === 1  || cursoActualizado.mesa_examen ? '' : horarioSeleccionado,
            novalidarcupo:novalidarcupo            
        }

        setInscribiendo(true);
        const resultado = await Axios.post('/api/cursos/inscripcion/',objetoInscripcion)
        
        // reemplazo setContadorOperaciones por refrescarAlumno
        // Hay un effect que si se refresca el alumno también refresca la lista
        // esto es porque ahora se puede dar de baja un alumno de un curso desde la ficha del alumno
        // y también para que actualice las cursadas actuales en el alumno del bottom
        // comienzo reemplazo 11/04/2021
        //setContadorOperaciones(contadorOperaciones+1)
        refrescarAlumno()
        // fin reemplazo 11/04/2021

        const mensaje_html = `<p>La inscripción se realizó con éxito</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })
          buscarDatosDelCurso(); // actualizo los datos del curso
          setInscribiendo(false);
          setPreguntarTipoInscripcion(false)  
    }catch(err){
//            throw new Error(err.response.data);
            throw err.response.data.message;
        }   
}

const grabarDescanso = async (hora)=>{
    try{
            const objetoDescanso = {
                id:Number(nro_curso), // como el n de curso se pasa por params llega como string
                hora_individual:hora,
            }          

        const resultado = await Axios.post('/api/cursos/descanso/',objetoDescanso)
        
        refrescarAlumno()

        const mensaje_html = `<p>El cambio se realizó con éxito</p>`

    }catch(err){
            console.log(err.response.data.message)
            alert(`Se produjo un error al aplicar el cambio
            ${err.response.data.message}`)
        }   
}

const borrarDescanso = async (hora)=>{
    try{

        const objetoDescanso = {
            id:Number(nro_curso), // como el n de curso se pasa por params llega como string
            hora_individual:hora
        }   

        const resultado = await Axios.delete(`/api/cursos/descanso/${nro_curso}/${hora}`,objetoDescanso)
        
        refrescarAlumno()

        const mensaje_html = `<p>El cambio se realizó con éxito</p>`

    }catch(err){
            console.log(err.response.data.message)
            alert('Se produjo un error al aplicar el cambio')
        }   
}

const inscribirAlumnoArecuperatorio = async ()=>{

    try{

        const objetoInscripcion = {
            id:Number(nro_curso), // como el n de curso se pasa por params llega como string
            id_alumno : Number(alumno.id),
            id_tipo_cursada : Number(tipoCursada),
            tipo:'RECUPERATORIO',
            hora_individual:'',
            novalidarcupo:true            
        }

        setInscribiendo(true);
        const resultado = await Axios.post('/api/cursos/inscripcion/',objetoInscripcion)
        
        setContadorOperaciones(contadorOperaciones+1)

        const mensaje_html = `<p>La inscripción al recuperatorio se realizó con éxito</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })
          buscarDatosDelCurso(); // actualizo los datos del curso
          setInscribiendo(false);
          setPreguntarTipoInscripcion(false)  
    }catch(err){
            throw err.response.data.message;
    }   
}

const cambiarTipoCursada = (e)=>{
    setTipoCursada(e.target.value)
}

const switchOrdenar = ()=>{
    setOrdenAlfabetico(!ordenAlfabetico)
}

const ejecutarCambioHorario = async (id_alumno,nuevoHorario)=>{
    const objetoCambioHorario = {
        id: Number(nro_curso),
        id_alumno:Number(id_alumno),
        nuevohorario : nuevoHorario
    }

    setInscribiendo(true);

    try{
        const resultadoDelCambio = await Axios.post('/api/cursos/alumno/cambiohora',objetoCambioHorario)

        setContadorOperaciones(contadorOperaciones+1)

        const mensaje_html = `<p>El cambio de horario se realizó con éxito</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

        setInscribiendo(false);

    }catch(err){
        const mensaje_html = `<p>El cambio de horario falló</p><p>${err.response.data}</p>`

        Swal.fire({
            html:mensaje_html,
            text: err.response.data,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

          setContadorOperaciones(contadorOperaciones+1)
          setInscribiendo(false);
        }
}

const eliminarAlumno = async (id_alumno)=>{
  /*  const objetoEliminarAlumno = {
        id: Number(nro_curso),
        id_alumno:Number(id_alumno)
    }
*/
    setInscribiendo(true);
    const _urlEliminar = `/api/cursos/alumno/${Number(nro_curso)}/${Number(id_alumno)}`

    try{
        const resultadoDelCambio = await Axios.delete(_urlEliminar)

        setContadorOperaciones(contadorOperaciones+1)
        refrescarAlumno() // para que si hay un alumno seleccionado en el bottom vuelva a buscar las cursadas del mismo
        const mensaje_html = `<p>Se eliminó al alumno del curso</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

        setInscribiendo(false);

    }catch(err){
        const mensaje_html = `<p>La eliminación del curso falló</p><p>${err.response.data}</p>`

        Swal.fire({
            html:mensaje_html,
            text: err.response.data,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

          setInscribiendo(false);
        }
}

const switchMostrarInfo = ()=>{
    if (mostrarInfo){
        setMostrarInfo(false)
    }else{
        setMostrarInfo(true)
    }
}

const cerrarListaCursosCambioAlumno = ()=>{
    
    //setContadorOperaciones(contadorOperaciones+1)
    // no funciona así porque lo paso como parámetro a un componente y por
    // el closure el contador de operaciones no funciona para disaparar el useEffect que necesito
    // para que vuelva a buscar alumnos
    // probamos con un <aleatorio className=""></aleatorio>
    setContadorOperaciones(Math.random())
    refrescarAlumno() // para que si hay un alumno seleccionado en el bottom vuelva a buscar las cursadas del mismo
    setAlumnoCambioCurso(null)
    toggle()
}

const gestionarErrorInscripcion = (error)=>{

    const es_error_cupo = error.includes('cupo')

    const mensaje_html = `<p>La inscripción falló</p><p>${error}</p>`

    Swal.fire({
        html:mensaje_html,
        text: error,
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: es_error_cupo,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Inscribir igual',
        cancelButtonText: 'Cancelar inscripción',
    }).then(respuesta=>{
        if (respuesta.isConfirmed){
               inscribirAlumno(true) // el parametro que envío es para que controle o no el cupo. La primera vez siempres le mando false para que controle, luego el usuario puede decidir omitir esta validación cuando ha recibido el alerta por error de cupo
        }else{
            Swal.fire({
                html: 'Actualizando datos del curso...',
                timer: 2500,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }

            })
            buscarDatosDelCurso(); // actualizo los datos del curso
            setContadorOperaciones(contadorOperaciones+1); // para que vuelva a traer los alumnos
            setInscribiendo(false);
        }})
}

const iniciarEliminacion = (id,nombre)=>{
    Swal.fire({
        text:`Confirma la eliminación de ${nombre} del curso #${nro_curso} ?`,
        showCancelButton:true,
        confirButtonText:'Si, eliminar',
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                eliminarAlumno(id);
            }else{
                console.log("Eliminación cancelada")
            }
        }
    )
}

const inscripcionRegular = ()=>{

        const pregunta = horarioSeleccionado != null && horarioSeleccionado!='' ? 
                        `Confirma la inscripción de ${alumno.nombre} a la materia ${cursoActualizado.Materia} a las ${horarioSeleccionado} hs (${cursoActualizado.DiaHora} - Profesor: ${cursoActualizado.Profesor}) ?`
                        :
                        `Confirma la inscripción de ${alumno.nombre} a la materia ${cursoActualizado.Materia} (${cursoActualizado.DiaHora} - Profesor: ${cursoActualizado.Profesor}) ?`

    Swal.fire({
        text: pregunta,
        showCancelButton:true,
        confirButtonText:'Si, inscribir',
        cancelButtonText:'Cancelar inscripción'
    }).then(
        resultado=>{
            if (resultado.value){
                inscribirAlumno(false) // el parametro que envío es para que controle o no el cupo. La primera vez siempres le mando false para que controle, luego el usuario puede decidir omitir esta validación cuando ha recibido el alerta por error de cupo
                .catch(err=>{
                    gestionarErrorInscripcion(err)
                })
            }else{
                console.log("Inscripción cancelada")
            }
        }
    )
}

const inscripcionRecuperatorio = ()=>{

    const pregunta =
                    `Confirma la inscripción de ${alumno.nombre} al recuperatorio de la materia ${cursoActualizado.Materia} (${cursoActualizado.DiaHora}) ?`
                
Swal.fire({
    text: pregunta,
    showCancelButton:true,
    confirButtonText:'Si, inscribir',
    cancelButtonText:'Cancelar inscripción'
}).then(
    resultado=>{
        if (resultado.value){
            inscribirAlumnoArecuperatorio() // el parametro que envío es para que controle o no el cupo. La primera vez siempres le mando false para que controle, luego el usuario puede decidir omitir esta validación cuando ha recibido el alerta por error de cupo
            .catch(error=>{
                const mensaje_html = `<p>La inscripción al recuperatorio falló</p><p>${error}</p>`

                Swal.fire({
                    icon: 'warning',
                    html:mensaje_html,
                })
                setInscribiendo(false);
            })
        }else{
            console.log("Inscripción cancelada")
        }
    }
)
}

const iniciarInscripcion = ()=>{

    if (cursoActualizado.mesa_examen){
        inscripcionRecuperatorio()
    }else{
        inscripcionRegular()
    }

}

const criterioOrden = (a,b,tipoCurso)=>{
    if (ordenAlfabetico){
        return a.nombre.localeCompare(b.nombre)
    }else{
        return tipoCurso=='grupal' ? a.ordenInscripcion - b.ordenInscripcion : a.comienzo.localeCompare(b.comienzo)
    }
}

if (cargandoAlumnos){
    return <Main center><Loading/><span className="cargando">Cargando alumnos...</span></Main>
};

if (inscribiendo){
    return <Main center><Loading/><span className="cargando">Inscribiendo...</span></Main>
};

if (!cursoActualizado){
    return <Main center><Loading/></Main>
}

if (false){
    return <Main center>
    <div> <button onClick={switchOrdenar}>ordenar</button>
        <table>{
        alumnos
        .sort((a,b)=>{return criterioOrden(a,b,'')})
        .map(alumnoItem => {
            return (
                <div>
                    {alumnoItem.nombre} {alumnoItem.ordenInscripcion}
                
        
                </div>
                )
            })
        }</table>

    </div>
</Main>
}


if (cursoActualizado.grupal===1)
{
return(
<Main ajustarPadding={true}> 
    <div className="curso-cab border-bottom-solid-light mt-2">  
            { !soloVisualizar && <Volver nro_curso={nro_curso}/> }
            <p className="ml-2" title={cursoActualizado.Materia}><span className="text-smaller color-gray mr-2">Materia:</span>{`${cursoActualizado.Materia} (${cursoActualizado.cod_materia})`} <span className='ml-4'>{cursoActualizado.Aula}</span> <span className={`ml-4 ${cursoActualizado.virtual? 'a-virtual':'a-presc'}`}>{cursoActualizado.virtual? 'Virtual' : 'Presencial'}</span></p>
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Inscriptos:</span>{cursoActualizado.inscriptos}</span>
            
            <span className="text-smaller color-gray ml-2">Disponible:</span>
            {
                !cursoActualizado ? <span className='dispo-1 disponible wh-4'>?</span>
                : <span className={cursoActualizado.Disponibilidad>0 ? 'text-white wh-4 ml-2' : 'ml-2 wh-4 text-white'}>{cursoActualizado.Disponibilidad}</span>
            }
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Profesor:</span>{cursoActualizado.Profesor}</span>
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Día:</span>{cursoActualizado.DiaHora}</span>
            <div className="div-tc">
                <span className="color-gray">{cursoActualizado.grupal ? 'Curso Grupal' : 'Curso Individual' }</span>  
                <span className="ml-2 color-gray">{cursoActualizado.mesa_examen ? 'Recuperatorio' : 'Regular' }</span>      
            </div>
   
            { !soloVisualizar && <Opciones
                hayAlumnos = {hayAlumnos}
                crearMailToListaEmails = {crearMailToListaEmails}
                listaEmails = {listaEmails}
                imprimir = {imprimir}
                cursoActualizado = {cursoActualizado}
                cuatrimestreActivo = {cuatrimestreActivo}
                switchMostrarInfo = {switchMostrarInfo}
                iniciarCalificaciones = {iniciarCalificaciones}
                iniciarGestionRecuperatorios = {iniciarGestionRecuperatorios}
                editarCurso = {editarCurso}
                mostrarInfo = {mostrarInfo}
                mostrarTextos = {false}
                iniciarImprimirPDF= {iniciarImprimirPDF}
                preguntasPDF= {preguntasPDF}
                cerrarPreguntasPDF= {cerrarPreguntasPDF}
                setDescargar= {setDescargar}
                descargar = {descargar}       
                refrescarLista = {refrescarLista}
                verAlumnosBorrados = {verAlumnosBorrados}   
                alumnosBorrados = {alumnosBorrados} 
                switchOrdenar = {switchOrdenar}   
                ordenAlfabetico = {ordenAlfabetico}   
                verEnsambles = {verEnsambles}
            /> }
    </div>
     
       { !soloVisualizar && <div className={mostrar ? "flex f-row wrapper2 mostrar" : "flex f-row wrapper2 nomostrar"} onClick={switchMostrar}>

            <div id="slide2">
                <span onClick={switchMostrar} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera flex justify-content-end" >
                    { mostrar && <FontAwesomeIcon className="text-white" icon={faWindowClose}/>} 
                    { !mostrar && <FontAwesomeIcon title="Ver más cursos" className="mostrar-menu-lateral text-white" icon={faPlusSquare}/>}
                </span>  
                { mostrar && <div>
                    <p className="mt-4 mb-4 sub-titulo-cab-modal text-small">Otros cursos de {cursoActualizado.Profesor}</p>
                    <ListaCursosCriterios id_prof={cursoActualizado.id_prof} nro_curso={nro_curso}/>
                    <p className="mt-4 mb-4 sub-titulo-cab-modal text-small">Otros cursos de {cursoActualizado.Materia}</p>
                    <ListaCursosCriterios id_materia={cursoActualizado.id_materia} nro_curso={nro_curso}/>
                  
                </div>}
            </div>
        </div> }

{ isShowing && abrirAbmCurso && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                        
            <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
            nro_curso={nro_curso} 
            finalizarAltaOcopia={finalizarAltaOcopia}
            esModal={true}
            />

        </Modal>
        
}
{ isShowing && abrirGestionRecuperatorios && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
            <GestionRecuperatorios nro_curso ={nro_curso} nombre={cursoActualizado.Materia} finalizar={finalizarAltaOcopia}/>
        </Modal>
        
}
{
    isShowing && abrirCalificaciones && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'900px'}} estiloWrapper={{background:'#000000bf'}}>
  
                     <ActualizarCalificaciones nro_curso={nro_curso}/>
         </Modal>
}
{
    isShowing && mostrarEnsambles && 
        <Modal  titulo={"Listado de ensambles"} hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
  
                <Ensambles cerrarModal={toggle}/>
         </Modal>
}
{
    isShowing && alumnoCambioCurso && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}} titulo={`Cambiar de curso a ${alumnoCambioCurso.nombre}`}>
  
                     <ListaCursosCambioAlumno curso = {cursoActualizado} nro_curso={nro_curso} alumno={alumnoCambioCurso} cerrarLista={cerrarListaCursosCambioAlumno}/>
        </Modal>
}
{
    isShowing && mostrarAlumnosBorrados && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}} titulo={`Alumnos eliminados del curso ${cursoActualizado.Materia} (${alumnosBorrados.length})`}>
  
                     <AlumnosBorrados alumnosBorrados={alumnosBorrados} iniciarVisualizarAlumno={setIdAlumnoVisualizacion}/>
        </Modal>
}
{ isShowing && idAlumnoVisualizacion && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
            <AbmAlumno id_alumno={idAlumnoVisualizacion} 
                       finalizarAltaOcopia={null}
                       esModal={true}
            />    
</Modal>}

    <div className="bg-blue color-63 p-4 rounded relative mt-25x">
          
    { !soloVisualizar && <Alertas alertas={alertas} historial={historialMateria} curso={cursoActualizado} alumno={alumno}/>} 

{ mostrarJsonAlumnos && <div style={{width: "100%"}}><p>{JSON.stringify(alumnos, null, "\t")}</p>
<p>{JSON.stringify(cursoActualizado, null, "\t")}</p>
</div> } 
{llamadoPorCambioCurso && <button title="Cambiar al alumno a éste curso" onClick={()=>cambiarCurso(cursoActualizado)}>
                                    <FontAwesomeIcon className="mr-2 blink" icon={faRoute}/>
                                    Cambiar al alumno a éste curso
</button>}
{cursoNoVigente && <span className="color-red border-radius-7 mb-2 text-smaller bg-white blink text-center">Curso no vigente. Corresponde al {cursoActualizado.cuatrimestre}</span>}
<div className="contenedor-curso-grupal mb-8">
<table className="" id="table-curso">
            <thead className="">
                <tr className="">
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    {!mostrarInfo && <td scope="col">
                        {calificaciones.length > 0 && hayAlumnos && <Calificaciones encabezado={calificaciones[0]}/> }
                    </td>}

                </tr>
            </thead>
            { alumnos.length > 0?  
                <tbody>
                    
                {   
                    alumnos
                    .sort((a,b)=>{return criterioOrden(a,b,'grupal')})
                    .map(alumnoItem => {
                    return (
                        <>
                        <tr className="border-bottom-solid" id={`ref${alumnoItem.id_alumno}`} key={uuidv4()}>
                            <td>
                                { horarios.length > 0 && <HorariosGrupales hora={alumnoItem.comienzo} 
                                            horarios={horarios} 
                                            alumno={{nombre:alumnoItem.nombre,id:alumnoItem.id_alumno}}
                                            setHayUnError={setHayUnError}/>}
                            </td>
                            <td title="Haga click para visualizar al alumno" onClick={()=>{iniciarVisualizarAlumno(alumnoItem.id_alumno)}} className={definirElColor(alumnoItem.id_alumno,alumno.id)}>
                            {alumnoItem.nombre} 
                            </td>
                            <td className="text-black">{formatInstrumentos(alumnoItem)}</td>
                            {/*<td className="text-white">{alumnoItem.descripcion}</td>*/}
                            <td className="text-white" dangerouslySetInnerHTML={createMarkup(alumnoItem.descripcion)}></td>                                                        
                            <td>
                                {alumnoItem.id_alumno >0 && !soloVisualizar && <button title="Eliminar al alumno del curso" onClick={()=>iniciarEliminacion(alumnoItem.id_alumno,alumnoItem.nombre)}>
                                    <FontAwesomeIcon className="" icon={faTrashAlt}/>
                                </button>
                                }
                                {alumnoItem.id_alumno >0 && !soloVisualizar && <button title="Cambiar a otro curso" onClick={()=>iniciarCambioCurso(alumnoItem)}>
                                    <FontAwesomeIcon className="" icon={faRoute}/>
                                </button>
                                }                                
                            </td>
                            { mostrarInfo && alumnoItem.id_alumno >0 && <td><Info celular={alumnoItem.celular}
                                                   email={alumnoItem.email}
                                                   telefono={alumnoItem.telefono}
                                                   Telef_Alternativo={alumnoItem.Telef_Alternativo}
                                                   Telef_Laboral={alumnoItem.Telef_Laboral} /></td>}
                            {<td>
                            {!mostrarInfo && calificaciones.length > 0 && alumnos.length > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(item=>item.id_alumno === alumnoItem.id_alumno)}/> }
                            {buscandoCalificaciones && <div className="flex f-row acciones-lista-cabecera"><Loading/><span className="mr-4">Contando cantidad de cursadas de cada alumno...</span></div>}
                            {errorCalificaciones && <span title="Revise la ficha del curso. Es posible que el encabezado o régimen sean inválidos" className="error_formulario">Error al cargar las calificaciones</span>}

                            </td>}                           
                        </tr>

                        {/*{mostrarInfo && 
                        <tr>
                            <td></td>
                            <td colSpan="5" className="border-none">
                                  {calificaciones.length > 0 && alumnos.length > 0 && <Calificaciones encabezado={calificaciones[0]}/> }
                            </td>
                        </tr>}*/}
                        {mostrarInfo && <tr>
                            <td></td>
                            <td colSpan="5" className="border-none">
                                {calificaciones.length > 0 && alumnos.length > 0 && <Calificaciones encabezado={calificaciones[0]}/> }
                                {calificaciones.length > 0 && alumnos.length > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(item=>item.id_alumno === alumnoItem.id_alumno)}/> }                            
                            </td>
                        </tr>}
                        </>
                        )
                    })
                }
            </tbody> 
            :
            <tbody>
                <tr>
                    <td>
                        <span className="text-black">No hay alumnos inscriptos</span>
                    </td>
                </tr>
            </tbody> 
            }
        </table>

        <div className="">


    {alumno.id && !yaInscripto && !preguntarTipoInscripcion && !hayUnError && !soloVisualizar &&
        <div className="texto-inscribir mt-4 blink cursor-pointer grupal"  onClick={()=>setPreguntarTipoInscripcion(true)}> 
            <span className="mr-4">Inscribir a {alumno.nombre}</span> 
            <FontAwesomeIcon icon={faEdit}/>
        </div>
    }
    {alumno.id && !yaInscripto && hayUnError &&
        /*<div className="text-black cursor-pointer"  onClick={()=>alert('El curso tiene un error')}> 
            <span className="mr-4">Error. No se puede inscribir</span> 
            <FontAwesomeIcon className="blink" icon={faHandPaper}/>
        </div>*/
        <div className="cursor-pointer text-black  mt-4"  onClick={()=>explicarError(`El curso tiene un error`)}> 
            <span className="mr-4 no-insc">Error. No se puede inscribir</span> 
            <FontAwesomeIcon className="blink color-tomato" icon={faHandPaper}/>
        </div>
    }    
    {alumno.id && yaInscripto && 
        <button onClick={()=>hacerScroll(alumno.id)}><span className="mr-4 color-63">{alumno.nombre} ya figura en este curso</span>
        <FontAwesomeIcon 
                        icon={faCheckCircle}/>
        </button>
    }
    {preguntarTipoInscripcion && 
        <PreguntaTipoInscripcion binddato={tipoCursada} 
                                 onchange={cambiarTipoCursada} 
                                 cerrar={()=>setPreguntarTipoInscripcion(false)}
                                 alumno={alumno}
                                 curso={cursoActualizado}
                                 inscribir={iniciarInscripcion}
        />
    }
    </div>
        </div>
      </div>
      {/*abrirfichaConDelay && <AbmCurso nro_curso={nro_curso} cuatrimestreActivo={cuatrimestreActivo} finalizarAltaOcopia={finalizarModificacionFichaCurso}/>*/}

</Main>)
} // fin si es curso grupal


//if (location.state.grupal===0)
if (cursoActualizado.grupal===0)
{
return(
<Main ajustarPadding={true}> 
<div className="curso-cab border-bottom-solid-light mt-2">  
            { !soloVisualizar && <Volver nro_curso={nro_curso}/> }
            {/*<span className="ml-2" title={cursoActualizado.Materia}><span className="text-smaller color-gray mr-2">Materia:</span>{cursoActualizado.cod_materia}</span>*/}
            <p className="ml-2" title={cursoActualizado.Materia}><span className="text-smaller color-gray mr-2">Materia:</span>{`${cursoActualizado.Materia} (${cursoActualizado.cod_materia})`} <span className='ml-4'>{cursoActualizado.Aula}</span> <span className={`ml-4 ${cursoActualizado.virtual? 'a-virtual':'a-presc'}`}>{cursoActualizado.virtual? 'Virtual' : 'Presencial'}</span></p>
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Inscriptos:</span>{cursoActualizado.inscriptos}</span>
            
            <span className="text-smaller color-gray ml-2">Disponible:</span>
            {
                !cursoActualizado ? <span className='dispo-1 disponible wh-4'>?</span>
                : <span className={cursoActualizado.Disponibilidad>0 ? 'text-white wh-4 ml-2' : 'ml-2 wh-4 text-white'}>{cursoActualizado.Disponibilidad}</span>
            }
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Profesor:</span>{cursoActualizado.Profesor}</span>
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Día:</span>{cursoActualizado.DiaHora}</span>
            <div className="div-tc">
                <span className="color-gray">{cursoActualizado.grupal ? 'Curso Grupal' : 'Curso Individual' }</span>  
                <span className="ml-2 color-gray">{cursoActualizado.mesa_examen ? 'Recuperatorio' : 'Regular' }</span>
            </div>
            { !soloVisualizar && <Opciones
                hayAlumnos = {hayAlumnos}
                crearMailToListaEmails = {crearMailToListaEmails}
                listaEmails = {listaEmails}
                imprimir = {imprimir}
                cursoActualizado = {cursoActualizado}
                cuatrimestreActivo = {cuatrimestreActivo}
                switchMostrarInfo = {switchMostrarInfo}
                iniciarCalificaciones = {iniciarCalificaciones}
                iniciarGestionRecuperatorios = {iniciarGestionRecuperatorios}
                editarCurso = {editarCurso}
                mostrarInfo = {mostrarInfo}
                mostrarTextos = {false}
                iniciarImprimirPDF= {iniciarImprimirPDF}
                verAlumnosBorrados = {verAlumnosBorrados}  
                alumnosBorrados = {alumnosBorrados} 
                preguntasPDF= {preguntasPDF}
                cerrarPreguntasPDF= {cerrarPreguntasPDF}
                setDescargar= {setDescargar}
                descargar = {descargar}
                refrescarLista = {refrescarLista}
                switchOrdenar = {switchOrdenar} 
                ordenAlfabetico = {ordenAlfabetico}
                verEnsambles = {verEnsambles}
        /> }
    </div>
            
{ !soloVisualizar && <div className={mostrar ? "flex f-row wrapper2 mostrar" : "flex f-row wrapper2 nomostrar"} onClick={switchMostrar}>

            <div id="slide2">
                <span onClick={switchMostrar} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera flex justify-content-end" >
                    { mostrar && <FontAwesomeIcon className="text-white" icon={faWindowClose}/>} 
                    { !mostrar && <FontAwesomeIcon title="Ver más cursos" className="mostrar-menu-lateral text-white" icon={faPlusSquare}/>}
                </span>  
                { mostrar && <div className="flex f-row">
                    <div>
                        <p className="mt-4 mb-4 sub-titulo-cab-modal text-small">Otros cursos de {cursoActualizado.Profesor}</p>
                        <ListaCursosCriterios id_prof={cursoActualizado.id_prof} nro_curso={nro_curso}/>
                        <p className="mt-4 mb-4 sub-titulo-cab-modal text-small">Otros cursos de {cursoActualizado.Materia}</p>
                        <ListaCursosCriterios id_materia={cursoActualizado.id_materia} nro_curso={nro_curso}/>
                    </div>
                    <div className="p-2 border-left-solid-white flex f-col">
                        <FontAwesomeIcon className="color-tomato" icon={faMailBulk}/>
                        <FontAwesomeIcon className="color-tomato" icon={faInfoCircle}/>
                        <FontAwesomeIcon className="color-tomato" icon={faFilePdf}/>
                    </div>
                </div>}
            </div>
        </div>  }       
{ isShowing && abrirAbmCurso && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                        
            <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
            nro_curso={nro_curso} 
            finalizarAltaOcopia={finalizarAltaOcopia}
            esModal={true}
            />
        </Modal>
}   
{ isShowing && idAlumnoVisualizacion && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
            <AbmAlumno id_alumno={idAlumnoVisualizacion} 
                       finalizarAltaOcopia={null}
                       esModal={true}
            />    
</Modal>}
{
    isShowing && alumnoCambioCurso && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}} titulo={`Cambiar de curso a ${alumnoCambioCurso.nombre}`}>
  
                     <ListaCursosCambioAlumno curso = {cursoActualizado} nro_curso={nro_curso} alumno={alumnoCambioCurso} cerrarLista={cerrarListaCursosCambioAlumno}/>
        </Modal>
}
{
    isShowing && mostrarAlumnosBorrados && 
    <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}} titulo={`Alumnos eliminados del curso ${cursoActualizado.Materia} (${alumnosBorrados.length})`}>
  
        <AlumnosBorrados alumnosBorrados={alumnosBorrados} iniciarVisualizarAlumno={setIdAlumnoVisualizacion}/>
    </Modal>
}
{ isShowing && abrirGestionRecuperatorios && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
            <GestionRecuperatorios nro_curso ={nro_curso} nombre={cursoActualizado.Materia} finalizar={finalizarAltaOcopia}/>
        </Modal>
        
}
{
    isShowing && abrirCalificaciones && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'900px'}} estiloWrapper={{background:'#000000bf'}}>

                <ActualizarCalificaciones nro_curso={nro_curso}/>

          </Modal>
}
{
    isShowing && mostrarEnsambles && 
        <Modal titulo={"Listado de ensambles"} hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
  
                     <Ensambles cerrarModal={toggle}/>
         </Modal>
}
    <div className="bg-blue text-white p-4 rounded relative mt-25x">
        
       {!soloVisualizar && <Alertas alertas={alertas} historial={historialMateria} curso={cursoActualizado} alumno={alumno}/>}

{ mostrarJsonAlumnos && <div style={{width: "100%"}}><p>{JSON.stringify(alumnos, null, "\t")}</p>
<p>{JSON.stringify(cursoActualizado, null, "\t")}</p>
</div> } 
{cursoNoVigente && <span className="color-red border-radius-7 mb-2 text-smaller bg-white blink text-center">Curso no vigente. Corresponde al {cursoActualizado.cuatrimestre}</span>}
<div className="contenedor-curso-individual mb-8">
<table className="" id="table-curso">
            <thead className="color-black">
            <tr>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    {!mostrarInfo &&<td scope="col">
                        {calificaciones.length > 0 && hayAlumnos && <Calificaciones encabezado={calificaciones[0]}/> }
                    </td>}

                </tr>
            </thead>
            { alumnos.length > 0?  
                <tbody>
                {  
                    alumnos
                    .sort((a,b)=>{return criterioOrden(a,b,'individual')})
                    .map(alumnoItem => {
                    return (
                        <>
                        <tr className={definirElColor(alumnoItem.id_alumno,alumno.id)} id={`ref${alumnoItem.id_alumno}`} key={uuidv4()}>
                            <td className={`${definirElColor(alumnoItem.id_alumno,alumno.id)}`}>
                                <div className={horarios.length>0 && llamadoPorCambioCurso && alumnoItem.id_alumno===0 ? 'w-120' : ''}>
                                    {horarios.length>0 && llamadoPorCambioCurso && alumnoItem.id_alumno===0 && <button title="Cambiar al alumno a éste curso" onClick={()=>cambiarCurso(cursoActualizado,alumnoItem.comienzo)}>
                                            <FontAwesomeIcon className="" icon={faRoute}/>
                                    </button>}
                                    {horarios.length>0 && <HorariosIndividuales hora={alumnoItem.comienzo} 
                                            horarios={horarios} 
                                            alumno={{nombre:alumnoItem.nombre,id:alumnoItem.id_alumno}}
                                            ejecutarCambioHorario={ejecutarCambioHorario}
                                            setHayUnError={setHayUnError}
                                            soloVisualizar = {soloVisualizar}
                                            esRecuperatorio = {cursoActualizado.mesa_examen}
                                            gestionarDescanso = {gestionarDescanso}/>
                                    }  
                                </div>   
                            </td>
                            <td className={definirElColor(alumnoItem.id_alumno,alumno.id,'nombre')}>
                                {
                                    alumnoItem.id_alumno===0 && alumno.id && !yaInscripto && !preguntarTipoInscripcion && !hayUnError && !soloVisualizar &&
                                    <div className="ml-4 texto-inscribir cursor-pointer" onClick={()=>{
                                        setPreguntarTipoInscripcion(true)
                                        setHorarioSeleccionado(alumnoItem.comienzo)}}>
                                        <span className="mr-4">Inscribir a {alumno.nombre}</span> 
                                        <FontAwesomeIcon className="blink" icon={faEdit}/>
                                        <span className="ml-4">{alumnoItem.comienzo} hs.</span> 
                                    </div>
                                }    
                                {
                                alumnoItem.id_alumno >= 0 && <span title="Haga click para visualizar al alumno"  className="cursor-pointer" onClick={()=>{iniciarVisualizarAlumno(alumnoItem.id_alumno)}}>{alumnoItem.nombre}</span>           
                                }

                                {!cursoActualizado.mesa_examen && alumnoItem.id_alumno===0 && alumno.id && horarioSeleccionado===alumnoItem.comienzo && preguntarTipoInscripcion && !hayUnError &&
                                        <PreguntaTipoInscripcion binddato={tipoCursada} 
                                                                onchange={cambiarTipoCursada} 
                                                                cerrar={()=>{setHorarioSeleccionado(null)
                                                                    setPreguntarTipoInscripcion(false)}}
                                                                alumno={alumno}
                                                                curso ={cursoActualizado}
                                                                inscribir={iniciarInscripcion}
                                        />
                                    }  
                            </td>
                            <td className="text-black">{formatInstrumentos(alumnoItem)}</td>
                            <td className="text-white" dangerouslySetInnerHTML={createMarkup(alumnoItem.descripcion)}>
                            </td>
                            <td className="bg-blue">
                                {alumnoItem.id_alumno >0 && !soloVisualizar && <button title="Eliminar al alumno del curso" onClick={()=>iniciarEliminacion(alumnoItem.id_alumno, alumnoItem.nombre)}>
                                    <FontAwesomeIcon className="" icon={faTrashAlt}/>
                                </button>
                                }
                                {alumnoItem.id_alumno >0 && !soloVisualizar && <button title="Cambiar a otro curso" onClick={()=>iniciarCambioCurso(alumnoItem)}>
                                    <FontAwesomeIcon className="" icon={faRoute}/>
                                </button>
                                }                                
                            </td>
                            { mostrarInfo && alumnoItem.id_alumno >0 &&  <td className="relative"><Info celular={alumnoItem.celular}
                                                   email={alumnoItem.email}
                                                   telefono={alumnoItem.telefono}
                                                   Telef_Alternativo={alumnoItem.Telef_Alternativo}
                                                   Telef_Laboral={alumnoItem.Telef_Laboral} /></td>}
                             {!mostrarInfo &&<td>
                                {calificaciones.length > 0 && alumnoItem.id_alumno > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(item=>item.id_alumno === alumnoItem.id_alumno)}/> }
                                {buscandoCalificaciones && <div className="flex f-row acciones-lista-cabecera"><Loading/><span className="mr-4">Contando cantidad de cursadas de cada alumno...</span></div>}
                                {errorCalificaciones && <span title="Revise la ficha del curso. Es posible que el encabezado o régimen sean inválidos" className="error_formulario" >Error al cargar las calificaciones</span>}
                             </td>}                                                    
                        </tr>
                        {/*{mostrarInfo && 
                        <tr>
                            <td></td>
                            <td colSpan="5" className="border-none">
                                  {calificaciones.length > 0 && alumnoItem.id_alumno > 0 && <Calificaciones encabezado={calificaciones[0]}/> }
                            </td>
                        </tr>}*/}
                        {mostrarInfo && 
                        <tr>
                            <td></td>
                            <td colSpan="5" className="border-none">
                                {calificaciones.length > 0 && alumnoItem.id_alumno > 0 && <Calificaciones encabezado={calificaciones[0]}/> }
                                {calificaciones.length > 0 && alumnoItem.id_alumno > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(item=>item.id_alumno === alumnoItem.id_alumno)}/> }                            
                            </td>
                        </tr>}                        
                        </>
                        )
                    })
                }
            </tbody> 
            :
            <tbody>
                <tr>
                    <td>
                        <span className="text-black">No hay alumnos inscriptos</span>
                    </td>
                </tr>
            </tbody> 
            }
        </table>
        {alumno.id && !yaInscripto && hayUnError &&
        <div className="cursor-pointer text-black  mt-4"  onClick={()=>explicarError(`El curso fue creado como individual pero no se asignaron horarios individuales. Debería modificar el curso y deshabilitar el casillero de Intervalos Horarios`)}> 
            <span className="mr-4 no-insc">Error. No se puede inscribir</span> 
            <FontAwesomeIcon className="blink color-tomato" icon={faHandPaper}/>
        </div>
        }  
        {alumno.id && !yaInscripto && !preguntarTipoInscripcion && !hayUnError && !soloVisualizar && cursoActualizado.grupal==1 &&
        <div className="texto-inscribir mt-4 blink cursor-pointer individual"  onClick={()=>setPreguntarTipoInscripcion(true)}> 
            <span className="mr-4">Inscribir a {alumno.nombre}</span> 
            <FontAwesomeIcon icon={faEdit}/>
        </div>
    }
        {cursoActualizado.mesa_examen && preguntarTipoInscripcion && <PreguntaTipoInscripcion binddato={tipoCursada} 
                                 onchange={cambiarTipoCursada} 
                                 cerrar={()=>setPreguntarTipoInscripcion(false)}
                                 alumno={alumno}
                                 curso={cursoActualizado}
                                 inscribir={iniciarInscripcion}
        />}
        </div>  
      </div>
     
      {/*abrirfichaConDelay && <AbmCurso nro_curso={nro_curso} cuatrimestreActivo={cuatrimestreActivo}/>*/}
</Main>)
} // fin si es curso grupal

}


function PreguntaTipoInscripcion ({cerrar,onchange, binddato, alumno, inscribir,curso}){

    return (
        <div className="mr-4 ml-4">
            <span className="mb-2 inline-block-1 text-black">{`¿Cómo desea inscribir a ${alumno.nombre}?`}</span>
            <div className="flex f-col">
            <div className="flex f-row">
                {curso.mesa_examen==false && <select onChange={onchange} value={binddato} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option key="tipos1" value="1">{descripcionTipoCursadas[1]}</option>
                    <option key="tipos2" value="2">{descripcionTipoCursadas[2]}</option>
                    <option key="tipos4" value="4">{descripcionTipoCursadas[4]}</option>
                    <option key="tipos5"  value="5">{descripcionTipoCursadas[5]}</option>
                </select> }
                {curso.mesa_examen==true && <select onChange={onchange} value={binddato} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option key="tipos3" value="3">{descripcionTipoCursadas[3]}</option>
                    <option key="tipos4" value="4">{descripcionTipoCursadas[4]}</option>
                </select>}                
                <button><FontAwesomeIcon  className="text-black"
                                icon={faWindowClose} 
                                title="Cancelar"
                                onClick={cerrar}/>
                            </button>
                <button className="text-black" onClick={inscribir}>Inscribir como {descripcionTipoCursadas[binddato]}
                    <FontAwesomeIcon className="text-black ml-2"
                        icon={faCheckCircle}/>
                </button>
            </div>                              
            </div>   
                      
        </div>
    )
}    

function Info({email,celular,telefono,Telef_Alternativo,Telef_Laboral,Email_Secundario}){
    return (                
    <div className="max-w-sm rounded overflow-hidden ml-4 text-black">
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
                                <a target="_blank" className="mr-2 ml-2" href={crearMailToIndividual(email)} title="E-mail principal">{email}</a> 
                                <a target="_blank" className="mr-2 ml-2" href={crearMailToIndividual(Email_Secundario)} title="E-mail secundario">{Email_Secundario}</a>      
                        </div>     
                </div>
  </div>
    )       
}

function createMarkup(codigo) { return {__html: codigo}; };

function Alertas({alertas,historial,curso,alumno}){

    if (alertas.length===0){
        return null
    }

    return(
        <div className="max-w-sm overflow-hidden shadow-lg mb-2 p-2 AlertaContainer contenedor-curso-grupal">
        <div className="px-6 py-4">
            <div className="mb-2 bg-tomato text-white"> <FontAwesomeIcon className="blink" icon={faHandPaper}/> Alertas</div>
            <p className="text-gray-700 text-base">
                {alertas[0].mensaje}
            </p>
            <Historial historial={historial} curso={curso} alumno={alumno}/>
        </div>  
        <div className="px-6 py-4">
            <div className="flex f-col al-lis">
            {alertas.map(
               (item)=>{
                   return(
                    <span key={item.id_materia} className={item.descripcion ? "alerta inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2" : ''}>
                    {item.descripcion}        
                </span>
                   )
               } 
            )}
            </div>
        </div>
    </div>)}


function verSiYaInscripto(id,vector){
    let resultado = true;

    const verificar = vector.findIndex(item=>item.id_alumno===id)

    if (verificar===-1){
        resultado=false;
    }

    return resultado;
}

function definirElColor(id_alumno_tabla,id_alumno_seleccionado,campo){
    if(campo=='nombre'){
        return  id_alumno_tabla==null ? 'bg-gray text-center' : id_alumno_tabla===id_alumno_seleccionado ? "bg-alumnoInscripto cursor-pointer" : "filas-lista-principal cursor-pointer";
    }else{
        return  id_alumno_tabla==null ? 'bg-gray' : id_alumno_tabla===id_alumno_seleccionado ? "bg-alumnoInscripto cursor-pointer" : "filas-lista-principal cursor-pointer";
    }
}


function HorariosIndividuales({hora,alumno,horarios,ejecutarCambioHorario,
                                setHayUnError,soloVisualizar,gestionarDescanso, esRecuperatorio}){
   // const [horarioIndividual,setHorarioIndividual] = useState(hora)
   // no hace falta que use un estado con useState pero SE PUEDE USAR AQUI

   // ATENCION: alumno.id_alumno == 0 es un horario desocupado
   // alumno.id_alumno = null es un horario de descanso ( en la tabla se graba como id_alumno = -1000 y id_tipo_cursada = -1
   // pero el stored spListarCursoIndividualConDisponibilidad_new devuelve este horario como id_alumno = null)

    if (esRecuperatorio){ // si el curso es recuperatorio no se toma en cuenta el horario se trata como grupal
        return null
    }

    const esHoraDescanso = alumno.id == null;
    
    const cambiarHorarioIndividual = (e)=>{

        const nuevoHorario = e.target.value;

        Swal.fire({
            text:`Confirma el cambio de horario de ${hora} a ${nuevoHorario} para el alumno ${alumno.nombre} ?`,
            showCancelButton:true,
            confirButtonText:'Si, cambiar el horario',
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    ejecutarCambioHorario(alumno.id,nuevoHorario)
                }else{
//                    setHorarioIndividual(e.target.value)
                    e. preventDefault();
                }
            }
        )
    }

    if (horarios.length===0){
        setHayUnError(true)
        return <span className="error_formulario">Error</span>
    }


    const horasDelVectorHorarios = horarios.filter(item=>item.comienzo.length>0)
    
    if (horasDelVectorHorarios.length===0){
        setHayUnError(true)
        return <span className="error_formulario" title="El curso fue creado como individual pero no se asignaron horarios individuales. Debería modificar el curso y deshabilitar el casillero de Intervalos Horarios">Error</span>
    }

    // Los horarios de descanso se indentifican con id_alumno==null
    // Si es un horario de descanso muestro solo su hora
    // Si no es horario de descanso muestro en el combo de horarios todo lo que no es un horario de descanso
    // para que no se pueda inscribirse ni cambiarse a ese horario
    const horariosFinal = horarios.filter(item=>item.id_alumno!=null || item.comienzo==hora)

    // separo alumno.id==0 o alumno.id == null para clarificar , son 2 casos diferentes
    const disabled = alumno.id === 0  || soloVisualizar || alumno.id == null ? true : null

    return (
        <div className="flex f-row items-center">
            <select id={alumno.id_alumno} disabled={disabled} value={hora} onChange={cambiarHorarioIndividual}>
                {horariosFinal
                    .map(
                    item=>{ return(
                    item.comienzo===hora ? 
                    <option key={uuidv4()} disabled value={item.comienzo}>{item.comienzo}</option>
                    : item.comienzo.length===0 ? 'Error' : <option key={item.comienzo} value={item.comienzo}>{item.comienzo}</option>)}
                    )
                }
            </select>
            {(esHoraDescanso || alumno.id==0 )&&<FontAwesomeIcon title={esHoraDescanso ? 'Desactivar el descanso' : 'Activar como hora de descanso'} className="ml-2 cursor-pointer" onClick={()=>gestionarDescanso(esHoraDescanso,hora)} icon={esHoraDescanso ? faStopwatch : faBan}/>}
        </div>
    )
}

function HorariosGrupales({hora,alumno,horarios,setHayUnError}){
    // const [horarioIndividual,setHorarioIndividual] = useState(hora)
    // no hace falta que use un estado con useState pero SE PUEDE USAR AQUI
 
    
     if (horarios.length===0){
        setHayUnError(true)
         return <span className="error_formulario">Error</span>
     }
 
     const horasDelVectorHorarios = horarios.filter(item=>item.comienzo.length>0)

     
     if (horasDelVectorHorarios.length>0){
         setHayUnError(true)
         return <span className="error_formulario" title="El curso fue creado como grupal pero se asignaron horarios individuales. Debería modificar el curso y marcar el casillero de Intervalos Horarios">Error</span>
     }
 
     return null // si no hubo errores devolver nulo porque un curso grupal no necesita mostrar un horario en la primer columna
              // el propósito de esta función es detectar cursos grupales tratados como individuales
     
 }

function armarListaEmails(alumnos,setListaEmails){

    const emails = alumnos.filter(item=>item.email.trim()!='').map(item=>item.email)

    setListaEmails(emails)
}

function crearMailToListaEmails(listaEmails){
    return listaEmails.length>0 ? `mailto: ${listaEmails}` : ``
}

function crearMailToIndividual(email){
    return email!=null && email!='' ? `mailto: ${email}` : ``
}

function verificarSiHayAlumnos(lista,setHayAlumnos){
    if(!lista){
        setHayAlumnos(false)
        return
    }

    if(lista.length==0){
        setHayAlumnos(false)
        return
    }

    // Si el tipo de curso es individual la lista no puede venir vacía porque trae los horarios aunque no haya alumnos inscriptos
    // Si el tipo de curso es grupal puede venir vacía si no hay alumnos inscriptos
    if(lista[0].tipo=='GRUPAL'){
        if (lista.length>0){
            setHayAlumnos(true)
        }else{
            setHayAlumnos(false)
        }
    }else{
        const verificacion = lista.some(item=>item.id_alumno>0)
        if (verificacion){
            setHayAlumnos(true)
        }else{
            setHayAlumnos(false)
        }
    }

}

function Historial({historial,curso,alumno}){
    return <div>
        <MateriaDuplicada historial={historial} curso={curso} alumno={alumno}/>
        {historial.length > 0 && <div>
        <span className="mt-4 mb-2 text-small inline-block-1 border-bottom-solid-light">Historial de cursadas de la materia</span>
        <table className="hist-mat">
            <thead>
                <tr>
                    <td>Cuatrimestre</td>
                    <td>Profesor</td>
                    <td>Día</td>
                    <td>Promedio</td>
                    <td>Tipo</td>
                </tr>
            </thead>
            <tbody>
        {historial.map(item=>{return <tr>
                        <td>{item.nombre}</td>
                        <td>{item.profesor}</td>
                        <td>{item.DiaHora}</td>
                        <td>{item.promedio}</td>
                        <td>{item.tipo}</td>
                    </tr>})}    
            </tbody>
        </table>
        </div>}
    </div>
}

function Opciones({hayAlumnos,
                    crearMailToListaEmails,
                    listaEmails,
                    imprimir,
                    cursoActualizado,
                    cuatrimestreActivo,
                    switchMostrarInfo,
                    iniciarCalificaciones,
                    iniciarGestionRecuperatorios,
                    mostrarInfo,
                    mostrarTextos,
                    editarCurso,
                    iniciarImprimirPDF,
                    preguntasPDF,
                    cerrarPreguntasPDF,
                    descargar,
                    setDescargar,
                    refrescarLista,
                    switchOrdenar, ordenAlfabetico,verAlumnosBorrados,alumnosBorrados,verEnsambles 
                }){
   return <div className={ mostrarTextos ? "botonNc flex f-row text-white" : "ml-6 inline-block-1 text-white"}>
    {hayAlumnos > 0 && <>
        <a title='Mail grupal' className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" target="_blank" href={crearMailToListaEmails(listaEmails)}>
            <FontAwesomeIcon className="text-white" icon={faMailBulk}/> {mostrarTextos ? 'Mail grupal' : ''}
        </a> 
        <span title={mostrarInfo ? ' Ocultar info de contacto' : ' Mostrar info de contacto'} onClick={switchMostrarInfo} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="text-white" icon={faInfoCircle}/> {mostrarTextos ? mostrarInfo ? ' Ocultar info de contacto' : ' Mostrar info de contacto' : '' } 
        </span> 
    </>}    
        <div className="flex f-col inline-block-1">
        
            {/*<span title='Imprimir Registro' onClick={()=>imprimir(false,cursoActualizado,cuatrimestreActivo)} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
                <FontAwesomeIcon className="color-tomato" icon={faFilePdf}/> {mostrarTextos ? 'Imprimir Registro' : ''}
            </span>*/}
            <span title='Imprimir Registro' onClick={iniciarImprimirPDF} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
                <FontAwesomeIcon className="text-white" icon={faFilePdf}/> {mostrarTextos ? 'Imprimir Registro' : ''}
            </span>            
            {preguntasPDF && <TipoImpresion cerrarPreguntasPDF={cerrarPreguntasPDF} 
                                                                ejecutarImprimirPDF = {()=>imprimir(descargar,cursoActualizado,cuatrimestreActivo)}
                                                                modificarDescargar = {setDescargar}
                                                                descargar = {descargar}
                                                                />}    
        </div>

        <span title="Editar la cabecera del curso" onClick={()=>editarCurso()} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="text-white" icon={faEdit}/> {mostrarTextos ? 'Editar la cabecera del curso' : ''}
        </span> 

        { hayAlumnos && <span title="Calificar" onClick={()=>iniciarCalificaciones()} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="text-white" icon={faPencilRuler}/> {mostrarTextos ? 'Calificar' : ''}
        </span>}             

        <span title="Refrescar el curso" onClick={refrescarLista} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="text-white" icon={faSync}/> {mostrarTextos ? 'Refrescar' : ''}
        </span> 

        <span title={ordenAlfabetico ? "Ordenar por orden de inscripción" : "Ordenar alfabéticamente"} onClick={switchOrdenar} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="text-white" icon={ordenAlfabetico ? faSortNumericDown : faSortAlphaDown}/> {mostrarTextos ? 'Ordenar por nombre' : ''}
        </span> 
        <span title='Ver lista de alumnos eliminados' onClick={alumnosBorrados.length==0 ? null : verAlumnosBorrados} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className={alumnosBorrados.length==0 ? "color-gray" : "text-white"} icon={faEraser}/> <span className="text-xsmall text-white">( {alumnosBorrados.length} )</span>
        </span>  
        <span title='Ensambles' onClick={verEnsambles} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="text-white" icon={faEye}/> <span className="text-xsmall text-white">ENSAMBLES</span>
        </span>  
        { hayAlumnos && <span title="Configurar recuperatorios" onClick={()=>iniciarGestionRecuperatorios()} className="cursor-pointer mr-2 ml-2 text-xsmall text-white" >
                Configurar recuperatorios
        </span>} 
    </div>
}

function MateriaDuplicada ({historial,curso,alumno}){

    const array_verificacion = historial.filter(item=>item.id_cuatrimestre==curso.id_cuatrimestre && curso.id_materia == item.id_materia && curso.nro_curso != item.nro_curso)

    if (array_verificacion.length>0){
        return <p className="al-yains">
            <FontAwesomeIcon icon={faInfoCircle}/>
            {alumno.nombre} ya figura inscripto en {curso.cod_materia} en el mismo cuatrimestre</p>
    }else{
        return null
    }
}

function Volver({nro_curso}){
    return <Link className="text-white tdec-none" to={`/cursos/${nro_curso}`}>
        <span className="cursor-pointer text-white mr-2 ml-2 acciones-lista-cabecera text-xsmall" title="Volver a cursos" >
            <FontAwesomeIcon className="text-white" icon={faBackspace}/> Volver 
        </span> 
    </Link>
}

function alumnoTieneCalificacionesCargadas(id_alumno,calificaciones){

    const alumnosSinCalificaciones = calificaciones.filter(item=>{ 
        return (item.columna_1 == '--' || item.columna_1 == null) &&
        (item.columna_2 == '--' || item.columna_2 == null) &&
        (item.columna_3 == '--' || item.columna_3 == null) &&
        (item.columna_4 == '--' || item.columna_4 == null) &&
        (item.columna_5 == '--' || item.columna_5 == null) &&
        (item.columna_6 == '--' || item.columna_6 == null) &&
        (item.columna_7 == '--' || item.columna_7 == null) &&
        (item.columna_8 == '--' || item.columna_8 == null) &&
        (item.promedio == '--' || item.promedio == null) &&
        (item.concepto == '--' || item.concepto == null) &&
        (item.condicional == '--' || item.condicional == null)  
    })

    // Todos los alumnos del curso tienen asociado un objeto de notas que viene en el vector calificaciones 
    // Primero filtro ese vector creando un vector correspondiente a calificaciones no cargadas
    // si el alumno que se desea verificar no figura en este vector alumnosSinCalificaciones
    // significa que tiene alguna calificacion cargada
    // Si el alumno figura en este vector significa que no tiene calificaciones
    // Por eso retorno negando el resultado

    return !alumnosSinCalificaciones.some(item=>item.id_alumno==id_alumno)
}

function AlumnosBorrados ({alumnosBorrados,iniciarVisualizarAlumno})
{
    if(alumnosBorrados.length==0){
        return null
    }else{
        return <div className="cursor-pointer text-small mt-2">
                    {alumnosBorrados.map((item,index)=><p onClick={()=>iniciarVisualizarAlumno(item.id_alumno)} className="mr-2 mt-2">{index+1} - {item.nombre} - {item.fecha}</p>)}
            </div>
    }
}    

const formatInstrumentos = (alumnoItem)=>{

    if (!alumnoItem || !alumnoItem?.instrumentos){
        return ''
    }

    const instrumentos_array = alumnoItem.instrumentos.split('/');

    if(instrumentos_array.length==1){
        return alumnoItem?.instrumentos
    }else if (instrumentos_array.length==0){
        return ''
    }else{
        return instrumentos_array.map((instrumento,index)=><span title={esPrincipal(instrumento,alumnoItem.inst_principal) ? 'Instrumento principal': ''} style={esPrincipal(instrumento,alumnoItem.inst_principal) ? {fontWeight:'700',background:'khaki'}: {}}>{instrumento}</span>)
    }
}

const esPrincipal = (instrumento,principal)=>{
    
    if(!instrumento || !principal){
        return false
    }

    if(instrumento.trim().toUpperCase().includes(principal.trim().toUpperCase())){
        return true
    }else{
        return false
    }
}