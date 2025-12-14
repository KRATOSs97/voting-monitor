// ПРОСТОЙ РАБОЧИЙ КОД БЕЗ ОШИБОК

const API_URL = 'https://api.allorigins.win/raw?url=' + 
                encodeURIComponent('https://voting.umaws.ru/api/v1/stats/5');

let autoRefreshInterval = null;
let previousData = {};

// Основная функция
async function updateData() {
    console.log('🔄 Обновление данных...');
    
    try {
        // Получаем данные
        const response = await fetch(API_URL + '&_=' + Date.now());
        const data = await response.json();
        
        // Группируем
        const candidates = {};
        data.nominees.forEach(item => {
            const id = item.nomineeId;
            if (!candidates[id]) candidates[id] = {app: 0, tntonline: 0};
            candidates[id][item.source] += parseInt(item.userVotes) || 0;
        });
        
        // Считаем
        const result = [];
        let total = 0;
        
        Object.entries(candidates).forEach(([id, votes]) => {
            const totalVotes = votes.app + votes.tntonline;
            total += totalVotes;
            result.push({id, ...votes, total: totalVotes});
        });
        
        // Сортируем
        result.sort((a, b) => b.total - a.total);
        
        // Отображаем
        displayTable(result, total);
        
        // Сохраняем для следующего раза
        previousData = result;
        
        // Обновляем время
        document.getElementById('lastUpdateTime').textContent = 
            new Date().toLocaleTimeString('ru-RU');
            
        document.getElementById('status').textContent = 'Активно';
        document.getElementById('status').style.color = 'green';
        
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('status').textContent = 'Ошибка';
        document.getElementById('status').style.color = 'red';
    }
}

// Отображение таблицы
function displayTable(candidates, totalVotes) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    candidates.forEach(candidate => {
        const percent = ((candidate.total / totalVotes) * 100).toFixed(2);
        
        const row = `<tr>
            <td>Кандидат ${candidate.id}</td>
            <td>${candidate.app.toLocaleString('ru-RU')}</td>
            <td>${candidate.tntonline.toLocaleString('ru-RU')}</td>
            <td>${candidate.total.toLocaleString('ru-RU')}</td>
            <td>${percent}%</td>
            <td>0</td>
            <td>➡️</td>
        </tr>`;
        
        tbody.innerHTML += row;
    });
    
    // Показываем таблицу
    document.getElementById('tableContainer').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    
    // Обновляем итоги
    document.getElementById('totalVotes').textContent = 
        totalVotes.toLocaleString('ru-RU');
}

// Запуск
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена');
    
    // Первое обновление
    updateData();
    
    // Автообновление каждые 30 сек
    autoRefreshInterval = setInterval(updateData, 30000);
    
    // Кнопка обновления
    document.getElementById('refreshBtn').onclick = updateData;
    
    // Кнопка автообновления
    document.getElementById('autoRefreshBtn').onclick = function() {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
            this.textContent = '▶️ Автообновление: ВЫКЛ';
        } else {
            autoRefreshInterval = setInterval(updateData, 30000);
            this.textContent = '⏸️ Автообновление: ВКЛ';
        }
    };
});