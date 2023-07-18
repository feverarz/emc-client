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
import HistorialAlumno from '../componentes/HistorialAlumno';

export default function AbmPersonal({id_prof, finalizarAltaOcopia}){

    const provinciaDefault = [{id_provincia:-1, nombre:"Seleccionar país"}]

    // estados flags 
    const [cargandoDatosTablasGenerales,setCargandoTablasGenerales] = useState(false);
    const [cargandoProvincias,setCargandoProvincias] = useState(false);
    const [cargandoDatosUsuario,setCargandoDatosUsuario] = useState(false);
    const [grabandoDatosUsuario,setGrabandoDatosUsuario] = useState(false);
    const [tablasCargadas,setTablasCargadas]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

    const [paises,setPaises] = useState([]);
    const [provincias,setProvincias] = useState(provinciaDefault); // lo usarmos para cargar el select de provincia cada vez que cambia el pais y se completa en base al vectorProvincias que ya tienen todas las provincias sin necesidad de ir a buscar al servidor por pais
    const [vectorProvincias,setVectorProvincias]= useState([]); // se usará para traer 1 sola vez todas las provincias y trabajar sobre el mismo con filter cada vez que se cambie el pais así evitamos ir N veces al servidor
    const [vectorDias, setVectorDias] = useState([]);
    const [vectorMeses, setVectorMeses]=useState([]);
    const [vectorAnios, setVectorAnios] = useState([]);
    
    // vectores de selección de otras operaciones

    const [tiposUsuario, setTiposUsuario]= useState([]);
    const [permisosUsuario, setPermisosUsuario]= useState([]);

    // Variables para manejar otras operaciones

   
    // estado objeto de inicialización que inicializa los valores del abm 
    // en el alta o es cargado con los valores de la base de datos en una modificación
    // este objeto se pasa al formulario Formik para que el estado del formulario se inicialice
    // con este objeto. Luego el resto del trabajo se hace sobre el estado del formulario  
    const [objetoInicializacion,setObjetoInicializacion]=useState({
        id_prof:-1,
        id_pais:1,
        id_provincia:1,
        pais:'',
        provincia:'',
        nombre:'',
        apellido:'',
        usuario:'',
        anio:"2020",
        mes:"01",
        dia:"01",
        documento:'',
        domicilio:'',
        localidad:'',
        codpostal:'',
        email:'',
        telefono:'',
        permiso:-1,
        tipousuario:-1
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

               
                setPaises(vectorResultado[0].data);
                setVectorProvincias(vectorResultado[1].data);
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

    const completarDatosDelUsuario = async (id)=>{   
        setCargandoDatosUsuario(true)
        try{
            
                const {data} = await Axios.get(`/api/usuarios/${id}`)

                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para el usuario ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatosUsuario(false)
                    setHuboError(true)
                    return
                }

                const datosDelRecordset = data;

                const datosUsuario = {
                    id_prof:id_prof,
                    pais:datosDelRecordset.pais,
                    provincia:datosDelRecordset.provincia,
                    nombre:datosDelRecordset.nombre,
                    apellido:datosDelRecordset.apellido,
                    documento:noNull(datosDelRecordset.documento),
                    fecha:datosDelRecordset.fecha_nac,
                    anio:datosDelRecordset.fecha_nac.slice(0,4),
                    dia:datosDelRecordset.fecha_nac.slice(8,10),
                    mes:datosDelRecordset.fecha_nac.slice(5,7),
                    domicilio:noNull(datosDelRecordset.direccion),
                    localidad:noNull(datosDelRecordset.localidad),
                    codpostal:noNull(datosDelRecordset.codPostal),
                    email:noNull(datosDelRecordset.email),
                    usuario:noNull(datosDelRecordset.usuario),
                    permiso:datosDelRecordset.id_permiso,
                    tipoUsuario:datosDelRecordset.id_tipo_usuario
                }
                  
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                setObjetoInicializacion({...objetoInicializacion,...datosUsuario}) 

                setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
                setCargandoDatosUsuario(false)
 
            }catch(err){

                console.log(err)
                const mensaje_html = `${err}`
                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
            
                setCargandoDatosUsuario(false)
                setHuboError(true)
            }

    }

    if (tablasCargadas ){ // este useEffect se dispara solo si ya se cargaron las tablas generales

        if (id_prof){ //  si se recibió el nùmero de alumno por propiedad es decir si es una modificación
            
            setTituloAbm(`Editar el usuario #${id_prof}`);
            setTituloCerrar('Cerrar la ficha del usuario');
            completarDatosDelUsuario(id_prof); 
            
        }
        else{ //  si no recibió el nùmero de curso por propiedad, es decir un alta
            setTituloAbm(`Crear un nuevo usuario`);
            setTituloCerrar('Cancelar');
            hacerScroll("nuevo-usuario");
            cargarProvinciasArgentina();
            
            let anioNacimientoDefaultAlta=anioNacimientoAlta();

            setObjetoInicializacion({...objetoInicializacion,anio:anioNacimientoDefaultAlta}) 
        }
    }

},[tablasCargadas,id_prof])     
  
const grabarUsuario = async (values)=>{

    let resultado;
    let id_prof_interno;
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const objetoAgrabar = { datosgenerales: {
                nombre: values.nombre,
                apellido: values.apellido,
                provincia:Number(values.provincia),
                pais:Number(values.pais),
                anio:Number(values.anio),
                mes:Number(values.mes),
                dia:Number(values.dia),
                domicilio:values.domicilio,
                localidad:values.localidad,
                codpostal:values.codpostal,
                documento:values.documento,
                telefono:values.telefono,
                email:values.email,
                usuario:values.usuario,
                permiso:values.permiso,
                tipoUsuario:values.tipoUsuario
            }
        }

    setGrabandoDatosUsuario(true)

    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`

    try{
        if (id_prof){
            resultado= await Axios.put(`/api/usuarios/${id_prof}`,objetoAgrabar)
            id_prof_interno = id_prof; // es el id del alumno a modificar
        }else{
            resultado= await Axios.post(`/api/usuarios`,objetoAgrabar)
            id_prof_interno = resultado.data.id_prof; // es el id del nuevo alumno 
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nuevo usuario #${resultado.data.id_prof})</p>`
        }

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
        setGrabandoDatosUsuario(false)
    }catch(err){
        console.log(err.response)
        const mensaje_html = `<p>Se produjo un error al grabar los datos del usuario</p><p>${err.response.data.message}</p>`


        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatosUsuario(false)
    }
   

}

const iniciarGrabarUsuario = (values)=>{
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
                grabarUsuario(values);

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

const validationSchemaUsuario = Yup.object({

nombre:Yup.string().max(20,'El nombre debe tener como máximo 20 caracteres')
        .required('Falta completar el nombre'),
apellido:Yup.string().max(20,'El apellido debe tener como máximo 20 caracteres')
        .required('Falta completar el apellido'),
usuario:Yup.string().max(15,'El usuario debe tener como máximo 15 caracteres')
        .required('Falta completar el usuario'),        
documento:Yup.number().min(1000000,'El documento debe tener como mínimo 7 dígitos')
    .max(99999999,'El documento debe tener como máximo 8 dígitos')
    .required('Falta completar el documento'),
dia:Yup.number()
    .required('Falta seleccionar la nacionalidad'),
mes:Yup.number()
    .required('Falta seleccionar la nacionalidad'),
anio:Yup.number()
    .min(1940,'El año no es válido')
    .required('Falta seleccionar la nacionalidad'),        
pais:Yup.number()
    .positive('Falta seleccionar un país')
    .required('Falta seleccionar un país')
    .test("prueba","El código de país debe ser mayor a cero",value => value > 0),
provincia:  Yup.number()
    .positive('Falta seleccionar una provincia')
    .required('Falta seleccionar una provincia')
    .test("prueba","El código de provincia debe ser mayor a cero",value => value > 0),
domicilio:Yup.string().max(50,'El domicilio debe tener como máximo 50 caracteres')
    .required('Falta completar el domicilio'),            
localidad:Yup.string().max(15,'La localidad debe tener como máximo 15 caracteres')
    .required('Falta completar la localidad'),    
codpostal:Yup.string().max(10,'El código postal debe tener como máximo 10 caracteres')
    .required('Falta completar el código postal'),            
email:Yup.string().email('El email no es válido').max(200,'El email debe tener como máximo 200 caracteres')
    .required('Falta completar el e-mail'),            
telefono:Yup.string().max(100,'El teléfono debe tener como máximo 100 caracteres'),
permiso:Yup.number()
    .positive('Falta seleccionar el permiso')
    .required('Falta seleccionar el permiso')
    .test("prueba","El permiso debe ser mayor o igual a cero",value => value >= 0),
tipoUsuario:Yup.number()
    .positive('Falta seleccionar el tipo de usuario')
    .required('Falta seleccionar el tipo de usuario')
    .test("prueba","El tipo de usuario debe ser mayor a o igual a cero",value => value >= 0),    
})                 

const onsubmitUsuario = values =>{
    iniciarGrabarUsuario(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatosTablasGenerales){
        return <Main center><div><Loading/><span className="cargando">Cargando datos generales...</span></div></Main>
    };

    if (cargandoDatosUsuario){
        return <Main center><div><Loading/><span className="cargando">Cargando datos personales del usuario...</span></div></Main>
    };

    return (
        <Main> 
        { grabandoDatosUsuario && <Main><div><Loading/><span className="cargando">Grabando datos...</span></div></Main>}

  <div className={grabandoDatosUsuario? "hidden": 'p-4 rounded flex flex-wrap container-mult-flex-center'} >
            <div className="AnaliticoContainer relative">
                <div className="FormAnaliticoContainer relative">
                    <div  className="mb-2 titulo-cab-modal titulo-abm flex f-row">{tituloAbm}
                    </div>
                     {/*el botòn de cancelar solo lo habilito cuando es un alta o copia*/}
                <button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm"><FontAwesomeIcon icon={faWindowClose}/></button> 
                <Formik validateOnMount 
                enableReinitialize initialValues={objetoInicializacion}
    validationSchema={validationSchemaUsuario} onSubmit={onsubmitUsuario}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty }) =>{ 
    return (
    <Form id="ref-ficha">

    <div className="AnaliticoContainer relative">
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
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-nombre">Nombre</label>
                    <Field 
                        id="abm-alumno-nombre"
                        type="text" 
                        autoComplete="off" 
                        maxLength="20"
                        name="nombre" 
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
                        name="usuario" 
                        className={values.usuario ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="usuario"/></div> 
            </div>             
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-documento">Documento</label>
                    <Field 
                        id="abm-alumno-documento"
                        type="text" 
                        autoComplete="off" 
                        maxLength="8"
                        name="documento" 
                        className={values.documento ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="documento"/></div> 
            </div>  
 
            </div>  
            <label className="Form__labels" htmlFor="fecha">Fecha de nacimiento</label>
            <div className="flex f-col">
                <div className="flex f-row" id="fecha">
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
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Permiso</label>
                    <select onChange={handleChange} value={values.permiso} name="profesor" className="w-selabm" id="abm-curso-profesor">
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
                    <select onChange={handleChange} value={values.tipoUsuario} name="profesor" className="w-selabm" id="abm-curso-tipoUsuario">
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
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-domicilio">Domicilio</label>
                    <Field 
                        id="abm-alumno-domicilio"
                        type="text" 
                        maxLength="50"
                        autoComplete="off" 
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
                        className={values.codpostal ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="codpostal"/></div> 
            </div>  

            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telefono">Teléfono</label>
                    <Field 
                        id="abm-alumno-telefono"
                        type="text" 
                        autoComplete="off" 
                        maxLength="100"
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
                        name="email" 
                        className={values.email ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="email"/></div> 
            </div>  
                                                                                                                                           
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-id_pais">País</label>
                    <select onChange={(e)=>{handleChange(e);buscarProvincias(e,setFieldValue)}} value={values.id_pais} name="id_pais" className="w-selabm" id="abm-alumno-id_pais">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                paises.map(item=>
                                    <option key={`abm-alumno${item.id_pais}`} 
                                        value={item.id_pais}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="id_pais"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-id_provincia">Provincia</label>
                    <select onChange={handleChange} 
                            value={values.id_provincia} 
                            name="id_provincia"
                            title={values.pais==-2 ? 'No se encontraron provincias para el país seleccionado':''} 
                            disabled = {values.pais===-1}
                            className="w-selabm" id="abm-curso-id_provincia">
                          
                          {/*<option disabled value="-1">Seleccionar</option*/}  
                          {/* aqui no agrego el option con value -1 y texto Seleccionar, esto lo manejo dinámicamente en la función buscarRegimenes ya que este select se carga cuando se selecciona un encabezado */}
                            {
                                provincias.map(item=>
                                    <option key={uuidv4()} 
                                      value={item.id_provincia}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="id_provincia"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email">Pais</label>
                    <Field 
                        id="abm-alumno-pais"
                        type="text" 
                        autoComplete="off" 
                        maxLength="200"
                        name="pais" 
                        className={values.pais ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="pais"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email">Provincia</label>
                    <Field 
                        id="abm-alumno-provincia"
                        type="text" 
                        autoComplete="off" 
                        maxLength="200"
                        name="provincia" 
                        className={values.provincia ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="provincia"/></div> 
            </div>                          

            <button className="Form__submit" type="submit">Grabar</button>
        </div>
      
    </div>    
    </Form>) } }

    </Formik>
        </div>
        </div>
        </div>

    </Main>
    )
}

function cargarVectorHoras() {
    let hora;
    let vector_horas = []

    for (var i = 8; i < 23; i++) {
        if (i < 10) {
            hora = `0${i}`;
        } else {
            hora = `${i}`;
        }
        vector_horas.push(hora);
    }

    return vector_horas
}

function cargarCapacidades() {
    let capacidad;
    let vector_capacidad = []

    for (var i = 1; i < 100; i++) {
        vector_capacidad.push(i);
    }

    return vector_capacidad
}
function cargarVectorMinutos() {
    let vector_minutos = []

    vector_minutos.push('00');
    vector_minutos.push('30');

    return vector_minutos
}

function calcularCantIntervalos30minutos(hora_desde,min_desde,hora_hasta,min_hasta) {
    let horaDESDE = new Date(0);

    horaDESDE.setHours(hora_desde);
    horaDESDE.setMinutes(min_desde);

    let horaHASTA = new Date(0);

    horaHASTA.setHours(hora_hasta);
    horaHASTA.setMinutes(min_hasta);

    let minutos = (horaHASTA - horaDESDE) / 1000 / 60;

    let capacidad = minutos / 30

    return capacidad
}

function diferencia(horai,horaf,minutoi,minutof) {
    var resultado = true;
    var mensaje = '';

    var hora_desde = horai;
    var hora_hasta = horaf;
    var min_desde = minutoi;
    var min_hasta = minutof;

    var hora_desde_nummerica = Number(hora_desde + min_desde)
    var hora_hasta_nummerica = Number(hora_hasta + min_hasta)

    if (hora_desde_nummerica >= hora_hasta_nummerica) {
        resultado = false;
        mensaje = 'La hora de inicio debe ser anterior a la hora de fín'
    }

    return (hora_hasta_nummerica > hora_desde_nummerica  )

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
    var anio_hasta = Number(fecha_actual.getFullYear() - 3);
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
        return valor
    }
}

function MateriasAlumno({materias,excluirMateria,errorMateria}){

return (
    <div className="mt-4">
    {materias.map(
        (item,index)=><div key={uuidv4()} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
        <button title='Borrar'onClick={()=>excluirMateria(item.id_materia)}>
            <FontAwesomeIcon className="dispo-0" icon={faDotCircle}/>
        </button>
        <span className="listaCursadasAnalitico recortar-nine">{item.descripcion}</span> 
    </div>
    )}
</div>

)
}



