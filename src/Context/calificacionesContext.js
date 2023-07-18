import React, { useState, useEffect, useMemo } from 'react';

// Primero creo un contexto
const CalificacionesContext = React.createContext();

// Segundo creo un Provider que es una función que recibe props y retorna un objeto value con
// propiedades y métodos y los pondrá a disposición de cualquier componente que quiera conectarse
// con este contexto 

export function CalificacionesProvider(props){
    const [alumnoObservacion,setAlumnoObservacion] = useState(null);
    const [idGrabarNotas,setIdGrabarNotas] = useState(0);


    function agregarAlumnoObservacion(alumno){
        setAlumnoObservacion(alumno)
    } 

    function actualizarNotas(){
        setIdGrabarNotas(Math.random())
    } 

    const value = useMemo(()=>{
        return (
            {  alumnoObservacion, agregarAlumnoObservacion,actualizarNotas,idGrabarNotas}
        )
    },[alumnoObservacion,idGrabarNotas]) // usamos useMemo para decirle que retorne siempre el mismo objeto 
                // a menos que cambie la propiedad alumno o mensaje. Si alumno o el mensaje
                // cambia vuelve a crear el objeto value.
    return <CalificacionesContext.Provider value={value} {...props}/>
}

// Para que los componentes puedan consumir este contexto hay que exportar un hook
// para que se importe

export function useCalificaciones(){ // este hook lo va a usar el comonente que desee consumir este contexto
    const context = React.useContext(CalificacionesProvider)

    if (!context){
        throw new Error("useCalificaciones debe estar dentro del proveedor CalificacionesContext")
    } // Si utilizamos este hook en un componente que no esté conectado con el contexto
      // sea el mismo o alguno de sus padres. Es decir que el contexto debe envolver a la 
      // rama que va a usar el mismo.
      return context; // aqui retornamos para el consumidor el objeto value
}