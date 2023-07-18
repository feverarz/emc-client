import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Axios from 'axios';
import {_imagenLogo} from '../imagenesBase64/logo'
import {_membrete} from '../imagenesBase64/membrete'
import {_firma} from '../imagenesBase64/firma'

import Swal from 'sweetalert2';


    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    export function imprimir(datos){

        try{
            generarConstancia(datos)
            Swal.close();
        }catch(err){

        const mensaje_html = `<p>Hubo un error al imprimir las cursadas y notas</p><p>${err}</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })
        }
    }

function generarConstancia(datos) {
    const fecha = fechaDelDia();

    var cuerpo_del_reporte = 

    datos.map((item,index,vector)=>{
        return [
    {stack: [ // encierro todo el contenido que deseo envolver en un objeto {stack:[]} y le asigno el atributo unbreakable:true para que todo lo que esté encerrado en ese stack no se rompa en páginas diferentes
        imprimirPeriodo(item,index,vector),
        imprimirNotas(item.curso,item.encabezado,item.notas),
        {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 0.5,dash: {length: 1, space: 2},lineColor: 'black' }]},
    ],unbreakable: true}]})

        var docDefinition = {
//            pageMargins: [ 100, 50, 50, 100 ],
            header: function(currentPage, pageCount, pageSize) {
                // you can apply any logic and return any valid pdfmake element
                return [{text:`Fecha de impresión: ${fecha}`, margin: [0, 30, 30, 0],alignment: 'center',fontSize:8}]
 
            },
            footer: function (currentPage, pageCount, pageSize) { 
                return {
                    margin: [0, 50, 0, 0], //el margin inferior de la página (pageMargins) tiene que ser tal que sea consistente con el margen superior del footer, si no el footer desaparece
                    table: {
                        
                        widths: ['*'],
                        body: [
                            [{ text: 'Escuela De Música Contemporánea S.A - Bartolomé Mitre 1352 - (C1036AAZ) - Ciudad Autónoma de Buenos Aires - Argentina', fontSize: 8, alignment: 'center' }],
                            [{ text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'center', fontSize: 8 }]
                        ]
                    },
                    layout: 'noBorders'
                    
                        } 
            },
            pageMargins: [25, 100, 25, 100], // el margen de 100 para el top es necesario para que la imagen de la cabecera no se solape con el contenido
            // por otro lado el margin inferior tiene que ser tal que sea consistente con el margen superior del footer, si no el footer desaparece
            background: function() {
                return {image: _membrete, width:600}
            },
            content: [

                cuerpo_del_reporte
            ],
            defaultStyle: {
                fontSize: 10,
              },
            styles: {
                header: {
                    alignment: 'right'
                },
                estilo_tabla: {
                    fontSize: 11,
                    bold: true,
                },
                body: {
                    lineHeight:1.5
                }
            },
            images: {
                building: 'data:/Content/img/logo1.jpg'
            }
        };

        Swal.fire({
            html: 'Buscando...',
            timer: 600,
            onBeforeOpen: () => {
                Swal.showLoading()
            },
        }).then(data=>{
            var nombre = `Mis notas`
            /*if (descargar){
                pdfMake.createPdf(docDefinition).download(nombre);
            }else{
                pdfMake.createPdf(docDefinition).open();
            }*/

            pdfMake.createPdf(docDefinition).open();

        })

    }

    function fechaDelDia(){
        let fecha;
    
        const fecha_aux  = new Date()
        const dia = fecha_aux.getDate() < 10 ? `0${fecha_aux.getDate()}` : fecha_aux.getDate();
        let mes = fecha_aux.getMonth() + 1 ;
        mes = mes < 10 ? `0${mes}` : mes;
        fecha = `${dia}/${mes}/${fecha_aux.getUTCFullYear()}`
    
        return fecha;
    }


    function imprimirNotas(curso,encabezado,notas){

        const encabezados_como_vector = Object.entries(encabezado)

        const vector_notas_segun_encabezado = encabezados_como_vector
        .filter((item,index)=>index>0 && item[1]!=null && item[1]!='Condicional' && !item[0].includes('rec') && item[1]!='Promedio' && item[1]!='Concepto')
        .map(item=>{ return [{text: item[1],alignment:'center',background: item[1]=='Nota final' ? "#ff6347" : "#a7c4dd"},{text:definirImpresionNota(item,notas),alignment:'center',margin:[0,6]}] })

        const anchos = vector_notas_segun_encabezado.map(item=>50)

        return {
            alignment:'center',
            margins:[0,20,0,20],
            table: {
                widths: [200,...anchos],
                body: [
                    [[{text:curso.descripcion,alignment:'left',fontSize: 12,bold:true,margin:[0,3]},{text:`${curso.profesor}`,alignment:'left',fontSize: 8},{text:`${curso.DiaHora} (${curso.tipo})`,alignment:'left',fontSize: 8},{text:`${curso.virtual ? 'Cursada virtual' : 'Cursada presencial'}`,alignment:'left',fontSize: 8}],...vector_notas_segun_encabezado]
                ],
                alignment:'center',

            }
        }

    }

    function imprimirPeriodo(item,index,vector){
        if(vector.length>1){
            if (index>0){
                if (vector[index-1].curso.periodo==item.curso.periodo){
                    return ''            
                }else{
                    // si hubo cambio de perído siempre imprimo
                       return {
                            fontSize: 12,
                            bold:true,
                            margin:[0,20,0,20],
                            width: 200,
                            text: item.curso.periodo,
                            alignment:'center'
                        }
                }
            }else{
                //si es el primer registro siempre imprimo el período
                return {
                    fontSize: 12,
                    bold:true,
                    margin:[0,20,0,20],
                    width: 200,
                    text: item.curso.periodo,
                    alignment:'center'
                }
            }
        }else if (vector.length==1){
    
            return 	 {
                fontSize: 12,
                bold:true,
                margin:[0,20,0,20],
                width: 200,
                text: item.curso.periodo,
                alignment:'center'
            }
        }else{
            return  {
                fontSize: 12,
                bold:true,
                margin:[0,20,0,20],
                width: 200,
                text: 'No se encontraron notas',
                alignment:'center'
            }
        }
    
    }

const definirImpresionNota = (item,notas)=>{

    if(notas[`${item[0]}_rec`] && !esRecuperatorioSinNota('rec',notas[`${item[0]}_rec`])){
        return `${notas[item[0]]}
         (Rec: ${notas[`${item[0]}_rec`]})`
    }else{
        return notas[item[0]]
    }

}

const esRecuperatorioSinNota = (nombre,nota)=>{
    let respuesta

    if(nombre.includes('rec')){
        if(nota!=undefined){
            respuesta = (Number(nota)==0 || isNaN(nota))
        }else{
            respuesta = true
        }
    }else{
        respuesta = false
    }

    return respuesta
}

