"use client"
import { useState, useEffect } from "react"
import { FaTimes } from "react-icons/fa"
import axios from "axios"
import { API_BASE_URL } from "@/config/api"
import { toast } from "react-toastify"

export default function RoomModal({ isOpen, onClose, onSave, onDelete, room, mode }) {
  const [formData, setFormData] = useState({
    unidade: "",
    curso: "",
    periodo: "",
    disciplina: "",
    docente: "",
    dias_semana: [],
    turno: "",
    sala_aula: "",
    status: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (room) {
      setFormData({
        ...room,
        dias_semana: Array.isArray(room.dias_semana) ? room.dias_semana : [],
      })
    } else {
      setFormData({
        unidade: "",
        curso: "",
        periodo: "",
        disciplina: "",
        docente: "",
        dias_semana: [],
        turno: "",
        sala_aula: "",
        status: true
      })
    }
  }, [room])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDiaSemanaChange = (dia) => {
    setFormData((prev) => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter((d) => d !== dia)
        : [...prev.dias_semana, dia],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
  
    try {
      const url = mode === "create" 
        ? `${API_BASE_URL}/api/rooms`
        : `${API_BASE_URL}/api/rooms/${formData.id}`;
  
      const method = mode === "create" ? "post" : "put";
  
      const response = await axios[method](url, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 201 || response.status === 200) {
        onSave(formData);
        onClose();
      } else {
        throw new Error(response.data.message || "Erro ao salvar sala");
      }
    } catch (error) {
      console.error("Erro ao salvar sala:", error);
      setError(error.response?.data?.message || "Erro ao salvar sala. Tente novamente.");
      toast.error("Erro ao salvar sala");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === "create" ? "Criar Nova Sala" : mode === "edit" ? "Editar Sala" : "Excluir Sala"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {mode === "delete" ? (
          <div>
            <p className="mb-4">Tem certeza que deseja excluir esta sala?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="btn-secondary"
                type="button"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={onDelete}
                className="btn-primary bg-red-600 hover:bg-red-700"
                type="button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Unidade</label>
              <input
                type="text"
                name="unidade"
                value={formData.unidade}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Curso</label>
              <input
                type="text"
                name="curso"
                value={formData.curso}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Período</label>
              <input
                type="text"
                name="periodo"
                value={formData.periodo}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Disciplina</label>
              <input
                type="text"
                name="disciplina"
                value={formData.disciplina}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Docente</label>
              <input
                type="text"
                name="docente"
                value={formData.docente}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sala de Aula</label>
              <input
                type="text"
                name="sala_aula"
                value={formData.sala_aula}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Turno</label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={isSubmitting}
              >
                <option value="">Selecione um turno</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dias da Semana
              </label>
              <div className="space-y-2">
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((dia) => (
                  <label key={dia} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dias_semana.includes(dia)}
                      onChange={() => handleDiaSemanaChange(dia)}
                      className="mr-2"
                      disabled={isSubmitting}
                    />
                    {dia}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Salvando..."
                  : mode === "create"
                    ? "Criar"
                    : "Atualizar"
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}