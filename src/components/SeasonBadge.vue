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
  <div v-if="seasonLabel || isChampion" class="flex flex-col items-center gap-3 mt-7">
    <p v-if="seasonLabel" class="season-label">
      <span class="season-line"></span>
      Temporada {{ seasonLabel }}
      <span class="season-line"></span>
    </p>
    <p v-if="isChampion" class="champion-badge font-display">
      ★ Campeón de liga {{ seasonLabel }} ★
    </p>
  </div>
</template>

<style scoped>
.season-label {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: rgba(232, 236, 246, 0.75);
  font-size: clamp(0.85rem, 1.8vw, 1.05rem);
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.season-line {
  display: block;
  width: 2.5rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(207, 164, 60, 0.7));
}

.season-line:last-child {
  background: linear-gradient(90deg, rgba(207, 164, 60, 0.7), transparent);
}

.champion-badge {
  background: linear-gradient(120deg, #ecd49a 0%, #cfa43c 45%, #a87f24 100%);
  color: #040b1c;
  letter-spacing: 0.12em;
  padding: 0.55rem 2rem;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  /* corte diagonal a juego con el lenguaje del marcador */
  clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
  box-shadow: 0 8px 30px rgba(207, 164, 60, 0.35);
  text-transform: uppercase;
}
</style>
