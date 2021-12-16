import React, {useState} from 'react'
import { useForm } from "react-hook-form"
import Cookies from 'universal-cookie'
import Image from 'next/image'
const cookies = new Cookies()

export default function Index(){

  const [scanResult, setScanResult] = useState({ status:'', message: ''})
  const [employeeData, setEmployeeData] = useState('')
  const [invalidMessage, setInvalidMessage] = useState(false)

  const resetEverything = () => {
    setEmployeeData('')
    setScanResult({ status:'', message: ''})
    reset()
  }

  const { register, handleSubmit, reset } = useForm({ shouldUseNativeValidation: true, defaultValues: {
    token: cookies.get('token'),
    employeeNumber: '',
    mode: 'OUT',
    device: 'EXIT',
    base64String: '',
    triageRes: 'PASS'
  }})

  const onSubmit = async data => { 
    
    setInvalidMessage(false)

    if(data.employeeNumber.length > 10) {
      setInvalidMessage(true)
      return resetEverything()
    }

    let headers = new Headers()
    headers.append('Content-Type', 'application/json')

    // GET employee details: {id, name, available_balance}
    let employeeNumberResponse = await fetch(`http://10.3.10.209:4848/getaccountinfo/${data.employeeNumber}`)
    if(employeeNumberResponse.status === 200){
      setEmployeeData(await employeeNumberResponse.json())
    }

    // POST recordattendance - used for recording logout details.
    let response = await fetch('http://10.3.10.209:4000/recordattendance', {
      headers: headers,
      method: 'POST',
      body: JSON.stringify(data)
    })
    if(response.status === 200){
      setScanResult(await response.json())
    }

    // reset form fields.
    reset()

  };

  return (
    <>
      <div style={{margin: 0, paddingLeft: 100, paddingRight: 100, paddingTop: 100, paddingBottom: 40}}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div>
              <h2 htmlFor='employeeNumber' style={{marginBottom: 8}} >Scan Barcode ID</h2>
            </div>
          <input 
            style={{width: 450, padding: 4, fontSize: 20}}
            autoFocus
            name='employeeNumber'
            maxlength={16}
            {...register("employeeNumber", { required: "Please enter your employeeNumber." })} // custom message
            placeholder="Barcode ID / Employee Number here..."
          />  
          {invalidMessage ? <h3 style={{color: 'red'}}>Invalid Barcode ID</h3> : null}
          </div>
        </form>
      </div>
      
      {scanResult.status ? (
        <div style={{display: 'flex', paddingLeft: 100, paddingRight: 100}}>
          <div style={{flex: 1, height: '100vh', borderRadius: '10px'}}>  
            {
              employeeData.hasOwnProperty('id') ? (
                <Image src={`http://dev-metaspf401.maxeoncorp.com:4000/codecs-img/${employeeData.id}.png` } width={250} height={250} layout='responsive' />
              ): null
            }
          </div>
          <div style={{width: '60%', marginLeft: 20, textAlign: 'center'}}>
            <h1 style={{color: scanResult.status === 'success' ? 'green' : 'red'}}>
              {scanResult.status === 'success' ? <>✅</> : <>❌</>}
            </h1>
            <h1 style={{textTransform: 'capitalize', color: scanResult.status === 'success' ? 'green' : 'red' }}>{scanResult.message}</h1>  
            <h2>{employeeData.id} {employeeData.name}</h2>
            <h2></h2>
          </div>
        </div>
      ):null}
      
    </>
  )

}