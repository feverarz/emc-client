import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy,faWindowClose, faPlusSquare, faEdit ,faEye} from '@fortawesome/free-regular-svg-icons';
import { faUsers,faPhone,faMobile,faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';
import {useAlumno} from '../Context/alumnoContext';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import { Link } from 'react-router-dom';
import AbmCurso from '../abms/abm-curso';
import AlumnosCurso from '../componentes/Alumnos-curso';
import ActualizarCalificaciones from '../componentes/ActualizarCalificaciones';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';

import Swal from 'sweetalert2';

const _maximoFilas = 5000


export default function BusquedaCursos({finalizarReutilizacionCursos}){

    const [cursos,setCursos]=useState([]);
    const [cuatrimestres,setCuatrimestres]=useState([]);
    const [buscandoCursos,setBuscandoCursos]=useState(false)
    const [copiando,setCopiando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const [id_cuatrimestre,setIdCuatrimestre]=useState(-1);
    const [cuatrimestreDestino,setCuatrimestreDestino]=useState(-1);
    const {cuatrimestreActivo} = useAlumno();
    const [cursoSeleccionado, setCursoSeleccionado]=useState(null)
    const [grupalIndividual,setGrupalIndividual,]=useState(-1);
    const [tipoCurso,setTipoCurso,]=useState(-1);
    const [cursoRecuperatorio,setCursoRecuperatorio]=useState(-1);
    const [limites,setLimites] = useState({minimo:0,maximo:_maximoFilas-1})
    const {toggle, isShowing } = useModal();
    let descripcion_cuatrimestre_activo = cuatrimestreActivo.nombre;

    useEffect(()=>{
        setIdCuatrimestre(cuatrimestreActivo.id_cuatrimestre);
        descripcion_cuatrimestre_activo = cuatrimestreActivo.nombre
    },[])

    useEffect(()=>{
        setBuscandoCursos(true)
        buscarCursos()
    },[id_cuatrimestre])

    useEffect(()=>{
        if (cuatrimestres.length>0){
            setCuatrimestreDestino(cuatrimestres[0].id_cuatrimestre)
        }
    },[cuatrimestres])

    const buscarCursos = async ()=>{

        setBuscandoCursos(true)

        try{
             const vectorResultados = await Promise.all([Axios.get(`/api/cursos/cuatrimestre/${id_cuatrimestre}`),
                                 Axios.get(`/api/tablasgenerales/cuatrimestres`)])
     
            const cursosOrdenadosPorMateria = await ordenarCursosPorMateria(vectorResultados[0].data)

            const data_mas_selector = cursosOrdenadosPorMateria.map((item)=>{
                return{...item,seleccion:false}
            })

            setCursos(data_mas_selector)

           // setCursos(cursosOrdenadosPorMateria);

             setCuatrimestres(vectorResultados[1].data.sort((a,b)=>b.id_cuatrimestre - a.id_cuatrimestre))
             setBuscandoCursos(false)
             hacerfocoEnPrimerInput("texto-busqueda")
         }catch(err){
             console.log(err)
             setBuscandoCursos(false)
             setHuboError(true)
         }
     }

    async function handleSubmit(e,alumno) {
        e.preventDefault();
       // finalizarSeleccion(alumno.id_alumno,alumno.nombre,alumno.apellido,alumno.documento)
    }

    function limpiarFiltro(){
        setTextoBusqueda("")
        hacerfocoEnPrimerInput("texto-busqueda")
    }

    const handleChangeCuatrimestre = (e)=>{
        setIdCuatrimestre(e.target.value)
    }

    const handleChangeCuatrimestreDestino = (e)=>{
        setCuatrimestreDestino(e.target.value)
    }

    const handleChangeGrupalIndividual = (e)=>{
        setGrupalIndividual(e.target.value);
        setTipoCurso(-1);
        setCursoRecuperatorio(-1);
        setCursoSeleccionado(null)
    }

    const handleChangeTipoCurso = (e)=>{
        setTipoCurso(e.target.value);
        setGrupalIndividual(-1);
        setCursoRecuperatorio(-1);
        setCursoSeleccionado(null)
    }

    const handleChangeCursoRecuperatorio = (e)=>{

        const valorBooleano = e.target.value==='true' ? true : false
        setCursoRecuperatorio(valorBooleano);
        setGrupalIndividual(-1);
        setTipoCurso(-1);
        setCursoSeleccionado(null)
    }

    const cambiarCheck =(e)=>{

        const aux3 = cursos.map(item=>{
            if (item.nro_curso!=e.target.value){
                return item
            }else{
                return {...item,seleccion:!item.seleccion}
            }
        })
    
        setCursos(aux3)
    }

    const desmarcarCheck =(nro_curso)=>{

        const aux3 = cursos.map(item=>{
            if (item.nro_curso!=nro_curso){
                return item
            }else{
                return {...item,seleccion:false}
            }
        })
    
        setCursos(aux3)
    }    

function delay(id,i){
		return new Promise(function(resolve,reject){

			setTimeout(function(){
						resolve(id);
			},1000 * i)
		});
}

const copiarCursosSeleccionados = ()=>{
     
    if(cuatrimestreDestino<0){
        alert('No seleccionó el cuatrimestre destino')
        return
    }

    const cursosSeleccionados = cursos.filter(item=>item.seleccion==true)
    const descripcionCuatrimestreDestino = cuatrimestres.filter(item=>item.id_cuatrimestre==cuatrimestreDestino)[0].nombre

    Swal.fire({
        html:`<p>La copia se realizará en el período: ${descripcionCuatrimestreDestino}</p><br> <p>¿Confirma la copia de ${cursosSeleccionados.length>1 ? `${cursosSeleccionados.length} cursos` : '1 curso '} en el ${descripcionCuatrimestreDestino}?</p>`,
        showCancelButton:true,
        confirButtonText:'Si, copiar',
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                setCopiando(true)
                copiarCursosSeleccionadosPromesa(cursosSeleccionados)
                .then(respuesta=>{
                    setCopiando(false)
                    //alert(`Se crearon ${respuesta.nuevos.length} cursos. Se encontraron ${respuesta.errores.length} errores`)
                    finalizarCopia(respuesta,cuatrimestreDestino)
                })
                .catch(err=>{
                    setCopiando(false)
                })
            }else{
                console.log("Se canceló la copia de los cursos")
            }
        }
    )
}

const finalizarCopia = (respuesta,cuatrimestreDestino)=>{

    const nuevos = respuesta.nuevos.reduce((acumulador,item)=>{
        return `${acumulador} ${item.data}`
    },'Nuevos cursos...')

    const errores = respuesta.errores.reduce((acumulador,item)=>{
        return `${acumulador} ${item.data}`
    },'Cursos no copiados...')

    const html = `
    <p>${respuesta.nuevos.length>1 ? `Se crearon ${respuesta.nuevos.length} cursos`:`Se creó 1 curso`}. Se encontraron ${respuesta.errores.length} errores</p>
     <div>${respuesta.nuevos.length > 0 ? nuevos: ''}</div>
     <div>${respuesta.errores.rlength > 0 ? errores : ''}</div>
    `
    Swal.fire({
        html:html,
        icon: 'success',
        showConfirmButton: true
    }).then(resultado=>{
        const aux = cursos.map(item=>{return {...item,seleccion:false}})
        finalizarReutilizacionCursos(cuatrimestreDestino)
        setCursos(aux)
    })
}

const copiarCursosSeleccionadosPromesa = (cursosSeleccionados)=>{
    let cursosCreados = [];
    let cursosError = [];

    return new Promise((resolve, reject)=>{
        
        cursosSeleccionados.map(async (item,index)=>{
            const resultado = await delay(item.nro_curso,index)
            copiarCursoSeleccionado(item.nro_curso)
                .then(respuesta=>{
                    cursosCreados.push(respuesta)
                    if (index == cursosSeleccionados.length - 1){
                        resolve({nuevos:cursosCreados,errores:cursosError})
                    }
                })
                .catch(nro_curso=>{
                    cursosError.push(nro_curso)
                    if (index == cursosSeleccionados.length - 1){
                        resolve({nuevos:cursosCreados,errores:cursosError})
                    }
                })
               
        })
    })
}

const copiarCursoSeleccionado = async (nro_curso)=>{

const objetoAgrabar = { 
    nro_curso: nro_curso
}

    try{
          // const resultado= await Axios.post(`/api/cursos/copiar/${cuatrimestreActivo.id_cuatrimestre}`,objetoAgrabar)
          //const resultado= await Axios.post(`/api/cursos/copiar/${cuatrimestreActivo.id_cuatrimestre}`,objetoAgrabar)
          const resultado= await Axios.post(`/api/cursos/copiar/${cuatrimestreDestino}`,objetoAgrabar)
          return resultado
    }catch(err){
        return nro_curso
    }

}

    const handleInputChange = (e)=>{  // defino una función que va a escuchar los cambios que ocurren en los inputs. Agrego el listener con onChange
        setTextoBusqueda(e.target.value)
    }

    function seleccionarCurso(e,item){
        //finalizarSeleccion(item.id_alumno,item.nombre,item.apellido,item.documento)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscandoCursos){
        return <Main center><div><Loading/><span className="cargando">Buscando cursos...</span></div></Main>
    };

    return(
//        AlumnosCurso
        <>
            <Formulario
                handleSubmit={handleSubmit}
                textoBusqueda={textoBusqueda}
                handleInputChange={handleInputChange}
                limpiarFiltro={limpiarFiltro}
                handleChangeCuatrimestre={handleChangeCuatrimestre}
                cuatrimestres={cuatrimestres}
                cuatrimestre={id_cuatrimestre}
                handleChangeGrupalIndividual={handleChangeGrupalIndividual}
                handleChangeTipoCurso={handleChangeTipoCurso}
                handleChangeCursoRecuperatorio={handleChangeCursoRecuperatorio}
                grupalIndividual={grupalIndividual}
                tipoCurso={tipoCurso}
                cursoRecuperatorio={cursoRecuperatorio}
                cursos = {cursos}
             />
            {/*Habilitar la paginacion si hace falta limitar la cantidad de filas por pagina*/}
            {/*<Paginacion datos={cursos} setLimites={setLimites} limites={limites}/>*/}
                <button onClick={buscarCursos}>Refrescar</button>
               {cursos.length > 0 && <Listado cursos={cursos} 
                    textoBusqueda={textoBusqueda} 
                    seleccionarCurso={seleccionarCurso} 
                    setCursoSeleccionado={setCursoSeleccionado} 
                    cursoSeleccionado={cursoSeleccionado}
                    cuatrimestreActivo={cuatrimestreActivo}
                    grupalIndividual={grupalIndividual}
                    cursoRecuperatorio={cursoRecuperatorio}
                    tipoCurso={tipoCurso}
                    limites = {limites}
                    cambiarCheck = {cambiarCheck}
                    copiarCursosSeleccionados = {copiarCursosSeleccionados}
                    copiando = {copiando}
                    handleChangeCuatrimestreDestino={handleChangeCuatrimestreDestino}
                    cuatrimestres={cuatrimestres}
                    cuatrimestreDestino={cuatrimestreDestino}
                    isShowing = {isShowing}
                    toggle = {toggle}
                    />}
            </>
    )
}

function Listado({cursos,textoBusqueda,
                  seleccionarCurso,
                  cursoSeleccionado,
                  setCursoSeleccionado,
                  cuatrimestreActivo,
                  grupalIndividual,
                  tipoCurso,
                  limites,
                  cambiarCheck,
                  cursoRecuperatorio,
                  copiarCursosSeleccionados,
                copiando,
                handleChangeCuatrimestreDestino,
                cuatrimestres,
                cuatrimestreDestino,isShowing,toggle}){
    const [copiarCurso,setCopiarCurso]= useState(false)
    const [verCabecera,setVerCabecera]= useState(false)
    const [verAlumnos,setVerAlumnos]= useState(false)
    const [idCursoCalificar,setIdCursoCalificar] = useState(null) 
    const [hayAlumnos,setHayAlumnos] = useState(false)                
    const hayCursosSeleccionados = cursos.some(item=>item.seleccion==true)
    const cursosSeleccionados = cursos.filter(item=>item.seleccion==true).length
    const detalleSeleccionados  = cursos.filter(item=>item.seleccion==true).reduce((acum,item)=>{return `${acum} 
${item.campo_auxiliar} ${item.nombre} ${item.DiaHora} ${item.periodo}`},'')

    const finalizarAltaOcopia= (alta)=>{
            setCursoSeleccionado(null);
            setVerCabecera(false);
            setVerAlumnos(false);
            setCopiarCurso(false);
    }

    const iniciarVerCabecera = (item)=>{
        setCursoSeleccionado(item.nro_curso);
        setVerCabecera(true);
        setVerAlumnos(false);
        setCopiarCurso(false);
        determinarCantidadAlumnos(item.nro_curso)
    }

    const iniciarVerAlumnos = (item)=>{
        setCursoSeleccionado(item.nro_curso)
        setVerCabecera(false);
        setVerAlumnos(true);
        setCopiarCurso(false);
    }

    const iniciarCopiarCurso = (item)=>{
        setCursoSeleccionado(item.nro_curso)
        setVerCabecera(false);
        setVerAlumnos(false);
        setCopiarCurso(true);
    }

    const determinarCantidadAlumnos = async (nro_curso)=>{

        try{
            const {data} = await Axios.get(`/api/cursos/curso/${nro_curso}`)

            if (data.inscriptos > 0){
                setHayAlumnos(true)
            }else{
                setHayAlumnos(false)
            }
        }catch(err){
            console.log(err)
            setHayAlumnos(false)
        }
    }

    const cursosFiltrados = filtrarCursos(cursos,grupalIndividual,cursoRecuperatorio,tipoCurso)

    const cursosEncontrados = cursosFiltrados.filter(
        item=>item.descripcion.toUpperCase().includes(textoBusqueda.toUpperCase())||
        item.nombre.toUpperCase().includes(textoBusqueda.toUpperCase())||
        item.campo_auxiliar.toUpperCase().includes(textoBusqueda.toUpperCase())||
        item.DiaHora.toUpperCase().includes(textoBusqueda.toUpperCase()))

    return (
    <div>
        { isShowing && idCursoCalificar && <Modal hide={toggle} titulo={null} isShowing={isShowing} estilo={{width:'1000px'}} estiloWrapper={{background:'#000000bf'}}>
            <ActualizarCalificaciones nro_curso={idCursoCalificar}/>
        </Modal>}

        {cursos && !copiando && 
        <div className="flex f-col mb-4">
            {hayCursosSeleccionados && <div class="flex f-col mt-4">
                    <p className="ml-4 mb-4 fw-700">Reutilización de cursos <span title={detalleSeleccionados} className="fw-100">{`${cursosSeleccionados>1 ? `(${cursosSeleccionados} seleccionados)`:`(1 seleccionado)`}`}</span></p>
                    <label class="Form__labels__abmcursos_corto ml-4" for="abm-curso-tipocurso">Cuatrimestre destino</label>
                    
                    <select title="Cuatrimestre destino" className="w-selabm ml-4 select-bper" value={cuatrimestreDestino} onChange={(e)=>handleChangeCuatrimestreDestino(e)}>
                        {cuatrimestres.filter(item=>item.id_cuatrimestre>=cuatrimestreActivo.id_cuatrimestre)
                        .map(item=>
                            <option key={`periodo-${item.id_cuatrimestre}`} value={item.id_cuatrimestre}>{item.nombre}</option>
                        )}
                    </select>   
            </div>}
            <div className="flex justify-content-space-between items-center">{hayCursosSeleccionados && <button onClick={copiarCursosSeleccionados} className="blink" title="Copiar los cursos seleccionados en el cuatrimestre destino"> <FontAwesomeIcon icon={faCopy} className="color-tomato mr-2 ml-2"/>Copiar</button>}
                <span className="text-small inline-block mb-4 block text-right">{cursosEncontrados.length} cursos encontrados</span>
            </div>
        </div>}
        {copiando && <div className="flex f-col"><Loading/><span className="cargando">Copiando cursos...</span></div>}
        {cursosEncontrados.length==0 && <Main center><div><Loading/><span className="cargando">Preparando listado...</span></div></Main>}
        {cursosEncontrados
            .filter((item,index)=>index<=limites.maximo && index>=limites.minimo)
            .map(item=>
                <div key={`alin-${item.nro_curso}`}>
                    {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                        <div>
                            {/*<FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/>*/}
                            <input value={item.nro_curso} 
                                checked={item.seleccion} 
                                onChange={(e)=>cambiarCheck(e)} type="checkbox" 
                                title="Marque o desmarque éste curso para copiarlo al cuatrimestre activo"/>
                            <div className="bold cursor-pointer inline" onClick={()=>iniciarVerCabecera(item)}>
                                <span className="lista-cursos w-50">#{item.nro_curso}</span>
                                <span className="lista-cursos w-150">{item.descripcion}</span>
                                <span className="lista-cursos w-50">{item.campo_auxiliar}</span>
                            </div>        
                            <span className="lista-cursos w-100">{item.nombre}</span>
                            <span className="lista-cursos w-50">{item.DiaHora}</span>
                            <span className="lista-cursos w-65">{item.comienzo} hs.</span>
                            <span title={item.alerta ? 'Curso recuperatorio' : 'Curso regular'} className="lista-cursos w-35">{item.alerta ? 'ME' : 'R'}</span>
                            <span className="lista-cursos w-100">{item.tipo}</span>
                            <span title={item.grupal ? 'Curso grupal':'Curso individual'} className="lista-cursos w-35">{item.grupal ? 'G':'I'}</span>
                        </div>

                        {cursoSeleccionado==item.nro_curso &&
                            <div className="flex f-row color-63">
                                <AbmCurso nro_curso={null} 
                                    cuatrimestreActivo={cuatrimestreActivo} 
                                    cursoCopiado={item.nro_curso} 
                                    finalizarAltaOcopia={finalizarAltaOcopia} 
                                    esModal={false}
                                    mainSinClases={true}/>
                                <div className="flex f-col">
                                    {hayAlumnos && <button onClick={()=>{setIdCursoCalificar(item.nro_curso);toggle()}}>Editar las notas <FontAwesomeIcon icon={faEdit}/></button>}
                                    <AlumnosCurso nro_curso={item.nro_curso}/>
                                </div>
                            </div>
                            }
                                
                </div>
            )
        }
    </div>
    )
}

function Formulario({handleSubmit,
                     textoBusqueda,
                     handleInputChange,
                     limpiarFiltro,
                     cuatrimestres, 
                     cuatrimestre, 
                     handleChangeCuatrimestre,
                     handleChangeGrupalIndividual,
                     handleChangeTipoCurso,
                     handleChangeCursoRecuperatorio,
                     grupalIndividual,
                     tipoCurso,
                     cursoRecuperatorio,
                     copiando}){
    return(
         <form onSubmit={handleSubmit}>
            {/* Tengo conectado el input email con el estado usuario.email a través del atributo value y del evento onChange */}
            
            <div className="flex f-col">
           
            <Seleccionadores 
                cuatrimestres={cuatrimestres}
                cuatrimestre={cuatrimestre}
                handleChangeCuatrimestre = {handleChangeCuatrimestre}
                cambiarGrupalIndividual={handleChangeGrupalIndividual}
                grupalIndividual={grupalIndividual}
                cambiarTipoCurso={handleChangeTipoCurso}
                tipoCurso={tipoCurso}
                cambiarCursosRecuperatorios={handleChangeCursoRecuperatorio}
                cursoRecuperatorio={cursoRecuperatorio}
            />
            
            <div className="flex f-row ml-4">
                {/*<FontAwesomeIcon className="mt-2 mr-2 razon-social" icon={faUsers}/>*/}
                <input value={textoBusqueda} 
                    onChange={handleInputChange} 
                    type="text" 
                    name="busqueda" 
                    id="texto-busqueda"
                    title="Filtrar por Materia, Abreviatura, Profesor o día"
                    autoComplete="off"
                    placeholder="Filtrar por Materia, Abreviatura, Profesor o día" 
                    className="Form__field"/>

                    { textoBusqueda!="" && <button><FontAwesomeIcon 
                        className="color-tomato"
                        title="Limpiar el filtro"
                        icon={faWindowClose} 
                        onClick={limpiarFiltro}/>
                    </button>}
                    
            </div>   
            </div>
        </form>
      

    )
}

function Detalle1({curso}){

    return <div>
        <h1>Este es el detalle del curso #{curso.nro_curso} para copiar</h1>
{/*<AbmCurso cuatrimestreActivo={46} esModal={false} cursoCopiado={curso.nro_curso}/>*/}
</div>
}

function Detalle2({curso}){

    return <div>
        <h1>Este es el detalle del curso #{curso.nro_curso} para ver alumnos</h1>
{/*<AbmCurso cuatrimestreActivo={46} esModal={false} cursoCopiado={curso.nro_curso}/>*/}
</div>
}

function Detalle3({curso}){

    return <div>
        <h1>Este es el detalle del curso #{curso.nro_curso} para ver cabecera</h1>
{/*<AbmCurso cuatrimestreActivo={46} esModal={false} cursoCopiado={curso.nro_curso}/>*/}
    </div>
}

function Seleccionadores({cuatrimestres,
                            cuatrimestre,
                            handleChangeCuatrimestre,
                            cambiarTipoCurso,
                            cambiarCursosRecuperatorios, 
                            tipoCurso, 
                            cursoRecuperatorio,
                            grupalIndividual,
                     cambiarGrupalIndividual}){
    return (
        <div>
            <div className="flex f-row selecTipoCurso">

                <span title="Curso Regular o Mesa de examen" className="tipo-curso mr-4 ml-4 mt-3px hidden">Período</span>
                
                <select title="Cuatrimestre" className="w-selabm ml-4 select-bper" value={cuatrimestre} onChange={(e)=>handleChangeCuatrimestre(e)}>
                    {cuatrimestres.map(item=>
                        <option key={`periodo-${item.id_cuatrimestre}`} value={item.id_cuatrimestre}>{item.nombre}</option>
                        )}
                </select>

                <span title="Curso Regular o Mesa de examen" className="tipo-curso mr-4 ml-4 mt-3px hidden">R/ME</span>

                <select title="Curso Regular o Mesa de examen" value={cursoRecuperatorio} 
                    className="ml-4 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarCursosRecuperatorios}>
                    <option value="-1">R/ME</option>
                    <option value="false">Regulares</option>
                    <option value="true">Recuperatorios</option>
                </select>

                <span title="Curso Standard, Instrumental o Ensamble" className="tipo-curso mr-4 ml-4 mt-3px hidden">Tipo</span>

                <select title="Curso Standard, Instrumental o Ensamble" value={tipoCurso} 
                    className="ml-2 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarTipoCurso}>
                    <option value="-1">Tipo de curso</option>
                    <option value="Standard">Standard</option>
                    <option value="Instrumental">Instrumental</option>
                    <option value="Ensamble">Ensamble</option>
                </select>

                <select title="Curso grupal o individual" value={grupalIndividual} 
                    className="ml-2 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarGrupalIndividual}>
                    <option value="-1">G/I</option>
                    <option value="1">Grupal</option>
                    <option value="0">Individual</option>
                </select>

            </div>
        </div>

    )
    
}

async function ordenarCursosPorMateria(cursos){
    return cursos.sort((a,b)=>a.descripcion.localeCompare(b.descripcion))
}

function filtrarCursos(cursos,grupalIndividual,cursoRecuperatorio,tipoCurso){

if (grupalIndividual==-1 && cursoRecuperatorio==-1 && tipoCurso==-1){
    return cursos
}

if (tipoCurso!=-1){
    return cursos.filter(item=>item.tipo===tipoCurso)
}

if (cursoRecuperatorio!=-1){
    return cursos.filter(item=>item.alerta===cursoRecuperatorio)
}

return cursos.filter(item=>item.grupal==grupalIndividual)
}


function Paginacion({datos,setLimites,limites}){
    const total = datos.length;

    const vectorPaginas = datos.map((item,index)=>({minimo:index,maximo:(index+(_maximoFilas-1))<total ? index+(_maximoFilas-1) : total})).filter(item=>item.minimo%_maximoFilas==0)

       return <div className="flex f-row justify-center">
       {vectorPaginas.map((item,index)=><button title={`Filas ${item.minimo+1} a la ${item.maximo+1}`} className={limites.minimo==item.minimo ? "b-pag-sel":"b-pag"} onClick={()=>{setLimites({minimo:item.minimo,maximo:item.maximo})}}>{index+1}</button>)}
   </div>
}
