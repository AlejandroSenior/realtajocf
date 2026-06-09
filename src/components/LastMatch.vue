<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { LastMatch } from '@/interfaces/Calendar';

// Estados reactivos
const loading = ref(true);
const error = ref<string | null>(null);
const lastMatch = ref<LastMatch | null>(null);

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/matchdays/last`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    lastMatch.value = data.fixtures[0];
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los datos';
    console.error('Error fetching calendar:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section aria-label="Último resultado">
    <header class="section-header items-center text-center">
      <p class="section-eyebrow">Marcador</p>
      <h2 class="section-title">Último resultado</h2>
      <p class="mt-1 text-sm tracking-widest uppercase text-white/50" v-if="!loading && !error">
        {{
          lastMatch?.date ?
            new Date(lastMatch?.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              month: 'long',
              day: '2-digit'
            }) : 'Fecha no disponible'
        }}
      </p>
    </header>

    <div v-if="loading" class="text-center">
      <p class="text-sm text-white/50">Cargando último resultado...</p>
    </div>

    <div v-if="error" class="text-center">
      <p class="text-sm text-red-400">Error: {{ error }}</p>
    </div>

    <div v-if="!loading && !error" class="card-glass mx-auto max-w-4xl px-6 py-10 md:px-12" aria-label="Resultado del partido">
      <div class="flex items-center justify-center gap-4 md:gap-8">
        <!-- Home -->
        <div class="flex flex-1 flex-col items-center gap-3 md:flex-row md:justify-end">
          <span class="team-name font-display order-2 md:order-1">{{ lastMatch ? lastMatch.homeTeam : 'REAL TAJO C.F.' }}</span>
          <img :src="lastMatch?.homeTeam === 'REAL TAJO' ? '/escudo-without-bg.avif' : '/escudo-default.avif'"
            :alt="`${lastMatch?.homeTeam} logo`" class="order-1 w-14 md:order-2 md:w-18" />
        </div>

        <!-- marcador -->
        <div class="flex shrink-0 items-center">
          <div class="score-chunk-left bg-secondary px-6 py-2 md:px-9 md:py-3">
            <span class="font-display block text-5xl leading-none text-primary-950 md:text-7xl">{{ lastMatch?.homeScore ?? '-' }}</span>
          </div>
          <div class="score-chunk-mid ml-1.5 bg-secondary px-6 py-2 md:px-9 md:py-3">
            <span class="font-display block text-5xl leading-none text-primary-950 md:text-7xl">{{ lastMatch?.awayScore ?? '-' }}</span>
          </div>
        </div>

        <!-- Away -->
        <div class="flex flex-1 flex-col items-center gap-3 md:flex-row md:justify-start">
          <img :src="lastMatch?.awayTeam === 'REAL TAJO' ? '/escudo-without-bg.avif' : '/escudo-default.avif'"
            :alt="`${lastMatch?.awayTeam} logo`" class="w-14 md:w-18" />
          <span class="team-name font-display">{{ lastMatch?.awayTeam }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.team-name {
  font-size: clamp(1rem, 2.2vw, 1.7rem);
  letter-spacing: 0.06em;
  line-height: 1.05;
  text-align: center;
  text-transform: uppercase;
  color: #f4f6fb;
}

.score-chunk-left {
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%);
}

.score-chunk-mid {
  clip-path: polygon(12px 0, 100% 0, 100% 100%, 0 100%);
}
</style>
