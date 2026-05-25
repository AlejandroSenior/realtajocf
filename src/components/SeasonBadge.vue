<script setup lang="ts">
import { ref, onMounted } from 'vue';

const seasonLabel = ref('');
const isChampion = ref(false);

const fetchData = async () => {
  const base = import.meta.env.PUBLIC_API_BASE_URL;
  try {
    const [topRes, classifRes, calRes] = await Promise.all([
      fetch(`${base}/top-scorers`).catch(() => null),
      fetch(`${base}/classification`).catch(() => null),
      fetch(`${base}/real-tajo/calendar`).catch(() => null),
    ]);

    const top = topRes && topRes.ok ? await topRes.json() : null;
    const classif = classifRes && classifRes.ok ? await classifRes.json() : null;
    const cal = calRes && calRes.ok ? await calRes.json() : null;

    const seasonRaw =
      top?.metadata?.season ?? cal?.season ?? classif?.metadata?.season ?? '';
    if (seasonRaw) {
      seasonLabel.value = seasonRaw.replace('-', '/');
    }

    const teams = classif?.teams ?? [];
    const leader = teams[0];
    const second = teams[1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = (cal?.matches ?? []).filter(
      (m: { date: string }) => new Date(m.date) >= today
    );

    isChampion.value =
      upcoming.length === 0 &&
      leader?.team === 'REAL TAJO' &&
      typeof leader?.points === 'number' &&
      typeof second?.points === 'number' &&
      leader.points > second.points;
  } catch (error) {
    console.error('SeasonBadge fetch failed', error);
  }
};

onMounted(fetchData);
</script>

<template>
  <div v-if="seasonLabel || isChampion" class="flex flex-col items-center gap-2 mt-6">
    <p v-if="seasonLabel" class="season-label">Temporada {{ seasonLabel }}</p>
    <p v-if="isChampion" class="champion-badge">
      CAMPEÓN DE LIGA {{ seasonLabel }}
    </p>
  </div>
</template>

<style scoped>
.season-label {
  color: white;
  font-size: clamp(0.9rem, 2vw, 1.25rem);
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.champion-badge {
  background: linear-gradient(135deg, #ffd700, #f5b400);
  color: #1a1a1a;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.5rem 1.5rem;
  border-radius: 999px;
  font-size: clamp(0.85rem, 2.3vw, 1.35rem);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  text-transform: uppercase;
}
</style>
