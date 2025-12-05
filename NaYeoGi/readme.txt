import React, { useState } from 'react';
import { 
  Book, Map, User, LogOut, Camera, Folder, Heart, 
  ChevronRight, ChevronLeft, Upload, MapPin, Settings, 
  Menu, X, Star, Edit2, Trash2, Save, RefreshCw, Send
} from 'lucide-react';

// --- Mock Data & Assets ---
const MOCK_IMAGES = {
  landing: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80",
  travel1: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
  travel2: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  bookCover: "https://images.unsplash.com/photo-1544716278-ca83adf3663c?auto=format&fit=crop&w=800&q=80"
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300",
    ghost: "text-gray-600 hover:bg-gray-100",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, color = 'blue' }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
    {children}
  </span>
);

// --- Main Application ---

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Navigation Helper
  const navigate = (view) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
  };

  // Header Component (Changes based on view)
  const Header = () => {
    if (currentView === 'landing') {
      return (
        <header className="fixed top-0 w-full z-50 bg-transparent transition-all duration-300 p-6 flex justify-between items-center text-white bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Book className="w-8 h-8" />
            <span>나여기</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('login')} className="hover:text-blue-200 transition-colors">로그인</button>
            <Button 
              onClick={() => navigate('signup')} 
              variant="primary" 
              className="bg-blue-600 text-white hover:bg-green-600 border-none shadow-lg"
            >
              회원가입
            </Button>
          </div>
        </header>
      );
    }

    return (
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center">
        <div 
          className="text-xl font-bold text-blue-600 cursor-pointer flex items-center gap-2" 
          onClick={() => navigate('main')}
        >
          <Book className="w-6 h-6" />
          <span>나여기</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium hidden md:block">성환이형님</span>
          <Button variant="ghost" onClick={() => navigate('mypage')} icon={User}>
            내 서재
          </Button>
          <Button variant="ghost" onClick={() => { setIsLoggedIn(false); navigate('landing'); }} icon={LogOut}>
          </Button>
        </div>
      </header>
    );
  };

  // --- Views ---

  const LandingView = () => (
    <div className="relative h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${MOCK_IMAGES.landing})` }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
          여행을 기록하다,<br />기억을 그리다.
        </h1>
        <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl">
          당신의 사진에 AI의 감성을 더해<br />세상에 하나뿐인 스토리북을 만들어드립니다.
        </p>
        <Button 
          onClick={() => { setIsLoggedIn(true); navigate('main'); }} 
          className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 border-none"
        >
          시작하기
        </Button>
      </div>
    </div>
  );

  const MainDashboardView = () => (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Main Split Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
        <div 
          onClick={() => navigate('storybook_create')}
          className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
               style={{ backgroundImage: `url(${MOCK_IMAGES.bookCover})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg"><Book size={24} /></div>
              <span className="text-sm font-bold uppercase tracking-wider text-blue-300">Create</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">AI 스토리북 만들기</h2>
            <p className="text-gray-300">사진만 올리세요. 나머지는 AI 작가가 완성해드립니다.</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('recommendation_survey')}
          className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
               style={{ backgroundImage: `url(${MOCK_IMAGES.travel1})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-600 rounded-lg"><Map size={24} /></div>
              <span className="text-sm font-bold uppercase tracking-wider text-green-300">Explore</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">AI 여행지 추천</h2>
            <p className="text-gray-300">취향 분석을 통해 딱 맞는 여행 코스를 설계해드립니다.</p>
          </div>
        </div>
      </div>

      {/* Mac OS Folder Style Sub Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Folder className="text-blue-500" /> 카테고리별 여행지
        </h3>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['국내 여행', '해외 여행', '캠핑/글램핑', '호캉스', '신혼여행', '우정여행', '맛집투어', '힐링'].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-4 hover:bg-blue-100 rounded-xl cursor-pointer transition-colors group">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-white shadow-sm">
                  <Folder size={32} className="fill-current" />
                </div>
                <span className="text-gray-700 font-medium group-hover:text-blue-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const StorybookCreateView = () => (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('main')}><ChevronLeft /> 뒤로</Button>
        <h1 className="text-2xl font-bold">새 스토리북 만들기</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <Card className="p-6 space-y-6 h-fit">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">스토리 분위기</label>
            <select className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
              <option>감성적인 (Emotional)</option>
              <option>유머러스한 (Humorous)</option>
              <option>차분한 (Calm)</option>
              <option>동화 같은 (Fairy Tale)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI 사진 톤 보정</label>
            <div className="grid grid-cols-2 gap-3">
              {['원본 유지', '수채화 풍', '일러스트', '필름 카메라'].map((tone) => (
                <div key={tone} className="border rounded-lg p-3 text-center text-sm cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  {tone}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => navigate('storybook_result')} className="w-full py-3 text-lg shadow-lg">
             스토리북 제작하기
          </Button>
        </Card>

        {/* Upload & List Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Upload className="text-blue-500" size={32} />
            </div>
            <p className="text-lg font-medium text-blue-900">사진을 여기에 드래그하거나 클릭하세요</p>
            <p className="text-sm text-blue-600 mt-2">최대 30장까지 업로드 가능</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-700">업로드된 사진 (3)</h3>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 flex gap-4 items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-lg bg-cover bg-center" style={{backgroundImage: `url(${MOCK_IMAGES.travel1})`}} />
                <div className="flex-1">
                  <input type="text" placeholder="이 사진에 대한 짧은 메모를 남겨주세요 (선택)" className="w-full text-sm border-b border-gray-200 focus:border-blue-500 outline-none py-2 bg-transparent" />
                </div>
                <button className="text-gray-400 hover:text-red-500"><Trash2 size={20} /></button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const StorybookResultView = () => (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('storybook_create')}><ChevronLeft /> 다시 만들기</Button>
          <h1 className="text-2xl font-bold">제주도 푸른 밤 (생성완료)</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={RefreshCw}>다시 생성</Button>
          <Button variant="primary" icon={Save} onClick={() => navigate('mypage')}>내 서재에 저장</Button>
        </div>
      </div>

      {/* Book Viewer */}
      <div className="bg-[#fdfbf7] aspect-[16/9] rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex mb-8">
        {/* Left Page (Image) */}
        <div className="w-1/2 p-8 border-r border-stone-200 flex items-center justify-center bg-white relative">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-100 opacity-50 pointer-events-none" />
           <img src={MOCK_IMAGES.travel2} alt="Generated" className="max-w-full max-h-full rounded shadow-lg transform rotate-1 border-4 border-white" />
           <div className="absolute bottom-6 left-6 text-stone-400 font-handwriting text-sm">Page 3</div>
        </div>
        {/* Right Page (Text) */}
        <div className="w-1/2 p-10 flex flex-col justify-center relative">
           <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-gray-100 opacity-30 pointer-events-none" />
           <h3 className="text-2xl font-serif font-bold text-stone-800 mb-6">바람이 머무는 곳</h3>
           <p className="text-stone-600 leading-loose font-serif">
             파도 소리가 귓가를 간지럽히던 그 날의 오후를 기억해. 
             우리는 아무 말 없이 바다를 바라보았지만, 
             그 침묵조차 대화가 되는 순간이었어. 
             AI가 그려낸 수채화처럼, 우리의 추억도 
             점점 더 짙게 물들어가는 것 같아.
           </p>
           <div className="mt-8 pt-6 border-t border-stone-200">
             <div className="text-sm text-stone-500 mb-2 font-bold">나의 메모:</div>
             <div className="bg-yellow-50 p-3 rounded font-handwriting text-stone-600 text-sm">
               협재 해수욕장 카페에서. 커피가 정말 맛있었다.
             </div>
           </div>
           <div className="absolute bottom-6 right-6 text-stone-400 font-handwriting text-sm">Page 4</div>
        </div>
      </div>
      
      {/* Page Navigation */}
      <div className="flex justify-center gap-4 overflow-x-auto py-4">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className={`w-16 h-20 border rounded cursor-pointer ${n===3 ? 'ring-2 ring-blue-500 border-blue-500' : 'bg-gray-100'}`} />
        ))}
      </div>
    </div>
  );

  const SurveyView = () => (
    <div className="max-w-2xl mx-auto p-6 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">여행 취향 분석</h1>
        <p className="text-gray-600">성환이형님에게 딱 맞는 여행지를 찾기 위해 몇 가지 질문을 드릴게요.</p>
      </div>

      <Card className="p-8 space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Q1. 선호하는 여행 스타일은?</h3>
          <div className="grid grid-cols-2 gap-4">
            {['자연 속 힐링', '도심 속 핫플', '액티비티/레저', '문화/유적지 탐방'].map(opt => (
              <button key={opt} className="p-4 rounded-xl border hover:border-blue-500 hover:bg-blue-50 text-left transition-all">{opt}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Q2. 누구와 함께 가시나요?</h3>
          <div className="flex gap-3 flex-wrap">
             {['혼자', '친구', '연인', '가족', '아이와 함께', '반려동물'].map(opt => (
               <button key={opt} className="px-4 py-2 rounded-full border hover:bg-blue-500 hover:text-white transition-all">{opt}</button>
             ))}
          </div>
        </div>

        <Button onClick={() => navigate('recommendation_result')} className="w-full py-4 text-lg mt-8 shadow-lg">
          결과 보기
        </Button>
      </Card>
    </div>
  );

  const RecommendationResultView = () => (
    <div className="flex h-[calc(100vh-73px)] animate-fade-in">
      {/* Left: Map */}
      <div className="w-1/2 bg-gray-100 relative hidden md:block">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-blue-50">
           <div className="text-center">
             <Map size={64} className="mx-auto mb-4 opacity-50" />
             <p>지도 API 영역 (Google Maps / Kakao Map)</p>
             <div className="mt-6 relative w-64 h-64 bg-white rounded-full shadow-xl mx-auto flex items-center justify-center border-4 border-blue-400">
               <span className="font-bold text-blue-600">반경 5km 추천</span>
               <div className="absolute -top-2 left-1/2 w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center font-bold shadow-lg">1</div>
               <div className="absolute bottom-10 right-4 w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center font-bold shadow-lg">2</div>
               <div className="absolute top-10 left-4 w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center font-bold shadow-lg">3</div>
             </div>
           </div>
        </div>
      </div>

      {/* Right: List */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">추천 코스: 힐링 강릉 투어</h2>
          <Button variant="outline" icon={Save}>코스 저장</Button>
        </div>

        <div className="space-y-4 relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative pl-10">
              <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 ${i===1 ? 'bg-red-500 text-white' : 'bg-white border-2 border-blue-500 text-blue-500'}`}>
                {i}
              </div>
              <Card className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-24 h-24 rounded-lg bg-gray-200 bg-cover bg-center flex-shrink-0" style={{backgroundImage: `url(${MOCK_IMAGES.travel1})`}} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">경포대 해변</h3>
                      <p className="text-sm text-gray-500">자연명소 • 해수욕장</p>
                    </div>
                    <Badge>4.8</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    푸른 동해 바다와 하얀 모래사장이 어우러진 강릉의 대표 명소입니다. 
                    주변에 소나무 숲길이 있어 산책하기 좋습니다.
                  </p>
                </div>
              </Card>
            </div>
          ))}
          
          <div className="pl-10 pt-4">
             <Button variant="ghost" className="w-full border-2 border-dashed border-gray-300 py-4 text-gray-500 hover:border-blue-500 hover:text-blue-500">
               + 다음 여행지 추천받기 (거리설정)
             </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const MyPageView = () => (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-10 pb-10 border-b border-gray-200">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-4xl">
          <User />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">성환이형님</h1>
          <p className="text-gray-500 mb-4">여행 레벨 3 • 감성 여행자</p>
          <Button variant="outline" size="sm" icon={Settings}>회원 정보 수정</Button>
        </div>
        <div className="ml-auto flex gap-8 text-center">
          <div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-500">내 스토리북</div>
          </div>
          <div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-gray-500">저장한 코스</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-8 border-b border-gray-200">
          <button className="pb-4 border-b-2 border-black font-bold">내 스토리북</button>
          <button className="pb-4 text-gray-500 hover:text-black">저장한 여행지</button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="group cursor-pointer">
            <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{backgroundImage: `url(${MOCK_IMAGES.bookCover})`}} />
              <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">공개</div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">2025 제주 봄 여행</h3>
              <p className="text-sm text-gray-500 mb-4">2025.04.12 생성 • 사진 24장</p>
              <div className="flex justify-end gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full"><Edit2 size={16} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render Current View
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className={currentView === 'landing' ? '' : 'pt-6'}>
        {currentView === 'landing' && <LandingView />}
        {currentView === 'main' && <MainDashboardView />}
        {currentView === 'storybook_create' && <StorybookCreateView />}
        {currentView === 'storybook_result' && <StorybookResultView />}
        {currentView === 'recommendation_survey' && <SurveyView />}
        {currentView === 'recommendation_result' && <RecommendationResultView />}
        {currentView === 'mypage' && <MyPageView />}
      </main>
    </div>
  );
}