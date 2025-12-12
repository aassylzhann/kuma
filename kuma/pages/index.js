import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/login')
    } else if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">
            Білім Платформасы
          </h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Сәлем, {user.name}!</span>
              <button
                onClick={() => {
                  localStorage.clear()
                  router.push('/login')
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Шығу
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            AI-көмекші арқылы сабақтарды жеңілдетіңіз
          </h2>
          <p className="text-xl text-gray-600">
            Сабақ жоспары, бағалау тапсырмалары және автоматты тексеру
          </p>
        </div>

        {/* Модульдер */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Сабақ жоспары */}
          <Link href="/lesson-plan">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-5xl mb-4 font-bold text-blue-600">ҚМЖ</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Сабақ Жоспары
              </h3>
              <p className="text-gray-600 mb-4">
                ҚМЖ автоматты құрастыру, Bloom таксономиясы, PDF/Word экспорт
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Кіріспе генерациясы</li>
                <li>✓ Әдіс-тәсілдер</li>
                <li>✓ Бағалау критерийлері</li>
                <li>✓ Үй тапсырмасы</li>
              </ul>
            </div>
          </Link>

          {/* Бағалау тапсырмалары */}
          <Link href="/assessment">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-teal-500">
              <div className="text-5xl mb-4 font-bold text-teal-600">ТЕСТ</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Бағалау Тапсырмалары
              </h3>
              <p className="text-gray-600 mb-4">
                Тест, дескриптор, критерийлер автоматты генерациясы
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Формативті бағалау</li>
                <li>✓ Жиынтық бағалау</li>
                <li>✓ Тест генераторы</li>
                <li>✓ Дескрипторлар</li>
              </ul>
            </div>
          </Link>

          {/* Автоматты тексеру */}
          <Link href="/grading">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-orange-500">
              <div className="text-5xl mb-4 font-bold text-orange-600">AI</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Автоматты Тексеру
              </h3>
              <p className="text-gray-600 mb-4">
                Оқушы жұмысын AI арқылы тексеру және бағалау
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Тест тексеру</li>
                <li>✓ Эссе талдау</li>
                <li>✓ Кері байланыс</li>
                <li>✓ Прогресс талдау</li>
              </ul>
            </div>
          </Link>
        </div>

        {/* Статистика */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Неге біздің платформа?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">90%</div>
              <p className="text-gray-600">Уақыт үнемдеу</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-2">100%</div>
              <p className="text-gray-600">ҚР стандартына сәйкес</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <p className="text-gray-600">AI-қолдау</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Білім Платформасы. Барлық құқықтар қорғалған.</p>
          <p className="mt-2 text-sm">Қазақстандық мұғалімдерге арналған</p>
        </div>
      </footer>
    </div>
  )
}
