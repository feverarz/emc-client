import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faPlusSquare, faEdit } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';

export default function BusquedaEgresados({finalizarSeleccion}){

    const [alumnosInactivos,setAlumnosInactivos]=useState([]);
    const [buscandoAlumnos,setBuscandoAlumnos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');

    useEffect(()=>{
       
        setBuscandoAlumnos(true)

        const buscarAlumnosInactivos = async ()=>{

           try{
                const {data}= await Axios.get('/api/alumnos/egresados')
        
                setAlumnosInactivos(data)
                setBuscandoAlumnos(false)
                hacerfocoEnPrimerInput("texto-busqueda")
            }catch(err){
                console.log(err.response.data)
                setBuscandoAlumnos(false)
                setHuboError(true)
            }
        }
        
        buscarAlumnosInactivos()
    },[])

    async function handleSubmit(e,alumno) {
        e.preventDefault();
        finalizarSeleccion(alumno.id_alumno,alumno.nombre,alumno.apellido,alumno.documento)
    }

    function limpiarFiltro(){
        setTextoBusqueda("")
        hacerfocoEnPrimerInput("texto-busqueda")
    }

    const handleInputChange = (e)=>{  // defino una función que va a escuchar los cambios que ocurren en los inputs. Agrego el listener con onChange
        //e.preventDefault()
        setTextoBusqueda(e.target.value)
    }

    function seleccionarAlumno(e,item){
        finalizarSeleccion(item.id_alumno,item.nombre,item.apellido,item.documento)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscandoAlumnos){
        return <Main center><div><Loading/><span className="cargando">Buscando alumnos egresados...</span></div></Main>
    };

    return(
        <>  
        <Formulario
            handleSubmit={handleSubmit}
            textoBusqueda={textoBusqueda}
            handleInputChange={handleInputChange}
            limpiarFiltro={limpiarFiltro}/>
           <Listado alumnos={alumnosInactivos} textoBusqueda={textoBusqueda} seleccionarAlumno={seleccionarAlumno}/>

        </>
    )
}

function Listado({alumnos,textoBusqueda,seleccionarAlumno}){

    const alumnosEncontrados = alumnos.filter(
        item=>item.alumno.toUpperCase().includes(textoBusqueda.toUpperCase())||
        item.documento.includes(textoBusqueda))

    return (
    <div>
        <span className="color-63 text-small inline-block absolute right-35">{alumnosEncontrados.length} alumnos encontrados</span>
        {alumnosEncontrados
            .map(item=>
            <div onClick={(e)=>{seleccionarAlumno(e,item)}} className="listado-al color-63" key={`alin-${item.id_alumno}`}>
                {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                <FontAwesomeIcon className="mr-2" icon={faUser}/>
                <span>{item.alumno}</span>
            </div>
            )
        }
    </div>
    )
}

function Formulario({handleSubmit,textoBusqueda,handleInputChange,limpiarFiltro}){
    return(
         <form onSubmit={handleSubmit}>
            {/* Tengo conectado el input email con el estado usuario.email a través del atributo value y del evento onChange */}
            <div className="flex flex-row">
            <FontAwesomeIcon className="mt-2 mr-2 razon-social" icon={faUser}/>
                
            <input value={textoBusqueda} 
                onChange={handleInputChange} 
                type="text" 
                name="busqueda" 
                id="texto-busqueda"
                title="Para buscar ingrese Nombre o Apellido o DNI"
                autoComplete="off"
                placeholder="Ingrese Nombre o Apellido o DNI" 
                className="Form__field"/>

                { textoBusqueda!="" && <button><FontAwesomeIcon 
                    className="color-tomato"
                    icon={faWindowClose} 
                    onClick={limpiarFiltro}/>
                </button>}
                
            </div>   
        </form>
      

    )
}