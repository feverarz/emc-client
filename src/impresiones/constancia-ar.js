import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Axios from 'axios';
import {_imagenLogo} from '../imagenesBase64/logo'
import {_membrete} from '../imagenesBase64/membrete'
import {_firma} from '../imagenesBase64/firma'

import Swal from 'sweetalert2';


    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    export function imprimir(cuerpo,lugar,fechaString,alumno,descargar){

        try{
            generarConstancia(cuerpo,lugar,fechaString,alumno,descargar)
            Swal.close();
        }catch(err){

        const mensaje_html = `<p>Hubo un error al imprimir la constancia</p><p>${err}</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })
        }
    }

function generarConstancia(cuerpo,lugar,fechaString,alumno,descargar) {
        var docDefinition = {
//            pageMargins: [ 100, 50, 50, 100 ],
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

/*                {
                    columns: [
                        {
                            image: _imagenLogo,
                            width: 200, 
                        },
                        //{
                        //         text: `Escuela de Música Contemporánea`, margin: [2, 25], style: 'anotherStyle' 
                        //},
                    ]
                },
*/
                

                {
                    text: `${lugar},  ${fechaString}`, margin: [2, 60,0,40] , style: 'header' },
                    //cuerpo,
                    {
                        text: cuerpo,
                         margin:[60,0,60,0]
                    }
                    ,
                    {
                        image: _firma,
                        fit: [150, 150],
                        margin: [2, 60,0,40],
                        alignment:'center'
                    },
            ],
            defaultStyle: {
                fontSize: 10,
              },
            styles: {
                header: {
                    alignment: 'right'
                },
                anotherStyle: {
                    fontSize: 15,
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
        //pdfMake.createPdf(docDefinition).download("unnombre");
        // pdfMake.createPdf(docDefinition).open();

        Swal.fire({
            html: 'Buscando...',
            timer: 600,
            onBeforeOpen: () => {
                Swal.showLoading()
            },
        }).then(data=>{
            var nombre = `CONSTANCIA-AR ${alumno.nombre} ${alumno.apellido} ID ${alumno.id_alumno}`
            if (descargar){
                pdfMake.createPdf(docDefinition).download(nombre);
            }else{
                pdfMake.createPdf(docDefinition).open();
            }
        })

    }