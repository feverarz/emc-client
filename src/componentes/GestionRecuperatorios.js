import React from 'react'
import Axios from 'axios'

export default function GestionRecuperatorios({nombre,nro_curso,finalizar}){

    // voy a recibir la prop recuperatorios si ya se configuro alguna vez los recuperatorios para este curso
    // si nunca se seteó un recuperatorio es null

    const [config_recuperatorios,setConfigRecuperatorios] = React.useState([])

    React.useEffect(()=>{
        buscarConfiguracion()
        // este regex /columna_(\d{1})$/
        // incluye solo a las columnas que sean del tipo columna_1 o columna_N que son las únicas a tener en cuenta para configurar recuperatorios por cada encabezado
       // const vector_cols_encabezado_util = Object.entries(encabezado).filter(item=>/columna_(\d{1})$/.test(item[0]) && item[1])
       // const mapeo_columna = vector_cols_encabezado_util.map(item=>[...item,false])
       // setConfigRecuperatorios(mapeo_columna)
    },[])

    const buscarConfiguracion = async ()=>{
        try{
            const {data} = await Axios.get(`/api/cursos/curso/recuperatorios/configuracion/${nro_curso}`)
            setConfigRecuperatorios(data)
        }catch(err){
            alert(err)
        }
    }

    const handleSwitch = (item)=>{
        console.log(item)
        const aux = config_recuperatorios.map(fila=>{
                if(fila[0]==item[0]){
                    return [fila[0],fila[1],!fila[2],fila[3]]
                }  else{
                    return fila
                }
        })
        setConfigRecuperatorios(aux)
    }

    const guardar = async ()=>{

        // Object from Map

        const map_from_array = new Map(config_recuperatorios.map(item=>[item[0],item[2]]))
        const object_from_mapped_values = Object.fromEntries(map_from_array)

        try{
            const {data} = await Axios.post(`/api/cursos/curso/recuperatorios/${nro_curso}`,object_from_mapped_values)
            finalizar()
        }catch(err){
            alert(JSON.stringify(err?.response?.data?.message || err?.message || 'Se produjo un error al grabar la configuración.'))
        }
       // alert(JSON.stringify(object_from_mapped_values))
    }

    return (
        <div className='flex f-col items-center'>
            <h4>{nombre}</h4>
            <h6>Configuración de recuperatorios</h6>
                    <table>
                        <tbody>
                            {config_recuperatorios.map(item=>{ return (
                                <tr>
                                    <td>{item[1]}</td>
                                    <td className="text-center">
                                        <div className='p-2' title='Marque o desmarque para activar el recuperatorio'>
                                            <input type="checkbox" id="ch-instrumento" 
                                                    checked={item[2]} 
                                                    onChange={(e)=>handleSwitch(item)} />
                                        </div>
                                    </td>
                                </tr>)
                            })}
                        </tbody>
                    </table>                

            <button className='mt-4' onClick={guardar}>Guardar la configuración</button>
        </div>
    )
}