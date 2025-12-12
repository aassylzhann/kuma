import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function LessonPlan() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    learningObjectives: '',
    duration: 45,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [myPlans, setMyPlans] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchMyPlans()
  }, [])

  const fetchMyPlans = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5001/api/lesson-plan/my-plans', {
        headers: { 'x-auth-token': token }
      })
      setMyPlans(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const objectives = formData.learningObjectives.split('\n').filter(obj => obj.trim())
      
      const res = await axios.post(
        'http://localhost:5001/api/lesson-plan/generate',
        { ...formData, learningObjectives: objectives },
        { headers: { 'x-auth-token': token } }
      )

      setResult(res.data.lessonPlan)
      fetchMyPlans()
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
          <h1 className="text-2xl font-bold text-blue-700">Сабақ Жоспары</h1>
          <button onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-800">
            ← Басты бет
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Генерация формасы */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Жаңа жоспар жасау</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Пән</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Таңдаңыз</option>
                  <option value="Математика">Математика</option>
                  <option value="Қазақ тілі">Қазақ тілі</option>
                  <option value="Ағылшын тілі">Ағылшын тілі</option>
                  <option value="Физика">Физика</option>
                  <option value="Химия">Химия</option>
                  <option value="Биология">Биология</option>
                  <option value="Тарих">Тарих</option>
                  <option value="География">География</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Сынып</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Мысалы: Квадрат теңдеу"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Оқу мақсаттары (әр жолға бір мақсат)
                </label>
                <textarea
                  name="learningObjectives"
                  value={formData.learningObjectives}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Мысалы:&#10;Квадрат теңдеуді шеше алады&#10;Дискриминантты есептей алады"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Сабақ ұзақтығы (минут)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="30"
                  max="90"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Генерация жүріп жатыр...' : 'Жоспар жасау'}
              </button>
            </form>
          </div>

          {/* Нәтиже */}
          <div>
            {result && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Дайын жоспар</h2>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <Section title="📌 Кіріспе" content={result.introduction} />
                  <Section title="🎯 Мақсаттары" content={result.lessonGoals} />
                  <Section title="🔧 Әдіс-тәсілдер" content={result.methods} />
                  <Section title="📚 Негізгі бөлім" content={result.mainPart} />
                  <Section title="✅ Бағалау" content={result.assessment} />
                  <Section title="💭 Рефлексия" content={result.reflection} />
                  <Section title="📝 Үй тапсырмасы" content={result.homework} />
                </div>

                <div className="mt-6 flex gap-4">
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    📄 PDF жүктеу
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    📝 Word жүктеу
                  </button>
                </div>
              </div>
            )}

            {/* Сақталған жоспарлар */}
            {myPlans.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">Менің жоспарларым</h2>
                <div className="space-y-2">
                  {myPlans.slice(0, 5).map((plan) => (
                    <div key={plan._id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium">{plan.topic}</div>
                      <div className="text-sm text-gray-600">
                        {plan.subject} • {plan.grade} • {new Date(plan.createdAt).toLocaleDateString('kk-KZ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ title, content }) {
  return (
    <div className="border-l-4 border-indigo-500 pl-4">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
    </div>
  )
}
