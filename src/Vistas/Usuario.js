import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import AbmPersonal from '../abms/abm-personal';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import Loading from '../componentes/Loading';
import { v4 as uuidv4 } from 'uuid';
import {useAlumno} from '../Context/alumnoContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faCheckCircle, faTrashAlt, faMehBlank, faRegistered, faFilePdf, faEdit } from '@fortawesome/free-regular-svg-icons';
import Swal from 'sweetalert2';
import {imprimir} from '../impresiones/registro';
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams
  } from "react-router-dom";

export default function Usuario(){
    let params = useParams();

    const id_prof = params.id; // al ser pasado por params llega como string el id de curso

    const [alumnos,setAlumnos] = useState([])
    const {toggle, isShowing } = useModal();
    const [cargandoAlumnos,setCargandoAlumnos] = useState(false);
    const [inscribiendo,setInscribiendo] = useState(false);
    const [preguntarTipoInscripcion,setPreguntarTipoInscripcion]= useState(false)
    const [tipoCursada,setTipoCursada]= useState(1); // regular por default
    const [alertas,setAlertas]= useState([]);
    const [yaInscripto,setYaInscripto]= useState(false);
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [contadorModificacionesFicha,setContadorModificacionesFicha]=useState(0);
    const [horarioSeleccionado,setHorarioSeleccionado]=useState(null);
    const [horarios,setHorarios] = useState([]);
    const [usuarioActualizado,setUsuarioActualizado]=useState(null)
    const [abrirfichaConDelay, setAbrirfichaConDelay]=useState(false)

    // para activar el modal llamar a la función toggle en con alguna condicion o un evento...

    useEffect(()=>{

        buscarDatosDelUsuario(); // actualizo los datos del curso al entrar para no tener la info
                               // de la vista de cursos sino la real de la base de datos
                               // ya que puede haber habido algún cambio en el curso por otro usuario
                               // entre el momento en que se leyò la lista de cursos y el momento en 
                               // que entro al mismo
        // al principio solo usaba la info que venía desde el location.state (cursos) el
        // objeto usuarioActualizado lo agregué más tarde así que algunos datos los tomo del
        // objeto usuarioActualizado y otros de location.state... Debería tomar todo del primero para que sea màs limpio y màs claro
        
        setTimeout(()=>setAbrirfichaConDelay(true),200) 
        // uso el flag abrirfichaConDelay para asegurarme que el componente abm-curso
        // se renderice después de renderizar el componente padre
        // ya que el componente hijo (abm-curso) usa useEffect y useState y eso genera
        // un warning 
    },[contadorModificacionesFicha,id_prof])


function finalizarModificacionFichaCurso(){
    setContadorModificacionesFicha(contadorModificacionesFicha+1)
    scrollTop()
}

async function buscarDatosDelUsuario(){
    setCargandoAlumnos(true)
    try{           
        const {data} = await Axios.get(`/api/usuarios/${id_prof}`)
        setUsuarioActualizado(data);
        setCargandoAlumnos(false)

    }catch(err){
        setCargandoAlumnos(false)
        console.log(err);
    }
}


if (cargandoAlumnos){
    return <Main center><Loading/><span className="cargando">Cargando alumnos...</span></Main>
};

if (inscribiendo){
    return <Main center><Loading/><span className="cargando">Inscribiendo...</span></Main>
};

if (!usuarioActualizado){
    return <Main center><Loading/></Main>
}

return(
<Main> 
    <div className="bg-blue text-white p-4 rounded relative mt-100">
        <div className="absolute cabecera botonNc flex f-row">
            <span onClick={()=>hacerScroll('editar-curso')} className="cursor-pointer mr-2 ml-2" >
                <FontAwesomeIcon className="cursor-copy" icon={faEdit}/> Editar la cabecera del curso
            </span> 
        </div>
       
    <div className="flex flex-row relative">        
    <div className="max-w-sm rounded overflow-hidden shadow-lg mb-6 dgc_OLD p-2">
    <div className="px-6 py-4">

<div className="fw-600 mb-2">{`${usuarioActualizado.apellido}, ${usuarioActualizado.nombre}`}
    <span className="nrocurso mr-4">{` (#${id_prof}) ${usuarioActualizado.tipo.replace('Usuario','')}`}</span>
</div>
<div className="px-6 py-4">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              {`Permiso de ${usuarioActualizado.permiso}`}     
        </span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 ml-2 mr-2">
              {`Dado de alta el ${usuarioActualizado.alta}`}     
        </span>
</div>

<div className="px-6 py-4">
        <span className="width-150 inline-block-1 bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              Cursos asignados     
        </span>
        <span className="inscriptos wh-4">{usuarioActualizado.cursos}</span> <span>{` dicta ${usuarioActualizado.materias_actuales} materias`}</span>
</div>

<div className="px-6 py-4">
        <span className="width-150 inline-block-1 bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              Total de cursos históricos     
        </span>
        <span className="inscriptos wh-4">{usuarioActualizado.total}</span> <span>{` dictando ${usuarioActualizado.materias_totales} materias`}</span>
</div>



    </div>
     
    </div>

</div>
</div>
      {abrirfichaConDelay && <AbmPersonal id_prof={id_prof} finalizarAltaOcopia={finalizarModificacionFichaCurso}/>}

</Main>)



}



function createMarkup(codigo) { return {__html: codigo}; };













