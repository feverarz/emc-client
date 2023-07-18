import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faPlusSquare, faEdit } from '@fortawesome/free-regular-svg-icons';
import {faAngleRight,faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import { text } from '@fortawesome/fontawesome-svg-core';

export default function Busqueda({finalizarSeleccion}){

    const anchoPaginacion = 50;

    const [alumnosInactivos,setAlumnosInactivos]=useState([]);
    const [buscandoAlumnos,setBuscandoAlumnos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    

    useEffect(()=>{
       
        setBuscandoAlumnos(true)

        const buscarAlumnosInactivos = async ()=>{

           try{
                const {data}= await Axios.get('/api/alumnos/inactivos')
        
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
        return <Main center><div><Loading/><span className="cargando">Buscando alumnos inactivos...</span></div></Main>
    };

    return(
        <>  
        <Formulario
            handleSubmit={handleSubmit}
            textoBusqueda={textoBusqueda}
            handleInputChange={handleInputChange}
            limpiarFiltro={limpiarFiltro}/>
           {/*textoBusqueda!='' && <Listado alumnos={alumnosInactivos} textoBusqueda={textoBusqueda} seleccionarAlumno={seleccionarAlumno}/>*/}
           <Listado alumnos={alumnosInactivos} 
                    textoBusqueda={textoBusqueda} 
                    seleccionarAlumno={seleccionarAlumno}
                    anchoPaginacion={anchoPaginacion}/>
        </>
    )
}

function Listado({alumnos,textoBusqueda,seleccionarAlumno,anchoPaginacion}){
    const [iIni, setIini]=useState(0)
    const [iFin, setIfin]=useState(anchoPaginacion-1)
    const [alumnosEncontrados,setAlumnosEncontrados]=useState([])

    const paginar = (ini,fin)=>{
        setIini(ini)
        setIfin(fin)
    }
    
    useEffect(()=>{
        const vector_aux = alumnos.filter(
            item=>item.alumno.toUpperCase().includes(textoBusqueda.toUpperCase())||
            item.documento.includes(textoBusqueda))
    
            setAlumnosEncontrados(vector_aux)
    },[textoBusqueda])
  

    useEffect(()=>{
   
        definirValoresPaginacion(alumnosEncontrados,setIini,setIfin,anchoPaginacion)

    },[alumnosEncontrados])

        //  definirValoresPaginacion(alumnosEncontrados,setIini,setIfin,anchoPaginacion)

    return (
    <div>
        <span className="color-63 text-small inline-block absolute right-35">{alumnosEncontrados.length} alumnos encontrados</span>
        <div className="flex f-col">
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={alumnosEncontrados.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>
        {alumnosEncontrados
           .map((item,index)=>{return {...item,indice:index+1}})
           .filter((item,index)=>{
               return index>= iIni && index<=iFin
           })
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

function definirValoresPaginacion(vector,setinicial,setfinal,anchoPaginacion){

    const longitud = vector.length;

    if (longitud>anchoPaginacion){
        setinicial(0);
        setfinal(anchoPaginacion-1)
    }else{
        setinicial(0);
        setfinal(longitud-1)
    }

}

function Paginacion({longitud,iIni,iFin,paginar,anchoPaginacion}){

    let imas, fmas,imenos, fmenos;

    let mostrar=true;
    let mostrarMenos = true;
    let mostrarMas = true;

    const hayMasParaMostrar = (longitud - 1) - iFin;
    const hayMenosParaMostrar = iIni;

    if (longitud<anchoPaginacion){
        mostrar=false
    }{
       if (hayMasParaMostrar==0){
            mostrarMas=false
       } 
       else if (hayMasParaMostrar<=anchoPaginacion){
            fmas = iFin + hayMasParaMostrar;
            imas = iFin + 1;
       }else if (hayMasParaMostrar>anchoPaginacion){
            fmas = iFin + anchoPaginacion;
            imas = iFin + 1;
       }

        if (hayMenosParaMostrar==0){
                mostrarMenos=false
        } 
        else if (hayMenosParaMostrar<=anchoPaginacion){
                fmenos = iIni - 1;
                imenos = 0;
        }else if (hayMenosParaMostrar>anchoPaginacion){
                fmenos = iIni - 1;
                imenos = iIni - anchoPaginacion;
        }
    }

    return <div>
        {mostrar && mostrarMenos && 
            <span   title={`${imenos+1}-${fmenos+1}`} 
                    className="cursor-pointer ml-2 mr-2" 
                    onClick={()=>paginar(imenos,fmenos)}>
                        <FontAwesomeIcon icon={faAngleLeft}/>
            </span>}
        <span>{iIni+1} - {iFin+1}</span>
        {mostrar && mostrarMas && 
            <span title={`${imas+1}-${fmas+1}`} 
                    className="cursor-pointer ml-2" 
                    onClick={()=>paginar(imas,fmas)}>
                           <FontAwesomeIcon icon={faAngleRight}/>
            </span>}
</div>
}