import React, { useState, useEffect, useMemo } from 'react';
import Axios from 'axios';
import { setToken, deleteToken, getToken } from '../Helpers/auth-helpers';

const NotasContext = React.createContext();

export function NotasProvider(props) {
  const [idGrabar, setIdGrabar] = useState(0); // no sabemos si hay un usuario autenticado
  const [notasGrupales,setNotasGrupales] = useState([])
  const [hayNotasModificadas,setHayNotasModificadas] = useState(false)

  function actualizarNota (){
      setIdGrabar(Math.random())
  }

  function subirNotas (notas){
    setIdGrabar(Math.random())
  }

  function notificarModificacionNotas (status){
    setHayNotasModificadas(status)
  }

  function reiniciarModificacionNotas (){
    setHayNotasModificadas(false)
  }

const recibirNotasIndividualesAvector = (notas)=>{
    // vamos a actualizar el vector notasGrupales con las últimas notas ingresadas para un alumno
    // para eso primero usamos un vector auxiliar en el que excluimos las notas del alumno en cuestión

    const aux = notasGrupales.filter(item=>item.id_alumno!=notas.id_alumno)

    // luego actualizamos el vector notasGrupales como la suma del vector auxiliar + las notas recibidas

    setNotasGrupales([...aux,notas])
}

const mostrarNotasGrupales = ()=>{
    console.log('notasGrupales',notasGrupales)
}

  const value = useMemo(() => {
    return {
        idGrabar,
        actualizarNota,
        reiniciarModificacionNotas,
        recibirNotasIndividualesAvector,mostrarNotasGrupales,notificarModificacionNotas,hayNotasModificadas
    };
  }, [notasGrupales,idGrabar,hayNotasModificadas]);

  return <NotasContext.Provider value={value} {...props} />;
}

export function useNotas() {
  const context = React.useContext(NotasContext);
  if (!context) {
    throw new Error('useNotas debe estar dentro del proveedor NotasContext');
  }
  return context;
}
