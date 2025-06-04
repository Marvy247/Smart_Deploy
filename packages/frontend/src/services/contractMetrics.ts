import axios from 'axios'
import { ContractHealthMetrics } from '@/types/contractHealth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api'

export const fetchContractMetrics = async (contractAddress: string): Promise<ContractHealthMetrics> => {
  try {
    const response = await axios.get(`${API_BASE}/contracts/${contractAddress}/metrics`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch contract metrics:', error)
    throw error
  }
}

export const refreshContractMetrics = async (contractAddress: string): Promise<ContractHealthMetrics> => {
  try {
    const response = await axios.post(`${API_BASE}/contracts/${contractAddress}/metrics/refresh`)
    return response.data
  } catch (error) {
    console.error('Failed to refresh contract metrics:', error)
    throw error
  }
}
