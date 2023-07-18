import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faPlusSquare, faEdit } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import {useAlumno} from '../Context/alumnoContext';
import {v4 as uuidv4} from 'uuid';
import { Link } from 'react-router-dom';
import Curso from '../Vistas/Curso';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import Swal from 'sweetalert2';

export default function ListaCursosCambioAlumno({curso, nro_curso,alumno,cerrarLista}){

    const [cursos,setCursos]=useState([]);
    const [buscandoCursos,setBuscandoCursos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const {cuatrimestreActivo} = useAlumno();
    const {toggle, isShowing } = useModal();
    const [idCursoSeleccionado,setIdCursoSeleccionado] = useState(null)

    useEffect(()=>{
       
        setBuscandoCursos(true)
        const url = `/api/cursos/materia/${cuatrimestreActivo.id_cuatrimestre}/${curso.id_materia}`
        const buscarCursos = async ()=>{

           try{
                const {data}= await Axios.get(url)
                let vectorCursos;

                
                if (nro_curso){ // si se llama desde un curso excluir el curso para que no sea redundante
                    vectorCursos = data.filter(item=>item.nro_curso != nro_curso)  
                }else{
                    vectorCursos = [...data]
                }

                setCursos(vectorCursos)
                setBuscandoCursos(false)
            }catch(err){
                console.log(err.response.data)
                setBuscandoCursos(false)
                setHuboError(true)
            }
        }
        
        buscarCursos()
    },[])

    const inscribirAlumno = async (cursoDestino,horarioDestino,novalidarcupo)=>{

        try{
    
            const objetoInscripcion = {
                id:Number(cursoDestino.nro_curso), // como el n de curso se pasa por params llega como string
                id_origen: Number(nro_curso),
                id_alumno : Number(alumno.id_alumno),
                hora_individual: horarioDestino,
                novalidarcupo:novalidarcupo            
            }
    
            const resultado = await Axios.post('/api/cursos/alumno/cambiocurso/',objetoInscripcion)
   
            const mensaje_html = `<p>El cambio de curso se realizó con éxito</p>`
    
            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
              })
             
              cerrarLista()
        }catch(err){

                throw err.response.data.message;
        }   
    }


    const iniciarInscripcion = (cursoDestino,horarioDestino)=>{

        if (curso.mesa_examen){
            alert('El cambio para un curso recuperatorio no está desarrollado')
        }else{
            inscribirAlumno(cursoDestino,horarioDestino,false) // el parametro que envío es para que controle o no el cupo. La primera vez siempres le mando false para que controle, luego el usuario puede decidir omitir esta validación cuando ha recibido el alerta por error de cupo
            .catch(err=>{
                gestionarErrorInscripcion(cursoDestino,horarioDestino,err)
            })
        }
    
    }

const gestionarErrorInscripcion = (cursoDestino,horarioDestino,error)=>{

    const es_error_cupo = error.includes('cupo')

    
    const mensaje_html = `<p>El cambio de curso falló</p><p>${error}</p>`

    Swal.fire({
        html:mensaje_html,
        text: error,
        icon: 'warning',
        showCancelButton: es_error_cupo,
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: es_error_cupo ? 'Inscribir igual' : 'OK',
        cancelButtonText: 'Cancelar inscripción',
    }).then(respuesta=>{
        if (respuesta.isConfirmed){
               inscribirAlumno(cursoDestino,horarioDestino,true) // el parametro que envío es para que controle o no el cupo. La primera vez siempres le mando false para que controle, luego el usuario puede decidir omitir esta validación cuando ha recibido el alerta por error de cupo
        }else{
            Swal.fire({
                html: 'Actualizando datos del curso...',
                timer: 2500,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }

            })
            cerrarLista()
        }})
}

    const iniciarVisualizarCurso = (nroCurso)=>{
        setIdCursoSeleccionado(nroCurso)
        toggle()
     }

    const cambiarCurso = (cursoDestino,horarioDestino)=>{
        Swal.fire({
            html:`<p>¿Confirma el cambio de curso para ${alumno.nombre}?</p>
            <p>${cursoDestino.DiaHora} (${cursoDestino.Profesor})</p> ${horarioDestino? `Horario seleccionado : ${horarioDestino} hs.` : ``}`,
            showCancelButton:true,
            confirButtonText:'Si, cambiar',
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    iniciarInscripcion(cursoDestino,horarioDestino)
                    setIdCursoSeleccionado(null)
                    cerrarLista()
                }else{
                    console.log("Cambio cancelado")
                }
            }
        )
       
    } 

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscandoCursos){
        return <Main center><div><Loading blanco={true}/><span className="cargando text-white">Buscando cursos...</span></div></Main>
    };

    return(
        <>  
           {/*textoBusqueda!='' && <Listado alumnos={alumnosInactivos} textoBusqueda={textoBusqueda} seleccionarAlumno={seleccionarAlumno}/>*/}
           {curso.id_materia && cursos.length>0 && <ListadoMaterias cursos={cursos} curso={curso}
            isShowing = {isShowing}
            idCursoSeleccionado = {idCursoSeleccionado}
            toggle = {toggle}
            iniciarVisualizarCurso = {iniciarVisualizarCurso}
            alumno = {alumno}
            cambiarCurso = {cambiarCurso} />}
           {cursos.length==0 && <span>No se encontraron más cursos</span>}
        </>
    )
}

function ListadoMaterias({cursos,curso,
                            isShowing,
                            idCursoSeleccionado,
                            toggle,
                            iniciarVisualizarCurso,
                            alumno,
                            cambiarCurso}){

    return (
    <div>
        <div class="mb-2 titulo-cab-modal text-center">Otros cursos de {curso.Materia}</div>
        { isShowing && idCursoSeleccionado && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#000000bf'}} titulo={`Cambiar de curso a ${alumno.nombre}`}>
                                
                    <Curso id_curso = {idCursoSeleccionado} llamadoPorCambioCurso={true} cambiarCurso={cambiarCurso}/>
        
                </Modal>
         }   
        {cursos
            .sort((a,b)=>{
                if (a.dia==b.dia){
                    return a.comienzo.localeCompare(b.comienzo)
                }else{
                    return a.dia-b.dia
                }
            })
            .map((item,index)=>
            <div className="text-black" key={`alin-${uuidv4()}`}>
                {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                {/*<FontAwesomeIcon className="mr-2" icon={faUser}/>*/}
                
                <div onClick={()=>iniciarVisualizarCurso(item.nro_curso)} className="cursor-pointer text-small mt-2"><span className="mr-2">{item.DiaHora}</span><span className="mr-2">{item.comienzo} hs.</span><span className="mr-2">{item.nombre}</span><span>#{item.nro_curso}</span></div>
            </div>
            )
        }
    </div>
    )
}

