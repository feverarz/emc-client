import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle,faWindowClose } from '@fortawesome/free-regular-svg-icons';
import { useEffect, useState } from 'react';
import { faOtter, faUserSlash } from '@fortawesome/free-solid-svg-icons';

export default function MiHistorial ({historial,setProfe,setMateria,setPeriodo}){

    const [profesores,setProfesores] = useState([])
    const [materias,setMaterias] = useState([])
    const [periodos,setPeriodos] = useState([])
    const [profesorSeleccionado,setProfesorSeleccionado] = useState(-1)
    const [materiaSeleccionada,setMateriaSeleccionada] = useState(-1)
    const [periodoSeleccionado,setPeriodoSeleccionado] = useState(-1)

    useEffect(()=>{
        const prof = historial.map(item=>item.profesor).sort((a,b)=>a.localeCompare(b)).filter((item,index,vector)=>{return item!=vector[index-1]})
        const materia = historial.map(item=>item.descripcion).sort((a,b)=>a.localeCompare(b)).filter((item,index,vector)=>{return item!=vector[index-1]})
        const periodos = historial.map(item=>item.periodo).sort((b,a)=>a.id_cuatrimestre-b.id_cuatrimestre).filter((item,index,vector)=>{return item!=vector[index-1]})
        setMaterias(materia)
        setProfesores(prof)
        setPeriodos(periodos)
    },[])
    
    const reset = ()=>{
        setMateriaSeleccionada(-1)
        setProfesorSeleccionado(-1)
        setPeriodoSeleccionado(-1)
        setProfe(-1)
        setMateria(-1)
        setPeriodo(-1)
    }

    return (
        <div className="flex f-col mr-auto ml-auto">
            {(profesorSeleccionado!=-1 || periodoSeleccionado!=-1 || materiaSeleccionada!=-1) && <span className="cursor-pointer text-white botonNc inline-block-1" 
                      title='Cerrar' onClick={()=>reset()}>
                    <FontAwesomeIcon className="text-white" icon={faWindowClose}/> Cancelar filtro
            </span>}

            <select className={profesorSeleccionado!=-1 || periodoSeleccionado!=-1 ? 'hidden': ''} 
                    name="materias" value={materiaSeleccionada} 
                    onChange={(e)=>{setMateriaSeleccionada(e.target.value);setMateria(e.target.value)}} >
                <option value="-1">Todas mis materias</option>
                {materias.map(item=><option value={item}>{item}</option>)} 
            </select>
            <select className={materiaSeleccionada!=-1 || periodoSeleccionado!=-1 ? 'hidden': ''} 
                    name="profesor" value={profesorSeleccionado} 
                    onChange={(e)=>{setProfesorSeleccionado(e.target.value);setProfe(e.target.value)}}>
                <option value="-1">Todos mis profesores</option>
                {profesores.map(item=><option value={item}>{item}</option>)} 
            </select>
            <select className={materiaSeleccionada!=-1 || profesorSeleccionado!=-1 ? 'hidden': ''} 
                    name="periodo" value={periodoSeleccionado} 
                    onChange={(e)=>{setPeriodoSeleccionado(e.target.value);setPeriodo(e.target.value)}} >
                <option value="-1">Todos mis cuatrimestres</option>
                {periodos.map(item=><option value={item}>{item}</option>)} 
            </select>

        </div>
    )
}