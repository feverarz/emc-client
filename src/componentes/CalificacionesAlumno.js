import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faClock, faCircle as circle2 } from '@fortawesome/free-regular-svg-icons';
import { faPlusCircle, faPencilAlt, faCircle } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import AbmAula from '../abms/Abm-aula'
import { v4 as uuidv4 } from 'uuid';
import {hacerfocoEnPrimerInput,scrollTop} from '../Helpers/utilidades-globales';
import Swal from 'sweetalert2';

const regex_solo_numeros = /^[0-9\b]+$/;

export default function CalificacionesAlumno({nro_curso,id_alumno, layoutGrande}){

    const [calificaciones,setCalificaciones]=useState([]);
    const [encabezado,setEncabezado]=useState([]);
    const [notas,setNotas]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)

    useEffect(()=>{

        setBuscando(true)

        const buscarCalificaciones = async ()=>{
            try{   
                const {data} = await Axios.get(`/api/cursos/alumno/notas/${nro_curso}/${id_alumno}`)
                setCalificaciones(data);// las calificaciones llegan como un array con 2 posiciones, uno la cabecera y otro las notas para que se pueda saber a que concepto pertenece cada nota
                setEncabezado(Object.entries(data[0])) // transformo el objeto de la posición 1 del array de calificaciones en un array en el que cada posicion tiene a su vez un array [key,value] para recorrer el array y mostrar cada concepto (value) y usar su key para leer la nota del objeto de la posicion 1 del array de calificaciones
                setBuscando(false)
            }catch(err){
                setBuscando(false)
                console.log(err)
            }
        }

        buscarCalificaciones();

    },[])

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando calificaciones...</span></div></Main>
    };

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando calificaciones...</span></div></Main>
    };

    if (!calificaciones || calificaciones.length==0){
        return null
    }
    
    if (layoutGrande){
        return <Main center>
        <div className="sizered mt-4 mb-4">
           {encabezado
           .filter((item,index)=>index>0 && item[1]!=null  && item[1]!='Concepto' && !esRecuperatorioSinNota(item[0],calificaciones[1][item[0]]))
           .map((item,index)=>
                <div title={definirTitle(item[0],calificaciones)} className="flex f-col size-score bg-tomato text-white p-2 ml-2 border-radius-7">
                    <p className="ml-2 mr-2 p-2 text-larger">{item[1]}</p>
                    <p className="ml-2 mr-2 text-center">{calificaciones[1][item[0]]}</p>
                </div>)}
        </div>
    </Main>
    }else{
        return <Main center>
        <div className="sizered text-xsmall">
           {encabezado
           .filter((item,index)=>index>0 && item[1]!=null && item[1]!='Promedio' && item[1]!='Concepto' && !esRecuperatorioSinNota(item[0],calificaciones[1][item[0]]))
           .map((item,index)=>
                <div title={definirTitle(item[0],calificaciones)} className="flex f-col bg-tomato text-white border-radius-7 p-2">
                    <p className="">{item[1]}</p>
                    <p className="ml-2 mr-2 text-center">{calificaciones[1][item[0]]}</p>
                </div>)}
        </div>
    
        </Main>
    }
}

const esRecuperatorioSinNota = (nombre,nota)=>{
    if(nombre.includes('rec')){
        if(nota!=undefined){
            return (Number(nota)==0 || isNaN(nota))
        }else{
            return true
        }
    }else{
        return false
    }
}

const definirTitle = (nombre,calificaciones)=>{
    if(nombre.includes('_rec')){
        const col_recuperada = nombre.slice(0,9)
        return  `Recuperatorio de ${calificaciones[0][col_recuperada]}`
    }else{
        return ''
    }
}