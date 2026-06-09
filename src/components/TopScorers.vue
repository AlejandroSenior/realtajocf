<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PlayerStats } from '@/interfaces/PlayerStats';

const players = ref<PlayerStats[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const maxGoals = computed(() =>
  players.value.reduce((max, player) => Math.max(max, player.goals.total), 0)
);

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
  <div>
    <header class="section-header">
      <p class="section-eyebrow">Goleadores</p>
      <h2 class="section-title">Estadísticas</h2>
    </header>

    <div v-if="loading" class="text-center">
      <p class="text-white/50">Cargando estadísticas de goleadores...</p>
    </div>

    <div v-else-if="error" class="text-center">
      <p class="text-red-400">{{ error }}</p>
    </div>

    <ol v-else-if="players.length > 0" class="space-y-2.5">
      <li
        v-for="(player, index) in players"
        :key="player.position"
        class="scorer card-glass flex items-center gap-4 px-4 py-3 md:gap-6 md:px-6"
        :class="{ 'is-leader': index === 0 }"
      >
        <span class="rank font-display" aria-hidden="true">{{ index + 1 }}</span>

        <div class="min-w-0 flex-1">
          <div class="flex items-baseline justify-between gap-3">
            <span class="truncate font-semibold tracking-wide text-white">{{ player.player }}</span>
            <span class="shrink-0 text-xs tracking-widest uppercase text-white/40">
              {{ player.matches_played }} PJ · {{ Math.max(player.goals_per_match).toFixed(2) }} GPP
            </span>
          </div>
          <div class="goal-track mt-2" role="presentation">
            <div class="goal-bar" :style="{ width: `${(player.goals.total / maxGoals) * 100}%` }"></div>
          </div>
        </div>

        <div class="flex shrink-0 flex-col items-center leading-none">
          <span class="font-display text-3xl text-secondary-300 md:text-4xl">{{ player.goals.total }}</span>
          <span class="text-[0.6rem] tracking-[0.25em] uppercase text-white/40">Goles</span>
        </div>
      </li>
    </ol>

    <div v-else class="text-center py-8">
      <p class="text-white/50">No hay datos disponibles</p>
    </div>
  </div>
</template>

<style scoped>
.scorer {
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.scorer:hover {
  transform: translateX(6px);
  border-color: rgba(207, 164, 60, 0.35);
}

.rank {
  width: 2.2rem;
  font-size: 1.9rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.25);
}

.is-leader .rank {
  color: var(--color-secondary);
}

.is-leader {
  border-color: rgba(207, 164, 60, 0.4);
  background: linear-gradient(100deg, rgba(207, 164, 60, 0.12), rgba(255, 255, 255, 0.03) 60%);
}

.goal-track {
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.goal-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-secondary-600), var(--color-secondary-300));
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
