import React from 'react';
import {useState, useEffect} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-regular-svg-icons';
import { v4 as uuidv4 } from 'uuid';

export default function AbmAlumno({id_alumno, finalizarAltaOcopia}){

    const provinciaDefault = [{id_provincia:-1, nombre:"Seleccionar país"}]

    // estados flags 
    const [cargandoDatosTablasGenerales,setCargandoTablasGenerales] = useState(false);
    const [cargandoProvincias,setCargandoProvincias] = useState(false);
    const [cargandoDatosAlumno,setCargandoDatosAlumno] = useState(false);
    const [grabandoDatosAlumno,setGrabandoDatosAlumno] = useState(false);
    const [tablasCargadas,setTablasCargadas]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');

    // estados vectores de selección

    const [paises,setPaises] = useState([]);
    const [nacionalidades,setNacionalidades] = useState([]);
    const [provincias,setProvincias] = useState(provinciaDefault); // lo usarmos para cargar el select de provincia cada vez que cambia el pais y se completa en base al vectorProvincias que ya tienen todas las provincias sin necesidad de ir a buscar al servidor por pais
    const [vectorProvincias,setVectorProvincias]= useState([]); // se usará para traer 1 sola vez todas las provincias y trabajar sobre el mismo con filter cada vez que se cambie el pais así evitamos ir N veces al servidor
    const [vectorDias, setVectorDias] = useState([]);
    const [vectorMeses, setVectorMeses]=useState([]);
    const [vectorAnios, setVectorAnios] = useState([]);

    // estado objeto de inicialización que inicializa los valores del abm 
    // en el alta o es cargado con los valores de la base de datos en una modificación
    // este objeto se pasa al formulario Formik para que el estado del formulario se inicialice
    // con este objeto. Luego el resto del trabajo se hace sobre el estado del formulario  
    const [objetoInicializacion,setObjetoInicializacion]=useState({
        nacionalidad:'Argentina',
        pais:-1,
        provincia:-1,
        nombre:'',
        apellido:'',
        anio:"2020",
        mes:"01",
        dia:"01",
    })

    useEffect(()=>{

        const cargarDatosAlumno = async ()=>{

            setCargandoTablasGenerales(true);
        
            try{
                const vectorResultado = await Promise.all([
                    Axios.get('/api/tablasgenerales/materias'),
                    Axios.get('/api/tablasgenerales/paises'),
                    Axios.get('/api/tablasgenerales/provincias/all'),
                    Axios.get('/api/tablasgenerales/nacionalidades'),
                    Axios.get('/api/tablasgenerales/instrumentos'),
                    Axios.get('/api/tablasgenerales/nivelesi'),
                    Axios.get('/api/tablasgenerales/nivelese')
                ])

               
               // setMaterias(vectorResultado[0].data);
                setPaises(vectorResultado[1].data);
                setVectorProvincias(vectorResultado[2].data);
                setNacionalidades(vectorResultado[3].data);
               // setInstrumentos(vectorResultado[4].data);
               // setNivelesI(vectorResultado[5].data);
               // setNivelesE(vectorResultado[6].data);

                cargarVectorDias(setVectorDias);
                cargarVectorMeses(setVectorMeses);
                cargarVectorAnios(setVectorAnios);
              
                setCargandoTablasGenerales(false); 
                setTablasCargadas(true)
            }catch(err){
        
                    console.log(err)
                    const mensaje_html = `<p>La busqueda de tablas generales falló</p><p>${err}</p>`
        
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   
                    setHuboError(true)
                    setCargandoTablasGenerales(false);
    
                }
            }

            cargarDatosAlumno()

     },[id_alumno])

useEffect(()=>{

    const completarDatosDelAlumno = async (id)=>{   
        setCargandoDatosAlumno(true)
        try{
            
                const {data} = await Axios.get(`/api/alumnos/${id}`)

                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para el alumno ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatosAlumno(false)
                    setHuboError(true)
                    return
                }

                const datosDelRecordset = data[0];

                const datosAlumno = {
                    nacionalidad:datosDelRecordset.nacionalidad,
                    pais:datosDelRecordset.id_pais,
                    provincia:datosDelRecordset.id_provincia,
                    nombre:datosDelRecordset.nombre,
                    apellido:datosDelRecordset.apellido,
                    fecha:datosDelRecordset.fecha_nac,
                    anio:datosDelRecordset.fecha_nac.slice(0,4),
                    dia:datosDelRecordset.fecha_nac.slice(8,10),
                    mes:datosDelRecordset.fecha_nac.slice(5,7)
                }
                  
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                setObjetoInicializacion({...objetoInicializacion,...datosAlumno}) 

                setCargandoDatosAlumno(false)

                return datosDelRecordset // retorno un valor para que pueda hacerse algo en el .then ya que al ser async devuelva una promesa
            }catch(err){

                console.log(err)
                const mensaje_html = `<p>La busqueda de datos del alumno falló</p><p>${err}</p>`

                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
            
                setCargandoDatosAlumno(false)
                setHuboError(true)
            }

    }

    if (tablasCargadas ){ // este useEffect se dispara solo si ya se cargaron las tablas generales

        if (id_alumno){ //  si se recibió el nùmero de alumno por propiedad es decir si es una modificación
            
            setTituloAbm(`Editar el alumno #${id_alumno}`)

            completarDatosDelAlumno(id_alumno) 
            // busco el alumno, asigno los datos y luego cargo las provincias ya que dependen del id de pais
            .then(data=> // como la función async me devuelve una promesa puedo ejecutar en el .then lo que deseo que se haga luego que se haya completado la funcion completarDatosDelAlumno que en este caso necesito que busque las provincias correspondientes al pais y que luego le asigne el valor a la propiedad provincia del objeto de inicializacion
                {
                    const provinciasPorPais = vectorProvincias.filter(item=>item.id_pais===data.id_pais)
                    setProvincias(provinciasPorPais)
                    //setObjetoInicializacion({...objetoInicializacion,provincia:data.id_provincia})    
                }
            ).catch(err=>
                console.log('Error al completar los datos del alumno ',err)
            )
        }
        else{ //  si no recibió el nùmero de curso por propiedad, es decir un alta
            setTituloAbm(`Crear un nuevo alumno`)
            hacerScroll("nuevo-alumno")
        }
    }

},[tablasCargadas,id_alumno])     
  
const grabarAlumno = async (values)=>{

    let resultado;

    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const objetoAgrabar = {nombre: Number(values.nombre),
                         apellido: Number(values.apellido),
                         nacionalidad:Number(values.nacionalidad),
                         provincia:Number(values.provincia),
                         pais:Number(values.pais)
                        }

    setGrabandoDatosAlumno(true)

    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`

    try{
        if (id_alumno){
            resultado= await Axios.put(`/api/cursos/${id_alumno}`,objetoAgrabar)
        }else{
            resultado= await Axios.post(`/api/cursos`,objetoAgrabar)
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nuevo alumno #${resultado.data.id_alumno})</p>`
        }

        finalizarAltaOcopia(true); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
        setGrabandoDatosAlumno(false)
    }catch(err){
        console.log(err)
        const mensaje_html = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err}</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatosAlumno(false)
    }
   

}

const cancelarAbm = ()=>{
    if (!id_alumno){ // solo cancelo si es un alta o una copia ya que se hacen en la vista de cursos. La edición de un curso se hace en la vista de curso y siempre lo muestro
        finalizarAltaOcopia(false)
    }
}

const iniciarGrabarAlumno = (values)=>{
    let texto;
    let textoConfirmacion;

    if (id_alumno){
        texto = `Confirma la modificación del alumno ${id_alumno}?`
        textoConfirmacion = 'Si, modificar el alumno'
    }else{
        texto = `Confirma la creación del nuevo alumno?`
        textoConfirmacion = 'Si, crear el alumno'
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

                console.log(JSON.stringify(values))
            }else{
                console.log("Se canceló la modificación o creación del alumno")
            }
        }
    )
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
nacionalidad:Yup.string()
        .required('Falta seleccionar la nacionalidad'),
pais:Yup.number()
        .positive('Falta seleccionar un país')
        .required('Falta seleccionar un país')
        .test("prueba","El código de país debe ser mayor a cero",value => value > 0),
provincia:  Yup.number()
            .positive('Falta seleccionar una provincia')
            .required('Falta seleccionar una provincia')
            .test("prueba","El código de provincia debe ser mayor a cero",value => value > 0),
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

    if (grabandoDatosAlumno){
        return <Main center><div><Loading/><span className="cargando">Grabando datos...</span></div></Main>
    };

    return (
        <Main> 
            {JSON.stringify(objetoInicializacion)}
        <div className="p-4 rounded ">
            <div className="AnaliticoContainer relative">
                <div className="FormAnaliticoContainer relative">
                    <div className="mb-2 titulo-cab-modal titulo-abm flex f-row">{tituloAbm}
                    </div>
                     {/*el botòn de cancelar solo lo habilito cuando es un alta o copia*/}
                {!id_alumno && <button onClick={cancelarAbm} title="Cancelar" className="absolute botonAbm"><FontAwesomeIcon icon={faWindowClose}/></button> }
                <Formik validateOnMount 
                enableReinitialize initialValues={objetoInicializacion}
    validationSchema={validationSchemaAlumno} onSubmit={onsubmitAlumno}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty }) =>{ 
    return (
    <Form>
    <div className="AnaliticoContainer relative">
        <div className="FormAnaliticoContainer ">
            { cargandoDatosAlumno && <div><Loading/> <span className="cargando">Cargando datos del alumno...</span></div>}
            <div className="flex f-col">
            {id_alumno && dirty && <span type="button" title="Restaurar valores iniciales" className="cursor-pointer absolute cabecera botonAbm" onClick={() => resetForm(initialValues)}>Restaurar</span>}
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-nombre">Nombre</label>
                    <Field 
                        id="abm-alumno-nombre"
                        type="text" 
                        name="nombre" 
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
                        name="apellido" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="apellido"/></div> 
            </div>         
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-nacionalidad">Nacionalidad</label>
                    <select onChange={handleChange} value={values.nacionalidad} name="nacionalidad" className="w-selabm" id="abm-curso-nacionalidad">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                nacionalidades.map(item=>
                                    <option key={`abm-alumno-nacionalidad${item.id_nacionalidad}`} 
                                        value={item.nombre}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="nacionalidad"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-pais">País</label>
                    <select onChange={(e)=>{handleChange(e);buscarProvincias(e,setFieldValue)}} value={values.pais} name="pais" className="w-selabm" id="abm-alumno-pais">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                paises.map(item=>
                                    <option key={`abm-alumno${item.id_pais}`} 
                                        value={item.id_pais}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="pais"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-provincia">Provincia</label>
                    <select onChange={handleChange} 
                            value={values.provincia} 
                            name="provincia"
                            title={values.pais==-2 ? 'No se encontraron provincias para el país seleccionado':''} 
                            disabled = {values.pais===-1}
                            className="w-selabm" id="abm-curso-provincia">
                          
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
                <div className="error_formulario"><ErrorMessage name="provincia"/></div> 
            </div> 
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
                            {vectorAnios.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>
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
    element.scrollIntoView();
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

    setAnios(anios);
}