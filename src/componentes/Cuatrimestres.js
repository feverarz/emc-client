import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faUser, faCircle, faEdit,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import AbmCuatrimestre from '../abms/Abm-cuatrimestre'
import { v4 as uuidv4 } from 'uuid';

export default function Cautrimestres({finalizarSeleccion}){

    const [cuatrimestres,setCuatrimestres]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [idSeleccionado, setIdSeleccionado]=useState(null)
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [ejecutarAlta, setEjecutarAlta]=useState(false)

    const referencia1 = React.useRef();

    useEffect(()=>{
       
        setBuscando(true)

        const buscarCuatrimestres = async ()=>{

           try{
                const {data}= await Axios.get('/api/tablasgenerales/cuatrimestres')
        
                setCuatrimestres(data)
                setBuscando(false)
            }catch(err){
               // console.log(err.response.data)
                setBuscando(false)
                setHuboError(true)
            }
        }
        
        buscarCuatrimestres()
    },[contadorOperaciones])

    useEffect(()=>{
        console.log('cambio el id ', idSeleccionado )
    },[idSeleccionado])

    const iniciarALta=()=>{
        setEjecutarAlta(true)
    }

    const finalizarAltaOcopia= (valor)=>{

       // setIdSeleccionado(null)
       // setEjecutarAlta(false)

       if (valor){
           /* setTimeout(() => {      // AVERIGUAR PORQUE SIN UN SETTIMEOUT NO ACTUALIZA EL ESTADO DE IdSeleccionado
                setIdSeleccionado(null)
                setContadorOperaciones(contadorOperaciones+1)
                setEjecutarAlta(false)
            }, 100); */
            setIdSeleccionado(null)
            setEjecutarAlta(false)
            setContadorOperaciones(contadorOperaciones+1)

        }else{ // AVERIGUAR PORQUE SIN UN SETTIMEOUT NO ACTUALIZA EL ESTADO DE IdSeleccionado
           /* setTimeout(() => {
                setIdSeleccionado(null)
                setEjecutarAlta(false)
            }, 100); */

            setIdSeleccionado(null)
            setEjecutarAlta(false)
       }
    }

    const seleccionar=(e,item)=>{
        setIdSeleccionado(item.id_cuatrimestre)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando cuatrimestres...</span></div></Main>
    };

    return(
        <> 
        {!ejecutarAlta && <span onClick={iniciarALta} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mb-4 mt-2" >
            <FontAwesomeIcon className="cursor-pointer ic-abm" icon={faPlusSquare}/> Crear un cuatrimestre
        </span>}
        { ejecutarAlta && 
                    <AbmCuatrimestre id_cuatrimestre={null} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }    
        { !ejecutarAlta && <Listado tabla={cuatrimestres} 
            seleccionar={seleccionar} 
            textoBusqueda={''} 
            idSeleccionado={idSeleccionado}
            finalizarAltaOcopia={finalizarAltaOcopia}/> 
        }    
        </>
    )
}

function Listado({tabla,seleccionar,textoBusqueda, idSeleccionado,finalizarAltaOcopia}){

    return (
    <div>
        {tabla
            .filter(
                item=>item.nombre.toUpperCase().includes(textoBusqueda.toUpperCase()))
            .map(item=><div key={uuidv4()}>
            <div title="Seleccione éste cuatrimestre para editarlo" onClick={(e)=>{seleccionar(e,item)}} 
                className="listado-al" >
                <FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/>
                <span className={item.activo ? 'lis-col1-ml border-bottom-solid-activo' : 'lis-col1-ml'}>
                    {item.nombre}
                </span>
                <span className={item.activo ? "color-crimson" : ''}>{fechasString(item)}</span>
                <span className={item.activo ? "inline-block text-small ml-4 border-bottom-solid-activo fw-700" : "inline-block ml-4"}>{item.activo ? 'Activo' : ''}</span>
                {item.activo && <FontAwesomeIcon className="mr-2 color-green text-small" icon={faCheckCircle}/>}
            </div> 
              {idSeleccionado == item.id_cuatrimestre && 
                    <AbmCuatrimestre id_cuatrimestre={item.id_cuatrimestre} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }            
            </div>)
        }
    </div>
    )
}

function fechasString(item){


    const mes_i = Number(item.f_desde.slice(5,7))
    const mes_f = Number(item.f_hasta.slice(5,7))
    const anio_i = item.f_desde.slice(0,4)
    const anio_f = item.f_hasta.slice(0,4)

    if (anio_i===anio_f){
        return `${transformarMesCorto(mes_i)} - ${transformarMesCorto(mes_f)} ${anio_f}`
    }else{
        return `${transformarMesCorto(mes_i)}-${anio_i.slice(2,4)} / ${transformarMesCorto(mes_f)}-${anio_f.slice(2,4)}`
    }
}

function transformarMesCorto(mes){

    let mes_string

    switch(mes){
        case 1: mes_string = 'Ene'; break;
        case 2: mes_string = 'Feb'; break;
        case 3: mes_string = 'Mar'; break;
        case 4: mes_string = 'Abr'; break;
        case 5: mes_string = 'May'; break;
        case 6: mes_string = 'Jun'; break;
        case 7: mes_string = 'Jul'; break;
        case 8: mes_string = 'Ago'; break;
        case 9: mes_string = 'Sep'; break;
        case 10: mes_string = 'Oct'; break;
        case 11: mes_string = 'Nov'; break;
        case 12: mes_string = 'Dic'; break;
        default : mes_string = '?'
    }

    return mes_string
}

function transformarMesLargo(mes){

    let mes_string

    switch(mes){
        case 1: mes_string = 'Enero'; break;
        case 2: mes_string = 'Febrero'; break;
        case 3: mes_string = 'Marzo'; break;
        case 4: mes_string = 'Abril'; break;
        case 5: mes_string = 'Mayo'; break;
        case 6: mes_string = 'Junio'; break;
        case 7: mes_string = 'Julio'; break;
        case 8: mes_string = 'Agosto'; break;
        case 9: mes_string = 'Septiembre'; break;
        case 10: mes_string = 'Octubre'; break;
        case 11: mes_string = 'Noviembre'; break;
        case 12: mes_string = 'Diciembre'; break;
        default : mes_string = '?'
    }

    return mes_string
}
