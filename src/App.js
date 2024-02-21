import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter , Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Nav from './componentes/Nav';
import Main from './componentes/Main';
import Prueba from './componentes/Prueba';
import Cursos from './Vistas/Cursos';
import Usuario from './Vistas/Usuario';
import Personal from './Vistas/Personal';
import Estadisticas from './Vistas/Estadisticas';
import Comparativas from './Vistas/Comparativas';
import Alumnos from './Vistas/Alumnos';
import Impresiones from './componentes/Impresiones';
import LinkReferencias from './componentes/LinksReferencias';
import Login from './Vistas/Login';
import Curso from './Vistas/Curso';
import BuscarAlumnos from './componentes/BuscarAlumnos';
import Busqueda from './componentes/Busqueda';
import Loading from './componentes/Loading';
import Error from './componentes/Error';
import DatosAlumnoBottom from './componentes/DatosAlumnoBottom'
import {AlumnoProvider, useAlumno } from './Context/alumnoContext'; // importo proveedor de contexto y luego envuelvo a la aplicación en el mismo
import {CalificacionesProvider, useCalificaciones } from './Context/calificacionesContext'; // importo proveedor de contexto y luego envuelvo a la aplicación en el mismo
import {NotasProvider } from './Context/notasContext'; // importo proveedor de contexto y luego envuelvo a la aplicación en el mismo
import {RecuperatoriosProvider } from './Context/recuperatoriosContext'; // importo proveedor de contexto y luego envuelvo a la aplicación en el mismo
import Axios from 'axios';
import {setToken, deleteToken, getToken, initAxiosInterceptors} from './Helpers/auth-helpers'
import Cronograma from './componentes/CronogramaCursos';
import CronogramaCursosSemana from './componentes/CronogramaCursosSemana';
import {fechaActual,compararFechas} from './Helpers/fechas';
import Swal from 'sweetalert2';
import Profesor from './componentes/Historial-profesor';
import Alumno from './componentes/HistorialAlumno';
import socketIOClient from "socket.io-client";

// variables para monitoreo de actividad
let tiempo_en_segundos_inactividad = 2400;
let tiempo_en_segundos_alumno = 300;
let contador; 
let id_intervalo_monitoreo;
let id_intervalo_monitoreo_alumno;
let id_intervalo_contador;
let id_tiempo_reinicio;

initAxiosInterceptors(); // esto se llama apenas se ejecute el archivo principal antes de 
                         // cargar la función app para que se active el proceso de analizar
                          // cada request de entrada para ver si hay un error de autorización
                          // y cada request de salida para añadirle el token si es que existe
                          // se añade al header para que el servidor lo reciba en el request y
                          // lo autorice para las rutas protegidas
function App() {

  const [usuario,setUsuario] = useState(null) // es estado inicial del usuario es null o sea no hay usuario
  const [cargandoUsuario,setCargandoUsuario]=useState(true);
  const [cargandoCuatrimestre,setCargandoCuatrimestre]=useState(false);
  const [error,setError] = useState(null);
  const [hora,setHora] = useState(null);
  const [reinicioLogin,setReinicioLogin]=useState(0)
  const {alumno,
        setAlumno,
        mostrarBusquedaAlumnos,
        reinicializarAlumno,
        reinicializarParametrosVistas,
        mensaje,
        reinicializarMensaje,
        cuatrimestreActivo, cambiarCuatrimestreActivo,
        setearUsuario,
        contadorOperacionesGlobales} = useAlumno();
  const [accesoAdministrativo,setAccesoAdministrativo] = useState(true)    

  useEffect(()=>{

    async function cargarUsuario(){

        if(!getToken()){
            setCargandoUsuario(false);
            setCargandoCuatrimestre(false); // si no hay token debe re loguearse
            return;
        }else{
            try{
                const { data } = await Axios.get('/api/usuarios/whoami');
                setUsuario(data.usuario);
                setearUsuario(data.usuario); // para exponerlo en el context
                setCargandoUsuario(false);
                //if(data.usuario.id_permiso==100){
                  //document.getElementById("root").body.style.backgroundImage="url('http://www.escuelademusica.org/wp-content/themes/emc/img/imagen_header_20.jpg')"
                  //document.getElementById("root").style.background="blue"
                 // document.getElementById("root").style.background="red"
                  //}
            }catch(error){
                console.log(error)
                setCargandoUsuario(false);
            }
        }
    }
    cargarUsuario();
    confirmarTiempoInactividadAceptado()


    // si es necesario puedo conectarme a un websocket y emitir y recibir
    // mensajes para implementar funcionalidades en tiempo real
    
    //configurarWebSokectsParaAlgunaFuncionalidadTiempoReal()
    
    //


  },[]); // el segundo parametro [] se pasa para que se ejecute 1 sola vez 

  useEffect(()=>{
   
    const buscarCuatrimestres = async ()=>{
      setCargandoCuatrimestre(true);
      try{
        const {data} = await Axios.get('/api/cursos/cuatrimestres/all');

        const cuatrimestre_activo = data.filter(item=>item.activo===true)

        cambiarCuatrimestreActivo(cuatrimestre_activo[0])

        setCargandoCuatrimestre(false);

      }catch(err){
         console.log(error)
         setCargandoCuatrimestre(false);
      }
   }

   if (usuario){
      buscarCuatrimestres()
      if(usuario.id_permiso==100){
          // desactivo el timeout para acceso alumno porque lo manejo desde el servidor
          //activarContadorFinSesion(setReinicioLogin)
      }else{
        activarMonitoreoActividad(setReinicioLogin) // cada vez que se loguea el usuario o se refresca la vista se
        // se activa el monitoreo de la actividad para detectar 
        // tiempos de inactividad y si fuese necesario pedir al usuario 
        // que confirme que sigue conectado
      }
    }
 
  },[usuario,contadorOperacionesGlobales,reinicioLogin])

  function logout(){
      if(usuario.id_permiso==100){
        notificarLogoutAlServidor()
      }
      setUsuario(null);
      reinicializarAlumno()
      reinicializarParametrosVistas()
      deleteToken();
  }

  function activarMonitoreoActividad(setReinicioLogin){
    // cada vez que se inicia el monitoreo de actividad se limpian los flags para 
    // asegurarnos que se reinicie el proceso
    sessionStorage.removeItem('haction')
    sessionStorage.removeItem('checking')
    // se repite el control de actividad cada 5 segundos
    // pasamos la función setReinicioLogin por si es necesario forzar el renderizado de la vista
    // cambiando el estado en el caso de que se haya detectado un tiempo X de inactividad
    id_intervalo_monitoreo = setInterval(() => {
          verificarTiempo(setReinicioLogin)        
    }, 5000);
  }

  function activarContadorFinSesion(setReinicioLogin){
    id_intervalo_monitoreo_alumno = setTimeout(() => {
        terminarSesion(setReinicioLogin)   
    }, 60000);
  }

  function mostrarError(error){
      setError(error)
  };

  function esconderError(){
      setError(null)
  }

  function esconderMensaje(){
    setError(null)
}

  async function login(username,password,accesoAdministrativo){

    try{

      const url = accesoAdministrativo ? 'api/usuarios/login' : 'api/usuarios/loginalumno';
      const { data } = await Axios.post( // le digo que espere a que Axios se ejecute
        url,{username,password});
  
        setUsuario(data.usuario);
        setearUsuario(data.usuario); // para exponerlo en el context
        setToken(data.token)
        esconderError(true) // si hubo un error y no cerró el alerta entonces cuando se loguea con éxito hay que cerrarlo 
        
      }catch(e){
        mostrarError(e.response.data.message)
    }
  
  }

  if (cargandoUsuario){
    return <Main center><Loading/><span className="cargando">Cargando usuario...</span></Main>
  };

  
  if (cargandoCuatrimestre){
    return <Main center><Loading/><span className="cargando">Cargando cuatrimestre...</span></Main>
  };
  
  return (
    <BrowserRouter>
    <div className="Main center" onMouseUp={monitorearClicks}>
      {/*<h1 style={{textAlign:'center', background:'red',color:'yellow',fontSize:'55px'}}>VERSION DE TEST</h1>*/}
      <Nav usuario = {usuario} logout={logout} cuatrimestreActivo={cuatrimestreActivo}/>
      {/*usuario && <BuscarAlumnos/>*/} 
  {/* <LinkReferencias/> */}
      <Error mensaje={error} esconderError={esconderError}/>
      <Error mensaje={mensaje} esconderError={reinicializarMensaje}/>
      { usuario ? 
          <div className= { alumno.id ?  "flex flex-row mt-80" : "flex flex-row mt-60" }>
                <LoginRoutes mostrarError={mostrarError} usuario={usuario}/> 
                {usuario && usuario.id_permiso == 3 && <BuscarAlumnos/>} 
                {alumno.id && <DatosAlumnoBottom id={alumno.id}/>}
                {usuario.id_permiso == 3 &&  <Redirect to="/alumnos" login={login}/>}
                {usuario.id_permiso == 0 &&  <Redirect to="/cursos" login={login}/>}
                {usuario.id_permiso == 100 && <Redirect to="/alumno" login={login}/>}
          </div>             
              : 
          <div className="Main center">
            <LogoutRoutes error={error} login={login} mensaje={mensaje} accesoAdministrativo={accesoAdministrativo} setAccesoAdministrativo={setAccesoAdministrativo}/>
            <Redirect to="/login" login={login}/> 
          </div>
         }
        
      
       
    
      { /*<div>{JSON.stringify(usuario)}</div> */}
      </div>
    </BrowserRouter>
  );
}

// export default App;
// envuelvo a la aplicación con un proveedor de contexto para que la usen los componentes
// hijos.
/*export default ()=> 
  <AlumnoProvider>  
      <App></App>
  </AlumnoProvider>
*/

export default () => (
    <NotasProvider>  
      <AlumnoProvider>
        <RecuperatoriosProvider>
            <App></App>
        </RecuperatoriosProvider>
      </AlumnoProvider>
    </NotasProvider>

  );

function LoginRoutes({mostrarError, logout,usuario}){
  return (
    <Switch>

{/*       <Route exact path="/cursos" logout={logout} component={()=><Cursos/>} />
          <Route exact path="/" logout={logout} component={()=><Cursos/>} default /> 
      Reescribí las rutas de la vista cursos reemplazando component por render
      para evitar que se renderice cada vez que cambia el componente buscarAlumnos al
      cambiar su estado. Si lo dejaba como component se renderizaba también el componente Cursos
  */
}         
        <Route exact path="/cursos" render={props => (<Cursos {...props}/>)}/>
        <Route exact path="/personal" render={props => (<Personal {...props}/>)}/>  
        <Route exact path="/estadisticas" render={props => (<Estadisticas {...props}/>)}/>  
        <Route exact path="/comparativas" render={props => (<Comparativas {...props}/>)}/>  
        <Route exact path="/alumnos" render={props => (<Alumnos {...props}/>)}/>  
        <Route path="/cursos/:id" render={props => (<Cursos {...props}/>)}/>  
        <Route exact path="/" render={props => (<Cursos {...props}/>)} default/>                    
        <Route path="/curso/:id" render={props => (<Curso {...props} />)}/>  
{/*<Route path="/pepe/:id" component={()=><Prueba objeto={{id:50,nombre:'pepe'}}/>} /> */ }
        <Route path="/pepe/:id" render={props => (<Prueba {...props} />)}/>     
        <Route path="/usuario/:id" render={props => (<Usuario {...props} />)}/>      
        <Route path="/impresiones" render={props=> (<Impresiones {...props}/>)}/>
        <Route path="/cronograma-diario" render={props=> (<Cronograma {...props}/>)}/>
        <Route path="/profesor" render={props=> (<Profesor {...props} profesor={'pepe'} id_prof={usuario.id_prof} menuProfesor={true} usuario={usuario}/>)}/>
        <Route path="/cronograma-semanal" render={props=> (<CronogramaCursosSemana {...props}/>)}/>
        <Route path="/alumno" render={props=> (<Alumno {...props} id_alumno={usuario.id_alumno} actual={0} cambiarAmpliado={()=>console.log(1)}/>)}/>
  </Switch>
  )
}

function LogoutRoutes({login,error, accesoAdministrativo, setAccesoAdministrativo}){
  return (
    <Switch>
        <Route  exact path="/" 
                render={props =><Login {...props} 
                login={login} error = {error} accesoAdministrativo={accesoAdministrativo} setAccesoAdministrativo={setAccesoAdministrativo}/>} default/>
        <Route  path="/login" 
                render={props =><Login {...props} 
                login={login} error={error} accesoAdministrativo={accesoAdministrativo} setAccesoAdministrativo={setAccesoAdministrativo}/>} default/>                
  </Switch>
  )
}

function monitorearClicks(){ // la función monitorearClicks se dispara cada vez que el usuario hace click y guarda la fecha hora minuto y segundo para que se pueda calcular el tiempo de inactividad
    sessionStorage.setItem('haction',fechaMouse()) // la hora de ultimo click se guarda en memoria y se consulta cada X segundos para comparar y calcular los tiempos
   // clearTimeout(id_tiempo_reinicio)
}

function fechaMouse(){
    return `${fechaActual()}` // cada vez que el usuario hace click se guarda la fecha hora minuto y segundo 
                              // la función fechaActual esta en un archivo Helpers/fechas.js y usa moment.js para crear la fecha
}

function verificarTiempo(setReinicioLogin){  //esta función se ejecuta cada x segundos con un setInterval para verificar la diferencia entre la hora actual y la última hora de actividad
    const ultimoRegistro = sessionStorage.getItem('haction') // en 'haction' se va guardando la hora en que el usuario hace un click en cualquier lado como evidencia de actividad
    const checking = sessionStorage.getItem('checking') // 'checking' se usa como flag para saber si ya se mostró el mensaje preguntando al usuario si sigue conectado
    let diferencia = 0; // la variable diferencia la usamos para calcular el tiempo que pasó entre la última hora de actividad y la hora actual 
    let numero_al_azar = Math.floor(Math.random() * 100); // numero_al_azar lo usamos para forzar el renderizado de la vista, para ello modificamos esa propiedad del estado cambiando su valor al azar (si fuera igual no se renderizaría porque no detecta un cambio en el estado)

    if (!ultimoRegistro){ // si no hay un registro de la hora de actividad significa que es la primera vez que se monta esta vista entonces inicializamos la hora actual y luego seguimos monitoreando los clicks
        sessionStorage.setItem('haction',fechaActual())
    }else{
      diferencia = compararFechas(ultimoRegistro) // comparamos la hora actual con la última hora registrada de actividad del usuario


      if (diferencia>tiempo_en_segundos_inactividad && !checking ){ // si la diferencia de tiempo es de 3 minutos y aún no hemos mostrado el mensaje al usuario iniciamos el procedimiento para mostrar el mensaje pidiendo al usuario que confirme que sigue conectado y activando los timers de reinicio
       contador = 100; // es la variable que usamos para mostrar al usurio el tiempo que falta para que termine su sesión por inactividad 

       //sessionStorage.removeItem('haction')
       sessionStorage.setItem('checking',true) // marcamos el flag para evitar que se vuelva a hacer todo N veces o sea para asegurarnos que se haga 1 sola vez cada vez que se detecta la inactividad
       
       setTimeout(() => {
          mostrarTimer() // iniciamos el contador de fin de sesión, pero en 500 milisegundos para asegurarnos que el elemento con id "mensaje_fin_sesion" ya exista en el DOM, necesitamos esperar un poco porque todavía no existe, se crea en el html del sweat alert
       }, 500);

        id_tiempo_reinicio = setTimeout(() => { // una vez que detectamos la inactividad de N minutos y mostramos el mensaje al usuario activamos un timer de 100 segundos, es decir en 100 segundo se va a ejecutar el fin de la sesión si no confirma que sigue conectado 
            
            // si el usurio no confirmo que sigue conectado eliminamos el token que le permitía acceder a los recursos del servidor
            // forzamos el renderizado de la vista al cambiar el estado modificando la propiedad reinicioLogin con la funcion setRenicioLogin
            // también eliminamos el flag para que no persista y se pueda volver a iniciar el ciclo de monitoreo
            // limpiamos el intervalo que hacia de timer
            localStorage.setItem('origen','admin')
            sessionStorage.removeItem('EMC_TOKEN')
            setReinicioLogin(numero_al_azar)
            sessionStorage.removeItem('checking')
            clearInterval(id_intervalo_contador)
        }, 100000);

        // Mostramos la ventana al usuario para que confirme si sigue conectado
        // es importante que haya en el html del mensaje el elemento con id mensaje_fin_sesion para que se muestre el timer con el contador de fin de sesión
        Swal.fire({
          html:'<h3>¿Sigues conectado?</h3><p id="mensaje_fin_sesion"></p>',
          confirmButtonText:'Si, sigo conectado',
          allowOutsideClick: false
      }).then(
          resultado=>{
              if (resultado.value){

                 // si el usuario confirma que sigue conectado limpiamos los flags para reiniciar el monitoreo hasta detectar otro tiempo de inactividad y volver a disparar el proceso de confirmación
                 sessionStorage.removeItem('haction') // lo limpio para reiniciar la hora de última actividad y comenzar de nuevo desde la hora actual
                 sessionStorage.removeItem('checking') // lo limpio para que no persista y se pueda volver a disparar el proceso de confirmación de actividad, si no se limpiara no entraría otra vez
                 clearInterval(id_intervalo_contador) // lo limpio para que deje de contar hacia atrás
                 clearTimeout(id_tiempo_reinicio) // lo limpio para detener el proceso de finalización de la sesión
              }
          }
      )
      }
    }
} 

function terminarSesion(setReinicioLogin){  //esta función se ejecuta cada x segundos con un setInterval para verificar la diferencia entre la hora actual y la última hora de actividad
  let numero_al_azar = Math.floor(Math.random() * 100); // numero_al_azar lo usamos para forzar el renderizado de la vista, para ello modificamos esa propiedad del estado cambiando su valor al azar (si fuera igual no se renderizaría porque no detecta un cambio en el estado)
  sessionStorage.removeItem('EMC_TOKEN')
  localStorage.setItem('origen','alumno') // guardo cuál fue el origen del logout para que en la vista LOGIN recuerde que tipo de ingreso preferentemente va a ser "administrativo" o "alumno"
  notificarLogoutAlServidor() // le digo al servidor que se desconectó un alumno para que descuente 1 del total
  setReinicioLogin(numero_al_azar) // fuerzo el reinicio cambiando el valor del estado del componente
  clearTimeout(id_intervalo_monitoreo_alumno) // limpio el id del timeout
} 

function mostrarTimer(){
    let texto = document.getElementById("mensaje_fin_sesion")

    // busco en el DOM el elemento con id mensaje_fin_sesion que se creó en el html del mensaje con sweatalert
    // y luego cada 1 segundo resto 1 del contador hasta el fin de la sesión

    id_intervalo_contador = setInterval(() => {
        contador = contador - 1;
        texto.innerHTML= `La sesión terminará en  ${contador}`
    }, 1000);
}

function confirmarTiempoInactividadAceptado(){
// uso esta funcion para modificar el tiempo de inactividad (en segundos) que se tomamos como
// parametro para pedir la confirmación al usuario que sigue conectado. Por default es 180 segundos pero
// en testing lo puedo llegar a modificar para algún tipo de prueba
// Si en la clave tcustom del localstorage hay un número lo va a tomar para reemplazar la variable tiempo_en_segundos_inactividad
// si no existe o no es un número toma el que ya estaba asignado en la declaración de la variable

    const existe_tcustom = localStorage.getItem('tcustom')
    if (existe_tcustom  ){

        const prueba_numero = Number(existe_tcustom)
        
        console.log('typeof(prueba_numero)',typeof(prueba_numero))

        if (typeof(prueba_numero)==='number'){
            tiempo_en_segundos_inactividad = prueba_numero;
        }
    }
}

async function notificarLogoutAlServidor(){
  try{
      Axios.post('api/usuarios/contabilizarlogout')
  }catch(err){
    console.log(err)
  }
}

function configurarWebSokectsParaAlgunaFuncionalidadTiempoReal(){
  var connectionOptions =  {
    "force new connection" : true,
    "reconnectionAttempts": "Infinity", 
    "timeout" : 10000,                  
    "transports" :  ["websocket"]
};

// me conecto al servidor websockets

  var io = socketIOClient.connect("http://localhost:3002",connectionOptions)

// escucho mensajes que el servidor websockets me manda con nombre FromAPI
  io.on("FromAPI",(data)=>{
      console.log(data)
  })

  // escucho mensajes que el servidor websockets me manda con nombre messages

  io.on("messages",(data)=>{
    console.log(data)
})
}