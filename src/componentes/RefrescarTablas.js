import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle,faWindowClose, faUser, faCircle, faEdit,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import AbmAula from '../abms/Abm-aula'
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { faOtter } from '@fortawesome/free-solid-svg-icons';

export default function RefrescarTablas({finalizarSeleccion}){

    const [aulas,setAulas]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [idSeleccionado, setIdSeleccionado]=useState(null)
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [ejecutarAlta, setEjecutarAlta]=useState(false)
    const [tablas,setTablas] = useState([{nombre:'Materias',tabla:'materias',seleccion:true},
        {nombre:'Países',tabla:'paises',seleccion:true},
        {nombre:'Provincias',tabla:'provincias',seleccion:true},
        {nombre:'Nacionalidades',tabla:'nacionalidades',seleccion:true},
        {nombre:'Instrumentos',tabla:'instrumentos',seleccion:true},
        {nombre:'Niveles instrumental',tabla:'nivelesi',seleccion:true},
        {nombre:'Niveles ensamble',tabla:'nivelese',seleccion:true},
        {nombre:'Carreras',tabla:'carreras',seleccion:true}])

    const [habilitarActualizacionRedisAlumno,setHabilitarActualizacionRedisAlumno] = useState(false);

    const handleCheckItem = (e)=>{

        const nuevoArrayTablas = tablas.map(item=>{
            if (item.tabla==e.target.name){
                return {...item,seleccion:e.target.checked}
            }else{
                return item
            }
        })

        setTablas(nuevoArrayTablas)
    }

    const iniciarCargarTablas = ()=>{
        const algunoMarcado = tablas.some(item=>item.seleccion)

        if (algunoMarcado){
            cargarTablasGenerales()
        }
    }

    const gestionarChecks = (valor)=>{
        if(valor){
            setTablas(tablas.map(item=> {return{...item,seleccion:true}}))
        }else{
            setTablas(tablas.map(item=> {return{...item,seleccion:false}}))
        }
    }

    const cargarTablasGenerales = async ()=>{

        setBuscando(true);
    
        try{
            const vectorResultado = await Promise.all([
                Axios.get('/api/tablasgenerales/materias'),
                Axios.get('/api/tablasgenerales/paises'),
                Axios.get('/api/tablasgenerales/provincias/all'),
                Axios.get('/api/tablasgenerales/nacionalidades'),
                Axios.get('/api/tablasgenerales/instrumentos'),
                Axios.get('/api/tablasgenerales/nivelesi'),
                Axios.get('/api/tablasgenerales/nivelese'),
                Axios.get('/api/tablasgenerales/carreras')
            ])

            // creo un map para crear tuplas cuya key sea igual al nombre de cada tabla
            // definida en el array de tablas 
            // para trabajar con una relación de 1 a 1 con el nombre del checkbox y el campo seleccion
            // del array. Así cuando proceso los items marcados busco el key del map con el metodo get
            // cuando se detecto con el item esta seleccionado
            // de esta manera evitamos usar un switch 

            // es posible que también lo haya podido lograr usando un objeto
            // definido asi... tablasmapeadas = {materias:xxx,paises:xxxx}
            // tablasmapeadas['materias']...etc

            let mapeoTablas = new Map([
                ['materias', vectorResultado[0].data],
                ['paises', vectorResultado[1].data],
                ['provincias', vectorResultado[2].data],
                ['nacionalidades', vectorResultado[3].data],
                ['instrumentos', vectorResultado[4].data],
                ['nivelesi', vectorResultado[5].data],
                ['nivelese', vectorResultado[6].data],
                ['carreras', vectorResultado[7].data]
            ]);
           
            // usando el map se logró que el name del checkbox = key del map = campo tabla del array

            setBuscando(false); 
            
            tablas.forEach(item=>{
                if(item.seleccion){
                    localStorage.removeItem(item.tabla)
                    localStorage.setItem(item.tabla,JSON.stringify(mapeoTablas.get(item.tabla)))
                }
            })

            Swal.fire({
                html:'La actualización se realizó con éxito',
                icon: 'warning',
                timer: 1500,
                showConfirmButton: false,
            })   

        }catch(err){
    
                console.log(err)
               // const mensaje_html = `<p>La busqueda de tablas generales falló</p><p>${err.response.data.message}</p>`
                const mensaje_html = `${err}`

                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
                setHuboError(true)
                setBuscando(false);

            }
        }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Actualizando tablas secundarias...</span></div></Main>
    };

    return(
        <div className="flex"> 
            <Listado tablas={tablas} 
                    handleCheckItem={handleCheckItem} 
                    iniciarCargarTablas= {iniciarCargarTablas}
                    gestionarChecks = {gestionarChecks}
                    habilitarActualizacionRedisAlumno={habilitarActualizacionRedisAlumno}
                    setHabilitarActualizacionRedisAlumno = {setHabilitarActualizacionRedisAlumno}/>
            <SetParametrosAccesoAlumno habilitarActualizacionRedisAlumno={habilitarActualizacionRedisAlumno}/>
        </div>
    )
}

function Listado({tablas,handleCheckItem,iniciarCargarTablas,gestionarChecks,habilitarActualizacionRedisAlumno,setHabilitarActualizacionRedisAlumno}){

    return (
        <div>
        <p>Aquí podrá actualizar el contenido de tablas secundarias como países, provincias, instrumentos, materias, aulas, cuatrimestres...etc</p>
        <br/>
        <p>Estas tablas se almacenan en una memoria local para agilizar la carga de datos que no suelen variar con frecuencia.</p>
        <br/>
        <p onDoubleClick={()=>{setHabilitarActualizacionRedisAlumno(!habilitarActualizacionRedisAlumno)}}>Eventualmente puede ser necesario refrescar estos datos almacenados localmente para traer la versión actualizada de los mismos desde la base de datos</p>
        <br/>

        <table>
            <tbody>
                <tr>
                    <td>
                        
                    </td>
                    <td>
                        <a onClick={()=>gestionarChecks(true)} 
                                title="Marcar todos" 
                                className="tdec-none cursor-pointer ml-2 color-63 ">
                                <FontAwesomeIcon className="cursor-pointer" icon={faCheckCircle}/> 
                        </a> 
                        <a onClick={()=>gestionarChecks(false)} 
                            title="Desmarcar todos" 
                            className="tdec-none cursor-pointer ml-2 mr-2 color-63 ">
                            <FontAwesomeIcon className="cursor-pointer" icon={faCircle}/> 
                        </a> 
                    </td>
                </tr>
                {tablas.map(item=>{ return (
                    <tr>
                        <td>{item.nombre}</td>
                        <td className="text-center"><input onClick={handleCheckItem} checked={item.seleccion} type="checkbox" name = {item.tabla} id={item.tabla}/></td>
                    </tr>)
                })}
            </tbody>
           
        </table>
      
        <button className="Feed" onClick={iniciarCargarTablas}>Actualizar tablas secundarias</button>
      </div>
    )
}

function SetParametrosAccesoAlumno({habilitarActualizacionRedisAlumno}){
    const [tiempo,setTiempo] = useState(60)
    const [conexiones,setConexiones]= useState(5)

    async function enviarTiempo(){
        try{
            Axios.post('api/usuarios/alumnos/settiempo',{tiempo:`${tiempo}s`})
        }catch(err){
          console.log(err)
        }
      }

    async function enviarConexiones(){
        try{
            Axios.post('api/usuarios/alumnos/setconexiones',{conexiones:conexiones})
        }catch(err){
            console.log(err)
        }
    }  

    return <div className={habilitarActualizacionRedisAlumno ? "block":"hidden"}>
        <div className="flex">
            <input title="Tiempo máximo en segundos" className="ml-2 w-50" type="number" value={tiempo} onChange={(e)=>setTiempo(e.target.value)}/>
            <button onClick={enviarTiempo}>Enviar</button>
        </div>
        <div className="flex">
            <input title="Conexiones máximas" className="ml-2 w-50" type="number" value={conexiones} onChange={(e)=>setConexiones(e.target.value)}/>
            <button onClick={enviarConexiones}>Enviar</button>
        </div>

    </div>
}