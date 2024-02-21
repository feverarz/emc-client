import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faPlusSquare, faEdit } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import useModal from '../hooks/useModal';
import Modal from './Modal';
import AbmAlumno from '../abms/abm-alumno';

export default function BajaAlumnos(){

    const [alumnosInactivos,setAlumnosInactivos]=useState([]);
    const [buscandoAlumnos,setBuscandoAlumnos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const {toggle, isShowing } = useModal();
    const [idAlumnoSeleccionado,setIdAlumnoSeleccionado] = useState(null)

    useEffect(()=>{
       
        setBuscandoAlumnos(true)

        const buscarAlumnosInactivos = async ()=>{

           try{
                const {data}= await Axios.get('/api/alumnos/bajas/listado')
        
                setAlumnosInactivos(data)
                setBuscandoAlumnos(false)
            }catch(err){
                console.log(err.response.data)
                setBuscandoAlumnos(false)
                setHuboError(true)
            }
        }
        
        buscarAlumnosInactivos()
    },[])

    useEffect(()=>{
        if (!isShowing){
           setIdAlumnoSeleccionado(null)        
        }
    },[isShowing]) // proceso algo cada vez que el modal se cierra
    

    function seleccionarAlumno(e,item){
        setIdAlumnoSeleccionado(item.id_alumno)
        toggle()
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscandoAlumnos){
        return <Main center><div><Loading/><span className="cargando">Buscando alumnos egresados...</span></div></Main>
    };

    return(
        <div>  
        { isShowing && idAlumnoSeleccionado && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
                    <AbmAlumno id_alumno={idAlumnoSeleccionado} 
                            esModal={true}
                    />    
        </Modal>}
           <Listado alumnos={alumnosInactivos} seleccionarAlumno={seleccionarAlumno}/>

        </div>
    )
}

function Listado({alumnos,seleccionarAlumno}){

    const copia = [...alumnos]
    const cant_alumnos_distintos = copia.sort((a,b)=>a.id_alumno-b.id_alumno).filter((item,index,vector)=>index==0 || item.id_alumno!=vector[index-1].id_alumno)

    return (
    <div>
        <span className="color-63 mb-2 text-small inline-block-1 text-right">{cant_alumnos_distintos.length} bajas encontradas en el cuatrimestre activo</span>
        {alumnos
            .map((item,index,vector)=>
            <div onClick={(e)=>{seleccionarAlumno(e,item)}} className="listado-al color-63" key={`alin-${item.id_alumno}`}>
                {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                
                {(index == 0 || item.id_alumno!=vector[index-1].id_alumno) ? 
                 <div>
                     <div className="flex justify-center mt-2">
                        <FontAwesomeIcon className="mr-2" icon={faUser}/>
                        <span className="inline-block-1">{item.nombre}</span>
                    </div>
                    <div className="mt-2 mb-2">
                        <span className="color-gray text-smaller inline-block-1">{item.materia} {item.profesor}</span>
                        <span  className="color-gray text-smaller inline-block-1">{item.DiaHora}</span>
                        <p  className="color-gray text-smaller mt-2">Fecha de baja: <b>{item.fecha_baja}</b></p>
                    </div>
                </div>
             :
                <div className="mt-2 mb-2">
                    <span className="color-gray text-smaller inline-block-1">{item.materia} {item.profesor}</span>
                    <span  className="color-gray text-smaller inline-block-1">{item.DiaHora}</span>
                    <p  className="color-gray text-smaller mt-2">Fecha de baja: <b>{item.fecha_baja}</b></p>
                </div>
            
                }
               
             </div>
            )
        }
    </div>
    )
}
