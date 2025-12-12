import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Grading() {
  const router = useRouter()
  const [assessmentId, setAssessmentId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [essayText, setEssayText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) router.push('/login')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:5001/api/grading/check',
        { assessmentId, studentName, essayText },
        { headers: { 'x-auth-token': token } }
      )
      setResult(res.data.submission)
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
          <h1 className="text-2xl font-bold text-orange-700">Автоматты Тексеру</h1>
          <button onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-800">
            ← Басты бет
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Форма */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Жұмысты тексеру</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Тапсырма ID (опциялық)
                </label>
                <input
                  type="text"
                  value={assessmentId}
                  onChange={(e) => setAssessmentId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Егер білсеңіз енгізіңіз"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Оқушы аты
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Оқушы жауабы / Эссе
                </label>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={12}
                  placeholder="Оқушының жазған мәтінін енгізіңіз..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400"
              >
                {loading ? 'Тексеру жүріп жатыр...' : 'Тексеру'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium mb-2">💡 Кеңес</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI оқушы жауабын автоматты тексереді</li>
                <li>• Күшті және әлсіз жақтарын анықтайды</li>
                <li>• Жақсарту бойынша ұсыныс береді</li>
                <li>• Балл қояды және кері байланыс жасайды</li>
              </ul>
            </div>
          </div>

          {/* Нәтиже */}
          <div>
            {result && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Тексеру нәтижесі</h2>
                
                {/* Балл */}
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white text-center">
                  <div className="text-6xl font-bold mb-2">
                    {result.totalScore}/{result.maxScore}
                  </div>
                  <div className="text-lg">
                    {Math.round((result.totalScore / result.maxScore) * 100)}%
                  </div>
                </div>

                {/* Кері байланыс */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-2">📝 Кері байланыс</h3>
                  <p className="text-gray-700">{result.feedback}</p>
                </div>

                {/* AI талдау */}
                {result.aiAnalysis && (
                  <div className="space-y-4">
                    {/* Күшті жақтары */}
                    {result.aiAnalysis.strengths?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-green-600 mb-2">✅ Күшті жақтары</h3>
                        <ul className="space-y-1">
                          {result.aiAnalysis.strengths.map((s, i) => (
                            <li key={i} className="text-gray-700">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Әлсіз жақтары */}
                    {result.aiAnalysis.weaknesses?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-orange-600 mb-2">⚠️ Әлсіз жақтары</h3>
                        <ul className="space-y-1">
                          {result.aiAnalysis.weaknesses.map((w, i) => (
                            <li key={i} className="text-gray-700">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ұсыныстар */}
                    {result.aiAnalysis.suggestions?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-blue-600 mb-2">💡 Ұсыныстар</h3>
                        <ul className="space-y-1">
                          {result.aiAnalysis.suggestions.map((s, i) => (
                            <li key={i} className="text-gray-700">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Экспорт */}
                <div className="mt-6 flex gap-4">
                  <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                    📄 PDF жүктеу
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    📊 Excel
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
