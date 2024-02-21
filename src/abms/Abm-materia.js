import React from 'react';
import {useState, useEffect} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt,faWindowClose,faPlusSquare, faCheckSquare,faDotCircle } from '@fortawesome/free-regular-svg-icons';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import {useAlumno} from '../Context/alumnoContext'
import { v4 as uuidv4 } from 'uuid';

export default function AbmMateria({id_materia, finalizarAltaOcopia}){

    const _id = id_materia;

    const regimenDefault = [{id_regimen:-1, NombreRegimen:"Seleccionar encabezado"}]

    // estados flags 
    const [cargandoDatos,setCargandoDatos] = useState(false);
    const [cargandoDatosSecundarios,setCargandoDatosSecundarios] = useState(false);

    const [grabandoDatos,setGrabandoDatos] = useState(false);
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

    const [vectorCreditos, setVectorCreditos] = useState([]);
    const [vectorCapacidad, setVectorCapacidad]=useState([]);

    const [regimenes,setRegimenes] = useState(regimenDefault); // lo usarmos para cargar el select de regimenes cada vez que cambia el encabezado y se completa en base al vectorRegimenes que ya tienen todos los regimenes sin necesidad de ir a buscar al servidor por encabezado
    const [regimenesAll,setRegimenesAll]= useState([]); // se usará para traer 1 sola vez todos los regímenes y trabajar sobre el mismo con filter cada vez que se cambie el encabezado así evitamos ir N veces al servidor
    const [encabezados,setEncabezados]= useState([]); // se usará para traer 1 sola vez todos los regímenes y trabajar sobre el mismo con filter cada vez que se cambie el encabezado así evitamos ir N veces al servidor
    const [cargandoRegimenes,setCargandoRegimenes] = useState(false);
    const {cuatrimestreActivo, incrementarContadorOperacionesGlobales} = useAlumno();

    const anio_inicial = 1997; // es el año del primer cuatrimestre en la base de datos


    // objetos para materias correlativas

    const [materiasCorrelativas, setMateriasCorrelativas]= useState([]);
    const [huboCambiosMaterias,setHuboCambiosMaterias]=useState(false)
    const [cargandoMateriasCorrelativas,setCargandoMateriasCorrelativas]=useState(false)
    const [materias, setMaterias]= useState([]);
    const [errorMateria,setErrorMateria]=useState(null)
    const [materiaSeleccionada,setMateriaSeleccionada]=useState(-1)
    const [agregarMateria,setAgregarMateria]=useState(false)
    const [backupMateriasCorrelativas,setBackupMateriasCorrelativas]=useState([]);


       const [objetoInicializacion,setObjetoInicializacion]=useState({
        nombre:'',
        codigo:'',
        capacidad:1,
        creditos:1,
        clase_individual:false,
        multiple_inscripcion:false,
        id_regimen:-1,
        id_encabezado:-1,
        activa:false   
        })

    const [activo,setActivo]=useState(false)

useEffect(()=>{

    const completarDatosAbm = async (id)=>{   
        setCargandoDatos(true)
        try{
            
                const {data} = await Axios.get(`/api/tablasgenerales/materia/${id}`)
                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para la materia ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatos(false)
                    setHuboError(true)
                    return
                }

                const datosDelRecordset = data;
                
                
                setRegimenes(regimenesAll.filter(item=>item.id_encabezado===datosDelRecordset.id_encabezado))
                
                const datosUpdate = {
                    nombre:datosDelRecordset.descripcion,
                    codigo:datosDelRecordset.cod_materia,
                    clase_individual:datosDelRecordset.Es_Individual ? datosDelRecordset.Es_Individual : false,
                    multiple_inscripcion:datosDelRecordset.multiple_inscripcion ? datosDelRecordset.multiple_inscripcion : false,
                    capacidad:datosDelRecordset.cant_max,
                    creditos:datosDelRecordset.creditos,
                    id_encabezado:datosDelRecordset.id_encabezado,
                    id_regimen:datosDelRecordset.id_regimen,
                    activa: datosDelRecordset.activa ? datosDelRecordset.activa : false // es un campo nuevo en la tabla, si es NULL lo tomamos como no activa para que entren y lo activen
                }
                  
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                setObjetoInicializacion({...objetoInicializacion,...datosUpdate}) 

                setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
                setCargandoDatos(false)
 
            }catch(err){

                console.log(err)
                const mensaje_html = `${err}`
                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
            
                setCargandoDatos(false)
                setHuboError(true)
            }

    }


        if (_id){ //  si es una modificación
            
            setTituloAbm(`Editar la materia #${_id}`);
            setTituloCerrar('Cerrar la ficha de la materia');
            completarDatosAbm(_id); 
            buscarMateriasCorrelativas();
        }
        else{ //  si es un alta
            setTituloAbm(`Crear una nueva materia`);
            setTituloCerrar('Cancelar');
            
            // objetoActualizado es una funcion que me devuelve un objeto con las propiedades que deseo actualizar con sus valores por default

            setObjetoInicializacion({...objetoInicializacion,...objetoActualizado()}) // por si hubiera que hacer uupdate de algun valor por default si no dejamos el mismo
            hacerfocoEnPrimerInput('abm-nombre')

        }

          cargarVectorCreditos(setVectorCreditos);
          cargarVectorCapacidad(setVectorCapacidad);
          

},[regimenesAll])     
  
useEffect(()=>{

    const cargarDatosSecundarios = async ()=>{

        setCargandoDatosSecundarios(true);
    
        try{
            const vectorResultado = await Promise.all([
                Axios.get('/api/tablasgenerales/encabezados'),
                Axios.get('/api/tablasgenerales/regimenesall'),
                Axios.get('/api/tablasgenerales/materias')
            ])

           

            setEncabezados(vectorResultado[0].data);
            setRegimenesAll(vectorResultado[1].data);
// muestro solo las activas
            setMaterias(vectorResultado[2].data.filter(item=>item.activa==1));
            setCargandoDatosSecundarios(false); 

        }catch(err){
    
                console.log(err)
                const mensaje_html = `<p>La busqueda de tablas generales falló</p><p>${err}</p>`

                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
                setHuboError(true)
                setCargandoDatosSecundarios(false);

            }
        }

        cargarDatosSecundarios()

 },[_id])

 const restaurarMaterias=()=>{
    setMateriasCorrelativas(backupMateriasCorrelativas)
    setHuboCambiosMaterias(false)
}

const buscarMateriasCorrelativas = async ()=>{

    try{
        setCargandoMateriasCorrelativas(true)
        const {data} = await Axios.get(`/api/tablasgenerales/materias/correlativas/${_id}`);
    
        setMateriasCorrelativas(data)
        setBackupMateriasCorrelativas(data)

        setCargandoMateriasCorrelativas(false)

        return(true)

    }catch(err){
        console.log(err)
        const mensaje_html = 'Error al cargar las materias correlatvias'
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setCargandoMateriasCorrelativas(false)
        setHuboError(true)
    }
}

const excluirMateria = (id)=>{

    const nuevaLista = materiasCorrelativas.filter(item=>item.id_materia!=id)
    setHuboCambiosMaterias(true)
    setMateriasCorrelativas([...nuevaLista])
}

const modificarMateriasCorrelativas =(e)=>{

    e.preventDefault();
    const yaExiste = materiasCorrelativas.findIndex(item=>item.id_materia==materiaSeleccionada)

    if (yaExiste!=-1){
        setErrorMateria('La materia ya figura como correlativa')
        return
    }else{
        setErrorMateria(null)
    }
     // para que cierre el select de materias
    setAgregarMateria(false);

    // para encontrar la materia seleccionada en el vector de materias
    const nuevaMateria = materias.filter(item=>item.id_materia==materiaSeleccionada)

    // para agregar la materia nueva con la función del use state
    setMateriasCorrelativas([...materiasCorrelativas,...nuevaMateria])

    // para hacer que lista de materias vuelva al valor "seleccionar"
    setMateriaSeleccionada(-1)

    setHuboCambiosMaterias(true)
}

const handleMateriaSeleccionada=(e)=>{
    setMateriaSeleccionada(e.target.value)
}

const grabarDatos = async (values)=>{

    let resultado;
    let _id_interno;
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const objetoAgrabar = { 
                nombre: values.nombre,
                codigo:values.codigo,
                capacidad:Number(values.capacidad),
                creditos:Number(values.creditos),
                clase_individual:values.clase_individual,
                multiple_inscripcion:values.multiple_inscripcion,
                id_encabezado:Number(values.id_encabezado),
                id_regimen:Number(values.id_regimen),
                activa:values.activa,
              
        }

    setGrabandoDatos(true)

    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`

    try{
        if (_id){
            resultado= await Axios.put(`/api/tablasgenerales/materia/${_id}`,objetoAgrabar)
            _id_interno = _id; // es el id a modificar
        }else{
            resultado= await Axios.post(`/api/tablasgenerales/materia`,objetoAgrabar)
            _id_interno = resultado.data.id_materia; // es el id del alta 
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nueva materia #${_id_interno})</p>`
        }

        grabarMateriasCorrelativas(_id_interno)
        .then((resultado)=>{

            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })
            .then(()=>{
    
   
                setContadorOperaciones(contadorOperaciones+1);
    
                finalizarAltaOcopia(true)
            })   
    
            setGrabandoDatos(false)
        }).catch(err=>{
            alert ('hubo un error')
        })
       
    }catch(err){    

        let mensaje_html_error;

        console.log('err.response.status',err.response.status)

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos de la materia</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos de la materia</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos de la materia</p><p>${err.response}</p>`
        }

        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatos(false)
    }
   

}

const grabarMateriasCorrelativas = async (id_interno)=>{ // recibo en id_interno el id del alumno sea el nuevo recién creado o el id del alumno que estamos moficando
    try{

        const objetoAgrabar={materias:materiasCorrelativas}

        const resultado = await Axios.post(`/api/tablasgenerales/materiascorrelativas/${id_interno}`,objetoAgrabar)

        return resultado

    }catch(err){
        console.log(err.response)
        const mensaje_html = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data.message}</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    }
} 

const handleCabeceraChange = (e,setFieldValue)=>{

   
    const encabezado = e.target.value

    setCargandoRegimenes(true); 

    let id_regimen;

        //atención e.target.value siempre es un string.
        // por eso aquì en este caso uso doble igual en lugar de triple igual porque item.id_encabezado es un number y encabezado es un string
    const data = regimenesAll.filter(item=>item.id_encabezado==encabezado)

    if (data.length===1){
        id_regimen=data[0].id_regimen;

        setRegimenes(data)
        setFieldValue('id_regimen',id_regimen)
    }else if (data.length>1) {
        setRegimenes([{id_regimen:-1, nombre:"Seleccionar"},...data])
        setFieldValue('id_regimen',-1)
    }else{
        setRegimenes([{id_regimen:-2, nombre:"----?----"}])
        setFieldValue('id_regimen',-2)
    }

    setCargandoRegimenes(false); 
}

const iniciarGrabar = (values)=>{
    let texto;
    let textoConfirmacion;

    if (_id){
        texto = `¿Confirma la modificación de la materia ${_id}?`
        textoConfirmacion = 'Si, modificar la materia'
    }else{
        texto = `¿Confirma la creación de la materia?`
        textoConfirmacion = 'Si, crear la materia'
    }

    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                grabarDatos(values);

            }else{
                console.log("Se canceló la modificación o creación de la materia")
            }
        }
    )
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

const validationSchema = Yup.object({

nombre:Yup.string().max(50,'El nombre de la materia debe tener como máximo 50 caracteres')
        .required('Falta completar el nombre'),
codigo:Yup.string().max(4,'El código de la materia debe tener como máximo 4 caracteres')
        .required('Falta completar el código de la materia'),        
capacidad:Yup.number().min(1).max(99)
       .required('Falta completar la capacidad'),
creditos:Yup.number()
        .min(0).max(10)
        .required('Falta completar los créditos'),        
id_regimen:Yup.number().min(1,'Falta seleccionar el régimen').integer().required('Falta seleccionar el régimen'),
id_encabezado:Yup.number().min(1,'Falta seleccionar el encabezado').integer().required('Falta seleccionar el encabezado') 
})              


const onsubmit = values =>{
    iniciarGrabar(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatos){
        return <Main center><div><Loading/><span className="cargando">Cargando datos ...</span></div></Main>
    };

    if (cargandoDatosSecundarios){
        return <Main center><div><Loading/><span className="cargando">Cargando encabezados y regímenes</span></div></Main>
    };

    if (cargandoMateriasCorrelativas){
        return <Main center><div><Loading/><span className="cargando">Cargando materias correlativass</span></div></Main>
    };

    return (
        <Main> 
        { grabandoDatos && <Main><div><Loading/><span className="cargando">Grabando datos...</span></div></Main>}

  <div className={grabandoDatos? "hidden": 'p-4 rounded flex flex-wrap container-mult-flex-center'} >
            
            <div><div>
                <Formik validateOnMount 
                enableReinitialize initialValues={objetoInicializacion}
    validationSchema={validationSchema} onSubmit={onsubmit}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty }) =>{ 
    return (
    <Form id="ref-ficha">
           
    <div className="AnaliticoContainer relative">
        <div  className="mb-2 titulo-cab-modal titulo-abm-modal flex f-row">{tituloAbm}</div>
        <button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm-modal"><FontAwesomeIcon icon={faWindowClose}/></button> 
        <div className="FormAbmContainer-x1">
            <div className="flex f-col">
            {_id && dirty && <span type="button" title="Restaurar valores iniciales" className="cursor-pointer restaurar-b" onClick={() => resetForm(initialValues)}>Restaurar</span>}
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre">Materia</label>
                    <Field 
                        id="abm-nombre"
                        onFocus={()=>seleccionarTextoInput("abm-nombre")} 
                        onClick={()=>seleccionarTextoInput("abm-nombre")} 
                        type="text" 
                        autoComplete="off" 
                        maxLength="50"
                        name="nombre" 
                        className={values.nombre ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="nombre"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-codigo">Código</label>
                    <Field 
                        id="abm-codigo"
                        type="text" 
                        onFocus={()=>seleccionarTextoInput("abm-codigo")} 
                        onClick={()=>seleccionarTextoInput("abm-codigo")} 
                        autoComplete="off" 
                        maxLength="4"
                        value={values.codigo.toUpperCase()}
                        name="codigo" 
                        className={values.codigo ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="codigo"/></div> 
            </div>
            </div>             
            <div className="flex f-col">
                <div className="flex f-row" id="fecha">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-capacidad">Capacidad</label>
                        <select onChange={handleChange} 
                                value={values.capacidad}
                                name='capacidad' 
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                {vectorCapacidad.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>                       
                       
                    </div>
                        <div className="error_formulario"><ErrorMessage name="capacidad"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row" id="fecha">
                        <label className="Form__labels__abmcursos_corto" htmlFor="abm-creditos">Créditos</label>
                        <select onChange={handleChange} 
                                value={values.creditos} 
                                name='creditos'
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorCreditos.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>
                        
                    </div>
                        <div className="error_formulario"><ErrorMessage name="creditos"/></div> 
            </div>                   
            <div className="flex f-col">
                <div className="flex f-row" id="fecha">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-encabezado">Encabezado</label>
                        <select onChange={(e)=>{handleChange(e);handleCabeceraChange(e,setFieldValue)}} 
                                value={values.id_encabezado}
                                name='id_encabezado' 
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option disabled value="-1">Seleccionar</option>
                                {encabezados.map(item=><option disabled={item.reg_activo==0} value={item.id_encabezado} key={`idenc-${item.id_encabezado}`}>{item.nombre}</option> )}
                        </select>                       
                    </div>
                        <div className="error_formulario"><ErrorMessage name="id_encabezado"/></div> 
            </div>                 
            <div className="flex f-col">
                <div className="flex f-row" id="fecha">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-regimen">Régimen</label>
                        <select onChange={handleChange} 
                                value={values.id_regimen} 
                                name='id_regimen'
                                title={values.regimen==-2 ? 'No se encontraron regímenes para el encabezado seleccionado':''} 
                                disabled = {values.id_encabezado===-1}                                
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {regimenes.map(item=><option value={item.id_regimen} key={`idreg-${item.id_regimen}`}>{item.nombre}</option> )}
                        </select>
                        
                    </div>
                        <div className="error_formulario"><ErrorMessage name="id_regimen"/></div> 
            </div>               
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-activo">Clase individual</label>
                    <Field 
                        id="abm-activo"
                        type="checkbox" 
                       // onChange={handleSubdivisionChange}
                       /* onChange={(e)=>{handleChange(e) // si necesito un comportamiento customizado del onChange conecto los 2 eventlisteners, uno el nativo de formik y el otro el personalizado , si pongo uno solo se pierde el otro, hay que combinarlos en una función anonima
                            handleSubdivisionChange(e,values,setFieldValue)
                        }}*/
                        className="ml-4"
                        name="clase_individual" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="clase_individual"/></div>                             
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-activo">Múltiple inscripción</label>
                    <Field 
                        id="abm-activo"
                        type="checkbox" 
                       // onChange={handleSubdivisionChange}
                       /* onChange={(e)=>{handleChange(e) // si necesito un comportamiento customizado del onChange conecto los 2 eventlisteners, uno el nativo de formik y el otro el personalizado , si pongo uno solo se pierde el otro, hay que combinarlos en una función anonima
                            handleSubdivisionChange(e,values,setFieldValue)
                        }}*/
                        className="ml-4"
                        name="multiple_inscripcion" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="multiple_inscripcion"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-activa">Activa</label>
                    <Field 
                        id="abm-activa"
                        type="checkbox" 
                       // onChange={handleSubdivisionChange}
                       /* onChange={(e)=>{handleChange(e) // si necesito un comportamiento customizado del onChange conecto los 2 eventlisteners, uno el nativo de formik y el otro el personalizado , si pongo uno solo se pierde el otro, hay que combinarlos en una función anonima
                            handleSubdivisionChange(e,values,setFieldValue)
                        }}*/
                        className="ml-4"
                        name="activa" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="activa"/></div> 
            </div> 
            <div className="flex f-col mt-4">
                <div className="relative">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-activo">Materias correlativas</label>
                    {_id && huboCambiosMaterias && <span type="button" title="Restaurar valores iniciales" onClick={restaurarMaterias} className="cursor-pointer restaurar-b">Restaurar</span>}
                <MateriasCorrelativas materias={materiasCorrelativas} 
                                excluirMateria={excluirMateria} 
                                errorMateria={errorMateria}
                />
                
                          
                <AgregarMaterias agregarMateria={agregarMateria}
                                setAgregarMateria={setAgregarMateria}
                                materiaSeleccionada={materiaSeleccionada}
                                setMateriaSeleccionada={setMateriaSeleccionada}
                                modificarMateriasCorrelativas={modificarMateriasCorrelativas}
                                errorMateria={errorMateria}
                                setErrorMateria={setErrorMateria}
                                handleMateriaSeleccionada={handleMateriaSeleccionada}
                                materias={materias}
                />                    
                </div>  
            </div> 

  

            </div>  
            { (dirty || huboCambiosMaterias) && <button className="Form__submit" type="submit">Grabar</button>}
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

function AgregarMaterias({agregarMateria,
    setAgregarMateria,
    materiaSeleccionada,
    setMateriaSeleccionada,
    modificarMateriasCorrelativas,
    errorMateria,
    setErrorMateria,
    handleMateriaSeleccionada,
    materias}){
return(
    <>     
    { !agregarMateria && <button className="text-black" title="Agregar una materia correlativa" 
    onClick={()=>{setAgregarMateria(true);setMateriaSeleccionada(-1)}}>
        <FontAwesomeIcon icon={faPlusSquare}/> <span className="texto-acciones-menu-fb cabecera">Agregar materia correlativa</span> 
        </button>
    }  

    {agregarMateria && <button title="Cancelar" onClick={()=>{setAgregarMateria(false);setErrorMateria(null)}}>
        <FontAwesomeIcon icon={faWindowClose}/>
        </button>
    }  

    { agregarMateria && 
    <div className="flex f-row">

        <select onChange={handleMateriaSeleccionada} value={materiaSeleccionada} className="w-selabm" id="abm-alumno-nacionalidad">
            <option disabled value="-1">Seleccionar</option>
            {
            materias.map(item=>
            <option key={`abm-alumno-materias${item.id_materia}`} 
            value={item.id_materia}>{item.descripcion}</option>
            )
            }
        </select>
        { materiaSeleccionada>0 && 
            <div>
                <button title="Agregar la materia correlativa" 
                    onClick={(e)=>modificarMateriasCorrelativas(e)} className="relative">
                    <FontAwesomeIcon icon={faCheckSquare}/>
                    <p onClick={modificarMateriasCorrelativas} title="Agregue la materia seleccionada" className="error_formulario absolute cursor-pointer font-w-200" >Agregar</p>

                </button> 
            </div>
            }

    </div>  
    }      

    { agregarMateria && errorMateria && <div className="error_formulario"><span>{errorMateria}</span></div> }
    </>
)
}


function MateriasCorrelativas({materias,excluirMateria,errorMateria}){
    //return(<p>{JSON.stringify(materias)}</p>)
    
    return (
        <div className="mt-4">
        {materias.map(
            (item,index)=><div key={uuidv4()} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
            <button title='Borrar'onClick={()=>excluirMateria(item.id_materia)}>
                <FontAwesomeIcon className="text-black" icon={faTrashAlt}/>
            </button>
            <span className="lista-mat-corr recortar-150">{item.descripcion}</span>
            <span className="lista-mat-corr">{item.cod_materia}</span> 
        </div>
        )}
    </div>
    
    )
    }

function objetoActualizado(){
    const fecha = new Date();

     const objetoActualizado = {
        dia_i: fecha.getDate(),
        mes_i: fecha.getMonth(),
        anio_i: fecha.getFullYear(),
        dia_f:fecha.getDate(),
        mes_f:fecha.getMonth(),
        anio_f:fecha.getFullYear()
    }

    return objetoActualizado
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

function cargarVectorCreditos(setCreditos) {
    var creditos = [];

    for (var i = 0; i <= 10; i++) {
        creditos.push(i);
    }

    setCreditos(creditos);
}

function cargarVectorCapacidad(setCapacidad) {
    var capacidades = [];

    for (var i = 1; i < 100; i++) {
        capacidades.push(i);
    }

    setCapacidad(capacidades);
}

function aniosPermitidos(){
    var fecha_actual = new Date();
    var anio_hasta = Number(fecha_actual.getFullYear()+1);
    var anio_desde = Number(fecha_actual.getFullYear()-50);

    return {desde:anio_desde,hasta:anio_hasta}
}

function diferencia(dia_i, mes_i, anio_i, dia_f,mes_f,anio_f){

const mes_i_aux = mes_i < 10 ? `0${mes_i}` : mes_i;

const mes_f_aux = mes_f < 10 ? `0${mes_f}` : mes_f;

const dia_i_aux = dia_i < 10 ? `0${dia_i}` : dia_i;

const dia_f_aux = dia_f < 10 ? `0${dia_f}` : dia_f;

const fecha1 = `${anio_i}${mes_i_aux}${dia_i_aux}`
const fecha2 = `${anio_f}${mes_f_aux}${dia_f_aux}`

return Number(fecha2)>Number(fecha1)
}







