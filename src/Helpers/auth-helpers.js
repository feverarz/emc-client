import Axios from "axios";
import Swal from 'sweetalert2';

const TOKEN_KEY = 'EMC_TOKEN';

// cambio de localStorage a sessionStorage para que el token dure solo por la sesión activa
// de esta manera forzamos que al cerrar la ventana se deba volver a loguear
 
export function setToken(token){
    //localStorage.setItem(TOKEN_KEY,token)
    sessionStorage.setItem(TOKEN_KEY,token)
}

export function getToken(){
    //return localStorage.getItem(TOKEN_KEY)
    return sessionStorage.getItem(TOKEN_KEY)
}

export function deleteToken(){
    //localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    
}

export function initAxiosInterceptors(){
    Axios.interceptors.request.use(function(config){
                            // se ejecuta cada vez que hay una petición al servidor con axios
        const token = getToken();   // si existe un token en el localStorage se lo pega al header
                                    // del request para que el servidor lo reciba y lo analice
                                    // para autorizarlo a entrar a una ruta protegida

        if (token){
            config.headers.Authorization = `bearer ${token}`;
        }
        return config
    })

    Axios.interceptors.response.use(function(response){
                            // se ejecuta cada vez que hay una respuesta del servidor con axios
                            // si no hubo errores continùa
        return response
    },function(err){
        if (err.response.status=== 401){ // si encuentra un error de unauthorize 401 
            deleteToken();               // redirecciona al login
            
            Swal.fire({
                html:`<div><p>El tiempo de tu sesión ha expirado</p><p>Ingresa nuevamente si es necesario</p></div>`,
                icon: 'warning',
                timer:6000,
                confirmButtonColor: '#3085d6',
              }).then(()=>{
                window.location = '/login'
              })
            
        }else{
            return Promise.reject(err)
        }
    })
}