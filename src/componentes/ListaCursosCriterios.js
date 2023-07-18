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

export default function ListaCursosCriterios({id_prof, id_materia, nro_curso}){

    const [cursos,setCursos]=useState([]);
    const [buscandoCursos,setBuscandoCursos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const {cuatrimestreActivo} = useAlumno();

    useEffect(()=>{
       
        setBuscandoCursos(true)
        const url = id_prof ? `/api/cursos/profesor/${cuatrimestreActivo.id_cuatrimestre}/${id_prof}` : `/api/cursos/materia/${cuatrimestreActivo.id_cuatrimestre}/${id_materia}`
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

    function limpiarFiltro(){
        setTextoBusqueda("")
        hacerfocoEnPrimerInput("texto-busqueda")
    }

    const handleInputChange = (e)=>{  // defino una función que va a escuchar los cambios que ocurren en los inputs. Agrego el listener con onChange
        //e.preventDefault()
        setTextoBusqueda(e.target.value)
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
           {id_prof && cursos.length>0 && <ListadoProfesores cursos={cursos}/>}
           {id_materia && cursos.length>0 && <ListadoMaterias cursos={cursos}/>}
           {cursos.length==0 && <span className="text-white">No se encontraron más cursos</span>}
        </>
    )
}

function ListadoProfesores({cursos}){

    return (
    <div>
        {cursos
            .map(item=>
            <div className="text-black" key={`alin-${uuidv4()}`}>
                {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                {/*<FontAwesomeIcon className="mr-2" icon={faUser}/>*/}
                
                <Link disabled className="text-white" 
                                to={{
                                    pathname: `/curso/${item.nro_curso}`
                                }}> <div className="text-small mt-2"><span className="mr-2">{item.campo_auxiliar}</span><span className="mr-2">{item.DiaHora}</span><span className="mr-2">{item.comienzo} hs.</span><span>#{item.nro_curso}</span></div>
                </Link>
            </div>
            )
        }
    </div>
    )
}

function ListadoMaterias({cursos}){

    return (
    <div>
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
                
                <Link disabled className="text-white" 
                                to={{
                                    pathname: `/curso/${item.nro_curso}`
                                }}> <div className="text-small mt-2"><span className="mr-2">{item.DiaHora}</span><span className="mr-2">{item.comienzo} hs.</span><span className="mr-2">{item.nombre}</span><span>#{item.nro_curso}</span></div>
                </Link>
            </div>
            )
        }
    </div>
    )
}

