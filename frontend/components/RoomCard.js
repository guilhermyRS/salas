"use client"
import { FaCalendar, FaSun, FaCloud, FaMoon } from "react-icons/fa"
import { useState, useEffect } from "react"

export default function RoomCard({ room, onClick }) {
  const [weather, setWeather] = useState("clear") // clear, cloudy, rain, night

  // Função para determinar o clima com base no horário
  const getWeatherByTime = () => {
    const hour = new Date().getHours()
    
    // Matutino (6h-12h): Geralmente ensolarado
    if (hour >= 6 && hour < 12) {
      return "clear"
    }
    // Vespertino (12h-18h): Pode variar entre sol e nublado
    else if (hour >= 12 && hour < 18) {
      // Simplificando, vamos alternar entre sol e nublado baseado na hora par/ímpar
      return hour % 2 === 0 ? "clear" : "cloudy"
    }
    // Noturno (18h-6h): Sempre noturno
    else {
      return "night"
    }
  }

  // Atualiza o clima baseado no horário
  useEffect(() => {
    const updateWeather = () => {
      setWeather(getWeatherByTime())
    }

    updateWeather() // Atualização inicial
    const interval = setInterval(updateWeather, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [])

  const getTurnoColor = (turno) => {
    // Cores baseadas no clima e turno
    const weatherColors = {
      clear: {
        "Matutino": "bg-yellow-400", // Sol da manhã (amarelo vibrante)
        "Vespertino": "bg-orange-500", // Sol da tarde (laranja)
        "Noturno": "bg-indigo-700"  // Noite clara (azul escuro)
      },
      cloudy: {
        "Matutino": "bg-blue-300",   // Manhã nublada (azul claro)
        "Vespertino": "bg-gray-400",   // Tarde nublada (cinza)
        "Noturno": "bg-gray-700"    // Noite nublada (cinza escuro)
      },
      night: {
        "Matutino": "bg-indigo-400", // Amanhecer (índigo claro)
        "Vespertino": "bg-indigo-600", // Entardecer (índigo médio)
        "Noturno": "bg-indigo-900"  // Noite profunda (índigo escuro)
      }
    }

    return weatherColors[weather]?.[turno] || "bg-gray-500"
  }

  const getWeatherIcon = () => {
    switch (weather) {
      case "clear":
        return <FaSun className="text-yellow-500" />
      case "cloudy":
        return <FaCloud className="text-gray-500" />
      case "night":
        return <FaMoon className="text-indigo-500" />
      default:
        return null
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(room, weather)}
    >
      <div className={`${getTurnoColor(room.turno)} h-2`} />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{room.sala_aula}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 ${getTurnoColor(room.turno)}`}>
              {getWeatherIcon()}
              {room.turno}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
              room.status ? "bg-green-500" : "bg-red-500"
            }`}>
              {room.status ? "Aberto" : "Fechado"}
            </span>
          </div>
        </div>

        <div className="space-y-1 mb-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Disciplina:</span> {room.disciplina}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Professor:</span> {room.docente}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center">
            <FaCalendar className="mr-1 text-primary" />
            {Array.isArray(room.dias_semana) ? room.dias_semana.join(", ") : room.dias_semana}
          </div>
        </div>
      </div>
    </div>
  )
}