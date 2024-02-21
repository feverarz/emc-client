import React, {useEffect, useState, useRef, useReducer } from 'react';
import Main from '../componentes/Main';
import {hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import Swal from 'sweetalert2';
import Axios from 'axios';

export default function Login({login,error,accesoAdministrativo,setAccesoAdministrativo}){

    // la interface del usuario depende del estado, en este caso consiste solo de un objeto usuario. Cada vez que cambia el estado se vuelve a renderizar la interface
const [datosLogin,setdatosLogin] = useState({username:'',password:''})    
const [pedirId,setPedirId] = useState(false)    
const documento = useRef(null)

useEffect(()=>{
    const origen = localStorage.getItem('origen')
    if(origen=='alumno'){
        setAccesoAdministrativo(false)
    }else{
        setAccesoAdministrativo(true)
    }
},[])

useEffect(()=>{
    hacerfocoEnPrimerInput("login-name")
},[accesoAdministrativo])

    const handleInputChange = (e)=>{  // defino una función que va a escuchar los cambios que ocurren en los inputs. Agrego el listener con onChange
        setdatosLogin({...datosLogin,[e.target.name]:e.target.value})
    }

    const handleTipoAccesoChange = (e)=>{
        localStorage.setItem('origen',accesoAdministrativo ? 'alumno' : 'admin') // guardo cuál fue el origen del logout para que en la vista LOGIN recuerde que tipo de ingreso preferentemente va a ser "administrativo" o "alumno"
        setAccesoAdministrativo(!accesoAdministrativo)
    }

    const recuperarID = async (documento)=>{

        if (!documento){
            return
        }

        const objetoAgrabar = { 
            documento: documento
        }
       
            try{
                  // const resultado= await Axios.post(`/api/cursos/copiar/${cuatrimestreActivo.id_cuatrimestre}`,objetoAgrabar)
                  //const resultado= await Axios.post(`/api/cursos/copiar/${cuatrimestreActivo.id_cuatrimestre}`,objetoAgrabar)
                  const resultado= await Axios.post(`/api/usuarios/recuperarid/`,objetoAgrabar)
                  return resultado
            }catch(err){
                throw err.response.data.message;
            }
        
        }

const pedirIdAlumno = async ()=>{

    const { value: documento ,isConfirmed,isDismissed } = await Swal.fire({
        html: '<p>Ingresa tu número de documento</p>',
        width: 400,
        input: 'text',
        inputLabel: 'documento',
        inputPlaceholder: 'Número de documento',
        showCancelButton: true,
        customClass:{input:'input-rec-id'},
        inputAttributes: {
          maxlength: 10,
          autocapitalize: 'off',
          autocorrect: 'off'
        }})

        if (isConfirmed){
            if (documento){
                recuperarID(documento)
                .then((resultado)=>{
                    Swal.fire({
                        icon: 'alert',
                        title: 'Listo!',
                        html: `<p>${resultado.data.message}</p>`,
                    })
                })
                .catch(err=>{
                    Swal.fire({
                        icon: 'error',
                        text: err
                    })
                })
            }else{
                Swal.fire({
                    icon: 'error',
                    html: '<p>El número de documento ingresado es inválido</p>',
                  })
            }       
        }
 }

    function handleSubmit(e) {
        e.preventDefault();
    
        login(datosLogin.username, datosLogin.password,accesoAdministrativo);

      }

      /*async function handleSubmit(e) {
        e.preventDefault();
    
        try {
          await login(datosLogin.username, datosLogin.password);
        } catch (error) {
            console.log(error)
            mostrarError(error.message);
        }
      }     */ 

    return ( // envuelvo un contenido X con un componente Main 
    <div className="Main ppp"><Main center>  
        <div className="Signup">
            <div className="FormContainer relative">
            {/*<div className="acceso">{accesoAdministrativo ? <div><p>Acceso profesor/a</p><p>Acceso administrativo</p></div> : <span>Acceso alumno</span>}</div>*/}
            <span onClick={handleTipoAccesoChange} className="soy-alumno cursor-pointer text-small p-2 color-tomato fw-700">{accesoAdministrativo ? 'Para ingresar como alumno hacer ' : 'Para ingresar como docente hacer '} <span className="underline blink">click aquí</span></span>
                <p className="text-white p-2 bg-tomato text-large text-center">{accesoAdministrativo ? 'Login docente / administrativo' : 'Login alumno'}</p>
                <form onSubmit={handleSubmit}>
                <p className="Error__inner color-red">{error}</p>
                    {/* Tengo conectado el input email con el estado usuario.email a través del atributo value y del evento onChange */}
                    <input value={datosLogin.usuario} 
                        onChange={handleInputChange} 
                        type={accesoAdministrativo ? "text" : "email"} 
                        name="username" 
                        id="login-name"
                        onFocus={()=>seleccionarTextoInput("login-name")} 
                        onClick={()=>seleccionarTextoInput("login-name")}
                        title={accesoAdministrativo ? 'Ingresa tu nombre de usuario' : 'Ingresa tu dirección de e-mail'}
                        placeholder={accesoAdministrativo ? "Usuario" : "E-mail"} 
                        className="Form__field" required/>
                    <input value={datosLogin.password} 
                        onChange={handleInputChange} 
                        type="password" 
                        name="password" 
                        title={accesoAdministrativo ? 'Ingresa tu contraseña' : 'Ingresa el ID que figura en tu credencial de alumno'}
                        placeholder={accesoAdministrativo ? "Contraseña" : "ID alumno"} 
                        className="Form__field" required/>
                    <button className="Form__submit" type="submit">Ingresar</button>
                </form>
                {!accesoAdministrativo && <span className="cursor-pointer text-center" onClick={pedirIdAlumno}>Olvidé mi Id de alumno</span>}
            </div>
        </div>
    </Main>
    </div>
    )
}

async function SolicitudIdAlumnox(){
    const { value: password } = await Swal.fire({
        html: '<p>Ingresa tu número de documento</p>',
        width: 400,
        input: 'text',
        inputLabel: 'Password',
        inputPlaceholder: 'Número de documento',
        showCancelButton: true,
        cancelButtonText:'Cancelar',
        customClass:{input:'input-rec-id'},
        inputAttributes: {
          maxlength: 10,
          autocapitalize: 'off',
          autocorrect: 'off'
        }
      })

     
}

async function SolicitudIdAlumno(){
    const { value: documento ,isConfirmed,isDismissed } = await Swal.fire({
        html: '<p>Ingresa tu número de documento</p>',
        width: 400,
        input: 'text',
        inputLabel: 'documento',
        inputPlaceholder: 'Número de documento',
        showCancelButton: true,
        customClass:{input:'input-rec-id'},
        inputAttributes: {
          maxlength: 10,
          autocapitalize: 'off',
          autocorrect: 'off'
        }})
    if (isConfirmed && documento){
        return documento
    }
 }