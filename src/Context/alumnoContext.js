import React, { useState, useRef, useMemo } from 'react';
import Axios from 'axios';
import useModal from '../hooks/useModal';

// Primero creo un contexto
const AlumnoContext = React.createContext();

// Segundo creo un Provider que es una función que recibe props y retorna un objeto value con
// propiedades y métodos y los pondrá a disposición de cualquier componente que quiera conectarse
// con este contexto 

export function AlumnoProvider(props){
    const [alumno,setAlumno] = useState({id:null,nombre:''});
    const [usuario,setUsuario] = useState(null);
    const [mensaje,setMensaje] = useState(null);
    const [cuatrimestreActivo,setCuatrimestreActivo]=useState(null);
    const [mostrarBusquedaAlumnos,setMostrarBusquedaAlumnos] = useState(false);
    const [contadorOperacionesGlobales,setContadorOperacionesGlobales] = useState(0);
    const [parametrosVistaCursos,setParametrosVistaCursos] = useState(null);
    const [parametrosVistaAlumnos,setParametrosVistaAlumnos] = useState();
    const [parametrosVistaUsuarios,setParametrosVistaUsuarios] = useState();
    const [alumnoObservacion,setAlumnoObservacion] = useState(null);
    const [ordenRefrescarAlumno,setOrdenRefrescarAlumno]= useState(0);
    const [idGrabarNotas,setIdGrabarNotas] = useState(0);
    const [paginacion,setPaginacion] = useState(null);

    function incrementarContadorOperacionesGlobales(id,nombre){
        setContadorOperacionesGlobales(contadorOperacionesGlobales+1)
    } 
    
    function cambiarAlumno(id,nombre){
        setAlumno({id:id,nombre:nombre})
    } 
    
    function setearUsuario(usuario){
        setUsuario(usuario)
    } 

    function reinicializarAlumno(){
        setAlumno({id:null,nombre:''})
    }

    function reinicializarMensaje(){
        setMensaje(null)
    }

    function cambiarMensaje(mensaje){
        setMensaje(mensaje)
    }

    function cambiarCuatrimestreActivo(cuatrimestre){
        setCuatrimestreActivo(cuatrimestre)
    }

    function habilitarBusquedaAlumnos(){
        setMostrarBusquedaAlumnos(true)
    }

    function desHabilitarBusquedaAlumnos(){
        setMostrarBusquedaAlumnos(false)
    }

    function cargarParametrosVistaCursos(parametros){
        setParametrosVistaCursos(parametros)
    }

    function cargarParametrosVistaAlumnos(parametros){
        setParametrosVistaAlumnos(parametros)
    }

    function cargarParametrosVistaUsuarios(parametros){
        setParametrosVistaUsuarios(parametros)
    }

    function cargarParametrosVistaUsuarios(parametros){
        setParametrosVistaUsuarios(parametros)
    }

    function agregarAlumnoObservacion(alumno){
        setAlumnoObservacion(alumno)
    } 

    function refrescarAlumno(){
        setOrdenRefrescarAlumno(Math.random())
    } 

    function actualizarNotas(){
        setIdGrabarNotas(Math.random())
    } 

    function cambiarPaginacion(ini,fin){
        setPaginacion({ini:ini,fin:fin})
    } 

    function borrarPaginacionMemorizada(){
        setPaginacion(null)
    } 

    function actualizarNotas(){
        setIdGrabarNotas(Math.random())
    } 

    function CabeceraCurso(curso){
        return <div> 
             <div className="curso-cab border-bottom-solid-light mt-2 mb-4">  
                <p className="ml-2" title={curso.Materia}><span className="text-smaller color-gray mr-2">Materia:</span>{`${curso.Materia} (${curso.cod_materia})`} <span className='ml-4'>{curso.aula}</span> <span className={`ml-4 ${curso.virtual? 'a-virtual':'a-presc'}`}>{curso.virtual? 'Virtual' : 'Presencial'}</span></p>
                
                {curso.inscriptos && curso.Disponibilidad && <>
                <span className="ml-2"><span className="text-smaller color-gray mr-2">Inscriptos:</span>{curso.inscriptos}</span>
                
                <span className="text-smaller color-gray ml-2">Disponible:</span>
                {
                    !curso ? <span className='dispo-1 disponible wh-4'>?</span>
                    : <span className={curso.Disponibilidad>0 ? 'wh-4 ml-2' : 'ml-2 wh-4'}>{curso.Disponibilidad}</span>
                }
                </>}
                {curso.cursoNoVigente && <span className="error_formulario absolute right-10 top-45 bg-white blink p-2">Curso no vigente. Corresponde al {curso.cuatrimestre}</span>}
                <span className="ml-2"><span className="text-smaller color-gray mr-2">Profesor:</span>{curso.Profesor}</span>
                <span className="ml-2"><span className="text-smaller color-gray mr-2">Día:</span>{curso.DiaHora}</span>
                <div className="div-tc">
                    <span className="color-gray">{curso.grupal ? 'Curso Grupal' : 'Curso Individual' }</span>  
                    <span className="ml-2 color-gray">{curso.mesa_examen ? 'Recuperatorio' : 'Regular' }</span>      
                </div>
            </div>
        </div>
    }

    function reinicializarParametrosVistas(){
        setParametrosVistaAlumnos(null)
        setParametrosVistaCursos(null)
        setParametrosVistaUsuarios(null)
    } 

    const value = useMemo(()=>{
        return (
            {   alumno,
                cambiarAlumno,
                reinicializarAlumno,
                mensaje,
                cambiarMensaje,
                reinicializarMensaje,
                cuatrimestreActivo, 
                cambiarCuatrimestreActivo,
                mostrarBusquedaAlumnos,
                desHabilitarBusquedaAlumnos,
                habilitarBusquedaAlumnos,
                incrementarContadorOperacionesGlobales,
                contadorOperacionesGlobales,setearUsuario,usuario,
                cargarParametrosVistaCursos,parametrosVistaCursos,
                cargarParametrosVistaUsuarios,parametrosVistaUsuarios,
                cargarParametrosVistaAlumnos,parametrosVistaAlumnos,
                alumnoObservacion, agregarAlumnoObservacion,
                ordenRefrescarAlumno,refrescarAlumno,actualizarNotas,idGrabarNotas,
                cambiarPaginacion,borrarPaginacionMemorizada,paginacion,
                reinicializarParametrosVistas,CabeceraCurso}
        )
    },[alumno,
        usuario,
        mensaje,
        cuatrimestreActivo,
        mostrarBusquedaAlumnos,
        contadorOperacionesGlobales,
        parametrosVistaCursos,
        parametrosVistaAlumnos,
        parametrosVistaUsuarios,
        alumnoObservacion,ordenRefrescarAlumno,idGrabarNotas,paginacion]) // usamos useMemo para decirle que retorne siempre el mismo objeto 
                // a menos que cambie la propiedad alumno o mensaje. Si alumno o el mensaje
                // cambia vuelve a crear el objeto value.

    return <AlumnoContext.Provider value={value} {...props}/>
}

// Para que los componentes puedan consumir este contexto hay que exportar un hook
// para que se importe

export function useAlumno(){ // este hook lo va a usar el comonente que desee consumir este contexto
    const context = React.useContext(AlumnoContext)

    if (!context){
        throw new Error("useAlumno debe estar dentro del proveedor AlumnoContext")
    } // Si utilizamos este hook en un componente que no esté conectado con el contexto
      // sea el mismo o alguno de sus padres. Es decir que el contexto debe envolver a la 
      // rama que va a usar el mismo.
      return context; // aqui retornamos para el consumidor el objeto value
}