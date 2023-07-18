import React, {useState, useEffect,useRef} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import { v4 as uuidv4 } from 'uuid';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

export default function AbmInstrumentosAlumno({id_alumno,finalizarEdicion}){

    const [datos,setDatos]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)

    const [instrumentos, setInstrumentos]= useState([]);
    const [nivelesI, setNivelesI]= useState([]);
    const [nivelesE, setNivelesE]= useState([]);
    const [contadorModificaciones, setContadorModificaciones]= useState(0);
    const backupInstrumentos = useRef([])
    const huboCambios = useRef(false)

    useEffect(()=>{
       
        setBuscando(true)
        cargarTablasGenerales()
        .then(()=>{
            huboCambios.current=false
            buscarInstrumentos()
        })
    },[contadorModificaciones])



    const cargarTablasGenerales = async ()=>{

        try{
            const vectorResultado = await Promise.all([
                Axios.get('/api/tablasgenerales/nivelesi'),
                Axios.get('/api/tablasgenerales/nivelese')
            ])

            setNivelesI(vectorResultado[0].data);
            setNivelesE(vectorResultado[1].data);

            

        }catch(err){
    
                console.log(err)
                const mensaje_html = `${err}`

                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
                setHuboError(true)
            }
        }


    const buscarInstrumentos = async ()=>{

        try{
             const {data}= await Axios.get(`/api/alumnos/instrumentos/${id_alumno}`)
     
             setInstrumentos(data)
             backupInstrumentos.current = data
             setBuscando(false)
         }catch(err){
             setBuscando(false)
             setHuboError(true)
         }
     }

    const handleNivelEChange=(e,instrumento)=>{

        const nuevo_id_nivel_ensamble = e.target.value; // en e.target.value traigo el nuevo id nivel ensamble
    
        const copia = [...instrumentos] //en copia replico el actual estado del vector de instrumentos del alumno
        
        const datosNuevoEnsamble = nivelesE // en datosNuevoEnsamble traigo los datos del nuevo id ensamble que interesa especialmente el nombre para actualizar luego el vector de instrumentos del alumno
                        .filter(item=>item.id_nivel_ensamble==nuevo_id_nivel_ensamble)[0];
    
        const copiaActualizada = copia // en copiaActualizada recorro copia y al detectar el id de instrumento a modificar recupero el objeto de esa posición y modifico el id ensamble y el nombre del nuevo id ensamble
                .map(item=>
                    item.id_instrumento==instrumento ? 
                    {...item,id_nivel_ensamble:nuevo_id_nivel_ensamble,nivel_e:datosNuevoEnsamble.nombre} 
                    : item)
        // actualizo el estado
        setInstrumentos(copiaActualizada)
        huboCambios.current = true            
    }

    const handleNivelIChange=(e,instrumento)=>{

        const nuevo_id_nivel_instrumental = e.target.value; // en e.target.value traigo el nuevo id nivel instrumental
    
        const copia = [...instrumentos] //en copia replico el actual estado del vector de instrumentos del alumno
        
        const datosNuevoInstrumental= nivelesI // en datosNuevoEnsamble traigo los datos del nuevo id instrumental que interesa especialmente el nombre para actualizar luego el vector de instrumentos del alumno
                        .filter(item=>item.id_nivel_instrumental==nuevo_id_nivel_instrumental)[0];
    
        const copiaActualizada = copia // en copiaActualizada recorro copia y al detectar el id de instrumento a modificar recupero el objeto de esa posición y modifico el id instrumental y el nombre del nuevo id instrumental
                .map(item=>
                    item.id_instrumento==instrumento ? 
                    {...item,id_nivel_instrumental:nuevo_id_nivel_instrumental,nivel_i:datosNuevoInstrumental.nombre} 
                    : item)
        // actualizo el estado
        setInstrumentos(copiaActualizada) 
        huboCambios.current = true            
    }

    const restaurarInstrumentos=()=>{
        setInstrumentos(backupInstrumentos.current)
        huboCambios.current =false            
    }

    const grabarInstrumentos = async ()=>{ // recibo en id_interno el id del alumno sea el nuevo recién creado o el id del alumno que estamos moficando
        try{
   
            const objetoAgrabar={instrumentos:instrumentos}
             
            const resultado1 = await Axios.put(`/api/alumnos/updatenivelesinstrumentos/${id_alumno}`,objetoAgrabar)
              
            Swal.fire({
                html:'<p>Se grabaron los datos correctamente<p/>',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            }).then(()=>{
                setContadorModificaciones(contadorModificaciones+1)
                if(finalizarEdicion){
                    finalizarEdicion()
                }
            })  
   
        }catch(err){
            let mensaje_html_error;
    
            if(err.response.data.message){
                mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data.message}</p>`
            }else if (err.response.data) {
                mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data}</p>`
            }else{
                mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response}</p>`
            }
    
    
            Swal.fire({
                html:mensaje_html_error,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })  
        }
    } 

    const iniciarGrabar = (values)=>{
        let texto;
        let textoConfirmacion;
    
        texto = `¿Confirma la modificación del nivel del alumno?`
        textoConfirmacion = 'Si, modificar'
       
    
        Swal.fire({
            text:texto,
            showCancelButton:true,
            confirButtonText:textoConfirmacion,
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    grabarInstrumentos();
    
                }else{
                    console.log("Se canceló la modificación")
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
        <div className='mb-2 cabecera color-63 border-bottom-solid-light'>Instrumentos y Niveles <span className="blink text-smaller bg-azul-tema">(Edición)</span></div>
        <InstrumentosAlumno nivelesi={nivelesI} 
                                    nivelese={nivelesE} 
                                    instrumentos={instrumentos} 
                                    handleNivelEChange={handleNivelEChange}
                                    handleNivelIChange={handleNivelIChange}
                                    restaurarInstrumentos = {restaurarInstrumentos}
                                    huboCambios = {huboCambios}
                                    iniciarGrabar = {iniciarGrabar}
                                    />
        </>
    )
}


function InstrumentosAlumno({instrumentos,nivelesi,nivelese,handleNivelIChange,handleNivelEChange,restaurarInstrumentos,huboCambios,iniciarGrabar}){
    return (
    <div className="mt-4 relative border-solid-gray p-2 border-radius-7 bg-azul-tema">
    
               {instrumentos.map(
                   (item,index)=><div key={uuidv4()} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 flex items-center">
                   
                   <span className="listaCursadasAnalitico recortar-nine">{item.instrumentos}</span> 
                   <div>
                       <span className="t-ins-al">Nivel Ins.</span>
                       <span className="nivei-nivele mr-2" title="Nivel instrumental"><SelectNivelI value={item.id_nivel_instrumental} instrumento={item.id_instrumento} niveles={nivelesi} onchange={handleNivelIChange}/></span> 
                   </div>
                   <div>
                       <span className="t-ins-al">Nivel Ens.</span>
                       <span className="nivei-nivele" title="Nivel ensamble"><SelectNivelE value={item.id_nivel_ensamble} instrumento={item.id_instrumento} niveles={nivelese} onchange={handleNivelEChange}/></span> 
                   </div>
                   <div>
                       <span className="t-ins-al">Principal</span>
                       <span className="nivei-nivele"><input type="radio" id="cri-td-uni" title="Es el instrumento principal" name="principal-upd" value={item.id_instrumento} checked={item.inst_principal}/></span> 
                   </div>
               </div>
               )}
               <div className="mt-2 flex justify-center">
                    {huboCambios.current && <button className="fw-100" onClick={restaurarInstrumentos}>Cancelar <FontAwesomeIcon className="color-tomato" icon={faWindowClose}/></button>}
                    {huboCambios.current && <button className="boton-act-niv" onClick={iniciarGrabar}>Actualizar <FontAwesomeIcon className="color-tomato" icon={faCheckCircle}/></button>}
               </div>

           </div>
    
    )}

    function SelectNivelI({niveles,value,onchange,instrumento}){

    // data-select="0" lo pongo para que no sea deshabilitado por el querySelectorAll del AbmAlumno que deshabilita varios elementos cuando es acceso profesor
        return (
             <div>
                 <select className="select-nive" data-select="0" value={value} onChange={(e)=>onchange(e,instrumento)}>
                     {niveles.map(item=>
                         <option key={uuidv4()} value={item.id_nivel_instrumental} >{item.nombre}</option>)}
                 </select>
             </div>
            
         )
         
     }

     function SelectNivelE({niveles, value,onchange,instrumento}){
    // data-select="0" lo pongo para que no sea deshabilitado por el querySelectorAll del AbmAlumno que deshabilita varios elementos cuando es acceso profesor
        return (
            <div>
                <select value={value} className="select-nive" data-select="0" onChange={(e)=>onchange(e,instrumento)}>
                    {niveles.map(item=>
                        <option key={uuidv4()} value={item.id_nivel_ensamble} >{item.nombre}</option>)}
                </select>
            </div>
           
        )
        
    }
