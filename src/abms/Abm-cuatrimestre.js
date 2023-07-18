import React from 'react';
import {useState, useEffect, useRef} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faDotCircle } from '@fortawesome/free-regular-svg-icons';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import {sumarSemanas} from '../Helpers/fechas';
import {useAlumno} from '../Context/alumnoContext'
import DatePicker from "react-multi-date-picker"
import { Calendar } from "react-multi-date-picker"
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import Calendario from '../componentes/Calendario';

//https://shahabyazdi.github.io/react-multi-date-picker/events/


export default function AbmCuatrimestre({id_cuatrimestre, finalizarAltaOcopia}){

    const _id = id_cuatrimestre;
    // estados flags 
    const [cargandoDatos,setCargandoDatos] = useState(false);
    const [grabandoDatos,setGrabandoDatos] = useState(false);
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

    const [vectorDias, setVectorDias] = useState([]);
    const [vectorMeses, setVectorMeses]=useState([]);
    const [vectorAnios, setVectorAnios] = useState([]);

    const {cuatrimestreActivo, incrementarContadorOperacionesGlobales} = useAlumno();

    const anio_inicial = 1997; // es el año del primer cuatrimestre en la base de datos

       const [objetoInicializacion,setObjetoInicializacion]=useState({
        nombre:'',
        anio_i:'',
        mes_i:'',
        dia_i:'',
        anio_f:'',
        mes_f:'',
        dia_f:'',
        activo:false        
        })

    const [activo,setActivo]=useState(false)
    const [arrayFechas, setArrayFechas] = useState([])
    const [backupFechasInscripcion,setBackupFechasInscripcion] = useState([])
    const modificacionesFechas = useRef(0);

useEffect(()=>{

    const completarDatosAbm = async (id)=>{   
        setCargandoDatos(true)
        try{
            
                const {data} = await Axios.get(`/api/tablasgenerales/cuatrimestre/${id}`)
                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para el cuatrimestre ${id}</p>`
    
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

                
                const datosUpdate = {
                    nombre:datosDelRecordset.nombre,
                    anio_i:datosDelRecordset.f_desde.slice(0,4),
                    dia_i:datosDelRecordset.f_desde.slice(8,10),
                    mes_i:Number(datosDelRecordset.f_desde.slice(5,7)),
                    anio_f:datosDelRecordset.f_hasta.slice(0,4),
                    dia_f:datosDelRecordset.f_hasta.slice(8,10),
                    mes_f:Number(datosDelRecordset.f_hasta.slice(5,7)),
                    activo:datosDelRecordset.activo
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
            
            setTituloAbm(`Editar el cuatrimestre #${_id}`);
            setTituloCerrar('Cerrar la ficha del cuatrimestre');
            completarDatosAbm(_id); 
            buscarFechasInscripcion()
        }
        else{ //  si es un alta
            setTituloAbm(`Crear un nuevo cuatrimestre`);
            setTituloCerrar('Cancelar');
            
            // objetoActualizado es una funcion que me devuelve un objeto con las propiedades que deseo actualizar con sus valores por default

            setObjetoInicializacion({...objetoInicializacion,...objetoActualizado()}) // por si hubiera que hacer uupdate de algun valor por default si no dejamos el mismo
            hacerfocoEnPrimerInput('abm-nombre')
        }

          cargarVectorDias(setVectorDias);
          cargarVectorMeses(setVectorMeses);
          cargarVectorAnios(setVectorAnios,anio_inicial);

},[_id])     
  
useEffect(()=>{

    if (activo){  // si el id de cuatrimestre es distinto del actualmente activo
        // y si se grabó como activo entonces hay que actualizar el cuatrimestre activo al nuevo
        
        if (_id!==cuatrimestreActivo.id_cuatrimestre){
            incrementarContadorOperacionesGlobales()
        }
    }

},[contadorOperaciones])

const buscarFechasInscripcion = async ()=>{

    try{
        const {data} = await Axios.get(`/api/tablasgenerales/cuatrimestres/fechasinscripcion/${_id}`);
    
        const fechasSimplificado = data.map(item=>{return item.fecha_inscripcion})
        // recibo un vector de objetos y lo transformo a un vector de 1 solo elemento porque lo uso para pasarlo al DatePicker

        setArrayFechas(fechasSimplificado)
        setBackupFechasInscripcion(fechasSimplificado)

    }catch(err){
        console.log(err)
        const mensaje_html = 'Error al cargar las fechas de inscripción'
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setHuboError(true)
    }
}

const actualizarFechasInscripcion = (fechas)=>{
    let fechas_aux = [];

    fechas.map(item=>{
        const fecha = `${item.day < 10 ? `0${item.day}` : item.day}/${item.month.number<10 ? `0${item.month.number}`: item.month.number }/${item.year}`
        fechas_aux.push(fecha)
    })

    modificacionesFechas.current = modificacionesFechas.current + 1

    setArrayFechas([...fechas_aux])


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
                dia_i:Number(values.dia_i),
                mes_i:Number(values.mes_i),
                anio_i:Number(values.anio_i),
                dia_f:Number(values.dia_f),
                mes_f:Number(values.mes_f),
                anio_f:Number(values.anio_f),
                activo:values.activo
        }

    setGrabandoDatos(true)

    try{
        if (_id){
            resultado= await Axios.put(`/api/tablasgenerales/cuatrimestre/${_id}`,objetoAgrabar)
            _id_interno = _id; // es el id a modificar
        }else{
            resultado= await Axios.post(`/api/tablasgenerales/cuatrimestre`,objetoAgrabar)
            _id_interno = resultado.data.id_cuatrimestre; // es el id del alta 
        }


            if (objetoAgrabar.activo){
                setActivo(true) // para reflejar en el estado que el cuatrimestre que se crea o modifica es activo para que pueda luego controlar en el useEffect que se ocupa de actualizar o no el cuat activo
            }

            const id_cuatrimestre = _id ? _id : _id_interno
            grabarFechasInscripcion(id_cuatrimestre)
           

    }catch(err){    

        let mensaje_html_error;

        console.log('err.response.status',err.response.status)

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del cuatrimestre</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del cuatrimestre</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del cuatrimestre</p><p>${err.response}</p>`
        }

        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatos(false)
    }
   

}

const grabarFechasInscripcion = async (id)=>{ // recibo en id_interno el id del alumno sea el nuevo recién creado o el id del alumno que estamos moficando
    try{
        let mensaje_html = `<p>Los datos del cuatrimestre se grabaron exitosamente</p>`

        const objetoAgrabar={fechas:arrayFechas}

        const resultado1 = await Axios.post(`/api/tablasgenerales/cuatrimestres/fechasinscripcion/${id}`,objetoAgrabar)
     
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })  

        setContadorOperaciones(contadorOperaciones+1);

        finalizarAltaOcopia(true)

        setGrabandoDatos(false)

    }catch(err){
        let mensaje_html_error;

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar las fechas de inscripcion</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar las fechas de inscripcion</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar las fechas de inscripcion</p><p>${err.response}</p>`
        }


        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        }).then(()=>{

            setGrabandoDatos(false)

        })   
    }
} 

const resetearValores = ()=>{
    setArrayFechas(backupFechasInscripcion)
    modificacionesFechas.current = 0
}

const iniciarGrabar = (values)=>{
    let texto;
    let textoConfirmacion;

    if (_id){
        texto = `¿Confirma la modificación del cuatrimestre ${_id}?`
        textoConfirmacion = 'Si, modificar el cuatrimestre'
    }else{
        texto = `¿Confirma la creación del nuevo cuatrimestre?`
        textoConfirmacion = 'Si, crear el cuatrimestre'
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
                console.log("Se canceló la modificación o creación del cuatrimestre")
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

nombre:Yup.string().max(25,'El nombre debe tener como máximo 25 caracteres')
        .required('Falta completar el nombre'),
dia_i:Yup.number().min(1).max(31)
        .required('Falta seleccionar el día inicial'),
mes_i:Yup.number().min(0).max(11)
       .required('Falta seleccionar el mes inicial'),
anio_i:Yup.number()
        .min(1940,'El año no es válido')
        .required('Falta seleccionar el año inicial'),        
dia_f:Yup.number().min(1).max(31)
        .required('Falta seleccionar el día de finalización'),
mes_f:Yup.number().min(1).max(12)
        .required('Falta seleccionar el mes de finalización'),
anio_f:Yup.number()
        .min(1940,'El año no es válido')
        .required('Falta seleccionar el año de finalización'),  
validacionFechas:Yup.boolean().test('match', 
        'La fecha de inicio debe ser anterior a la fecha de finalización', 
            function(val) { 
               const {dia_i, mes_i, anio_i, dia_f,mes_f,anio_f} = this.parent;
        
                return diferencia(dia_i, mes_i, anio_i, dia_f,mes_f,anio_f) 
            }), 
validacionAnios:Yup.boolean().test('match', 
            `El año de inicio o finalización no está permitido. Solo puede seleccionar como mínimo el año ${aniosPermitidos().desde} y como máximo el año ${aniosPermitidos().hasta}`, 
                function(val) { 
                   const {anio_i,anio_f} = this.parent;
            
                    return anio_i >= aniosPermitidos().desde && anio_f <= aniosPermitidos().hasta 
                })                 
})              

const handleExtraChange = (e,valoresFormulario,setFieldValue)=>{

        let fecha_fin_calculada;

        switch(e.target.name){
            case 'dia_i' : 
                fecha_fin_calculada = sumarSemanas(`${e.target.value}/${valoresFormulario.mes_i}/${valoresFormulario.anio_i}`,18)
                break
            case 'mes_i' :
                fecha_fin_calculada = sumarSemanas(`${valoresFormulario.dia_i}/${e.target.value}/${valoresFormulario.anio_i}`,18)
                break
            case 'anio_i':
                fecha_fin_calculada = sumarSemanas(`${valoresFormulario.dia_i}/${valoresFormulario.mes_i}/${e.target.value}`,18)
                break
        }

            setTimeout(() => {
                setFieldValue('dia_f',fecha_fin_calculada.dia < 10 ? `0${fecha_fin_calculada.dia}` : fecha_fin_calculada.dia)
            }, 200);                 

            setTimeout(() => {
                setFieldValue('mes_f',fecha_fin_calculada.mes)
            }, 200); 

            setTimeout(() => {
                setFieldValue('anio_f',fecha_fin_calculada.anio)
            }, 200); 
    }

const onsubmit = values =>{
    iniciarGrabar(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatos){
        return <Main center><div><Loading/><span className="cargando">Cargando datos ...</span></div></Main>
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
            {_id && (dirty || modificacionesFechas.current > 0) && <span type="button" title="Restaurar valores iniciales" className="cursor-pointer restaurar-b" onClick={() => {resetearValores();resetForm(initialValues)}}>Restaurar</span>}
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre">Nombre</label>
                    <Field 
                        id="abm-nombre"
                        type="text" 
                        autoComplete="off" 
                        maxLength="25"
                        onFocus={()=>seleccionarTextoInput("abm-nombre")} 
                        onClick={()=>seleccionarTextoInput("abm-nombre")} 
                        name="nombre" 
                        className={values.nombre ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="nombre"/></div> 
            </div> 
            <div className="flex f-col">
                <label className="Form__labels__abmcursos_corto" htmlFor="abm-dia">Fecha de inicio</label>
                <div className="flex f-row" id="fecha">
                        <select /*onChange={handleChange}*/ 
                                value={values.dia_i}
                                onChange={(e)=>{handleChange(e); handleExtraChange(e,values,setFieldValue)}} 
                                name='dia_i' 
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                {vectorDias.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>                       
                        <select /*onChange={handleChange} */
                                onChange={(e)=>{handleChange(e); handleExtraChange(e,values,setFieldValue)}} 
                                value={values.mes_i} 
                                name='mes_i'
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorMeses.map(item=><option value={item.id} key={item.id}>{item.mes}</option> )}
                        </select>
                        <select /*onChange={handleChange}*/
                                onChange={(e)=>{handleChange(e); handleExtraChange(e,values,setFieldValue)}} 
                                value={values.anio_i} 
                                name='anio_i'
                                
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorAnios.map(item=><option 
                               disabled = {item==1900}  value={item} key={item}>{item}</option> )}
                        </select>
                        
                    </div>
                        <div className="error_formulario"><ErrorMessage name="dia_i"/></div> 
                        <div className="error_formulario"><ErrorMessage name="mes_i"/></div> 
                        <div className="error_formulario"><ErrorMessage name="anio_i"/></div>   
                </div> 
                <div className="flex f-col">
                <label className="Form__labels__abmcursos_corto" htmlFor="abm-dia_f">Fecha de finalización</label>
                <div className="flex f-row" id="fecha">
                        <select onChange={handleChange} 
                                value={values.dia_f}
                                name='dia_f' 
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                {vectorDias.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>                       
                        <select onChange={handleChange} 
                                value={values.mes_f} 
                                name='mes_f'
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorMeses.map(item=><option value={item.id} key={item.id}>{item.mes}</option> )}
                        </select>
                        <select onChange={handleChange} 
                                value={values.anio_f} 
                                name='anio_f'
                                
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorAnios.map(item=><option 
                               disabled = {item==1900}  value={item} key={item}>{item}</option> )}
                        </select>
                        
                    </div>
                        <div className="error_formulario"><ErrorMessage name="dia_f"/></div> 
                        <div className="error_formulario"><ErrorMessage name="mes_f"/></div> 
                        <div className="error_formulario"><ErrorMessage name="anio_F"/></div>   
                </div> 
                <div className="error_formulario">
                    {errors.validacionFechas} 
                </div>   
                { dirty && <div className="error_formulario">
                    {errors.validacionAnios}
                </div>          }         
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-activo">Es el cuatrimestre activo</label>
                    <Field 
                        id="abm-activo"
                        type="checkbox" 
                        className="ml-4"
                        name="activo" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="activo"/></div> 
            </div>

            <Calendario multiple panel tituloPanel={'Fechas de inscripción'}
                        array={arrayFechas} setValue={actualizarFechasInscripcion}/>
                 
            </div>  
            { (dirty || modificacionesFechas.current > 0) && <button className="Form__submit" type="submit">Grabar</button>}
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

function cargarVectorAnios(setAnios,anio_inicial) {
    var anios = [];
    var anio;

    var fecha_actual = new Date();
    var anio_hasta = Number(fecha_actual.getFullYear()+1);
    var anio_desde = anio_inicial;

    for (var i = anio_hasta; i >= anio_desde; i--) {
        anio = i.toString();
        anios.push(anio);
    }

   setAnios(anios);
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











