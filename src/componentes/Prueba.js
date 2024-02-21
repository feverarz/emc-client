import React from 'react'
import AbmCurso from '../abms/abm-curso'
import {useEffect,useState} from 'react'
import Axios from 'axios'
import Main from './Main'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";


export default function Prueba({match}){
    const [cursoActualizado,setCursoActualizado]=useState(null)
    const [objeto,setObjeto]=useState({id:50,nombre:'pepe'})
    let params = useParams();

    useEffect(()=>{

        buscarDatosDelCurso(); // actualizo los datos del curso al entrar para no tener la info
                               // de la vista de cursos sino la real de la base de datos
                               // ya que puede haber habido algún cambio en el curso por otro usuario
                               // entre el momento en que se leyò la lista de cursos y el momento en 
                               // que entro al mismo
        // al principio solo usaba la info que venía desde el location.state (cursos) el
        // objeto cursoActualizado lo agregué más tarde así que algunos datos los tomo del
        // objeto cursoActualizado y otros de location.state... Debería tomar todo del primero para que sea màs limpio y màs claro
        
       // setTimeout(()=>setAbrirfichaConDelay(true),200) 
        // uso el flag abrirfichaConDelay para asegurarme que el componente abm-curso
        // se renderice después de renderizar el componente padre
        // ya que el componente hijo (abm-curso) usa useEffect y useState y eso genera
        // un warning d
    },[params.id])

    async function buscarDatosDelCurso(){
        try{           
            const {data} = await Axios.get(`/api/cursos/curso/${params.id}`)
            setCursoActualizado(data);
            setObjeto({...objeto,nombre:data.Profesor})
            objeto.nombre='julian'
        }catch(err){
            console.log(err);
        }
    }

    return (
        <Main>
            <div>
                <h1>{params.id}</h1>
                <p>objeto</p>
                {JSON.stringify(objeto)}
                <p>curso</p>

                {JSON.stringify(cursoActualizado)}
                <p>abm</p>

                <AbmCurso nro_curso={params.id} />}
            </div>
        </Main>
    )
}