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
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';

export default function AbmPassword({alumno,profesor, finalizar}){

    const _id = alumno ? alumno.id_alumno : profesor ? profesor.id_prof : null;
    const esProfesor = profesor ? true : false ;

    // estados flags 
    const [cargandoDatos,setCargandoDatos] = useState(false);
    const [grabandoDatos,setGrabandoDatos] = useState(false);
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

       const [objetoInicializacion,setObjetoInicializacion]=useState({
        password:'',usuario:''
    })

useEffect(()=>{

    buscarDatosAcceso()
    .then(datos=>{
        setObjetoInicializacion({password:formatear(datos.password),usuario:formatear(datos.usuario)})
        hacerfocoEnPrimerInput('abm-usuario')
        if(alumno){
            setTituloAbm(`${alumno.alumno} (ID ${_id})`)
        }
        if(profesor){
            setTituloAbm(`${profesor.descripcion} (ID ${_id})`)
        }
    })
   
},[])

const buscarDatosAcceso = async ()=>{

    try{
        const {data}=await Axios.get(`api/tablasgenerales/datosacceso/${esProfesor ? 1:0}/${_id}`)
        return data
    }catch(err){
        alert('Error al obtener los datos de acceso ' + err)
    }

}

const grabarDatos = async (values)=>{

    let resultado;
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const objetoAgrabar = { 
                password: values.password.trim(),
                usuario:values.usuario.trim()
        }

    setGrabandoDatos(true)

    let mensaje_html = `<p>Los datos se modificaron con éxito</p>`

    try{
            resultado= await Axios.put(armarUrl(_id,profesor,alumno),objetoAgrabar)

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        }).then(resultado=>{
            finalizar()
        })

        setGrabandoDatos(false)
    }catch(err){    

        let mensaje_html_error;

        console.log('err.response.status',err.response.status)

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar la nueva contraseña</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar la nueva contraseña</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar la nueva contraseña</p><p>${err.response}</p>`
        }

        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatos(false)
    }
   

}

const iniciarGrabar = (values)=>{
    let texto;
    let textoConfirmacion;

    texto = `¿Confirma la modificación de los datos de acceso?`
    textoConfirmacion = 'Si, modificar'


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
                console.log("Se canceló la modificación de los datos de acceso")
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

password:Yup.string().max(15,'La contraseña debe tener como máximo 15 carácteres')
        .required('Falta completar la contraseña'),
usuario:Yup.string().max(15,'El usuario debe tener como máximo 15 carácteres')
        .required('Falta completar el usuario')               
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

    return (
        <Main> 
        { grabandoDatos && <Main><div><Loading/><span className="cargando">Grabando contraseña...</span></div></Main>}

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

        <div className="FormAbmContainer-x1">
            <div className="flex f-col">
            {dirty && <span type="button" title="Restaurar valores iniciales" className="cursor-pointer restaurar-b" onClick={() => resetForm(initialValues)}>Restaurar</span>}
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-usuario">Usuario</label>
                    <Field 
                        id="abm-usuario"
                        type="text" 
                        autoComplete="off" 
                        maxLength= {esProfesor ? "15" : "200"}
                        name="usuario" 
                        title={values.usuario}
                        disabled = {esProfesor ? false : true}
                        onFocus={()=>seleccionarTextoInput("abm-usuario")} 
                        onClick={()=>seleccionarTextoInput("abm-usuario")}                         
                        className={values.usuario ? esProfesor ? '' :'w-400' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="password"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre">Contraseña</label>
                    <Field 
                        id="abm-password"
                        type="text" 
                        autoComplete="off" 
                        maxLength="15"
                        name="password" 
                        disabled = {esProfesor ? false : true}
                        onFocus={()=>seleccionarTextoInput("abm-password")} 
                        onClick={()=>seleccionarTextoInput("abm-password")}                         
                        className={values.password ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="password"/></div> 
            </div>             
            </div>  
            <br></br>
            { dirty && <button className="Form__submit mt-4" type="submit">Grabar</button>}
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

function armarUrl(id,profesor,alumno){
    if(profesor){
        return `/api/usuarios/profesores/password/${id}`
    }
    if (alumno){
       return `/api/alumnos/password/${id}`
    }

    return `Error al armar la url, el usuario y el alumno son indefinidos al mismo tiempo.`
}

function formatear(dato){
    if (dato){
        return dato.trim()
    }else{
        return ''
    }
}












