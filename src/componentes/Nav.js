import React, { useState, useEffect, useRef } from 'react';
import { Link, withRouter,NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBalanceScale, faChartLine,faPowerOff, faBars, faCalendarAlt as calendar2, faClone,faUsers, faSync, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import {faCompass, faUserCircle, faCaretSquareUp, faCaretSquareDown, faCalendarAlt,faWindowClose,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import {useAlumno} from '../Context/alumnoContext';
import useModal from '../hooks/useModal';
import Modal from './Modal';
import Busqueda from './Busqueda'
import Aulas from './Aulas'
import Instrumentos from './Instrumentos'
import Materias from './Materias'
import Cuatrimestres from './Cuatrimestres'
import RefrescarTablas from './RefrescarTablas'
import ExportacionExcel from './ExportacionExcel';
import Logs from './Logs';
//import {Finanzas} from './Finanzas';

import imagen from '../logoemc.PNG';

export default function Nav({ usuario, logout, cuatrimestreActivo }) {

  const {mostrarBusquedaAlumnos, 
         habilitarBusquedaAlumnos,
         desHabilitarBusquedaAlumnos} = useAlumno();
  const {toggle, isShowing } = useModal();
  const [componenteModal,setComponenteModal]= useState(null)
  const [titulo,setTitulo]= useState('')
  const [abrirMenuVertical,setAbrirMenuVertical]= useState(false)
  const [mostrar, setMostrar] = useState(false);

  const toggleMenuVertical = ()=>{
    setAbrirMenuVertical(!abrirMenuVertical)
  }

  const switchVistaBusquedaAlumnos = ()=>{

    if (mostrarBusquedaAlumnos){
          desHabilitarBusquedaAlumnos();
      }else{
         habilitarBusquedaAlumnos()
      }
  }

const switchMostrar=()=>{
    if (mostrar){
        setMostrar(false)
    }else{
        setMostrar(true)
    }
}

const mostrarMenuLateral=()=>{
    setMostrar(true)
}

const noMostrarMenuLateral=()=>{
  setMostrar(false)
}

  return (
    <div>
    {usuario && usuario.id_permiso == 3 && <div onMouseEnter={mostrarMenuLateral} onMouseLeave={noMostrarMenuLateral}  className={mostrar ? "flex f-row wrapper_nav mostrar" : "flex f-row wrapper_nav nomostrar_nav"}>
        <div id="slide2">
            <span onClick={switchMostrar} className="cursor-pointer mr-2 ml-2 color-tomato flex justify-content-end" >
                        {/*{ mostrar && <FontAwesomeIcon title="Cerrar" className="mostrar-menu-lateral" icon={faWindowClose}/>}*/}
                        { !mostrar && <FontAwesomeIcon title="Otras operaciones" className="mostrar-menu-lateral_nav" icon={faBars}/>}
            </span>  
            <MenuVertical setComponenteModal={setComponenteModal} toggle={toggle} setTitulo={setTitulo} toggleMenuVertical={toggleMenuVertical} usuario={usuario} />
        </div>
    </div>}
    <div>
    <nav className="Nav" id="mainnav">
      <ul className="Nav__links">
       {!usuario && <li>
          <Link className="razon-social" to="/">
            Escuela de Música Contemporánea 
          </Link>
       </li>}
        {usuario && cuatrimestreActivo && 
            <li title={`Cuatrimestre activo ${cuatrimestreActivo.nombre} (${cuatrimestreActivo.id_cuatrimestre})`} 
                className="Nav__link-push fw-400 text-smaller">
                    <p className="text-xsmall mb-2">{usuario.id_permiso==0 ? 'MENÚ PROFESOR' : usuario.id_permiso == 3 ? 'MENÚ ADMINISTRATIVO' : usuario.id_permiso == 100 ? 'MENÚ ALUMNO' : usuario.id_permiso == 4 ? 'MENÚ SECRETARÍA':'MENÚ NO DEFINIDO PARA ESTE PERMISO'}</p>
                    <p className="text-xsmall mb-2">Sesión de {usuario.nombre}</p>
                    <div className="relative">
                      {cuatrimestreActivo.nombre}
                      <p className="text-xxsmall color-tomato text-right absolute" style={{right:0,top:'15px',opacity:'0.7'}}>Cuatrimestre activo</p>
                    </div>
            </li>
        }
        {usuario && usuario.id_permiso == 3 && <LoginRoutesAdministracion toggle={toggle} 
                      usuario={usuario} 
                      logout={logout} 
                      switchVistaBusquedaAlumnos={switchVistaBusquedaAlumnos} 
                      setComponenteModal={setComponenteModal} 
                      setTitulo={setTitulo}
                      abrirMenuVertical={abrirMenuVertical} 
                      toggleMenuVertical={toggleMenuVertical} />}
        {usuario && usuario.id_permiso == 4 && <LoginRoutesSecretaria toggle={toggle} 
                      usuario={usuario} 
                      logout={logout} 
                      switchVistaBusquedaAlumnos={switchVistaBusquedaAlumnos} 
                      setComponenteModal={setComponenteModal} 
                      setTitulo={setTitulo}
                      abrirMenuVertical={abrirMenuVertical} 
                      toggleMenuVertical={toggleMenuVertical} />}                   
        {usuario && usuario.id_permiso == 0 && <LoginRoutesProfesor toggle={toggle} 
                      usuario={usuario} 
                      logout={logout} 
                      switchVistaBusquedaAlumnos={switchVistaBusquedaAlumnos} 
                      setComponenteModal={setComponenteModal} 
                      setTitulo={setTitulo}
                      abrirMenuVertical={abrirMenuVertical} 
                      toggleMenuVertical={toggleMenuVertical} />}
        {usuario && usuario.id_permiso == 100 && <LoginRoutesAlumno toggle={toggle} 
                      usuario={usuario} 
                      logout={logout} 
                      switchVistaBusquedaAlumnos={switchVistaBusquedaAlumnos} 
                      setComponenteModal={setComponenteModal} 
                      setTitulo={setTitulo}
                      abrirMenuVertical={abrirMenuVertical} 
                      toggleMenuVertical={toggleMenuVertical} />}                      

      </ul>
    </nav>
    {/*usuario && <li className="color-gray">Sesión de {usuario.nombre}</li>*/}

    </div>
    { isShowing && <Modal hide={toggle} isShowing={isShowing} titulo={titulo} estiloWrapper={{background:'#000000bf'}}>
                           <SeleccionarComponenteModal componente={componenteModal}
                           />
                    </Modal>}      
    
    </div>

  );
}

function LoginRoutesAdministracion({ usuario, 
                        logout, 
                        switchVistaBusquedaAlumnos,
                        toggle, 
                        setComponenteModal, 
                        setTitulo,
                        abrirMenuVertical,
                        toggleMenuVertical }) {

  const estilo_prueba = {color:'white',background:'tomato',padding:'3px'}

  return (
    <>
    <li title="Alumnos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/alumnos">
            <FontAwesomeIcon icon={faUserCircle} />
            <p className="text-small color-63 text-center">Alumnos</p>
          </NavLink>
      </div>
    </li>     
    <li title="Cursos e inscripciones" className="Nav__link-push">
          <div className="text-center"> 
              <NavLink activeClassName="op-active" className="Nav__link"  to="/cursos">
                <FontAwesomeIcon icon={faUsers} />
                <p className="text-small color-63 text-center">Cursos</p>
              </NavLink>
          </div>
    </li>
      <li title="Usuarios profesores y administrativos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/personal">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
            <p className="text-small color-63 text-center">Usuarios</p>
          </NavLink>
      </div>
      </li>         
      <li title="Cronograma diario de cursos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/cronograma-diario">
            <FontAwesomeIcon icon={faCalendarAlt}/><span className="text-small sub-i">D</span>
            <p className="text-small color-63 text-center">Agenda diaria</p>
          </NavLink>
      </div>
      </li>         
      <li title="Cronograma semanal de cursos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/cronograma-semanal">
          <FontAwesomeIcon icon={calendar2}/><span className="text-small sub-i">S</span>
            <p className="text-small color-63 text-center">Agenda semanal</p>
          </NavLink>
      </div>
      </li> 
      {/*<li title="Estadísticas" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/estadisticas">
          <FontAwesomeIcon icon={faChartLine}/><span className="text-small sub-i"></span>
            <p className="text-small color-63 text-center">Estadísticas</p>
          </NavLink>
      </div>
      </li>*/}  
      {/*<li title="Lista comparativa de inscripción entre períodos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/comparativas">
          <FontAwesomeIcon icon={faBalanceScale}/><span className="text-small sub-i"></span>
            <p className="text-small color-63 text-center">Comparativas</p>
          </NavLink>
      </div>
      </li> */}                           
      <li title="Abrir la aplicación en una nueva pestaña" className="Nav__link-push">
        <div className="text-center"> 
          <Link className="Nav__link" to="/" target="_blank">
            <FontAwesomeIcon icon={faClone} />
            <p className="text-small color-63 text-center">Nueva ventana</p>
          </Link>
        </div>
      </li> 
      <li className="Nav__link-push">
      <button className="Perfil__boton-logout" title="Salir" onClick={logout}>
          <FontAwesomeIcon icon={faPowerOff} />
          <span className="text-xxsmall block">Salir</span>
        </button>
      </li>
    
    
    </>
  )}

function LoginRoutesSecretaria({ usuario, 
                        logout, 
                        switchVistaBusquedaAlumnos,
                        toggle, 
                        setComponenteModal, 
                        setTitulo,
                        abrirMenuVertical,
                        toggleMenuVertical }) {

  const estilo_prueba = {color:'white',background:'tomato',padding:'3px'}

  return (
    <>
     <li title="Alumnos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/alumnos">
            <FontAwesomeIcon icon={faUserCircle} />
            <p className="text-small color-63 text-center">Alumnos</p>
          </NavLink>
      </div>
    </li>     
    <li title="Usuarios profesores y administrativos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/personal">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
            <p className="text-small color-63 text-center">Usuarios</p>
          </NavLink>
      </div>
    </li> 
    <li title="Abrir la aplicación en una nueva pestaña" className="Nav__link-push">
        <div className="text-center"> 
          <Link className="Nav__link" to="/" target="_blank">
            <FontAwesomeIcon icon={faClone} />
            <p className="text-small color-63 text-center">Nueva ventana</p>
          </Link>
        </div>
      </li> 
    <li className="Nav__link-push">
      <button className="Perfil__boton-logout" title="Salir" onClick={logout}>
          <FontAwesomeIcon icon={faPowerOff} />
          <span className="text-xxsmall block">Salir</span>
        </button>
    </li>
    
    
    </>
  )}

function LoginRoutesProfesor({ usuario, 
                        logout, 
                        switchVistaBusquedaAlumnos,
                        toggle, 
                        setComponenteModal, 
                        setTitulo,
                        abrirMenuVertical,
                        toggleMenuVertical }) {

  const estilo_prueba = {color:'white',background:'tomato',padding:'3px'}

  return (
    <>
    <li title="Cursos actuales" className="Nav__link-push">
          <div className="text-center"> 
              <NavLink activeClassName="op-active" className="Nav__link"  to="/cursos">
                <FontAwesomeIcon icon={faUsers} />
                <p className="text-small color-63 text-center">Cursos actuales</p>
              </NavLink>
          </div>
    </li>    
    <li title="Historial de cursos" className="Nav__link-push">
          <div className="text-center"> 
              <NavLink activeClassName="op-active" className="Nav__link"  to="/profesor">
                <FontAwesomeIcon icon={faUsers} />
                <p className="text-small color-63 text-center">Historial</p>
              </NavLink>
          </div>
    </li>        
      <li title="Cronograma semanal de cursos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/cronograma-semanal">
          <FontAwesomeIcon icon={calendar2}/>
            <p className="text-small color-63 text-center">Agenda semanal</p>
          </NavLink>
      </div>
      </li> 
      <li title="Abrir la aplicación en una nueva pestaña" className="Nav__link-push">
        <div className="text-center"> 
          <Link className="Nav__link" to="/" target="_blank">
            <FontAwesomeIcon icon={faClone} />
            <p className="text-small color-63 text-center">Nueva ventana</p>
          </Link>
        </div>
      </li> 
      <li className="Nav__link-push">
      <button className="Perfil__boton-logout" title="Salir" onClick={logout}>
          <FontAwesomeIcon icon={faPowerOff} />
          <span className="text-xxsmall block">Salir</span>
        </button>
      </li>
    
    
    </>
  )}  

  function LoginRoutesAlumno({ usuario, 
    logout, 
    switchVistaBusquedaAlumnos,
    toggle, 
    setComponenteModal, 
    setTitulo,
    abrirMenuVertical,
    toggleMenuVertical }) {

const estilo_prueba = {color:'white',background:'tomato',padding:'3px'}

return (
    <>
    <li title="Mis cursadas" className="Nav__link-push">
          <div className="text-center"> 
              <NavLink activeClassName="op-active" className="Nav__link"  to="/alumno">
                <FontAwesomeIcon icon={faChalkboardTeacher} />
                <p className="text-small color-63 text-center">Mis cursadas</p>
              </NavLink>
          </div>
    </li>     
    <li className="Nav__link-push">
        <button className="Perfil__boton-logout" title="Salir" onClick={logout}>
        <FontAwesomeIcon icon={faPowerOff} />
        <span className="text-xxsmall block">Salir</span>
        </button>
    </li>


    </>
)}

function MenuVertical({setComponenteModal, toggle, setTitulo,toggleMenuVertical,usuario}){
  const [query1,setQuery1] = useState(false)
  const [query2,setQuery2] = useState(false)
  const [query3,setQuery3] = useState(false)
  const [query4,setQuery4] = useState(false)
  const [query5,setQuery5] = useState(false)
  const [query6,setQuery6] = useState(false)

  const cerrar1 = ()=>{
      setQuery1(false)
  }
  const cerrar2 = ()=>{
    setQuery2(false)
  }
  const cerrar3 = ()=>{
    setQuery3(false)
  }
  const cerrar4 = ()=>{
    setQuery4(false)
  }
  const cerrar5 = ()=>{
    setQuery5(false)
  }
  const cerrar6 = ()=>{
    setQuery6(false)
  }
return(
<div className="menu-vertical-nav" onMouseLeave={toggleMenuVertical}>
        <ul className="ul-ml-n20 fixed">
          <li title="Listado y edición de cuatrimestres" className="listado-al p-2" onClick={()=>{setComponenteModal('cuatrimestres')
                          setTitulo('Listado de cuatrimestres')
                           toggle();toggleMenuVertical()}}>Cuatrimestres
          </li>
          <li title="Listado y edición de aulas" className="listado-al  p-2" onClick={()=>{setComponenteModal('aulas')
                            setTitulo('Listado de aulas')
                            toggle();toggleMenuVertical()}}>Aulas
          </li>
          <li title="Listado y edición de instrumentos" className="listado-al  p-2" onClick={()=>{setComponenteModal('instrumentos')
                            setTitulo('Listado de instrumentos')
                            toggle();toggleMenuVertical()}}>Instrumentos
          </li>
          <li title="Listado y edición de materias" className="listado-al  p-2" onClick={()=>{setComponenteModal('materias')
                          setTitulo('Listado de materias')
                          toggle();toggleMenuVertical()}}>Materias
          </li>
          <li title="Finanzas" className="listado-al  p-2" onClick={()=>{setComponenteModal('finanzas')
                          setTitulo('Finanzas')
                          toggle();toggleMenuVertical()}}>Finanzas
          </li>
          <li title="Actualizar tablas secundarias" className="listado-al mt-4 mb-6 p-2" onClick={()=>{setComponenteModal('refrescar')
                          setTitulo('Actualizar tablas secundarias')
                          toggle();toggleMenuVertical()}}><FontAwesomeIcon icon={faSync} /> Refrescar tablas
          </li> 
       
          <li title="Lista comparativa de inscripción entre períodos" className="listado-al p-2">
              <div className="text-center"> 
                  <NavLink activeClassName="op-active" className="Nav__link"  to="/comparativas">
                    <p className="text-small color-63 text-center">Comparativas</p>
                  </NavLink>
              </div>
          </li> 

          <li title="Estadísticas" className="listado-al p-2">
            <div className="text-center"> 
                <NavLink activeClassName="op-active" className="Nav__link"  to="/estadisticas">
                  <p className="text-small color-63 text-center">Estadísticas</p>
                </NavLink>
            </div>
          </li>  
           {(usuario.id_prof == 107 || usuario.id_prof == 200) && <>
            <li title="Logs" className="listado-al mt-4 mb-6 p-2" onClick={()=>{setComponenteModal('logs')
                          setTitulo('Logs')
                          toggle();toggleMenuVertical()}}> Logs (Sólo uso técnico)
            </li>
            <li className="listado-al p-2 mt-6">
              <div className="text-center">
                    <p onClick={()=>setQuery1(!query1)} className="cursor pointer text-small color-63 text-left">Query 1 : Alumnos activos + campos</p>
                    {query1 && 
                    <ExportacionExcel url="/api/tablasgenerales/query/alumnosactdatos" nombre="alumnos activos" columnas={[{titulo:'Alumno',campo:'alumno'},{titulo:'ID',campo:'id_alumno'},{titulo:'E-mail',campo:'email'},{titulo:'Documento',campo:'documento'},{titulo:'Fecha de nacimiento',campo:'fecha_nac'},{titulo:'Domicilio',campo:'domicilio'},{titulo:'Localidad',campo:'localidad'},{titulo:'C.P.',campo:'codpostal'},{titulo:'Teléfono',campo:'telefono'},{titulo:'Celular',campo:'Celular'},{titulo:'Cursadas',campo:'cursos'} ]} cerrar={cerrar1}/>
                    }
              </div>
            </li> 
            <li className="listado-al p-2 mt-2">
              <div className="text-center">
                    <p onClick={()=>setQuery2(!query2)} className="cursor pointer text-small color-63 text-left">Query 2 : Profesores activos + cursos</p>
                    {query2 && 
                    <ExportacionExcel url="/api/tablasgenerales/query/profesactcursos" nombre="profesores cursos activos" columnas={[{titulo:'Profesor',campo:'PROFE'},{titulo:'Código',campo:'CODIGO_MATERIA'},{titulo:'Materia',campo:'NOMBRE_MATERIA'},{titulo:'Día/Hora',campo:'DIA_HORA'},{titulo:'Temporal',campo:'TEMPORAL '}]} cerrar={cerrar2}/>
                    }
              </div>
            </li>             
            <li className="listado-al p-2 mt-2">
              <div className="text-center">
                    <p onClick={()=>setQuery3(!query3)} className="cursor pointer text-small color-63 text-left">Query 3: Cursos activos + campos</p>
                    {query3 && 
                    <ExportacionExcel url="/api/tablasgenerales/query/cursosactalumnos" nombre="cursos activos" columnas={[{titulo:'ID Curso',campo:'nro_curso'},{titulo:'Profesor',campo:'profesor'},{titulo:'Materia',campo:'materia'},{titulo:'Día/Hora',campo:'dia_hora'},{titulo:'Aula',campo:'aula'},{titulo:'Cuatrimestre',campo:'cuatrimestre'},{titulo:'Alumnos',campo:'cant_alumno'}]} cerrar={cerrar3}/>
                    }
              </div>
            </li>  
            <li className="listado-al p-2 mt-2">
              <div className="text-center">
                    <p onClick={()=>setQuery4(!query4)} className="cursor pointer text-small color-63 text-left">Query 4: Cursos activos + alumnos</p>
                    {query4 && 
                    <ExportacionExcel url="/api/tablasgenerales/query/cursosactlistaalumnos" nombre="cursos activos detalle alumnos" columnas={[{titulo:'ID Curso',campo:'nro_curso'},{titulo:'Profesor',campo:'profesor'},{titulo:'Materia',campo:'materia'},{titulo:'Día/Hora',campo:'dia_hora'},{titulo:'Aula',campo:'aula'},{titulo:'Cuatrimestre',campo:'cuatrimestre'},{titulo:'Alumnos',campo:'cant_alumno'},{titulo:'Alumno',campo:'alumno'}]} cerrar={cerrar4}/>
                    }
              </div>
            </li> 
            <li className="listado-al p-2 mt-2">
              <div className="text-center">
                    <p onClick={()=>setQuery5(!query5)} className="cursor pointer text-small color-63 text-left">Query 5: Inscriptos según modalidad</p>
                    {query5 && 
                    <ExportacionExcel url="/api/tablasgenerales/query/inscriptospormodalidad" nombre="inscriptos por modalidad" columnas={[{titulo:'Modalidad',campo:'modo'} ,{titulo:'Alumno',campo:'alumno'},{titulo:'ID',campo:'id_alumno'},{titulo:'E-mail',campo:'email'},{titulo:'Documento',campo:'documento'},{titulo:'Fecha de nacimiento',campo:'fecha_nac'},{titulo:'Domicilio',campo:'domicilio'},{titulo:'Localidad',campo:'localidad'},{titulo:'C.P.',campo:'codpostal'},{titulo:'Teléfono',campo:'telefono'},{titulo:'Celular',campo:'Celular'}]} cerrar={cerrar5}/>
                    }
              </div>
            </li> 
            <li className="listado-al p-2 mt-2">
              <div className="text-center">
                    <p onClick={()=>setQuery6(!query6)} className="cursor pointer text-small color-63 text-left">Query 6: Estadísticas Inscriptos</p>
                    {query6 && 
                    <ExportacionExcel url="/api/tablasgenerales/query/inscriptosestadisticas" nombre="Estadísticas de inscriptos" columnas={[{titulo:'Virtual',campo:'virtual'} ,{titulo:'Presencial',campo:'presencial'},{titulo:'Mixto',campo:'mixto'},{titulo:'Total',campo:'total'}]} cerrar={cerrar6}/>
                    }
              </div>
            </li>                         
          </>}
        </ul>
    </div>

  )
}

function SeleccionarComponenteModal({componente}){
 
  switch(componente){
    case  'aulas' : return <Aulas/>
    break;
    case 'materias' : return <Materias/>
    break;
    case 'instrumentos' : return <Instrumentos/>
    break;
    case 'cuatrimestres' : return <Cuatrimestres/>
    break;
    case 'refrescar' : return <RefrescarTablas/>
    break; 
    case 'logs' : return <Logs/>
    break;        
    //case 'finanzas' : return <Finanzas/>
    break;        
    default: return null
  }
}

