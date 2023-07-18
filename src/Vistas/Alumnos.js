import React, { useState, useEffect,useRef } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link } from 'react-router-dom';
import Loading from '../componentes/Loading';
import {useAlumno} from '../Context/alumnoContext';
import AbmCurso from '../abms/abm-curso';
import AbmAlumno from '../abms/abm-alumno';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faStar, faCheckCircle, faWindowClose, faEnvelopeOpen, faPlusSquare,faCircle, faHandPeace, faWindowRestore } from '@fortawesome/free-regular-svg-icons';
import { faGraduationCap,faKey, faTrash, faAngleRight,faAngleLeft, faSpellCheck ,faInfoCircle, faUndo, faSearch, faSync, faAt, faEquals, faHashtag, faGreaterThanEqual,faMailBulk,faUserCheck, faUsers, faListOl, faEnvelopeSquare, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Busqueda from '../componentes/Busqueda';
import BusquedaEgresados from '../componentes/BusquedaEgresados';
import BajaAlumnos from '../componentes/BajaAlumnos';
import CandidatosEgresados from '../componentes/CandidatosEgresados';
import AbmPassword from '../abms/Abm-password';
import ValidarEmails from '../componentes/ValidarEmails';
import {scrollTop, hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import SeleccionadorX from '../componentes/SeleccionadorX';

const regex_solo_numeros = /^[0-9\b]+$/;
       
export default function Alumnos({match,history}){

    const anchoPaginacion = 40;

    const [cursos,setCursos] = useState([])
    const [cursosAmostrar,setCursosAmostrar]=useState([])
    const {toggle, isShowing } = useModal();
    const [criterio, setCriterio ] = useState('original');


    const [alumnos,setAlumnos]=useState([]);
    const [textoAlumno,setTextoAlumno]=useState('');
    
    const [instrumentos,setInstrumentos]=useState([]);
    const [localidades,setLocalidades]=useState([]);
    const [provincias,setProvincias]=useState([]);
    const [localidadesPlus,setLocalidadesPlus]=useState([]);
    const [provinciasPlus,setProvinciasPlus]=useState([]);
    const [paises,setPaises]=useState([]);
    const [nacionalidades,setNacionalidades]=useState([]);
    const [nacionalidadSeleccionada,setNacionalidadSeleccionada] = useState(-1);
    const {cambiarAlumno,cargarParametrosVistaAlumnos,parametrosVistaAlumnos,usuario} = useAlumno();
    const [instrumento,setInstrumento]=useState(-1);
    const [provincia,setProvincia]=useState(-1);
    const [localidad,setLocalidad]=useState(-1);
    const [activos,setActivos]=useState(-1);
    const [alumno,setAlumno]=useState(-1);
    const [pais,setPais]=useState(-1);
    const [observacion,setObservacion]=useState(-1);
    const [carreras,setCarreras]=useState([]);
    const [carreraSeleccionada,setCarreraSeleccionada]=useState(-1);

    const [cantidad,setCantidad]=useState(usuario.id_permiso == 4 ? -1 : 1);

    const [personas, setPersonas ] = useState([]);
    const [tiposPersonal, setTiposPersonal ] = useState([]);
    const [permisos, setPermisos ] = useState([]);
    const [cantidadesCursos, setCantidadesCursos ] = useState([]);
    const [exactamenteIgual, setExactamenteIgual ] = useState(false);
    const [exactamenteIgualNiveli, setExactamenteIgualNiveli ] = useState(true);
    const [idAlumno, setIdAlumno ] = useState('');

    const [statusMail,setStatusMail]=useState(-1); // 0 Regular 1 Recuperatorio
    const [tipoCurso,setTipoCurso]=useState(-1); // 0 Regular 1 Recuperatorio
    const [cursosRecuperatorios,setCursosRecuperatorios]= useState(-1);
    // para activar el modal llamar a la función toggle en con alguna condicion o un evento...
    const [cargandoCursos,setCargandoCursos] = useState(false);
    const {cuatrimestreActivo,desHabilitarBusquedaAlumnos,habilitarBusquedaAlumnos} = useAlumno();
   // const {alumno, cambiarAlumno} = useAlumno();
    const [crearCurso,setCrearCurso]=useState(false);
    const [cursoAcopiar,setCursoAcopiar]=useState(null);
    const [copiarUnCurso, setCopiarUnCurso] = useState(false);
    const [contadorOperaciones, setContadorOperaciones]= useState(0);
    const [ultimosCursosCreados, setUltimosCursosCreados ]= useState([]);
    const [incluirCursadas,setIncluirCursadas]=useState(true)
    const prueba = match.params.id;

    const [recientes,setRecientes] = useState([]);    

    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null)
    const [alumnoSeleccionadoPassword,setAlumnoSeleccionadoPassword]=useState(null)
    const [alumnoSeleccionadoDetalle, setAlumnoSeleccionadoDetalle] = useState(null)
    const [id_copia, setid_copia] = useState(null)

    const [listaEmails, setListaEmails]=useState([])
    const [listaEmailsSeleccion, setListaEmailsSeleccion]=useState([])
    const [alumnosCopia,setAlumnosCopia]=useState([]);
    const [cargandoCursosAlumno,setCargandoCursosAlumno]=useState(false);
    const [abrirBusquedaInactivos,setAbrirBusquedaInactivos]=useState(false);
    const [abrirBusquedaEgresados,setAbrirBusquedaEgresados]=useState(false);
    const [abrirBusquedaBajas,setAbrirBusquedaBajas]=useState(false);
    const [abrirBusquedaCandidatos,setAbrirBusquedaCandidatos]=useState(false);
    const [abrirBusquedaCandidatos2,setAbrirBusquedaCandidatos2]=useState(false);
    const tipoAlumno = ['E','R'];
    const vectorActivos = ['Activos']
    const observaciones = ['Con observaciones','Sin observaciones'];
    const vectorHabilitadoWeb = ['SI','NO'];
    const [tipoAlumnoValor, setTipoAlumnoValor]=useState(-1)
    const [habilitadoWeb,setHabilitadoWeb]=useState(-1)
    const [idAlumnoModificadoEoR, setIdAlumnoModificadoEoR]=useState(null)
    const [contadorCambioDeEstado, setContadorCambioDeEstado]=useState(0)
    const [cambiandoEstado,setCambiandoEstado] = useState(false);
    const [ultimosCambiosStatus, setUltimosCambiosStatus ]= useState([]);
    const [crearNuevoAlumno,setCrearNuevoAlumno]=useState(false);
    const [iIni, setIini]=useState(0)
    const [iFin, setIfin]=useState(anchoPaginacion-1)
    const [hayFiltrosActivos,setHayFiltrosActivos]=useState(false)
    const [verObservaciones,setVerObservaciones]=useState(false);
    const [nivelesi,setNivelesI]=useState([]);
    const [nivelSeleccionado,setNivelSeleccionado] = useState(-1)
    const [orden,setOrden]=useState('alumno')
    const [nuevoCampo,setNuevoCampo]=useState(true)
    const [contadorOrden,setContadorOrden]=useState(0)
    const [cantidadFilas,setCantidadFilas]=useState(0);

    useEffect(()=>{

    let mounted = true;

        if (mounted){
            buscarAlumnos();
        }

    return ()=>{
        mounted = false
    }

    },[cuatrimestreActivo,contadorOperaciones])

    const buscarAlumnos = async ()=>{

        desHabilitarBusquedaAlumnos();

        setCargandoCursos(true)
        try{          
           // const {data} = await Axios.get(`/api/alumnos/listaplus/${incluirCursadas ? 1 : 0}`)
           // setCursos(data)
           // listarUltimoCursosCreados(data,setUltimosCursosCreados)

           const vectorResultado = await Promise.all([Axios.get(`/api/alumnos/listaplus/${incluirCursadas ? 1 : 0}`),
           Axios.get('/api/alumnos/altasrecientes'),Axios.get('/api/tablasgenerales/instrumentos'),Axios.get('/api/tablasgenerales/carreras'),Axios.get('/api/tablasgenerales/nivelesi')]);

            const data_mas_selector = vectorResultado[0].data.map((item)=>{return{...item,seleccion:false}})

            setCursos(data_mas_selector) // agrego el campo seleccion para los checkbox

            setRecientes(vectorResultado[1].data)
 
//            armarListaEmails(vectorResultado[0].data,setListaEmails) // la lista de emails no la armo más aquí sino en el click de enviar mail

            setInstrumentos(vectorResultado[2].data.map(item=>item.nombre)) 
            setCarreras(vectorResultado[3].data) 
            setNivelesI(vectorResultado[4].data) 
            setCargandoCursos(false)
            buscarUltimosCambiosStatus();

        }catch(err){
            console.log(err)
            setCargandoCursos(false)
        }
    }    
/*
    useEffect(()=>{

        // cuando levanto la vista por primera vez traigo lo que se haya guardado en el contexto
        // como filtros asi no se pierden
       if (parametrosVistaAlumnos){
            setTextoAlumno(parametrosVistaAlumnos.textoAlumno ? parametrosVistaAlumnos.textoAlumno : textoAlumno)
            setTipoAlumnoValor(parametrosVistaAlumnos.tipoAlumnoValor ? parametrosVistaAlumnos.tipoAlumnoValor : tipoAlumnoValor )
            setInstrumento(parametrosVistaAlumnos.instrumento ? parametrosVistaAlumnos.instrumento : instrumento)
            setLocalidad(parametrosVistaAlumnos.localidad ? parametrosVistaAlumnos.localidad : localidad)
            setProvincia(parametrosVistaAlumnos.provincia ? parametrosVistaAlumnos.provincia : provincia)
            setPais(parametrosVistaAlumnos.pais ? parametrosVistaAlumnos.pais: pais)
            setCantidad(parametrosVistaAlumnos.cantidad ? parametrosVistaAlumnos.cantidad : cantidad)
            setExactamenteIgual(parametrosVistaAlumnos.exactamenteIgual ? parametrosVistaAlumnos.exactamenteIgual: exactamenteIgual)
            setObservacion(parametrosVistaAlumnos.observacion ? parametrosVistaAlumnos.observacion : observacion)
            setOrden(parametrosVistaAlumnos.orden ? parametrosVistaAlumnos.orden : orden)
        }
    },[])
*/

    useEffect(()=>{
        resetLista()
    
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,habilitadoWeb:habilitadoWeb})
    },[habilitadoWeb])

    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,textoAlumno:textoAlumno})
        
    
    },[textoAlumno])

    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,nacionalidad:nacionalidadSeleccionada})
        
    
    },[nacionalidadSeleccionada])
    
    useEffect(()=>{
        resetLista()
       
        // el id del alumno filtrado no lo guardo, no creo que sea util
     //   cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,idAlumno:idAlumno})
        
    
    },[idAlumno])
    
    useEffect(()=>{
    
        resetLista()
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,tipoAlumnoValor:tipoAlumnoValor})
    
    },[tipoAlumnoValor])
    
    useEffect(()=>{
    
        resetLista()
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,instrumento:instrumento})
    
    },[instrumento])
    
    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,carrera:carreraSeleccionada})
    
    },[carreraSeleccionada])

    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,niveli:nivelSeleccionado})
    
    },[nivelSeleccionado])

    
    
    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,localidad:localidad})
    
    },[localidad])
    
    
    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,pais:pais})
        
        if (pais==-1){
            setProvincias([])
            setLocalidades([])
            setLocalidad(-1)
            setProvincia(-1)
        }else{
    
            setProvincias(provinciasPlus.filter(item=>item.pais==pais).map(item=>item.provincia))
            
        }
    
    },[pais,provinciasPlus]) // hace falta integrar el evento pais y provinciaPlus para que funcione el proceso de cargar los filtros que se guardaron en el contexto y que queden sincronizados. Si no se integran puede dispararse el seteo del pais sin estar todavía la lista provinciasPlus cargadas y si hay un filtro guardado de provincia no se va a cargar. Al sincronizarlos se va a disparar el proceso tanto cuando cambia de país como cuando se cargó la tabla provinciasPlus
    
    useEffect(()=>{
        resetLista()
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,provincia:provincia})
    
        if (provincia==-1){
            setLocalidades([])
            setLocalidad(-1)
        }else{
            setLocalidades(localidadesPlus.filter(item=>item.provincia==provincia).map(item=>item.localidad))
        }
    
    },[provincia, localidadesPlus]) // hace falta integrar el evento provincia y localidadesPlus para que funcione el proceso de cargar los filtros que se guardaron en el contexto y que queden sincronizados. Si no se integran puede dispararse el seteo de la provincia sin estar todavía la lista localidadesPlus cargadas y si hay un filtro guardado de localidad no se va a cargar. Al sincronizarlos se va a disparar el proceso tanto cuando cambia de provincia como cuando se cargó la tabla localidadesPlus
    
    
    useEffect(()=>{
        resetLista()
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,tipoAlumnoValor:tipoAlumnoValor})
    
    
    },[tipoAlumnoValor])
    
    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,cantidad:cantidad})
        
    
    },[cantidad])
    
    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,exactamenteIgual:exactamenteIgual})
        
    },[exactamenteIgual])
    
    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,exactamenteIgualNiveli:exactamenteIgualNiveli})
        
    },[exactamenteIgualNiveli])

    useEffect(()=>{
        resetLista()
       
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,observacion:observacion})
        
    },[observacion])

    useEffect(()=>{
        resetLista()
        // cada vez que modifico el campo por el cual se ordena la lista se modifica también
        // el objeto de filtros que se guarda en el contexto para que no se pierdan los filtros
        // cuando se carga la vista se buscan los filtros en el contexto y se cargan para recuperarlos
        cargarParametrosVistaAlumnos({...parametrosVistaAlumnos,orden:orden})
    },[contadorOrden])

    useEffect(()=>{

        const cargarListas = async ()=>{

            const alumnos = alumnosDelListado();
            setAlumnos(alumnos);

            // los instrumentos los busco de la tabla directamente no del listado como antes
            // para que solo me muestre de a  1 instrumento en el select
            //const instrumentos = instrumentosDelListado();
            //setInstrumentos(instrumentos);


            // provincias y localidades se cargan segùn  el paìs o la provincia que se seleccione con un useEffect en base a
            // los vectores provinciasPlus y localidadesPlus

           /* const localidades = localidadesDelListado();
            setLocalidades(localidades);

            const provincias = provinciasDelListado();
            setProvincias(provincias);*/

            const provinciasPlus = provinciasDelListadoPlus();

            setProvinciasPlus(provinciasPlus);

            const localidadesPlus = localidadesDelListadoPlus();

            setLocalidadesPlus(localidadesPlus);

            const paises = paisesDelListado();
            setPaises(paises);

            const cantCursos = cantidadCursosDelListado();
            setCantidadesCursos(cantCursos);

            const nacionalidades = nacionalidadesDelListado();
            setNacionalidades(nacionalidades);

        }



            cargarListas().then(()=>{

                if (parametrosVistaAlumnos){
                    setTextoAlumno(parametrosVistaAlumnos.textoAlumno ? parametrosVistaAlumnos.textoAlumno : textoAlumno)
                    setTipoAlumnoValor(parametrosVistaAlumnos.tipoAlumnoValor ? parametrosVistaAlumnos.tipoAlumnoValor : tipoAlumnoValor )
                    setInstrumento(parametrosVistaAlumnos.instrumento ? parametrosVistaAlumnos.instrumento : instrumento)
                    setCarreraSeleccionada(parametrosVistaAlumnos.carrera ? parametrosVistaAlumnos.carrera : carreraSeleccionada)
                    setLocalidad(parametrosVistaAlumnos.localidad ? parametrosVistaAlumnos.localidad : localidad)
                    setProvincia(parametrosVistaAlumnos.provincia ? parametrosVistaAlumnos.provincia : provincia)
                    setPais(parametrosVistaAlumnos.pais ? parametrosVistaAlumnos.pais: pais)
                    setCantidad(parametrosVistaAlumnos.cantidad ? parametrosVistaAlumnos.cantidad : cantidad)
                    setExactamenteIgual(parametrosVistaAlumnos.exactamenteIgual ? parametrosVistaAlumnos.exactamenteIgual: exactamenteIgual)
                    setExactamenteIgualNiveli(parametrosVistaAlumnos.exactamenteIgualNiveli ? parametrosVistaAlumnos.exactamenteIgualNiveli: exactamenteIgualNiveli)
                    setObservacion(parametrosVistaAlumnos.observacion ? parametrosVistaAlumnos.observacion : observacion)
                    setOrden(parametrosVistaAlumnos.orden ? parametrosVistaAlumnos.orden : orden)
                    setHabilitadoWeb(parametrosVistaAlumnos.habilitadoWeb ? parametrosVistaAlumnos.habilitadoWeb : habilitadoWeb)
                    setNacionalidadSeleccionada(parametrosVistaAlumnos.nacionalidad ? parametrosVistaAlumnos.nacionalidad : nacionalidadSeleccionada)
                    setCarreraSeleccionada(parametrosVistaAlumnos.niveli ? parametrosVistaAlumnos.niveli : nivelSeleccionado)
                }
                resetLista() // llamamos a resetLista ya que en el caso de alumnos por default mostramos la lista con un filtro por alumnos activos                     
            })


    },[cursos])

function limpiarFiltro(){
    setTextoAlumno("");
    hacerfocoEnPrimerInput('texto-alumno');
    setCursosAmostrar(cursos)
}

const irAinscripciones=(alumno)=>{
    seleccionarAlumno(alumno)
    history.push('/cursos')
}

const refrescarLista = ()=>{
    setContadorOperaciones(contadorOperaciones+1)
}

/*useEffect(()=>{
    if (pais==-1){
        setProvincias([])
        setLocalidades([])
        setLocalidad(-1)
        setProvincia(-1)
    }else{

        setProvincias(provinciasPlus.filter(item=>item.pais==pais).map(item=>item.provincia))
        
    }
},[pais])*/

/*useEffect(()=>{

    if (provincia==-1){
        setLocalidades([])
        setLocalidad(-1)
    }else{
        setLocalidades(localidadesPlus.filter(item=>item.provincia==provincia).map(item=>item.localidad))
    }

},[provincia])
*/

useEffect(()=>{
  //  armarListaEmails(cursosAmostrar,setListaEmailsSeleccion) // la lista de emails no la armo más aquí sino en el click de enviar mail
  // Comentario 281020201350  
  // agrego esta validacion para que redefina la paginacion solo si cambió la cantidad de filas a mostrar
  // Validación necesaria despuès de agregar el campo seleccion para el checkbox porque salta este evento
  // si cambia el vector cursosAmostrar por la seleccion y cambia la paginacion y no es normal
    if(cantidadFilas!=cursosAmostrar.length){
        definirValoresPaginacion(cursosAmostrar,setIini,setIfin,anchoPaginacion)
    }

    if (cursosAmostrar.length != cursos.length){
        setHayFiltrosActivos(true)
    }else{
        setHayFiltrosActivos(false)
    }

    // comentario 281020201352
    // se hace esta asignacion para la validacion de arriba, ver comentario 281020201350
    setCantidadFilas(cursosAmostrar.length)

},[cursosAmostrar])

useEffect(()=>{
    if(incluirCursadas){
        setCursos([...alumnosCopia]);
        setIncluirCursadas(false);
    }
},[incluirCursadas])

const buscarCursosSinRenderizar = async ()=>{

    try{          

       const vectorResultado = await Promise.all([Axios.get(`/api/alumnos/listaplus/${incluirCursadas ? 1 : 0}`),
       Axios.get('/api/alumnos/altasrecientes')]);

       setCursos(vectorResultado[0].data)
       setRecientes(vectorResultado[1].data)
       buscarUltimosCambiosStatus();

    }catch(err){
        console.log(err)
    }
}

const comparacion = (a,b)=>{

    switch (orden){
        case null : return 0 
        case 'edad':
        case 'Egresado':
        case 'id_alumno':
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

const resetLista=()=>{

    const tipoAlumnoNumerico = tipoAlumnoValor== 'E' ? 1 : 0;
    const filtrarVectorCursosOriginal = cursos.filter(item=>
            (item.documento.includes(textoAlumno) ||
            item.alumno.toUpperCase().includes(textoAlumno.toUpperCase()))
            && ((item.Egresado == tipoAlumnoNumerico && tipoAlumnoValor != '-1') ||
                tipoAlumnoValor=='-1')
            && ((item.instrumentos.includes(instrumento) && instrumento != '-1') ||
                instrumento=='-1')
            && ((item.carreras.includes(carreraSeleccionada) && carreraSeleccionada != '-1') ||
                carreraSeleccionada=='-1')
            && ((item.id_alumno==Number(idAlumno) && idAlumno != '') ||
            idAlumno=='')                
            && ((item.localidad == localidad && localidad != '-1') ||
                localidad=='-1')
            && ((item.provincia == provincia && provincia != '-1') ||
                provincia=='-1')
            && ((item.pais == pais && pais != '-1') ||
                pais=='-1')  
            && ((item.nacionalidad == nacionalidadSeleccionada && nacionalidadSeleccionada != '-1') ||
                nacionalidadSeleccionada=='-1')                  
            && ((item.habilitado_web == habilitadoWeb && habilitadoWeb != '-1') ||
            habilitadoWeb=='-1')                     
            && ((((item.observaciones != '' && item.observaciones != null) && observacion == 'Con observaciones')) ||
             (((item.observaciones == '' || item.observaciones == null) && observacion == 'Sin observaciones')) ||
            observacion=='-1')                                                                 
            && (((((item.cursos == cantidad && cantidad != '-1') ||
            cantidad=='-1')) && exactamenteIgual )
            || ((((item.cursos >= cantidad && cantidad != '-1') ||
            cantidad=='-1')) && !exactamenteIgual )
            )
            && (((((item.id_nivel_instrumental == nivelSeleccionado && nivelSeleccionado != '-1') ||
            nivelSeleccionado=='-1')) && exactamenteIgualNiveli )
            || ((((item.id_nivel_instrumental >= nivelSeleccionado && nivelSeleccionado != '-1') ||
            nivelSeleccionado=='-1')) && !exactamenteIgualNiveli ))
            )           

            .sort((a,b)=>{return comparacion(a,b)})
    
         setCursosAmostrar(filtrarVectorCursosOriginal)

}

const buscarUltimosCambiosStatus = async ()=>{

    try{          
     
       const {data} = await Axios.get(`/api/alumnos/cambiosstatus`)

       
       setUltimosCambiosStatus(data)

    }catch(err){
        console.log(err)
    }
}

const egresarAlumno = async (alumno)=>{
    try{

        setCambiandoEstado(true)

        const resultado = await Axios.put(`/api/alumnos/egresar/${alumno.id_alumno}/${usuario.id_prof}`);

        Swal.fire({
            text:`Se egresó a ${alumno.alumno} con éxito`,
            icon: 'warning',
            showConfirmButton: false,
            timer:500
        })
        .then(()=>{
            setIdAlumnoModificadoEoR(alumno.id_alumno)
            setContadorCambioDeEstado(contadorCambioDeEstado+1)

            const copiaCursosOriginal = cursos.map(item=>item.id_alumno == alumno.id_alumno ? {...item,Egresado:true, modificado:true} : item);

            setCursos(copiaCursosOriginal)
            buscarUltimosCambiosStatus();

            setCambiandoEstado(false)

        })   

    }catch(err){
        let mensaje_html_error;

        console.log('err.response.status',err.response.status)

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al egresar al alumno</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al egresar al alumno</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al egresar al alumno</p><p>${err.response}</p>`
        }

        setCambiandoEstado(false)

        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    }
}

const restaurarAlumno = async (alumno)=>{
    try{

        setCambiandoEstado(true)

        const resultado = await Axios.put(`/api/alumnos/restaurar/${alumno.id_alumno}/${usuario.id_prof}`);

        Swal.fire({
            text:`Se restauró a ${alumno.alumno} como alumno regular con éxito`,
            icon: 'warning',
            showConfirmButton: false,
            timer:500
        })
        .then(()=>{
            setIdAlumnoModificadoEoR(alumno.id_alumno)
            setContadorCambioDeEstado(contadorCambioDeEstado+1)

            const copiaCursosOriginal = cursos.map(item=>item.id_alumno == alumno.id_alumno ? {...item,Egresado:false, modificado:true} : item);

            setCursos(copiaCursosOriginal)

            buscarUltimosCambiosStatus();

            setCambiandoEstado(false)

        })   

    }catch(err){
        let mensaje_html_error;

        console.log('err.response.status',err.response.status)

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al restaurar al alumno</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al restaurar al alumno</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al restaurar al alumno</p><p>${err.response}</p>`
        }

        setCambiandoEstado(false)
        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
    }
}

const iniciarCambioTipo = (egresar, alumno)=>{

    let pregunta;
    let confirmacion;

    if (egresar){
        pregunta = `¿Confirma que desea egresar a ${alumno.alumno}?`
        confirmacion = 'Si, egresar'
    }else{
        pregunta = `¿Confirma que desea restaurar a ${alumno.alumno} como alumno regular?`
        confirmacion = 'Si, restaurar'
    }

    Swal.fire({
        text:pregunta,
        showCancelButton:true,
        confirmButtonText:confirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                if (egresar){
                    egresarAlumno(alumno);
                }else{
                    restaurarAlumno(alumno);
                }
            }else{
                console.log("Operación de egreso o restauración cancelada")
            }
        }
    )

}
/*
useEffect(()=>{
    if(cantidad==-1){
        setExactamenteIgual(true)
  
    }else{
        modificarListaPorCantidadCursos()
    }
},[cantidad,exactamenteIgual])
*/

/*useEffect(()=>{
    resetLista()
   
    // cada vez que modifico algún filtro se modifica también
    // el objeto de filtros que se guarda en el contexto para que no se pierdan 
    // cuando se carga la vista se buscan los filtros en el contexto y se cargan para recuperarlos

    const parametrosActuales = {
        textoAlumno:textoAlumno,
        tipoAlumnoValor:tipoAlumnoValor,
        instrumento:instrumento,
        localidad:localidad,
        provincia:provincia,
        pais:pais,
        cantidad:cantidad,
        exactamenteIgual:exactamenteIgual,
        observacion:observacion,
        orden:orden
    }

    cargarParametrosVistaAlumnos(parametrosActuales)
    

},[textoAlumno,tipoAlumnoValor,instrumento,localidad,provincia,pais,cantidad,exactamenteIgual,observacion])
*/


useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        if (alumnoSeleccionado){
            setAlumnoSeleccionado(null)
        }
        if (abrirBusquedaInactivos){
            setAbrirBusquedaInactivos(false)
        }
        if (abrirBusquedaEgresados){
            setAbrirBusquedaEgresados(false)
        }   
        if (abrirBusquedaBajas){
            setAbrirBusquedaBajas(false)
        }   
        if (abrirBusquedaCandidatos){
            setAbrirBusquedaCandidatos(false)
        }  
        if (abrirBusquedaCandidatos2){
            setAbrirBusquedaCandidatos2(false)
        }         
        if(crearNuevoAlumno){
            setCrearNuevoAlumno(false)
        }
        if(alumnoSeleccionadoPassword){
            setAlumnoSeleccionadoPassword(null)
        }
    }
},[isShowing])

const funcionOrden = (nombre_campo)=>{

    if (orden==nombre_campo){
        setNuevoCampo(false)
    }else{
        setNuevoCampo(true)
    }

    setOrden(nombre_campo)
    setContadorOrden(contadorOrden+1)

}

function finalizarAltaOcopia (alta,id_nuevo_alumno){

    buscarCursosSinRenderizar() 

    if (alta){
        setid_copia(null);
        setCrearNuevoAlumno(false)
        setAlumnoSeleccionado({id_alumno:id_nuevo_alumno,nombre:''});
    }
}

function finalizarPassword (){
    setAlumnoSeleccionadoPassword(null)
    toggle()
}

function finalizarAltaPorError (){
    // Creo esta función para el caso de un alta en el que ocurra un error luego de grabar el nuevo alumno
    // sea al grabar las materias, los instrumentos o vincularlos
    // Para cerrar el modal y que no pueda volver a hacer click en el botón grabar y crear N veces el nuevo alumno
    buscarCursosSinRenderizar() 
    setCrearNuevoAlumno(false)
    toggle()
}

const alumnosDelListado = ()=>{

    return cursos.map(item=>item.alumno).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const provinciasDelListadoPlus = ()=>{

    const aux =  cursos.map(item=>{return {provincia:item.provincia, pais: item.pais}}).sort((a,b)=>a.provincia.localeCompare(b.provincia))
    
    return aux.filter((item,index,vector)=>((index > 0 && item.provincia != vector[index - 1].provincia)|| index == 0) )
   
}

const localidadesDelListadoPlus = ()=>{

    //este vector se va a usar para filtrar las localidades que correspondan a la provincia seleccionada
    // ordeno el vector por provincia primero y luego por localidad para hacer corte de control por provincia
    // 2 formas de ordenar por varios campos... A y B (puede haber más) -- Dejo la forma B 
    // A
    //const aux =  cursos.map(item=>{return {localidad: item.localidad, provincia:item.provincia, pais: item.pais}}).sort((a,b)=>a.provincia.localeCompare(b.provincia)).sort((a,b)=>a.localidad.localeCompare(b.localidad))
    // B
    // Creo un vector auxiliar con localidad provincia y país, teniendo cuidado de quitar los espacios con el trim para evitar repeticiones por espacios
    const aux =  cursos.map(item=>{return {localidad: item.localidad.trim(), provincia:item.provincia, pais: item.pais}}).sort((a,b)=>a.localidad.localeCompare(b.localidad) || a.provincia.localeCompare(b.provincia))
    // Filtro por el índice 0 + localidad difernte al anterior + localidad igual al anterior pero (&&) distinta provincia
    return aux.filter((item,index,vector)=>((index > 0 && item.localidad != vector[index - 1].localidad)|| (index > 0 && item.localidad == vector[index - 1].localidad && item.provincia != vector[index - 1].provincia) || index == 0) )
   
}

const paisesDelListado = ()=>{

    return cursos.map(item=>item.pais).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const cantidadCursosDelListado = ()=>{

    return cursos.map(item=>item.cursos).sort((a,b)=>a-b).filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const nacionalidadesDelListado = ()=>{

    /*
    return cursos.map(item=>item.cursos).sort((a,b)=>a-b).filter((item,index,vector)=>
        item != vector[index-1] )
   */

    const nacionalidadesSet = new Set()

    cursos.forEach(item=>{
        nacionalidadesSet.add(item.nacionalidad)
    })

    const array = Array.from(nacionalidadesSet) 
    
    return array.sort((a,b)=>a.localeCompare(b))

}

const handleChangeInputAlumno = (e)=> {
   
    setTextoAlumno(e.target.value)
    // el resto de la acciòn se ejecuta en el useEffect
}

const handleChangeInputIdAlumno = (e)=> {
    
    if(!regex_solo_numeros.test(e.target.value) && e.target.value!='') // si no agrego && e.target.value !='' no dejaría pasar el valor = vacio , porque vacío no es un número
    {
        return false
    }

    setIdAlumno(e.target.value)
    // el resto de la acciòn se ejecuta en el useEffect
}

const handleChangeSelectInstrumento = (e)=> {

    setInstrumento(e.target.value) 
    // el resto de la acciòn se ejecuta en el useEffect

}

const handleChangeSelectCarrera = (e)=> {

    setCarreraSeleccionada(e.target.value) 
    // el resto de la acciòn se ejecuta en el useEffect
}

const handleChangeSelectNiveli = (e)=> {

    setNivelSeleccionado(e.target.value) 
    // el resto de la acciòn se ejecuta en el useEffect
}



const iniciarCrearAlumno = ()=>{
    setAlumnoSeleccionado(null);
    setCrearNuevoAlumno(true);
    toggle();
}

const limpiarTextoAlumno = ()=> {
    setTextoAlumno("");
}

const limpiarIdAlumno = ()=> {
    setIdAlumno('');
}


const limpiarPais = ()=> {
    setPais(-1);
}
const limpiarProvincia = ()=> {
    setProvincia(-1);
}

const limpiarInstrumento = ()=> {
    setInstrumento(-1);
}

const limpiarCarrera = ()=> {
    setCarreraSeleccionada(-1);
}

const limpiarNiveli = ()=> {
    setNivelSeleccionado(-1);
    setExactamenteIgualNiveli(true)
}

const limpiarTipoAlumnoValor = ()=> {
    setTipoAlumnoValor(-1);
}
const limpiarLocalidad = ()=> {
    setLocalidad(-1);
}

const limpiarNacionalidad = ()=> {
    setNacionalidadSeleccionada(-1);
}

const limpiarObservaciones = ()=> {
    setObservacion(-1);
}

const limpiarHabilitadoWeb = ()=> {
    setHabilitadoWeb(-1);
}


const handleChangeSelectLocalidad = (e)=> {
    setLocalidad(e.target.value);
    // el resto de la acciòn se ejecuta en el useEffect

}

const handleChangeSelectNacionalidad = (e)=> {
    setNacionalidadSeleccionada(e.target.value);
    // el resto de la acciòn se ejecuta en el useEffect

}

const handleChangeSelectTipoAlumno = (e)=>{

    setTipoAlumnoValor(e.target.value)
    // el resto de la acciòn se ejecuta en el useEffect

}

const handleChangeSelectProvincia = (e)=> {

    setProvincia(e.target.value);

        // el resto de la acciòn se ejecuta en el useEffect

}

const handleChangeSelectCantidad = (e)=> {
    setCantidad(e.target.value);
    // el resto de la acciòn se ejecuta en el useEffect
}

const handleChangeSelectObservaciones = (e)=> {
    setObservacion(e.target.value);
    // el resto de la acciòn se ejecuta en el useEffect
}

const handleChangeSelectHabilitadoWeb = (e)=> {
    setHabilitadoWeb(e.target.value);
    // el resto de la acciòn se ejecuta en el useEffect
}

const handleChangeSelectPais = (e)=> {
     setPais(e.target.value);

    // el resto de la acciòn se ejecuta en el useEffect

}

const iniciarAbrirBusquedaInactivos = ()=>{
    setAbrirBusquedaInactivos(true);
    toggle();
}

const iniciarAbrirBusquedaEgresados = ()=>{
    setAbrirBusquedaEgresados(true);
    toggle();
}

const iniciarAbrirBusquedaBajas = ()=>{
    setAbrirBusquedaBajas(true);
    toggle();
}

const iniciarAbrirBusquedaCandidatos = ()=>{
    setAbrirBusquedaCandidatos(true);
    toggle();
}

const iniciarAbrirBusquedaCandidatos2 = ()=>{
    setAbrirBusquedaCandidatos2(true);
    toggle();
}

const seleccionarAlumno = (alumno)=>{

    cambiarAlumno(alumno.id_alumno,alumno.alumno,'nombre','apellido','documento')

}

const procesarSeleccionAlumnoInactivo = (id)=>{
    setAlumnoSeleccionado({id_alumno:id})
    setAbrirBusquedaInactivos(false);
}

const procesarSeleccionCantidad = (exactamenteIgual)=>{
    setExactamenteIgual(exactamenteIgual)
}

const procesarSeleccionNiveli = (exactamenteIgual)=>{
    setExactamenteIgualNiveli(exactamenteIgual)
}


const mostrarObservaciones = ()=>{
    setInstrumento(-1) 
    setProvincia(-1);
    setLocalidad(-1);
    setAlumno(-1);
    setPais(-1);
    setCantidad(-1);
    setStatusMail(-1);
    setTextoAlumno("")
    setTipoAlumnoValor(-1);
    setCursosAmostrar(cursos);
    setVerObservaciones(true);
    setNacionalidadSeleccionada(-1)

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.observaciones!='' && item.observaciones!=null)
    setCursosAmostrar(filtrarVectorCursosOriginal)
}

const limpiarCantidad = ()=> {
    setCantidad(-1);
}

const limpiarFiltros = ()=>{
    setInstrumento(-1) 
    setProvincia(-1);
    setLocalidad(-1);
    setAlumno(-1);
    setPais(-1);
    setCantidad(-1);
    setStatusMail(-1);
    setTextoAlumno("")
    setTipoAlumnoValor(-1);
    setCursosAmostrar(cursos);
    setIdAlumno('');
    setVerObservaciones(false)
    setCarreraSeleccionada(-1)
    setHabilitadoWeb(-1)
    setNacionalidadSeleccionada(-1)
    setNivelSeleccionado(-1)
    setObservacion(-1);
}

const borrarAlumno = async (id)=>{

    try{
        const {data} = await Axios.delete(`/api/tablasgenerales/alumno/${id}`)

        Swal.fire({
            text:`Se eliminó al alumno con éxito`,
            icon: 'success',
            showConfirmButton: false,
            timer:2500
        })

        buscarAlumnos()

    }catch(err){
        Swal.fire({
            text:`${err.response.data.message}`,
            icon: 'warning',
            showConfirmButton: false,
            timer:2500
        })
    }
}

const iniciarBorrar = (item)=>{

    Swal.fire({
        text:`¿Confirma la eliminación del alumno ${item.alumno}?`,
        showCancelButton:true,
        confirButtonText:'Si, eliminar',
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                borrarAlumno(item.id_alumno);

            }else{
                console.log("Se canceló la eliminación del alumno")
            }
        }
    )
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

const copiarMails = ()=>{
    
    const seleccionados = cursosAmostrar.some(item=>item.seleccion==true)

    if(!seleccionados){
        alert('No hay alumnos seleccionados')
        return
    }

    const html = `Alumnos seleccionados: ${seleccionados.length}`

    const resultado = armarListaEmailsSync(cursosAmostrar) // la lista de emails no la armo más aquí sino en el click de enviar mail

        //alert('Se encontraron emails inválidos\n\n' + resultado.errores)

    const html_errores = mensajeCopiaEmails(resultado)

        Swal.fire({
            html:html_errores,
            icon: 'warning',
            confirmButtonText:'Continuar',
            confirmButtonColor: '#3085d6',
            showCancelButton:true,
            cancelButtonText:'Cancelar'
            }).then((respuesta)=>{
    
                if(seleccionados.length==0){
                    return
                }
            
                if (respuesta.value){

                    const emails_string = resultado.emails.join()
    
                    const longitud_relativa = emails_string.length/45;

                    const rows = longitud_relativa > 1 ? longitud_relativa : 1;
         
                    Swal.fire({
                     html:`<div>
                     <textarea class="text-small" style={z-index:-1} id='copyemails' rows=${rows} cols="60">${emails_string}</textarea>
                     </div>`,
                     showCancelButton: true,
                     confirmButtonText: `Copiar`,
                     cancelButtonText: `Cancelar`,
                   }).then((result) => {
                     /* Read more about isConfirmed, isDenied below */
                         var input = document.getElementById('copyemails')
                         input.focus();
                         input.select(); 
         
                     if (result.isConfirmed) {
                        
                         document.execCommand('copy');
                       
                         Swal.fire({
                             icon: 'success',
                             text: 'Copiado!',
                             showConfirmButton: false,
                             timer: 1000
                           })
                     } 
                   })

                }
            })
    
}

const cambiarCheck =(e)=>{

    const aux3 = cursosAmostrar.map(item=>{
        if (item.id_alumno!=e.target.value){
            return item
        }else{
            return {...item,seleccion:!item.seleccion}
        }
    })

    setCursosAmostrar(aux3)
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

const iniciarModificarPassword = (persona)=>{
    setAlumnoSeleccionadoPassword(persona)
    toggle()
}

const paginar = (ini,fin)=>{
    setIini(ini)
    setIfin(fin)
}

if (cargandoCursos){
return <Main center><Loading blanco={false}/><span className="cargando">{incluirCursadas ? 'Contando cantidad de cursadas de cada alumno...' : 'Cargando alumnos...'}</span></Main>
  };

  //`/curso/${curso.nro_curso}`
return(
    <Main>

        { isShowing && (alumnoSeleccionado || crearNuevoAlumno) && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
            {alumnoSeleccionado && <BotonInscripcion irAinscripciones={irAinscripciones} alumno={alumnoSeleccionado}/>}
            <AbmAlumno id_alumno={alumnoSeleccionado ? alumnoSeleccionado.id_alumno : null} 
                       finalizarAltaOcopia={finalizarAltaOcopia}
                       esModal={true}
                       id_copia = {id_copia}
                       finalizarAltaPorError = {finalizarAltaPorError}
                       irAinscripciones={irAinscripciones}/>    
        </Modal>}

        { isShowing && alumnoSeleccionadoPassword && <Modal titulo={'Consulta de datos de acceso (alumnos)'} hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
            <AbmPassword alumno={alumnoSeleccionadoPassword} 
                       finalizar={finalizarPassword}
                       esModal={true}/>    
        </Modal>}        

        {
            isShowing && abrirBusquedaInactivos && <Modal hide={toggle} titulo="Validación de e-mails" isShowing={isShowing} estilo={{width:'700px'}} estiloWrapper={{background:'#000000bf'}}>
                    <ValidarEmails alumnos={cursos}/>
            </Modal>
        }
        {
            isShowing && abrirBusquedaEgresados && <Modal hide={toggle} titulo="Listado de alumnos egresados" isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                    <BusquedaEgresados finalizarSeleccion={procesarSeleccionAlumnoInactivo}/>
            </Modal>
         } 
        {
            isShowing && abrirBusquedaBajas && <Modal hide={toggle} titulo="Listado de bajas de alumnos" isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                    <BajaAlumnos/>
            </Modal>
         }          
        {
            isShowing && abrirBusquedaCandidatos && <Modal hide={toggle} titulo="Búsqueda de posibles graduaciones Músico profesional" isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#000000bf'}}>
                    <CandidatosEgresados tipo_analisis="porobligatorias" carrera={1}/>
            </Modal>
        }  
        {
            isShowing && abrirBusquedaCandidatos2 && <Modal hide={toggle} titulo="Búsqueda de posibles graduaciones Producción musical" isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#000000bf'}}>
                    <CandidatosEgresados tipo_analisis="porobligatorias" carrera={2}/>
            </Modal>
        }        
        {cambiandoEstado && <Loading><span className="cargando"></span></Loading>}

       
        <div className= {cambiandoEstado ? "hidden": "bg-blue text-whitexxx p-4 rounded relative mt-v ml-auto mr-auto"}> 
        
            <div className="flex f-row f-cabecera justify-content-space-between">

                <TipoCursos hayFiltrosActivos = {hayFiltrosActivos}
                limpiarFiltros = {limpiarFiltros}
                textoAlumno = {textoAlumno}
                idAlumno = {idAlumno}
                handleChangeInputIdAlumno = {handleChangeInputIdAlumno}
                handleChangeInputAlumno = {handleChangeInputAlumno}
                limpiarFiltro = {limpiarFiltro}
                tipoAlumnoValor = {tipoAlumnoValor}
                handleChangeSelectTipoAlumno = {handleChangeSelectTipoAlumno}
                tipoAlumno = {tipoAlumno}
                instrumento = {instrumento}
                handleChangeSelectInstrumento = {handleChangeSelectInstrumento}
                instrumentos = {instrumentos}
                localidad = {localidad}
                handleChangeSelectLocalidad = {handleChangeSelectLocalidad}
                localidades = {localidades}
                provincia = {provincia}
                handleChangeSelectProvincia = {handleChangeSelectProvincia}
                provincias = {provincias}
                pais = {pais}
                handleChangeSelectPais = {handleChangeSelectPais}
                paises = {paises}
                limpiarPais = {limpiarPais}
                limpiarProvincia = {limpiarProvincia}
                limpiarLocalidad = {limpiarLocalidad}
                limpiarInstrumento = {limpiarInstrumento}
                limpiarTipoAlumnoValor = {limpiarTipoAlumnoValor}
                limpiarTextoAlumno = {limpiarTextoAlumno}
                limpiarIdAlumno = {limpiarIdAlumno}
                cantidad = {cantidad}
                limpiarCantidad = {limpiarCantidad}
                handleChangeSelectCantidad = {handleChangeSelectCantidad}
                vectorActivos = {cantidadesCursos}
                procesarSeleccionCantidad = {procesarSeleccionCantidad}
                exactamenteIgual = {exactamenteIgual}
                exactamenteIgualNiveli = {exactamenteIgualNiveli}
                limpiarObservaciones = {limpiarObservaciones}
                observacion = {observacion}
                handleChangeSelectObservaciones = {handleChangeSelectObservaciones}
                observaciones = {observaciones}
                carreras = {carreras}
                handleChangeSelectCarrera = {handleChangeSelectCarrera}
                carrera = {carreraSeleccionada}
                limpiarCarrera = {limpiarCarrera}
                handleChangeSelectHabilitadoWeb = {handleChangeSelectHabilitadoWeb}
                habilitadoWeb = {habilitadoWeb}
                limpiarHabilitadoWeb = {limpiarHabilitadoWeb}
                vectorHabilitadoWeb = {vectorHabilitadoWeb}
                limpiarNacionalidad = {limpiarNacionalidad}
                handleChangeSelectNacionalidad = {handleChangeSelectNacionalidad}
                nacionalidades = {nacionalidades}
                nacionalidadSeleccionada = {nacionalidadSeleccionada}
                nivelesi = {nivelesi}
                nivelSeleccionado = {nivelSeleccionado}
                limpiarNiveli = {limpiarNiveli}
                handleChangeSelectNiveli = {handleChangeSelectNiveli}
                procesarSeleccionNiveli = {procesarSeleccionNiveli}
                />

                {cuatrimestreActivo && 
                    <Cabecera cuatrimestreActivo={cuatrimestreActivo} 
                            iniciarCrearAlumno={iniciarCrearAlumno} 
                            refrescarLista={refrescarLista}
                            incluirCursadas={incluirCursadas}
                            cargandoCursosAlumno={cargandoCursosAlumno}
                            setIncluirCursadas={setIncluirCursadas}
                            cursosAmostrar={cursosAmostrar}
                            iniciarAbrirBusquedaInactivos={iniciarAbrirBusquedaInactivos}
                            iniciarAbrirBusquedaEgresados={iniciarAbrirBusquedaEgresados}
                            iniciarAbrirBusquedaBajas={iniciarAbrirBusquedaBajas}
                            iniciarAbrirBusquedaCandidatos = {iniciarAbrirBusquedaCandidatos}
                            iniciarAbrirBusquedaCandidatos2 = {iniciarAbrirBusquedaCandidatos2}
                            verObservaciones = {verObservaciones}
                            mostrarObservaciones = {mostrarObservaciones}
                            listaEmails = {listaEmails}
                            enviarMail={enviarMail}
                            usuario = {usuario}
                            listaEmailsSeleccion = {listaEmailsSeleccion}
                            copiarMails = {copiarMails}
                            />
                }
            </div>
            
        <div className="flex f-col centro-w300 ml-auto mr-auto res-lista">
            <div className="flex f-col">
                <span>{cursosAmostrar.length== 1 ? `1 alumno encontrado`:`${cursosAmostrar.length} alumnos encontrados`}</span> 
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={cursosAmostrar.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>
        </div>
        <table className="table mt-2">
            <thead className="bg-blue-500 text-white ">
                <tr className="titulo-lista">

                    <th scope="col"></th>
                    <th>
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
                    </th>                    
                    <th scope="col" className={orden=='id_alumno' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('id_alumno')}>#ID</th>
                    <th className="mw-120x" className={orden=='alumno' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('alumno')} scope="col">Nombre</th>
                    <th className={orden=='Egresado' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('Egresado')} title="Egresado o Regular" scope="col">E/R</th>
                    <th className={orden=='instrumentos' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('instrumentos')} scope="col">Instrumento</th>
                    <th className={orden=='carreras' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('carreras')} scope="col">Carreras</th>
                    <th className={orden=='cursos' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('cursos')} scope="col">Materias</th>
                    {/*<th className={orden=='localidad' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('localidad')} scope="col">Localidad</th>
                    <th className={orden=='provincia' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('provincia')} scope="col">Provincia</th>*/}
                    {/*<th className={orden=='pais' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('pais')} scope="col">Pais</th>*/}
                    <th className={orden=='nacionalidad' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('nacionalidad')} scope="col">Nac.</th>
                    <th className={orden=='celular' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('celular')} scope="col">Celular</th>
                    {/*<th className={orden=='telefono' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('telefono')} scope="col">Teléfono</th>*/}
                    <th className={orden=='habilitado_web' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('habilitado_web')} scope="col">Web</th>
                    <th className={orden=='nivel_instrumental' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('nivel_instrumental')} scope="col">Nivel I.</th>
                    <th colSpan="6" title="" scope="col">Acciones</th>
                   
                </tr>
            </thead>
            <tbody>
            {
                cursosAmostrar
                .map((item,index)=>{return {...item,indice:index+1}})
                .filter((item,index)=>{
                    return index>= iIni && index<=iFin
                }).map((curso) => {
                return (
                    <tr key={curso.id_alumno} className="bg-blueTabla">

                        <td className="indice">{curso.indice}</td>
                        <td className="text-center"><input value={curso.id_alumno} 
                            checked={curso.seleccion} 
                            onChange={(e)=>cambiarCheck(e)} type="checkbox" 
                            title="Marque o desmarque éste alumno"/>
                        </td>
                        <td onClick={()=>{setAlumnoSeleccionadoDetalle(curso.id_alumno)}} className="filas-lista-principal" >{curso.id_alumno}</td>
                        <td className="mw-150">
                                <span onClick={()=>{setAlumnoSeleccionado(curso);
                                     toggle()}} title={curso.alumno} className="filas-lista-principal cursor-pointer">{curso.alumno}</span>
                                {/*alumnoSeleccionadoDetalle == curso.id_alumno && <div className="flex f-col bg-azul-tema text-white p-2">
                                    <span onClick={()=>{setAlumnoSeleccionadoDetalle(null)}} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera flex justify-content-end">
                                        <FontAwesomeIcon icon={faWindowClose}/>
                                    </span>
                                    <span>Información del alumno</span>    
                                    <span>¿Què datos agregar aquì?</span>    
                                </div>*/}
                                {curso.observaciones!='' && curso.observaciones!=null && <div title="Observaciones" className="flex f-col border-bottom-solid bg-azul-tema text-white p-1 text-xxsmall mt-2">
                                    <span>{curso.observaciones}</span>    
                                </div>}
                        </td>
                        <EgresadoOregular alumno={curso} ultimosCambiosStatus={ultimosCambiosStatus}/>
                        {incluirCursadas && <td className="filas-lista mw-120x">{curso.cursos}</td>}
                        <td className="filas-lista mw-120x" title={curso.instrumento2}>{curso.instrumentos}</td>
                        <td className="filas-lista mw-120x text-center" style={{fontSize:'x-small'}} >{curso.carreras}</td>
                        <td className="filas-lista mw-120x text-center" >{curso.cursos}</td>
                        {/*<td title={curso.localidad} className="filas-lista mw-120x" >{curso.localidad}</td>
                        <td title={curso.provincia} className="filas-lista mw-120x" >{curso.provincia}</td>
                        <td title={curso.pais} className="filas-lista mw-120x" >{curso.pais}</td>*/}
                        <td title={curso.nacionalidad} className="filas-lista mw-120x" >{curso.nacionalidad}</td>
                        <td title={curso.celular} className="filas-lista mw-150x" >{curso.celular}</td>
                        {/*<td title={curso.telefono} className="filas-lista mw-150x" >{curso.telefono}</td>*/}
                        <td title={`Habilitado para acceso web: ${curso.habilitado_web}`} className="filas-lista mw-120x text-center" >{curso.habilitado_web}</td>
                        <td title={`Nivel instrumental del instrumento principal`} className="filas-lista mw-120x text-center" >{curso.nivel_instrumental}</td>
                        <td title={curso.email!=null && curso.email!='' ? `Enviar un mail a ${curso.email}` : ''} className="cursor-copy p-iconos-listas width-35" >
                              <a target="_blank" className="color-tomato text-large hw" href={crearMailToIndividual(curso.email)}><FontAwesomeIcon icon={curso.email != null && curso.email.trim()!='' ? faEnvelopeOpen : faCircle} /></a>  
                        </td>
                        <td onClick={()=>{setAlumnoSeleccionado(curso);
                                     toggle()}} title={`Abrir la ficha del alumno ${curso.alumno}`} className="cursor-copy p-iconos-listas width-35" >
                                <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                        </td>
                        {!usuario.id_permiso == 4 && <td title="Seleccionar el alumno e ir a inscripción de cursos" onClick={()=>irAinscripciones(curso)} className="cursor-pointer p-iconos-listas width-35" >
                                <FontAwesomeIcon icon={faUsers}/>
                        </td>}
                        {usuario.id_permiso > 2 && <td title="Consultar los datos de acceso del alumno" onClick={()=>iniciarModificarPassword(curso)} className="cursor-pointer p-iconos-listas width-35" >
                                <FontAwesomeIcon icon={faKey}/>
                        </td>}
                        {curso.Egresado && !usuario.id_permiso == 4 && <td onClick={()=>iniciarCambioTipo(false,curso)} title='Restaurar a alumno regular' className="cursor-pointer p-iconos-listas width-35" >
                             <FontAwesomeIcon icon={faUndo}/>
                        </td>}    
                        {!curso.Egresado && !usuario.id_permiso == 4 && <td onClick={()=>iniciarCambioTipo(true,curso)} title='Egresar' className="cursor-pointer p-iconos-listas width-35" >
                             <FontAwesomeIcon icon={faStar}/>
                        </td>} 
                        <td title="Eliminar al alumno" onClick={()=>iniciarBorrar(curso)} className="cursor-pointer p-iconos-listas width-35" >
                                <FontAwesomeIcon icon={faTrash}/>
                        </td>                            
                     </tr>
                   )
                })
            }
            </tbody>
        </table>
            <div className="flex f-col centro-w300 ml-auto mr-auto res-lista">
                    <div className="flex f-col">
                        <Paginacion anchoPaginacion={anchoPaginacion} longitud={cursosAmostrar.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
                    </div>
            </div>         
      </div>
      {/*<div style={{width: "100%"}}><p>{JSON.stringify(cursos, null, "\t")}</p></div>*/}
    </Main>
)
    }

function TipoCursos({hayFiltrosActivos,
        limpiarFiltros,
        textoAlumno,handleChangeInputAlumno,handleChangeInputIdAlumno,
        limpiarFiltro,tipoAlumnoValor,handleChangeSelectTipoAlumno,tipoAlumno,
        limpiarIdAlumno, idAlumno,
        instrumento,handleChangeSelectInstrumento,instrumentos,
        localidad,handleChangeSelectLocalidad,localidades,
        provincia,handleChangeSelectProvincia,provincias,
        pais,handleChangeSelectPais,paises,
        limpiarPais,limpiarProvincia,limpiarLocalidad,
        limpiarInstrumento, limpiarTextoAlumno,
        procesarSeleccionCantidad,exactamenteIgual,
        limpiarTipoAlumnoValor,
        cantidad,
        vectorActivos,
        limpiarCantidad,
        handleChangeSelectCantidad,
        limpiarObservaciones,
        handleChangeSelectObservaciones,
        observacion,
        observaciones,carreras,handleChangeSelectCarrera,carrera,limpiarCarrera,
        handleChangeSelectHabilitadoWeb ,habilitadoWeb ,limpiarHabilitadoWeb ,
        vectorHabilitadoWeb,
        limpiarNacionalidad,
        handleChangeSelectNacionalidad,
        nacionalidades,
        nacionalidadSeleccionada, nivelesi, nivelSeleccionado,limpiarNiveli,handleChangeSelectNiveli,
        exactamenteIgualNiveli,procesarSeleccionNiveli
    }){

        let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
        let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";
                    
    return (
    <div className="flex f-col">
    
    <div className="flex f-row text-white">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Nombre</span>

        <TextoInputAlumno texto={textoAlumno} onchange={handleChangeInputAlumno} limpiarFiltro={limpiarFiltro}/>
        <InputIdAlumno texto={idAlumno} onchange={handleChangeInputIdAlumno} limpiarFiltro={limpiarIdAlumno}/>

    </div> 
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Materias cursadas</span>

        <Seleccionador nombre='Todos' valor={cantidad} onchange={handleChangeSelectCantidad } vector = {vectorActivos}/>
    
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
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Egresado/Regular</span>

        <Seleccionador nombre='Todos' valor={tipoAlumnoValor} onchange={handleChangeSelectTipoAlumno} vector = {tipoAlumno}/>
    
        { tipoAlumnoValor!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarTipoAlumnoValor}/>
                    </button>}
    </div>    
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Instrumento</span>
        <Seleccionador  nombre='Todos' valor={instrumento} onchange={handleChangeSelectInstrumento} vector = {instrumentos}/>
    
        { instrumento!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarInstrumento}/>
                    </button>}
    </div>    
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Nivel instrumental</span>
        <SeleccionadorX id='select-carrera' vector={nivelesi} valor={nivelSeleccionado} onchange={handleChangeSelectNiveli} nombre="Todos" claves={{id:'id_nivel_instrumental',nombre:'nombre'}}/>
        
        { nivelSeleccionado!="-1" &&  <div className="contenedor-select-mymn">    
                        <span title="Exactamente igual al valor seleccionado" onClick={()=>procesarSeleccionNiveli(true)} className={exactamenteIgualNiveli ? 'seleccionado cursor-pointer' : 'no-seleccionado cursor-pointer'}><FontAwesomeIcon  icon={faEquals}/></span>
                        <span title="Igual o mayor al valor seleccionado" onClick={()=>procesarSeleccionNiveli(false)} className={exactamenteIgualNiveli ? 'no-seleccionado cursor-pointer' : 'seleccionado cursor-pointer'}><FontAwesomeIcon icon={faGreaterThanEqual}/></span>
                    </div>    } 

        { nivelSeleccionado!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarNiveli}/>
                    </button>}
    </div>      
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">País</span>

        <Seleccionador nombre='Todos' valor={pais} onchange={handleChangeSelectPais} vector = {paises}/>
    
        { pais!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarPais}/>
                    </button>}
    </div>
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Provincia</span>

        <Seleccionador  nombre='Todas' valor={provincia} onchange={handleChangeSelectProvincia} vector = {provincias}/>
     
        { provincia!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarProvincia}/>
                    </button>}
     </div>  
     <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Localidad</span>

        <Seleccionador  nombre='Todas' valor={localidad} onchange={handleChangeSelectLocalidad} vector = {localidades}/>
    
        { localidad!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarLocalidad}/>
                    </button>}
    </div>
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Observaciones</span>

        <Seleccionador  nombre='Todos' valor={observacion} onchange={handleChangeSelectObservaciones} vector = {observaciones}/>
    
        { observacion!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarObservaciones}/>
                    </button>}
    </div> 
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Carreras</span>
        <SeleccionadorX id='select-carrera' vector={carreras} valor={carrera} onchange={handleChangeSelectCarrera} nombre="Todas" claves={{id:'cod_carrera',nombre:'cod_carrera'}}/>
        { carrera!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarCarrera}/>
                    </button>}
    </div>  
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Acceso web</span>

        <Seleccionador  nombre='Todos' valor={habilitadoWeb} onchange={handleChangeSelectHabilitadoWeb} vector = {vectorHabilitadoWeb}/>
    
        { habilitadoWeb!="-1" && <button><FontAwesomeIcon 
                        className="ic-abm"
                        icon={faWindowClose} 
                        onClick={limpiarHabilitadoWeb}/>
                    </button>}
    </div>   
    <div className="flex f-row">
        <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Nacionalidad</span>
        <SeleccionadorX id='select-nacionalidad' limpiar={limpiarNacionalidad}  vector={nacionalidades} valor={nacionalidadSeleccionada} onchange={handleChangeSelectNacionalidad} nombre='Todas'/>
    </div>
    {hayFiltrosActivos && <a onClick={limpiarFiltros} title="Limpiar todos los filtros" className="cursor-pointer mt-2 mr-2 ml-2">
    <FontAwesomeIcon className="color-tomato" icon={faTrash}/><span className="text-small">Limpiar filtros</span>
    </a> }
    </div>
    
    )
    
}

function TextoInputAlumno({onchange,texto,limpiarFiltro}){
    return <div className="flex f-row">
                <input autoComplete="off"  
                       onFocus={()=>seleccionarTextoInput("texto-alumno")} 
                       onClick={()=>seleccionarTextoInput("texto-alumno")} 
                       id="texto-alumno" type="text" 
                       onChange={onchange} 
                       placeholder="Nombre o DNI"
                       value={texto} 
                       className="texto-busqueda-alumno" />
                { texto!="" && <button><FontAwesomeIcon 
                                className="ic-abm"
                                icon={faWindowClose} 
                                onClick={limpiarFiltro}/>
                            </button>}
            </div>

}

function InputIdAlumno({onchange,texto,limpiarFiltro}){
    return <div className="flex f-row">
                <input autoComplete="off"  
                       onFocus={()=>seleccionarTextoInput("id-alumno")} 
                       onClick={()=>seleccionarTextoInput("id-alumno")} 
                       id="id-alumno" type="text" 
                       onChange={onchange} 
                       placeholder="ID"
                       maxLength={4}
                       value={texto} 
                       className="texto-id-alumno" />
                { texto!="" && <button><FontAwesomeIcon 
                                className="ic-abm"
                                icon={faWindowClose} 
                                onClick={limpiarFiltro}/>
                            </button>}
            </div>

}

function Seleccionador({vector,onchange,valor,sinTexto,nombre}){
    let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
    let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";

    return (            
        <div className="input-field col s12">
            <select value={valor} onChange = {onchange} className={valor=="-1" ? clasesSelect : clasesActivo}>
                <option value="-1" key="-1">{sinTexto ? '' : vector.length>0 ? nombre : '???'}</option>
                {vector.map(item=><option value={item} key={item}>{item}</option> )}
            </select>
        </div>
        )
        
}    

function SeleccionadorXold({vector,onchange,valor,nombre,noDefault,name,classancho,limpiar,claves,id}){
    let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
    let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";

    if (classancho){
        clasesSelect=`block appearance-none ${classancho} select-titulo rounded shadow leading-tight`
    }

    //recordar que un objeto puedo leerlo de 2 formas como vector o como objeto
    // es lo mismo usuario['nombre'] que usuario.nombre
    // aprovecho esta característica para hacer un seleccionador genérico y le paso
    // el nombre de la clave y el texto como un string para referenciarlo en notación vector
    return (            
        <div className="input-field col s12 flex f-row">
            <select value={valor} name={name? name : ''} onChange = {onchange} className={valor=="-1" ? clasesSelect : clasesActivo} id={id? id : null}>
                { noDefault ? null : <option value="-1" key="-1">{nombre}</option>}
                {vector.map(item=><option value={item[claves.id]} key={item[claves.id]}>{item[claves.nombre]}</option> )}
            </select>
            { valor!="-1" && limpiar && 
                        <button>
                            <FontAwesomeIcon className="ic-abm"
                                            icon={faWindowClose} 
                                            onClick={limpiar}/>
                        </button>}  
        </div>
        )
        
}   

function EgresadoOregular({alumno,ultimosCambiosStatus,reinicializarEstado}){

    const ultimoEstadoEoR = useRef(null)

    let estadoEoR;

    estadoEoR = alumno.Egresado;

    const test = ultimosCambiosStatus.filter(a=>alumno.id_alumno==a.id_alumno)

    return <td title={estadoEoR ? 'Alumno egresado' : 'Alumno regular'} className={test.length>0 ? "filas-lista reciente" : "filas-lista"}>{estadoEoR ? 'E' : 'R'} 
        {test.length>0 && <FontAwesomeIcon className="ml-2 opacity-5" title={ test[0].egresado ? `Egresado el ${test[0].fecha} por ${test[0].usuario}` : `Restaurado el ${test[0].fecha} por ${test[0].usuario}`} icon={faInfoCircle}/>}
    </td>
}

function Cabecera({cuatrimestreActivo,
                enviarMail,
                   refrescarLista,
                   iniciarCrearAlumno,
                   incluirCursadas,
                   cargandoCursosAlumno,
                   setIncluirCursadas,
                   iniciarAbrirBusquedaInactivos,
                   iniciarAbrirBusquedaEgresados,
                   iniciarAbrirBusquedaBajas,
                   iniciarAbrirBusquedaCandidatos,
                   iniciarAbrirBusquedaCandidatos2,usuario,
                   verObservaciones,mostrarObservaciones,listaEmails,listaEmailsSeleccion,copiarMails}){
    return <div className="flex f-col alignself-fe">

            <span title="Refrescar la lista" onClick={()=>refrescarLista()} 
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faSync}/> Refrescar
            </span>
            <span title="Crear un nuevo alumno" onClick={()=>iniciarCrearAlumno()} 
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faPlusSquare}/> Crear un nuevo alumno
            </span>

            <span title="Buscar un alumno egresado" onClick={iniciarAbrirBusquedaEgresados}
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faSearch}/> Buscar alumnos egresados
            </span>
            <span title="Buscar las bajas en el cuatrimestre activo" onClick={iniciarAbrirBusquedaBajas}
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faSearch}/> Buscar bajas de alumnos
            </span>            
            { usuario.id_prof==200 && <>
            <span title="Buscar un alumno egresado" onClick={iniciarAbrirBusquedaCandidatos}
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faGraduationCap}/> Buscar posibles graduaciones de Músico Profesional
            </span>
            
            <span title="Buscar un alumno egresado" onClick={iniciarAbrirBusquedaCandidatos2}
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faGraduationCap}/> Buscar posibles graduaciones de Producción musical
            </span>
            </>}             
            <span title="Buscar un alumno egresado" onClick={iniciarAbrirBusquedaInactivos}
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faSpellCheck}/> Buscar mails inválidos
            </span>
       
            <a target="_blank" className="cursor-pointer mr-2 tdec-none relative" onClick={enviarMail}>
                <FontAwesomeIcon title="Enviar un mail solo a los alumnos seleccionados con un filtro"  className="" icon={faUserCheck}/> Mail a los seleccionados
            </a>    

            <span title="Copiar e-mail de los alumnos seleccionados" onClick={copiarMails}
                        className="cursor-pointer a-l-c mr-4" >
                            <FontAwesomeIcon className="" icon={faAt}/> Copiar e-mails
            </span>         
    </div>
}


const BotonInscripcion = ({irAinscripciones, alumno}) => (
    <button
      type='button'
      className="boton-inscripciones"
      onClick={() => {irAinscripciones(alumno) }}>
          <FontAwesomeIcon className="ic-abm" icon={faUsers}/>
      <span className="texto-acciones-menu bu-accion-abm ml-2">Ir a inscripciones</span> 
    </button>
)


function crearMailToIndividual(email){
    return email!=null && email!='' ? `mailto: ${email}` : ``
}

function armarListaEmailsSync(lista){
// tomo y valido por separado el email y el email alternativo (email1 y email2)
// Para enviar el mail individualmente se toma otro email que del stored procedure vienen ambos ya separados por comas en uno solo
// El stored procedure spListarAlumnosActivosPlus_new envia 3 campos de mails (mail, mail1 y mail2)
// mail es el que se usaba originalmente en donde se combina el mail y el email_secundario si existen separados por comas y en la vista lo uso para enviar un mail individualmente
// mail1 y mail2 corresponden al mail principal y al secundario pero lo recibo por separado para poder darle un tratamiento más cómodo para validar y armar la lista de emails masivos

    const emails1 = lista.filter(item=>item.email1.trim()!=''  && item.email1!=0 && item.seleccion && validarEmail(item.email1.trim())).map(item=>item.email1.trim())
    const emails2 = lista.filter(item=>item.email2.trim()!=''  && item.email2!=0 && item.seleccion && validarEmail(item.email2.trim())).map(item=>item.email2.trim())

    const emails_no_validos1 = lista.filter(item=>item.email1.trim()!='' && item.email1!=0 && item.seleccion && !validarEmail(item.email1.trim()))
    const emails_no_validos2 = lista.filter(item=>item.email2.trim()!='' && item.email2!=0 && item.seleccion && !validarEmail(item.email2.trim()))

    return {emails:[...emails1,...emails2],errores:[...emails_no_validos1,...emails_no_validos2]}
}

/*function armarListaEmails(lista,funcionSetEmails){

    const emails = lista.filter(item=>item.email.trim()!='' && item.seleccion).map(item=>{
    return item.email.trim()
    })

 
    const emails_validos = emails.filter(item=>validarEmail(item))

    funcionSetEmails(emails_validos)
}*/

function validarEmail(email){
       // const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
       //http://www.regular-expressions.info/email.html
        const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
       // const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        
        return re.test(String(email).toLowerCase().trim());
}

function validarEmailPatron2(email){
 
     const re = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
     
     return re.test(String(email).toLowerCase().trim());
}

function definirValoresPaginacion(vector,setinicial,setfinal,anchoPaginacion){

    const longitud = vector.length;

    if (longitud>anchoPaginacion){
        setinicial(0);
        setfinal(anchoPaginacion-1)
    }else{
        setinicial(0);
        setfinal(longitud-1)
    }

}

function Paginacion({longitud,iIni,iFin,paginar,anchoPaginacion}){

    let imas, fmas,imenos, fmenos;

    let mostrar=true;
    let mostrarMenos = true;
    let mostrarMas = true;

    const hayMasParaMostrar = (longitud - 1) - iFin;
    const hayMenosParaMostrar = iIni;

    if (longitud<anchoPaginacion){
        mostrar=false
    }{
       if (hayMasParaMostrar==0){
            mostrarMas=false
       } 
       else if (hayMasParaMostrar<=anchoPaginacion){
            fmas = iFin + hayMasParaMostrar;
            imas = iFin + 1;
       }else if (hayMasParaMostrar>anchoPaginacion){
            fmas = iFin + anchoPaginacion;
            imas = iFin + 1;
       }

        if (hayMenosParaMostrar==0){
                mostrarMenos=false
        } 
        else if (hayMenosParaMostrar<=anchoPaginacion){
                fmenos = iIni - 1;
                imenos = 0;
        }else if (hayMenosParaMostrar>anchoPaginacion){
                fmenos = iIni - 1;
                imenos = iIni - anchoPaginacion;
        }
    }

    return <div>
        {mostrar && mostrarMenos && 
            <span   title={`${imenos+1}-${fmenos+1}`} 
                    className="cursor-pointer ml-2 mr-2" 
                    onClick={()=>paginar(imenos,fmenos)}>
                        <FontAwesomeIcon icon={faAngleLeft}/>
            </span>}
        <span>{iIni+1} - {iFin+1}</span>
        {mostrar && mostrarMas && 
            <span title={`${imas+1}-${fmas+1}`} 
                    className="cursor-pointer ml-2" 
                    onClick={()=>paginar(imas,fmas)}>
                           <FontAwesomeIcon icon={faAngleRight}/>
            </span>}
</div>
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

    resultado.errores.forEach(item=>{items = items + `<b>${item.alumno}</b>   <p>${item.email}</p>`})

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

function mensajeCopiaEmails(resultado){

    let items = '';
    const cantMailsOk = resultado.emails.length;

    resultado.errores.forEach(item=>{items = items + `<b>${item.alumno}</b>   <p>${item.email}</p>`})

    let texto_aclaratorio = cantMailsOk > 1 ? `${cantMailsOk} mails seleccionados` : cantMailsOk == 1 ? '1 mail seleccionado ' : 'No hay mails seleccionados';
    let texto_aclaratorio_2 = resultado.errores.length > 0 ? `Se excluyeron los siguientes e-mails inválidos:` : '';

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