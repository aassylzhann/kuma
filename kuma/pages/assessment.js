import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Assessment() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    type: 'test',
    questionCount: 10,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) router.push('/login')
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:5001/api/assessment/generate',
        formData,
        { headers: { 'x-auth-token': token } }
      )
      setResult(res.data.assessment)
    } catch (err) {
      alert('Қате: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-700">Бағалау Тапсырмалары</h1>
          <button onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-800">
            ← Басты бет
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Форма */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Тапсырма жасау</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Пән</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Таңдаңыз</option>
                  <option value="Математика">Математика</option>
                  <option value="Қазақ тілі">Қазақ тілі</option>
                  <option value="Ағылшын тілі">Ағылшын тілі</option>
                  <option value="Физика">Физика</option>
                  <option value="Химия">Химия</option>
                  <option value="Биология">Биология</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Сынып</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Таңдаңыз</option>
                  {[...Array(11)].map((_, i) => (
                    <option key={i + 1} value={`${i + 1}-сынып`}>{i + 1}-сынып</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Тақырып</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Тапсырма түрі</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="test">Тест</option>
                  <option value="descriptor">Дескрипторлық тапсырма</option>
                  <option value="formative">Формативті бағалау</option>
                  <option value="summative">Жиынтық бағалау</option>
                </select>
              </div>

              {formData.type === 'test' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Сұрақ саны</label>
                  <input
                    type="number"
                    name="questionCount"
                    value={formData.questionCount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    min="5"
                    max="30"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400"
              >
                {loading ? 'Генерация жүріп жатыр...' : 'Тапсырма жасау'}
              </button>
            </form>
          </div>

          {/* Нәтиже */}
          <div>
            {result && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Дайын тапсырма</h2>
                
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <div className="font-medium">Жалпы балл: {result.totalPoints}</div>
                  <div className="text-sm text-gray-600">Сұрақ саны: {result.questions?.length || 0}</div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {result.questions?.map((q, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">
                        {i + 1}. {q.question || q.task}
                      </div>
                      
                      {q.options && (
                        <div className="ml-4 space-y-1">
                          {q.options.map((opt, j) => (
                            <div key={j} className={opt.startsWith(q.correctAnswer) ? 'text-green-600 font-medium' : ''}>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.descriptors && (
                        <div className="ml-4 mt-2">
                          <div className="text-sm font-medium text-gray-700">Дескрипторлар:</div>
                          {q.descriptors.map((d, j) => (
                            <div key={j} className="text-sm text-gray-600">• {d}</div>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex gap-4 text-sm text-gray-600">
                        {q.bloomLevel && <span>Деңгей: {q.bloomLevel}</span>}
                        {q.points && <span>Балл: {q.points}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    📄 PDF
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    📝 Word
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
