import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faUser, faCircle, faEdit,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import AbmInstrumento from '../abms/Abm-Instrumento'
import { v4 as uuidv4 } from 'uuid';
import { useHistory } from 'react-router-dom';

const filtros = ['PIA','BAJ','VOZ','BAT','SX','TRO','PER','GUI','BAN'].sort((a,b)=>a.localeCompare(b))
export default function Ensambles({editarCurso,cerrarModal}){

    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [ensambles,setEnsambles]=useState([]);
    const [registrosFiltrados,setRegistrosFiltrados]=useState([]);
    const [instrumentoSeleccionado,setInstrumentoSeleccionado]=useState(-1);
    const [noIncluye,setnoIncluye]=useState(true)
    const history = useHistory()
    const [conDetalles,setConDetalles]=useState(true)

    useEffect(()=>{
        buscarEnsambles()
    },[])

    const handleChangeFiltro = (e)=>{
        setInstrumentoSeleccionado(e.target.value)
    }

    const handleChangeCheckbox = (e)=>{
        setnoIncluye(e.target.checked)
    }

    const handleChangeCheckboxDetalles = (e)=>{
        setConDetalles(e.target.checked)
    }

    const buscarEnsambles = async ()=>{
        setBuscando(true)
        try{
             const {data}= await Axios.get('/api/cursos/ensambles')
             setEnsambles(data)
             setRegistrosFiltrados(data)
             setBuscando(false)
         }catch(err){
             console.log(err)
             setBuscando(false)
             setHuboError(true)
         }
     }  

    useEffect(()=>{
        const arrayFiltrado = ensambles.filter(item=>instrumentoSeleccionado==-1 || 
            noIncluye ? !item.instrumentos.includes(instrumentoSeleccionado) : item.instrumentos.includes(instrumentoSeleccionado))

         setRegistrosFiltrados([...arrayFiltrado])
    },[instrumentoSeleccionado,noIncluye])

    const abrirCurso = (item)=>{
        if(cerrarModal){
            cerrarModal()
        }
        history.push(`/curso/${item.nro_curso}`)
       
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando ensambles...</span></div></Main>
    };

    if(ensambles.length>0){
        return (<Main center>
            <div className="">
                <div className='flex justify-content-space-evenly items-center '>
                        <select value={instrumentoSeleccionado} onChange={handleChangeFiltro}>
                                <option value="-1">Todos</option>
                                {filtros.map(item=><option value={item}>
                                        {item}
                                </option>)}
                        </select>
                        <div>
                            <input type="checkbox" id="ch-instrumento" checked={noIncluye} onChange={handleChangeCheckbox} />
                            <label title="Incluye o no el instrumento seleccionado" className="mr-2" htmlFor="ch-instrumento">El instrumento seleccionado no está incluido</label>
                        </div>
            </div>
                <div className='text-center' >
                    <input type="checkbox" id="ch-detalles" checked={conDetalles} onChange={handleChangeCheckboxDetalles} />
                    <label title="Ver todos los instrumentos del ensamble" className="mr-2" htmlFor="ch-detalles">Ver con detalle</label>
                </div>
                    {ensambles.length > 0 && <>
                        <table>
                            <tbody>
                                {registrosFiltrados
                                    .map(item=><tr className="h-16" key={`ens-${item.nro_curso}`}>
                                    <td title='Descripción del curso'><p className='cursor-pointer' onClick={()=>abrirCurso(item)}>{generarClave(item.detalles)}</p></td>
                                    <td title='Cantidad de instrumentos'><div style={{display:'flex',flexDirection:'column'}}><p>{item.instrumentos.toString('')}</p>{conDetalles && <div style={{ width: '130px',border: '1px solid #c3c3c3',display: 'flex',flexWrap:'wrap',marginTop:'0.5rem',background:'antiquewhite',fontSize:'x-small'}}>{item.instrumentostodos.map(item=><div style={{padding:'2px'}}>{item}</div>)}</div>}</div></td>
                                </tr>)}
                            </tbody>
                        </table>
                    </>}
            </div>
            </Main>
        )
    }else{
        return <h1>No hay ensambles</h1>
    }
}

const generarClave = (item)=>{
    return `${item.materia} ${item.profesor} ${item.dia} (${item.nro_curso})`
}

