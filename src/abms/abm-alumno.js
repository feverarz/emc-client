import React from 'react';
import {useState, useEffect,useRef} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import HistorialAlumno from '../componentes/HistorialAlumno';
import ImpresionesAlumno from '../componentes/Impresiones-alumno';
import {hacerfocoEnPrimerInput,seleccionarTextoInput,scrollTop} from '../Helpers/utilidades-globales';
import GestionEgresos from '../componentes/GestionEgresos'
import useModal from '../hooks/useModal';
import Curso from '../Vistas/Curso';
import Modal from '../componentes/Modal';
import {useAlumno} from '../Context/alumnoContext';
import { faSearch,faUndo } from '@fortawesome/free-solid-svg-icons';
import ActualizarCalificaciones from '../componentes/ActualizarCalificaciones';
import AbmBecas from '../abms/abm-becas'
import AbmInstrumentosAlumno from './Abm-instrumentos-alumno';
import RenderNota from '../componentes/RenderNota';

export default function AbmAlumno({id_alumno,finalizarAltaOcopia,esModal,id_copia,usuariom,finalizarAltaPorError,usuarioPuedeActualizarNiveles,grabarSoloDatos}){

    const {refrescarAlumno,usuario} = useAlumno() // deber ir antes de esProfesor porque usa el objeto usuario
    const esProfesor = usuario.id_permiso != 3 // deber ir al principio porque hay decisiones que se toman en función de esta variable

    console.log('renderiza abm alumno')
    const provinciaDefault = [{id_provincia:-1, nombre:"Seleccionar país"}]

    // estados flags 
    const [cargandoDatosTablasGenerales,setCargandoTablasGenerales] = useState(false);
    const [cargandoProvincias,setCargandoProvincias] = useState(false);
    const [cargandoDatosAlumno,setCargandoDatosAlumno] = useState(false);
    const [grabandoDatosAlumno,setGrabandoDatosAlumno] = useState(false);
    const [tablasCargadas,setTablasCargadas]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [cargandoMateriasInstrumentos,setCargandoMateriasInstrumentos]=useState(false);
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

    const [paises,setPaises] = useState([]);
    const [nacionalidades,setNacionalidades] = useState([]);
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
    const {toggle, isShowing } = useModal();
    const [idCursoSeleccionado,setIdCursoSeleccionado] = useState(null)
    const [cursosBorrados,setCursosBorrados]=useState([])
    const [mostrarCursadasBorradas,setMostrarCursadasBorradas]=useState(false)
    const [agregarBeca,setAgregarBeca]=useState(false)
    const [conciertos,setConciertos] = useState({concierto1:false,concierto1:false})
    const [carreras,setCarreras] = useState([])
    const [carrerasAlumno,setCarrerasAlumno] = useState([])
    const [cobranzasAlumno,setCobranzasAlumno] = useState([])
    const [becas,setBecas] = useState([])
    const [becasAlumno,setBecasAlumno] = useState([])
    const [historialAmpliado,setHistorialAmpliado]=useState(false)
    const [esconderMain,setEsconderMain] = useState(esProfesor ? true : false)
    // estado objeto de inicialización que inicializa los valores del abm 
    // en el alta o es cargado con los valores de la base de datos en una modificación
    // este objeto se pasa al formulario Formik para que el estado del formulario se inicialice
    // con este objeto. Luego el resto del trabajo se hace sobre el estado del formulario  
    const [objetoInicializacion,setObjetoInicializacion]=useState({
        id_alumno:-1,
        nacionalidad:'Argentina',
        pais:1,
        provincia:1,
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
        domicilio2:'',
        email:'',
        email_secundario:'',
        telefono:'',
        telef_laboral:'',
        telef_alternativo:'',
        celular:'',
        obs_finanzas:'',
        habilitado_web:true
    })

    const refcurso = useRef(null)
    const idRefrescar = useRef(0)
    const deshabilitar = !esProfesor ? true : false;

    useEffect(()=>{
        if (usuario.id_permiso!=3){
            setTimeout(() => {
                const objetosDeEdicion = document.querySelectorAll('.edit')
                const objetosInput = document.querySelectorAll('form#ref-ficha input')

                // uso de querySelectorAll
                // --  selecciona todos los elementos select
                //const objetosSelect = document.querySelectorAll('select')
                // --  selecciona todos los elementos select que no tengan un data-select="0"
                //const objetosSelect = document.querySelectorAll('select:not([data-select="0"])')
                // --  selecciona todos los elementos select que no tengan la clase prot
                //const objetosSelect = document.querySelectorAll('select:not(.prot)')

                const objetosSelect = document.querySelectorAll('select:not([data-select="0"])')
                // Indico que no tengan el atributo data-select=0 para proteger los selects del abm-instrumentos-alumnos para evitar que se desahibiliten
                
                objetosDeEdicion.forEach(item=>{
                    item.style.display='none';
                })
                objetosInput.forEach(item=>{
                    item.disabled=true
                })
                objetosSelect.forEach(item=>{
                    item.disabled=true
                })

                setEsconderMain(false)
            }, 2000)
    }else{
        setEsconderMain(false)
    }
    },[cargandoDatosAlumno])

    useEffect(()=>{

        const cargarTablasGenerales = async ()=>{

            setCargandoTablasGenerales(true);
        
            try{
                const vectorResultado = await Promise.all([
                    Axios.get('/api/tablasgenerales/materias'),
                    Axios.get('/api/tablasgenerales/paises'),
                    Axios.get('/api/tablasgenerales/provincias/all'),
                    Axios.get('/api/tablasgenerales/nacionalidades'),
                    Axios.get('/api/tablasgenerales/instrumentos'),
                    Axios.get('/api/tablasgenerales/nivelesi'),
                    Axios.get('/api/tablasgenerales/nivelese'),
                    Axios.get('/api/tablasgenerales/carreras')
                ])
               
                setMaterias(vectorResultado[0].data);
                setPaises(vectorResultado[1].data);
                setVectorProvincias(vectorResultado[2].data);
                setNacionalidades(vectorResultado[3].data);
                setInstrumentos(vectorResultado[4].data);
                setNivelesI(vectorResultado[5].data);
                setNivelesE(vectorResultado[6].data);
                setCarreras(vectorResultado[7].data);

                cargarVectorDias(setVectorDias);
                cargarVectorMeses(setVectorMeses);
                cargarVectorAnios(setVectorAnios);
              
                setCargandoTablasGenerales(false); 
                setTablasCargadas(true)

                
                localStorage.setItem('materias',JSON.stringify(vectorResultado[0].data));
                localStorage.setItem('paises',JSON.stringify(vectorResultado[1].data));
                localStorage.setItem('provincias',JSON.stringify(vectorResultado[2].data));
                localStorage.setItem('nacionalidades',JSON.stringify(vectorResultado[3].data));
                localStorage.setItem('instrumentos',JSON.stringify(vectorResultado[4].data));
                localStorage.setItem('nivelesi',JSON.stringify(vectorResultado[5].data));
                localStorage.setItem('nivelese',JSON.stringify(vectorResultado[6].data));
                localStorage.setItem('carreras',JSON.stringify(vectorResultado[7].data));

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

            
            if (!tablasGeneralesLocalStorage(setMaterias,setPaises,setVectorProvincias,setNacionalidades,setInstrumentos,setNivelesI,setNivelesE,setCarreras)){
                cargarTablasGenerales() // si no están almacenadas en el local storage traerlas de la bd y almacenarlas localmente
            }else{ // si existen en el local storage se han cargado en la función tablasGeneralesLocalStorage  solo generar los vectores de dias, meses y años
                cargarVectorDias(setVectorDias);
                cargarVectorMeses(setVectorMeses);
                cargarVectorAnios(setVectorAnios);
                setTablasCargadas(true)
            }

     },[id_alumno])

useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        if (idCursoSeleccionado){
            setIdCursoSeleccionado(null)
            idRefrescar.current = Math.floor(Math.random() * 100)
        }
        if (mostrarCursadasBorradas){
            setMostrarCursadasBorradas(false)
        }
        if(agregarBeca){
            setAgregarBeca(false)
        }
    }
},[isShowing])

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
                    id_alumno:id_alumno,
                    nacionalidad:datosDelRecordset.nacionalidad,
                    pais:datosDelRecordset.id_pais,
                    provincia:datosDelRecordset.id_provincia,
                    nombre:datosDelRecordset.nombre,
                    apellido:datosDelRecordset.apellido,
                    documento:noNull(datosDelRecordset.documento),
                    fecha:datosDelRecordset.fecha_nac,
                    anio:datosDelRecordset.fecha_nac.slice(0,4),
                    dia:datosDelRecordset.fecha_nac.slice(8,10),
                    mes:Number(datosDelRecordset.fecha_nac.slice(5,7)),
                    sexo:datosDelRecordset.sexo,
                    domicilio:noNull(datosDelRecordset.domicilio),
                    localidad:noNull(datosDelRecordset.localidad),
                    codpostal:noNull(datosDelRecordset.codPostal),
                    domicilio2:noNull(datosDelRecordset.domicilio_2),
                    email:noNull(datosDelRecordset.email),
                    email_secundario:noNull(datosDelRecordset.Email_Secundario),
                    telefono:noNull(datosDelRecordset.telefono),
                    telef_laboral:noNull(datosDelRecordset.Telef_Laboral),
                    telef_alternativo:noNull(datosDelRecordset.Telef_Alternativo),
                    celular:noNull(datosDelRecordset.Celular),
                    obs_finanzas:noNull(datosDelRecordset.obs_finanzas),
                    habilitado_web: datosDelRecordset.habilitado_web ? datosDelRecordset.habilitado_web : false // es un campo nuevo en la tabla, si es NULL lo tomamos como no activo para que entren y lo activen
                }
                  
                console.log('loc',datosDelRecordset)
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                setObjetoInicializacion({...objetoInicializacion,...datosAlumno}) 

                setDatosParaImpresiones(datosDelRecordset)

                setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
                setCargandoDatosAlumno(false)

                return(datosDelRecordset)
            }catch(err){

                console.log(err)
                const mensaje_html = `${err}`
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
            
            setTituloAbm('');
            setTituloCerrar('Cerrar la ficha del alumno');
            completarDatosDelAlumno(id_alumno)
            .then(datos=>{
                setProvincias(vectorProvincias.filter(item=>item.id_pais==datos.id_pais))
            }) 
            
        }
        else if (id_copia){
            setTituloAbm(`Copiar el alumno #${id_copia}`);
            setTituloCerrar('Cerrar la ficha del alumno');
            completarDatosDelAlumno(id_copia); 
        }
        else{ //  si no recibió el nùmero de curso por propiedad, es decir un alta
            setTituloAbm(`Crear un nuevo alumno`);
            setTituloCerrar('Cancelar');
            hacerScroll("nuevo-alumno");
            cargarProvinciasArgentina();
            
            let anioNacimientoDefaultAlta=anioNacimientoAlta();

            setObjetoInicializacion({...objetoInicializacion,anio:anioNacimientoDefaultAlta}) 

            hacerfocoEnPrimerInput('abm-nombre')

        }
    }

},[tablasCargadas,id_alumno,contadorModificaciones])     
  
useEffect(()=>{
    
   if (id_alumno){
    buscarMateriasAprobadasEinstrumentosAlumno()
    // quito hacer scroll porque es molesto el movimiento e innecesario
    //.then(()=> hacerScroll('ref-ficha'))
   } 


},[contadorOperaciones])


useEffect(()=>{ // hago esto para evitar el warning de can't perform... creo un effect para el mismo evento para que se ejecuten llamadas asincrónicas en distintos threads
                // podría haberlo agregado el effect que también se dispara con el mismo cambio contadorOperaciones pero para que sea más claro lo hice en dos efectos distintos pero disparados por el mismo cambio
    let mounted = true;

    if (mounted && id_alumno){ // buscar el historial solo si esta montado y si hay un id_alumno, si es un alta no buscar todavía el historial
        setBuscarHistorial(true)
    }
    
    return ()=> mounted = false
 },[contadorOperaciones]) 

const handleNivelIChange=(e,instrumento)=>{

    const nuevo_id_nivel_instrumental = e.target.value; // en e.target.value traigo el nuevo id nivel instrumental

    const copia = [...instrumentosAlumno] //en copia replico el actual estado del vector de instrumentos del alumno
    
    const datosNuevoInstrumental= nivelesI // en datosNuevoEnsamble traigo los datos del nuevo id instrumental que interesa especialmente el nombre para actualizar luego el vector de instrumentos del alumno
                    .filter(item=>item.id_nivel_instrumental==nuevo_id_nivel_instrumental)[0];

    const copiaActualizada = copia // en copiaActualizada recorro copia y al detectar el id de instrumento a modificar recupero el objeto de esa posición y modifico el id instrumental y el nombre del nuevo id instrumental
            .map(item=>
                item.id_instrumento==instrumento ? 
                {...item,id_nivel_instrumental:nuevo_id_nivel_instrumental,nivel_i:datosNuevoInstrumental.nombre} 
                : item)
    // actualizo el estado
    setInstrumentosAlumno(copiaActualizada) 
    
    setHuboCambiosInstrumentos(true)
}

const handleNivelEChange=(e,instrumento)=>{

    const nuevo_id_nivel_ensamble = e.target.value; // en e.target.value traigo el nuevo id nivel ensamble

    const copia = [...instrumentosAlumno] //en copia replico el actual estado del vector de instrumentos del alumno
    
    const datosNuevoEnsamble = nivelesE // en datosNuevoEnsamble traigo los datos del nuevo id ensamble que interesa especialmente el nombre para actualizar luego el vector de instrumentos del alumno
                    .filter(item=>item.id_nivel_ensamble==nuevo_id_nivel_ensamble)[0];

    const copiaActualizada = copia // en copiaActualizada recorro copia y al detectar el id de instrumento a modificar recupero el objeto de esa posición y modifico el id ensamble y el nombre del nuevo id ensamble
            .map(item=>
                item.id_instrumento==instrumento ? 
                {...item,id_nivel_ensamble:nuevo_id_nivel_ensamble,nivel_e:datosNuevoEnsamble.nombre} 
                : item)
    // actualizo el estado
    setInstrumentosAlumno(copiaActualizada)

    setHuboCambiosInstrumentos(true)
}

const iniciarVisualizarCurso = (curso)=>{
    setIdCursoSeleccionado(curso.nro_curso)
    refcurso.current = curso
    toggle()
 }

const restaurarMaterias=()=>{
    setMateriasTestAlumno(backupMateriasTestAlumno)
    setHuboCambiosMaterias(false)
}

const restaurarInstrumentos=()=>{
    setInstrumentosAlumno(backupInstrumentosAlumno)
    setHuboCambiosInstrumentos(false)
}

const handleChangeCarreras = (e)=>{
    const carreraAlumno = carrerasAlumno.some(item=>item.id_carrera==e.target.value)
    
    let copia;

    if(carreraAlumno){
        copia = carrerasAlumno.filter(item=>item.id_carrera!=e.target.value)
    }else{
        copia = [...carrerasAlumno,{id_carrera:e.target.value}]
    }

    setCarrerasAlumno(copia)
}

const buscarMateriasAprobadasEinstrumentosAlumno = async ()=>{

    try{
        setCargandoMateriasInstrumentos(true)
        const vectorResultado = await Promise.all([Axios.get(`/api/alumnos/materiastest/${id_alumno}`),
                                                Axios.get(`/api/alumnos/instrumentos/${id_alumno}`),
                                                Axios.get(`/api/alumnos/historial/${id_alumno}/1/1`),
                                                Axios.get(`/api/alumnos/cursosborrados/${id_alumno}`),
                                                Axios.get(`/api/alumnos/conciertosfinales/${id_alumno}`),
                                                Axios.get(`/api/alumnos/carreras/${id_alumno}`),
                                                Axios.get(`/api/tablasgenerales/cobranzas/alumno/${id_alumno}/1`),
                                                Axios.get(`/api/tablasgenerales/becas/alumno/${id_alumno}`),
                                                Axios.get(`/api/tablasgenerales/becas`)])
    

        if (vectorResultado[1].data.some(item=>item.id_instrumento>0))
        {
            setInstrumentosAlumno(vectorResultado[1].data)
            setBackupInstrumentosAlumno(vectorResultado[1].data)
        }            

        setMateriasTestAlumno(vectorResultado[0].data)
        setBackupMateriasTestAlumno(vectorResultado[0].data)

        setHistorial(vectorResultado[2].data)
        setCursosBorrados(vectorResultado[3].data)
        setConciertos({concierto1:vectorResultado[4].data.concierto_final_1,concierto2:vectorResultado[4].data.concierto_final_2})
        setCarrerasAlumno(vectorResultado[5].data)

        setCargandoMateriasInstrumentos(false)
        setHuboCambiosInstrumentos(false)
        setHuboCambiosMaterias(false)

        setCobranzasAlumno(vectorResultado[6].data)
        setBecasAlumno(vectorResultado[7].data)
        setBecas(vectorResultado[8].data)

        return(true)

    }catch(err){
        console.log(err)
        const mensaje_html = 'ddd'
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setCargandoMateriasInstrumentos(false)
        setHuboError(true)
    }
}

const iniciarEliminarAlumno = (curso,id_alumno)=>{
   
    Swal.fire({
        text:`¿Confirma la baja del curso ${curso.mensaje} ${curso.DiaHora}?`,
        showCancelButton:true,
        confirButtonText:'Si, eliminar',
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                eliminarAlumno(curso.nro_curso,id_alumno);

            }else{
                console.log("Se canceló la eliminación de la inscripción")
            }
        }
    )
}

const iniciarRecuperarCurso = (curso)=>{
   
    if (curso.alerta==0){
        alert('No se puede reinscribir a un curso de un cuatrimestre inactivo')
        return
    }

    Swal.fire({
        text:`¿Confirma la reinscripción a ${curso.descripcion}?`,
        showCancelButton:true,
        confirButtonText:'Si, reinscribir',
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                recuperarCursada(curso.nro_curso,id_alumno);

            }else{
                console.log("Se canceló la reinscripción")
            }
        }
    )
}

const recuperarCursada = async (nro_curso,id_alumno)=>{

    const _urlRecuperar = `/api/alumnos/recuperarcursoborrado/${Number(id_alumno)}/${Number(nro_curso)}`

    try{
        const resultadoDelCambio = await Axios.put(_urlRecuperar)

        setContadorModificaciones(contadorModificaciones+1)
        refrescarAlumno() // para que si hay un alumno seleccionado en el bottom vuelva a buscar las cursadas del mismo
        const mensaje_html = `<p>Se reinscribió al alumno con éxito</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            timer:1500,
            confirmButtonColor: '#3085d6',
          })


    }catch(err){
        const mensaje_html = `<p>La reinscripción al curso falló</p><p>${JSON.stringify(err.response.data.message)}</p>`

        Swal.fire({
            html:mensaje_html,
            text: err.response.data,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

        }
}

const eliminarAlumno = async (nro_curso,id_alumno)=>{

      const _urlEliminar = `/api/cursos/alumno/${Number(nro_curso)}/${Number(id_alumno)}`
  
      try{
          const resultadoDelCambio = await Axios.delete(_urlEliminar)
  
          setContadorModificaciones(contadorModificaciones+1)
          refrescarAlumno() // para que si hay un alumno seleccionado en el bottom vuelva a buscar las cursadas del mismo
          const mensaje_html = `<p>Se eliminó al alumno del curso</p>`
  
          Swal.fire({
              html:mensaje_html,
              icon: 'warning',
              timer:1500,
              confirmButtonColor: '#3085d6',
            })
  
 
      }catch(err){
          const mensaje_html = `<p>La eliminación del curso falló</p><p>${err.response.data}</p>`
  
          Swal.fire({
              html:mensaje_html,
              text: err.response.data,
              icon: 'warning',
              confirmButtonColor: '#3085d6',
            })
  
          }
  }

const grabarAlumno = async (values)=>{



    if (agregarInstrumento || agregarMateria){

        let mensaje_validacion = `${agregarMateria ? '<p>Falta confirmar una materia. Agregue o cancele la materia seleccionada</p>' : '<p>Falta confirmar un instrumento.Agregue o cancele el instrumento seleccionado</p>'}`

        Swal.fire({
            html:mensaje_validacion,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        }) 

        return
    }

   

    let resultado;
    let id_alumno_interno;
    let nombre_interno = `${values.apellido}, ${values.nombre}`
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const objetoAgrabar = { datosgenerales: {
                nombre: values.nombre,
                apellido: values.apellido,
                nacionalidad:values.nacionalidad,
                provincia:Number(values.provincia),
                pais:Number(values.pais),
                anio:Number(values.anio),
                mes:Number(values.mes),
                dia:Number(values.dia),
                domicilio:values.domicilio,
                domicilio2:values.domicilio2,
                localidad:values.localidad,
                codpostal:values.codpostal,
                sexo:values.sexo,
                documento:values.documento,
                telefono:values.telefono,
                telef_laboral:values.telef_laboral,
                telef_alternativo:values.telef_alternativo,
                celular:values.celular,
                email:values.email,
                email_secundario:values.email_secundario,
                obs_finanzas:values.obs_finanzas,
                habilitado_web:values.habilitado_web
            },
            materias: materiasTestAlumno,
            instrumentos:instrumentosAlumno
        }

    setGrabandoDatosAlumno(true)

    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`
    const esAlta = id_alumno ? false : true;

    try{
        if (!esAlta){
            resultado= await Axios.put(`/api/alumnos/${id_alumno}`,objetoAgrabar)
            id_alumno_interno = id_alumno; // es el id del alumno a modificar
        }else{
            resultado= await Axios.post(`/api/alumnos`,objetoAgrabar)
            id_alumno_interno = resultado.data.id_alumno; // es el id del nuevo alumno 
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nuevo alumno #${resultado.data.id_alumno})</p>`
        }

        if(!grabarSoloDatos){ // viene de listado de emails validados solamente
            grabarOtrosConceptos(id_alumno_interno,nombre_interno,esAlta); // le paso el id interno y el nombre para que en alta se pueda seleccionar al alumno en el context y asì se pueda ir directo a inscripciones
        }else{
            finalizarAltaOcopia()
        }
        
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
        setGrabandoDatosAlumno(false)
    }catch(err){
        console.log(err.response)
        const mensaje_html = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data.message}</p>`


        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatosAlumno(false)
    }
   

}



const cambiarAmpliado = (ampliado)=>{
    setHistorialAmpliado(ampliado)
}

const finalizarAltaBeca = ()=>{
    setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
    toggle()
}

const vincularInstrumentosAlAlumno = async (id_alumno_interno,nombre)=>{ // recibo en id_interno el id del alumno sea el nuevo recién creado o el id del alumno que estamos moficando
    try{


        const resultado = await Axios.post(`/api/alumnos/vincularInstrumentos/${id_alumno_interno}`)

        // Evito mostrar la confirmación de instrumentos y materias
        // En principio solo confirmo 1 sola vez por todo. Si llegase a fallar aqui
        // se va a mostrar el mensaje de error en el catch.
        /*Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   */ 
        if (esModal){
            if(id_alumno){
                setContadorModificaciones(contadorModificaciones+1)
                finalizarAltaOcopia(false)
            }else{
                finalizarAltaOcopia(true,id_alumno_interno,nombre)
            }

        }else{
            finalizarAltaOcopia(true); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso
        }

    }catch(err){
        let mensaje_html_error;

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response}</p>`
        }


        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    }
} 

const grabarOtrosConceptos = async (id_alumno_interno, nombre,esAlta)=>{ // recibo en id_interno el id del alumno sea el nuevo recién creado o el id del alumno que estamos moficando
    try{
        let mensaje_html = `<p>Los instrumentos y materias se grabaron exitosamente</p>`

        const objetoAgrabar={instrumentos:instrumentosAlumno,
                              materias:materiasTestAlumno}

        const objetoCarrerasAgrabar={carreras:carrerasAlumno}

        const concierto1 = conciertos.concierto1 ? 1 : 0;
        const concierto2 = conciertos.concierto2 ? 1 : 0;
         
        const resultado1 = await Axios.post(`/api/alumnos/instrumentosmaterias/${id_alumno_interno}`,objetoAgrabar)
        const resultado2 = await Axios.put(`/api/alumnos/vincularinstrumentos/${id_alumno_interno}`)
        const resultado3 = await Axios.put(`/api/alumnos/conciertosfinales/${id_alumno_interno}/${concierto1}/${concierto2}`)
        const resultado4 = await Axios.post(`/api/alumnos/carreras/${id_alumno_interno}`,objetoCarrerasAgrabar)

        if (esModal){
            if(id_alumno){
                setContadorModificaciones(contadorModificaciones+1)
                finalizarAltaOcopia(false)
            }else{
                finalizarAltaOcopia(true,id_alumno_interno,nombre)
            }

        }else{
            finalizarAltaOcopia(true); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso
        }

    }catch(err){
        let mensaje_html_error;

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response}</p>`
        }


        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        }).then(()=>{

            // agrego el cierre del modal si hubo un error solo en el caso de un alta de un alumno por el hecho de que si no se cierra
            // el usuario puede hacer click en el botón grabar N veces y dar de alta muchos alumnos
            // si es una modificación muestro el mensaje de error pero no hace falta cerrarlo
            if (esModal){
                if(esAlta){
                    setContadorModificaciones(contadorModificaciones+1)
                    finalizarAltaPorError()
                }
    
            }else{
                finalizarAltaPorError(); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso
            }
        })   
    }
} 

const handleMateriaSeleccionada=(e)=>{
    setMateriaSeleccionada(e.target.value)
}

const handleInstrumentoSeleccionado=(e)=>{
    setInstrumentoSeleccionado(e.target.value)
}

const handleInstPrincipalChange=(e)=>{
    const copia = instrumentosAlumno.map(item=>{if(item.id_instrumento==e.target.value){
        return {...item,inst_principal:true}
    }else{
        return {...item,inst_principal:false}
    }})

    setInstrumentosAlumno(copia)
    setHuboCambiosInstrumentos(true)
}

const modificarMateriasAprobadas =(e)=>{

    const yaExiste = materiasTestAlumno.findIndex(item=>item.id_materia==materiaSeleccionada)

    if (yaExiste!=-1){
        setErrorMateria('La materia ya figura como aprobada')
        return
    }else{
        setErrorMateria(null)
    }
     // para que cierre el select de materias
    setAgregarMateria(false);

    // para encontrar la materia seleccionada en el vector de materias
    const nuevaMateria = materias.filter(item=>item.id_materia==materiaSeleccionada)

    // para agregar la materia nueva con la función del use state
    setMateriasTestAlumno([...materiasTestAlumno,...nuevaMateria])

    // para hacer que lista de materias vuelva al valor "seleccionar"
    setMateriaSeleccionada(-1)

    setHuboCambiosMaterias(true)
}

const modificarInstrumentosYniveles =()=>{

    const yaExiste = instrumentosAlumno.findIndex(item=>item.id_instrumento==instrumentoSeleccionado)

    if (yaExiste!=-1){
        setErrorInstrumento('El instrumento ya figura en la lista del alumno')
        return
    }else{
        setErrorInstrumento(null)
    }
     // para que cierre el select de instrumentos
     setAgregarInstrumento(false);

    // para encontrar el instrumento seleccionado en el vector de instrumentos
    const nuevoInstrumento = instrumentos.filter(item=>item.id_instrumento==instrumentoSeleccionado)

    // si se agrega un instrumento nuevo y es el único entonces es por default el instrumento principal
    // si ya había instrumentos por default entonces por default el nuevo intrumento no es el principal 
    const status_principal = instrumentosAlumno.length==0 ? true : false;

    const objetoAagregar = {instrumentos:nuevoInstrumento[0].nombre,
                            id_instrumento:instrumentoSeleccionado,
                            id_nivel_ensamble:0,
                            id_nivel_instrumental:0,
                            nivel_e:'..',
                            nivel_i:'..',
                            inst_principal:status_principal}
    // para agregar el instrumento nuevo con la función del use state
    setInstrumentosAlumno([...instrumentosAlumno, objetoAagregar])

    // para hacer que lista de instrumentos vuelva al valor "seleccionar"
    setInstrumentoSeleccionado(-1)

    setHuboCambiosInstrumentos(true)
}

const excluirMateria = (id)=>{

    const nuevaLista = materiasTestAlumno.filter(item=>item.id_materia!=id)
    setHuboCambiosMaterias(true)
    setMateriasTestAlumno([...nuevaLista])
}

const excluirInstrumento = (id)=>{
    const nuevaLista = instrumentosAlumno.filter(item=>item.id_instrumento!=id)
    //analizo si al borrar queda solo 1 instrumeto entonces lo asigno como el principal
    if (nuevaLista.length==1){
        nuevaLista[0] = {...nuevaLista[0],inst_principal:true}
    }else if (nuevaLista.length>1){
        // también analizo si se borró el principal y hay más instrumentos asigno al primero como principal
        const hayInstPrincipal = nuevaLista.some(item=>item.inst_principal==true)
        if(!hayInstPrincipal){
            nuevaLista[0] = {...nuevaLista[0],inst_principal:true}
        }
    }

    setHuboCambiosInstrumentos(true)
    setInstrumentosAlumno([...nuevaLista])
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

            }else{
                console.log("Se canceló la modificación o creación del alumno")
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

nombre:Yup.string().max(25,'El nombre debe tener como máximo 25 caracteres')
        .required('Falta completar el nombre'),
apellido:Yup.string().max(25,'El apellido debe tener como máximo 25 caracteres')
        .required('Falta completar el apellido'),
documento:Yup.string().typeError('El documento debe ser un número')
    .max(15,'El documento debe tener como máximo 15 carácteres')
    .required('Falta completar el documento'),    
sexo:Yup.string().max(1)
    .required('Falta completar el sexo')
    .test("sexo","El sexo debe ser M o F",value => value === 'M' || value === 'F'),
nacionalidad:Yup.string()
        .required('Falta seleccionar la nacionalidad'),
dia:Yup.number()
    .required('Falta seleccionar el día de nacimiento'),
mes:Yup.number()
    .required('Falta seleccionar el mes de nacimiento'),
anio:Yup.number()
    .min(1940,'El año no es válido')
    .required('Falta seleccionar el año de nacimiento'),        
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
localidad:Yup.string().max(25,'La localidad debe tener como máximo 25 caracteres')
    .required('Falta completar la localidad'),    
codpostal:Yup.string().max(10,'El código postal debe tener como máximo 10 caracteres'),            
domicilio2:Yup.string().max(50,'El domicilio 2 debe tener como máximo 50 caracteres').nullable(),
email:Yup.string().email('El email no es válido').max(200,'El email debe tener como máximo 200 caracteres')
    .required('Falta completar el e-mail'),            
email_secundario:Yup.string().email('El email no es válido').max(200,'El email 2 debe tener como máximo 200 caracteres'),
telefono:Yup.string().max(100,'El teléfono debe tener como máximo 100 caracteres')
.test('celular','Debe completar un teléfono o celular.',function(val){
    const {celular} = this.parent;
  
    if (!celular && !val){
        return false
    } else{
        return true
    }
}),
celular:Yup.string().max(100,'El celular debe tener como máximo 100 caracteres')
.test('celular','Debe completar un teléfono o celular.',function(val){
    const {telefono} = this.parent;
    if (!telefono && !val){
        return false
    }  else{
        return true
    }
}),
telef_alternativo:Yup.string().max(100,'El teléfono alt. debe tener como máximo 100 caracteres'),
telef_laboral:Yup.string().max(100,'El teléfono lab. debe tener como máximo 100 caracteres'),
obs_finanzas:Yup.string().max(1000,'Las observaciones deben tener como máximo 1000 caracteres')
})                 

const onsubmitAlumno = values =>{
    console.log(values)
    iniciarGrabarAlumno(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatosTablasGenerales){
        return <Main center extraclases={ esProfesor ? "h-6" : null}><div><Loading/><span className="cargando">Cargando datos generales...</span></div></Main>
    };

    if (cargandoDatosAlumno){
        return <Main center extraclases={ esProfesor ? "h-6" : null}><div><Loading/><span className="cargando">Cargando datos personales del alumno...</span></div></Main>
    };

    if (cargandoMateriasInstrumentos){
        return <Main center extraclases={ esProfesor ? "h-6" : null}><div><Loading/><span className="cargando">Cargando instrumentos, niveles y materias...</span></div></Main>
    };

    if (esconderMain){
        return <Main center extraclases={ esProfesor ? "h-6" : null}><div><Loading/><span className="cargando">Ajustando permisos del usuario...</span></div></Main>
    };

    return (
        <Main extraclases= {esconderMain && esProfesor ? "hidden" :  null}> 

        {agregarMateria && false && <div className='cont-mat-test-select'>
        
        <button className='mr-auto ml-auto block' title="Cancelar" onClick={()=>{setAgregarMateria(false);setErrorMateria(null)}}>
            <FontAwesomeIcon className="ic-abm" icon={faWindowClose}/> <span className='texto-acciones-menu bu-accion-abm'>Cerrar selección de materias</span> 
        </button>
    
            <div>
                <Materias2 materias={materias} 
                        materiasTestAlumno = {materiasTestAlumno} 
                        setMateriasTestAlumno={setMateriasTestAlumno}
                        setHuboCambiosMaterias = {setHuboCambiosMaterias}/>
            </div>
           
        </div>}
        
        
        { isShowing && idCursoSeleccionado && id_alumno &&
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#000000bf'}}>
                    {usuario.id_permiso!=3 && <ActualizarCalificaciones visualizacion nro_curso={idCursoSeleccionado} id_alumno={id_alumno} curso={refcurso.current}/>}
                    {refcurso.current.cuatrimestre_activo == false && usuario.id_permiso==3 && <ActualizarCalificaciones nro_curso={idCursoSeleccionado} id_alumno={id_alumno} curso={refcurso.current}/>}
                    {refcurso.current.cuatrimestre_activo == true && usuario.id_permiso==3 && <ActualizarCalificaciones visualizacion nro_curso={idCursoSeleccionado} id_alumno={id_alumno} curso={refcurso.current}/>}
                </Modal>
         } 
        { isShowing && id_alumno && mostrarCursadasBorradas && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'800px'}} estiloWrapper={{background:'#000000bf'}} closeOnclickOutside={true}>
                    <CursadasEliminadas recuperarCurso = {iniciarRecuperarCurso} cursadas={cursosBorrados} cerrar={toggle}/>
                </Modal>
         }  
         { isShowing && id_alumno && agregarBeca && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'700px',background:'black'}} 
                    estiloWrapper={{background:'#000000bfxx',top:'25%'}} closeOnclickOutside={true}>
                    <AbmBecas id_alumno={id_alumno} finalizar={finalizarAltaBeca}/>
                </Modal>
         }            
        { grabandoDatosAlumno && <Main><div><Loading blanco={true}/><span className="cargando">Grabando datos...</span></div></Main>}
        { id_alumno && esModal && usuario.id_permiso==3 && !grabarSoloDatos && 
            <div className="absolute top-m-15">
                <ImpresionesAlumno datosDelAlumno={datosParaImpresiones} esModal={true} 
                                   mostrarLateralmente={false}
                                   alumno={{instrumentos:instrumentosAlumno,historial:historial,materiasAprobadasTest:materiasTestAlumno}}
                />
            </div>
        } 
  <div className={grabandoDatosAlumno ? "hidden" : ""}>
  <Cobranzas cobranzasAlumno={cobranzasAlumno}/>
  <Becas becasAlumno={becasAlumno} becas={becas}/>
  <div className='pt-4 rounded flex f-row container-mult-flex-center relative' >
             <div><div>
                <Formik validateOnMount 
                enableReinitialize initialValues={objetoInicializacion}
    validationSchema={validationSchemaAlumno} onSubmit={onsubmitAlumno}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty }) =>{ 
    return (
    <Form id="ref-ficha">
    <div className="AnaliticoContainer relative">
  {id_alumno && <div className="flex items-center">
      {!grabarSoloDatos && <GestionEgresos id_alumno={id_alumno} finalizarCambioStatus={finalizarAltaOcopia} conciertos={conciertos} setConciertos={setConciertos}/>}
      <div className="flex f-col ml-2">
                <div className="flex f-col mt-2 text-center items-center border-radius-7 border-solid-tomato p-2">
                    <label className="text-small mb-2" htmlFor="abm-habilitado_web">Habilitado p/ web</label>
                    <Field 
                        title="Habilitar o deshabilitar el acceso web"
                        id="abm-habilitado_web"
                        type="checkbox" 
                        disabled={usuario.id_prof==107 ? false : true}
                        name="habilitado_web" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="habilitado_web"/></div> 
            </div> 
  </div>}
    <div  className="titulo-cab-modal titulo-abm flex f-row">{tituloAbm}</div>
        <div className="FormAbmContainerLargo">
            <div className="flex f-col">
            {id_alumno && dirty && <span type="button" title="Deshacer los cambios y restaurar valores iniciales" 
                className="cursor-pointer absolute botonRestaurar boton-restaurar-abm-form" 
                onClick={() => resetForm(initialValues)}>Restaurar
                </span>
            }
            {id_alumno && <span className="text-small text-right">ID: {id_alumno}</span>}
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre">Nombre</label>
                    <Field 
                        id="abm-nombre"
                        onFocus={()=>seleccionarTextoInput("abm-nombre")} 
                        onClick={()=>seleccionarTextoInput("abm-nombre")}                         
                        type="text" 
                        autoComplete="off" 
                        maxLength="25"
                        name="nombre" 
                        className={values.nombre ? 'input-abm-nya' : 'input-vacio'}
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
                        onFocus={()=>seleccionarTextoInput("abm-alumno-apellido")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-apellido")}                         
                        maxLength="25"
                        autoComplete="off" 
                        name="apellido" 
                        className={values.apellido ? 'input-abm-nya' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="apellido"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-documento">Documento</label>
                    <Field 
                        id="abm-alumno-documento"
                        type="text" 
                        autoComplete="off" 
                        maxLength="15"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-documento")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-documento")}                          
                        name="documento" 
                        className={values.documento ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="documento"/></div> 
            </div>  
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-sexo">Sexo</label>
                    <select onChange={handleChange} value={values.sexo} name="sexo" className="w-selabm" id="abm-alumno-sexo">
                            <option  value="M">Hombre</option>
                            <option  value="F">Mujer</option>
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="sexo"/></div>                                     
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-nacionalidad">Nacionalidad</label>
                    <select onChange={handleChange} value={nacionalidades.some(item=>item.nombre==values.nacionalidad) ? values.nacionalidad : -1} name="nacionalidad" className="w-selabm" id="abm-alumno-nacionalidad">
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
            <label className="Form__labels" htmlFor="fecha">Fecha de nacimiento</label>
            <div className="flex f-col items-center">
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

            <div className="flex f-row mt-2 mb-2">
                <label className="Form__labels__abmcursos_corto">Edad</label>
                {id_alumno && <p className="text-small">{calcularEdad(values.anio,values.mes,values.dia)}</p>}
                {!id_alumno && dirty && <p className="text-small"> {calcularEdad(values.anio,values.mes,values.dia)}</p>}    
            </div>              
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-domicilio">Domicilio</label>
                    <Field 
                        id="abm-alumno-domicilio"
                        type="text" 
                        maxLength="50"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-domicilio")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-domicilio")}                          
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
                        maxLength="25"
                        name="localidad" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-localidad")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-localidad")}                           
                        className={values.localidad ? 'input-abm-nya' : 'input-vacio'}
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
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-domicilio2">Domicilio 2</label>
                    <Field 
                        id="abm-alumno-domicilio2"
                        type="text" 
                        autoComplete="off" 
                        maxLength="50"
                        name="domicilio2" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-domicilio2")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-domicilio2")}                            
                        className={values.domicilio2 ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="domicilio2"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telefono">Teléfono</label>
                    <Field 
                        id="abm-alumno-telefono"
                        type="text" 
                        autoComplete="off" 
                        maxLength="25"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-telefono")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-telefono")}                          
                        name="telefono" 
                        className={values.telefono ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="telefono"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-celular">Celular</label>
                    <Field 
                        id="abm-alumno-celular"
                        type="text" 
                        maxLength="25"
                        autoComplete="off" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-celular")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-celular")}                             
                        name="celular" 
                        className={values.celular ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="celular"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telef_alternativo">Teléfono alternativo</label>
                    <Field 
                        id="abm-alumno-telef_alternativo"
                        type="text" 
                        autoComplete="off" 
                        maxLength="25"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-telef_alternativo")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-telef_alternativo")}                         
                        className={values.telef_alternativo ? '' : 'input-vacio'}
                        name="telef_alternativo" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="telef_alternativo"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telef_laboral">Teléfono laboral</label>
                    <Field 
                        id="abm-alumno-telef_laboral"
                        type="text" 
                        autoComplete="off" 
                        maxLength="25"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-telef_laboral")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-telef_laboral")}                          
                        name="telef_laboral" 
                        className={values.telef_laboral ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="telef_laboral"/></div> 
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
                        onFocus={()=>seleccionarTextoInput("abm-alumno-email")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-email")}                           
                        value={values.email.toLowerCase()}
                        className={values.email ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="email"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email_secundario">E-mail 2</label>
                    <Field 
                        id="abm-alumno-email_secundario"
                        type="email" 
                        maxLength="200"
                        autoComplete="off" 
                        name="email_secundario" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-email_secundario")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-email_secundario")}                                   
                        value={values.email_secundario.toLowerCase()}
                        className={values.email_secundario ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="email_secundario"/></div> 
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
            <div className="flex f-col">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email_secundario">Observaciones financieras</label>
                    <Field
                        name="obs_finanzas"
                        component="textarea"
                        maxLength="1000"
                        rows="2"
                        disabled={usuario.id_prof==107 ? false : true}
                        className="input-vacio"
                    />
                <div className="error_formulario"><ErrorMessage name="obs_finanzas"/></div> 
            </div> 
            <button className="Form__submit edit" type="submit">Grabar</button>
        </div>
      
    </div>    
    </Form>) } }

    </Formik>
        </div>
    </div>

    <div className={grabarSoloDatos ? "flex f-col hidden" : "flex f-col"}>
        <Carreras carreras={carreras} usuario={usuario} carrerasAlumno={carrerasAlumno} handleChangeCarreras={handleChangeCarreras}/>
        <ConciertosFinales conciertos={conciertos} setConciertos={setConciertos} usuario={usuario}/>
        {id_alumno && <div className="mb-2">
        <div id="histo-al" className='mb-2 cabecera color-63 border-bottom-solid-light'>{`Cursadas actuales (${historial.length})`}
            <button className="w-300 fw-100 ml-8 edit" onClick={()=>{setMostrarCursadasBorradas(true);toggle()}} > <FontAwesomeIcon className="color-tomato" icon={faSearch}/> Ver las cursadas eliminadas ({cursosBorrados.length})</button>
            <button className="w-300 fw-100 ml-8 edit" onClick={()=>{setAgregarBeca(true);toggle()}} > <FontAwesomeIcon className="color-tomato" icon={faSearch}/>Nueva beca</button>
        </div>
        {<CursadasActuales usuario={usuario} cursadas={historial} iniciarVisualizarCurso={iniciarVisualizarCurso} eliminarAlumno={iniciarEliminarAlumno} id_alumno={id_alumno}/>}
        </div>} 
      <div className={`flex f-row ${!id_alumno ? 'mt-14' : ''}`}>
    { !historialAmpliado && <div>
        <div className="AnaliticoContainer relative">
            <div className="pan-abm-al">
                <div className='mb-2 cabecera color-63 border-bottom-solid-light'>Materias Aprobadas por test</div>
                    {id_alumno && huboCambiosMaterias && 
                        <span type="button" title="Deshacer los cambios y restaurar valores iniciales" 
 
                            onClick={restaurarMaterias} 
                            className="cursor-pointer boton-restaurar-abm botonAbm">Restaurar
                        </span>
                    }
                <MateriasAlumno materias={materiasTestAlumno} 
                                excluirMateria={excluirMateria} 
                                errorMateria={errorMateria}
                                usuario={usuario}
                />
                
                <AgregarMaterias agregarMateria={agregarMateria}
                                setAgregarMateria={setAgregarMateria}
                                materiaSeleccionada={materiaSeleccionada}
                                setMateriaSeleccionada={setMateriaSeleccionada}
                                modificarMateriasAprobadas={modificarMateriasAprobadas}
                                errorMateria={errorMateria}
                                setErrorMateria={setErrorMateria}
                                handleMateriaSeleccionada={handleMateriaSeleccionada}
                                materias={materias}
                                usuario={usuario}
                                setHuboCambiosMaterias = {setHuboCambiosMaterias}
                                materiasTestAlumno = {materiasTestAlumno}
                                setMateriasTestAlumno = {setMateriasTestAlumno}
                />           
            </div>
        </div>
        <div className="AnaliticoContainer relative">
            {usuarioPuedeActualizarNiveles && <AbmInstrumentosAlumno id_alumno={id_alumno}/>}
            {!usuarioPuedeActualizarNiveles && <div className="pan-abm-al">
            <div className='mb-2 cabecera color-63 border-bottom-solid-light'>Instrumentos y Niveles</div>
            {id_alumno && huboCambiosInstrumentos && 
                <span type="button" 
                    onClick={restaurarInstrumentos} 
                    title="Deshacer los cambios y restaurar valores iniciales" 
                    className="cursor-pointer boton-restaurar-abm botonAbm">Restaurar
                    </span>
            }
                
                <InstrumentosAlumno nivelesi={nivelesI} 
                                    nivelese={nivelesE} 
                                    instrumentos={instrumentosAlumno} 
                                    excluirInstrumento={excluirInstrumento}
                                    handleNivelEChange={handleNivelEChange}
                                    handleNivelIChange={handleNivelIChange}
                                    handleInstPrincipalChange = {handleInstPrincipalChange}
                                    usuario={usuario}
                                    deshabilitar ={esProfesor}
                                    />
                
                <AgregarInstrumento agregarInstrumento={agregarInstrumento}
                                setAgregarInstrumento={setAgregarInstrumento}
                                instrumentoSeleccionado={instrumentoSeleccionado}
                                setInstrumentoSeleccionado={setInstrumentoSeleccionado}
                                modificarInstrumentosYniveles={modificarInstrumentosYniveles}
                                errorInstrumento={errorInstrumento}
                                setErrorInstrumento={setErrorInstrumento}
                                handleInstrumentoSeleccionado={handleInstrumentoSeleccionado}
                                instrumentos={instrumentos}
                                usuario={usuario}
                />                
            </div>}

        </div>
    </div> }
        { id_alumno && 
        <div className="AnaliticoContainer relative">
            <div className="pan-abm-al">
                <div id="histo-al" className='mb-2 cabecera color-63 border-bottom-solid-light'>Historial de cursadas</div>
                
                    {buscarHistorial &&  <HistorialAlumno id_alumno={id_alumno} actual={0} cambiarAmpliado={cambiarAmpliado} iniciarVisualizarCurso={iniciarVisualizarCurso} idRefrescar={idRefrescar.current}/>}

            </div>

        </div>}
        </div>
        </div>
      </div>


     
    </div>
    </Main>
    )
}

const Cobranzas = ({cobranzasAlumno})=>{
    return       <div>
    <h5>Base de cobranzas</h5>
    <table>
        <thead>
            <tr>
                <th>Concepto</th>
                <th>Cantidad</th>
                <th>Importe</th>
                <th>Año</th>
                <th>Mes</th>
                <th>Tipo</th>
                <th>Vencimiento</th>
                <th>Período</th>
            </tr>
        </thead>
        {cobranzasAlumno.map(item=>{
        return <tbody>
                <tr>
                    <td>{item.item}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.a_pagar}</td>
                    <td>{item.anio}</td>
                    <td>{item.mes}</td>
                    <td>{item.tipo}</td>
                    <td>{item.fecha_vencimiento}</td>
                    <td>{item.periodo}</td>
                </tr>
            </tbody>
    })}
    </table>

  </div>
}

const Becas = ({becas,becasAlumno})=>{
    return       <div>
    <h5>Becas del alumno</h5>
    <table>
        <thead>
            <tr>
                <th>Id</th>
                <th>Beca</th>
                <th>Descripción</th>
                <th>Período</th>
                <th>usuario</th>
            </tr>
        </thead>
        {becasAlumno.map(item=>{
        return <tbody>
                <tr>
                    <td>{item.id_beca}</td>
                    <td>{item.nombre}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.cuatrimestre}</td>
                    <td>{item.usuario}</td>
                </tr>
            </tbody>
    })}
    </table>

  </div>
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

function MateriasAlumno({materias,excluirMateria,usuario}){

return (
    <div className="mt-4">
    {materias.map(
        (item,index)=><div key={uuidv4()} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
        {usuario.id_permiso == 3 &&<button title='Borrar'onClick={()=>excluirMateria(item.id_materia)}>
            <FontAwesomeIcon className="color-tomato" icon={faTrashAlt}/>
        </button>}
        <span className="listaCursadasAnalitico recortar-150">{item.descripcion}</span> 
        <span className="listaCursadasAnalitico">{item.cod_materia}</span> 
    </div>
    )}
</div>

)
}

function InstrumentosAlumno({usuario,instrumentos,excluirInstrumento,nivelesi,nivelese,handleNivelIChange,handleNivelEChange,handleInstPrincipalChange,deshabilitar}){
return (
<div className="mt-4 relative">
           {instrumentos.length>0 &&<div className="flex flex-row absolute tm15-r0"><span title="Nivel instrumental" className="titulo-nine">NI</span><span title="Nivel ensamble" className="cabnivei-nivele titulo-nine">NE</span></div>}

           {instrumentos.map(
               (item,index)=><div key={uuidv4()} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 flex">
               
               {usuario.id_permiso==3 && <button className="edit" title='Borrar'onClick={()=>excluirInstrumento(item.id_instrumento)}>
                   <FontAwesomeIcon className="color-tomato" icon={faTrashAlt}/>
               </button>}
               <span className="listaCursadasAnalitico recortar-nine">{item.instrumentos}</span> 
               <div>
                   <span className="t-ins-al">Nivel Ins.</span>
                   <span className="nivei-nivele mr-2" title="Nivel instrumental"><SelectNivelI disabled={deshabilitar} value={item.id_nivel_instrumental} instrumento={item.id_instrumento} niveles={nivelesi} onchange={handleNivelIChange}/></span> 
               </div>
               <div>
                   <span className="t-ins-al">Nivel Ens.</span>
                   <span className="nivei-nivele" title="Nivel ensamble"><SelectNivelE disabled={deshabilitar} value={item.id_nivel_ensamble} instrumento={item.id_instrumento} niveles={nivelese} onchange={handleNivelEChange}/></span> 
               </div>
               <div>
                   <span className="t-ins-al">Principal</span>
                   <span className="nivei-nivele"><input disabled={deshabilitar} type="radio" id="cri-td" title="Marcar como instrumento principal" name="principal`" value={item.id_instrumento} checked={item.inst_principal} onChange={handleInstPrincipalChange}/></span> 
               </div>
           </div>
           )}
       </div>

)}


function AgregarInstrumento({agregarInstrumento,
    setAgregarInstrumento,
    instrumentoSeleccionado,
    setInstrumentoSeleccionado,
    modificarInstrumentosYniveles,
    errorInstrumento,
    setErrorInstrumento,
    handleInstrumentoSeleccionado,
    instrumentos,usuario}){
return(
<>     
        { !agregarInstrumento && usuario.id_permiso==3 && <button title="Agregar un instrumento" className="edit"
        onClick={()=>{setAgregarInstrumento(true);setInstrumentoSeleccionado(-1)}}>
            <FontAwesomeIcon className="ic-abm"  icon={faPlusSquare}/> <span className="texto-acciones-menu bu-accion-abm">Agregar instrumento</span>
        </button>
        }  

        {agregarInstrumento && <button title="Cancelar" onClick={()=>{setAgregarInstrumento(false);setErrorInstrumento(null)}}>
        <FontAwesomeIcon className="ic-abm"  icon={faWindowClose}/>
        </button>
        }  

        { agregarInstrumento && 
        <div className="flex f-row">

        <select onChange={handleInstrumentoSeleccionado} value={instrumentoSeleccionado} className="w-selabm" id="abm-alumno-nacionalidad">
            <option disabled value="-1">Seleccionar</option>
            {
            instrumentos.map(item=>
            <option key={`abm-alumno-instrumentos${item.id_instrumento}`} 
            value={item.id_instrumento}>{item.nombre}</option>
            )
            }
        </select>

        { instrumentoSeleccionado>0 && 
        <button title="Agregar la materia aprobada" 
        onClick={modificarInstrumentosYniveles} className="relative">
        <FontAwesomeIcon className="ic-abm"  icon={faCheckSquare}/>
        <p onClick={modificarInstrumentosYniveles} title="Agregue el instrumento seleccionado" className="absolute cursor-pointer font-w-200"><span className="blink">Agregar</span></p>
        </button>}
        </div>  
        }      

        { agregarInstrumento && errorInstrumento && <div className="error_formulario"><span>{errorInstrumento}</span></div> }
</>
)
}

function AgregarMaterias({agregarMateria,
                          setAgregarMateria,
                          materiaSeleccionada,
                          setMateriaSeleccionada,
                          modificarMateriasAprobadas,
                          errorMateria,
                          setErrorMateria,
                          handleMateriaSeleccionada,
                          materias,usuario,materiasTestAlumno,setMateriasTestAlumno,
                          setHuboCambiosMaterias}){
return(
<>     
    { !agregarMateria && usuario.id_permiso == 3 && <button title="Agregar una materia aprobada" className="edit"
    onClick={()=>{setAgregarMateria(true);setMateriaSeleccionada(-1)}}>
    <FontAwesomeIcon className="ic-abm" icon={faPlusSquare}/> <span className="texto-acciones-menu bu-accion-abm">Agregar materia</span>
    </button>
    }  

    {agregarMateria && <button title="Cancelar" onClick={()=>{setAgregarMateria(false);setErrorMateria(null)}}>
        <FontAwesomeIcon className="ic-abm" icon={faWindowClose}/> <span className='texto-acciones-menu bu-accion-abm'>Cerrar selección de materias</span> 
    </button>
    }  

    { agregarMateria &&  
        <div className="flex f-row">

        <Materias2 materias={materias} 
                    materiasTestAlumno = {materiasTestAlumno} 
                    setMateriasTestAlumno={setMateriasTestAlumno}
                    setHuboCambiosMaterias = {setHuboCambiosMaterias}/>        
    </div>  
}      

{ agregarMateria && errorMateria && <div className="error_formulario"><span>{errorMateria}</span></div> }
</>
)
}

function SelectNivelI({niveles,value,onchange,instrumento,disabled}){


   return (
        <div>
            <select disabled={disabled} className="select-nive"  value={value} onChange={(e)=>onchange(e,instrumento)}>
                {niveles.map(item=>
                    <option key={uuidv4()} value={item.id_nivel_instrumental} >{item.nombre}</option>)}
            </select>
        </div>
       
    )
    
}

function SelectNivelE({niveles, value,onchange,instrumento, disabled }){

    return (
        <div>
            <select disabled={disabled} value={value} className="select-nive" onChange={(e)=>onchange(e,instrumento)}>
                {niveles.map(item=>
                    <option key={uuidv4()} value={item.id_nivel_ensamble} >{item.nombre}</option>)}
            </select>
        </div>
       
    )
    
}


function Confirma(){
    return <div>
        <span>¿Confirma?</span>
        <button>
                <FontAwesomeIcon className="ic-abm"  icon={faCheckSquare}/> 
        </button>
    </div>
}

function tablasGeneralesLocalStorage(setMaterias,setPaises,setVectorProvincias,setNacionalidades,
                                     setInstrumentos,setNivelesI,setNivelesE,setCarreras){
let resultado = true;

const materias = localStorage.getItem('materias');
const paises = localStorage.getItem('paises');
const provincias = localStorage.getItem('provincias');
const nacionalidades = localStorage.getItem('nacionalidades');
const instrumentos = localStorage.getItem('instrumentos');
const nivelesi = localStorage.getItem('nivelesi');
const nivelese = localStorage.getItem('nivelese');
const carreras = localStorage.getItem('carreras');


if (materias!=null){
    setMaterias(JSON.parse(materias))
}else{
    resultado = false;
}

if (paises!=null){
    setPaises(JSON.parse(paises))
}else{
    resultado = false;
}

if (provincias!=null){
    setVectorProvincias(JSON.parse(provincias))
}else{
    resultado = false;
}

if (nacionalidades!=null){
    setNacionalidades(JSON.parse(nacionalidades))
}else{
    resultado = false;
}

if (instrumentos!=null){
    setInstrumentos(JSON.parse(instrumentos))
}else{
    resultado = false;
}

if (nivelesi!=null){
    setNivelesI(JSON.parse(nivelesi))
}else{
    resultado = false;
}

if (nivelese!=null){
    setNivelesE(JSON.parse(nivelese))
}else{
    resultado = false;
}

if (carreras!=null){
    setCarreras(JSON.parse(carreras))
}else{
    resultado = false;
}

return resultado

}

function CursadasActuales({usuario,cursadas,iniciarVisualizarCurso,eliminarAlumno,id_alumno}){
return cursadas.map(cursadas=><div className="flex">
    {usuario.id_permiso==3 && <button className='alignself-st' title='Borrar'onClick={()=>eliminarAlumno(cursadas,id_alumno)}>
            <FontAwesomeIcon className="color-tomato" icon={faTrashAlt}/>
    </button>}
    <div onClick={()=>iniciarVisualizarCurso(cursadas)} className="block flex bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 cursor-pointer">
        <span title={cursadas.descripcion} className="listaCursadasAmpliada w-50 fw-600">{cursadas.mensaje}</span> 
        <span className="listaCursadasAmpliada w-200">{cursadas.descripcion} </span> 
        <span className="listaCursadasAmpliada w-150">{cursadas.profesor} </span> 
        <div className="listaCursadasAmpliada w-150"><span>{`${cursadas.DiaHora}`} </span><p>{`${cursadas.Aula}`} </p></div> 
        <RenderNota notas={cursadas}/>
        {/*<div class="c-prome ml-2" title="Nota final"><span class="c-promi">{`${cursadas.promedio}`}</span><span>{revisarNota(cursadas)}</span></div>*/}
    </div>
    <span title="Código de curso" style={{fontSize:'10px',position:'absolute',color:'gray'}}>{cursadas.nro_curso}</span>
</div>)
}

function CursadasEliminadas({recuperarCurso,cursadas,cerrar}){
const [todas,setTodas] = useState(true)

const todosLosCursos = cursadas.length;
const cursosActuales = cursadas.filter(item=>item.alerta==1).length;

useEffect(()=>{
    if(cursadas.length==0){
        setTimeout(() => {
            cerrar()
        }, 1500);
    }
},[])
    if (cursadas.length==0){
        return <div className="mb-2 cabecera color-63 border-bottom-solid-light">
            No se encontraron registros de cursadas eliminadas
        </div>
    }
    return <div className="mb-2"> 
        <div id="histo-al" className='mb-2 cabecera color-63 border-bottom-solid-light'>{`Cursadas eliminadas`}
        </div>
        {cursadas
        .filter(item=>todas ? item.alerta>=0 : item.alerta==1 )
        .map(cursadas=><div className="flex">
                <div onClick={()=>recuperarCurso(cursadas)} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 cursor-pointer">
                    <div>
                        <span title={cursadas.nombre} className="listaCursadasAmpliada w-200 fw-600">{cursadas.nombre}</span> 
                        <span title={cursadas.descripcion} className="listaCursadasAmpliada w-100 fw-600">{cursadas.cod_materia}<FontAwesomeIcon className="color-tomato ml-4" icon={faUndo} title="Reinscribir al alumno"/></span> 
                        <span className="listaCursadasAmpliada w-200">{cursadas.descripcion} </span> 
                        {/*<div className="c-prome ml-2" title="Promedio"><span className="c-promi">{cursadas.promedio}</span><span>{revisarNota(cursadas)}</span></div>*/}
                        <RenderNota notas={cursadas}/>
                        <span className="listaCursadasAmpliada w-150">{`${cursadas.fecha}`} </span> 
                    </div>
                    <div className="mb-2 ml-2">
                        <span className="color-gray text-smaller inline-block-1">{cursadas.profesor}</span>
                        <span  className="color-gray text-smaller inline-block-1 ml-4">{cursadas.diaHora}</span>
                    </div>
                  </div>
                  <span title="Código de curso" style={{fontSize:'10px',position:'absolute',color:'gray',left:'15px'}}>{cursadas.nro_curso}</span>
            </div>)}
    </div>
    }


function calcularEdad(anio,mes,dia){
    const today = new Date();
    const a = (Number(today.getFullYear()) * 100 + Number(today.getMonth()+1)) * 100 + Number(today.getDate());
    const b = (Number(anio) * 100 + Number(mes)) * 100 + Number(dia);
    return `${Math.trunc((a - b) / 10000)} años`;
}

function Carreras({carreras,carrerasAlumno,handleChangeCarreras,usuario}){
    return <div className="flex items-center border-bottom-solid-light cabecera ">
        <span title={JSON.stringify(carrerasAlumno)}>Carreras:</span>
        {carreras.map(item=>{
            return <div className="flex justify-center">
                    <label className="text-small color-gray ml-4 mr-2" htmlFor="abm-activo">{item.descripcion}</label>
                    <input disabled={usuario.id_permiso!=3} type="checkbox" value={item.id_carrera} checked={carrerasAlumno.some(carrera=>carrera.id_carrera==item.id_carrera)} onClick={handleChangeCarreras}/>
            </div>
        })}
    </div>
}

function ConciertosFinales({conciertos,setConciertos,usuario}){
    return <div className="flex items-center border-bottom-solid-light cabecera ">
        <span>Conciertos:</span>
            <div className="flex justify-center">
                    <label className="text-small color-gray ml-4 mr-2" htmlFor="abm-activo">Concierto 1</label>
                    <input disabled={usuario.id_permiso!=3} title="El alumno aprobó el primer concierto final" type="checkbox" checked={conciertos.concierto1} onChange={(e)=>setConciertos({...conciertos,concierto1:!conciertos.concierto1})}/>
            </div>
            <div className="flex justify-center">
                    <label className="text-small color-gray ml-4 mr-2" htmlFor="abm-activo">Concierto 2</label>
                    <input disabled={usuario.id_permiso!=3} title="El alumno aprobó el segundo concierto final" type="checkbox" checked={conciertos.concierto2} onChange={(e)=>setConciertos({...conciertos,concierto2:!conciertos.concierto2})}/>
            </div>
    </div>
}

const Materias2 = ({materias,materiasTestAlumno,setMateriasTestAlumno,setHuboCambiosMaterias})=>{

    const handleSelectMateria = (materia)=>{
      
     const existeMateria = materiasTestAlumno.some(item=>item.id_materia==materia.id_materia)

     if (existeMateria) {
        const nuevo_vector = materiasTestAlumno.filter(item=>item.id_materia!=materia.id_materia)

        setMateriasTestAlumno(nuevo_vector)
     }  else{
        setMateriasTestAlumno([...materiasTestAlumno,materia])
     }

     setHuboCambiosMaterias(true)
    }

    return (
        <div>
            <div className='flex f-col list-mat'>
                {materias.filter(item=>item.activa && !materiasTestAlumno.some(item2=>item2.id_materia==item.id_materia)).sort((a,b)=>a.descripcion.localeCompare(b.descripcion)).map(item=>
                    <div onClick={()=>handleSelectMateria(item)} title={item.descripcion} className={`mat-test-select cursor-pointer ${materiasTestAlumno.some(mat=>mat.id_materia==item.id_materia) ? 'bg-red text-white':''}`}>
                        {item.descripcion}
                    </div>)
                }
            </div>
        </div>
    )
}

const revisarNota = (cursadas)=>{
    const algun_recuperatorio = cursadas.columna_1_rec || cursadas.columna_2_rec
                   || cursadas.columna_3_rec || cursadas.columna_4_rec
                   || cursadas.columna_5_rec || cursadas.columna_6_rec
                   || cursadas.columna_7_rec || cursadas.columna_8_rec

    if(algun_recuperatorio){
        return 'REC'
    }else{
        return null
    }
}