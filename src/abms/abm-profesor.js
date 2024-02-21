import React from 'react';
import {useState, useEffect} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faDotCircle } from '@fortawesome/free-regular-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import HistorialProfesor from '../componentes/Historial-profesor';
import ImpresionesAlumno from '../componentes/Impresiones-alumno';
import {hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import { faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import useModal from '../hooks/useModal';
import Curso from '../Vistas/Curso';
import Modal from '../componentes/Modal';

export default function AbmProfesor({id_prof, finalizarAltaOcopia,esModal,id_copia}){

    const provinciaDefault = [{id_provincia:-1, nombre:"Seleccionar país"}]

    // estados flags 
    const [cargandoDatosTablasGenerales,setCargandoTablasGenerales] = useState(false);
    const [cargandoProvincias,setCargandoProvincias] = useState(false);
    const [cargandoDatosProfesor,setCargandoDatosProfesor] = useState(false);
    const [grabandoDatosAlumno,setGrabandoDatosAlumno] = useState(false);
    const [tablasCargadas,setTablasCargadas]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [cargandoMateriasInstrumentos,setCargandoMateriasInstrumentos]=useState(false);
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

    const [paises,setPaises] = useState([]);
    const [provincias,setProvincias] = useState(provinciaDefault); // lo usarmos para cargar el select de provincia cada vez que cambia el pais y se completa en base al vectorProvincias que ya tienen todas las provincias sin necesidad de ir a buscar al servidor por pais
    const [vectorProvincias,setVectorProvincias]= useState([]); // se usará para traer 1 sola vez todas las provincias y trabajar sobre el mismo con filter cada vez que se cambie el pais así evitamos ir N veces al servidor
    const [vectorDias, setVectorDias] = useState([]);
    const [vectorMeses, setVectorMeses]=useState([]);
    const [vectorAnios, setVectorAnios] = useState([]);
    
    // vectores de selección de otras operaciones

    const [materias, setMaterias]= useState([]);
    const [instrumentos, setInstrumentos]= useState([]);
    const [nivelesI, setNivelesI]= useState([]);
    const [nivelesE, setNivelesE]= useState([]);

    // Variables para manejar otras operaciones

    const [materiaSeleccionada,setMateriaSeleccionada]=useState(-1)
    const [instrumentoSeleccionado,setInstrumentoSeleccionado]=useState(-1)
    const [agregarInstrumento,setAgregarInstrumento]=useState(false)
    const [agregarMateria,setAgregarMateria]=useState(false)
    const [materiasTestAlumno, setMateriasTestAlumno]= useState([]);
    const [instrumentosAlumno, setInstrumentosAlumno]= useState([]);
    const [errorMateria,setErrorMateria]=useState(null)
    const [errorInstrumento,setErrorInstrumento]=useState(null)
    const [backupInstrumentosAlumno,setBackupInstrumentosAlumno]=useState([]);
    const [backupMateriasTestAlumno,setBackupMateriasTestAlumno]=useState([]);
    const [huboCambiosInstrumentos,setHuboCambiosInstrumentos]=useState(false)
    const [huboCambiosMaterias,setHuboCambiosMaterias]=useState(false)
    const [buscarHistorial,setBuscarHistorial]=useState(false)
    const [contadorModificaciones,setContadorModificaciones]=useState(0)
    const[datosParaImpresiones,setDatosParaImpresiones]=useState(null)
    const[historial,setHistorial]=useState([])
    const [idCursoSeleccionado,setIdCursoSeleccionado] = useState(null)
    const [tiposUsuario, setTiposUsuario]= useState([]);
    const [permisosUsuario, setPermisosUsuario]= useState([]);
    const {toggle, isShowing } = useModal();

  
    // estado objeto de inicialización que inicializa los valores del abm 
    // en el alta o es cargado con los valores de la base de datos en una modificación
    // este objeto se pasa al formulario Formik para que el estado del formulario se inicialice
    // con este objeto. Luego el resto del trabajo se hace sobre el estado del formulario  
    const [objetoInicializacion,setObjetoInicializacion]=useState({
        id_prof:-1,
        pais:'',
        provincia:'',        
        nombre:'',
        apellido:'',
        anio:"2020",
        mes:"01",
        dia:"01",
        documento:'',
        sexo:'M',
        domicilio:'',
        localidad:'',
        codpostal:'',
        email:'',
        telefono:'',
        usuario:'',
        permiso:-1,
        tipoUsuario:-1,
        activo:false
    })

    useEffect(()=>{

        const cargarTablasGenerales = async ()=>{

            setCargandoTablasGenerales(true);
        
            try{
                const vectorResultado = await Promise.all([
                    Axios.get('/api/tablasgenerales/paises'),
                    Axios.get('/api/tablasgenerales/provincias/all'),
                    Axios.get('/api/tablasgenerales/tiposusuario'),
                    Axios.get('/api/tablasgenerales/permisosusuario')                    
                ])

               
                setPaises(vectorResultado[1].data);
                setVectorProvincias(vectorResultado[2].data);

                setTiposUsuario(vectorResultado[2].data);
                setPermisosUsuario(vectorResultado[3].data);

                cargarVectorDias(setVectorDias);
                cargarVectorMeses(setVectorMeses);
                cargarVectorAnios(setVectorAnios);
              
                setCargandoTablasGenerales(false); 
                setTablasCargadas(true)
            }catch(err){
        
                    console.log(err)
                    const mensaje_html = `${err}`

                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   
                    setHuboError(true)
                    setCargandoTablasGenerales(false);
    
                }
            }

            cargarTablasGenerales()
     },[id_prof])

useEffect(()=>{

    const completarDatosDelProfesor = async (id)=>{   
        setCargandoDatosProfesor(true)
        try{
            
                const {data} = await Axios.get(`/api/usuarios/${id}`)

                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para el usuario ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatosProfesor(false)
                    setHuboError(true)
                    return
                }

                const datosDelRecordset = data[0];

                const datosAlumno = {
                    id_prof:id_prof,
                    pais:noNull(datosDelRecordset.pais),
                    provincia:noNull(datosDelRecordset.provincia),
                    nombre:datosDelRecordset.nombre.trim(),
                    apellido:datosDelRecordset.apellido.trim(),
                    documento:noNull(datosDelRecordset.documento),
                    fecha:datosDelRecordset.fecha_nac,
                    anio:datosDelRecordset.fecha_nac.slice(0,4),
                    dia:datosDelRecordset.fecha_nac.slice(8,10),
                    mes:Number(datosDelRecordset.fecha_nac.slice(5,7)),
                    domicilio:noNull(datosDelRecordset.direccion),
                    localidad:noNull(datosDelRecordset.localidad),
                    codpostal:noNull(datosDelRecordset.codpostal),
                    email:noNull(datosDelRecordset.email),
                    telefono:noNull(datosDelRecordset.telefono),
                    usuario:noNull(datosDelRecordset.usuario),
                    permiso:datosDelRecordset.id_permiso,
                    tipoUsuario:datosDelRecordset.id_tipo_usuario,
                    activo: datosDelRecordset.activo ? datosDelRecordset.activo : false // es un campo nuevo en la tabla, si es NULL lo tomamos como no activo para que entren y lo activen

                }
                  
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                
                setObjetoInicializacion({...objetoInicializacion,...datosAlumno}) 

                setDatosParaImpresiones(datosDelRecordset)

                setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
                setCargandoDatosProfesor(false)
 
            }catch(err){

                console.log(err)
                const mensaje_html = `${err}`
                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
            
                setCargandoDatosProfesor(false)
                setHuboError(true)
            }

    }

    const buscarCursosActualesProfesor = async (id)=>{   
        setCargandoDatosProfesor(true)
        try{
            
                const {data} = await Axios.get(`/api/usuarios/profesores/historial/${id}/1`)

                setHistorial(data);

                setCargandoDatosProfesor(false)
                // bugsol 1
                // return datosDelRecordset // retorno un valor para que pueda hacerse algo en el .then ya que al ser async devuelva una promesa
            }catch(err){

                console.log(err)
          
                setCargandoDatosProfesor(false)
            }

    }

    if (tablasCargadas ){ // este useEffect se dispara solo si ya se cargaron las tablas generales

        if (id_prof){ //  si se recibió el nùmero de alumno por propiedad es decir si es una modificación
            
            setTituloAbm(`Editar el usuario #${id_prof}`);
            setTituloCerrar('Cerrar la ficha del usuario');
            completarDatosDelProfesor(id_prof); 
            buscarCursosActualesProfesor(id_prof)
        }
        else if (id_copia){
            setTituloAbm(`Crear un usuario como copia del usuario #${id_copia}`);
            setTituloCerrar('Cerrar la ficha del usuario');
            completarDatosDelProfesor(id_copia); 
        }
        else{ //  si no recibió el nùmero de curso por propiedad, es decir un alta
            setTituloAbm(`Crear un nuevo usuario`);
            setTituloCerrar('Cancelar');
            hacerScroll("nuevo-alumno");
            cargarProvinciasArgentina();
            
            let anioNacimientoDefaultAlta=anioNacimientoAlta();

            setObjetoInicializacion({...objetoInicializacion,anio:anioNacimientoDefaultAlta}) 
            document.getElementById('abm-nombre').focus()

        }

    }

},[tablasCargadas,id_prof,contadorModificaciones])     
  
useEffect(()=>{
    
   buscarAlgoDelUsuario()
   .then(()=> hacerScroll('ref-ficha'))

},[contadorOperaciones])


useEffect(()=>{ // hago esto para evitar el warning de can't perform... creo un effect para el mismo evento para que se ejecuten llamadas asincrónicas en distintos threads
                // podría haberlo agregado el effect que también se dispara con el mismo cambio contadorOperaciones pero para que sea más claro lo hice en dos efectos distintos pero disparados por el mismo cambio
    let mounted = true;

    if (mounted && id_prof){ // buscar el historial solo si esta montado y si hay un id_alumno, si es un alta no buscar todavía el historial
        setBuscarHistorial(true)
    }
    
    return ()=> mounted = false
 },[contadorOperaciones]) 



 const cerrarVisualizacionCurso = () => {
    toggle() // para que cierre el modal 
 }

const buscarAlgoDelUsuario = async ()=>{

    return true

}

const grabarAlumno = async (values)=>{

    let resultado;
    let id_alumno_interno;
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const objetoAgrabar = { 
                nombre: values.nombre.trim(),
                apellido: values.apellido.trim(),
                provincia:values.provincia.trim(),
                pais:values.pais.trim(),
                fechaNacimiento:{
                    anio:Number(values.anio),
                    mes:Number(values.mes),
                    dia:Number(values.dia)},
                direccion:values.domicilio.trim(),
                localidad:values.localidad.trim(),
                codigoPostal:values.codpostal.trim(),
                documento:values.documento.trim(),
                telefono:values.telefono.trim(),
                email:values.email.trim(),
                nombreUsuario:values.usuario.trim(),
                permisoId:Number(values.permiso),
                tipoUsuarioId:Number(values.tipoUsuario),  
                activo:values.activo,
        }

    setGrabandoDatosAlumno(true)

    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`

    try{
        if (id_prof){
            resultado= await Axios.put(`/api/usuarios/${id_prof}`,objetoAgrabar)
            id_alumno_interno = id_prof; // es el id del alumno a modificar
        }else{
            resultado= await Axios.post(`/api/usuarios`,objetoAgrabar)
            id_alumno_interno = resultado.data.id_prof; // es el id del nuevo alumno 
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nuevo usuario #${resultado.data.id_prof})</p>`
        }

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   

        setGrabandoDatosAlumno(false)

        if (esModal){
            if(id_prof){ // si es modal y es una modificación
                setContadorModificaciones(contadorModificaciones+1)
                finalizarAltaOcopia(false)
            }else{ // si es modal y es un alta
                finalizarAltaOcopia(true,id_alumno_interno)
            }

        }else{ // si no es modal
            finalizarAltaOcopia(true); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso
        }

    }catch(err){
        console.log(err.response)
        let mensaje_html_error;

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del usuario</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del usuario</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del usuario</p><p>${err.response}</p>`
        }


        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatosAlumno(false)
    }
   

}

const iniciarVisualizarCurso = (nroCurso)=>{
   setIdCursoSeleccionado(nroCurso)
   toggle()
}

const iniciarGrabarAlumno = (values)=>{
    let texto;
    let textoConfirmacion;

    if (id_prof){
        texto = `Confirma la modificación del usuario ${id_prof}?`
        textoConfirmacion = 'Si, modificar el usuario'
    }else{
        texto = `Confirma la creación del nuevo usuario?`
        textoConfirmacion = 'Si, crear el usuario'
    }

    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                grabarAlumno(values);

            }else{
                console.log("Se canceló la modificación o creación del usuario")
            }
        }
    )
}

const cargarProvinciasArgentina = ()=>{
    const data = vectorProvincias.filter(item=>item.id_pais==1)
    setProvincias(data)
}


const buscarProvincias = (e,setFieldValue)=>{

    const pais = e.target.value

    setCargandoProvincias(true); 

    let id_provincia;

        //atención e.target.value siempre es un string.
        // por eso aquì en este caso uso doble igual en lugar de triple igual porque item.id_encabezado es un number y encabezado es un string
    const data = vectorProvincias.filter(item=>item.id_pais==pais)

    if (data.length===1){
        id_provincia=data[0].id_provincia;
        setProvincias(data)
        setFieldValue('provincia',id_provincia)
    }else if (data.length>1) {
        setProvincias([{id_provincia:-1, nombre:"Seleccionar"},...data])
        setFieldValue('provincia',-1)
    }else{
        setProvincias([{id_provincia:-2, nombre:"----?----"}])
        setFieldValue('provincia',-2)
    }

    setCargandoProvincias(false); 

}


// Se carga directamente al traer los datos del alumno
/*const initialValuesAlumno = {

} */ 

// es un objeto cuyas propiedades deben coincidir con el nombre
                              // de los Fields y con el nombre del validationSchema

// algunas entidades comienzan de 1 y otras aceptan el valor 0 por eso
// en algunos casos valido con .positive() para los que comienzan de 1, porque positive() excluye el cero
// en otros valido con min(0) para los que comienzan de 0                              
// el .test lo dejo como ejemplo para notar que se pueden hacer validaciones más específicas

const validationSchemaAlumno = Yup.object({

nombre:Yup.string().max(20,'El nombre debe tener como máximo 20 caracteres')
        .required('Falta completar el nombre'),
apellido:Yup.string().max(20,'El apellido debe tener como máximo 20 caracteres')
        .required('Falta completar el apellido'),
documento:Yup.number().min(1000000,'El documento debe tener como mínimo 7 dígitos')
    .max(99999999,'El documento debe tener como máximo 8 dígitos')
    .required('Falta completar el documento'),
usuario:Yup.string().max(15,'El usuario debe tener como máximo 15 caracteres')
    .required('Falta completar el usuario'),  
dia:Yup.number()
    .required('Falta seleccionar el día de nacimiento'),
mes:Yup.number()
    .required('Falta seleccionar el mes de nacimiento'),
anio:Yup.number()
    .min(1940,'El año no es válido')
    .required('Falta seleccionar el año de nacimiento'),        
pais:Yup.string().max(15),
provincia:  Yup.string().max(15),
domicilio:Yup.string().max(50,'El domicilio debe tener como máximo 50 caracteres'),            
localidad:Yup.string().max(15,'La localidad debe tener como máximo 15 caracteres'),    
codpostal:Yup.string().max(10,'El código postal debe tener como máximo 10 caracteres'),            
email:Yup.string().email('El email no es válido').max(200,'El email debe tener como máximo 200 caracteres')
    .required('Falta completar el e-mail'), 
telefono:Yup.string().max(100,'El teléfono debe tener como máximo 100 caracteres').required('Falta seleccionar el teléfono'),
permiso:Yup.number()
    .integer()
    .required('Falta seleccionar el permiso')
    .test("prueba","Falta seleccionar el permiso",value => value >= 0),
tipoUsuario:Yup.number()
    .integer()
    .required('Falta seleccionar el tipo de usuario')
    .test("prueba","Falta seleccionar el tipo de usuario",value => value >= 0),
})                 

const onsubmitAlumno = values =>{
    iniciarGrabarAlumno(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatosTablasGenerales){
        return <Main center><div><Loading/><span className="cargando">Cargando datos generales...</span></div></Main>
    };

    if (cargandoDatosProfesor){
        return <Main center><div><Loading /><span className="cargando">Cargando datos personales del usuario...</span></div></Main>
    };

    return (
        <Main> 
        { grabandoDatosAlumno && <Main><div><Loading blanco={true}/><span className="cargando text-white">Grabando datos...</span></div></Main>}
       
        { isShowing && idCursoSeleccionado && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#000000bf'}}>
                                
                    <Curso id_curso = {idCursoSeleccionado}/>
        
                </Modal>
         }

  <div className={grabandoDatosAlumno ? "hidden": 'pt-4 rounded flex flex-row container-mult-flex-center'} >
             
             <div><div>
                {/*el botòn de cancelar solo lo habilito cuando es un alta o copia*/}
                { !esModal && <button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm"><FontAwesomeIcon icon={faWindowClose}/></button> }
                <Formik validateOnMount 
                enableReinitialize initialValues={objetoInicializacion}
    validationSchema={validationSchemaAlumno} onSubmit={onsubmitAlumno}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty }) =>{ 
    return (
    <Form id="ref-ficha">

    <div className="AnaliticoContainer relative">
        <div  className="mb-2 titulo-cab-modal titulo-abm flex f-row">{tituloAbm}</div>
        <div className="FormAbmContainerLargo">
            <div className="flex f-col">
            {id_prof && dirty && 
                <span type="button" title="Deshacer los cambios y restaurar valores iniciales" 
                    className="cursor-pointer absolute botonRestaurar boton-restaurar-abm-form" 
                    onClick={() => resetForm(initialValues)}>Restaurar
                </span>
            }
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre">Nombre</label>
                    <Field 
                        id="abm-nombre"
                        type="text" 
                        autoComplete="off" 
                        maxLength="20"
                        name="nombre" 
                        onFocus={()=>seleccionarTextoInput("abm-nombre")} 
                        onClick={()=>seleccionarTextoInput("abm-nombre")}                         
                        className={values.nombre ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="nombre"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-apellido">Apellido</label>
                    <Field 
                        id="abm-alumno-apellido"
                        type="text" 
                        maxLength="20"
                        autoComplete="off" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-apellido")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-apellido")}                        
                        name="apellido" 
                        className={values.apellido ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="apellido"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-usuario">Usuario</label>
                    <Field 
                        id="abm-alumno-usuario"
                        type="text" 
                        maxLength="20"
                        autoComplete="off" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-usuario")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-usuario")}                          
                        name="usuario" 
                        className={values.usuario ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="usuario"/></div> 
                {!id_prof && <p className="text-center text-small p-2 color-tomato">
                    <FontAwesomeIcon icon={faInfoCircle}/>
                    (Contraseña predeterminada : 123456)
                </p>}
            </div>   
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Permiso</label>
                    <select onChange={handleChange} value={values.permiso} 
                            name="permiso" 
                            className="w-selabm" id="abm-curso-profesor">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                permisosUsuario.map(item=>
                                    <option key={`abmcurso-permiso${item.id_permiso}`} 
                                        value={item.id_permiso}>{item.descripcion}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="permiso"/></div> 
            </div>   
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-tipoUsuario">Tipo de usuario</label>
                    <select onChange={handleChange} value={values.tipoUsuario} name="tipoUsuario" className="w-selabm" id="abm-curso-tipoUsuario">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                tiposUsuario.map(item=>
                                    <option key={`abmcurso-profes${item.id_tipo_usuario}`} 
                                        value={item.id_tipo_usuario}>{item.descripcion}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="tipoUsuario"/></div> 
            </div>                                  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-documento">Documento</label>
                    <Field 
                        id="abm-alumno-documento"
                        type="text" 
                        autoComplete="off" 
                        maxLength="8"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-documento")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-documento")}                            
                        name="documento" 
                        className={values.documento ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="documento"/></div> 
            </div>  


            </div>  
            <label className="Form__labels" htmlFor="fecha">Fecha de nacimiento</label>
            <div className="flex f-col">
                <div className="flex f-row justify-content-center" id="fecha">
                        <select onChange={handleChange} 
                                value={values.dia}
                                name='dia' 
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                {vectorDias.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>                       
                        <select onChange={handleChange} 
                                value={values.mes} 
                                name='mes'
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorMeses.map(item=><option value={item.id} key={item.id}>{item.mes}</option> )}
                        </select>
                        <select onChange={handleChange} 
                                value={values.anio} 
                                name='anio'
                                
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorAnios.map(item=><option 
                               disabled = {item==1900}  value={item} key={item}>{item}</option> )}
                        </select>
                        
                    </div>
                        <div className="error_formulario"><ErrorMessage name="dia"/></div> 
                        <div className="error_formulario"><ErrorMessage name="mes"/></div> 
                        <div className="error_formulario"><ErrorMessage name="anio"/></div>   
                </div>            
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-domicilio">Domicilio</label>
                    <Field 
                        id="abm-alumno-domicilio"
                        type="text" 
                        maxLength="50"
                        autoComplete="off" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-domicilio")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-domicilio")}                         
                        name="domicilio" 
                        className={values.domicilio ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="domicilio"/></div> 
            </div>   
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-localidad">Localidad</label>
                    <Field 
                        id="abm-alumno-localidad"
                        type="text" 
                        maxLength="15"
                        name="localidad" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-localidad")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-localidad")}                            
                        className={values.localidad ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="localidad"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-codpostal">Código postal</label>
                    <Field 
                        id="abm-alumno-codpostal"
                        type="text" 
                        maxLength="10"
                        name="codpostal" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-codpostal")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-codpostal")}                            
                        className={values.codpostal ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="codpostal"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-pais">Pais</label>
                    <Field 
                        id="abm-alumno-pais"
                        type="text" 
                        autoComplete="off" 
                        maxLength="100"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-pais")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-pais")}                          
                        name="pais" 
                        className={values.pais ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="pais"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-provincia">Provincia</label>
                    <Field 
                        id="abm-alumno-provincia"
                        type="text" 
                        autoComplete="off" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-provincia")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-provincia")}                           
                        maxLength="100"
                        name="provincia" 
                        className={values.provincia ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="provincia"/></div> 
            </div>             
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telefono">Teléfono</label>
                    <Field 
                        id="abm-alumno-telefono"
                        type="text" 
                        autoComplete="off" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-telefono")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-telefono")}                            
                        maxLength="25"
                        name="telefono" 
                        className={values.telefono ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="telefono"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email">E-mail</label>
                    <Field 
                        id="abm-alumno-email"
                        type="email" 
                        autoComplete="off" 
                        maxLength="200"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-email")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-email")}                           
                        name="email" 
                        value={values.email.toLowerCase()}
                        className={values.email ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="email"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-activo">Usuario activo</label>
                    <Field 
                        id="abm-activo"
                        type="checkbox" 
                        name="activo" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="activo"/></div> 
            </div>             
            <button className="Form__submit" type="submit">Grabar</button>
        </div>
      
    </div>    
    </Form>) } }

    </Formik>
        </div>
    </div>
    { id_prof && objetoInicializacion.tipoUsuario == 1 && <div className="flex f-col">
            

            <div className="mb-2">
                <div id="histo-al" className='mb-2 cabecera color-63 border-bottom-solid-light'>{`Cursos actuales (${historial.length})`}</div>
                {<CursadasActuales cursadas={historial} iniciarVisualizarCurso={iniciarVisualizarCurso}/>}
            </div>    

            <div className="pan-abm-al"> 
            <div id="histo-al" className='mb-2 cabecera border-bottom-solid-light'>Historial de cursos</div>
                
                        {buscarHistorial &&  <HistorialProfesor profesor={datosParaImpresiones} id_prof={id_prof} iniciarVisualizarCurso={iniciarVisualizarCurso}/>}

            </div>

        </div>}
    </div>

    </Main>
    )
}

function hacerScroll(id){
    let element = document.getElementById(id);

    if(!element){return}
    element.scrollIntoView(false);
}

function cargarVectorDias(setDias) {
    var dia;
    var vectoDiasAux=[];

    for (var i = 1; i < 32; i++) {
        if (i < 10) {
            dia = `0${i}`;
        } else {
            dia = `${i}`;
        }
        vectoDiasAux.push(dia);
    }
    setDias(vectoDiasAux)
}

function  cargarVectorMeses(setMeses) {
    var meses = [{ id: 1, mes: 'Enero' },
    { id: 2, mes: 'Febrero' },
    { id: 3, mes: 'Marzo' },
    { id: 4, mes: 'Abril' },
    { id: 5, mes: 'Mayo' },
    { id: 6, mes: 'Junio' },
    { id: 7, mes: 'Julio' },
    { id: 8, mes: 'Agosto' },
    { id: 9, mes: 'Septiembre' },
    { id: 10, mes: 'Octubre' },
    { id: 11, mes: 'Noviembre' },
    { id: 12, mes: 'Diciembre' }];
    setMeses(meses);
}

function anioNacimientoAlta(){
    let fecha_actual = new Date();
    let anio_hasta = Number(fecha_actual.getFullYear() - 3);

    return anio_hasta
}

function cargarVectorAnios(setAnios) {
    var anios = [];
    var anio;

    var fecha_actual = new Date();
    var anio_hasta = Number(fecha_actual.getFullYear() - 10);
    var anio_desde = anio_hasta - 80;

    for (var i = anio_hasta; i > anio_desde; i--) {
        anio = i.toString();
        anios.push(anio);
    }

    anios.push(1900); // agrego porque en la tabla hay fechas vacias que sql server los transforma a una fecha nula 1900-01-01 00:00:00.000
                      // para que tome las fechas 1900-01-01 00:00:00.000 y que el usuario vea que es un año invalido 

    setAnios(anios);
}

function noNull(valor){
    if (!valor){
        return ''
    }else{
        return valor.trim()
    }
}

function CursadasActuales({cursadas,iniciarVisualizarCurso}){
    return cursadas.map(cursadas=><div onClick={()=>iniciarVisualizarCurso(cursadas.nro_curso)} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 cursor-pointer">
        <span title={cursadas.Materia} className="listaCursadasAmpliada w-50 fw-600">{cursadas.cod_materia}</span> 
        <span className="listaCursadasAmpliada w-200">{cursadas.Materia} </span> 
        <span className="listaCursadasAmpliada w-200">{`${cursadas.DiaHora}`} </span> 
    </div>)
    }




