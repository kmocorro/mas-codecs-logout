import React, {useState, useEffect} from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import Cookies from 'universal-cookie'
const cookies = new Cookies()

export default function Login(){

  const router = useRouter()
  const [ token, setToken ] = useState({login: {token: ''}})
  const [ loginResponse, setLoginResponse ] = useState('')

  if(token.token){
    cookies.set('token', token.token, {path: '/'})
  }

  const { register, handleSubmit } = useForm({ shouldUseNativeValidation: true})

  const onSubmit = async data => { 
    setLoginResponse('')

    let headers = new Headers()
    headers.append('Content-Type', 'application/json')
    let response = await fetch('http://dev-metaspf401.sunpowercorp.com:4000/login', {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        username: data.username,
        password: data.password
      })
    })

    if(response.status === 200){
      setToken(await response.json());
    }
  }

  useEffect(() => {
    if(!token){
      console.log('no token.')
    } else {

      if(token.error) {
        setLoginResponse(token.error)
  
      } else if(token.token) {
        
        if(router.pathname === '/'){
          router.reload()
        } else {
          router.push('/')
        }
        
      }
    }
  }, [token])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username">Username</label>
        <input name="username" {...register("username", { required: "Please enter your username." })} />
        <label htmlFor="password">Password</label>
        <input name="password" type="password" {...register("password", { required: "Please enter your password." })} />
        <input type="submit" hidden />
      </form>
      {loginResponse ? (
      <p>
        {loginResponse}
      </p>
      ):null}
    </>
  )
}