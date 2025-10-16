<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { PlayerStats } from '@/interfaces/PlayerStats';

const players = ref<PlayerStats[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchTopScorers = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/top-scorers`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { rows: PlayerStats[] } = await response.json();
    players.value = data.rows.filter(player => player.team === "REAL TAJO");
  } catch (err) {
    console.error('Error al obtener los goleadores:', err);
    error.value = 'Error al cargar las estadísticas de goleadores';
    players.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTopScorers();
});
</script>

<template>
  <div class="mt-20 mx-auto max-lg:p-5">
    <h2 class="text-center text-2xl font-bold text-secondary mb-5">
      Estadísticas
    </h2>

    <div v-if="loading" class="text-center">
      <p class="text-lg">Cargando estadísticas de goleadores...</p>
    </div>

    <div v-else-if="error" class="text-center">
      <p class="text-red-500 text-lg">{{ error }}</p>
    </div>


    <div v-else-if="players.length > 0">
      <table class="stats-table shadow-lg">
        <thead>
          <tr class="max-md:text-sm">
            <th class="player-column">Jugador</th>
            <th>Goles</th>
            <th class="max-md:hidden">PJ</th>
            <th class="max-md:hidden">GPP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in players" :key="player.position" class="player-row">
            <td class="player-info">
              <div class="player-details">
                <div class="player-name">{{ player.player }}</div>
              </div>
            </td>
            <td class="stat-goals">
              <span class="stat-number">{{ player.goals.details }}</span>
            </td>
            <td class="max-md:hidden">{{ player.matches_played }}</td>
            <td class="max-md:hidden">{{ Math.max(player.goals_per_match).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Vista móvil alternativa -->
      <div class="md:hidden mobile-stats">
        <div v-for="(player, index) in players" :key="player.position" class="mobile-player-card">
          <div class="mobile-player-header">
            <div class="mobile-player-info">
              <div class="mobile-player-name">{{ player.player }}</div>
            </div>
          </div>
          <div class="mobile-stats-grid">
            <div class="mobile-stat">
              <span class="mobile-stat-label">Goles</span>
              <span class="mobile-stat-value">{{ player.goals.details }}</span>
            </div>
            <div class="mobile-stat">
              <span class="mobile-stat-label">PJ</span>
              <span class="mobile-stat-value">{{ player.matches_played }}</span>
            </div>
            <div class="mobile-stat">
              <span class="mobile-stat-label">GPP</span>
              <span class="mobile-stat-value">{{ Math.max(player.goals_per_match).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-lg">No hay datos disponibles</p>
    </div>
  </div>
</template>

<style scoped>
.stats-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 1rem;
  overflow: hidden;
}

.stats-table tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.stats-table th {
  background-color: var(--color-primary);
  color: white;
  padding: 16px 12px;
  text-align: center;
  font-weight: bold;
  font-size: 0.95rem;
}

.stats-table td {
  padding: 12px;
  text-align: center;
  vertical-align: middle;
}

.player-column {
  text-align: left !important;
  min-width: 200px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left !important;
}

.player-details {
  flex: 1;
}

.player-name {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
  margin-bottom: 2px;
}

.player-team {
  font-size: 0.8rem;
  color: #6b7280;
}

.stat-goals {
  font-weight: bold;
  color: var(--color-primary);
}

.stat-number {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Vista móvil */
.mobile-stats {
  display: none;
}

.mobile-player-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.mobile-player-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mobile-rank {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--color-primary);
  min-width: 24px;
}

.mobile-player-image {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
}

.mobile-player-info {
  flex: 1;
}

.mobile-player-name {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
  margin-bottom: 2px;
}

.mobile-player-position {
  font-size: 0.8rem;
  color: #6b7280;
}

.mobile-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mobile-stat {
  text-align: center;
  padding: 8px;
  background: #f3f4f6;
  border-radius: 8px;
}

.mobile-stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.mobile-stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .stats-table {
    display: none;
  }

  .mobile-stats {
    display: block;
  }

  .stats-container {
    padding: 0 8px;
  }
}

@media (min-width: 769px) {
  .mobile-stats {
    display: none;
  }
}
</style>