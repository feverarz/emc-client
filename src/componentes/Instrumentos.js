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

    const [instrumentos,setInstrumentos]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [idSeleccionado, setIdSeleccionado]=useState(null)
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [ejecutarAlta, setEjecutarAlta]=useState(false)

    const referencia1 = React.useRef();

    useEffect(()=>{
       
        setBuscando(true)
        buscarInstrumentos()
    },[contadorOperaciones])

    const buscarInstrumentos = async ()=>{

        try{
             const {data}= await Axios.get('/api/tablasgenerales/instrumentos')
     
             setInstrumentos(data)
             setBuscando(false)
         }catch(err){
             console.log(err.response.data)
             setBuscando(false)
             setHuboError(true)
         }
     }
  

    const iniciarALta=()=>{
        setEjecutarAlta(true)
    }

    const borrarInstrumento = async (id)=>{

        try{
            const {data} = await Axios.delete(`/api/tablasgenerales/instrumento/${id}`)

            Swal.fire({
                text:`Se eliminó el instrumento con éxito`,
                icon: 'success',
                showConfirmButton: false,
                timer:2500
            })

            buscarInstrumentos()

        }catch(err){
            Swal.fire({
                text:`${err.response.data.message}`,
                icon: 'warning',
                showConfirmButton: false,
                timer:2500
            })
        }
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
        setIdSeleccionado(item.id_instrumento)
    }

    

    const iniciarBorrar = (item)=>{
   
        Swal.fire({
            text:`¿Confirma la eliminación del instrumento ${item.nombre}?`,
            showCancelButton:true,
            confirButtonText:'Si, eliminar',
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    borrarInstrumento(item.id_instrumento);
    
                }else{
                    console.log("Se canceló la eliminación del instrumento")
                }
            }
        )
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando instrumentos...</span></div></Main>
    };

    return(
        <> 
        {!ejecutarAlta && <span onClick={iniciarALta} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mb-4 mt-2" >
            <FontAwesomeIcon className="cursor-pointer ic-abm" icon={faPlusSquare}/> Crear un instrumento
        </span>}
        { ejecutarAlta && 
                    <AbmInstrumento id_instrumento={null} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }    
        { !ejecutarAlta && <Listado tabla={instrumentos} 
            seleccionar={seleccionar} 
            textoBusqueda={''} 
            idSeleccionado={idSeleccionado}
            finalizarAltaOcopia={finalizarAltaOcopia}
            iniciarBorrar = {iniciarBorrar}/> 
        }    
        </>
    )
}

function Listado({tabla,seleccionar,textoBusqueda, idSeleccionado,finalizarAltaOcopia,iniciarBorrar}){

    return (
    <div>
        {tabla
            .filter(
                item=>item.nombre.toUpperCase().includes(textoBusqueda.toUpperCase()))
            .map(item=><div key={uuidv4()}>
            <div title="Seleccione éste instrumento para editarlo" onClick={(e)=>{seleccionar(e,item)}} 
                className="listado-al" >
                <FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/>
                <span className="lis-col1">{item.nombre}</span>
                <span className="inline-block-1 width-35">{item.abreviatura}</span>
                <span onClick={()=>{iniciarBorrar(item)}} title={`Eliminar ${item.nombre}`} className="filas-lista cursor-copy p-iconos-listas width-35" >
                                <FontAwesomeIcon className="cursor-pointer"  icon={faTrash}/>
                </span> 
            </div> 
              {idSeleccionado == item.id_instrumento && 
                    <AbmInstrumento id_instrumento={item.id_instrumento} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }            
            </div>)
        }
    </div>
    )
}

