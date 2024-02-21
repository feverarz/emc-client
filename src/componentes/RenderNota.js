import React from 'react'

export default function RenderNota({notas}){

    if(huboRecuperatorios(notas)) {
       return <div className="c-prome ml-2 bg-blueR" style={{width:'auto'}} title="Promedio (Con recuperatorio)"><span className="c-promi">{notas.promedio}</span><b className='text-white text-small mr-2'>R</b></div>
    }else{
       return <div className="c-prome ml-2 bg-tomato" title="Promedio"><span className="c-promi">{notas.promedio}</span></div>
    }
}

const huboRecuperatorios = (notas)=>{
    return notas.columna_1_rec || notas.columna_2_rec
    || notas.columna_3_rec || notas.columna_4_rec
    || notas.columna_5_rec || notas.columna_6_rec
    || notas.columna_7_rec || notas.columna_8_rec
}
