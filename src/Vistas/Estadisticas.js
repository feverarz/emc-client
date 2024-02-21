import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link,useParams } from 'react-router-dom';
import Loading from '../componentes/Loading';
import {useAlumno} from '../Context/alumnoContext';
import AbmCurso from '../abms/abm-curso';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle,faWindowClose,faEdit,faCopy, faCircle, faPlusSquare,faDotCircle,faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons';
import { faMale, faFemale, faTrash, faSync,faEquals, faGreaterThanEqual,faEnvelopeSquare, faListOl, faMailBulk,faUserCheck,faEnvelope } from '@fortawesome/free-solid-svg-icons';
import AbmProfesor from '../abms/abm-profesor'
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import { useRef } from 'react';

const descripciones = [
'Buscando materias...',
'Buscando profesores...',
'Calculando total de alumnos inscriptos...',
'Calculando inscriptos por sexo masculino...',
'Calculando inscriptos por sexo femenino...',
'Calculando total de materias dictadas...',
'Calculando total de cursos abiertos...',
'Calculando total de profesores activos...',
'Calculando estadísticas generales...',
'Calculando estadísticas por país...',
'Calculando estadísticas por provincia...',
'Calculando estadísticas por cursada virtual...',
'Calculando estadísticas por cursada presencial...',
'Calculando estadísticas por cursadas mixtas...']

       
export default function Estadisticas({match,history}){
    const [cursos,setCursos] = useState([])
    const [cursosAmostrar,setCursosAmostrar]=useState([])
    const {toggle, isShowing } = useModal();
    const [profesores, setProfesores ] = useState([]);
    const [cuatrimestres, setCuatrimestres ] = useState([]);
    const [materias, setMaterias ] = useState([]);
    const [cuatrimestreSeleccionado,setCuatrimestreSeleccionado]=useState(-1)
    const [materiaSeleccionadaCursos,setMateriaSeleccionadaCursos]=useState(-1)
    const [materiaSeleccionadaProfesores,setMateriaSeleccionadaProfesores]=useState(-1)
    const [materiaSeleccionadaAlumnos,setMateriaSeleccionadaAlumnos]=useState(-1)
    const [profesorSeleccionadoAlumnos,setProfesorSeleccionadoAlumnos]=useState(-1)
    const [profesorSeleccionadoCursos,setProfesorSeleccionadoCursos]=useState(-1)
    const [profesorSeleccionadoMaterias,setProfesorSeleccionadoMaterias]=useState(-1)
    const [cargandoCursos,setCargandoCursos] = useState(false);
    const [cargandoEstadisticas,setCargandoEstadisticas] = useState(true);
    const {cuatrimestreActivo,desHabilitarBusquedaAlumnos} = useAlumno();
    const [globalInscriptos,setGlobalInscriptos] = useState(0);
    const [globalInscriptosModo,setGlobalInscriptosModo] = useState({});
    const [globalInscriptosM,setGlobalInscriptosM] = useState(0);
    const [globalInscriptosF,setGlobalInscriptosF] = useState(0);
    const [globalMaterias,setGlobalMaterias] = useState(0);
    const [globalCursos,setGlobalCursos] = useState(0);
    const [globalProfesores,setGlobalProfesores] = useState(0);
    const [profesorCursos,setProfesorCursos]= useState(0);
    const [profesorMaterias,setProfesorMaterias]= useState(0);
    const [profesorAlumnos,setProfesorAlumnos]= useState(0);
    const [materiaCursos,setMateriaCursos]= useState(0);
    const [materiaProfesores,setMateriaProfesores]= useState(0);
    const [materiaAlumnos,setMateriaAlumnos]= useState(0);
    const [inscripciones,setInscripciones]= useState([]);
    const [alumnosPais,setAlumnosPais]= useState([]);
    const [pais, setPais]= useState(1);
    const [alumnosProvincia,setAlumnosProvincia]=useState([])
    const [descripcionLoading,setDescripcionLoading]=useState('')
    const [arrayDescripciones,setArrayDescripciones]=useState([])
    const refIndiceLoading = useRef(0)
    const descripcionRef = useRef('')
    let parametros = useParams();

    useEffect(()=>{
    
    desHabilitarBusquedaAlumnos();    
    const buscarCursos = async ()=>{

        setCargandoCursos(true)
        try{          
           
            const vectorResultado = await Promise.all([
                Axios.get('/api/tablasgenerales/materias'),
                Axios.get('/api/tablasgenerales/profesores'),
                Axios.get('/api/tablasgenerales/cuatrimestres'),
            ])

            setMaterias(vectorResultado[0].data.filter(item=>item.activa==1))
            setProfesores(vectorResultado[1].data.filter(item=>item.activo==1))
            setCuatrimestres(vectorResultado[2].data)
           // setCargandoCursos(false)
        }catch(err){
            console.log(err)
            setCargandoCursos(false)
        }
    }
        setCuatrimestreSeleccionado(cuatrimestreActivo.id_cuatrimestre)
        buscarCursos()
    },[])

    useEffect(()=>{
        if(cuatrimestreSeleccionado>0){
            activarLoadingDescriptivo()
            buscarDatosGlobales()
            setPais(1)
        }
    },[cuatrimestreSeleccionado])  

useEffect(()=>{

    // hacemos este effect para lograr que las tablas se muestren al mismo tiempo
    // si alguna esta vacía mostramos un loader

    if(alumnosPais.length==0 || alumnosProvincia.length==0 || inscripciones.length==0){
        setCargandoEstadisticas(true)
    }else{
        setCargandoEstadisticas(false)
    }

    if(alumnosPais.length==0 && alumnosProvincia.length==0 && inscripciones.length==0){
        setCargandoEstadisticas(false)
    }

}, [alumnosPais,alumnosProvincia,inscripciones])

useEffect(()=>{
    buscarAlumnosProvinciasPais()
},[alumnosPais])

useEffect(()=>{
        buscarProfesorCursos()
    
},[profesorSeleccionadoCursos,cuatrimestreSeleccionado])    

useEffect(()=>{
    buscarProfesorMaterias()
},[profesorSeleccionadoMaterias,cuatrimestreSeleccionado])   

useEffect(()=>{
    buscarProfesorAlumnos()
},[profesorSeleccionadoAlumnos,cuatrimestreSeleccionado])   

useEffect(()=>{
    buscarMateriaAlumnos()
},[materiaSeleccionadaAlumnos,cuatrimestreSeleccionado])   

useEffect(()=>{
    buscarMateriaCursos()
},[materiaSeleccionadaCursos,cuatrimestreSeleccionado])   

useEffect(()=>{
    buscarMateriaProfesores()
},[materiaSeleccionadaProfesores,cuatrimestreSeleccionado])   

useEffect(()=>{
        buscarAlumnosProvinciasPais()
},[pais])


useEffect(()=>{
    let timeout

    if(cargandoCursos || cargandoEstadisticas){
        refIndiceLoading.current = refIndiceLoading.current > descripciones.length -1 ? 0 : refIndiceLoading.current + 1

        timeout = setTimeout(() => {
            setDescripcionLoading(descripciones[refIndiceLoading.current])
        }, 1000);
    }

    return () => clearTimeout(timeout);

},[descripcionLoading])

const activarLoadingDescriptivo = ()=>{
    refIndiceLoading.current = 0
    setDescripcionLoading('Iniciando cálculos...')
}

const buscarDatosGlobales = async ()=>{

    try{          
        setCargandoCursos(true)

        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/contar/inscriptosall/${cuatrimestreSeleccionado}`),
            Axios.get(`api/tablasgenerales/estadisticas/contar/inscriptossexo/${cuatrimestreSeleccionado}/M`),
            Axios.get(`api/tablasgenerales/estadisticas/contar/inscriptossexo/${cuatrimestreSeleccionado}/F`),
            Axios.get(`api/tablasgenerales/estadisticas/contar/materias/${cuatrimestreSeleccionado}`),
            Axios.get(`api/tablasgenerales/estadisticas/contar/cursos/${cuatrimestreSeleccionado}`),
            Axios.get(`api/tablasgenerales/estadisticas/contar/profesores/${cuatrimestreSeleccionado}`),
            Axios.get(`api/tablasgenerales/estadisticas/inscripciones/${cuatrimestreSeleccionado}`),
            Axios.get(`api/tablasgenerales/estadisticas/alumnospais/${cuatrimestreSeleccionado}`),
            Axios.get(`api/tablasgenerales/estadisticas/inscripcionesmodo/${cuatrimestreSeleccionado}`)
        ])

        setGlobalInscriptos(vectorResultado[0].data)
        setGlobalInscriptosM(vectorResultado[1].data)
        setGlobalInscriptosF(vectorResultado[2].data)
        setGlobalMaterias(vectorResultado[3].data)
        setGlobalCursos(vectorResultado[4].data)
        setGlobalProfesores(vectorResultado[5].data)
        setInscripciones(vectorResultado[6].data)
        setAlumnosPais(vectorResultado[7].data)
        setGlobalInscriptosModo(vectorResultado[8].data)
        
        setCargandoCursos(false)

    }catch(err){
        console.log(err)
        setCargandoCursos(false)

    }
}

const buscarAlumnosProvinciasPais = async ()=>{

    try{          
           
        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/alumnosprovincia/${cuatrimestreSeleccionado}/${pais}`)
        ])

        setAlumnosProvincia(vectorResultado[0].data)

    }catch(err){
        console.log(err)
    }
}

const buscarMateriaProfesores = async ()=>{

    try{          
           
        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/materia/profesores/${cuatrimestreSeleccionado}/${materiaSeleccionadaProfesores}`)
        ])

        setMateriaProfesores(vectorResultado[0].data)

    }catch(err){
        console.log(err)
    }
}

const buscarMateriaCursos = async ()=>{

    try{          
           
        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/materia/cursos/${cuatrimestreSeleccionado}/${materiaSeleccionadaCursos}`)
        ])

        setMateriaCursos(vectorResultado[0].data)

    }catch(err){
        console.log(err)
    }
}

const buscarMateriaAlumnos = async ()=>{

    try{          
           
        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/materia/alumnos/${cuatrimestreSeleccionado}/${materiaSeleccionadaAlumnos}`)
        ])

        setMateriaAlumnos(vectorResultado[0].data)

    }catch(err){
        console.log(err)
    }
}

const buscarProfesorMaterias = async ()=>{

    try{          
           
        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/profesor/materias/${cuatrimestreSeleccionado}/${profesorSeleccionadoMaterias}`)
        ])

        setProfesorMaterias(vectorResultado[0].data)

    }catch(err){
        console.log(err)
    }
}

const buscarProfesorCursos = async ()=>{

    try{          
           
        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/profesor/cursos/${cuatrimestreSeleccionado}/${profesorSeleccionadoCursos}`)
        ])

        setProfesorCursos(vectorResultado[0].data)

    }catch(err){
        console.log(err)
    }
}

const buscarProfesorAlumnos = async ()=>{

    try{          
           
        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/profesor/alumnos/${cuatrimestreSeleccionado}/${profesorSeleccionadoAlumnos}`)
        ])

        setProfesorAlumnos(vectorResultado[0].data)

    }catch(err){
        console.log(err)
    }
}

const handleChangeCuatrimestre = (e)=>{
    setCuatrimestreSeleccionado(e.target.value)
}

const cambiarPais = (id_pais)=>{
    setPais(id_pais)
}

const handleChangeMateria = (e)=>{

    switch(e.target.name){
        case 'cursos':
            setMateriaSeleccionadaCursos(e.target.value)
            break;
        case 'alumnos':
            setMateriaSeleccionadaAlumnos(e.target.value)
            break;     
        case 'profesores':
            setMateriaSeleccionadaProfesores(e.target.value)
        break;                  
    }
}

const handleChangeProfesor = (e)=>{

    switch(e.target.name){
        case 'cursos':
            setProfesorSeleccionadoCursos(e.target.value)
            break;
        case 'alumnos':
            setProfesorSeleccionadoAlumnos(e.target.value)
            break;     
        case 'materias':
            setProfesorSeleccionadoMaterias(e.target.value)
        break;                  
    }
}



    if (cargandoCursos || cargandoEstadisticas ){
        return <Main center><Loading/><span className="cargando text-larger">{descripcionLoading}</span></Main>
      };
    
      //`/curso/${curso.nro_curso}`
    return <Main center>
        <div>
         <div className="flex f-row justify-content-center">
             <span className="crono-titulo">Período </span>
             <SeleccionCuatrimestre cuatrimestres={cuatrimestres} cuatrimestreSeleccionado={cuatrimestreSeleccionado} handleChangeCuatrimestre={handleChangeCuatrimestre}/>
        </div>
        <div className="flex f-row justify-content-center">    
            <EstadisticasIzquierda
                        globalInscriptosModo = {globalInscriptosModo}
                        globalInscriptos = {globalInscriptos}
                        globalInscriptosM = {globalInscriptosM}
                        globalInscriptosF = {globalInscriptosF}
                        globalMaterias = {globalMaterias}
                        globalProfesores = {globalProfesores}
                        globalCursos = {globalCursos}
                        materiaCursos = {materiaCursos}
                        materiaProfesores = {materiaProfesores}
                        materiaAlumnos = {materiaAlumnos}
                        profesorMaterias = {profesorMaterias}
                        profesorCursos = {profesorCursos}
                        profesorAlumnos = {profesorAlumnos}
                        profesores = {profesores}
                        profesorSeleccionadoAlumnos = {profesorSeleccionadoAlumnos}
                        handleChangeProfesor = {handleChangeProfesor}
                        profesorSeleccionadoCursos = {profesorSeleccionadoCursos}
                        handleChangeProfesor = {handleChangeProfesor}
                        profesorSeleccionadoMaterias = {profesorSeleccionadoMaterias}
                        handleChangeMateria = {handleChangeMateria}
                        materiaSeleccionadaAlumnos = {materiaSeleccionadaAlumnos}
                        materias = {materias}
                        materiaSeleccionadaProfesores = {materiaSeleccionadaProfesores}
                        materiaSeleccionadaCursos = {materiaSeleccionadaCursos}
            
            />
            {cargandoEstadisticas && <Loading/>}
            { !cargandoEstadisticas && <>
            <EstadisticasCentro inscripciones={inscripciones}/>
            <EstadisticasDerecha inscripciones={inscripciones} alumnosPais={alumnosPais} alumnosProvincia={alumnosProvincia} onchangePais={cambiarPais}/>
            </>}        
        </div>    

     </div>
</Main>
}

function SeleccionCuatrimestre({cuatrimestreSeleccionado,cuatrimestres,handleChangeCuatrimestre}){

    return <select value={cuatrimestreSeleccionado} onChange={(e)=>handleChangeCuatrimestre(e)}>
        {cuatrimestres.map(item=><option key={`dia-${item.id_cuatrimestre}`} value={item.id_cuatrimestre}>{item.nombre}</option>)}
    </select>
}

function SeleccionMateria({valor,vector,handleChange,nombre}){

    return <select name={nombre} value={valor} onChange={(e)=>handleChange(e)}>
        <option value="-1">Seleccionar materia</option>
        {vector.map(item=><option key={`dia-${item.id_materia}`} value={item.id_materia}>{item.descripcion}</option>)}
    </select>
}

function SeleccionProfesor({valor,vector,handleChange,nombre}){

    return <select name={nombre} value={valor} onChange={(e)=>handleChange(e)}>
        <option value="-1">Seleccionar profesor</option>
        {vector.map(item=><option key={`dia-${item.id_prof}`} value={item.id_prof}>{item.descripcion}</option>)}
    </select>
}

function EstadisticasIzquierda({
            globalInscriptosModo,
            globalInscriptos,
            globalInscriptosM,
            globalInscriptosF,
            globalMaterias,
            globalProfesores,
            globalCursos,
            materiaCursos,
            materiaProfesores,
            materiaAlumnos,
            profesorMaterias,
            profesorCursos,
            profesorAlumnos,
            profesores,
            profesorSeleccionadoAlumnos,
            handleChangeProfesor,
            profesorSeleccionadoCursos,
            profesorSeleccionadoMaterias,
            handleChangeMateria,
            materiaSeleccionadaAlumnos,
            materias,
            materiaSeleccionadaProfesores,
            materiaSeleccionadaCursos
}){
    return  <div className="flex f-col items-center p-2 ml-2 mr-2">
        <span className="mb-2 cabecera color-63 border-bottom-solid-light">Datos globales</span>
        
    <table>
        <tbody>
        <tr>
            <td>
                Total de alumnos inscriptos
            </td>
            <td className="text-center">
             
            {globalInscriptos} 
            </td>
        </tr>
        <tr>
            <td>
            <span className='ml-4'>Hombres</span>
            </td>
            <td className="text-center">
             
            {globalInscriptosM}
            </td>
        </tr>
        <tr>
            <td>
            <span className='ml-4'>Mujeres</span>
            </td>
            <td className="text-center">
             
            {globalInscriptosF}
            </td>
        </tr>
        <tr>
            <td>
            <span className='ml-4'>Cursando solo virtual</span>
            </td>
            <td className="text-center">
             
            {globalInscriptosModo.virtual}
            </td>
        </tr>
        <tr>
            <td>
                <span className='ml-4'>Cursando solo presencial</span>
            </td>
            <td className="text-center">
             
            {globalInscriptosModo.presencial}
            </td>
        </tr>
        <tr>
            <td>
                <span className='ml-4'>Cursando presencial y virtual</span> 
            </td>
            <td className="text-center">
             
            {globalInscriptosModo.mixto}
            </td>
        </tr>
        <tr>
            <td>
                Total de materias dictadas
            </td>
            <td className="text-center">
            {globalMaterias}
            </td>
        </tr>
        <tr>
            <td>
                Total de profesores
            </td>
            <td className="text-center">
            {globalProfesores}
            </td>
        </tr>
        <tr>
            <td>
                Total de cursos abiertos
            </td>
            <td className="text-center">
            {globalCursos}
            </td>
        </tr>
        </tbody>                                                              
    </table>

    <span className="mb-2 cabecera color-63 border-bottom-solid-light">Materias</span>
        
        <table>
            <tbody>
            <tr>
                <td>
                    <span title="Cantidad de cursos abiertos de la materia" className="w-100 inline-block-1">Cursos</span>
                    <SeleccionMateria nombre="cursos" vector={materias} valor={materiaSeleccionadaCursos} handleChange={handleChangeMateria}/>                                                                             
                </td>
                <td className="w-50 text-center">
                    {materiaCursos}
                </td>
            </tr>     
            <tr>
                <td>
                    <span title="Total de alumnos que cursan la materia" className="w-100 inline-block-1">Alumnos</span>
                    <SeleccionMateria nombre="alumnos" vector={materias} valor={materiaSeleccionadaAlumnos} handleChange={handleChangeMateria}/>                                                                             
                </td>
                <td className="w-50 text-center">
                    {materiaAlumnos}
                </td>
            </tr>   
            <tr>
                <td>
                    <span title="Total de profesores en la materia" className="w-100 inline-block-1">Profesores</span>
                    <SeleccionMateria nombre="profesores" vector={materias} valor={materiaSeleccionadaProfesores} handleChange={handleChangeMateria}/>                                                                             
                </td>
                <td className="w-50 text-center">
                    {materiaProfesores}
                </td>
            </tr>               
            </tbody>                                                              
        </table>
    
        <span className="mb-2 cabecera color-63 border-bottom-solid-light">Profesores</span>
        
        <table>
            <tbody>
            <tr>
                <td>
                    <span title="Cantidad de cursos asignados al profesor" className="w-100 inline-block-1">Cursos </span>
                    <SeleccionProfesor nombre="cursos" vector={profesores} valor={profesorSeleccionadoCursos} handleChange={handleChangeProfesor}/>                                                                             
                </td>
                <td className="w-50 text-center">
                    {profesorCursos}
                </td>
            </tr>   
            <tr>
                <td>
                    <span title="Cantidad de alumnos que cursan con el profesor" className="w-100 inline-block-1">Alumnos</span>
                    <SeleccionProfesor nombre="alumnos" vector={profesores} valor={profesorSeleccionadoAlumnos} handleChange={handleChangeProfesor}/>                                                                             
                </td>
                <td className="w-50 text-center">
                    {profesorAlumnos}
                </td>
            </tr>  
            <tr>
                <td>
                    <span title="Cantidad de materias que dicta el profesor" className="w-100 inline-block-1">Materias </span>
                    <SeleccionProfesor nombre="materias" vector={profesores} valor={profesorSeleccionadoMaterias} handleChange={handleChangeProfesor}/>                                                                             
                </td>
                <td className="w-50 text-center">
                    {profesorMaterias}
                </td>
            </tr>                
            </tbody>                                                              
        </table>
        
</div>

}

function EstadisticasCentro({inscripciones}){
    return <div className="flex f-col items-center p-2 ml-2 mr-2">
        {/*Total de inscripciones según cantidad de materias*/}
        <span title="Cantidad de inscripciones según cantidad de materias" className="mb-2 cabecera color-63 border-bottom-solid-light">Inscripciones</span>

            <table className="estadistica">
                <thead>
                    <tr className="titulo-lista">
                        <th>MATERIAS</th>
                        <th>ALUMNOS</th>
                        <th> % </th>
                    </tr>
                </thead>
                <tbody>
                {inscripciones.map(item=> 
                    <tr>
                        <td>{item.cantidad_materias}</td>
                        <td className="text-center">{item.cantidad_alumnos}</td>
                        <td>{item.porcentaje}</td>
                    </tr>
                )}
                </tbody>
            </table>

    </div>
}

function EstadisticasDerecha({alumnosPais, alumnosProvincia, onchangePais}){

    if(!alumnosPais || alumnosPais.lenght ==0){
        return null
    }

    return <div className="flex f-col p-2 m-2">
             <span title="País y provincia de residencia de alumnos inscriptos" className="mb-2 cabecera color-63 border-bottom-solid-light text-center">Alumnos</span>

            <div className="flex f-row ">
                <div className="ml-4 mr-4">
                    <table className="estadistica">
                        <thead>
                            <tr className="titulo-lista">
                                <th>PAIS</th>
                                <th>ALUMNOS</th>
                                <th> % </th>
                            </tr>
                        </thead>                        
                    <tbody>
                        {alumnosPais.map(item=> 
                            <tr className="cursor-pointer" onClick={()=>{onchangePais(item.id_pais)}}>
                                <td >{item.nombre}</td>
                                <td className="text-center">{item.total}</td>
                                <td>{item.porcentaje}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

            <div className="ml-4 mr-4">
                <table className="estadistica">
                    <thead>
                        <tr className="titulo-lista">
                            <th>PROVINCIA</th>
                            <th>ALUMNOS</th>
                            <th> % </th>
                        </tr>
                    </thead>                      
                    <tbody>
                            
                    {alumnosProvincia.map(item=> 
                        <tr >
                            <td className="w-150">{item.nombre}</td>
                            <td>{item.total}</td>
                            <td>{item.porcentaje}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>    
    </div>
}