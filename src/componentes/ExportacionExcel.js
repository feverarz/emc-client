import React, {useState, useEffect} from 'react';
import {seleccionarTextoInput} from '../Helpers/utilidades-globales';
import ReactExport from "react-export-excel";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export default function ExportacionExcel({url,columnas,nombre,cerrar}){
const [datos,setDatos]=useState([])
const [buscando,setBuscando]=useState(false)

useEffect(()=>{
    const buscarDatos = async ()=>{
        setBuscando(true)
        try{
            const {data} = await Axios.get(url)
            setDatos(data)
            setBuscando(false)
        }catch(err){
            setBuscando(false)
            alert(err)
        }
    }
    
    buscarDatos()
},[])

if (buscando){
    return <p>Buscando datos...</p>
}

if (!datos){
    return null
}

return  <ExcelFile filename={nombre} element={
    <span onClick={cerrar} className="cursor-pointer botonNc ml-6" >
        <FontAwesomeIcon className="color-tomato" icon={faFileExcel}/> Exportar a Excel
    </span> 
}>
    <ExcelSheet data={datos} name="Data">
        {columnas.map(item=>{
            return <ExcelColumn label={item.titulo} value={item.campo}/>
        })}
    </ExcelSheet>
</ExcelFile>
}
 

