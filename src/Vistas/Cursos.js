import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link,useParams } from 'react-router-dom';
import Loading from '../componentes/Loading';
import {useAlumno} from '../Context/alumnoContext';
import AbmCurso from '../abms/abm-curso';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle,faCircle,faWindowClose, faCopy, faPlusSquare, faEdit,faFilePdf, faEye } from '@fortawesome/free-regular-svg-icons';
import { faTrash,faAngleLeft,faAngleRight, faSync,faUsers,faSearch,faAt,faCog } from '@fortawesome/free-solid-svg-icons';
import {imprimir} from '../impresiones/registro';
import BusquedaCursos from '../componentes/BusquedaCursos';
import GenerarRecuperatorios from '../componentes/GenerarRecuperatorios';
import CursosAlumnosBorrados from '../componentes/CursosAlumnosBorrados';
import CronogramaCursos from '../componentes/CronogramaCursos';
import Swal from 'sweetalert2';
import TipoImpresion from '../componentes/TipoImpresion';
import ActualizarCalificaciones from '../componentes/ActualizarCalificaciones';
import SeleccionadorX from '../componentes/SeleccionadorX';
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import Curso from './Curso';
import { ref } from 'yup';
import Ensambles from '../componentes/Ensambles';
import GestionRecuperatorios from '../componentes/GestionRecuperatorios';


       
export default function Cursos({match,history}){
    const params = useParams();
    const anchoPaginacion = 40;
    const {borrarPaginacionMemorizada,cambiarPaginacion,paginacion,cuatrimestreActivo, habilitarBusquedaAlumnos,parametrosVistaCursos,cargarParametrosVistaCursos,usuario} = useAlumno();
    const [cursos,setCursos] = useState([])
    const [cursosAmostrar,setCursosAmostrar]=useState([])
    const {toggle, isShowing } = useModal();
    const [materias, setMaterias ] = useState([]);
    const [profesores, setProfesores ] = useState([]);
    const [tipos, setTipos ] = useState([]);
    const [dias, setDias ] = useState([]);
    const [criterio, setCriterio ] = useState('original');
    const [aulas,setAulas]= useState([]);
    const [dia,setDia]=useState(-1);
    const [tipo,setTipo]=useState(-1);
    const [profesor,setProfesor]=useState(-1);
    const [materia,setMateria]=useState(-1);
    const [tipoCurso,setTipoCurso]=useState(-1); // Standard / Instrumental / Ensamble
    const [grupalIndividual,setGrupalIndividual]=useState(-1); // 0 individual 1 grupal
    const [cursosRecuperatorios,setCursosRecuperatorios]= useState(false); // -1: todos false:Regulares true: Recuperatorios
    // para activar el modal llamar a la función toggle en con alguna condicion o un evento...
    const [cargandoCursos,setCargandoCursos] = useState(true);
   // const {alumno, cambiarAlumno} = useAlumno();
    const [crearCurso,setCrearCurso]=useState(false);
    const [cursoAcopiar,setCursoAcopiar]=useState(null);
    const [cursoAeditar,setCursoAeditar]=useState(null);
    const [copiarUnCurso, setCopiarUnCurso] = useState(false);
    const [editarUnCurso, setEditarUnCurso] = useState(false);
    const [buscarCursosAlumnosBorrados, setBuscarCursosAlumnosBorrados] = useState(false);
    const [contadorOperaciones, setContadorOperaciones]= useState(0);
    const [ultimosCursosCreados, setUltimosCursosCreados ]= useState([]);
    const [buscarCursosNoVigentes,setBuscarCursosNoVigentes]= useState(false);
    const [crearRecuperatorios,setCrearRecuperatorios]= useState(false);
    const [verCursosPorDia,setVerCursosPorDia]= useState(false);
    const [cursoSeleccionadoProfesor,setCursoSeleccionadoProfesor]=useState(null)
    const [id_configurarRecuperatorio,setId_configurarRecuperatorio]=useState(null)

    const prueba = match.params.id;

    const [iIni, setIini]=useState(parametrosVistaCursos && parametrosVistaCursos.iIni ? 2:0)
    const [iFin, setIfin]=useState(anchoPaginacion-1)
    const [hayFiltrosActivos,setHayFiltrosActivos]=useState(false)

    const [orden,setOrden]=useState('descripcion')
    const [nuevoCampo,setNuevoCampo]=useState(true)
    const [contadorOrden,setContadorOrden]=useState(0)
    const [cantidadFilas,setCantidadFilas]=useState(0);

    const [preguntasPDF,setPreguntasPDF] = useState(null)
    const [nombrePDF,setNombrePDF] = useState("")
    const [descargar,setDescargar] = useState(true)
    const [mounted,setMounted] = useState(false)

    const [preguntasPDFGlobal,setPreguntasPDFGlobal] = useState(false)

    const opcionesBajasSeleccion = ['Todos','Con bajas','Sin bajas']
    const [opcionBajaSeleccionado,setOpcionBajaSeleccionado]=useState('Todos')

    const [cuatrimestres,setCuatrimestres]=useState([]);
    const [cuatrimestreSeleccionado,setCuatrimestreSeleccionado]=useState(parametrosVistaCursos ? parametrosVistaCursos.cuatrimestre : cuatrimestreActivo.id_cuatrimestre);
    const [modoSeleccionado,setModoSeleccionado]=useState(-1); // Virtual o Presencial
    const [mostrarCalculos,setMostrarCalculos]=useState(traerConfiguracion())
    const [aulaSeleccionada,setAulaSeleccionada]=useState(-1); 
    
    // la referencia montado la utilizo para determinar si estamos en un momento de carga o recarga inicial
    // por ejemplo al ir a cursos desde el menú o ir a cursos desde un curso seleccionado
    // utilicé un ref para que sea independiente de los renders
    // el propósito es decidir si se debe resetear la paginación memorizada o no
    // cada vez que se pagina manualmente se guarda en el contexto los valores ini y fin
    // se guardan para que al entrar a un curso desde el listado de cursos luego se recuerde
    // en qué página estaba el usuario (ini, fin)
    // pero hay momentos en que las páginas deben resetearse a valores iniciales como en el caso
    // de modificar filtros
    // La paginacion se redefine en el useEffect dependiente de cursosAmostrar pero hay una lógica
    // para determinar cuando se debe resetear a valores iniciales o tomar la paginación memorizada
    // ATENCION: Recordar que es importante el orden en que se escriben los efectos
    // se van a ejecutar en ese orden
    // Para implementar esta lógica primero se importan del contexto borrarPaginacionMemorizada,cambiarPaginacion,paginacion 
    // Cada vez que se pagina se guardan los valores en el contexto con la funcion cambiarPaginacion
    // los valores de la paginacion memorizados se toman del contexto con el objeto paginacion
    // borrarPaginacionMemorizada se usa para que cuando se cumplen las condiciones correspondientes
    // se resetee a null la paginación para que se redefina según los filtros que se seleccionaron
    const montado = useRef(false)
    const refparam = useRef('all')
    const modos = [{id:1,nombre:'Virtual'},{id:0,nombre:'Presencial'}]

    useEffect(()=>{

        montado.current = false
        // montado.current = false se utiliza para la lógica de memorización de la paginación
        // la paginación memorizada no se debe borrar y se debe respetar cuando se esta en el momento
        // de cargar la vista. El efecto dependiente de <div cursosRecuperatorios,profesor...etc]
        // borra la paginación memorizada solo cuando ya está montado el listado
        // se debe evitar este borrado cuando se está cargando el listado porque se volvió de un curso
        // montado.current = true cuando se cargó el vector cursos

        if (parametrosVistaCursos){
            setCursosRecuperatorios(parametrosVistaCursos.cursosRecuperatorios)
            setGrupalIndividual(parametrosVistaCursos.grupalIndividual)
            setMateria(parametrosVistaCursos.materia)
            setDia(parametrosVistaCursos.dia)
            setTipoCurso(parametrosVistaCursos.tipoCurso)
            setProfesor(parametrosVistaCursos.profesor)
            setOrden(parametrosVistaCursos.orden)
            setModoSeleccionado(parametrosVistaCursos.modo)
            setOpcionBajaSeleccionado(parametrosVistaCursos.opcionBaja)
            setCuatrimestreSeleccionado(parametrosVistaCursos.cuatrimestre ? parametrosVistaCursos.cuatrimestre : cuatrimestreActivo.id_cuatrimestre)
        }

        if(usuario.id_permiso==0){
            setCursosRecuperatorios(-1) // si es un usuario profesor que muestre todos los cursos regulares y me
        }
    },[])

    useEffect(()=>{


    habilitarBusquedaAlumnos();
    buscarCuatrimestres()
    .then(()=>{
        buscarCursos()
    })
    },[cuatrimestreActivo,contadorOperaciones,cuatrimestreSeleccionado])

    const buscarCursos = async ()=>{

        //        desHabilitarBusquedaAlumnos();    
            console.log('miravos',cuatrimestreSeleccionado)
                if (!cuatrimestreSeleccionado){
                    return
                }

                setCargandoCursos(true)
                try{          
                    /*const {data} = await Axios.get(`/api/cursos/all/${cuatrimestreActivo.id_cuatrimestre}`)
                    setCursos(data)
                    listarUltimoCursosCreados(data,setUltimosCursosCreados)
                    setCargandoCursos(false)*/
        
        //            const url_cursos = usuario.id_permiso == 3 ? `/api/cursos/all/${cuatrimestreActivo.id_cuatrimestre}` : `/api/cursos/profesor/${cuatrimestreActivo.id_cuatrimestre}/${usuario.id_prof}`
        //            const url_cursos = usuario.id_permiso == 3 ? `/api/cursos/${refparam.current}/${cuatrimestreActivo.id_cuatrimestre}` : `/api/cursos/profesor/${cuatrimestreActivo.id_cuatrimestre}/${usuario.id_prof}`
                    const url_cursos = usuario.id_permiso == 3 ? `/api/cursos/${mostrarCalculos ? 'all' : 'allv2'}/${cuatrimestreSeleccionado}` : `/api/cursos/profesor/${cuatrimestreActivo.id_cuatrimestre}/${usuario.id_prof}`
                    const vectorResultado = await Promise.all([Axios.get(url_cursos),
                                                              Axios.get(`/api/cursos/altasrecientes`)])
                   /*setCursos(vectorResultado[0].data)
        
                    setUltimosCursosCreados(vectorResultado[1].data)
        
                     setCargandoCursos(false)      */
                    setUltimosCursosCreados(vectorResultado[1].data)
        
                    const data_mas_selector = vectorResultado[0].data.map((item)=>{return{...item,seleccion:false}})
                    // agrego el campo seleccion para los checkbox
                    const cursosOrdenadosPorMateria = await ordenarCursosPorMateria(data_mas_selector)
                    
                    setCursos(cursosOrdenadosPorMateria)
        
                    setCargandoCursos(false)
        
                    montado.current = true
                    //  montado.current = true se usa para permitir o no borrar la paginación memorizada
                }catch(err){
                    console.log(err)
                    setCargandoCursos(false)
                }
            }


    useEffect(()=>{
        resetLista('contador orden')
        cargarParametrosVistaCursos({...parametrosVistaCursos,orden:orden})
    },[contadorOrden])

    
    useEffect(()=>{


            const materias = materiasDeLosCursos()
            setMaterias(materias)
            const profesores = profesoresDeLosCursos()
            setProfesores(profesores)
            const dias = diasDeLosCursos()
            setDias(dias)
            const tipos = tiposDeLosCursos()
            setTipos(tipos)
            const aulas = aulasDeLosCursos()
            setAulas(aulasDeLosCursos)

          //  setCursosAmostrar(cursos)
            resetLista('cursos') // Se llama a resetLista para que filtre cursosAmostrar si hay filtros
    },[cursos])

    useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
        if (!isShowing){
            if (crearCurso){
                setCrearCurso(null)
            }
            if (copiarUnCurso){
                setCopiarUnCurso(false)
            }
            if (editarUnCurso){
                setEditarUnCurso(false)
            }        
            if(buscarCursosNoVigentes){
                setBuscarCursosNoVigentes(false)
            }
            if(crearRecuperatorios){
                setCrearRecuperatorios(false)
            }
            if(verCursosPorDia){
                setVerCursosPorDia(false)
            }
            if(cursoSeleccionadoProfesor){
                setCursoSeleccionadoProfesor(null)
            }
            if(buscarCursosAlumnosBorrados){
                setBuscarCursosAlumnosBorrados(false)
            }
            if(id_configurarRecuperatorio){
                setId_configurarRecuperatorio(null)
            }
        }
    },[isShowing])

    useEffect(()=>{

        const parametrosActuales = {
            cursosRecuperatorios:cursosRecuperatorios,
            profesor:profesor,
            grupalIndividual:grupalIndividual,
            materia:materia,
            dia:dia,
            tipoCurso:tipoCurso,
            orden:orden,
            cuatrimestre:cuatrimestreSeleccionado,
            opcionBaja:opcionBajaSeleccionado,
            modo:modoSeleccionado,
            aula:aulaSeleccionada
        }

        cargarParametrosVistaCursos({...parametrosVistaCursos,...parametrosActuales})

        resetLista('filtros')

        // La paginacion se momoriza cada vez que el usuario cambia de página
        // Este efecto se ejecuta cuando se modifica un filtro o cuando se carga la página
        // Cuando se modifica un filtro cuando ya está montado el listado borramos la paginacion guardada
        // para que se resetee la paginación
        // No reseteamos la paginación para que se respete lo que se memorizó cuando estamos en la
        // situación de cargar la vista porque habíamos entrado a un curso y volvemos al listado
        // Cuando volvemos de un curso se vuelve a montar el componente entonces montado.current es falso
        // entonces no resetea
        // !params.id significa que llegamos a esta vista no por volver de un curso sino por el menú
        // cuando volvemos de un curso queremos que se siga memorizando el paginado pero si llegamos
        // desde el menú queremos que se resetee aunque haya un filtro
        // en el link a /cursos enviamos un parametro solo cuando volvemos de un curso
        // El efecto dependiente de [cursosAmostrar] es el que redefine la paginación en el cual
        // se tomará la paginación memorizada si existe (si no se borró por las condiciones montado.current==true || !params.id)
        // El estado de montado o no montado se determina en el efecto dependiente de [] 
        // es decir el que se ejecuta al crear el componente y se toma como ya montado en la función
        // buscarCursos una vez que se cargó el vector de cursos.

        if(montado.current==true || !params.id){
            borrarPaginacionMemorizada()
        }

    },[cursosRecuperatorios,
        profesor,
        grupalIndividual,
        materia,
        dia,
        tipoCurso,
        opcionBajaSeleccionado,
        cuatrimestreSeleccionado,
        modoSeleccionado,aulaSeleccionada])

    useEffect(()=>{
        // Comentario 281020201353 
        // agrego esta validacion para que redefina la paginacion solo si cambió la cantidad de filas a mostrar
        // Validación necesaria despuès de agregar el campo seleccion para el checkbox porque salta este evento
        // si cambia el vector cursosAmostrar por la seleccion y cambia la paginacion y no es normal
        
      
          if(cantidadFilas!=cursosAmostrar.length){
             definirValoresPaginacion(cursosAmostrar,iIni,iFin,setIini,setIfin,anchoPaginacion,paginacion)
          }
      
      
          if (cursosAmostrar.length != cursos.length){
              setHayFiltrosActivos(true)
          }else{
              setHayFiltrosActivos(false)
          }
      
      // comentario 281020201355
      // se hace esta asignacion para la validacion de arriba, ver comentario 281020201353
      setCantidadFilas(cursosAmostrar.length)
      },[cursosAmostrar])
  /*  return <>
        <Modal hide={toggle} isShowing={isShowing}>
            <h1>SOY UN MODAL</h1>
        </Modal>
    </>
*/

/*function finalizarAltaOcopia (confirmado){
    // puede finalizar porque confirmó y creó un curso nuevo o porque lo canceló

    setCopiarUnCurso(false);
    setCrearCurso(false);
    setEditarUnCurso(false)

    if(confirmado){ // si finalizar porque creó incrementamos contadorOperaciones para que se
                    // active el useEffect que trae los datos de los cursos otra vez
        setContadorOperaciones(contadorOperaciones+1);
    }

    scrollTop()
}*/

const buscarCuatrimestres = async ()=>{
    try{
        const vectorResultados = await Promise.all([Axios.get(`/api/tablasgenerales/cuatrimestres`)])
        setCuatrimestres(vectorResultados[0].data)
    }catch(err){
        alert(err)
    }
}

useEffect(()=>{
    const conf_calculos = traerConfiguracion()
    if (conf_calculos!=mostrarCalculos){
        localStorage.setItem('conf-cs',JSON.stringify({calculos:mostrarCalculos}))
        buscarCursos()
    }
},[mostrarCalculos])

const borrarCurso = async (id)=>{

    try{
        const {data} = await Axios.delete(`/api/tablasgenerales/curso/${id}`)

        Swal.fire({
            text:`Se eliminó al curso con éxito`,
            icon: 'success',
            showConfirmButton: false,
            timer:2500
        })

        setContadorOperaciones(contadorOperaciones+1); // para que traiga los cursos de nuevo

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
        html : `<p>¿Confirma la eliminación del curso ${item.descripcion} / ${item.nombre} / ${item.DiaHora}  ${item.comienzo} hs?</p>
                <p>Alumnos inscriptos: ${item.nota}</p>`,
        showCancelButton:true,
        confirButtonText:'Si, eliminar',
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                borrarCurso(item.nro_curso);

            }else{
                console.log("Se canceló la eliminación del curso")
            }
        }
    )
}   

const finalizarCalificaciones = ()=>{
    setCursoSeleccionadoProfesor(null)
}

const iniciarImprimirPDF = (nro_curso)=>{
    if (preguntasPDF && preguntasPDF==nro_curso){
        setPreguntasPDF(null)
    }else{
        setPreguntasPDF(nro_curso)
    }
}

const cerrarPreguntasPDF = ()=>{
    setPreguntasPDF(null)
}

const iniciarImprimirPDFGlobal = ()=>{
    if (preguntasPDFGlobal){
        setPreguntasPDFGlobal(false)
    }else{
        setPreguntasPDFGlobal(true)
    }
}

const cerrarPreguntasPDFGlobal = ()=>{
    setPreguntasPDFGlobal(false)
}

const resetLista=(origen)=>{

    const filtrarVectorCursosOriginal = cursos.filter(item=>
            ((item.nombre == profesor && profesor!='-1')||
                profesor=='-1')
            && ((item.grupal == grupalIndividual && grupalIndividual != '-1') ||
                grupalIndividual=='-1')
            && ((item.al_eliminados > 0 && opcionBajaSeleccionado == 'Con bajas') ||
            (item.al_eliminados == 0 && opcionBajaSeleccionado == 'Sin bajas') ||
            opcionBajaSeleccionado=='Todos')                
            && ((item.descripcion == materia && materia != '-1') ||
                materia=='-1')
            && ((item.DiaHora == dia && dia != '-1') ||
                dia=='-1')
            && ((item.tipo == tipoCurso && tipoCurso != '-1') ||
                tipoCurso=='-1')
            && ((item.Virtual == modoSeleccionado && modoSeleccionado != '-1') ||
                modoSeleccionado=='-1')          
            && ((item.Aula == aulaSeleccionada && aulaSeleccionada!='-1')||
            aulaSeleccionada=='-1')                    
            && ((item.alerta == cursosRecuperatorios && cursosRecuperatorios != '-1') ||
                cursosRecuperatorios=='-1')                                                
            ) 
            .sort((a,b)=>{return comparacion(a,b)})
    
         setCursosAmostrar(filtrarVectorCursosOriginal)

}

const ordenarCursosPorMateria = async (vectorCursos)=>{

    // si no quisiera modificar el orden original debería hacer una copia pero la idea aqui
    // es alterar el orden que viene del stored y ordenar por materia

    vectorCursos.sort((a,b)=>{
        return a.descripcion.localeCompare(b.descripcion)
    })

    return vectorCursos

}

function finalizarAltaOcopia (altaOcopiaConfirmada){

    //altaOcopiaConfirmada es un flag booleano que viene en true si se grabó pero si se canceló
    // sin grabar trae null o falso

    if (altaOcopiaConfirmada){
        setContadorOperaciones(contadorOperaciones+1); // para que traiga los cursos de nuevo
    }

    // ATENCION: Cuando es un alta o copia el abm tiene un botòn de cerrar propio
    // que queda encima del botòn cerrar del MODAL como queda arriba se ejecuta la función
    // cancelar abm que llama a finalizarAltaOcopia(false)
    //es decir que en alta o copia hay 2 BOTONES

    //En el caso de una modificación este botón no se habilita por lo tanto existe solo el botón
    // del MODAL que al cerrar no llama a finalizaraltaocopia

    // esta lógica se hizo cuando el abm funcionaba directamente sobre la vista y no con el modal

    // REVISAR...

    setCopiarUnCurso(false);
    setCrearCurso(false);
    setEditarUnCurso(false)
    setCursoAeditar(null)
    setCursoAcopiar(null)

    toggle() // para que cierre el modal
}

const materiasDeLosCursos = ()=>{

    return cursos.map(item=>item.descripcion).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const profesoresDeLosCursos = ()=>{

    return cursos.map(item=>item.nombre).sort().filter((item,index,vector)=>
        item != vector[index-1])
   
}

const aulasDeLosCursos = ()=>{

    return cursos.map(item=>item.Aula).sort().filter((item,index,vector)=>
        item != vector[index-1])
}

const diasDeLosCursos = ()=>{
    // aquì ordeno al array por id de dia en lugar de ordenarlo alfabeticamente si no Jueves vendría primero que Lunes
    // no hago el sort directamente sobre cursos porque modificaría el orden del original
    // hago una copia y devuelvo esta

 /*  return copia.sort((a,b)=>a.dia - b.dia).map(item=>item.DiaHora).filter((item,index,vector)=>
    item != vector[index-1] )
*/
    const copia = [...cursos]; // trabajar sobre una copia sino modifica el orden original del vector por descripcion de la materia

    return copia.sort((a,b)=>a.dia - b.dia).map(item=>item.DiaHora).filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const tiposDeLosCursos = ()=>{

    return ['I','G']
   
}

const refrescarLista = ()=>{
    refparam.current = 'all'
    setContadorOperaciones(contadorOperaciones+1)
}

const refrescarLista2 = ()=>{
    refparam.current = 'allv2'
    setContadorOperaciones(contadorOperaciones+1)
}

const handleChangeSelectProfesores = (e)=> {
    
   setProfesor(e.target.value)

// el resto de la acciòn se ejecuta en el useEffect

}

const handleChangeSelectBajas = (e)=> {
    
    setOpcionBajaSeleccionado(e.target.value)
 
 // el resto de la acciòn se ejecuta en el useEffect
 
 }

const handleChangeSelectMaterias = (e)=> {

 
   setMateria(e.target.value)

     // el resto de la acciòn se ejecuta en el useEffect

}

const funcionOrden = (nombre_campo)=>{

    if (orden==nombre_campo){
        setNuevoCampo(false)
    }else{
        setNuevoCampo(true)
    }

    setOrden(nombre_campo)
    setContadorOrden(contadorOrden+1)

}

const comparacion = (a,b)=>{

    switch (orden){
        case null : return 0 
        case 'alerta':
        case 'nota':
        case 'Virtual':
        case 'grupal':
        case 'al_eliminados':
        case 'nro_curso':
    
        if(nuevoCampo==true){
                return a[orden] - b[orden]
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

const handleChangeSelectDias = (e)=> {

  setDia(e.target.value)

// El resto de la acción se ejecuta en el useEffect
}

const handleChangeSelectCuatrimestres = (e)=> {

    setCuatrimestreSeleccionado(e.target.value)
  
  // El resto de la acción se ejecuta en el useEffect
}

const handleChangeSelectModo = (e)=> {

    setModoSeleccionado(e.target.value)
  
  // El resto de la acción se ejecuta en el useEffect
}

const handleChangeSelectAula = (e)=> {

    setAulaSeleccionada(e.target.value)
  
  // El resto de la acción se ejecuta en el useEffect
}


const handleChangeSelectTipos = (e)=> {

    setTipoCurso(e.target.value);
  // El resto de la acción se ejecuta en el useEffect

}

const limpiarFiltros = ()=> {

    setDia(-1);
    setTipo(-1);
    setProfesor(-1);
    setMateria(-1);
    setCursosRecuperatorios(-1);
    setTipoCurso(-1);
    setGrupalIndividual(-1)
    setOpcionBajaSeleccionado('Todos')
    setModoSeleccionado(-1)
    setAulaSeleccionada(-1)
    const vectorOrdenado = ordenarVector(cursos)
   
    setCursosAmostrar(vectorOrdenado)
}

const limpiarCursoRecuperatorio = ()=> {
    setCursosRecuperatorios(-1);
}

const limpiarProfesor = ()=> {
    setProfesor(-1);
}

const limpiarModo = ()=> {
    setModoSeleccionado(-1);
}

const limpiarAula = ()=> {
    setAulaSeleccionada(-1);
}

const limpiarBaja = ()=>{
    setOpcionBajaSeleccionado('Todos')
}

const limpiarGrupalIndividual = ()=> {
    setGrupalIndividual(-1);
}

const limpiarMateria = ()=> {
    setMateria(-1);
}

const limpiarDia = ()=> {
    setDia(-1);
}

const limpiarTipoCurso = ()=> {
    setTipoCurso(-1);
}

const handleChangeSelectME = (e)=> {

    const valorBooleano = e.target.value==="true" ? true: false;

    setCursosRecuperatorios(valorBooleano);
// El resto de la acción se ejecuta en el useEffect

}

const handleChangeSelectGrupalIndividual = (e)=> {

    setGrupalIndividual(e.target.value)
// El resto de la acción se ejecuta en el useEffect

}
const copiarCurso = (id)=>{
    setCopiarUnCurso(true)
    setCrearCurso(false)
    setEditarUnCurso(false)
    setCursoAcopiar(id)
    toggle()
    /*setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);*/
}

const editarCurso = (id)=>{
    setCopiarUnCurso(false)
    setEditarUnCurso(true)
    setCrearCurso(false)
    setCursoAeditar(id)
    toggle()

    /*setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);*/
}

const cambiarTipoCurso = (e)=>{
    // viene Standard, Ensamble o Instrumental
    setTipoCurso(e.target.value)
}

const iniciarAbrirCalificacionesDelProfesor = (curso)=>{
    if (curso.nota>0){
        setCursoSeleccionadoProfesor(curso.nro_curso);
        toggle()
    }else{
        alert('No hay alumnos inscriptos en este curso')
    }
}

const cambiarCursosRecuperatorios = (e)=>{
    // viene 1 o 0 para indicar si es o no recuperatorio 
    setCursosRecuperatorios(e.target.value)
}

const handleChangeSelectTipo = (e)=> {

    setTipo(e.target.value);
    setDia(-1);
    setProfesor(-1);
    setMateria(-1);
    setGrupalIndividual(-1)

    const tipoAbuscar =  e.target.value ==="I" ? 0 : 1;

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.grupal===tipoAbuscar)
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

/*const iniciarNuevoCurso = ()=>{
    setCrearCurso(true);
    
    setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);
}*/

const cambiarCheck =(e)=>{

    const aux3 = cursosAmostrar.map(item=>{
        if (item.nro_curso!=e.target.value){
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

const finalizarReutilizacionCursos = (cuatrimestreDestino)=>{

//    if(cuatrimestreDestino==cuatrimestreActivo.id_cuatrimestre){
    if(cuatrimestreDestino==cuatrimestreSeleccionado){
        setContadorOperaciones(contadorOperaciones+1)
    }
    
}

const handleChangeMostrarCalculos = (e)=>{
    
    setMostrarCalculos(!mostrarCalculos)
}

const imprimirRegistros = ()=>{
    
    const cursos_seleccionados = cursosAmostrar.some(item=>item.seleccion==true)

    if(!cursos_seleccionados){
        alert('No hay cursos seleccionados')
        return
    }

    const seleccionados = cursosAmostrar.filter(item=>item.seleccion==true)

    const html = `Registros a imprimir: ${seleccionados.length}`

    Swal.fire({
        html:html,
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
                seleccionados.forEach(item => {
                    imprimir(descargar,null,cuatrimestreActivo,item.nro_curso)
                });
            }
        })

//    const resultado = armarListaEmailsSync(cursosAmostrar) // la lista de emails no la armo más aquí sino en el click de enviar mail

    
}

const obtenerMailsCursosSeleccionados = ()=>{
    
    const cursos_seleccionados = cursosAmostrar.some(item=>item.seleccion==true)

    if(!cursos_seleccionados){
        alert('No hay cursos seleccionados')
        return
    }

    const seleccionados = cursosAmostrar.filter(item=>item.seleccion==true)

    const html = `Cursos seleccionados: ${seleccionados.length}`

    Swal.fire({
        html:html,
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
                buscarEmailsNcursos(seleccionados)
                .then(vectorEmails=>{

                    const emails_string = vectorEmails.join()

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
                })
            }
        })

//    const resultado = armarListaEmailsSync(cursosAmostrar) // la lista de emails no la armo más aquí sino en el click de enviar mail

    
}

const iniciarNuevoCurso = ()=>{
    setCrearCurso(true);
    toggle()    
}

const iniciarAbrirBusquedaCursosNoVigentes = ()=>{
    setBuscarCursosNoVigentes(true);
    toggle();
}

const iniciarConfigurarRecuperatorios = (curso)=>{
    setId_configurarRecuperatorio(curso);
    toggle();
}

const iniciarCopiarUnCurso = ()=>{
    setCopiarUnCurso(true);
    toggle();
}

const iniciarCopiarEmails =(curso)=>{
    if (curso.nota>0){
         buscarEmails(curso)
    }else{
        alert('No hay alumnos inscriptos en este curso')
    }
}

const buscarEmails = async (curso)=>{
    try{
        const {data} = await Axios.get(`/api/cursos/alumnos/${curso.nro_curso}`)

        if (data.length > 0){
            const emails = data.filter(item=>item.email!='').map(item=>item.email)
            const mensaje = emails.length > 1 ? `${emails.length} e-mails encontrados`:'1 e-mail encontrado'
            const emails_string = emails.join()

           const longitud_relativa = emails_string.length/45;

           const rows = longitud_relativa > 1 ? longitud_relativa : 1;

           Swal.fire({
            html:`<div>
            <p>${curso.descripcion}</p>
            <p>${curso.nombre} ${curso.DiaHora} ${curso.periodo}</p>
            <p class="mt-2 mb-2">${mensaje}</p>
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


        }else{
            alert('No hay alumnos inscriptos en el curso')
        }

    }catch(err){
        alert (err.data.message)
    }
}



const buscarEmailsNcursos = async (cursos)=>{

    const vectorLlamadasApi = cursos.map(item=>Axios.get(`/api/cursos/alumnos/${item.nro_curso}`))

    try{
        const resultado = await Promise.all(vectorLlamadasApi)
        let vector_mails = []

        if (resultado.length > 0){

            // El resultado de promise.all trae un vector de objetos, cada objeto tiene un data con un array de resultados
            // [{data:[listado de alumnos curso 1]},{data:[listado de alumnos curso 2]},{data:[listado de alumnos curso N]}]
           
            const vectorEmails = resultado.map(item=>item.data.map(item2=>item2.email).filter(item=>item.email!=''))

            vectorEmails.forEach((item)=>{
                vector_mails.push(...item)
            })
            
            return vectorEmails
        }
    }catch(err){
        alert (err.data.message)
    }
}

const iniciarAbrirCreacionRecuperatorios = ()=>{
    setCrearRecuperatorios(true);
    toggle();
}

const iniciarBuscarCursosAlumnosBorrados = ()=>{
    setBuscarCursosAlumnosBorrados(true);
    toggle();
}

const iniciarAbrirVerCursosPorDia = ()=>{
    setVerCursosPorDia(true);
    toggle();
}

const paginar = (ini,fin)=>{
    setIini(ini)
    setIfin(fin)
    cambiarPaginacion(ini,fin)
}

if (cargandoCursos){
    return <Main center><Loading/><span className="cargando">Cargando cursos...</span></Main>
  };

  //`/curso/${curso.nro_curso}`
return(
    <Main>
         { isShowing && crearCurso && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                                
                    <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
                        finalizarAltaOcopia={finalizarAltaOcopia}
                        esModal={true}
                    />    
        
                </Modal>
         }
         { isShowing && id_configurarRecuperatorio && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                        <GestionRecuperatorios nro_curso={id_configurarRecuperatorio.nro_curso} nombre={id_configurarRecuperatorio.descripcion} finalizar={finalizarAltaOcopia}/>  
                </Modal>
         }
         { isShowing && copiarUnCurso && false && // ESTO ES VIEJO voy a reutilizar esta función de copiar un curso para ver ensambles 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                                
                <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
                  cursoCopiado={cursoAcopiar} 
                  finalizarAltaOcopia={finalizarAltaOcopia}
                  esModal={true}
                  />
        
                </Modal>
         }

        { isShowing && copiarUnCurso && // ESTO ES NUEVO voy a reutilizar esta función de copiar un curso para ver ensambles 
                <Modal  titulo={"Listado de ensambles"} hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                                
                <Ensambles/>
        
                </Modal>
         }

        { isShowing && editarUnCurso && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                                
                    <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
                    nro_curso={cursoAeditar} 
                    finalizarAltaOcopia={finalizarAltaOcopia}
                    esModal={true}
                    />
        
                </Modal>
         }
         { isShowing && buscarCursosAlumnosBorrados && 
            <Modal hide={toggle} titulo={'Listado de cursos con alumnos elimnados'} isShowing={isShowing} estilo={{width:'800px'}} estiloWrapper={{background:'#000000bf'}}>
                            
                <CursosAlumnosBorrados finalizarReutilizacionCursos={finalizarReutilizacionCursos}/>

            </Modal>
        }
        { isShowing && buscarCursosNoVigentes && 
            <Modal hide={toggle} titulo={'Listado de cursos por cuatrimestre / Reutilización de cursos'} isShowing={isShowing} estilo={{width:'800px'}} estiloWrapper={{background:'#000000bf'}}>
                            
                <BusquedaCursos finalizarReutilizacionCursos={finalizarReutilizacionCursos}/>

            </Modal>
        }
                { isShowing && crearRecuperatorios && 
            <Modal hide={toggle} titulo={'Crear recuperatorios'} isShowing={isShowing} estilo={{width:'800px'}} estiloWrapper={{background:'#000000bf'}}>
                            
                <GenerarRecuperatorios finalizarReutilizacionCursos={finalizarReutilizacionCursos}/>

            </Modal>
        }
        { isShowing && verCursosPorDia && 
            <Modal hide={toggle} titulo={'Cronograma de cursos'} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
                            
                <CronogramaCursos propCursos={cursos}/>

            </Modal>
        }   
        { isShowing && cursoSeleccionadoProfesor && 
            <Modal hide={toggle} titulo={''} isShowing={isShowing} estilo={{width:'900px'}} estiloWrapper={{background:'#000000bf'}}>
                            
                <ActualizarCalificaciones nro_curso={cursoSeleccionadoProfesor} usuario={usuario} finalizarCalificaciones={finalizarCalificaciones} visualizacion={false}/>

            </Modal>
        }           


        <div className="bg-blue p-4 rounded relative mt-v ml-auto mr-auto mb-8"> 
        <div className= { usuario.id_permiso == 0 ? "flex f-row f-cabecera justify-content-center" : "flex f-row f-cabecera justify-content-space-between"}>
        { usuario.id_permiso == 0 && <p>Cursos actuales</p>}
        { usuario.id_permiso == 3 && <TipoCursos cambiarTipoCurso={handleChangeSelectTipos} 
                    cambiarCursosRecuperatorios={handleChangeSelectME}
                    tipoCurso={tipoCurso} cursoRecuperatorio={cursosRecuperatorios}
                    grupalIndividual={grupalIndividual}
                    limpiarFiltros={limpiarFiltros}
                    hayFiltrosActivos={hayFiltrosActivos}
                    cambiarGrupalIndividual={handleChangeSelectGrupalIndividual}
                    materia = {materia}
                    handleChangeSelectMaterias = {handleChangeSelectMaterias}
                    materias = {materias}
                    profesor = {profesor}
                    handleChangeSelectProfesores = {handleChangeSelectProfesores}
                    profesores = {profesores}
                    dia = {dia}
                    handleChangeSelectDias = {handleChangeSelectDias}
                    dias = {dias}
                    limpiarCursoRecuperatorio ={limpiarCursoRecuperatorio}
                    limpiarDia ={limpiarDia}
                    limpiarTipoCurso = {limpiarTipoCurso}
                    limpiarProfesor = {limpiarProfesor}
                    limpiarMateria = {limpiarMateria}
                    limpiarGrupalIndividual = {limpiarGrupalIndividual}
                    handleChangeSelectBajas = {handleChangeSelectBajas}
                    limpiarBaja={limpiarBaja}
                    opcionesBajasSeleccion = {opcionesBajasSeleccion}
                    opcionBajaSeleccionado={opcionBajaSeleccionado}
                    cuatrimestres = {cuatrimestres}
                    cuatrimestreSeleccionado = {cuatrimestreSeleccionado}
                    handleChangeSelectCuatrimestres = {handleChangeSelectCuatrimestres}
                    modos = {modos}
                    modoSeleccionado = {modoSeleccionado}
                    handleChangeSelectModo = {handleChangeSelectModo}
                    limpiarModo = {limpiarModo}
                    aulas = {aulas}
                    aulaSeleccionada = {aulaSeleccionada}
                    handleChangeSelectAula = {handleChangeSelectAula}
                    limpiarAula = {limpiarAula}
                    />}

        {/*<div className="flex f-col centro-w300 ml-auto mr-auto res-lista">
            <div className="flex f-col">
                <span>{cursosAmostrar.length== 1 ? `1 curso encontrado`:`${cursosAmostrar.length} cursos encontrados`}</span> 
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={cursosAmostrar.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>
        </div>*/}   
         {cuatrimestreActivo && usuario.id_permiso == 3 && <Cabecera cuatrimestreActivo={cuatrimestreActivo} 
                                         refrescarLista={refrescarLista} 
                                         refrescarLista2={refrescarLista2} 
                                         iniciarNuevoCurso={iniciarNuevoCurso}
                                         verCursosPorDia={iniciarAbrirVerCursosPorDia}
                                         iniciarAbrirBusquedaCursosNoVigentes={iniciarAbrirBusquedaCursosNoVigentes}
                                         iniciarAbrirCreacionRecuperatorios = {iniciarAbrirCreacionRecuperatorios}
                                         imprimirRegistros = {imprimirRegistros}
                                         obtenerMailsCursosSeleccionados = {obtenerMailsCursosSeleccionados}
                                         iniciarBuscarCursosAlumnosBorrados = {iniciarBuscarCursosAlumnosBorrados}
                                         iniciarImprimirPDFGlobal= {iniciarImprimirPDFGlobal}
                                         preguntasPDFGlobal= {preguntasPDFGlobal}
                                         cerrarPreguntasPDFGlobal= {cerrarPreguntasPDFGlobal}
                                         setDescargar= {setDescargar}
                                         descargar= {descargar}
                                         handleChangeMostrarCalculos={handleChangeMostrarCalculos}
                                         mostrarCalculos = {mostrarCalculos}
                                         verEnsambles = {iniciarCopiarUnCurso} // esto es porque uso el flag copiarUnCurso (que no se usaba) para armar algo rápido para ver ensambles
                                         />}

         
        </div>    

        <div className="flex f-col centro-w300 ml-auto mr-auto res-lista">
            <div className="flex f-col">
                <span>{cursosAmostrar.length== 1 ? `1 curso encontrado`:`${cursosAmostrar.length} cursos encontrados`}</span> 
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={cursosAmostrar.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>
        </div>   
        <table className="table mt-2 mb-8">
            <thead className="bg-blue-500 text-white">
            <tr className="titulo-lista">

                    <th scope="col"></th>
                    {usuario.id_permiso > 1 && <th>
                        <a onClick={()=>gestionarChecks(true)} 
                            title="Marcar todos" 
                            className="tdec-none cursor-pointer ml-2 color-63">
                            <FontAwesomeIcon className="cursor-pointer text-white" icon={faCheckCircle}/> 
                        </a> 

                        <a onClick={()=>gestionarChecks(false)} 
                            title="Desmarcar todos" 
                            className="tdec-none cursor-pointer ml-2 mr-2 color-63 ">
                            <FontAwesomeIcon className="cursor-pointer text-white" icon={faCircle}/> 
                        </a> 
                    </th>  }                  
                    {/*<td scope="col"><Seleccionador valor={tipo} onchange={handleChangeSelectTipo} vector = {tipos}/></td>*/}
                    <th scope="col" className={orden=='nro_curso' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('nro_curso')}>#ID</th>
                    <th scope="col" className={orden=='grupal' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('grupal')}>I/G</th>
                    <th scope="col" className={orden=='descripcion' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('descripcion')}>Materia</th>
                    {usuario.id_permiso > 0 && <th className={orden=='nombre' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('nombre')} scope="col">Profesor</th>}
                    <th scope="DiaHora" className={orden=='DiaHora' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('DiaHora')}>Día</th>
                    <th scope="col">Hora</th>
                    {mostrarCalculos && <th className={orden=='nota' ? 'orden-activo' : 'pad-list1 cursor-pointer'} onClick={()=>funcionOrden('nota')}  title="Cantidad de alumnos inscriptos " scope="col">Alumnos</th>}
                    {usuario.id_permiso == 3 && mostrarCalculos && <th className="pad-list1" title="Cantidad de lugares disponibles en el curso " scope="col">Disp.</th>}
                    <th className="pad-list1" title="Curso Regular o Mesa de examen" className={orden=='alerta' ? 'orden-activo cursor-pointer' : 'cursor-pointer'} onClick={()=>funcionOrden('alerta')} scope="col">R/ME</th>
                    <th className={orden=='Aula' ? 'orden-activo' : 'cursor-pointer'} title="Aula" scope="col" onClick={()=>funcionOrden('Aula')}>Aula</th>
                    <th className={orden=='Virtual' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('Virtual')} title="Aula virtual o presencial" scope="col">Modo</th>
                    {/*<th title="Curso Standard, Instrumental o Ensamble" className={orden=='tipo' ? 'orden-activo cursor-pointer' : 'cursor-pointer'} onClick={()=>funcionOrden('tipo')} scope="col">Tipo</th>*/}
                    {mostrarCalculos && <th className={orden=='al_eliminados' ? 'orden-activo' : 'pad-list1 cursor-pointer'} onClick={()=>funcionOrden('al_eliminados')}  title="Cantidad de alumnos inscriptos " scope="col">Bajas</th>}
                    {usuario.id_permiso == 3 && 
                    <th span="4" className="" scope="col">Acciones</th>}
                    {usuario.id_permiso == 0 && 
                    <th span="1" className="p-2" scope="col">Acciones</th>}
                </tr>    
            </thead> 
            <tbody>
            {
                cursosAmostrar
                .map((item,index)=>{return {...item,indice:index+1}})
                .filter((item,index)=>{
                    return index>= iIni && index<=iFin
                })
                .map(curso => {
                return (
                    <tr key={curso.nro_curso} className="bg-blueTabla">
                        <td className="indice">{curso.indice}</td>
                        {usuario.id_permiso > 1 && <td className="text-center"><input value={curso.nro_curso} 
                            checked={curso.seleccion} 
                            onChange={(e)=>cambiarCheck(e)} type="checkbox" 
                            title="Marque o desmarque éste curso"/>
                        </td>}
                        <td className="filas-lista-principal">{curso.nro_curso}</td>
                        <td className="filas-lista-principal" title={curso.grupal ? 'Curso grupal' : 'Curso de horarios individuales'}>{curso.grupal ? 'G' : 'I'}</td>
                        <td title={curso.descripcion} className="filas-lista-principal">
                            {usuario.id_permiso == 3 && <Link 
                                className="color-63 tdec-none" 
                                to={{
                                    pathname: `/curso/${curso.nro_curso}`                                }}> 
                                {curso.descripcion}
                            </Link> }
                            {usuario.id_permiso == 0 && <button onClick={()=>{iniciarAbrirCalificacionesDelProfesor(curso)}}>
                                {curso.descripcion}
                            </button>}
                        </td>
                        {usuario.id_permiso > 0 && <td title={curso.nombre} className="filas-lista mw-120x">{curso.nombre}</td>}
                        <td className="filas-lista">{curso.DiaHora}</td>
                        <td className="filas-lista">{curso.comienzo} hs</td>
                        {mostrarCalculos && <td className="text-center filas-lista">{curso.nota}</td>}
                        {usuario.id_permiso == 3 && mostrarCalculos && <td className={curso.disponibilidad>0 ? 'dispo-1 filas-lista' : 'dispo-0 filas-lista'}>{curso.disponibilidad}</td>}       
                        <td title={curso.alerta===false ? 'Regular' : 'Mesa de examen'} className="filas-lista">{curso.alerta===false ? 'R' : 'ME'}</td>
                        <td className="filas-lista">{curso.Aula}</td>
                        <td title={curso.Virtual==false ? 'Presencial' : 'Virtual'} className={curso.Virtual==false ? "filas-lista a-presc":"filas-lista a-virtual"}>{curso.Virtual==false ? 'Pres' : 'Virtual'}</td>
                        {/*<td title={curso.tipo} className="filas-lista">{curso.tipo}</td>*/}
                        {mostrarCalculos && <td className="filas-lista text-center">{curso.al_eliminados}</td>}
                        {usuario.id_permiso == 0 && 
                         <td title="Configurar los recuperatorios del curso" className="tipo-cursox text-center cursor-pointer width-35 color-tomato text-large filas-lista">
                                <div>
                                    <FontAwesomeIcon onClick={()=>iniciarConfigurarRecuperatorios(curso)} className="cursor-pointer"  icon={faCog}/>
                                </div>
                        </td> 
                        }
                        { usuario.id_permiso == 3 && <>
                        <td onClick={()=>editarCurso(curso.nro_curso)} title="Editar la cabecera del curso" className="tipo-curso cursor-pointer filas-lista width-35 color-tomato text-large">
                              <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                        </td> 
                        <td onClick={()=>editarCurso(curso.nro_curso)} title="Editar las inscripciones del curso " className="tipo-curso cursor-pointer filas-lista width-35">
                            <Link 
                                className="filas-lista color-tomato text-large hw" 
                                to={{
                                    pathname: `/curso/${curso.nro_curso}`
                                }} > 
                                <FontAwesomeIcon className="cursor-pointer"  icon={faUsers}/>
                            </Link> 
                        </td>     
                        <td title="Imprimir el registro del curso" className="tipo-curso cursor-pointer width-35 color-tomato text-large filas-lista">
                              <div>
                                    <FontAwesomeIcon onClick={()=>iniciarImprimirPDF(curso.nro_curso)} className="cursor-pointer"  icon={faFilePdf}/>
                                    {preguntasPDF == curso.nro_curso && <TipoImpresion cerrarPreguntasPDF={cerrarPreguntasPDF} 
                                                                    ejecutarImprimirPDF = {()=>imprimir(descargar,null,cuatrimestreActivo,curso.nro_curso)}
                                                                    modificarDescargar = {setDescargar}
                                                                    descargar = {descargar}
                                                                    />}    
                              </div>
                        </td>
                        <td onClick={()=>iniciarCopiarEmails(curso)} title="Copiar los e-mails de los alumnos" className="tipo-curso cursor-pointer filas-lista width-35 color-tomato text-large">
                              <FontAwesomeIcon className="cursor-pointer" icon={faAt}/>
                        </td> 
                        <td onClick={()=>iniciarBorrar(curso)} title="Eliminar el curso" className="tipo-curso cursor-pointer filas-lista width-35 color-tomato text-large">
                              <FontAwesomeIcon className="cursor-pointer"  icon={faTrash}/>
                        </td>                         
                        </>}                                                                 
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
  
      {/*crearCurso && <AbmCurso cuatrimestreActivo={cuatrimestreActivo} finalizarAltaOcopia={finalizarAltaOcopia}/>*/}
      {/*copiarUnCurso && <AbmCurso cuatrimestreActivo={cuatrimestreActivo} cursoCopiado={cursoAcopiar} finalizarAltaOcopia={finalizarAltaOcopia}/>*/}
    </Main>
)
    }


//onClick={()=>imprimir(true,cursoActualizado,cuatrimestreActivo.nombre)}
function Seleccionador({vector,onchange,valor,nombre,noname}){
    let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
    let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";

    return (            
        <div className="input-field col s12">
            <select value={valor} onChange = {onchange} className={valor=="-1" ? clasesSelect : clasesActivo}>
                {!noname && <option value="-1" key="-1">{nombre}</option>}
                {vector.map(item=><option value={item} key={item}>{item}</option> )}
            </select>
        </div>
        )
}    



function Cabecera({cuatrimestreActivo,
                    iniciarNuevoCurso,
                    refrescarLista,
                    refrescarLista2,
                    iniciarAbrirBusquedaCursosNoVigentes,
                    verCursosPorDia,
                    imprimirRegistros,
                    obtenerMailsCursosSeleccionados,
                    iniciarImprimirPDFGlobal,
                    preguntasPDFGlobal,
                    cerrarPreguntasPDFGlobal,
                    setDescargar,
                    descargar,
                    iniciarBuscarCursosAlumnosBorrados,
                    iniciarAbrirCreacionRecuperatorios,
                    handleChangeMostrarCalculos,
                    mostrarCalculos,
                    verEnsambles
                    }){
    return <div className="flex f-col alignself-fe">
                {/*<span className="cabecera">{`Listado de cursos ${cuatrimestreActivo.nombre}`}</span>*/}
                
                <span title="Refrescar la lista" onClick={()=>refrescarLista()} 
                        className="cursor-pointer a-l-c botonNc mr-4" >
                        <FontAwesomeIcon className="" icon={faSync}/> Refrescar
                </span>
                <span onClick={iniciarNuevoCurso} className="cursor-pointer a-l-c botonNc mr-4" >
                    <FontAwesomeIcon className="" icon={faPlusSquare}/> Crear un nuevo curso
                </span>
                <span onClick={iniciarAbrirBusquedaCursosNoVigentes} className="cursor-pointer a-l-c botonNc mr-4" >
                    <FontAwesomeIcon className="" icon={faSearch}/> Buscar cursos por período / Reutilizar
                </span>
                {<span onClick={iniciarAbrirCreacionRecuperatorios} className="cursor-pointer a-l-c botonNc mr-4" >
                    <FontAwesomeIcon className="" icon={faCopy}/> Crear recuperatorios
                </span>}
               
                {/*<span onClick={iniciarBuscarCursosAlumnosBorrados} className="cursor-pointer a-l-c botonNc mr-4" >
                    <FontAwesomeIcon className="" icon={faEraser}/> Buscar cursos con alumnos eliminados
                </span>*/}
                
                <div className="flex f-col inline-block-1">
                    <span onClick={iniciarImprimirPDFGlobal} className="cursor-pointer a-l-c botonNc mr-4" >
                        <FontAwesomeIcon className="" icon={faFilePdf}/> Imprimir registros
                    </span>

                    {preguntasPDFGlobal && <TipoImpresion cerrarPreguntasPDF={cerrarPreguntasPDFGlobal} 
                                                                        ejecutarImprimirPDF = {imprimirRegistros}
                                                                        modificarDescargar = {setDescargar}
                                                                        descargar = {descargar}
                                                                        />}   
                </div>
                <div className="flex f-col inline-block-1">
                    <span onClick={obtenerMailsCursosSeleccionados} className="cursor-pointer a-l-c botonNc mr-4" >
                        <FontAwesomeIcon className="" icon={faAt}/> Copiar e-mails
                    </span>
                </div>
                <div className="flex f-col inline-block-1  a-l-c botonNc mr-4">
                    <input type="checkbox" className="vertical-align-middle" checked={mostrarCalculos} onClick={handleChangeMostrarCalculos}/>
                    <label className="cursor-pointer ml-2">Mostrar alumnos, disponibilidad y bajas</label>
                </div>

                <span onClick={()=>verEnsambles(true)} className="cursor-pointer a-l-c botonNc mr-4" >
                    <FontAwesomeIcon className="" icon={faEye}/> Analizar Ensambles
                </span>
                {/*<span onClick={verCursosPorDia} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
                    <FontAwesomeIcon className="cursor-copy" icon={faCalendar}/> Ver cronograma
                    </span>*/}
            </div>    
}

function Cabecera_old({cuatrimestreActivo,
    iniciarNuevoCurso,
    refrescarLista,
    iniciarAbrirBusquedaCursosNoVigentes,
    verCursosPorDia}){
return <div className="cableft absolute">
<span className="cabecera">{`Listado de cursos ${cuatrimestreActivo.nombre}`}</span>

<span title="Refrescar la lista" onClick={()=>refrescarLista()} 
        className="cursor-pointer acciones-lista-cabecera botonNc mr-4 ml-6" >
        <FontAwesomeIcon className="color-tomato" icon={faSync}/> Refrescar
</span>

<span onClick={iniciarNuevoCurso} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
    <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo curso
</span>

<span onClick={iniciarAbrirBusquedaCursosNoVigentes} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
    <FontAwesomeIcon className="color-tomato" icon={faSearch}/> Buscar cursos por período / Reutilizar
</span>
{/*<span onClick={verCursosPorDia} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
    <FontAwesomeIcon className="cursor-copy" icon={faCalendar}/> Ver cronograma
    </span>*/}
</div>    
}
function TipoCursos({hayFiltrosActivos,
    limpiarFiltros,
    limpiarCursoRecuperatorio,
    cambiarTipoCurso,
    cambiarCursosRecuperatorios, 
    tipoCurso, 
    cursoRecuperatorio,
    grupalIndividual,
    cambiarGrupalIndividual,
    materia,handleChangeSelectMaterias,materias,
    profesor,handleChangeSelectProfesores,profesores,
    dia,handleChangeSelectDias,dias,
    limpiarGrupalIndividual,limpiarTipoCurso,limpiarMateria,limpiarProfesor,
    limpiarDia,handleChangeSelectBajas,limpiarBaja,opcionesBajasSeleccion,
    opcionBajaSeleccionado,cuatrimestres,cuatrimestreSeleccionado,
    handleChangeSelectCuatrimestres,
    modos,
    modoSeleccionado,
    handleChangeSelectModo,
    limpiarModo,
    aulas,
    aulaSeleccionada,
    handleChangeSelectAula,
    limpiarAula
}){

let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";
    
return (
<div className="flex f-col text-white">
{/*<div className="flex f-col absolute top-50 left-50 zi-100">*/}

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Regular/Mesa Ex.</span>

<div className="flex f-row">
<select title="Curso Regular o Mesa de examen" value={cursoRecuperatorio} 
    className={cursoRecuperatorio=="-1" ? clasesSelect : clasesActivo} 
    onChange={cambiarCursosRecuperatorios}>
    <option value="-1">Todos</option>
    <option value="false">Regulares</option>
    <option value="true">Recuperatorios</option>
</select>
{ cursoRecuperatorio!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarCursoRecuperatorio}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Tipo de curso</span>

<div className="flex f-row">
<select title="Curso Standard, Instrumental o Ensamble" value={tipoCurso} 
    className={tipoCurso=="-1" ? clasesSelect : clasesActivo} 
    onChange={cambiarTipoCurso}>
        <option value="-1">Todos</option>
        <option value="Standard">Standard</option>
        <option value="Instrumental">Instrumental</option>
        <option value="Ensamble">Ensamble</option>
</select>                                
{ tipoCurso!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarTipoCurso}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Individual/Grupal</span>
    <div className="flex f-row">
   
<select title="Curso grupal o individual" value={grupalIndividual} 
    className={grupalIndividual=="-1" ? clasesSelect : clasesActivo}
    onChange={cambiarGrupalIndividual}>
    <option value="-1">Todos</option>
    <option value="1">Grupal</option>
    <option value="0">Individual</option>
</select>
{ grupalIndividual!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarGrupalIndividual}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Materia</span>
<div className="flex f-row">
   
<Seleccionador valor={materia} onchange={handleChangeSelectMaterias} vector = {materias} nombre='Todas'/>
{ materia!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarMateria}/>
                </button>}
</div>

</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Profesor</span>

<div className="flex f-row">
   
<Seleccionador valor={profesor} onchange={handleChangeSelectProfesores} vector = {profesores} nombre='Todos'/>
{ profesor!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarProfesor}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Día</span>

<div className="flex f-row">
   
<Seleccionador valor={dia} onchange={handleChangeSelectDias} vector = {dias} nombre='Todos'/>
{ dia!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarDia}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Bajas</span>

<div className="flex f-row">
   
<Seleccionador valor={opcionBajaSeleccionado} onchange={handleChangeSelectBajas} vector = {opcionesBajasSeleccion} noname={true} nombre='Todos'/>
{ opcionBajaSeleccionado!="Todos" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarBaja}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Modo</span>
    <SeleccionadorX id='select-modo' limpiar={limpiarModo}  vector={modos} valor={modoSeleccionado} onchange={handleChangeSelectModo} nombre='Todos' noname claves={{id:'id',nombre:'nombre'}}/>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Aula</span>
    <SeleccionadorX id='select-modo' limpiar={limpiarAula}  vector={aulas} valor={aulaSeleccionada} onchange={handleChangeSelectAula} nombre='Todas'/>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left">Cuatrimestre</span>
    <SeleccionadorX id='select-cuatrimestres' vector={cuatrimestres} valor={cuatrimestreSeleccionado} onchange={handleChangeSelectCuatrimestres} noDefault noname claves={{id:'id_cuatrimestre',nombre:'nombre'}}/>
</div>

{hayFiltrosActivos && <a onClick={limpiarFiltros} title="Limpiar todos los filtros" className="cursor-pointer mt-2 mr-2 ml-2">
<FontAwesomeIcon className="color-tomato" icon={faTrash}/><span className="text-small">Limpiar filtros</span>
</a> }
</div>

)

}

function TipoCursos_old({hayFiltrosActivos,
                    limpiarFiltros,
                    limpiarCursoRecuperatorio,
                    cambiarTipoCurso,
                    cambiarCursosRecuperatorios, 
                    tipoCurso, 
                    cursoRecuperatorio,
                    grupalIndividual,
                    cambiarGrupalIndividual,
                    materia,handleChangeSelectMaterias,materias,
                    profesor,handleChangeSelectProfesores,profesores,
                    dia,handleChangeSelectDias,dias}){
    return (
        <div className="flex f-row selecTipoCurso">

            <span title="Curso Regular o Mesa de examen" className="tipo-curso mr-4 ml-4 mt-3px hidden">R/ME</span>

        <div className="flex f-row">
             { cursoRecuperatorio!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={limpiarCursoRecuperatorio}/>
                                </button>}
                <select title="Curso Regular o Mesa de examen" value={cursoRecuperatorio} 
                    className="ml-4 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarCursosRecuperatorios}>
                    <option value="-1">R/ME</option>
                    <option value="false">Regulares</option>
                    <option value="true">Recuperatorios</option>
                </select>
        </div>


            <span title="Curso Standard, Instrumental o Ensamble" className="tipo-curso mr-4 ml-4 mt-3px hidden">Tipo</span>

            <div className="flex f-row">
                    { tipoCurso!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <select title="Curso Standard, Instrumental o Ensamble" value={tipoCurso} 
                    className="ml-2 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarTipoCurso}>
                        <option value="-1">Tipo de curso</option>
                        <option value="Standard">Standard</option>
                        <option value="Instrumental">Instrumental</option>
                        <option value="Ensamble">Ensamble</option>
                </select>                                
            </div>

            <div className="flex f-row">
                    { grupalIndividual!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <select title="Curso grupal o individual" value={grupalIndividual} 
                    className="ml-2 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarGrupalIndividual}>
                    <option value="-1">G/I</option>
                    <option value="1">Grupal</option>
                    <option value="0">Individual</option>
                </select>
            </div>

            <div className="flex f-row">
                    { materia!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <Seleccionador valor={materia} onchange={handleChangeSelectMaterias} vector = {materias} nombre='Materia'/>
            </div>

            <div className="flex f-row">
                    { profesor!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <Seleccionador valor={profesor} onchange={handleChangeSelectProfesores} vector = {profesores} nombre='Profesor'/>
            </div>

            <div className="flex f-row">
                    { dia!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <Seleccionador valor={dia} onchange={handleChangeSelectDias} vector = {dias} nombre='Día'/>
            </div>
            {hayFiltrosActivos && <a onClick={limpiarFiltros} title="Limpiar todos los filtros" className="cursor-pointer mt-2 mr-2 ml-2 color-63">
                <FontAwesomeIcon className="color-tomato" icon={faTrash}/>
            </a> }
        </div>

    )
    
}

function listarUltimoCursosCreados(cursos,setUltimosCursosCreados){
    const cursos_filtrados = cursos.map(item=>{return {id:item.nro_curso,
                                                       materia:item.campo_auxiliar,
                                                       profesor:item.nombre,
                                                       fecha:item.columna}}).sort((a,b)=> b.id - a.id).slice(0,10)
    setUltimosCursosCreados(cursos_filtrados)
}

function ListaUltimosCursos({cursos}){
    
    
    return(<div className="contenedor-uc"> Ultimos cursos creados
        {
            cursos.map(item=>{
                return (
                <Link  key={`ult-cur${item.id}`} className="text-black" 
                                to={{
                                    pathname: `/curso/${item.id}`                                }}> 
                <span className="ultimos-cursos" title={`${item.materia}\n${item.profesor}\nCreado el ${item.fecha}`}>{item.id}</span>
                            </Link> 
            )
                })
        }
    </div>

    )
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

function definirValoresPaginacion(vector,inicial,final,setinicial,setfinal,anchoPaginacion,paginacion){

    const longitud = vector.length;

        if (paginacion){
            setinicial(paginacion.ini);
            setfinal(paginacion.fin)
        }
        else if (longitud>anchoPaginacion){
            setinicial(0);
            setfinal(anchoPaginacion-1)
        }else{
            setinicial(0);
            setfinal(longitud-1)
        }

}

function recordarPaginacion(setinicial,setfinal,parametrosVistaCursos){

    console.log('parametrosVistaCursos',parametrosVistaCursos)
    if(parametrosVistaCursos){
        setinicial(parametrosVistaCursos.iIni);
        setfinal(parametrosVistaCursos.iFin)
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

function Alumno({}){
    return <div className="ap-2">
    spacer goes here
 </div>
 
 
}

const traerConfiguracion = ()=>{
    const configuracion = localStorage.getItem('conf-cs')

    if (!configuracion){
        localStorage.setItem('conf-cs',JSON.stringify({calculos:true}))
        return true
    }else{
        const conf_aux = JSON.parse(configuracion)
        return conf_aux.calculos
    }
}