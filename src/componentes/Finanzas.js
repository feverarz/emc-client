import React from 'react'

export const Finanzas = ()=>{
    return <div>
        <h1>Finanzas</h1>
                <input  
                autoComplete={"off"} 
                name={item[0]} 
                maxLength={53}
                disable = {item[0]=='nombre' || visualizacion}
                onBlur = {(e)=>verificarValor(e)}
                className={claseSegunColumnaFila(item[0],notas[item[0]])}
                onFocus={(e)=>handleFocus(e,item[0])} 
                onKeyDown={(e)=>comprobarTecla(e)} 
                value={item[0]=='nombre' || visualizacion ? columnas[item[0]] : notas[item[0]]}   //ls diferencia es que si toma el value de columnas[nombre_campo] (el que viene como parametro) no va a cambiar su valor aunque trate de modificarlo el usuario. Cuando el value lo tomo de valor[nombre_campo] el valor lo toma del estado que ha cambiado por efecto del evengo onChange
                onChange={(e)=>{
                        cambiar(e)
                }} 
                id={fila+item[0]} type="text"
            />
    </div>
}