import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Axios from 'axios';
import {_imagenLogo} from '../imagenesBase64/logo'
import {_membrete} from '../imagenesBase64/membrete'
import Swal from 'sweetalert2';
import {_firma} from '../imagenesBase64/firma'

export function imprimir(cursos,lugar,fechaEmisionString,tipoAnalitico,cuerpo,fechaGraduacionString,alumno,promedio,descargar){
    try{
        generarAnalitico(cursos,lugar,fechaEmisionString,tipoAnalitico,cuerpo,fechaGraduacionString,alumno,promedio,descargar)
    }catch(err){

        const mensaje_html = `<p>Hubo un error al imprimir la constancia</p><p>${err}</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })
        }
}

function generarAnalitico(cursos,lugar,fechaEmisionString,tipoAnalitico,cuerpo,fechaGraduacionString,alumno,promedio,descargar) {

    var array_de_cuatrimestres=[];

        cursos.forEach(function (item, index) { // por cada elemento del array de cursos pregunto si el cuatrimestre existe en el array array_de_cuatrimestres usando el metodo find si no existe lo agrego
           
            if (!array_de_cuatrimestres.find(   // uso find para testear con una función que se ejecuta por cada elemento del array si el cuatrimestre del array cursos existe en el array array_de_cuatrimestres
                function (elemento) {
                    return elemento == item.cuatrimestre
                }
            )) {
                array_de_cuatrimestres.push(item.cuatrimestre)
            }
        })
       
    var array_de_materias=[];

        array_de_cuatrimestres.forEach(
             (item,index) => {

               

                var vector_contenido = cursos.filter(function (elemento) {
                    return elemento.cuatrimestre == item && elemento.incluir==true 
                 }).map(function (elemento, index) {
                     return {
                         materia: { text: elemento.materia }, nota: {
                             text: elemento.notastring, alignment: 'center', headlineLevel: 3} }
                }).map((elemento) => {return Object.values(elemento)})


                if(vector_contenido.length>0){

                    array_de_materias.push({
                        text: `${index + 1}. ${item}`, bold: true, headlineLevel:1
                    })

                    vector_contenido.unshift([{ text: 'Materia', style:'titsecundario'},{text:'Promedio Final',style:'titsecundario'}])

                    array_de_materias.push({
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            widths: [400, 100],
                            body:[
                                //['Materia', 'Promedio final'],['uno','dos'],['tres','cuatro']
                                ...vector_contenido
                            ]
                        },
                        layout: 'xx'
                    })
                }
               }
        );

        var docDefinition = {
        // aquí se definen las reglas para cambiar de página
            pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {

                if (currentNode.headlineLevel === 1) {
                    var titulo_no_separado = followingNodesOnPage.some(function (item) {
                        return item.headlineLevel == 3
                    })
                }
                // fuerza el cambio de página en 2 casos solamente

                // si el comentario final ocupa 2 páginas significa que una línea queda en la página 1 y la otra en la página 2 por ejemplo porque quedó al final de la primera página
                // para forzar que este párrafo esté en una sola página fuerzo un corte de página para que quede al principio de la siguiente todo junto
                // para identificar el comentario final le asigné el headlineLevel= 2.
                // Un comentario final normal ocuparía 1 sola página, solo si se ocupa 2 páginas significa que quedó partido y lo evitamos generando una página nueva
                
                // el otro caso es cuando hay un título de cuatrimestre y queda solo al final de una página quedando el detalle de ese cuatrimestre en la siguiente.
                // queremos evitar esto, es decir que deseamos que quede el título del cuatrimestre y su detalle en la misma página
                // para identificar un título de cuatrimestre le asignamos el headlineLevel = 1
                // a los textos con la nota le asignamos el headlineLevel = 3 para identificarlos
                // si encuentro un titulo analizo el contenido de followingNodesOnPage, si encuentro alguno con headlineLevel = 3 significa que dentro de la misma página hay detalle
                // del cuatrimestre correspondiente al titulo analizado, si no encuentra algún headlineLevel = 3 para ese título significa que quedó partido el detalle en la otra página
                // para evitar esto fuerzo un salto de página.

                return (currentNode.headlineLevel === 2 && currentNode.pageNumbers.length > 1) || (currentNode.headlineLevel === 1 && !titulo_no_separado ); // de esta manera me aseguro que el nodo con headlineLevel= 2 que lo asigne al comentario final no ocupe 2 paginas, sino 1. SI ocupase 2 paginas significa que quedó partido
            },

            pageMargins: [25, 100, 25, 100], // el margen de 100 para el top es necesario para que la imagen de la cabecera no se solape con el contenido
                                             // por otro lado el margin inferior tiene que ser tal que sea consistente con el margen superior del footer, si no el footer desaparece
            /*header: {
                margin: [50,25,50,50],
                columns: [
                    {
                        image: _imagenLogo,
                        width: 150,
                    },
                    { text: lugar + ', ' + fechaEmisionString, margin: [2, 30, 0, 10], style: 'lugarfecha' },

                ]

            },*/

            //footer: function (currentPage, pageCount) { return { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment:'center'} },

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

             background: function() {
                return {image: _membrete, width:600}
            },
            content: [
                { text: lugar + ', ' + fechaEmisionString, margin: [2, 0, 0, 10], style: 'lugarfecha' },
                { text: tipoAnalitico == 'final' ? `Certificado Analítico Final` : `Certificado Analítico Parcial`, margin: [2, 10,0,10], style: 'certificado' },

                {
                    columns:[
                        {
                            style: 'tableExample',
                            table: {
                                headerRows: 0,
                                body: [
                                    [{text:'Alumno',bold:true}, `${alumno.nombre} ${alumno.apellido}`],
                                    [{text:'Id #',bold:true}, `${alumno.id_alumno}`],
                                    [{text:'Documento',bold:true}, `${alumno.documento}`],

                                ]
                            },
                            layout: 'noBorders'
                        },
                        {
                            style: 'tableExample',
                            table: {
                                headerRows: 0,
                                body: [
                                    [{ text: 'Fecha de Nac.', bold: true }, `${transformarFecha(alumno.fecha_nac)}`],
//                                    [{ text: 'Instrumento', bold: true }, `${alumno.instrumentos}`],
                                    [{ text: 'Instrumento', bold: true }, `${alumno.inst_principal.toUpperCase()}`],
                                    [{ text: 'Fecha de inicio', bold: true }, `${transformarFecha(alumno.fecha_insc)}`],
                                ]
                            },
                            layout: 'noBorders'
                        }                               
                    
                    ]

                },

                { text: `Información Académica`, margin: [2, 10], style: 'certificado' },

                { text: tipoAnalitico == 'final' ? `Promedio final: ${promedio} / 100` : `Promedio actual: ${promedio} / 100`, margin: [1, 1]},

                {
                    style: 'tableExample',
                    table: {
                        headerRows: 0,
                        widths: [150, 250],
                        body: [
                            ['A (90-100)', `Excelente`],
                            ['B (80-89)', `Muy Bueno`],
                            ['C (70-79)', `Bueno`],
                            ['D (60-69)', `Regular (Mínima calificación para aprobar)`],
                            ['F (Menos de 59)', `No aprobado`],

                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0;
                        },
                        vLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 1 : 0;
                        },
                        hLineColor: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                        },
                        vLineColor: function (i, node) {
                            return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                        },
                        // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) { return (i === 0 ) ? 15 : 0 },
                        paddingRight: function (i, node) { return (i === node.table.widths.length - 1) ? 15 : 0;  },
                        paddingTop: function (i, node) { return (i === 0) ? 15 : 0  },
                        paddingBottom: function (i, node) { return (i === node.table.body.length - 1) ? 15 : 5  },
                        // fillColor: function (rowIndex, node, columnIndex) { return null; }
                    }
                },                

                //...array_de_cuatrimestres,
                ...array_de_materias,

                { text: `${cuerpo}`, margin: [2, 30], style: 'body', headlineLevel: 2 },
                { text: fechaGraduacionString!='' ? 'Fecha de graduación: ' + fechaGraduacionString : '', margin: fechaGraduacionString!='' ? [2, 10, 0, 0] : [0,0,0,0], style: 'fechagraduacion' },

                '',
                {
                    image: _firma,
                    fit: [150, 150],
                    margin: [2, 20,0,40],
                    alignment:'center'
                },
                //{ text: 'Atentamente,', margin: [0, 50], style: 'anotherStyle' },
            ],
            styles: {
                header: {
                    alignment: 'right'
                },
                anotherStyle: {
                    fontSize: 15,
                    bold: true,
                },
                body: {
                    lineHeight: 1.5
                },
                certificado: {
                    decoration:'underline',
                    bold:true
                },
                tableExample: {
                    margin: [0, 15, 0, 15]
                },
                titsecundario: {
                    alignment: 'center',
                    fontSize: 10,
                    italics:true
                },
                rightme: {
                    alignment: 'center',
                },
                lugarfecha:{
                    alignment: 'right',
                    fontSize: 10,
                    italics: true 
                },
                fechagraduacion: {
                    alignment: 'left',
                    fontSize: 10,
                    italics: true
                }
            },
            images: {
                building: 'data:/Content/img/logo1.jpg'
            }
        };
 //       pdfMake.createPdf(docDefinition).open();
//        pdfMake.createPdf(docDefinition).download('optionalName.pdf');
        Swal.fire({
            html: 'Buscando...',
            timer: 600,
            onBeforeOpen: () => {
                Swal.showLoading()
            },
        }).then(data=>{
            var nombre = `ANALITICO ${alumno.nombre} ${alumno.apellido} ID ${alumno.id_alumno}`
            if (descargar){
                pdfMake.createPdf(docDefinition).download(nombre);
            }else{
                pdfMake.createPdf(docDefinition).open();
            }
        })
    }

    function transformarFecha(fecha_nac){
        const anio = fecha_nac.slice(0,4);
        const mes = fecha_nac.slice(5,7);
        const dia = fecha_nac.slice(8,10);
    
        const nfecha_nac = `${dia}/${mes}/${anio}`  
    
        return nfecha_nac
    }