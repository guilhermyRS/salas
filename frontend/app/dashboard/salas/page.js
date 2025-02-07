"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FaPlus, FaEdit, FaTrash, FaFilter, FaClock, FaSun, FaCloud, FaMoon } from "react-icons/fa"
import RoomModal from "@/components/RoomModal"
import Switch from "@/components/Switch"
import Navbar from "@/components/Navbar"
import { API_BASE_URL } from "@/config/api"

export default function SalasManagement() {
  const [rooms, setRooms] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [modalMode, setModalMode] = useState("create")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weather, setWeather] = useState("clear") // clear, cloudy, night
  const [filters, setFilters] = useState({
    turno: "",
    status: "",
    sala_aula: "",
    dia_semana: ""
  })
  const [showFilters, setShowFilters] = useState(false)

  // Função para determinar o clima com base no horário
  const getWeatherByTime = () => {
    const hour = new Date().getHours()
    
    // Matutino (6h-12h): Geralmente ensolarado
    if (hour >= 6 && hour < 12) {
      return "clear"
    }
    // Vespertino (12h-18h): Pode variar entre sol e nublado
    else if (hour >= 12 && hour < 18) {
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

  // Função para obter o turno atual
  const getCurrentTurno = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return "Matutino"
    if (hour >= 12 && hour < 18) return "Vespertino"
    return "Noturno"
  }

  // Função para obter o dia da semana atual
  const getCurrentDayOfWeek = () => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    return days[new Date().getDay()]
  }

  const getTurnoColor = (turno) => {
    // Cores baseadas no clima e turno
    const weatherColors = {
      clear: {
        "Matutino": "bg-yellow-400",
        "Vespertino": "bg-orange-500",
        "Noturno": "bg-indigo-700"
      },
      cloudy: {
        "Matutino": "bg-blue-300",
        "Vespertino": "bg-gray-400",
        "Noturno": "bg-gray-700"
      },
      night: {
        "Matutino": "bg-indigo-400",
        "Vespertino": "bg-indigo-600",
        "Noturno": "bg-indigo-900"
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

  // Função para atualizar os filtros baseados no horário
  const setTimeBasedFilters = () => {
    setFilters(prev => ({
      ...prev,
      turno: getCurrentTurno(),
      dia_semana: getCurrentDayOfWeek()
    }))
  }

  useEffect(() => {
    fetchRooms()
    setTimeBasedFilters() // Define os filtros iniciais baseados no horário atual
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await axios.get(`${API_BASE_URL}/api/rooms`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.data) {
        throw new Error('Dados não recebidos do servidor')
      }

      setRooms(response.data)
    } catch (error) {
      console.error("Erro ao buscar salas:", error)
      setError(error.name === 'AbortError' 
        ? "Tempo de conexão esgotado. Verifique se o servidor está rodando."
        : "Erro ao carregar as salas. Tente novamente.")
      toast.error("Erro ao buscar salas")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedRoom(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  const handleEdit = (room) => {
    setSelectedRoom(room)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleDelete = (room) => {
    setSelectedRoom(room)
    setModalMode("delete")
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRoom(null)
  }

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/rooms/${roomId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      toast.success("Status atualizado com sucesso!")
      fetchRooms()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast.error("Erro ao atualizar status")
    }
  }

  const handleSave = async (roomData) => {
    try {
      if (modalMode === "create") {
        await axios.post(`${API_BASE_URL}/api/rooms`, roomData, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        toast.success("Sala criada com sucesso!")
      } else if (modalMode === "edit") {
        await axios.put(`${API_BASE_URL}/api/rooms/${roomData.id}`, roomData, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        toast.success("Sala atualizada com sucesso!")
      }
      fetchRooms()
      handleCloseModal()
    } catch (error) {
      console.error("Erro ao salvar sala:", error)
      toast.error("Erro ao salvar sala")
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/rooms/${selectedRoom.id}`)
      toast.success("Sala excluída com sucesso!")
      fetchRooms()
      handleCloseModal()
    } catch (error) {
      console.error("Erro ao excluir sala:", error)
      toast.error("Erro ao excluir sala")
    }
  }

  const filteredRooms = rooms.filter(room => {
    const matchTurno = !filters.turno || room.turno === filters.turno
    const matchStatus = !filters.status || room.status.toString() === filters.status
    const matchSala = !filters.sala_aula || 
      room.sala_aula.toLowerCase().includes(filters.sala_aula.toLowerCase())
    const matchDiaSemana = !filters.dia_semana || 
      (Array.isArray(room.dias_semana) && room.dias_semana.includes(filters.dia_semana))
    
    return matchTurno && matchStatus && matchSala && matchDiaSemana
  })

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando salas...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchRooms} className="btn-primary">
              Tentar Novamente
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Salas</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <FaFilter className="mr-2" /> Filtros
            </button>
            <button 
              onClick={handleCreate} 
              className="btn-primary flex items-center"
            >
              <FaPlus className="mr-2" /> Nova Sala
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FaFilter className="mr-2 text-primary" />
                Filtros Ativos
              </h2>
              <button
                onClick={setTimeBasedFilters}
                className="btn-secondary flex items-center text-sm"
                title="Usar horário atual"
              >
                <FaClock className="mr-2" />
                Usar horário atual
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.dia_semana}
                onChange={(e) => setFilters({ ...filters, dia_semana: e.target.value })}
                className="input-field"
              >
                <option value="">Todos os dias</option>
                <option value="Segunda">Segunda</option>
                <option value="Terça">Terça</option>
                <option value="Quarta">Quarta</option>
                <option value="Quinta">Quinta</option>
                <option value="Sexta">Sexta</option>
                <option value="Sábado">Sábado</option>
              </select>

              <select
                value={filters.turno}
                onChange={(e) => setFilters({ ...filters, turno: e.target.value })}
                className="input-field"
              >
                <option value="">Todos os turnos</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field"
              >
                <option value="">Todos</option>
                <option value="true">Aberto</option>
                <option value="false">Fechado</option>
              </select>

              <input
                type="text"
                value={filters.sala_aula}
                onChange={(e) => setFilters({ ...filters, sala_aula: e.target.value })}
                placeholder="Buscar por sala..."
                className="input-field"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilters({
                    turno: "",
                    status: "",
                    sala_aula: "",
                    dia_semana: ""
                  })
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Exibir informações do período atual */}
        <div className="mb-4 text-gray-600 flex items-center">
          <span className="mr-2">{getWeatherIcon()}</span>
          <p>Período atual: {filters.dia_semana || 'Todos os dias'} - Turno: {filters.turno || 'Todos os turnos'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className={`${getTurnoColor(room.turno)} h-2`} />
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{room.sala_aula}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 ${getTurnoColor(room.turno)}`}>
                      {getWeatherIcon()}
                      {room.turno}
                    </span>
                    <Switch
                      checked={room.status}
                      onChange={(checked) => handleStatusChange(room.id, checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Disciplina:</span> {room.disciplina}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Professor:</span> {room.docente}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Turno:</span> {room.turno}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Status:</span>{" "}
                    <span className={room.status ? "text-green-600" : "text-red-600"}>
                      {room.status ? "Aberto" : "Fechado"}
                    </span>
                  </p>
                  {Array.isArray(room.dias_semana) && room.dias_semana.length > 0 && (
                    <p className="text-sm text-gray-700 flex items-center">
                      <span className="font-medium mr-2">Dias:</span>
                      <span className="flex items-center space-x-1">
                        {room.dias_semana.join(", ")}
                      </span>
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className={`p-2 text-blue-600 hover:text-blue-800 transition-colors ${getTurnoColor(room.turno).replace('bg-', 'hover:bg-')} hover:bg-opacity-10 rounded`}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors hover:bg-red-50 rounded"
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Nenhuma sala encontrada com os filtros selecionados.
            </p>
          </div>
        )}

        <RoomModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleConfirmDelete}
          room={selectedRoom}
          mode={modalMode}
        />
      </div>
    </>
  )
}