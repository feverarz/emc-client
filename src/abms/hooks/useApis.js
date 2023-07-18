import React from 'react';
import Axios from 'axios';
import {transformarIso8601,fechaActual,fechaEnFuncionhoy} from '../../Helpers/fechas'

export const useApis = ()=>{

const [becas,setBecas] = React.useState([])
const [cuatrimestres,setCuatrimestres] = React.useState([])
const [cargandoDatos,setCargandoDatos] = React.useState(false);

const buscarBecas = async ()=>{
    try{
        setCargandoDatos(true)
        const {data} = await Axios.get(`/api/tablasgenerales/becas`)
        setBecas(data.map(item=>{return {id:item.id_tipo_beca,nombre:item.nombre}}))
        setCargandoDatos(false)
    }catch(err){
        setCargandoDatos(false)
        console.log(err)
    }
}

const buscarCuatrimestres = async ()=>{
    try{
        setCargandoDatos(true)
        const {data} = await Axios.get(`/api/tablasgenerales/cuatrimestres`)
        setCargandoDatos(false)
        setCuatrimestres(data
            .filter(item=>(fechaEnFuncionhoy(transformarIso8601(item.f_hasta),'mayor','DD/MM/YYYY')))
            .map(item=>{return {id:item.id_cuatrimestre,nombre:item.nombre}})
        )
    }catch(err){
        setCargandoDatos(false)
        console.log(err)
    }
}

const grabarBeca = async (values)=>{
    try{
        const resultado = await Axios.post('/api/tablasgenerales/beca',values)
        return [true,'Se grabó la beca correctamente']
    }catch(err){
        console.log('Error al grabar la beca', err)
        return [false,err?.response?.data?.message || 'Se produjo un error al grabar la beca']
    }
}

return {becas,cuatrimestres,cargandoDatos,buscarBecas,buscarCuatrimestres,grabarBeca}

}

