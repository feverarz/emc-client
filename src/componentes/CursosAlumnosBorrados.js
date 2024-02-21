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

export default function CursosAlumnosBorrados(){

    const [cursos,setCursos]=useState([]);
    const [buscandoCursos,setBuscandoCursos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const {cuatrimestreActivo} = useAlumno();
    const {toggle, isShowing } = useModal();
    const [idCursoSeleccionado,setIdCursoSeleccionado] = useState(null)

    useEffect(()=>{
       
        setBuscandoCursos(true)
        const url = `/api/cursos/lista/alumnosborrados`
        const buscarCursos = async ()=>{

           try{
                const {data}= await Axios.get(url)
                setCursos(data)
                setBuscandoCursos(false)
            }catch(err){
                console.log(err)
                setBuscandoCursos(false)
                setHuboError(true)
            }
        }
        
        buscarCursos()
    },[])


    const iniciarVisualizarCurso = (nroCurso)=>{
        setIdCursoSeleccionado(nroCurso)
        toggle()
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
           {cursos.length>0 && <ListadoMaterias cursos={cursos} 
            isShowing = {isShowing}
            idCursoSeleccionado = {idCursoSeleccionado}
            toggle = {toggle}
            iniciarVisualizarCurso = {iniciarVisualizarCurso}/>}
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
        { isShowing && idCursoSeleccionado && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#000000bf'}} titulo={`Test`}>
                                
                    <Curso id_curso = {idCursoSeleccionado} llamadoPorCambioCurso={true} cambiarCurso={cambiarCurso}/>
        
                </Modal>
         }   
        {cursos
            .map((item,index)=>
            <div className="text-black" key={`alin-${uuidv4()}`}>
                {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                {/*<FontAwesomeIcon className="mr-2" icon={faUser}/>*/}
                
                <div onClick={()=>iniciarVisualizarCurso(item.nro_curso)} className="cursor-pointer text-small mt-2"><span className="mr-2">{item.DiaHora}</span><span className="mr-2">{item.cantidad}</span><span className="mr-2">{item.nombre}</span><span>#{item.nro_curso}</span></div>
            </div>
            )
        }
    </div>
    )
}

