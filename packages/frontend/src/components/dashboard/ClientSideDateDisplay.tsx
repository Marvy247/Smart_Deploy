import React from 'react'
import { formatDate } from '@/utils/dateFormat'

interface ClientSideDateDisplayProps {
  date?: string | null
}

const ClientSideDateDisplay: React.FC<ClientSideDateDisplayProps> = ({ date }) => {
  return <span>{formatDate(date)}</span>
}

export default ClientSideDateDisplay
