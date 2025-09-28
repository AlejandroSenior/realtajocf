<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { CalendarResponse, Match } from '@/interfaces/Calendar';

// Reactive data
const calendar = ref<CalendarResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Function to group matches by month
const groupMatchesByMonth = (matches: Match[]) => {
  const grouped = matches.reduce((acc, match) => {
    const date = new Date(match.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName,
        matches: [] as Match[]
      };
    }
    acc[monthKey].matches.push(match);
    return acc;
  }, {} as Record<string, { name: string; matches: Match[] }>);

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
};

// Computed property for grouped matches
const matchesByMonth = computed(() => {
  return calendar.value ? groupMatchesByMonth(calendar.value.matches) : [];
});

// API call function
const fetchCalendar = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch('https://realtajoback-b8a4dxbxdkhtgham.westeurope-01.azurewebsites.net/api/v1/real-tajo/calendar', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CalendarResponse = await response.json();
    console.log('Datos del calendario:', data);
    calendar.value = data;
  } catch (err) {
    console.error('Error al obtener el calendario:', err);
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
onMounted(() => {
  fetchCalendar();
});
</script>

<template>
  <div class="calendar-wrapper">
    <!-- Loading state -->
    <div v-if="loading" class="loading-message">
      <p>Cargando calendario...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      <p>Error al cargar el calendario: {{ error }}</p>
      <button @click="fetchCalendar" class="retry-button">Reintentar</button>
    </div>

    <!-- Calendar content -->
    <div v-else-if="calendar">
      <header class="calendar-header">
        <h1 class="calendar-title">Calendario de Partidos</h1>
        <div class="season-info">
          <span class="competition">{{ calendar.competition }}</span>
          <span class="season">Temporada {{ calendar.season }}</span>
        </div>
      </header>

      <div v-if="calendar.matches && calendar.matches.length > 0" class="calendar-container">
        <div v-for="[monthKey, monthData] in matchesByMonth" :key="monthKey" class="month-section">
          <h2 class="month-title">{{ monthData.name }}</h2>
          <div class="matches-grid">
            <div v-for="match in monthData.matches" :key="`${match.matchday}-${match.date}`" class="match-card">
              <div class="match-header">
                <span class="matchday">Jornada {{ match.matchday }}</span>
                <span :class="`venue ${match.is_home ? 'home' : 'away'}`">
                  {{ match.is_home ? '🏠 Casa' : '✈️ Fuera' }}
                </span>
              </div>

              <div class="match-date">
                <div class="day">
                  {{ new Date(match.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short'
                  }) }}
                </div>
                <div class="time">
                  {{ new Date(match.date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) }}
                </div>
              </div>

              <div class="teams-section">
                <div class="team home-team">
                  <span class="team-name">
                    {{ match.is_home ? 'Real Tajo CF' : match.opponent }}
                  </span>
                </div>

                <div class="vs-separator">
                  <span class="vs-text">VS</span>
                </div>

                <div class="team away-team">
                  <span class="team-name">
                    {{ match.is_home ? match.opponent : 'Real Tajo CF' }}
                  </span>
                </div>
              </div>

              <div class="match-footer">
                <span class="stage">{{ match.stage }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-matches-message">
        <p>No hay partidos programados</p>
      </div>
    </div>

    <!-- Fallback state -->
    <div v-else class="error-message">
      <p>No se pudieron cargar los partidos del calendario</p>
      <button @click="fetchCalendar" class="retry-button">Cargar calendario</button>
    </div>
  </div>
</template>

<style>
.calendar-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.calendar-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.calendar-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.season-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 1.1rem;
}

.competition {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
}

.season {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
}

.month-section {
  margin-bottom: 40px;
}

.month-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  text-transform: capitalize;
  border-bottom: 3px solid #667eea;
  padding-bottom: 10px;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.match-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #f0f0f0;
}

.match-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.matchday {
  background: #f8f9fa;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.venue {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
}

.venue.home {
  background: #d4edda;
  color: #155724;
}

.venue.away {
  background: #f8d7da;
  color: #721c24;
}

.match-date {
  text-align: center;
  margin-bottom: 20px;
}

.day {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
}

.time {
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
}

.teams-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  gap: 10px;
}

.team {
  flex: 1;
  text-align: center;
}

.team-name {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  display: block;
  padding: 8px;
}

.home-team .team-name {
  color: #28a745;
}

.away-team .team-name {
  color: #dc3545;
}

.vs-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.vs-text {
  background: #667eea;
  color: white;
  padding: 8px 12px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;
}

.match-footer {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.stage {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.loading-message {
  text-align: center;
  padding: 40px;
  background: #e3f2fd;
  border-radius: 15px;
  color: #1976d2;
}

.loading-message p {
  font-size: 1.2rem;
  margin: 0;
}

.error-message {
  text-align: center;
  padding: 40px;
  background: #ffebee;
  border-radius: 15px;
  color: #c62828;
}

.error-message p {
  font-size: 1.2rem;
  margin: 0 0 20px 0;
}

.no-matches-message {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 15px;
  color: #666;
}

.no-matches-message p {
  font-size: 1.2rem;
  margin: 0;
}

.retry-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.retry-button:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-wrapper {
    padding: 15px;
  }

  .calendar-title {
    font-size: 2rem;
  }

  .season-info {
    flex-direction: column;
    gap: 10px;
  }

  .matches-grid {
    grid-template-columns: 1fr;
  }

  .match-card {
    padding: 15px;
  }

  .teams-section {
    flex-direction: column;
    gap: 5px;
  }

  .vs-separator {
    margin: 10px 0;
  }
}
</style>
