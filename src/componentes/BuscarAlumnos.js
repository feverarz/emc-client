import React, { useState, useEffect } from 'react';
import Main from '../componentes/Main';
import DatosAlumno from './DatosAlumno';
import {useAlumno} from '../Context/alumnoContext';
import Axios from 'axios';
import useModal from '../hooks/useModal';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faCameraRetro, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { faWindowClose, faUser, faPlusSquare, faEdit } from '@fortawesome/free-regular-svg-icons';
import AbmAlumno from '../abms/abm-alumno';
import Loading from '../componentes/Loading';
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import Busqueda from './Busqueda'

export default function BuscarAlumnos(){

    // la interface del usuario depende del estado, en este caso consiste solo de un objeto usuario. Cada vez que cambia el estado se vuelve a renderizar la interface
const [alumnos,setAlumnos] = useState([]);    
const [recientes,setRecientes] = useState([]);    
const [textoBusqueda,setTextoBusqueda]=useState('');
const {toggle, isShowing } = useModal();
const {alumno, cambiarAlumno,reinicializarAlumno, mostrarBusquedaAlumnos} = useAlumno();
const [editarFicha,setEditarFicha]=useState(false);
const [nuevoAlumno,setNuevoAlumno]=useState(false);
const [contadorOperaciones,setContadorOperaciones]=useState(0);
const [alumnosInactivos,setAlumnosInactivos]=useState([]);
const [buscandoAlumnos,setBuscandoAlumnos]=useState(false)
const [huboError,setHuboError]=useState(false)
const anchoPaginacion = 50;
const [iIni, setIini]=useState(0)
const [iFin, setIfin]=useState(anchoPaginacion-1)
/*
useEffect(()=>{

    async function buscarAlumnos(){

        try{
            const {data} = await Axios.get('/api/alumnos');
            setsetAlumnos(data)
        }catch(error){
            console.log(error)
        }
    }
    buscarAlumnos();
},[contadorOperaciones])
*/

useEffect(()=>{

    async function buscarAlumnos(){

        try{
            setBuscandoAlumnos(true)
            const vectorResultado = await Promise.all([Axios.get(`/api/alumnos/all/0`),
                                                       Axios.get('/api/alumnos/altasrecientes')]);
            setAlumnos(vectorResultado[0].data)

            setRecientes(vectorResultado[1].data)

            setBuscandoAlumnos(false)

        }catch(error){
            setBuscandoAlumnos(false)
            setHuboError(true)
            console.log(error)
        }
    }
    buscarAlumnos();
},[contadorOperaciones])

useEffect(()=>{
    if (!isShowing){
        if (nuevoAlumno){ // si se cierra el modal sin grabar un nuevo alumno 
            setNuevoAlumno(false)
        }            
    }
},[isShowing]) // proceso algo cada vez que el modal se cierra

useEffect(()=>{
   
    definirValoresPaginacion(alumnos,setIini,setIfin,anchoPaginacion)

},[alumnos])

const paginar = (ini,fin)=>{
    setIini(ini)
    setIfin(fin)
}

    const handleInputChange = (e)=>{  // defino una función que va a escuchar los cambios que ocurren en los inputs. Agrego el listener con onChange
        setTextoBusqueda(e.target.value)
    }

    async function handleSubmit(e) {
        e.preventDefault();
      }

      function limpiarFiltro(){
          setTextoBusqueda("")
      }

      function ampliarBusqueda(){
            toggle()
      }

      function seleccionarAlumno(id,alumno,nombre,apellido,documento){
        cambiarAlumno(id,alumno,nombre,apellido,documento)
        setTextoBusqueda("")
        if (isShowing){
            toggle()
        }
    }      

    const finalizarModificacionFichaAlumno = (alta,id_nuevo_alumno, nombre)=>{
        
        if (alta){
            cambiarAlumno(id_nuevo_alumno,nombre)
        }
        setNuevoAlumno(false)
        toggle()
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscandoAlumnos){
        return <div className="ap-2 flex f-row"><div><Loading blanco={true}/><span className="cargando">Buscando alumnos...</span></div></div>
    };

       // buscar-al datos-alumno esp-lateral
    return ( 
    <div className={ mostrarBusquedaAlumnos && !alumno.id ? "ap-2" : 'hidden'}> 

         { isShowing && !nuevoAlumno && <Modal hide={toggle} isShowing={isShowing} titulo="Listado de alumnos inactivos">
                            <Busqueda finalizarSeleccion={seleccionarAlumno}/>
                        </Modal>}

         { isShowing && nuevoAlumno && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#fdedcf'}}>
            <AbmAlumno id_alumno={null} 
                       finalizarAltaOcopia={finalizarModificacionFichaAlumno}
                       esModal={true}
            />    
        </Modal>}                        
        <div className="Signup mt-2 ">
            <div className="flex f-col">
                <div className="relative">
                    {!alumno.id && !nuevoAlumno && <form onSubmit={handleSubmit}>
                        {/* Tengo conectado el input email con el estado usuario.email a través del atributo value y del evento onChange */}
                        <div className="flex flex-row">

                        { textoBusqueda!="" && <button><FontAwesomeIcon 
                                className="ic-abm"
                                icon={faWindowClose} 
                                onClick={limpiarFiltro}/>
                            </button>}

                        <FontAwesomeIcon className="ml-2 mt-2 mr-2" icon={faUser}/>
                            
                        <input value={textoBusqueda} 
                            onChange={handleInputChange} 
                            type="text" 
                            name="busqueda" 
                            title="Para buscar ingrese Nombre o Apellido o DNI"
                            autoComplete="off"
                            placeholder="Buscar un alumno" 
                            className="Form__field"/>

                            
                            
                        </div>   
                    </form>} 
                    {/*!nuevoAlumno && !alumno.id && textoBusqueda=='' &&
                    <div className="absolute nuevo-alumno flex f-col">
                        <span title="Crear un nuevo alumno" onClick={()=>{setNuevoAlumno(true);toggle()}} className="cursor-pointer color-63 text-small mt-2 mb-2" >
                            <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo alumno
                        </span>
                        <Recientes recientes={recientes} seleccionarAlumno={seleccionarAlumno}/>
                    </div>*/}
                </div>
                {alumno.id && <DetalleAlumno 
                              alumno={alumno} 
                              reinicializarAlumno={reinicializarAlumno}
                              editarFicha={editarFicha}
                              setEditarFicha={setEditarFicha}
                              />}
                {textoBusqueda!="" && !alumno.id && 
                        <Listado alumnos={alumnos} 
                                    textoBusqueda={textoBusqueda}
                                    ampliarBusqueda = {ampliarBusqueda}
                                    seleccionarAlumno= {seleccionarAlumno}
                                    anchoPaginacion={anchoPaginacion}/>
               }
            </div>
        </div>
            {/*nuevoAlumno && <AbmAlumno id_alumno = {null} finalizarAltaOcopia={finalizarModificacionFichaAlumno}/>*/}                 
    </div>
    )
}

function Listado({alumnos,textoBusqueda,ampliarBusqueda,seleccionarAlumno,anchoPaginacion}){
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
        
    return (
    <div>
        <span className="color-63 text-small inline-block absolute right-35">{alumnosEncontrados.length} alumnos encontrados</span>
        <div className="flex f-col ml-2">
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={alumnosEncontrados.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>
        {/*<div>
            <button className="texto-acciones-menu" title="Abrir búsqueda de alumnos inactivos" onClick={ampliarBusqueda}>
                <FontAwesomeIcon className="ic-abm" icon={faPlusSquare}/> Buscar alumnos inactivos
            </button>
        </div>*/}
        {alumnosEncontrados
            .filter((item,index)=>{
                return index>= iIni && index<=iFin
            })
            .map(item=>
            <div onClick={()=>{seleccionarAlumno(item.id_alumno,item.alumno,item.nombre,item.apellido,item.documento)}} className="listado-al" key={item.id_alumno}>
                {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                <FontAwesomeIcon className="mr-2" icon={faUser}/>
                <span>{item.alumno}</span>
            </div>
            )
        }
    </div>
    )
}

function DetalleAlumno({alumno, reinicializarAlumno, editarFicha,setEditarFicha}){
    return (
        <>
    <div>
        <div className="">
            <div className="flex f-row jcc-ais">
                <FontAwesomeIcon icon={faUser}/>
                <div className="flex f-col">
                    <span className="inline-block ml-2">El alumno seleccionado es {alumno.nombre} (#{alumno.id})</span>
                    {/* !editarFicha && <span title="Editar la ficha del alumno" onClick={()=>setEditarFicha(true)} className="cursor-pointer cabecera editarFicha" >
                        <FontAwesomeIcon className="cursor-copy" icon={faEdit}/> Editar ficha
                    </span>*/}
                </div>

                <button><FontAwesomeIcon 
                    icon={faWindowClose} 
                    onClick={()=>reinicializarAlumno()}/>
                </button>
            </div>                        
        </div>
    </div>
    {/*<DatosAlumno id={alumno.id} editarFicha={editarFicha} setEditarFicha={setEditarFicha}/>*/}
    </>
    )
}

function Recientes({recientes,seleccionarAlumno}){
    return <div className="cabecera ml-4 recientes flex flex-wrap mt-2"><span className="ct-ss" title="Ultimos alumnos creados">Recientes</span> 
        {recientes.map(item=>
            <span key={`alrec-${item.id_alumno}`}
            onClick={()=>seleccionarAlumno(item.id_alumno,item.alumno,item.nombre,item.apellido,item.documento)} 
            className="ultimos-cursos text-small"
            title={`${item.alumno}\nDNI ${item.documento}`}>
                {item.id_alumno}
            </span>)}
    </div>
}

function AlumnosInactivos({funcionBusqueda}){
    return (
        <>
         <p className="mt-4">Por default la búsqueda se limita a los alumnos activos</p>
         <p className="mt-4">Se incluirán en esta ventana un listado de todos los alumnos inactivos</p>
        </>
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