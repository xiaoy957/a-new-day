// 科研奖励获奖信息查询系统 - Web 版本
// 模拟数据库数据
const mockData = [
    { id: 1, name: '高性能计算在材料科学中的应用', award_name: '国家自然科学奖', category: '自然科学', level: '国家级', year: 2023, session: 5, recipients: '张三, 李四', organization: '清华大学', department: '计算机科学与技术系', description: '该研究将高性能计算技术应用于新材料的开发，取得了突破性成果。', created_at: '2024-01-15' },
    { id: 2, name: '人工智能在医学影像诊断中的研究', award_name: '国家科技进步奖', category: '科技进步', level: '国家级', year: 2023, session: 7, recipients: '王五, 赵六', organization: '北京大学', department: '人工智能研究院', description: '开发了一套基于深度学习的医学影像诊断系统，准确率达到95%以上。', created_at: '2024-01-14' },
    { id: 3, name: '新型能源材料的研发', award_name: '北京市科学技术奖', category: '科学技术', level: '市级', year: 2022, session: 12, recipients: '钱七, 孙八', organization: '北京理工大学', department: '材料科学与工程学院', description: '研发的新型电池材料显著提升了能量密度。', created_at: '2024-01-13' },
    { id: 4, name: '量子计算理论研究', award_name: '国家自然科学奖', category: '自然科学', level: '国家级', year: 2022, session: 4, recipients: '周九', organization: '中国科学院', department: '计算技术研究所', description: '在量子算法设计方面取得重要突破。', created_at: '2024-01-12' },
    { id: 5, name: '5G通信网络优化', award_name: '广东省科技进步奖', category: '科技进步', level: '省级', year: 2023, session: 8, recipients: '吴十, 郑十一', organization: '华南理工大学', department: '电子与信息学院', description: '提出的通信网络优化方案提升了网络效率30%。', created_at: '2024-01-11' },
    { id: 6, name: '新型抗癌药物研发', award_name: '国家科技进步奖', category: '医药科技', level: '国家级', year: 2024, session: 6, recipients: '陈十二, 林十三', organization: '复旦大学', department: '药学院', description: '研发的新型靶向药物在临床试验中显示出良好的疗效。', created_at: '2024-01-10' },
    { id: 7, name: '智能交通系统研究', award_name: '上海市科技进步奖', category: '工程技术', level: '市级', year: 2023, session: 9, recipients: '黄十四', organization: '上海交通大学', department: '电子信息与电气工程学院', description: '构建了城市级智能交通管理系统。', created_at: '2024-01-09' },
    { id: 8, name: '深海探测技术研究', award_name: '国家技术发明奖', category: '技术发明', level: '国家级', year: 2023, session: 3, recipients: '刘十五, 杨十六', organization: '中国海洋大学', department: '海洋与大气学院', description: '自主研发的深海探测设备达到国际先进水平。', created_at: '2024-01-08' }
];

// 状态管理
const store = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    currentPage: 'home',
    searchKeyword: '',
    
    login(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    logout() {
        this.user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('favorites');
        this.favorites = [];
    },
    
    addFavorite(awardId) {
        if (!this.favorites.includes(awardId)) {
            this.favorites.push(awardId);
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
        }
    },
    
    removeFavorite(awardId) {
        this.favorites = this.favorites.filter(id => id !== awardId);
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    },
    
    isFavorite(awardId) {
        return this.favorites.includes(awardId);
    }
};

// 工具函数
const utils = {
    getLevelColor(level) {
        const colors = { '国家级': 'level-national', '省级': 'level-provincial', '市级': 'level-municipal', '校级': 'level-school' };
        return colors[level] || 'bg-gray-500';
    },
    
    getStats() {
        const total = mockData.length;
        const national = mockData.filter(a => a.level === '国家级').length;
        const provincial = mockData.filter(a => a.level === '省级').length;
        const municipal = mockData.filter(a => a.level === '市级').length;
        const school = mockData.filter(a => a.level === '校级').length;
        const organizations = new Set(mockData.map(a => a.organization)).size;
        const awardTypes = new Set(mockData.map(a => a.award_name)).size;
        return { total, national, provincial, municipal, school, organizations, awardTypes };
    }
};

// 页面组件
const pages = {
    home() {
        const stats = utils.getStats();
        const hotAwards = mockData.slice(0, 5);
        const latestAwards = [...mockData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        
        return `
            <div class="p-8 fade-in">
                <!-- 头部搜索区 -->
                <div class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-8">
                    <h1 class="text-3xl font-bold mb-2">科研奖励获奖信息查询系统</h1>
                    <p class="text-primary-100 mb-6">一站式查询科研获奖成果，支持多维度搜索和统计分析</p>
                    <div class="flex gap-4 max-w-2xl">
                        <div class="flex-1 relative">
                            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input type="text" id="home-search" placeholder="请输入姓名、单位、成果名称或奖项名称" 
                                class="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 outline-none focus:ring-4 focus:ring-white/20"
                                onkeypress="if(event.key==='Enter') app.search(this.value)">
                        </div>
                        <button onclick="app.search(document.getElementById('home-search').value)" 
                            class="px-8 py-3 bg-white text-primary-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            搜索
                        </button>
                    </div>
                    <div class="flex gap-3 mt-4">
                        ${['国家级', '省级', '市级', '2024年', '2023年'].map(f => 
                            `<button onclick="app.search('${f}')" class="px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">${f}</button>`
                        ).join('')}
                    </div>
                </div>

                <!-- 统计卡片 -->
                <div class="grid grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                            <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap