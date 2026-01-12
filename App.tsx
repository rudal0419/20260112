
import React, { useState, useEffect } from 'react';
import { MealTime, CuisineType, Recipe, AppTheme, Ingredient } from './types';
import { generateRecipes, generateRecipeImage } from './services/geminiService';
import { 
  ChefHat, 
  Utensils, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Coffee, 
  Sun, 
  Moon,
  Flame,
  Info,
  Heart,
  Cloud,
  Flower2,
  Leaf,
  Bird,
  Cherry,
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Key,
  ExternalLink,
  Users,
  Loader2
} from 'lucide-react';

const THEMES = {
  [AppTheme.PINK]: {
    bg: 'bg-[#FFF0F3]',
    accent: 'bg-[#FF8FAB]',
    text: 'text-[#C9184A]',
    border: 'border-[#FFB3C1]',
    light: 'bg-[#FFE5EC]',
    icon: Flower2,
    symbol: '🌸',
    title: '러블리 핑크'
  },
  [AppTheme.YELLOW]: {
    bg: 'bg-[#FFFBEB]',
    accent: 'bg-[#FBBF24]',
    text: 'text-[#92400E]',
    border: 'border-[#FDE68A]',
    light: 'bg-[#FEF3C7]',
    icon: Cherry,
    symbol: '🐣',
    title: '상큼 노랑'
  },
  [AppTheme.GREEN]: {
    bg: 'bg-[#F0FDF4]',
    accent: 'bg-[#4ADE80]',
    text: 'text-[#166534]',
    border: 'border-[#BBF7D0]',
    light: 'bg-[#DCFCE7]',
    icon: Leaf,
    symbol: '🌱',
    title: '싱그럽 연두'
  },
  [AppTheme.BLUE]: {
    bg: 'bg-[#F0F9FF]',
    accent: 'bg-[#38BDF8]',
    text: 'text-[#075985]',
    border: 'border-[#BAE6FD]',
    light: 'bg-[#E0F2FE]',
    icon: Cloud,
    symbol: '☁️',
    title: '몽글 하늘'
  },
  [AppTheme.PURPLE]: {
    bg: 'bg-[#FAF5FF]',
    accent: 'bg-[#A855F7]',
    text: 'text-[#6B21A8]',
    border: 'border-[#E9D5FF]',
    light: 'bg-[#F3E8FF]',
    icon: Bird,
    symbol: '🍇',
    title: '달콤 보라'
  }
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<AppTheme>(AppTheme.PINK);
  const [ingredients, setIngredients] = useState('');
  const [mealTime, setMealTime] = useState<MealTime>(MealTime.LUNCH);
  const [cuisineType, setCuisineType] = useState<CuisineType>(CuisineType.KOREAN);
  const [servings, setServings] = useState<number>(2);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);

  const currentTheme = THEMES[theme];

  useEffect(() => {
    const checkKey = async () => {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
      } catch (e) {
        setIsKeySelected(false);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('gemini-chef-shopping-list');
    if (saved) {
      try {
        setShoppingList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse shopping list", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gemini-chef-shopping-list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    setIsKeySelected(true);
  };

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      alert('사용 가능한 재료를 입력해주세요!');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateRecipes({
        availableIngredients: ingredients,
        mealTime,
        cuisineType,
        servings
      });
      setRecipes(result);
      
      result.forEach(async (recipe, idx) => {
        const imageUrl = await generateRecipeImage(recipe.title);
        if (imageUrl) {
          setRecipes(prev => prev.map((r, i) => i === idx ? { ...r, imageUrl } : r));
        }
      });

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
      if (err.message?.includes("다시 선택")) {
        setIsKeySelected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIngredients('');
    setRecipes([]);
    setError(null);
  };

  const toggleShoppingItem = (item: string) => {
    setShoppingList(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const removeFromShoppingList = (item: string) => {
    setShoppingList(prev => prev.filter(i => i !== item));
  };

  const clearShoppingList = () => {
    if (window.confirm('구매 메모를 모두 비울까요?')) {
      setShoppingList([]);
    }
  };

  if (isKeySelected === false) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${currentTheme.bg}`}>
        <div className="max-w-md w-full bg-white rounded-[50px] shadow-2xl p-10 text-center border-8 border-white animate-in zoom-in duration-500">
          <div className={`${currentTheme.accent} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg rotate-3`}>
            <ChefHat className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">반가워요! <br/><span className={currentTheme.text}>말랑 셰프</span>예요</h2>
          <p className="text-gray-600 font-medium mb-8 leading-relaxed">
            맛있는 레시피를 제안해드리기 위해<br/> 
            먼저 <span className="font-bold">API 키</span>를 선택해주세요!
          </p>
          <div className="bg-gray-50 rounded-3xl p-6 mb-8 text-left border-4 border-gray-50">
            <h4 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" /> 꼭 확인해주세요!
            </h4>
            <ul className="text-xs text-gray-500 space-y-2 font-medium">
              <li>• 유료 결제가 설정된 GCP 프로젝트의 키가 필요해요.</li>
              <li>• 선택된 키는 안전하게 앱의 기능에만 사용됩니다.</li>
              <li>• 빌링 관련 정보는 아래 문서에서 확인 가능합니다.</li>
            </ul>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold ${currentTheme.text} hover:underline`}
            >
              빌링 가이드 보러가기 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={handleSelectKey}
            className={`w-full py-5 ${currentTheme.accent} text-white text-xl font-black rounded-[30px] shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-3`}
          >
            <Key className="w-6 h-6" />
            <span>API 키 선택하기</span>
          </button>
        </div>
      </div>
    );
  }

  if (isKeySelected === null) {
    return <div className={`min-h-screen ${currentTheme.bg} flex items-center justify-center`}>
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 overflow-x-hidden relative ${currentTheme.bg}`}>
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDuration: '3s' }}>
          <currentTheme.icon size={64} className={currentTheme.text} />
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <currentTheme.icon size={48} className={currentTheme.text} />
        </div>
        <div className="absolute bottom-40 left-1/4 animate-bounce" style={{ animationDuration: '5s' }}>
          <Heart size={40} className={currentTheme.text} />
        </div>
        <div className="absolute bottom-20 right-1/4 animate-pulse">
          <currentTheme.icon size={56} className={currentTheme.text} />
        </div>
        <div className="absolute top-1/2 left-5 opacity-50">
          <currentTheme.icon size={32} className={currentTheme.text} />
        </div>
      </div>

      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${currentTheme.accent} p-2 rounded-2xl shadow-sm rotate-3 hover:rotate-0 transition-transform`}>
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <h1 className={`text-xl font-black ${currentTheme.text} tracking-tight`}>말랑 셰프 제미니</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSelectKey}
              className="text-gray-400 hover:text-blue-500 transition-colors p-2"
              title="API 키 변경"
            >
              <Key className="w-5 h-5" />
            </button>
            {recipes.length > 0 && (
              <button 
                onClick={resetForm}
                className="text-gray-400 hover:text-orange-500 transition-colors p-2"
                title="다시 시작"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-full">
              {Object.entries(THEMES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key as AppTheme)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${theme === key ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                  style={{ backgroundColor: value.accent.match(/\[(.*)\]/)?.[1] }}
                  title={value.title}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-12 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-white rounded-full text-sm font-bold shadow-sm mb-4 border border-gray-100">
            {currentTheme.symbol} 당신의 냉장고 메이트
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            오늘 <span className={currentTheme.text}>냉장고</span>엔<br/>
            무엇이 있나요?
          </h2>
          <p className="text-gray-600 font-medium">귀여운 레시피로 맛있는 하루를 만들어봐요!</p>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border-4 border-white p-6 md:p-10 mb-12">
          <div className="space-y-8">
            <div>
              <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Utensils className={`w-5 h-5 ${currentTheme.text}`} />
                냉장고 속 재료들
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="계란, 양파, 햄... 있는 건 다 말해줘요!"
                className={`w-full h-40 px-6 py-4 ${currentTheme.light} border-4 border-transparent focus:border-white focus:ring-4 focus:ring-gray-100 rounded-[30px] font-medium text-gray-700 transition-all outline-none resize-none placeholder:text-gray-400`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-bold text-gray-800 mb-4">지금은 어떤 시간?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: MealTime.BREAKFAST, icon: Coffee, label: '아침' },
                    { val: MealTime.LUNCH, icon: Sun, label: '점심' },
                    { val: MealTime.DINNER, icon: Moon, label: '저녁' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setMealTime(item.val)}
                      className={`flex flex-col items-center justify-center py-4 px-2 rounded-[25px] border-4 transition-all ${
                        mealTime === item.val
                          ? `${currentTheme.border} ${currentTheme.light} ${currentTheme.text}`
                          : 'border-gray-50 bg-gray-50 text-gray-400 grayscale'
                      }`}
                    >
                      <item.icon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-800 mb-4">어떤 스타일?</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(CuisineType).map((type) => (
                    <button
                      key={type}
                      onClick={() => setCuisineType(type)}
                      className={`px-5 py-2.5 rounded-full border-4 text-sm font-bold transition-all ${
                        cuisineType === type
                          ? `${currentTheme.accent} border-white text-white shadow-lg -translate-y-1`
                          : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Servings Selector */}
            <div className="bg-gray-50/80 p-6 rounded-[35px] border-4 border-white shadow-inner">
              <label className="block text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className={`w-5 h-5 ${currentTheme.text}`} />
                몇 인분을 만드실까요?
              </label>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setServings(num)}
                    className={`flex-1 py-3 px-2 rounded-[20px] font-black text-lg transition-all border-4 ${
                      servings === num
                        ? `${currentTheme.accent} border-white text-white shadow-lg -translate-y-1`
                        : 'bg-white border-transparent text-gray-400 hover:border-gray-100'
                    }`}
                  >
                    {num}인분
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !ingredients.trim()}
              className={`w-full py-5 ${currentTheme.accent} hover:brightness-105 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xl font-black rounded-[30px] shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 group relative overflow-hidden`}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>셰프가 요리 중...</span>
                </div>
              ) : (
                <>
                  <span>{servings}인분 레시피 찾기!</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {shoppingList.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white rounded-[40px] shadow-xl border-4 border-white p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`${currentTheme.light} p-2 rounded-xl`}>
                    <ShoppingCart className={`w-5 h-5 ${currentTheme.text}`} />
                  </div>
                  <h3 className={`text-xl font-black ${currentTheme.text}`}>장보기 메모</h3>
                </div>
                <button 
                  onClick={clearShoppingList}
                  className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  비우기
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {shoppingList.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 group transition-all hover:bg-white hover:border-gray-300`}
                  >
                    <span className="text-gray-700 font-bold">{item}</span>
                    <button 
                      onClick={() => removeFromShoppingList(item)}
                      className="text-gray-300 group-hover:text-red-400 transition-colors"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400 font-medium">
                * 레시피 카드에서 필요한 재료를 누르면 여기에 추가돼요!
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-4 border-red-100 text-red-600 p-5 rounded-[25px] font-bold flex items-start gap-4 mb-8">
            <Info className="w-6 h-6 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {recipes.length > 0 && (
          <div id="results-section" className="space-y-12 pb-20">
            <div className="flex items-center gap-4 justify-center">
              <div className={`h-1.5 w-12 rounded-full ${currentTheme.accent}`}></div>
              <h3 className={`text-2xl font-black ${currentTheme.text}`}>짠! {servings}인분 추천이에요</h3>
              <div className={`h-1.5 w-12 rounded-full ${currentTheme.accent}`}></div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {recipes.map((recipe, index) => (
                <RecipeCard 
                  key={index} 
                  recipe={recipe} 
                  index={index} 
                  theme={currentTheme} 
                  onToggleItem={toggleShoppingItem}
                  shoppingList={shoppingList}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t-4 border-white/50 py-12 text-center text-gray-400 font-bold">
        <p className="flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-pink-400 fill-pink-400" /> by AI Chef Gemini
        </p>
      </footer>
    </div>
  );
};

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  theme: any;
  onToggleItem: (item: string) => void;
  shoppingList: string[];
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index, theme, onToggleItem, shoppingList }) => {
  return (
    <div className={`bg-white rounded-[50px] overflow-hidden shadow-2xl shadow-gray-200/50 border-8 border-white flex flex-col md:flex-row recipe-card-enter hover:scale-[1.01] transition-transform duration-300`} style={{ animationDelay: `${index * 0.2}s` }}>
      <div className={`md:w-1/3 ${theme.light} flex flex-col items-center justify-center p-8 relative min-h-[300px]`}>
        <div className="absolute top-4 left-4 z-10">
           <span className={`inline-block px-4 py-1 ${theme.accent} text-white text-xs font-black rounded-full shadow-sm`}>
            {recipe.servings}인분 기준
          </span>
        </div>
        
        <div className="relative w-48 h-48 mb-6 group">
          <div className="absolute inset-0 bg-white rounded-[35px] shadow-lg ring-8 ring-white/50 overflow-hidden">
            {recipe.imageUrl ? (
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
                <Loader2 className={`w-8 h-8 ${theme.text} animate-spin mb-2`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generating...</span>
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-md">
            <Utensils className={`w-5 h-5 ${theme.text}`} />
          </div>
        </div>

        <div className="text-center px-4">
          <h4 className="text-2xl font-black text-gray-900 leading-tight mb-2">{recipe.title}</h4>
          <p className={`text-sm font-bold ${theme.text} bg-white px-3 py-1 rounded-full inline-block shadow-sm`}>{recipe.category}</p>
        </div>
      </div>

      <div className="md:w-2/3 p-8 md:p-12 bg-white relative">
        <div className="flex flex-wrap gap-4 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme.light} ${theme.text} font-bold text-sm`}>
            <Clock className="w-4 h-4" />
            {recipe.cookingTime}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme.light} ${theme.text} font-bold text-sm`}>
            <Flame className="w-4 h-4" />
            {recipe.difficulty}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme.light} ${theme.text} font-bold text-sm`}>
            <Users className="w-4 h-4" />
            {recipe.servings}인분
          </div>
        </div>

        <div className={`relative ${theme.light} rounded-[30px] p-6 mb-8 border-4 border-white shadow-sm`}>
          <p className="text-gray-700 font-medium leading-relaxed italic text-center">
            "{recipe.summary}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                필요한 재료 & 분량
              </h5>
            </div>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, i) => {
                const isSelected = shoppingList.includes(ing.name);
                return (
                  <button 
                    key={i} 
                    onClick={() => onToggleItem(ing.name)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-bold rounded-2xl border-2 transition-all ${
                      isSelected 
                      ? `${theme.accent} border-transparent text-white shadow-md` 
                      : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-gray-400" />}
                      {ing.name}
                    </span>
                    <span className={`${isSelected ? 'text-white/80' : 'text-gray-400'} text-xs font-medium`}>
                      {ing.amount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h5 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <ArrowRight className={`w-5 h-5 ${theme.text}`} />
              요리 순서
            </h5>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4 text-sm text-gray-600 leading-relaxed font-medium">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.accent} text-white flex items-center justify-center text-[10px] font-black`}>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
