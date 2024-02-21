import React from 'react'


export const useTratamientosEncabezados = ()=>{
    

    const nota_final_tratamiento1 = (notaFinal,objetoNotas,notas,encabezadoCompleto,notaRef)=>{
        let texto = ''
    
            const mapearNotasPorEncabezado = Object.entries(notas)
                                            .filter(item=>item[1] != null && item[0] != 'promedio' )
                                            .map(item=>{
                                                return [...item,encabezadoCompleto[item[0]]]
                                            })
        
            // REGLA 1: Comprobar que la estructura sea correcta
            const nombres_requeridos = ['Escrito Midterm','Oral Midterm','Escrito Final','Oral Final','Tps']
            
            let flag_estructura = true
        
            nombres_requeridos.forEach(item=>{
                const nombre_buscado_upp = item.toUpperCase()
                const encontrado = mapearNotasPorEncabezado.some(item=>item[2].toUpperCase()==nombre_buscado_upp)
                if(!encontrado){
                    flag_estructura = false
                }
            })
        
            if(!flag_estructura){
                escribirLog(notaRef,'CALIFICACIÓN = 1 PORQUE NO SE ENCONTRÓ LA ESTRUCTURA ADECUADA PARA EL nro_tratamiento=1 -  regla 1')
                console.log('Estructura esperada: ',nombres_requeridos)
                return desaprobadoPorFaltaDeEstructura()
            }
        
            const finales = mapearNotasPorEncabezado.filter(item=>item[2].toUpperCase().includes('FINAL'))
            const midterms = mapearNotasPorEncabezado.filter(item=>item[2].toUpperCase().includes('MIDTERM'))
            const finalOral = finales.filter(item=>item[2].toUpperCase().includes('ORAL')).map(item=>isNaN(item[1]) ? 0 : Number(item[1]))
            const finalEscrito = finales.filter(item=>item[2].toUpperCase().includes('ESCRITO')).map(item=>isNaN(item[1]) ? 0 : Number(item[1]))
            const midtermOral = midterms.filter(item=>item[2].toUpperCase().includes('ORAL')).map(item=>isNaN(item[1]) ? 0 : Number(item[1]))
            const midTermEscrito = midterms.filter(item=>item[2].toUpperCase().includes('ESCRITO')).map(item=>isNaN(item[1]) ? 0 : Number(item[1]))
    
            console.log(finales,midterms)
            console.log(`FN ORAL ${finalOral[0]}`,` FN ESCRITO${finalEscrito[0]}`)
            console.log(`MT ORAL ${midtermOral[0]}`,`MT ESCRITO ${midTermEscrito[0]}`)
    
            if (finalesDesaprobados(finalOral,finalEscrito)){
                console.log('A')
                escribirLog(notaRef,`A - Finales desaprobados <51`)
                return desaprobado(notaFinal)
            }
    
            if (examenesAprobados(finalOral,finalEscrito)){
                if(examenesAprobados(midtermOral,midTermEscrito)){
                    console.log('B')
                    escribirLog(notaRef,`B Finales y midterms aprobados`)
                    if(promedioFinalesOK(finalOral,finalEscrito)){
                        return Math.round(notaFinal).toString()
                    }else{
                        console.log('O')
                        escribirLog(notaRef,`O - El promedio de los finales no es suficiente`)
                        return desaprobado(notaFinal)
                    }
                }
            }
    
            if(estaDesAprobado(midtermOral[0])){
                if(estaDesAprobado(finalOral[0])){
                    console.log('C')
                    escribirLog(notaRef,`C Mid y final oral desaprobados`)
                    return desaprobado(notaFinal)
                }
            }
    
            if(estaDesAprobado(midTermEscrito[0])){
                if(estaDesAprobado(finalEscrito[0])){
                    console.log('D')
                    escribirLog(notaRef,`D Mid y final escrito desaprobados`)
                    return desaprobado(notaFinal)
                }
            }
    
            if(estaAprobado(midtermOral[0])){
                if(estaDesAprobado(finalOral[0])){
                    if(Number(finalOral[0]<51)){
                        console.log('F')
                        escribirLog(notaRef,`F Mid oral aprobado, Final oral < 51`)
                        return desaprobado(notaFinal)
                    }else if (desaprobadoCondicional(finalOral)){
                            console.log('G')
                            escribirLog(notaRef,`G Mid oral aprobado, Final oral e/51 y 59`)
                            const resultado =  analizarSegundonivel(midTermEscrito,finalEscrito,notaFinal,'escrito',notaRef.current.innerText,notaRef)
                    
                            return procesarResultado(resultado,finalOral,finalEscrito,notaRef)
                    
                        }else{
                        console.log('H')
                        escribirLog(notaRef,`H Mid oral aprobado, Final oral aprobado`)
                        const resultado =  analizarSegundonivel(midTermEscrito,finalEscrito,notaFinal,'escrito',notaRef.current.innerText,notaRef)
      
                        return procesarResultado(resultado,finalOral,finalEscrito,notaRef)
    
                    }
                }else{
                    console.log('I')
                    escribirLog(notaRef,`I`)
                    const resultado =  analizarSegundonivel(midTermEscrito,finalEscrito,notaFinal,'escrito',notaRef.current.innerText,notaRef)
    
                    return procesarResultado(resultado,finalOral,finalEscrito,notaRef)
    
                }
            }else{
                if(estaDesAprobado(finalOral[0])){
                        console.log('J')
                        escribirLog(notaRef,`J mid oral desaprobado final desaprobado `)
    
                        return desaprobado(notaFinal)
    
                }else{
                    console.log('I')
                    escribirLog(notaRef,`I mid oral desaprobado final aprobado`)
                    const resultado =  analizarSegundonivel(midTermEscrito,finalEscrito,notaFinal,'escrito',notaRef.current.innerText,notaRef)
                    
                    return procesarResultado(resultado,finalOral,finalEscrito,notaRef)
    
                }
            }
            
        }


        const procesar_nro_tratamiento = (nro_tratamiento,notaFinal,objetoNotas,notas,encabezadoCompleto,notaRef)=>{

            switch(nro_tratamiento){
                case 1 : return nota_final_tratamiento1(notaFinal,objetoNotas,notas,encabezadoCompleto,notaRef)
                //case 2 : return nota_final_tratamiento2(notaFinal,objetoNotas,notas,encabezadoCompleto)
                //case 3 : return nota_final_tratamiento3(notaFinal,objetoNotas,notas,encabezadoCompleto)
                default : return nota_final_tratamiento1(notaFinal,objetoNotas,notas,encabezadoCompleto,notaRef)
            }
         
        }

        function calcularPromedio(notas,regimen,vectorColumnasInstanciasFinales,curso,encabezadoCompleto,notaRef){
            let notaFinal = 0
        
            if (!regimen.prom_automatico){
                return notas.promedio
            }
            
            const objetoNotasAvector = Object.entries(notas).filter(item=>!isNaN(item[1]) && item[1] != null && item[0] != 'promedio' )
        
            notaFinal = objetoNotasAvector.reduce((acum,item)=>{
                    const nombreColumna = item[0];
                    const valorColumna = Number(item[1])
                    const porcentaje = regimen[nombreColumna]
                    const valorParcial = (valorColumna*porcentaje/100)
                    return acum + valorParcial
            },0)
        
        
        if (curso.nro_tratamiento){ // cuando el encabezado del curso tiene un número de tratamiento aplico una regla particular identificada con ese numero, son casos que salen de la regla standard de como se calcula la nota final
            notaFinal = procesar_nro_tratamiento(curso.nro_tratamiento,notaFinal,objetoNotasAvector,notas,encabezadoCompleto,notaRef)
        }else{
        /*
        REGLA STANDARD ( Cuando el encabezado no tiene un nro_tratamiento específico)
        Para que una materia esté aprobada (Nota Final > 60), 
        todas las instancias de finales deben estar aprobadas 
        (Examen y/o Proyecto Final). 
        En caso de no estar aprobada alguna, la Nota Final no debe superar el 59. 
        */
            const vectorInstanciasFinalesAprobadas = objetoNotasAvector.filter(item=>vectorColumnasInstanciasFinales.some(item2=>item[0]==item2) && Number(item[1])>=60)
            
            if (vectorInstanciasFinalesAprobadas.length<vectorColumnasInstanciasFinales.length){
                if (notaFinal>59){
                    notaFinal = 59
                }
            }
        }
        
            return Math.round(notaFinal).toString()
        }

    const desaprobado = (notaFinal)=>{
        // return 59
        console.log('amigo')
        return Number(notaFinal) < 59 ? notaFinal : 59 // pedido por luciano, que desapruebe con la nota menor
    }
    
    const desaprobadoPorFaltaDeEstructura = ()=>{
        return 1
    }
    
    const examenesAprobados = (Oral,Escrito)=>{
       return Number(Oral[0])>59 && Number(Escrito[0])>59
    }
    
    
    const finalesDesaprobados = (finalOral,finalEscrito)=>{
    //    return Number(finalOral[0])<41 || Number(finalEscrito[0])<41
        return Number(finalOral[0])<51 || Number(finalEscrito[0])<51
    }
    
     const desaprobadoCondicional = (nota)=>{
        console.log('desaprobado condicional',nota[0])
    
    //    return Number(nota[0])<59 && Number(nota[0])>40
        return Number(nota[0])<59 && Number(nota[0])>50
    
     }
    
     const promedioFinalesOK = (finalOral, finalEscrito)=>{
            const promedio = (Number(finalOral)+Number(finalEscrito))/2
            return promedio >= 60
     }
    
     const estaAprobado = (nota)=>{
        return Number(nota)>59
     }
    
     const estaDesAprobado = (nota)=>{
        return Number(nota)<60
     }
    
     const escribirLog = (notaRef,texto) =>{
        if(notaRef){
            notaRef.current.innerText = texto
        }
        console.log(texto)
     }
    
     const analizarSegundonivel = (midterm,final,notaFinal,nombre,texto,notaRef)=>{
    
        console.log(midterm,final, notaFinal)
        console.log(nombre)
        if(estaAprobado(midterm[0])){
            if(estaAprobado(final[0])){
                console.log('zzz')
                escribirLog(notaRef,`${texto} mid ${nombre} aprobado final ${nombre} aprobado`)
                return Math.round(notaFinal).toString()
            }else{
                if(desaprobadoCondicional(final)){
                    console.log('xxx')
                    escribirLog(notaRef,`${texto} mid ${nombre} aprobado final ${nombre} e/ 51 y 59`)
                    return Math.round(notaFinal).toString()
                }else{
                    console.log('yyy')
                    escribirLog(notaRef,`${texto} mid ${nombre} aprobado final ${nombre} <51`)
                    return desaprobado(notaFinal)
                }
            }
        }else{
            if(estaAprobado(final[0])){
                console.log('ttt')
                escribirLog(notaRef,`${texto} mid ${nombre} desaprobado final ${nombre} aprobado`)
                return Math.round(notaFinal).toString()
            }else{
                console.log('uuu')
                escribirLog(notaRef,`${texto} mid ${nombre} desaprobado final ${nombre} desaprobado`)
                return desaprobado(notaFinal)
            }
        }
     }
    
     const procesarResultado = (resultado,finalOral,finalEscrito,notaRef)=>{
        if(Number(resultado)>59){
            if(promedioFinalesOK(finalOral,finalEscrito)){
                return resultado
            }else{
                console.log('O')
                escribirLog(notaRef,`O - El promedio de los finales no es suficiente`)
                return desaprobado(notaFinal)
            }
        }else{
            return resultado
        }
     }

return {calcularPromedio}
}