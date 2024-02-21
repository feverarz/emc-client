import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link,useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from '../componentes/Loading';
import {useAlumno} from '../Context/alumnoContext';
import AbmCurso from '../abms/abm-curso';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle,faWindowClose,faEdit,faCopy, faCircle, faPlusSquare,faDotCircle,faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons';
import { faKey, faTrash, faSync,faEquals, faGreaterThanEqual,faEnvelopeSquare, faListOl, faMailBulk,faUserCheck,faEnvelope } from '@fortawesome/free-solid-svg-icons';
import AbmProfesor from '../abms/abm-profesor'
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import AbmPassword from '../abms/Abm-password';

       
export default function Cursos({match,history}){
    const [cursos,setCursos] = useState([])
    const [cursosAmostrar,setCursosAmostrar]=useState([])
    const {toggle, isShowing } = useModal();
    const [criterio, setCriterio ] = useState('original');


    const [persona,setPersona]=useState(-1);
    const [tipoPersonal,setTipoPersonal]=useState(-1);
    const [permiso,setPermiso]=useState(-1);
    const [cantidad,setCantidad]=useState(-1);
    const [status,setStatus] = useState('Activos')

    const [personas, setPersonas ] = useState([]);
    const [tiposPersonal, setTiposPersonal ] = useState([]);
    const [permisos, setPermisos ] = useState([]);
    const [cantidadesCursos, setCantidadesCursos ] = useState([]);
    const [exactamenteIgual, setExactamenteIgual ] = useState(true);

    const listaStatus = ['Activos','Inactivos']
    const [usuarioSeleccionado,setUsuarioSeleccionado]=useState(null)
    const [usuarioSeleccionadoPassword,setUsuarioSeleccionadoPassword]=useState(null)
    const [crearNuevoUsuario,setCrearNuevoUsuario]=useState(false)
    const [tipoCurso,setTipoCurso]=useState(-1); // 0 Regular 1 Recuperatorio
    const [cursosRecuperatorios,setCursosRecuperatorios]= useState(-1);
    // para activar el modal llamar a la función toggle en con alguna condicion o un evento...
    const [cargandoCursos,setCargandoCursos] = useState(false);
    const {cuatrimestreActivo,desHabilitarBusquedaAlumnos,usuario} = useAlumno();
    const {cargarParametrosVistaUsuarios,parametrosVistaUsuarios,parametrosVistaCursos} = useAlumno();
   // const {alumno, cambiarAlumno} = useAlumno();
    const [crearCurso,setCrearCurso]=useState(false);
    const [cursoAcopiar,setCursoAcopiar]=useState(null);
    const [copiarUnCurso, setCopiarUnCurso] = useState(false);
    const [contadorOperaciones, setContadorOperaciones]= useState(0);
    const [ultimosCursosCreados, setUltimosCursosCreados ]= useState([]);
    const [listaEmails, setListaEmails]=useState([])
    const [listaEmailsSeleccion, setListaEmailsSeleccion]=useState([])
    const [hayFiltrosActivos,setHayFiltrosActivos]=useState(false)

    const [orden,setOrden]=useState('descripcion')
    const [nuevoCampo,setNuevoCampo]=useState(true)
    const [contadorOrden,setContadorOrden]=useState(0)

    let parametros = useParams();

    useEffect(()=>{
    
    desHabilitarBusquedaAlumnos();    
    const buscarCursos = async ()=>{

        setCargandoCursos(true)
        try{          
            const {data} = await Axios.get(`/api/usuarios/all`)

            const data_mas_selector = data.map((item)=>{
                    return{...item,activo:formatearStatus(item.activo),seleccion:false}
                })

            setCursos(data_mas_selector)
            listarUltimoCursosCreados(data,setUltimosCursosCreados)
            armarListaEmails(data,setListaEmails)
            setCargandoCursos(false)
        }catch(err){
            console.log(err)
            setCargandoCursos(false)
        }
    }

        buscarCursos()
    },[cuatrimestreActivo,contadorOperaciones])

    useEffect(()=>{
        armarListaEmails(cursosAmostrar,setListaEmailsSeleccion)

        if (cursosAmostrar.length != cursos.length){
            setHayFiltrosActivos(true)
        }else{
            setHayFiltrosActivos(false)
        }

    },[cursosAmostrar])

    useEffect(()=>{
        resetLista()
        cargarParametrosVistaUsuarios({...parametrosVistaUsuarios,persona:persona})
    },[persona])

    useEffect(()=>{
        resetLista()
        cargarParametrosVistaUsuarios({...parametrosVistaUsuarios,tipoPersonal:tipoPersonal})
    },[tipoPersonal])
    
    useEffect(()=>{
        resetLista()
        cargarParametrosVistaUsuarios({...parametrosVistaUsuarios,permiso:permiso})
    },[permiso])

    useEffect(()=>{
        resetLista()
        cargarParametrosVistaUsuarios({...parametrosVistaUsuarios,cantidad:cantidad})
    },[cantidad])

    useEffect(()=>{
        resetLista()
        cargarParametrosVistaUsuarios({...parametrosVistaUsuarios,status:status})
    },[status])

    useEffect(()=>{

            const cargarListas = async ()=>{
                const personas = personasDelPersonal();
                setPersonas(personas);
    
                const tipos = tiposDelPersonal();
                setTiposPersonal(tipos);
    
                const permisos = permisosDelPersonal();
                setPermisos(permisos);
    
                const cantCursos = cantidadCursosDelPersonal();
                setCantidadesCursos(cantCursos);
    
                setCursosAmostrar(cursos);
            }

            cargarListas().then(()=>{
                if (parametrosVistaUsuarios){
                    setPermiso(parametrosVistaUsuarios.permiso ? parametrosVistaUsuarios.permiso : permiso)
                    setCantidad(parametrosVistaUsuarios.cantidad ? parametrosVistaUsuarios.cantidad : cantidad)
                    setPersona(parametrosVistaUsuarios.persona ? parametrosVistaUsuarios.persona : persona)
                    setTipoPersonal(parametrosVistaUsuarios.tipoPersonal ? parametrosVistaUsuarios.tipoPersonal : tipoPersonal)
                    setOrden(parametrosVistaUsuarios.orden ? parametrosVistaUsuarios.orden : orden)
                    setStatus(parametrosVistaUsuarios.status ? parametrosVistaUsuarios.status : status)
                }
                resetLista()
            })

            console.log(cursos)
    },[cursos])

  /*  return <>
        <Modal hide={toggle} isShowing={isShowing}>
            <h1>SOY UN MODAL</h1>
        </Modal>
    </>
*/
useEffect(()=>{
    resetLista()
    cargarParametrosVistaUsuarios({...parametrosVistaUsuarios,orden:orden})
},[contadorOrden])

useEffect(()=>{
    if(cantidad==-1){
        setExactamenteIgual(true)
  
    }else{
        modificarListaPorCantidadCursos()
    }
},[cantidad,exactamenteIgual])

useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        if (usuarioSeleccionado){
            setUsuarioSeleccionado(null)
        }        
        if(usuarioSeleccionadoPassword){
            setUsuarioSeleccionadoPassword(null)
        }
        if(crearNuevoUsuario){
            setCrearNuevoUsuario(false)
        }
    }
},[isShowing])

const limpiarPersona = ()=> {
    setPersona(-1);
}

const limpiarTipoPersonal = ()=> {
    setTipoPersonal(-1);
}

const limpiarPermiso = ()=> {
    setPermiso(-1);
}

const limpiarCantidad = ()=> {
    setCantidad(-1);
}

const limpiarStatus = ()=> {
    setStatus(-1);
}



const resetLista=()=>{

    const filtrarVectorCursosOriginal = cursos.filter(item=>
            ((item.descripcion == persona && persona != '-1') ||
                persona=='-1')
            && ((item.Tipo_usuario == tipoPersonal && tipoPersonal != '-1') ||
            tipoPersonal=='-1')
            && ((item.Tipo_permiso == permiso && permiso != '-1') ||
            permiso=='-1')
            && ((item.activo == valorSegunStatus(status) && status != '-1') ||
            status=='-1')            
            && (((((item.cursos == cantidad && cantidad != '-1') ||
            cantidad=='-1')) && exactamenteIgual )
            || ((((item.cursos >= cantidad && cantidad != '-1') ||
            cantidad=='-1')) && !exactamenteIgual ))) 
            .sort((a,b)=>{return comparacion(a,b)})
    
         setCursosAmostrar(filtrarVectorCursosOriginal)

}

const borrarProfesor = async (id_profesor)=>{
    try{
        const resultado = await Axios.delete(`/api/tablasgenerales/profesor/${id_profesor}`)
        return true
    }catch(err){
        if (err.response.status==403){ 
            Swal.fire({
                html:`<p class="p-4">${err.response.data.message}</p>`,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })   

        }else{
            console.log(err.response)
            alert('Se produjo un error al eliminar al usuario')
        }
        return false
    }
}

const comparacion = (a,b)=>{

    switch (orden){
        case null : return 0 
        case 'cursos':
    
        if(nuevoCampo==true){
                return a[orden]- b[orden]
            }else{
                if (contadorOrden%2==0){
                    return b[orden] - a[orden]
                }else{
                    return a[orden] - b[orden]
                }
            }
            case 'f_solicitud':
    
                const dia_a = Number(a[orden].substring(0,2));
                const mes_a  = Number(a[orden].substring(3,5));
                const anio_a = Number(a[orden].substring(6,10));
    
                const fa = new Date(anio_a,mes_a,dia_a);
    
                const dia_b = Number(b[orden].substring(0,2));
                const mes_b  = Number(b[orden].substring(3,5));
                const anio_b = Number(b[orden].substring(6,10));
    
                const fb = new Date(anio_b,mes_b,dia_b);
    
                if(nuevoCampo==true){
                    return fa-fb
                }else{
                    if (contadorOrden%2==0){
                        return fb-fa
                    }else{
                        return fa-fb
                    }
                }        
        default : 
            if(nuevoCampo==true){
                return a[orden].localeCompare(b[orden])
            }else{
                if (contadorOrden%2==0){
                    return b[orden].localeCompare(a[orden])
                }else{
                    return a[orden].localeCompare(b[orden])
                }
            }
    }
    
}

const refrescarLista = ()=>{
    setContadorOperaciones(contadorOperaciones+1)
}

const funcionOrden = (nombre_campo)=>{

    if (orden==nombre_campo){
        setNuevoCampo(false)
    }else{
        setNuevoCampo(true)
    }

    setOrden(nombre_campo)
    setContadorOrden(contadorOrden+1)

}

const buscarCursosSinRenderizar = async ()=>{

    try{          
        const {data} = await Axios.get(`/api/usuarios/all`)
        setCursos(data)
        listarUltimoCursosCreados(data,setUltimosCursosCreados)
    }catch(err){
        console.log(err)
    }
}

function finalizarAltaOcopia (alta,id_nuevo_usuario){

    buscarCursosSinRenderizar() 
    if (alta){
        setCrearNuevoUsuario(false)
        setUsuarioSeleccionado({id_prof:id_nuevo_usuario,nombre:''});
    }
}

function finalizarPassword (){

    setUsuarioSeleccionadoPassword(null)
    toggle()
}


function IniciarBorrarUsuario (usuario){

   if (usuario.cursos > 0){
       Swal.fire({
        html:'<p class="p-4">El usuario no puede ser eliminado porque actualmente se encuentra dictando materias</p>',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
    })   
   }else{

        Swal.fire({
            text:`¿Confirma la eliminación de ${usuario.descripcion}?`,
            showCancelButton:true,
            confirmButtonText:'Si, eliminar al usuario',
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    
                    borrarProfesor(usuario.id_prof).then((resultado)=>{

                        if (resultado){
                            Swal.fire({
                                html:'<p class="p-4">Se eliminó al usuario</p>',
                                icon: 'warning',
                                confirmButtonColor: '#3085d6',
                            })   
                            setPersona(-1) // si para borrar seleccionó a una persona ya no está en la lista
                            refrescarLista() 
                        }
                   })
                }else{
                    console.log("Se canceló la eliminación del usuario")
                }
            }
        )
   }
}

const personasDelPersonal = ()=>{

    return cursos.map(item=>item.descripcion).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const cantidadCursosDelPersonal = ()=>{

    return cursos.map(item=>item.cursos).sort((a,b)=>a-b).filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const permisosDelPersonal = ()=>{

    return cursos.map(item=>item.Tipo_permiso).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const tiposDelPersonal = ()=>{

    return cursos.map(item=>item.Tipo_usuario).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const handleChangeSelectPersonal = (e)=> {
   
    setPersona(e.target.value)
        // el resto de la acción se desarrolla en un usseffect

}

const limpiarFiltros = ()=> {
    
    setPersona(-1)
    setTipoPersonal(-1);
    setPermiso(-1);
    setCantidad(-1);
    setStatus(-1);

    setCursosAmostrar(cursos)

}

const procesarSeleccionCantidad = (exactamenteIgual)=>{

    setExactamenteIgual(exactamenteIgual)
}

const handleChangeSelectCantidad = (e)=> {
    
    setCantidad(e.target.value);
    // el resto de la acción se desarrolla en un usseffect
}

const modificarListaPorCantidadCursos = ()=>{


    let filtrarVectorCursosOriginal=[];

   /* if(exactamenteIgual){
        filtrarVectorCursosOriginal = cursos.filter(item=>item.cursos == cantidad)
    }else{
        filtrarVectorCursosOriginal = cursos.filter(item=>item.cursos >= cantidad)
    }*/


    filtrarVectorCursosOriginal = cursos.filter(item=>
        ((item.descripcion == persona && persona != '-1') ||
            persona=='-1')
        && ((item.Tipo_usuario == tipoPersonal && tipoPersonal != '-1') ||
        tipoPersonal=='-1')
        && ((item.Tipo_permiso == permiso && permiso != '-1') ||
        permiso=='-1')
        && (((((item.cursos == cantidad && cantidad != '-1') ||
        cantidad=='-1')) && exactamenteIgual )
        || ((((item.cursos >= cantidad && cantidad != '-1') ||
        cantidad=='-1')) && !exactamenteIgual )
        ))
        
       .sort((a,b)=>{return comparacion(a,b)})

        setCursosAmostrar(filtrarVectorCursosOriginal)

    return 
    if(exactamenteIgual){
        filtrarVectorCursosOriginal = cursos.filter(item=>
            ((item.descripcion == persona && persona != '-1') ||
                persona=='-1')
            && ((item.Tipo_usuario == tipoPersonal && tipoPersonal != '-1') ||
            tipoPersonal=='-1')
            && ((item.Tipo_permiso == permiso && permiso != '-1') ||
            permiso=='-1')
            && ((item.cursos == cantidad && cantidad != '-1') ||
            cantidad=='-1')) 
            .sort((a,b)=>{return comparacion(a,b)})
    }else{
        filtrarVectorCursosOriginal = cursos.filter(item=>
            ((item.descripcion == persona && persona != '-1') ||
                persona=='-1')
            && ((item.Tipo_usuario == tipoPersonal && tipoPersonal != '-1') ||
            tipoPersonal=='-1')
            && ((item.Tipo_permiso == permiso && permiso != '-1') ||
            permiso=='-1')
            && ((item.cursos >= cantidad && cantidad != '-1') ||
            cantidad=='-1')) 
            .sort((a,b)=>{return comparacion(a,b)})

    }

   
}

const handleChangeStatus = (e)=> {
    
  
    setStatus(e.target.value)

       // el resto de la acción se desarrolla en un usseffect


}

const handleChangeSelectTiposPersonal = (e)=> {
    
  
    setTipoPersonal(e.target.value)

       // el resto de la acción se desarrolla en un usseffect


}

const handleChangeSelectPermiso = (e)=> {
 
    setPermiso(e.target.value);

    // el resto de la acción se desarrolla en un usseffect
   
}





const copiarCurso = (id)=>{
    setCopiarUnCurso(true)
    setCrearCurso(false)
    setCursoAcopiar(id)
    setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);
}

const cambiarTipoCurso = (e)=>{
    // viene Standard, Ensamble o Instrumental
    setTipoCurso(e.target.value)
}

const iniciarCrearUsuario = ()=>{
    setUsuarioSeleccionado(null);
    setCrearNuevoUsuario(true)
    toggle();
}

const iniciarModificarPassword = (persona)=>{
    setUsuarioSeleccionadoPassword(persona)
    toggle()
}



const marcarTodo =()=>{
    const aux = cursosAmostrar.map(item=>{return {...item,seleccion:true}})
    setCursosAmostrar(aux)
}

const desMarcarTodo =()=>{
    const aux = cursosAmostrar.map(item=>{return {...item,seleccion:false}})
    setCursosAmostrar(aux)
}

const gestionarChecks = (marcarTodos)=>{

    if (marcarTodos){
        marcarTodo();
    }else{
        desMarcarTodo();
    }
}  

const cambiarCheck =(e)=>{

    const aux3 = cursosAmostrar.map(item=>{
        if (item.id_prof!=e.target.value){
            return item
        }else{
            return {...item,seleccion:!item.seleccion}
        }
    })

    setCursosAmostrar(aux3)
}

function armarListaEmailsSync(lista){
    // tomo y valido por separado el email y el email alternativo (email1 y email2)
    // Para enviar el mail individualmente se toma otro email que del stored procedure vienen ambos ya separados por comas en uno solo
    // El stored procedure spListarAlumnosActivosPlus_new envia 3 campos de mails (mail, mail1 y mail2)
    // mail es el que se usaba originalmente en donde se combina el mail y el email_secundario si existen separados por comas y en la vista lo uso para enviar un mail individualmente
    // mail1 y mail2 corresponden al mail principal y al secundario pero lo recibo por separado para poder darle un tratamiento más cómodo para validar y armar la lista de emails masivos
    
        const emails1 = lista.filter(item=>item.email.trim()!=''  && item.email!=0 && item.seleccion && validarEmail(item.email.trim())).map(item=>item.email.trim())
    
        const emails_no_validos1 = lista.filter(item=>item.email.trim()!='' && item.email!=0 && item.seleccion && !validarEmail(item.email.trim()))
    
        return {emails:[...emails1],errores:[...emails_no_validos1]} // se envían de esta forma con el spread operator porque originalmente se usó en la vista alumnos en donde se manejaban 2 listas de mails diferentes (email, email1 y email2), en este caso es una sola lista podríamos no usar el spread operator pero lo dejamos
}

const enviarMail = ()=>{
    
    const seleccionados = cursosAmostrar.some(item=>item.seleccion==true)

    if(!seleccionados){
        alert('No hay alumnos seleccionados')
        return
    }

    const resultado = armarListaEmailsSync(cursosAmostrar) // la lista de emails no la armo más aquí sino en el click de enviar mail

        //alert('Se encontraron emails inválidos\n\n' + resultado.errores)

        const html_errores = formatearErrores(resultado)

        Swal.fire({
            html:html_errores,
            icon: 'warning',
            confirmButtonText:'Continuar',
            confirmButtonColor: '#3085d6',
            showCancelButton:true,
            cancelButtonText:'Cancelar'
            }).then((respuesta)=>{

                if(resultado.emails.length==0){
                    return
                }
            
                if (respuesta.value && resultado.emails.length){
                    window.open(`mailto:${resultado.emails}`, '_blank')
                }
            })
    
}

const cambiarCursosRecuperatorios = (e)=>{
    // viene 1 o 0 para indicar si es o no recuperatorio 
    setCursosRecuperatorios(e.target.value)
}

const iniciarNuevoCurso = ()=>{
    setCrearCurso(true);
    
    setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);
}

if (cargandoCursos){
    return <Main center><Loading/><span className="cargando">Cargando profesores y personal administrativo...</span></Main>
  };

  //`/curso/${curso.nro_curso}`
return(
    <Main>
        { isShowing && (usuarioSeleccionado || crearNuevoUsuario) && <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1100px'}} estiloWrapper={{background:'#000000bf'}}>
            <AbmProfesor id_prof={usuarioSeleccionado ? usuarioSeleccionado.id_prof : null} 
                       finalizarAltaOcopia={finalizarAltaOcopia}
                       esModal={true}/>    
        </Modal>}

        { isShowing && usuarioSeleccionadoPassword && <Modal titulo={'Modificación de datos de acceso (usuarios)'} hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
            <AbmPassword profesor={usuarioSeleccionadoPassword} 
                       finalizar={finalizarPassword}
                       esModal={true}/>    
        </Modal>}

        <div className="bg-blue text-whitexxx p-4 rounded relative mt-v ml-auto mr-auto"> 
        <div className="flex f-row f-cabecera justify-content-space-between">
            <TipoCursos hayFiltrosActivos = {hayFiltrosActivos}
            limpiarFiltros = {limpiarFiltros}
            persona = {persona}
            handleChangeSelectPersonal = {handleChangeSelectPersonal}
            personas = {personas}
            tipoPersonal = {tipoPersonal}
            handleChangeSelectTiposPersonal = {handleChangeSelectTiposPersonal}
            tiposPersonal = {tiposPersonal}
            permiso = {permiso}
            permisos = {permisos}
            handleChangeSelectPermiso = {handleChangeSelectPermiso}
            cantidad = {cantidad}
            cantidadesCursos = {cantidadesCursos}
            handleChangeSelectCantidad = {handleChangeSelectCantidad}
            procesarSeleccionCantidad = {procesarSeleccionCantidad}
            exactamenteIgual = {exactamenteIgual}
            limpiarCantidad = {limpiarCantidad}
            limpiarPermiso = {limpiarPermiso}
            limpiarPersona = {limpiarPersona}
            limpiarTipoPersonal = {limpiarTipoPersonal}
            status = {status}
            handleChangeStatus = {handleChangeStatus}
            listaStatus = {listaStatus}
            limpiarStatus = {limpiarStatus}
            />

            {/*<div className="flex f-col centro-w300 ml-auto mr-auto res-lista">
                <span>{cursosAmostrar.length==1 ? `1 usuario encontrado`:`${cursosAmostrar.length} usuarios encontrados`} </span> 
            </div>  */}

            {true && cuatrimestreActivo && <Cabecera cuatrimestreActivo={cuatrimestreActivo} 
                                         iniciarCrearUsuario={iniciarCrearUsuario}
                                         refrescarLista={refrescarLista}
                                         listaEmails={listaEmails}
                                         enviarMail={enviarMail}
                                         listaEmailsSeleccion={listaEmailsSeleccion}/>}

        </div>

        <div className="flex f-col centro-w300 ml-auto mr-auto res-lista">
                <span>{cursosAmostrar.length==1 ? `1 usuario encontrado`:`${cursosAmostrar.length} usuarios encontrados`} </span> 
        </div>  

        <table className="tableUsuarios mt-2">
            <thead className="bg-blue-500 text-white ">
               <tr className="titulo-lista">
                    <th scope="col"></th>
                    {usuario.id_permiso > 1 && <th>
                        <a onClick={()=>gestionarChecks(true)} 
                            title="Marcar todos" 
                            className="tdec-none cursor-pointer ml-2 color-63 ">
                            <FontAwesomeIcon className="cursor-pointer text-white" icon={faCheckCircle}/> 
                        </a> 

                        <a onClick={()=>gestionarChecks(false)} 
                            title="Desmarcar todos" 
                            className="tdec-none cursor-pointer ml-2 mr-2 color-63 ">
                            <FontAwesomeIcon className="cursor-pointer text-white" icon={faCircle}/> 
                        </a> 
                    </th>}                          
                    <th scope="col">#ID</th>
                    {/*<td scope="col"><Seleccionador valor={tipo} onchange={handleChangeSelectTipo} vector = {tipos}/></td>*/}
                    <th scope="col" className={orden=='descripcion' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('descripcion')}>Usuario</th>
                    <th scope="col" className={orden=='Tipo_usuario' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('Tipo_usuario')}>Tipo</th>
                    <th scope="col" className={orden=='Tipo_permiso' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('Tipo_permiso')}>Permiso</th>
                    <th scope="col" className={orden=='cursos' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('cursos')}>Cursos</th>
                    <th scope="col">Teléfono</th>
                    <th className="p-2" scope="col">Activo</th>
                    <th colspan="4" className="pad-list1" scope="col"><span>Acciones</span></th>
                </tr>
            </thead>
            <tbody>
            {/*<tr className="titulo-lista">
                    <td scope="col"><Seleccionador nombre='Usuario' valor={persona} onchange={handleChangeSelectPersonal} vector = {personas}/></td>
                    <td scope="col"><Seleccionador nombre='Tipo' valor={tipoPersonal} onchange={handleChangeSelectTiposPersonal} vector = {tiposPersonal}/></td>
                    <td scope="col"><Seleccionador nombre='Permiso' valor={permiso} onchange={handleChangeSelectPermiso} vector = {permisos}/></td>
                    <td scope="col"><Seleccionador nombre ='Cursos' valor={cantidad} onchange={handleChangeSelectCantidad} vector = {cantidadesCursos}/>
                        { cantidad!="-1" &&  <div className="contenedor-select-mymn">    
                                <span title="Exactamente igual al valor seleccionado" onClick={()=>procesarSeleccionCantidad(true)} className={exactamenteIgual ? 'seleccionado cursor-pointer' : 'no-seleccionado cursor-pointer'}><FontAwesomeIcon  icon={faEquals}/></span>
                                <span title="Igual o mayor al valor seleccionado" onClick={()=>procesarSeleccionCantidad(false)} className={exactamenteIgual ? 'no-seleccionado cursor-pointer' : 'seleccionado cursor-pointer'}><FontAwesomeIcon icon={faGreaterThanEqual}/></span>
                            </div>    } 
                    </td>
                    <td scope="col">Teléfono</td>
                    <td colspan="2" className="pad-list1" scope="col"><span>Acciones</span></td>
                </tr>*/}
            {
                cursosAmostrar
                .map((item,index)=>{return {...item,indice:index+1}})
                .map(curso => {
                return (
                    <tr key={curso.id_prof} className="bg-blueTabla border-bottom-solid">
                        <td className="indice">{curso.indice}</td>
                         <td className="text-center"><input value={curso.id_prof} 
                            checked={curso.seleccion} 
                            onChange={(e)=>cambiarCheck(e)} type="checkbox" 
                            title="Marque o desmarque éste usuario"/>
                        </td>
                        <td className="filas-lista-principal">{curso.id_prof}</td>
                        <td onClick={()=>{setUsuarioSeleccionado(curso);
                                     toggle()}} title={curso.descripcion} className="filas-lista-principal cursor-pointer" >
                                {curso.descripcion}
                        </td>                        
                        <td className="filas-lista">{curso.Tipo_usuario}</td>
                        <td className="filas-lista">{curso.Tipo_permiso}</td>
                        <td className="filas-lista">{curso.cursos}</td>
                        <td className="filas-lista">{curso.telefono}</td>
                        <td className="filas-lista text-center">
                            {curso.activo && <FontAwesomeIcon title="Usuario activo" className="ml-2 color-green text-small" icon={faCheckCircle}/>}
                            {!curso.activo && <FontAwesomeIcon title="Usuario inactivo" className="ml-2 text-red-dark text-small" icon={faTimesCircle}/>}
                         </td>
                        {/*<td>
                            <a className="mr-2 ml-2 text-white" href={crearMailToIndividual(curso.email)}> {curso.email}</a>      
                        </td>*/} 
                        <td title={curso.email!=null && curso.email!='' ? `Enviar un mail a ${curso.email}` : 'No posee e-mail'} className="filas-lista-alumnos cursor-copy p-iconos-listas width-35" >
                              <a target="_blank" className="filas-lista color-tomato text-large hw" href={crearMailToIndividual(curso.email)}><FontAwesomeIcon icon={curso.email != null && curso.email.trim()!='' ? faEnvelopeOpen : faCircle} /></a>  
                        </td>                        
                        <td onClick={()=>{setUsuarioSeleccionado(curso);
                                     toggle()}} title={`Abrir la ficha del usuario ${curso.descripcion}`} className="filas-lista cursor-copy p-iconos-listas width-35" >
                                <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                        </td>  
                        <td title="Modificar los datos de acceso del usuario" onClick={()=>iniciarModificarPassword(curso)} className="cursor-pointer p-iconos-listas width-35" >
                                <FontAwesomeIcon icon={faKey}/>
                        </td>
                        <td onClick={()=>{IniciarBorrarUsuario(curso)}} title={`Eliminar a ${curso.descripcion}`} className="filas-lista cursor-copy p-iconos-listas width-35" >
                                <FontAwesomeIcon className="cursor-pointer"  icon={faTrash}/>
                        </td> 
                     </tr>
                   )
                })
            }
            </tbody>
        </table>
      </div>
      {crearCurso && <AbmCurso cuatrimestreActivo={cuatrimestreActivo} finalizarAltaOcopia={finalizarAltaOcopia}/>}
      {copiarUnCurso && <AbmCurso cuatrimestreActivo={cuatrimestreActivo} cursoCopiado={cursoAcopiar} finalizarAltaOcopia={finalizarAltaOcopia}/>}
    </Main>
)
    }



function Seleccionador({vector,onchange,valor,nombre}){
    let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
    let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";

    return (            
        <div className="input-field col s12">
            <select value={valor} onChange = {onchange} className={valor=="-1" ? clasesSelect : clasesActivo}>
                <option value="-1" key="-1">{nombre}</option>
                {vector.map(item=><option value={item} key={item}>{item}</option> )}
            </select>
        </div>
        )
        
}    

function Cabecera({enviarMail,iniciarCrearUsuario,refrescarLista,
        listaEmailsSeleccion,listaEmails}){
    return <div className="flex f-col alignself-fe">
        {/*<span className="cabecera mr-4">{`Listado de profesores y administrativos`}</span>*/} 
        <span title="Refrescar la lista" onClick={()=>refrescarLista()} 
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faSync}/> Refrescar
        </span>
        <span className="cursor-pointer a-l-c mr-4" onClick={iniciarCrearUsuario} >
                <FontAwesomeIcon className="" icon={faPlusSquare}/> Crear un nuevo usuario
        </span>
        {/*<a target="_blank" title="Enviar un mail solo a los usuarios seleccionados con un filtro" className="tdec-none cursor-pointer mr-2 relative color-63 " href={crearMailToListaEmails(listaEmailsSeleccion)}>
                    <FontAwesomeIcon className="cursor-pointer color-tomato" icon={faUserCheck}/> Mail a los seleccionados
        </a>*/} 
        <a target="_blank" title="Enviar un mail solo a los usuarios seleccionados con un filtro" className="tdec-none cursor-pointer mr-2 relative" onClick={enviarMail}>
                    <FontAwesomeIcon className="cursor-pointer" icon={faUserCheck}/> Mail a los seleccionados
        </a> 
        
        {/*<a title="Enviar un mail a todos los usuarios de la lista" target="_blank" className="tdec-none cursor-pointer mr-2 color-63 " href={crearMailToListaEmails(listaEmails)}>
            <FontAwesomeIcon className="color-tomato" icon={faMailBulk}/> Mail grupal
        </a>*/} 
   </div>   
}



/*
function TipoCursos({cambiarTipoCurso}){

    return 
    (
        <div className="input-field col s12">
            <select onChange = {cambiarTipoCurso} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                <option value="-1" key="1">Regular</option>
                <option value="-1" key="21">Recuperatorio</option>
            </select>
        </div>
    )
    //<span className="absolute selecTipoCurso">Tipo de curso</span>

}*/

function TipoCursos({hayFiltrosActivos,
    limpiarFiltros,
    persona,handleChangeSelectPersonal,personas,
    tipoPersonal, handleChangeSelectTiposPersonal, tiposPersonal,
    permiso, permisos, handleChangeSelectPermiso, cantidad, cantidadesCursos,
    handleChangeSelectCantidad,procesarSeleccionCantidad,exactamenteIgual,
    limpiarPersona,
    limpiarPermiso,
    limpiarTipoPersonal,
    limpiarCantidad,
    status,
    handleChangeStatus,
    listaStatus,limpiarStatus
}){
return (
<div className="flex f-col text-white">

   
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Usuario</span>

        <Seleccionador nombre='Todos' valor={persona} onchange={handleChangeSelectPersonal} vector = {personas}/>
        { persona!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarPersona}/>
                    </button>}
    </div>
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Tipo de usuario</span>

        <Seleccionador nombre='Todos' valor={tipoPersonal} onchange={handleChangeSelectTiposPersonal} vector = {tiposPersonal}/>
        { tipoPersonal!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarTipoPersonal}/>
                    </button>}
    
    </div>    
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Permiso</span>

        <Seleccionador nombre='Todos' valor={permiso} onchange={handleChangeSelectPermiso} vector = {permisos}/>
    
        { permiso!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarPermiso}/>
                    </button>}
    </div>

    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Cursos asignados</span>

        <Seleccionador nombre ='Todos' valor={cantidad} onchange={handleChangeSelectCantidad} vector = {cantidadesCursos}/>
                { cantidad!="-1" &&  <div className="contenedor-select-mymn">    
                        <span title="Exactamente igual al valor seleccionado" onClick={()=>procesarSeleccionCantidad(true)} className={exactamenteIgual ? 'seleccionado cursor-pointer' : 'no-seleccionado cursor-pointer'}><FontAwesomeIcon  icon={faEquals}/></span>
                        <span title="Igual o mayor al valor seleccionado" onClick={()=>procesarSeleccionCantidad(false)} className={exactamenteIgual ? 'no-seleccionado cursor-pointer' : 'seleccionado cursor-pointer'}><FontAwesomeIcon icon={faGreaterThanEqual}/></span>
                    </div>    } 

        { cantidad!="-1" && <button><FontAwesomeIcon 
            className="ic-abm"
            icon={faWindowClose} 
            onClick={limpiarCantidad}/>
        </button>}                    
    </div>
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Status</span>

        <Seleccionador nombre ='Todos' valor={status} onchange={handleChangeStatus} vector = {listaStatus}/>

        { status!="-1" && <button><FontAwesomeIcon 
            className="ic-abm"
            icon={faWindowClose} 
            onClick={limpiarStatus}/>
        </button>}                    
    </div>

{hayFiltrosActivos && <a onClick={limpiarFiltros} title="Limpiar todos los filtros" className="cursor-pointer mt-2 mr-2 ml-2">
<FontAwesomeIcon className="color-tomato" icon={faTrash}/> <span className="text-small">Limpiar filtros</span>
</a> }
</div>

)

}

function listarUltimoCursosCreados(cursos,setUltimosCursosCreados){
    const cursos_filtrados = cursos.map(item=>{return {id:item.nro_curso,
                                                       materia:item.campo_auxiliar,
                                                       profesor:item.nombre,
                                                       fecha:item.columna}}).sort((a,b)=> b.id - a.id).slice(0,10)
    setUltimosCursosCreados(cursos_filtrados)
}

function ListaUltimosCursos({cursos}){
    
    return(<div className="contenedor-uc"> Ultimos cursos creados
        {
            cursos.map(item=>{
                return (
                <Link  key={`ult-cur${item.id}`} className="text-whitexxx" 
                                to={{
                                    pathname: `/curso/${item.id}`,
                                    state: {nro_curso:item.id}
                                }}> 
                <span className="ultimos-cursos" title={`${item.materia}\n${item.profesor}\nCreado el ${item.fecha}`}>{item.id}</span>
                            </Link> 
            )
                })
        }
    </div>

    )
}

function crearMailToIndividual(email){
    return email!=null && email!='' ? `mailto: ${email}` : ``
}

function armarListaEmails(usuarios,setListaEmails){

    const emails = usuarios.filter(item=>item.email.trim()!='').map(item=>item.email)

    setListaEmails(emails)
}

function crearMailToListaEmails(listaEmails){
    return listaEmails.length>0 ? `mailto: ${listaEmails}` : ``
}

function ordenarVector(vector){
    vector.sort((a,b)=>{

        if(a.dia>b.dia){ // ordenar primero por día
            return 1
        }

        if(a.dia<b.dia){ // ordenar primero por día
            return -1
        }

        if (a.dia===b.dia){ // si el día es igual ordenar por horario comienzo
            return a.comienzo.localeCompare(b.comienzo)
        }

    })

    return vector
}

function formatearErrores(resultado){

    let items = '';
    const cantMailsOk = resultado.emails.length;

    resultado.errores.forEach(item=>{items = items + `<b>${item.descripcion}</b>   <p>${item.email}</p>`})

    let texto_aclaratorio = cantMailsOk > 1 ? `Se enviarán ${cantMailsOk} mails` : cantMailsOk == 1 ? 'Se enviará 1 mail ' : 'No se enviará ningún mail';
    let texto_aclaratorio_2 = resultado.errores.length > 0 ? `Se excluirán los siguientes e-mails inválidos:` : '';

    let html = `
<div class="text-left text-small">
<p>${texto_aclaratorio}</p>
<p>${texto_aclaratorio_2}</p>
<br>
${items}
</div>
`
return html

}

function validarEmail(email){
    // const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    //http://www.regular-expressions.info/email.html
     const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
    // const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
     
     return re.test(String(email).toLowerCase().trim());
}

function valorSegunStatus(status){
    return status=='Activos' ? true : false 
}

function formatearStatus(status){

    return status==true ? true : false
    // hago esto porque en la tabla muchos tienen NULL en el campo activo
}