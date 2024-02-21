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
import {sumarMinutos} from '../Helpers/fechas';

export default function AbmCurso({nro_curso, 
                                  cuatrimestreActivo, 
                                  cursoCopiado, 
                                  finalizarAltaOcopia, 
                                  esModal,
                                  mainSinClases,
                                extraClasses}){
    const regimenDefault = [{id_regimen:-1, NombreRegimen:"Seleccionar encabezado"}]

    const [cargandoDatosTablasGenerales,setCargandoTablasGenerales] = useState(false);
    const [cargandoRegimenes,setCargandoRegimenes] = useState(false);
    const [cargandoDatosCurso,setCargandoDatosCurso] = useState(false);
    const [grabandoDatosCurso,setGrabandoDatosCurso] = useState(false);
    const [materias,setMaterias] = useState([]);
    const [profesores,setProfesores] = useState([]);
    const [dias,setDias] = useState([]);
    const [tiposcursos,setTiposCursos] = useState([]);
    const [cuatrimestres,setCuatrimestres] = useState([]);
    const [nivelesi,setNivelesI] = useState([]);
    const [nivelese,setNivelesE] = useState([]);
    const [encabezados,setEncabezados] = useState([]);
    const [regimenes,setRegimenes] = useState(regimenDefault); // lo usarmos para cargar el select de regimenes cada vez que cambia el encabezado y se completa en base al vectorRegimenes que ya tienen todos los regimenes sin necesidad de ir a buscar al servidor por encabezado
    const [vectorRegimenes,setVectorRegimenes]= useState([]); // se usará para traer 1 sola vez todos los regímenes y trabajar sobre el mismo con filter cada vez que se cambie el encabezado así evitamos ir N veces al servidor
    const [aulas,setAulas] = useState([]);
    const [materiaSeleccionada,setMateriaSeleccionada] = useState(-1);
    const [profesorSeleccionado,setProfesorSeleccionado] = useState(-1);
    const [tipoCursoSeleccionado,setTipoCursoSeleccionado] = useState(-1);
    const [cuatrimestreSeleccionado,setCuatrimestreSeleccionado] = useState(-1);
    const [nivelEnsambleSeleccionado,setNivelEnsambleSeleccionado] = useState(-1);
    const [nivelInstrumentalSeleccionado,setNivelInstrumentalSeleccionado] = useState(-1);
    const [encabezadoSeleccionado,setEncabezadoSeleccionado] = useState(-1);
    const [aulaSeleccionada,setAulaSeleccionada] = useState(-1);
    const [regimenSeleccionado,setRegimenSeleccionado] = useState(-1);
    const [diaSeleccionado,setDiaSeleccionado] = useState(-1);
    const [horasInicio, setHorasInicio] = useState([]);
    const [horasFin, setHorasFin]=useState([]);
    const [minutosInicio, setMinutosInicio] = useState([]);
    const [minutosFin, setMinutosFin]=useState([]);
    const [horaInicioSeleccionada, setHoraInicioSeleccionada]=useState('09');
    const [horaFinSeleccionada, setHoraFinSeleccionada]=useState('10');
    const [minutoInicioSeleccionado, setMinutoInicioSeleccionado]=useState('00');
    const [minutoFinSeleccionado, setMinutoFinSeleccionado]=useState('30');
    const [subdivisionIntervalos, setsubdivisionIntervalos]=useState(false);
    const [recuperatorio, setRecuperatorio]=useState(false);
    const [capacidad, setCapacidad]=useState("1");
    const [capacidades, setCapacidades]=useState([]);
    const [capacidadDeshabilitada,setCapacidadDeshabilitada]=useState(false);
    const textoSubdividir = `Subdividir el curso \n
    en intervalos de 30 minutos`;
    const [tablasCargadas,setTablasCargadas]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [erroresIniciales, setErroresIniciales]=useState(null);
    const [camposConErroresIniciales, setCamposConErroresIniciales]=useState(null);
    const [descripcionProfMat,setDescripcionProfMat] = useState({profesor:null,materia:null})                                 
    useEffect(()=>{

        const cargarDatosCurso = async ()=>{
            setCargandoTablasGenerales(true);
        
            try{
                const vectorResultado = await Promise.all([
                    Axios.get('/api/tablasgenerales/materias'),
                    Axios.get('/api/tablasgenerales/profesores'),
                    Axios.get('/api/tablasgenerales/dias'),
                    Axios.get('/api/tablasgenerales/tiposcursos'),
                    Axios.get('/api/tablasgenerales/cuatrimestres'),
                    Axios.get('/api/tablasgenerales/nivelesi'),
                    Axios.get('/api/tablasgenerales/nivelese'),
                    Axios.get('/api/tablasgenerales/encabezados'),
                    Axios.get('/api/tablasgenerales/aulas'),
                    Axios.get('/api/tablasgenerales/regimenesall')
                ])

               
                if (vectorResultado[0].data.length>0){ // traigo todas las materias pero muestro solo las activas para que no se pueda seleccionar una materia no activa
                    setMaterias(vectorResultado[0].data.filter(item=>item.activa==1));
                }
                if (vectorResultado[1].data.length>0){ // traigo todos los profesores pero muestro solo los activos para que no se pueda seleccionar un profesor no activo
                    setProfesores(vectorResultado[1].data.filter(item=>item.activo==1));
                }
                setDias(vectorResultado[2].data);
                setTiposCursos(vectorResultado[3].data);
                setCuatrimestres(vectorResultado[4].data);
                setNivelesI(vectorResultado[5].data);
                setNivelesE(vectorResultado[6].data);
                setEncabezados(vectorResultado[7].data);
                setAulas(vectorResultado[8].data);
                setHorasFin(cargarVectorHoras())
                setHorasInicio(cargarVectorHoras())
                setMinutosFin(cargarVectorMinutos())
                setMinutosInicio(cargarVectorMinutos())
                setCapacidades(cargarCapacidades())

                setVectorRegimenes(vectorResultado[9].data);
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

            cargarDatosCurso()

     },[nro_curso])

useEffect(()=>{

    const completarDatosDelCurso = async (id)=>{   
        setCargandoDatosCurso(true)
        try{
            
                const {data} = await Axios.get(`/api/cursos/curso/abm/${id}`)

                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para el curso ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatosCurso(false)
                    setHuboError(true)
                    return
                }

                setTipoCursoSeleccionado(data.id_tipo_curso)
                setCuatrimestreSeleccionado(data.id_cuatrimestre)
                setNivelEnsambleSeleccionado(data.id_nivel_ensamble)
                setNivelInstrumentalSeleccionado(data.id_nivel_instrumental)
                setEncabezadoSeleccionado(data.id_encabezado)
                setAulaSeleccionada(data.id_aula)
                setDiaSeleccionado(data.id_dia)
                setCapacidad(data.cant_max)
                setRecuperatorio(data.mesa_examen)
                setsubdivisionIntervalos(data.grupal ? false : true )

                // traigo la descripcion de la materia y el curso por si acaso el profesor o la materia estan inactivas.
                // no van a mostrarse en los combos para poder seleccionarse pero si voy a mostrar la descripción como información
                const resultadoDescripciones = (cargarDescripcion(data,materias,profesores))
                
                setDescripcionProfMat(resultadoDescripciones)
                // uso una variable y no la propiedad descripcionProfMat del state porque es asincronico y necesito saber inmediatamente el resultado para hacer las asignaciones correspondientes de profesor y materia

                if (resultadoDescripciones.materia){ // si se cumple esta condición significa que la funcion cargarDescripcion detecto que es una materia inactiva entonces muestro su descripcion en el formulario pero llevo a -1 el select de materias para que se seleccione una
                    setMateriaSeleccionada(-1)
                }else{
                    setMateriaSeleccionada(data.id_materia)
                }

                if (resultadoDescripciones.profesor){ // si se cumple esta condición significa que la funcion cargarDescripcion detecto que es un profesor inactivo entonces muestro su descripcion en el formulario pero llevo a -1 el select de profesores para que se seleccione uno                    setProfesorSeleccionado(-1)
                    setProfesorSeleccionado(-1)
                }else{
                    setProfesorSeleccionado(data.id_prof)
                }

                if (data.grupal){
                    setCapacidadDeshabilitada(false)
                }else{
                    setCapacidadDeshabilitada(true)
                }
                const h_desde = data.h_desde.slice(11,13)
                const h_hasta = data.h_hasta.slice(11,13)
                const min_desde = data.h_desde.slice(14,16)
                const min_hasta = data.h_hasta.slice(14,16)

                setHoraInicioSeleccionada(h_desde)
                setHoraFinSeleccionada(h_hasta)
                setMinutoInicioSeleccionado(min_desde)
                setMinutoFinSeleccionado(min_hasta)

                setCargandoDatosCurso(false)

                return data // retorno un valor para que pueda hacerse algo en el .then ya que al ser async devuelva una promesa
            }catch(err){

                console.log(err)
                const mensaje_html = `<p>La busqueda de datos del curso falló</p><p>${err.response.data.message}</p>`

                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
            
                setCargandoDatosCurso(false)
                setHuboError(true)
            }

    }

    if (tablasCargadas ){ // este useEffect se dispara solo si ya se cargaron las tablas generales

        if (nro_curso){ //  si se recibió el nùmero de curso por propiedad es decir si es una modificación
            
            setTituloAbm(`Editar el curso #${nro_curso}`)

            completarDatosDelCurso(nro_curso) // busco el curso, asigno los datos y luego cargo los regimenes ya que dependen del id de cabecera
            .then(data=> // como la función async me devuelve una promesa puedo ejecutar en el .then lo que deseo que se haga luego que se haya completado la funcion completarDatosDelCurso que en este caso necesito que busque los regímenes correspondientes al encabezado y que luego le asigne el valor a la propiedad regimenSeleccionado
                {
                    const regimenesPorEncabezado = vectorRegimenes.filter(item=>item.id_encabezado===data.id_encabezado)
                    setRegimenes(regimenesPorEncabezado)
                    const verificar = regimenesPorEncabezado.some(item=>item.id_regimen == data.id_regimen)
                    // verificamos que el id_regimen que viene de la tabla de cursos exista dentro de los regímenes relacionados con el encabezado
                    // encontramos casos en que no existe (tal vez se haya borrado algún regímen)
                    // si hay coincidencia lo asignamos como regimen de este curso, pero si no existe mostramos el error agregando un item que deje en evidencia el problema
                    
                    if (!verificar){
                        const regimenes_aux = [...regimenesPorEncabezado,
                                                {id_encabezado:data.id_encabezado, 
                                                id_regimen:-1, 
                                                nombre:`Error. No existe el regimen ${data.id_regimen}`}
                                              ]
                        setRegimenes(regimenes_aux)
                        setRegimenSeleccionado(-1)

                        // para que se muestre el error en el formulario se proveen los objetos
                        // initialErrors y initialTouched como propiedades de Formik
                        setErroresIniciales({regimen:`El régimen ${data.id_regimen} es inválido`})                      
                        setCamposConErroresIniciales({regimen:true})      
                    }else{
                        setRegimenSeleccionado(data.id_regimen)
                    }

                    if (data.dif_horario<0){
                        setErroresIniciales({...erroresIniciales,horai:'La hora de inicio debe ser anterrior a la hora de fin'})                      
                        setCamposConErroresIniciales({...camposConErroresIniciales,horai:true})  
                    }


                }
            ).catch(err=>
                console.log('Error al completar los datos del curso ',err.response.data.message)
            )
        }
        else if(cursoCopiado){
            setTituloAbm(`Curso #${cursoCopiado}`)

            completarDatosDelCurso(cursoCopiado) // busco el curso, asigno los datos y luego cargo los regimenes ya que dependen del id de cabecera
            .then(data=> // como la función async me devuelve una promesa puedo ejecutar en el .then lo que deseo que se haga luego que se haya completado la funcion completarDatosDelCurso que en este caso necesito que busque los regímenes correspondientes al encabezado y que luego le asigne el valor a la propiedad regimenSeleccionado
                {
                    const regimenesPorEncabezado = vectorRegimenes.filter(item=>item.id_encabezado===data.id_encabezado)
                    setRegimenes(regimenesPorEncabezado)
                    setRegimenSeleccionado(data.id_regimen)
                    setCuatrimestres([cuatrimestreActivo]) // solo permito que se copie un curso al cuatrimestre vigente
                    setCuatrimestreSeleccionado(cuatrimestreActivo.id_cuatrimestre)
                    hacerScroll("nuevo-curso")
                }
            ).catch(err=>
                console.log('Error al completar los datos del curso a copiar',err.response.data.message)
            )
        }
        else{ //  si no recibió el nùmero de curso por propiedad, es decir un alta
            setTituloAbm(`Crear un nuevo curso`)
            // inicio 06/08/2021 cuando es un alta permito que se grabe en el cuatrimestre activo o superior porque a veces crean el cuatrimestre nuevo de un periodo siguiente y necesitan comenzar a crear cursos de un cuat no activo
            // setCuatrimestres([cuatrimestreActivo])
            //05/03/2022 Aunque sea un alta dejo que se grabe en cualquier cuatrimestre el nuevo curso Comento el filter
            // setCuatrimestres(cuatrimestres.filter(item=>item.id_cuatrimestre>=cuatrimestreActivo.id_cuatrimestre))
            // fin
             setCuatrimestreSeleccionado(cuatrimestreActivo.id_cuatrimestre)
            hacerScroll("nuevo-curso")
        }
    }

},[tablasCargadas,nro_curso,cursoCopiado])     
  
const grabarCurso = async (values)=>{

    let resultado;

    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const diaString = dias.filter(item=>item.id_dia==values.dia)[0].nombre

    const objetoCurso = {materia: Number(values.materia),
                         profesor: Number(values.profesor),
                         tipoCurso:Number(values.tipoCurso),
                         cuatrimestre:Number(values.cuatrimestre),
                         /*nivelE:Number(values.nivelE),
                         nivelI:Number(values.nivelI),*/
                         // se pidio quitar nivel e y nivel i de la creación del curso
                         // No lo eliminamos sino que simplemente ocultamos los campos y seteamos en cero aqui
                         // para conservar la integridad del proceso y por si en el futuro quieren volver a tener estos 2 datos
                         nivelE:0, // nivel ensamble no lo usamos mas. 
                         nivelI:0, // nivel instrumental no lo usamos mas
                         // ATENCION : cuando quitamos un elemento del formulario formik
                         // como en este caso que comentamos los campos Nivel I y Nivel E
                         // también lo tenemos que comentar en el objeto de validación yup
                         // si no va a fallar y no muestra ningún tipo de error
                         encabezado:Number(values.encabezado),
                         regimen:Number(values.regimen),
                         aula:Number(values.aula),
                         dia:Number(values.dia),
                         capacidad:Number(values.capacidad),
                         recuperatorio:values.recuperatorio,
                         subdivisioni:values.subdivisioni===0 || values.subdivisioni===false ? false : true,
                         horai:values.horai,
                         minutoi:values.minutoi,
                         horaf:values.horaf,
                         minutof:values.minutof,
                         diaString: diaString
                          }

    setGrabandoDatosCurso(true)

    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`

    try{
        if (nro_curso){
            resultado= await Axios.put(`/api/cursos/${nro_curso}`,objetoCurso)
        }else{
            resultado= await Axios.post(`/api/cursos`,objetoCurso)
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nuevo curso #${resultado.data.nro_curso})</p>`
        }

        finalizarAltaOcopia(true); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso


        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
        setGrabandoDatosCurso(false)
    }catch(err){
        console.log(err.response)
        const mensaje_html = `<p>Se produjo un error al grabar los datos del curso</p><p>${err.response.data.message}</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatosCurso(false)
    }
   

}

const cancelarAbm = ()=>{
    if (!nro_curso){ // solo cancelo si es un alta o una copia ya que se hacen en la vista de cursos. La edición de un curso se hace en la vista de curso y siempre lo muestro
        finalizarAltaOcopia(false)
    }
}

const iniciarGrabarCurso = (values)=>{
    let texto;
    let textoConfirmacion;

    if (nro_curso){
        texto = `Confirma la modificación del curso ${nro_curso}?`
        textoConfirmacion = 'Si, modificar el curso'
    }else{
        texto = `Confirma la creación del nuevo curso?`
        textoConfirmacion = 'Si, crear el curso'
    }

    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                grabarCurso(values);

            }else{
                console.log("Se canceló la modificación o creación del curso")
            }
        }
    )
}
const handleMateriaChange = (e,valoresFormulario,setFieldValue)=>{
    const materia = materias.filter(item=>item.id_materia==e.target.value)
    const id_encabezado = materia[0].id_encabezado;
    const id_regimen = materia[0].id_regimen;
    const individual = materia[0].Es_Individual;
    const capacidad = materia[0].cant_max;

    if (materia.length>0){
        setFieldValue('encabezado',id_encabezado)
        
        const data = vectorRegimenes.filter(item=>item.id_encabezado==id_encabezado)

        setRegimenes(data)

        if (id_regimen){
            setFieldValue('regimen',id_regimen)
        }

        setFieldValue('subdivisioni',individual)

        if (individual){
            setCapacidadDeshabilitada(true)
            let intervalos = calcularCantIntervalos30minutos(valoresFormulario.horai,
                valoresFormulario.minutoi,
                valoresFormulario.horaf,
                valoresFormulario.minutof)

            const capacidadBackup = valoresFormulario.capacidad;

            setFieldValue('capacidadBackup',capacidadBackup)
            setFieldValue('capacidad',intervalos)

        }else{
            setCapacidadDeshabilitada(false)
            setFieldValue('capacidad',capacidad)
        }
    }

}

const handleProfesorChange = (e)=>{
    setProfesorSeleccionado(e.target.value)
}

const handleTipoCursoChange = (e)=>{
    setTipoCursoSeleccionado(e.target.value)
}

const handleCuatrimestreChange = (e)=>{
    setCuatrimestreSeleccionado(e.target.value)
}

const handleNivelEChange = (e)=>{
    setNivelEnsambleSeleccionado(e.target.value)
}

const handleNivelIChange = (e)=>{
    setNivelInstrumentalSeleccionado(e.target.value)
}

const handleEncabezadoChange = (e)=>{
    setEncabezadoSeleccionado(e.target.value)
}

const handleAulaChange = (e)=>{
    setAulaSeleccionada(e.target.value)
}

const handleRegimenChange = (e)=>{
    setRegimenSeleccionado(e.target.value)
}

const handleDiaChange = (e)=>{
    setDiaSeleccionado(e.target.value)
}

const handleHoraInicioChange = (e,valoresFormulario,setFieldValue)=>{

    // cada vez que cambia la hora o minuto de inicio calculo automaticamente
    // la hora/minuto fin sumando 90 minutos
    const nuevaHoraMinutos = sumarMinutos(e.target.value,valoresFormulario.minutoi,90)
    const nuevaHoraf = nuevaHoraMinutos.substring(0,2)
    const nuevoMinutof = nuevaHoraMinutos.substring(3,5)

//e.target.value lo envío a calcularCantIntervalos30minutos para que tome la nueva hora inicio
// si no toma el anterior para calcular porque todavía no hizo el change
    let intervalos = calcularCantIntervalos30minutos(e.target.value,
                                                    valoresFormulario.minutoi,
                                                    nuevaHoraf,
                                                    nuevoMinutof)

  /*  let intervalos = calcularCantIntervalos30minutos(e.target.value,
        valoresFormulario.minutoi,
        valoresFormulario.horaf,
        valoresFormulario.minutof)*/

   // Agrego esta actualización del campo para forzar una validación inmediata
   // de otra forma no se valida en el onchange sino solo en el submit
    setTimeout(() => {
        setFieldValue('horai',e.target.value)
        setFieldValue('horaf',nuevaHoraf)
        setFieldValue('minutof',nuevoMinutof)
    }, 200);  

    if(valoresFormulario.subdivisioni){
        setFieldValue('capacidad',intervalos)
    }
    diferencia(valoresFormulario)
}

const handleMinutoInicioChange = (e,valoresFormulario,setFieldValue)=>{

    // cada vez que cambia la hora o minuto de inicio calculo automaticamente
    // la hora/minuto fin sumando 90 minutos
    // solo en el caso en que no sea un curso individual
    const nuevaHoraMinutos = sumarMinutos(valoresFormulario.horai,e.target.value,90)
    const nuevaHoraf = nuevaHoraMinutos.substring(0,2)
    const nuevoMinutof = nuevaHoraMinutos.substring(3,5)

//e.target.value lo envío a calcularCantIntervalos30minutos para que tome el nuevo minuto inicio
// si no toma el anterior para calcular porque todavía no hizo el change

    let intervalos = calcularCantIntervalos30minutos(valoresFormulario.horai,
                                                    e.target.value,
                                                    nuevaHoraf,
                                                    nuevoMinutof)
   
   // Agrego esta actualización del campo para forzar una validación inmediata
   // de otra forma no se valida en el onchange sino solo en el submit

    setTimeout(() => {
        setFieldValue('minutoi',e.target.value)
        setFieldValue('horaf',nuevaHoraf)
        setFieldValue('minutof',nuevoMinutof) 
    }, 200);                                      

    if(valoresFormulario.subdivisioni){
        setFieldValue('capacidad',intervalos)
    }

    diferencia(valoresFormulario)


}

const handleHoraFinChange = (e,valoresFormulario,setFieldValue)=>{
//e.target.value lo envío a calcularCantIntervalos30minutos para que tome la nueva hora fin
// si no toma el anterior para calcular porque todavía no hizo el change

    let intervalos = calcularCantIntervalos30minutos(valoresFormulario.horai,
                                                     valoresFormulario.minutoi,
                                                     e.target.value,
                                                     valoresFormulario.minutof)
   // Agrego esta actualización del campo para forzar una validación inmediata
   // de otra forma no se valida en el onchange sino solo en el submit

    setTimeout(() => {
        setFieldValue('horaf',e.target.value)
    }, 200);  

    if(valoresFormulario.subdivisioni){
        setFieldValue('capacidad',intervalos)
    }

    diferencia(valoresFormulario)

}

const handleMinutoFinChange = (e,valoresFormulario,setFieldValue)=>{
//e.target.value lo envío a calcularCantIntervalos30minutos para que tome el nuevo minuto fin
// si no toma el anterior para calcular porque todavía no hizo el change

        let intervalos = calcularCantIntervalos30minutos(valoresFormulario.horai,
                                                     valoresFormulario.minutoi,
                                                     valoresFormulario.horaf,
                                                     e.target.value)

   // Agrego esta actualización del campo para forzar una validación inmediata
   // de otra forma no se valida en el onchange sino solo en el submit
                                                        
        setTimeout(() => {
            setFieldValue('minutof',e.target.value)
        }, 200);                                                       
        
        if(valoresFormulario.subdivisioni){
            setFieldValue('capacidad',intervalos)
        }
                                    
        diferencia(valoresFormulario)

}

const handleSubdivisionChange = (e,valoresFormulario,setFieldValue)=>{
  
    let intervalos = calcularCantIntervalos30minutos(valoresFormulario.horai,valoresFormulario.minutoi,valoresFormulario.horaf,valoresFormulario.minutof)
    
    if (e.target.checked){
        setCapacidadDeshabilitada(true)

        const capacidadBackup = valoresFormulario.capacidad;

        setFieldValue('capacidadBackup',capacidadBackup)
        setFieldValue('capacidad',intervalos)

        Swal.fire({
            text: 'Si subdivide en intervalos de 30 minutos la capacidad se calculará automáticamente en función de la hora de inicio y fin seleccionadas'
        })

    }else{

        const capacidadBackup = valoresFormulario.capacidadBackup;

        setCapacidadDeshabilitada(false)
        setFieldValue('capacidad',capacidadBackup)
    }
}

const handleRecuperatorioChange = (e)=>{
    setRecuperatorio(e.target.value)
}

const handleCapacidadChange = (e)=>{
    setCapacidad(e.target.value)
}

const buscarRegimenes = (e,setFieldValue)=>{

    const encabezado = e.target.value

    setCargandoRegimenes(true); 

    let id_regimen;

        //atención e.target.value siempre es un string.
        // por eso aquì en este caso uso doble igual en lugar de triple igual porque item.id_encabezado es un number y encabezado es un string
    const data = vectorRegimenes.filter(item=>item.id_encabezado==encabezado)

    if (data.length===1){
        id_regimen=data[0].id_regimen;

        setRegimenes(data)
        setFieldValue('regimen',id_regimen)
    }else if (data.length>1) {
        setRegimenes([{id_regimen:-1, nombre:"Seleccionar"},...data])
        setFieldValue('regimen',-1)
    }else{
        setRegimenes([{id_regimen:-2, nombre:"----?----"}])
        setFieldValue('regimen',-2)
    }

    setCargandoRegimenes(false); 

}

const handleSubmit = (e)=>{
    e.preventDefault()
    alert("grabar")
}


const initialValuesCurso = {
    materia:materiaSeleccionada,
    profesor:profesorSeleccionado,
    tipoCurso:tipoCursoSeleccionado,
    cuatrimestre:cuatrimestreSeleccionado,
    nivelE:nivelEnsambleSeleccionado,
    nivelI:nivelInstrumentalSeleccionado,
    encabezado:encabezadoSeleccionado,
    regimen:regimenSeleccionado,
    aula:aulaSeleccionada,
    dia:diaSeleccionado,
    capacidad:capacidad,
    recuperatorio: recuperatorio,
    subdivisioni: subdivisionIntervalos,
    horai:horaInicioSeleccionada,
    minutoi:minutoInicioSeleccionado,
    horaf:horaFinSeleccionada,
    minutof:minutoFinSeleccionado,
    capacidadBackup:1
} // es un objeto cuyas propiedades deben coincidir con el nombre
                              // de los Fields y con el nombre del validationSchema

// algunas entidades comienzan de 1 y otras aceptan el valor 0 por eso
// en algunos casos valido con .positive() para los que comienzan de 1, porque positive() excluye el cero
// en otros valido con min(0) para los que comienzan de 0                              
// el .test lo dejo como ejemplo para notar que se pueden hacer validaciones más específicas

const validationSchemaCurso = Yup.object({
materia:Yup.number().
    positive('Falta seleccionar una materia')
    .required('Falta seleccionar una materia')
    .test("prueba","El código de materia debe ser mayor a cero",value => value > 0),

profesor:Yup.number().
    positive('Falta seleccionar un profesor')
    .required('Falta seleccionar un profesor')
    .test("prueba","El código del profesor debe ser mayor a cero",value => value > 0),
tipoCurso:Yup.number().min(0,"Falta seleccionar el tipo de curso").max(5,"No puede exceder 5")
    .required('Falta seleccionar un tipo de curso')
    .test("prueba","El código de tipo de curso debe ser mayor a cero",value => value >= 0),
cuatrimestre:Yup.number().
    positive('Falta seleccionar un cuatrimestre')
    .required('Falta seleccionar un cuatrimestre')
    .test("prueba","El código de cuatrimestre debe ser mayor a cero",value => value > 0), 
 // ATENCION : cuando quitamos un elemento del formulario formik
                         // como en este caso que comentamos los campos Nivel I y Nivel E
                         // también lo tenemos que comentar en el objeto de validación yup
/*
nivelE:Yup.number()
    .min(0,"Falta seleccionar el nivel ensamble")
    .required('Falta seleccionar el nivel ensamble')
    .test("prueba","El código nivel ensamble debe ser mayor a cero",value => value >= 0), 
nivelI:Yup.number()
    .min(0,"Falta seleccionar el nivel instrumental")
    .required('Falta seleccionar el nivel instrumental')
    .test("prueba","El código del nivel instrumental debe ser mayor a cero",value => value >=0 ), 
*/
encabezado:Yup.number()
    .positive('Falta seleccionar un encabezado')
    .required('Falta seleccionar un encabezado')
    .test("prueba","El código de encabezado debe ser mayor a cero",value => value > 0),
regimen:Yup.number()
    .positive('Falta seleccionar un régimen')
    .required('Falta seleccionar un régimen')
    .test("prueba","El código de régimen debe ser mayor a cero",value => value > 0),
aula:Yup.number()
    .positive('Falta seleccionar el aula')
    .required('Falta seleccionar el aula')
    .test("prueba","El código de aula debe ser mayor a cero",value => value > 0),
dia:Yup.number()
    .positive('Falta seleccionar el día de cursada')
    .required('Falta seleccionar el día de cursada')
    .test("prueba","El código de día debe ser mayor a cero",value => value > 0),
minutoi:Yup.string().test('testmin','La hora de fin debe ser anterior a la hora de inicio',function(val){
    const {horai, horaf, minutof} = this.parent;
    return diferencia(horai, horaf, val, minutof) 
}),    
horai:Yup.string().test('testhora','La hora de fin debe ser anterior a la hora de inicio',function(val){
    const {horaf, minutoi,minutof} = this.parent;
    return diferencia(val, horaf, minutoi, minutof) 
}),    
validacionHoras:Yup.boolean().test('match', 
'La hora de fin debe ser anterior a la hora de inicio', 
    function(val) { 
       const {horai, horaf, minutoi, minutof} = this.parent;

        return diferencia(horai, horaf, minutoi, minutof) 
    })                                              
})                 

const onsubmitCurso = values =>{
    iniciarGrabarCurso(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatosTablasGenerales){
        return <Main center><div><Loading/><span className="cargando">Cargando datos generales...</span></div></Main>
    };

    return (
        <Main eliminarClases= {mainSinClases ? mainSinClases : false}> 
        {grabandoDatosCurso && <Main center><div><Loading/><span className="cargando">Grabando datos...</span></div></Main>}    
        <div className={grabandoDatosCurso ? "hidden" : "p-4 rounded relative"}>
            <div><div>
                {/*el botòn de cancelar solo lo habilito cuando es un alta o copia*/}
                <Formik validateOnMount
                enableReinitialize initialValues={initialValuesCurso}
                initialErrors={erroresIniciales} initialTouched={camposConErroresIniciales}
    validationSchema={validationSchemaCurso} onSubmit={onsubmitCurso} onSubmitTest={()=>alert(1)}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty,initialErrors,initialTouched }) =>{ 
    return (
        <fieldset disabled={cursoCopiado ? true : false}> {/*Fieldset lo uso para envolver el form y deshabilitarlo cuando lo muestro en la vista Listado de cursos por cuatrimestre / Reutilización de cursos, no permito editarlo allí, entonces lo envuelvo en el fieldset y lo deshabilito*/}
    <Form>
    <div className={extraClasses ? `${extraClasses} AnaliticoContainer relative` :"AnaliticoContainer relative"}>
            <div className="FormAnaliticoContainer relative">
            <div className="mb-2 titulo-cab-modal titulo-abm flex f-row relative">
                <span>{tituloAbm}</span>
                {!esModal && <span onClick={cancelarAbm} title="Cancelar" className="absolute botonAbm cursor-pointer text-black"><FontAwesomeIcon icon={faWindowClose}/></span> }
            </div>
            { cargandoDatosCurso && <div><Loading/> <span className="cargando">Cargando datos del curso...</span></div>}
            <div className="flex f-col">
            {nro_curso && dirty && 
                <span type="button" title="Restaurar valores iniciales" 
                    className="cursor-pointer absolute botonRestaurar boton-restaurar-abm-form" 
                    onClick={() => resetForm(initialValues)}>Restaurar
                </span>
            }
            {(descripcionProfMat.materia || descripcionProfMat.profesor) && 
                <div className="mb-2 text-small">
                    {descripcionProfMat.materia &&
                            <span title="Seleccione otra materia o active la misma" className="text-right inline-block-1 color-tomato">{descripcionProfMat.materia}</span>
                        }
                    {descripcionProfMat.profesor && 
                        <span title="Seleccione otro profesor o active el mismo" className="text-right inline-block-1 color-tomato">{descripcionProfMat.profesor}</span>
                    }   
                </div>}
           

                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-materia">Materia</label>
                    <select onChange={(e)=>{handleChange(e);handleMateriaChange(e,values,setFieldValue)}} value={values.materia} name="materia" className="w-selabm" id="abm-curso-materia">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                materias.map(item=>
                                    <option key={`abmcurso-materias${item.id_materia}`} 
                                        value={item.id_materia}>{item.descripcion}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="materia"/></div> 
            </div>  

            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-profesor">Profesor</label>
                    <select onChange={handleChange} value={values.profesor} name="profesor" className="w-selabm" id="abm-curso-profesor">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                profesores.map(item=>
                                    <option key={`abmcurso-profes${item.id_prof}`} 
                                        value={item.id_prof}>{item.descripcion}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="profesor"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-tipocurso">Tipo de curso</label>
                    <select onChange={handleChange} value={values.tipoCurso} name="tipoCurso" className="w-selabm" id="abm-curso-tipocurso">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                tiposcursos.map(item=>
                                    <option key={`abmcurso-tipo-curso${item.id_tipo_curso}`} 
                                        value={item.id_tipo_curso}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="tipoCurso"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-cuatrimestre">Cuatrimestre</label>
                    <select onChange={handleChange} value={values.cuatrimestre} name="cuatrimestre" className="w-selabm" id="abm-curso-cuatrimestre">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                cuatrimestres.map(item=>
                                    <option disabled={nro_curso>0 || cursoCopiado} key={`abmcurso-cuatrimestres${item.id_cuatrimestre}`} 
                                        value={item.id_cuatrimestre}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="cuatrimestre"/></div> 
            </div>  
            {/*
             // ATENCION : cuando quitamos un elemento del formulario formik
                         // como en este caso que comentamos los campos Nivel I y Nivel E
                         // también lo tenemos que comentar en el objeto de validación yup
            */}
            {/*<div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-nivele">Nivel ensamble</label>
                    <select onChange={handleChange} value={values.nivelE} name="nivelE" className="w-selabm" id="abm-curso-nivele">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                nivelese.map(item=>
                                    <option key={`abmcurso-nivele${item.id_nivel_ensamble}`} 
                                        value={item.id_nivel_ensamble}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="nivelE"/></div> 
            </div>*/}
            {/*<div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-niveli">Nivel instrumental</label>
                    <select onChange={handleChange} value={values.nivelI} name="nivelI" className="w-selabm" id="abm-curso-niveli">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                nivelesi.map(item=>
                                    <option key={`abmcurso-niveli${item.id_nivel_instrumental}`} 
                                        value={item.id_nivel_instrumental}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="nivelI"/></div> 
            </div> */}
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-encabezado">Encabezado</label>
                    <select onChange={(e)=>{handleChange(e);buscarRegimenes(e,setFieldValue)}} value={values.encabezado} name="encabezado" className="w-selabm" id="abm-curso-encabezado">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                encabezados.map(item=>
                                    <option disabled={item.reg_activo==0} key={`abmcurso${item.id_encabezado}`} 
                                        value={item.id_encabezado}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="encabezado"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-regimen">Régimen</label>
                    <select onChange={handleChange} 
                            value={values.regimen} 
                            name="regimen"
                            title={values.regimen==-2 ? 'No se encontraron regímenes para el encabezado seleccionado':''} 
                            disabled = {values.encabezado==-1}
                            className="w-selabm" id="abm-curso-regimen">
                          
                          {/*<option disabled value="-1">Seleccionar</option*/}  
                          {/* aqui no agrego el option con value -1 y texto Seleccionar, esto lo manejo dinámicamente en la función buscarRegimenes ya que este select se carga cuando se selecciona un encabezado */}
                            {
                                regimenes.map(item=>
                                    <option key={`abmcurso-regimen${item.id_regimen}`} 
                                      disabled = {item.id_regimen==-1}
                                      value={item.id_regimen}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="regimen"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-aula">Aula</label>
                    <select onChange={handleChange} value={values.aula} name="aula" className="w-selabm" id="abm-curso-aula">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                aulas.map(item=>
                                    <option key={`abmcurso-aula${item.id_aula}`} 
                                        value={item.id_aula}>{item.descripcion}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="aula"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-dia">Día</label>
                    <select onChange={handleChange} value={values.dia} name="dia" className="w-selabm" id="abm-curso-dia">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                dias.map(item=>
                                    <option key={`abmcurso-dia${item.id_dia}`} 
                                        value={item.id_dia}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="dia"/></div> 
            </div>    
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-horai">Hora de inicio</label>
                    <select onChange={(e)=>{handleChange(e); handleHoraInicioChange(e,values,setFieldValue)}} value={values.horai} name="horai" className="w-selabm-corto" id="abm-curso-horai">
                            {
                                horasInicio.map(item=>
                                    <option key={`abmcurso-horai${item}`} 
                                        value={item}>{item}</option>
                                )
                            }
                    </select>
                    <select onChange={(e)=>{handleChange(e); handleMinutoInicioChange(e,values,setFieldValue)}} value={values.minutoi} name="minutoi" className="w-selabm-corto" id="abm-curso-minutoi">
                            {
                                minutosInicio.map(item=>
                                    <option key={`abmcurso-minutoi${item}`} 
                                        value={item}>{item}</option>
                                )
                            }
                    </select>                    
                </div>  
                <div className="error_formulario"><ErrorMessage name="horai"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-horaf">Hora de fin</label>
                    <select onChange={(e)=>{handleChange(e); handleHoraFinChange(e,values,setFieldValue)}} value={values.horaf} name="horaf" className="w-selabm-corto" id="abm-curso-horaf">
                            {
                                horasFin.map(item=>
                                    <option key={`abmcurso-horaf${item}`} 
                                        value={item}>{item}</option>
                                )
                            }
                    </select>
                    <select onChange={(e)=>{handleChange(e); handleMinutoFinChange(e,values,setFieldValue)}} value={values.minutof} name="minutof" className="w-selabm-corto" id="abm-curso-minutof">
                            {
                                minutosFin.map(item=>
                                    <option key={`abmcurso-minutofin${item}`} 
                                        value={item}>{item}</option>
                                )
                            }
                    </select>                    
                </div>  
            </div> 
            <div className="error_formulario">{errors.validacionHoras}</div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-recuperatorio">Recuperatorio</label>
                    <Field 
                        id="abm-curso-recuperatorio"
                        type="checkbox" 
                        name="recuperatorio" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="recuperatorio"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-capacidad">Capacidad</label>
                    <select disabled={capacidadDeshabilitada} onChange={handleChange} value={values.capacidad} name="capacidad" className="w-selabm-corto" id="abm-curso-capacidad">
                            {
                                capacidades.map(item=>
                                    <option key={`abmcurso-capacidad${item}`} 
                                        value={item}>{item}</option>
                                )
                            }
                    </select>  
                    <span title="Si la materia es individual la capacidad se calcula automáticamente" className="text-xsmall ml-2 color-tomato">{values.subdivisioni ? 'Calculado automáticamente' : ''}</span>
                </div>  
                <div className="error_formulario"><ErrorMessage name="capacidad"/></div> 
            </div>    
            <div className="flex f-col mt-2">
                <div className="flex f-row">
                        { values.materia > -1 && <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-subdivisioni">{values.subdivisioni ? 'Esta materia es individual' : 'Esta materia es grupal'}</label>}
                    <Field 
                        id="abm-curso-subdivisioni"
                        type="checkbox" 
                        // onChange={handleSubdivisionChange}
                        //onChange={(e)=>{handleChange(e) // si necesito un comportamiento customizado del onChange conecto los 2 eventlisteners, uno el nativo de formik y el otro el personalizado , si pongo uno solo se pierde el otro, hay que combinarlos en una función anonima
                        //    handleSubdivisionChange(e,values,setFieldValue)
                        //}}
                        // desactivamos el check, se deja solo como info, el verdadero atributo de si es individual o grupal viene de la materia
                        disabled
                        className="ml-4 hidden"
                        name="subdivisioni" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="subdivisioni"/></div> 
            </div>               
            {!cursoCopiado && <button className="Form__submit" type="submit">{cursoCopiado ? `Copiar` : `Grabar`}</button>}
        </div>
    </div>    
    </Form>
    </fieldset>) } }

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

function cargarDescripcion(data,materias,profesores){
    let materia = null;
    let profesor = null;

    const mat_activa = materias.some(item=>item.id_materia==data.id_materia)
    const prof_activo = profesores.some(item=>item.id_prof==data.id_prof)
    
    if (!mat_activa){
        if (data.materia_desc){
            materia = `${data.materia_desc} (Materia inactiva)`
        }else{
            materia = 'Materia inactiva NN'
        }
    }

    if (!prof_activo){
        if (data.profesor_desc){
            profesor = `${data.profesor_desc} (Profesor inactivo)`
        }else{
            profesor = 'Profesor inactivo NN'
        }
    }

    return {materia:materia,profesor:profesor}
   
}