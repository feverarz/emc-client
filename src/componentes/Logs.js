import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faUser, faCircle, faEdit,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import AbmInstrumento from '../abms/Abm-Instrumento'
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

export default function Instrumentos({finalizarSeleccion}){

    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [logs,setLogs]=useState([]);


    useEffect(()=>{
       
        buscarLogs()
    },[])

     const buscarLogs = async ()=>{
        setBuscando(true)
        try{
             const {data}= await Axios.get('/api/tablasgenerales/logs')
     
             setLogs(data.documentos)
             setBuscando(false)
         }catch(err){
             console.log(err.response.data)
             setBuscando(false)
             setHuboError(true)
         }
     }     

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando logs...</span></div></Main>
    };

    if(logs.length>0){
        return (<Main center>
            <div className="flex justify-center p-2 mt-4">
                    {logs.length > 0 && <>
                        <table>
                            <tbody>
                                {logs.map(item=><tr className="h-16">
                                    <td><FontAwesomeIcon className="text-large color-tomato ml-4" icon={faFileAlt}/></td>
                                    <td><a target="_blank" className="ml-2 text-large color-black" href={item.ruta}>{item.nombre}</a></td>
                                    <td>{item.fecha}</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </>}
            </div>
            </Main>
        )
    }else{
        return <h1>No hay archivos</h1>
    }
}

