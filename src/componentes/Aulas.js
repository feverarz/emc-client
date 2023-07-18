import React, {useState, useEffect, useRef} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faCircle,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import AbmAula from '../abms/Abm-aula'
import { v4 as uuidv4 } from 'uuid';
import { faTrash, faSort } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

export default function Aulas({finalizarSeleccion}){

    const [aulas,setAulas]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [idSeleccionado, setIdSeleccionado]=useState(null)
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [ejecutarAlta, setEjecutarAlta]=useState(false)

    const referencia1 = React.useRef();

    useEffect(()=>{
       
        setBuscando(true)

        buscarAulas()
    },[contadorOperaciones])

    useEffect(()=>{
        console.log('cambio el id ', idSeleccionado )
    },[idSeleccionado])


    const buscarAulas = async ()=>{

        try{
             const {data}= await Axios.get('/api/tablasgenerales/aulas')
     
             setAulas(data)
             setBuscando(false)
         }catch(err){
           //  console.log(err.response.data)
             setBuscando(false)
             setHuboError(true)
         }
     }

     const probarMail = async ()=>{

        try{
            const respuesta = await Axios.post('/api/tablasgenerales/enviarmail',{mensaje:'test'})
     
            alert('listo')
         }catch(err){
           //  console.log(err.response.data)
             setHuboError(true)
         }
     }



    const iniciarALta=()=>{
        setEjecutarAlta(true)
    }

    const finalizarAltaOcopia= (valor)=>{

        //setIdSeleccionado(null)
        //setEjecutarAlta(false)

       if (valor){
            /*setTimeout(() => {      // AVERIGUAR PORQUE SIN UN SETTIMEOUT NO ACTUALIZA EL ESTADO DE IdSeleccionado
                setIdSeleccionado(null)
                setContadorOperaciones(contadorOperaciones+1)
                setEjecutarAlta(false)
            }, 100); */

            setIdSeleccionado(null)
            setContadorOperaciones(contadorOperaciones+1)
            setEjecutarAlta(false)

        }else{ // AVERIGUAR PORQUE SIN UN SETTIMEOUT NO ACTUALIZA EL ESTADO DE IdSeleccionado
            /*setTimeout(() => {
                setIdSeleccionado(null)
                setEjecutarAlta(false)
            }, 100); */
            setIdSeleccionado(null)
            setEjecutarAlta(false)
        }
    }

    const borrarAula = async (id)=>{

        try{
            const {data} = await Axios.delete(`/api/tablasgenerales/aula/${id}`)

            Swal.fire({
                text:`Se eliminó el aula con éxito`,
                icon: 'success',
                showConfirmButton: false,
                timer:2500
            })

            buscarAulas()

        }catch(err){
            Swal.fire({
                text:`${err.response.data.message}`,
                icon: 'warning',
                showConfirmButton: false,
                timer:2500
            })
        }
    }

    const iniciarBorrar = (item)=>{
   
        Swal.fire({
            text:`¿Confirma la eliminación del aula ${item.descripcion}?`,
            showCancelButton:true,
            confirButtonText:'Si, eliminar',
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    borrarAula(item.id_aula);
    
                }else{
                    console.log("Se canceló la eliminación del aula")
                }
            }
        )
    }    

    const seleccionar=(e,item)=>{
        setIdSeleccionado(item.id_aula)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando aulas...</span></div></Main>
    };

    return(
        <> 
        {!ejecutarAlta && <span onClick={iniciarALta} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mb-4 mt-2" >
            <FontAwesomeIcon className="cursor-pointer ic-abm" icon={faPlusSquare}/> Crear un aula
        </span>}
        { ejecutarAlta && 
                    <AbmAula id_aula={null} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }    
        { !ejecutarAlta && <Listado tabla={aulas} 
            seleccionar={seleccionar} 
            textoBusqueda={''} 
            idSeleccionado={idSeleccionado}
            finalizarAltaOcopia={finalizarAltaOcopia}
            iniciarBorrar = {iniciarBorrar}/> 
        }    
        <button onClick={probarMail}></button>
        </>
    )
}

function Listado({tabla,seleccionar,textoBusqueda, idSeleccionado,finalizarAltaOcopia,iniciarBorrar}){
    const [orden,setOrden] = useState({campo:'descripcion',sentido:'asc'})

    const callbackOrden =(a,b)=>{
        if(orden.sentido=='asc'){
            return typeof(a[orden.campo])=='string' ? a[orden.campo].localeCompare(b[orden.campo]) : typeof(a[orden.campo])=='number' ? a[orden.campo]-b[orden.campo] : typeof(a[orden.campo])=='boolean' ? Number(a[orden.campo])-Number(b[orden.campo]): null
        }else{
            return typeof(b[orden.campo])=='string' ? b[orden.campo].localeCompare(a[orden.campo]) : typeof(a[orden.campo])=='number' ? b[orden.campo]-a[orden.campo] : typeof(a[orden.campo])=='boolean' ? Number(b[orden.campo])-Number(a[orden.campo]): null
        }
    }

    const manageSort = (field)=>{
        if(field==orden.campo){
            setOrden({campo:field,sentido:orden.sentido=='asc' ? 'desc': 'asc'})
        }else{
            setOrden({campo:field,sentido:'asc'})
        }
    }
//onClick={()=>manageSort('descripcion')}


    return <table>
        <thead>
            <tr>
                <th title='Ordenar por la descripción'><FontAwesomeIcon className={`cursor-pointer ${orden.campo=='descripcion' ? 'color-red' : ''}`} icon={faSort} onClick={()=>manageSort('descripcion')}/></th>
                <th title='Ordenar por el tipo de aula'><FontAwesomeIcon className={`cursor-pointer ${orden.campo=='virtual' ? 'color-red' : ''}`} icon={faSort} onClick={()=>manageSort('virtual')}/></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {
            tabla.sort(callbackOrden)
            .filter(
                item=>item.descripcion.toUpperCase().includes(textoBusqueda.toUpperCase()))
            .map(item=><>
                <tr className='cursor-pointer' onClick={(e)=>{seleccionar(e,item)}}>
                    <td><FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/><span className="lis-col1 inline-block-1 ">{item.descripcion}</span> </td>
                    <td><span className={`lis-col1 inline-block-1 ${item.virtual ? 'a-virtual' : 'a-presc'}`}>{item.virtual ? 'Virtual' : 'Presencial'}</span></td>
                    <td onClick={()=>{iniciarBorrar(item)}} title={`Eliminar ${item.nombre}`} className="filas-lista text-center cursor-copy p-iconos-listas ml-4 w-60"><FontAwesomeIcon className="cursor-pointer"  icon={faTrash}/></td>
                </tr>
                    {idSeleccionado == item.id_aula && 
                <tr>
                    <td colSpan="3">
                        <AbmAula id_aula={item.id_aula} 
                        finalizarAltaOcopia={finalizarAltaOcopia}/>
                </td>
                    </tr>}  
                </>
                )
            }
        </tbody>
    </table>
    return (
    <div>
        {tabla.sort(callbackOrden)
            .filter(
                item=>item.descripcion.toUpperCase().includes(textoBusqueda.toUpperCase()))
            .map(item=><div key={uuidv4()}>
            <div title="Seleccione ésta aula para editarla" onClick={(e)=>{seleccionar(e,item)}} 
                className="listado-al">
                <FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/>
                <span className="lis-col1 inline-block-1 w-150">{item.descripcion}</span>
                <span className={`lis-col1 inline-block-1 w-150 ${item.virtual ? 'a-virtual' : 'a-presc'}`}>{item.virtual ? 'Virtual' : 'Presencial'}</span>
                <span onClick={()=>{iniciarBorrar(item)}} title={`Eliminar ${item.nombre}`} className="filas-lista cursor-copy p-iconos-listas ml-4 w-60" >
                                <FontAwesomeIcon className="cursor-pointer"  icon={faTrash}/>
                </span> 
            </div> 
              {idSeleccionado == item.id_aula && 
                    <AbmAula id_aula={item.id_aula} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }            
            </div>)
        }
    </div>
    )
}

