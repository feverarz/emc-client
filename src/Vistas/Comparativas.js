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


       
export default function Comparativas({match,history}){
    const [cuatrimestres, setCuatrimestres ] = useState([]);
    const [cuatrimestreSeleccionado,setCuatrimestreSeleccionado]=useState(-1)
    const [cuatrimestreComparacionSeleccionado,setCuatrimestreComparacionSeleccionado]=useState(-1)
    const [cargandoCursos,setCargandoCursos] = useState(false);
    const [cargandoEstadisticas,setCargandoEstadisticas] = useState(true);
    const {cuatrimestreActivo,desHabilitarBusquedaAlumnos} = useAlumno();
    const [globalInscriptos,setGlobalInscriptos] = useState(0);
    const [globalInscriptosM,setGlobalInscriptosM] = useState(0);
    const [globalInscriptosF,setGlobalInscriptosF] = useState(0);
    const [globalMaterias,setGlobalMaterias] = useState(0);
    const [globalCursos,setGlobalCursos] = useState(0);
    const [globalProfesores,setGlobalProfesores] = useState(0);
    const [inscripciones,setInscripciones]= useState([]);
    const [comparativas,setComparativas]= useState([]);
    const [alumnosPais,setAlumnosPais]= useState([]);
    const [leyenda,setLeyenda]= useState(false);


    let parametros = useParams();

    useEffect(()=>{
    
    desHabilitarBusquedaAlumnos();    
    const buscarCursos = async ()=>{

        setCargandoCursos(true)
        try{          
           
            const vectorResultado = await Promise.all([
                Axios.get('/api/tablasgenerales/cuatrimestres'),
            ])

            setCuatrimestres(vectorResultado[0].data)
            setCuatrimestreSeleccionado(cuatrimestreActivo.id_cuatrimestre)
            setCuatrimestreComparacionSeleccionado(cuatrimestreActivo.id_cuatrimestre-1)
            setCargandoCursos(false)
        }catch(err){
            console.log(err)
            setCargandoCursos(false)
        }
    }
        
        buscarCursos()
    },[])

useEffect(()=>{
    if (cuatrimestreSeleccionado>0 && cuatrimestreComparacionSeleccionado>0 ){
        buscarDatosGlobales()
    }
},[cuatrimestreSeleccionado,leyenda,cuatrimestreComparacionSeleccionado])    

const buscarDatosGlobales = async ()=>{

    try{          
        setCargandoCursos(true)

        const vectorResultado = await Promise.all([
            Axios.get(`api/tablasgenerales/estadisticas/comparativas/${cuatrimestreSeleccionado}/${cuatrimestreComparacionSeleccionado}/${leyenda ? 1 : 0}`)
        ])

        setComparativas(vectorResultado[0].data)

        setCargandoCursos(false)

    }catch(err){
        console.log(err)
        setCargandoCursos(false)

    }
}

const handleChangeCuatrimestre = (e)=>{
    setCuatrimestreSeleccionado(e.target.value)
}

const handleChangeCuatrimestreComparacion = (e)=>{
    setCuatrimestreComparacionSeleccionado(e.target.value)
}

const cambiarLeyenda = ()=>{
    if (leyenda){
        setLeyenda(false)
    }else{
        setLeyenda(true)
    }
}

    if (cargandoCursos){
        return <Main center><Loading/><span className="cargando">Cargando datos...</span></Main>
      };
    
      //`/curso/${curso.nro_curso}`
    return <Main center>
        <div>
        <div className="flex f-row justify-content-center">
            <table>
                <thead>
                    <tr>
                        <td><span className="crono-titulo">Período inicial</span></td>
                        <td>
                            <SeleccionCuatrimestre cuatrimestres={cuatrimestres} cuatrimestreSeleccionado={cuatrimestreSeleccionado} handleChangeCuatrimestre={handleChangeCuatrimestre}/>
                        </td>
                    </tr>
                    <tr>
                        <td><span className="crono-titulo">Período de comparación</span></td>
                        <td>
                            <SeleccionCuatrimestre cuatrimestres={cuatrimestres} cuatrimestreSeleccionado={cuatrimestreComparacionSeleccionado} handleChangeCuatrimestre={handleChangeCuatrimestreComparacion}/>
                        </td>
                    </tr>
                    <tr>
                        <td><label>Ordenamiento por leyenda</label></td>
                        <td>
                            <input checked={leyenda} onChange={()=>cambiarLeyenda()} type="checkbox" 
                                title="Ordenar por leyenda"/> 
                        </td>
                    </tr>                                
                </thead>
            </table>
        </div>

   
        <div className="flex f-row justify-content-center">    


            <EstadisticasCentro comparativas={comparativas}/>
    
        </div>    

     </div>
</Main>
}

function SeleccionCuatrimestre({cuatrimestreSeleccionado,cuatrimestres,handleChangeCuatrimestre}){

    return <select value={cuatrimestreSeleccionado} onChange={(e)=>handleChangeCuatrimestre(e)}>
        {cuatrimestres.map(item=><option key={`dia-${item.id_cuatrimestre}`} value={item.id_cuatrimestre}>{item.nombre}</option>)}
    </select>
}



function EstadisticasCentro({comparativas}){
    return <div className="flex f-col items-center p-2 ml-2 mr-2">
        {/*Total de inscripciones según cantidad de materias*/}
        <span className="mb-2 cabecera color-63 border-bottom-solid-light">Listado de alumnos</span>

            <table className="comparativa">
                <thead>
                    <tr className="titulo-lista">
                        <th>ALUMNO</th>
                        <th>INICIAL</th>
                        <th>COMPARACION</th>
                        <th>RESULTADO</th>
                    </tr>
                </thead>
                <tbody>
                {comparativas.map(item=> 
                    <tr>
                        <td>{item.alumno}</td>
                        <td className="text-center">{item.cantidad_cuatrimestre_1}</td>
                        <td className="text-center">{item.cantidad_cuatrimestre_2}</td>
                        <td>{item.leyenda}</td>
                    </tr>
                )}
                </tbody>
            </table>

    </div>
}

