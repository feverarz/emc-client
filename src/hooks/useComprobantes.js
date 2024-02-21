import { useEffect, useState } from 'react'
import Axios from 'axios'
import { parsearArchivoInfo } from "../Helpers/nuevoAlumno-helper"

export const useComprobante = () => {
    const [loading, setLoading] = useState(false)
    const [comprobantes, setComprobantes] = useState(null)

    useEffect(()=> {
        buscarComprobantes();
    }, [])

    useEffect(() => {
        if (!!comprobantes) {
            console.log(comprobantes)
        }
    }, [comprobantes])

    async function buscarComprobantes(){
        setLoading(true)
        try{           
            const {data} = await Axios.get(`/api/alumnos/obtenerarchivos`)
            const archivosParseados = data.archivos.map(parsearArchivoInfo)
            setComprobantes(archivosParseados);
            setLoading(false)
        }catch(err){
            setLoading(false)
            console.log(err);
        }
    }

    const eliminarArchivo = async (nombreId) => {
        setLoading(true)
        try{           
            await Axios.delete(`/api/alumnos/borrarComprobantePago/${nombreId}`)
            buscarComprobantes()
        }catch(err){
            setLoading(false)
            console.log(err);
        }
    }

    const descargarArchivo = async (nombreId) => {
        setLoading(true);
        try {           
            const response = await Axios.get(`/api/alumnos/descargarComprobantePago/${nombreId}`, {
                responseType: 'blob' 
            });
    
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreId);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.log(err);
        }
    };


    return { comprobantes, eliminarArchivo, descargarArchivo, loading }
}