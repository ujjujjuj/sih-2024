import axios, { type AxiosInstance } from "axios"
import { Semaphore } from "async-mutex"

const rateLimitRPS = (instance: AxiosInstance, rps: number): AxiosInstance => {
  let reqSema = new Semaphore(rps)

  instance.interceptors.request.use(async (config) => {
    await reqSema.acquire()
    return config
  })

  instance.interceptors.response.use(
    (res) => {
      setTimeout(() => {
        reqSema.release()
      }, 1000)
      return res
    },
    (err) => {
      setTimeout(() => {
        reqSema.release()
      }, 1000)
      return Promise.reject(err)
    }
  )

  return instance
}

const etherscanInstance = rateLimitRPS(
  axios.create({
    baseURL: process.env.ETHERSCAN_API_URL!,
    params: { apikey: process.env.ETHERSCAN_API_KEY! },
  }),
  5
)

export default etherscanInstance
