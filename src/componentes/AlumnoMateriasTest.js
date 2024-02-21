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

export default function AlumnoMateriasTest({id_alumno}){

    const [cursos,setCursos]=useState([]);
    const [buscandoCursos,setBuscandoCursos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const {cuatrimestreActivo} = useAlumno();
    const {toggle, isShowing } = useModal();
    const [idCursoSeleccionado,setIdCursoSeleccionado] = useState(null)

    useEffect(()=>{
       
        setBuscandoCursos(true)
        const url = `/api/alumnos/materiastest/${id_alumno}`
        const buscarDatos = async ()=>{

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
        
        buscarDatos()
    },[])


    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscandoCursos){
        return <Main center><div><Loading blanco={true}/><span className="cargando text-white">Buscando datos...</span></div></Main>
    };

    return(
        <>  
           {cursos.length>0 && cursos.map(item=><p style={{fontSize:'larger'}}>{item.descripcion} {item.cod_materia}</p>) }
           {cursos.length==0 && <p style={{fontSize:'larger'}}>No aprobó materias por TI</p> }
        </>
    )
}



