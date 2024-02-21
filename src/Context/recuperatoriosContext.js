import React, { useState, useEffect, useMemo } from 'react';
import Axios from 'axios';
import { setToken, deleteToken, getToken } from '../Helpers/auth-helpers';

const RecuperatoriosContext = React.createContext();

export function RecuperatoriosProvider(props) {
    const [recuperatorios,setRecuperatorios] = useState([])


  function actualizarRecuperatorios (curso_alumnos_seleccionados,eliminacion,vaciado){

    if (vaciado){
        setRecuperatorios([])
        return
    }

    if (eliminacion){
        const diferencia = recuperatorios.filter(item=>item.nro_curso!=curso_alumnos_seleccionados.nro_curso)
        setRecuperatorios([...diferencia]) 
        return
    }

    if (recuperatorios.some(item=>item.nro_curso==curso_alumnos_seleccionados.nro_curso)){
      const diferencia = recuperatorios.filter(item=>item.nro_curso!=curso_alumnos_seleccionados.nro_curso)
      setRecuperatorios([...diferencia,curso_alumnos_seleccionados]) 
    }else{
        setRecuperatorios([...recuperatorios,curso_alumnos_seleccionados])
    }

  }

  const value = useMemo(() => {
    return {
        actualizarRecuperatorios,recuperatorios
    };
  }, [recuperatorios]);

  return <RecuperatoriosContext.Provider value={value} {...props} />;
}

export function useRecuperatorios() {
  const context = React.useContext(RecuperatoriosContext);
  if (!context) {
    throw new Error('useRecuperatorios debe estar dentro del proveedor RecuperatoriosContext');
  }
  return context;
}
