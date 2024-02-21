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

export default function CronogramaCursos({propCursos}){

    const [buscandoCursos,setBuscandoCursos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const {cuatrimestreActivo,desHabilitarBusquedaAlumnos} = useAlumno();
    const dias = [{dia:1,nombre:'Lunes'},{dia:2,nombre:'Martes'},{dia:3,nombre:'Miércoles'},{dia:4,nombre:'Jueves'},{dia:5,nombre:'Viernes'}]
    const [diaSeleccionado,setDiaSeleccionado]=useState(1);
    const [profesorSeleccionado,setProfesorSeleccionado]=useState(171);
    const [materiaSeleccionada,setMateriaSeleccionada]=useState(10);
    const [cursos, setCursos]=useState([])
    const [profesores, setProfesores]=useState([])
    const [materias, setMaterias]=useState([])
    const [cargandoCursos,setCargandoCursos] = useState(false);

    useEffect(()=>{
        desHabilitarBusquedaAlumnos();
        
        setDiaActual(setDiaSeleccionado)

        const buscarCursos = async ()=>{
            setCargandoCursos(true)

            try{          
                const {data} = await Axios.get(`/api/cursos/all/${cuatrimestreActivo.id_cuatrimestre}`)
    
                setCursos(data)

                setCargandoCursos(false)

            }catch(err){
                console.log(err)
                setCargandoCursos(false)

            }
        }
            if (!propCursos){
                buscarCursos()
            }else{
                setCursos(propCursos)
            }

           
        },[])

    useEffect(()=>{
        if (cursos.length>0){
            completarSelectoresProfesoresMateriasPorDia()
        }
    },[cursos])

    useEffect(()=>{
        
        completarSelectoresProfesoresMateriasPorDia()

        setTimeout(() => {
            setMateriaSeleccionada(-1)
            setProfesorSeleccionado(-1)
        }, 200);
        
    },[diaSeleccionado])  

    const completarSelectoresProfesoresMateriasPorDia= ()=>{
        const vectorProfesores = cursos
        .filter(item=>item.dia==diaSeleccionado)
        .map(item=>{return {id:item.id_prof,nombre:item.nombre}})
        .sort((a,b)=>a.id-b.id)
        .filter((item,index,vector)=>{
            return index > 0 ? item.id!=vector[index-1].id : item
        })

        const vectorMaterias = cursos
        .filter(item=>item.dia==diaSeleccionado)
        .map(item=>{return {id:item.id_materia,nombre:item.descripcion}})
        .sort((a,b)=>a.id-b.id)
        .filter((item,index,vector)=>{
            return index > 0 ? item.id!=vector[index-1].id : item
        })

        setProfesores(vectorProfesores)
        setMaterias(vectorMaterias)
    }

    const handleChangeDia = (e)=>{
        setDiaSeleccionado(e.target.value)
    }

    const handleChangeProfesor = (e)=>{
        setProfesorSeleccionado(e.target.value)
    }
    
    const handleChangeMateria = (e)=>{
        setMateriaSeleccionada(e.target.value)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoCursos){
        return <Main center><Loading/><span className="cargando">Cargando cronograma del día...</span></Main>
      };

      
    return(
        <>  
           {/*textoBusqueda!='' && <Listado alumnos={alumnosInactivos} textoBusqueda={textoBusqueda} seleccionarAlumno={seleccionarAlumno}/>*/}
           <Main center>
               <div>
                    <div className="flex f-row justify-content-center mt-6 mb-6">
                        <span className="crono-titulo">Cronograma del día </span>
                            <SeleccionDia dias={dias} diaSeleccionado={diaSeleccionado} handleChangeDia={handleChangeDia}/>
                            <span className="crono-det">{profesores.length} profesores</span>
                            <SeleccionProfesor lista={profesores} profesorSeleccionado={profesorSeleccionado} handleChangeProfesor={handleChangeProfesor}/>
                            {profesorSeleccionado > 0 && <span onClick={()=>setProfesorSeleccionado(-1)} title="Borrar" className="cursor-pointer crono-close"><FontAwesomeIcon icon={faWindowClose}/></span> }
                            <span className="crono-det">{materias.length} materias dictadas </span>
                            <SeleccionMateria lista={materias} materiaSeleccionada={materiaSeleccionada} handleChangeMateria={handleChangeMateria}/>
                            { materiaSeleccionada > 0 && <span onClick={()=>setMateriaSeleccionada(-1)} title="Borrar" className="cursor-pointer crono-close"><FontAwesomeIcon icon={faWindowClose}/></span> }
                        </div>
                        {cursos.length>0 && <ListadoDiaHora cursos={cursos} 
                                                            diaSeleccionado={diaSeleccionado}
                                                            profesorSeleccionado={profesorSeleccionado}
                                                            materiaSeleccionada={materiaSeleccionada}/>}
                        {cursos.length==0 && <span className="text-white">No se encontraron cursos</span>}
                </div>
           </Main>
           
        </>
    )
}

function Listado({cursos,comienzo, profesorSeleccionado,materiaSeleccionada}){
    return (
    <div className="cronograma"><span className="bg-tomato text-white text-center block p-1">{comienzo} hs</span>
        {cursos
            .map(item=>
            <div className="text-black" key={`alin-${uuidv4()}`}>
                {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                {/*<FontAwesomeIcon className="mr-2" icon={faUser}/>*/}
                
                <Link disabled className="text-black" 
                                to={{
                                    pathname: `/curso/${item.nro_curso}`
                                }}> <div title={`${item.descripcion}`} 
                                         className={ item.id_prof==profesorSeleccionado || item.id_materia==materiaSeleccionada ? "text-small mt-2 bg-dodgerblue" : "text-small mt-2"}>
                                             <span className="mr-2 crono-mat">{item.campo_auxiliar}</span>
                                             <span className="mr-2 crono-profe">{item.nombre}</span>
                                             <span>{item.Aula}</span>
                                    </div>
                </Link>
            </div>
            )
        }
    </div>
    )
}

function ListadoDiaHora({cursos,diaSeleccionado,profesorSeleccionado,materiaSeleccionada}){

    const vectorHoras = cursos
                        .filter(item=>item.dia==diaSeleccionado)
                        .map(item=>item.comienzo)
                        .sort((a,b)=>a.localeCompare(b))
                        .filter((item,index,vector)=>{
                            return index > 0 ? item!=vector[index-1] : item
                        })

    const vectorDia = cursos
    .filter(item=>item.dia==diaSeleccionado)
    

    return (
    <div className="flex flex-wrap justify-content-center">
        {vectorHoras.map(vhora=><Listado key={uuidv4()} cursos={vectorDia.filter(item=>item.comienzo==vhora)} 
                                         comienzo={vhora}
                                         profesorSeleccionado={profesorSeleccionado}
                                          materiaSeleccionada={materiaSeleccionada}/>)}
    </div>
    )
}

function SeleccionDia({diaSeleccionado,dias,handleChangeDia}){

return <select value={diaSeleccionado} onChange={(e)=>handleChangeDia(e)}>
    {dias.map(item=><option key={`dia-${item.dia}`} value={item.dia}>{item.nombre}</option>)}
</select>
}

function SeleccionProfesor({profesorSeleccionado,lista,handleChangeProfesor}){

    return <select value={profesorSeleccionado} onChange={(e)=>handleChangeProfesor(e)}>
        <option value="-1" disabled>Profesor</option>
        {lista.map(item=><option key={`profesor-${item.id}`} value={item.id}>{item.nombre}</option>)}
    </select>
}

function SeleccionMateria({materiaSeleccionada,lista,handleChangeMateria}){

    return <select value={materiaSeleccionada} onChange={(e)=>handleChangeMateria(e)}>
        <option value="-1" disabled>Materia</option>
        {lista.map(item=><option key={`materia-${item.id}`} value={item.id}>{item.nombre}</option>)}
    </select>
}



function setDiaActual(setDiaSeleccionado){
    const fecha = new Date();

    const dia = fecha.getDay()

    if (dia==0 || dia==6){
        setDiaSeleccionado(1);
        return
    }

    setDiaSeleccionado(dia)
}